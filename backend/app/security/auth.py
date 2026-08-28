"""Authentication helpers."""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from functools import wraps
from typing import Any, Callable

import jwt
from flask import current_app, g, request

from app.utils.errors import (
    AccessTokenExpiredError,
    AccessTokenInvalidError,
    UnauthorizedError,
)


@dataclass(frozen=True)
class CurrentUser:
    id: uuid.UUID
    session_id: uuid.UUID


def _extract_bearer_token() -> str:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise UnauthorizedError("Missing or invalid Authorization header.")
    token = auth_header[7:].strip()
    if not token:
        raise UnauthorizedError("Missing bearer token.")
    return token


def decode_access_token(token: str) -> CurrentUser:
    try:
        payload = jwt.decode(
            token,
            current_app.config["JWT_SECRET_KEY"],
            algorithms=["HS256"],
            options={"require": ["exp", "iat", "sub", "jti", "typ", "sid"]},
        )
    except jwt.ExpiredSignatureError as exc:
        raise AccessTokenExpiredError() from exc
    except jwt.InvalidTokenError as exc:
        raise AccessTokenInvalidError() from exc

    if payload.get("typ") != "access":
        raise AccessTokenInvalidError("Invalid token type.")

    try:
        user_id = uuid.UUID(payload["sub"])
        session_id = uuid.UUID(payload["sid"])
    except (KeyError, ValueError) as exc:
        raise AccessTokenInvalidError("Invalid token claims.") from exc

    return CurrentUser(id=user_id, session_id=session_id)


def create_access_token(*, user_id: uuid.UUID, session_id: uuid.UUID) -> tuple[str, datetime]:
    now = datetime.now(timezone.utc)
    expires = now + timedelta(seconds=current_app.config["JWT_ACCESS_TOKEN_EXPIRES"])
    payload = {
        "sub": str(user_id),
        "iat": int(now.timestamp()),
        "exp": int(expires.timestamp()),
        "jti": str(uuid.uuid4()),
        "typ": "access",
        "sid": str(session_id),
    }
    token = jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")
    return token, expires


def require_auth(view: Callable[..., Any]) -> Callable[..., Any]:
    @wraps(view)
    def wrapper(*args: Any, **kwargs: Any):
        if request.method == "OPTIONS":
            return view(*args, **kwargs)
        token = _extract_bearer_token()
        current_user = decode_access_token(token)
        g.current_user = current_user
        g.current_user_id = current_user.id
        return view(*args, **kwargs)

    return wrapper
