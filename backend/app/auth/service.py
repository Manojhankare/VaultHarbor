"""Authentication business logic."""

from __future__ import annotations

import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from functools import lru_cache

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from flask import current_app
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError

from app.auth.schemas import AuthTokensResponse, KdfDescriptor, RegisterRequest, UserResponse
from app.extensions import db
from app.models.refresh_token import RefreshToken
from app.models.user import User, utcnow
from app.security.auth import create_access_token
from app.utils.errors import (
    AccountLockedError,
    InvalidCredentialsError,
    RefreshTokenInvalidError,
    RefreshTokenReusedError,
    RegistrationConflictError,
)

@lru_cache(maxsize=1)
def _dummy_password_hash() -> str:
    return PasswordHasher(time_cost=1, memory_cost=8192, parallelism=1).hash(
        "timing-safe-dummy-password"
    )


def _timing_safe_verify() -> None:
    try:
        verify_password(_dummy_password_hash(), "invalid-password-for-timing")
    except Exception:
        pass


def _password_hasher() -> PasswordHasher:
    return PasswordHasher(
        time_cost=current_app.config["ARGON2_TIME_COST"],
        memory_cost=current_app.config["ARGON2_MEMORY_COST"],
        parallelism=current_app.config["ARGON2_PARALLELISM"],
    )


def normalize_email(email: str) -> str:
    return email.strip().lower()


def hash_password(password: str) -> str:
    return _password_hasher().hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    try:
        return _password_hasher().verify(password_hash, password)
    except VerifyMismatchError:
        return False


def needs_rehash(password_hash: str) -> bool:
    return _password_hasher().check_needs_rehash(password_hash)


def _hash_refresh_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def _generate_refresh_token() -> str:
    return secrets.token_urlsafe(32)


def _default_kdf() -> KdfDescriptor:
    return KdfDescriptor(
        algorithm="pbkdf2-sha256",
        iterations=600_000,
        memory_kib=None,
        parallelism=None,
        salt=secrets.token_urlsafe(16),
    )


def _user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        is_active=user.is_active,
        created_at=user.created_at.isoformat(),
        last_login_at=user.last_login_at.isoformat() if user.last_login_at else None,
        kdf=KdfDescriptor(
            algorithm=user.kdf_algorithm,  # type: ignore[arg-type]
            iterations=user.kdf_iterations,
            memory_kib=user.kdf_memory_kib,
            parallelism=user.kdf_parallelism,
            salt=user.kdf_salt,
        ),
    )


def _issue_tokens(
    user: User,
    *,
    device_id: uuid.UUID | None = None,
    session_id: uuid.UUID | None = None,
) -> AuthTokensResponse:
    session = session_id or uuid.uuid4()
    access_token, expires = create_access_token(user_id=user.id, session_id=session)
    raw_refresh = _generate_refresh_token()
    refresh = RefreshToken(
        user_id=user.id,
        device_id=device_id,
        token_hash=_hash_refresh_token(raw_refresh),
        session_id=session,
        expires_at=utcnow()
        + timedelta(seconds=current_app.config["JWT_REFRESH_TOKEN_EXPIRES"]),
    )
    db.session.add(refresh)
    db.session.commit()
    return AuthTokensResponse(
        access_token=access_token,
        refresh_token=raw_refresh,
        expires_in=int((expires - datetime.now(timezone.utc)).total_seconds()),
    )


def register_user(payload: RegisterRequest) -> UserResponse:
    email = normalize_email(str(payload.email))
    kdf = payload.kdf or _default_kdf()

    user = User(
        email=email,
        password_hash=hash_password(payload.password),
        kdf_algorithm=kdf.algorithm,
        kdf_iterations=kdf.iterations,
        kdf_memory_kib=kdf.memory_kib,
        kdf_parallelism=kdf.parallelism,
        kdf_salt=kdf.salt,
    )
    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError as exc:
        db.session.rollback()
        raise RegistrationConflictError() from exc
    return _user_to_response(user)


def _check_lockout(user: User) -> None:
    if user.lockout_until and user.lockout_until > utcnow():
        retry_after = int((user.lockout_until - utcnow()).total_seconds())
        raise AccountLockedError(
            details={"retry_after_seconds": max(retry_after, 1)},
        )


def _record_failed_login(user: User | None) -> None:
    if user is None:
        verify_password(DUMMY_PASSWORD_HASH, "invalid-password-for-timing")
        return

    user.failed_login_attempts += 1
    threshold = current_app.config["ACCOUNT_LOCKOUT_THRESHOLD"]
    if user.failed_login_attempts >= threshold:
        user.lockout_until = utcnow() + timedelta(
            minutes=current_app.config["ACCOUNT_LOCKOUT_MINUTES"]
        )
        user.failed_login_attempts = 0
    db.session.commit()


def login_user(*, email: str, password: str, device_id: uuid.UUID | None = None) -> AuthTokensResponse:
    normalized = normalize_email(email)
    user = db.session.scalar(select(User).where(User.email == normalized))

    if user is None or not user.is_active:
        _timing_safe_verify()
        raise InvalidCredentialsError()

    _check_lockout(user)

    if not verify_password(user.password_hash, password):
        _record_failed_login(user)
        raise InvalidCredentialsError()

    if needs_rehash(user.password_hash):
        user.password_hash = hash_password(password)

    user.failed_login_attempts = 0
    user.lockout_until = None
    user.last_login_at = utcnow()
    db.session.commit()

    return _issue_tokens(user, device_id=device_id)


def refresh_tokens(raw_refresh_token: str) -> AuthTokensResponse:
    token_hash = _hash_refresh_token(raw_refresh_token)
    token = db.session.scalar(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash)
    )
    if token is None:
        raise RefreshTokenInvalidError()

    now = utcnow()
    if token.revoked_at is not None:
        grace = current_app.config["REFRESH_ROTATION_GRACE_SECONDS"]
        if token.last_used_at and (now - token.last_used_at).total_seconds() <= grace:
            replacement = db.session.get(RefreshToken, token.replaced_by_id) if token.replaced_by_id else None
            if replacement and replacement.is_active:
                user = db.session.get(User, token.user_id)
                if user is None or not user.is_active:
                    raise RefreshTokenInvalidError()
                access_token, expires = create_access_token(
                    user_id=user.id, session_id=token.session_id
                )
                return AuthTokensResponse(
                    access_token=access_token,
                    refresh_token=raw_refresh_token,
                    expires_in=int((expires - datetime.now(timezone.utc)).total_seconds()),
                )
        _revoke_session_family(token.session_id, reason="reuse_detected")
        raise RefreshTokenReusedError()

    if token.expires_at <= now:
        raise RefreshTokenInvalidError("Refresh token has expired.")

    user = db.session.get(User, token.user_id)
    if user is None or not user.is_active:
        raise RefreshTokenInvalidError()

    token.last_used_at = now
    token.revoked_at = now
    token.revoked_reason = "rotated"

    new_raw = _generate_refresh_token()
    new_token = RefreshToken(
        user_id=token.user_id,
        device_id=token.device_id,
        token_hash=_hash_refresh_token(new_raw),
        session_id=token.session_id,
        expires_at=now + timedelta(seconds=current_app.config["JWT_REFRESH_TOKEN_EXPIRES"]),
    )
    db.session.add(new_token)
    db.session.flush()
    token.replaced_by_id = new_token.id
    db.session.commit()

    access_token, expires = create_access_token(user_id=user.id, session_id=token.session_id)
    return AuthTokensResponse(
        access_token=access_token,
        refresh_token=new_raw,
        expires_in=int((expires - datetime.now(timezone.utc)).total_seconds()),
    )


def _revoke_session_family(session_id: uuid.UUID, *, reason: str) -> None:
    now = utcnow()
    db.session.execute(
        update(RefreshToken)
        .where(RefreshToken.session_id == session_id, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=now, revoked_reason=reason)
    )
    db.session.commit()


def logout_user(
    *,
    user_id: uuid.UUID,
    refresh_token: str | None,
    all_devices: bool,
) -> None:
    now = utcnow()
    if all_devices:
        db.session.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=now, revoked_reason="logout_all")
        )
    elif refresh_token:
        token_hash = _hash_refresh_token(refresh_token)
        db.session.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == user_id, RefreshToken.token_hash == token_hash)
            .values(revoked_at=now, revoked_reason="logout")
        )
    else:
        db.session.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=now, revoked_reason="logout")
        )
    db.session.commit()


def get_user_profile(user_id: uuid.UUID) -> UserResponse:
    user = db.session.get(User, user_id)
    if user is None or not user.is_active:
        from app.utils.errors import NotFoundError

        raise NotFoundError("User not found.")
    return _user_to_response(user)


def purge_expired_tokens() -> int:
    now = utcnow()
    result = db.session.execute(
        RefreshToken.__table__.delete().where(RefreshToken.expires_at < now)
    )
    db.session.commit()
    return result.rowcount or 0
