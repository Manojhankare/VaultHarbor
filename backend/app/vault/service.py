"""Vault storage service."""

from __future__ import annotations

import hashlib
import uuid

from flask import current_app
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models.sync_event import SyncEvent
from app.models.vault import Vault, utcnow
from app.security.permissions import get_owned_device
from app.utils.errors import (
    InvalidCredentialsError,
    PayloadTooLargeError,
    VaultNotFoundError,
    VaultRevisionConflictError,
)
from app.vault.schemas import VaultDeleteRequest, VaultPutRequest, VaultResponse


def _validate_vault_size(encrypted_vault: str) -> None:
    max_bytes = current_app.config["MAX_VAULT_BYTES"]
    if len(encrypted_vault.encode("utf-8")) > max_bytes:
        raise PayloadTooLargeError(
            details={"max_bytes": max_bytes},
        )


def vault_to_response(vault: Vault) -> VaultResponse:
    return VaultResponse(
        encrypted_vault=vault.encrypted_vault,
        wrapped_vault_key=vault.wrapped_vault_key,
        vault_version=vault.vault_version,
        revision=vault.revision,
        recovery_wrapped_vault_key=vault.recovery_wrapped_vault_key,
        recovery_salt=vault.recovery_salt,
        recovery_kdf_algorithm=vault.recovery_kdf_algorithm,
        recovery_kdf_iterations=vault.recovery_kdf_iterations,
    )


def compute_etag(vault: Vault) -> str:
    digest = hashlib.sha256(
        f"{vault.revision}:{vault.vault_version}:{vault.updated_at.isoformat()}".encode()
    ).hexdigest()
    return f'W/"{digest}"'


def get_vault(user_id: uuid.UUID) -> Vault:
    vault = db.session.scalar(select(Vault).where(Vault.user_id == user_id))
    if vault is None:
        raise VaultNotFoundError()
    return vault


def _apply_recovery_fields(vault: Vault, payload: VaultPutRequest) -> None:
    """Recovery fields are preserved when omitted (unlike wrapped_vault_key)."""
    provided = payload.model_dump(exclude_unset=True)
    if "recovery_wrapped_vault_key" in provided:
        if payload.recovery_wrapped_vault_key:
            _validate_vault_size(payload.recovery_wrapped_vault_key)
        vault.recovery_wrapped_vault_key = payload.recovery_wrapped_vault_key
    if "recovery_salt" in provided:
        vault.recovery_salt = payload.recovery_salt
    if "recovery_kdf_algorithm" in provided:
        vault.recovery_kdf_algorithm = payload.recovery_kdf_algorithm
    if "recovery_kdf_iterations" in provided:
        vault.recovery_kdf_iterations = payload.recovery_kdf_iterations


def upsert_vault(user_id: uuid.UUID, payload: VaultPutRequest) -> tuple[VaultResponse, bool]:
    _validate_vault_size(payload.encrypted_vault)
    if payload.wrapped_vault_key:
        _validate_vault_size(payload.wrapped_vault_key)

    device_id = payload.device_id
    if device_id is not None:
        get_owned_device(user_id, device_id)
        from flask import g

        g.current_device_id = device_id

    if payload.client_mutation_id is not None:
        existing_event = db.session.scalar(
            select(SyncEvent).where(
                SyncEvent.user_id == user_id,
                SyncEvent.client_mutation_id == payload.client_mutation_id,
            )
        )
        if existing_event:
            vault = db.session.scalar(select(Vault).where(Vault.user_id == user_id))
            if vault is None:
                raise VaultNotFoundError()
            return vault_to_response(vault), False

    vault = db.session.scalar(
        select(Vault).where(Vault.user_id == user_id).with_for_update()
    )
    created = False

    if vault is None:
        if payload.base_revision != 0:
            raise VaultRevisionConflictError(current_revision=None)
        vault = Vault(
            user_id=user_id,
            encrypted_vault=payload.encrypted_vault,
            wrapped_vault_key=payload.wrapped_vault_key,
            vault_version=payload.vault_version,
            revision=1,
        )
        _apply_recovery_fields(vault, payload)
        db.session.add(vault)
        operation = "CREATE"
        created = True
    elif vault.revision != payload.base_revision:
        raise VaultRevisionConflictError(current_revision=vault.revision)
    else:
        vault.encrypted_vault = payload.encrypted_vault
        vault.wrapped_vault_key = payload.wrapped_vault_key
        vault.vault_version = payload.vault_version
        _apply_recovery_fields(vault, payload)
        vault.revision += 1
        vault.updated_at = utcnow()
        operation = "UPDATE"

    event = SyncEvent(
        user_id=user_id,
        device_id=device_id,
        revision=vault.revision,
        operation=operation,
        client_mutation_id=payload.client_mutation_id,
    )
    db.session.add(event)

    try:
        db.session.commit()
    except IntegrityError as exc:
        db.session.rollback()
        if payload.client_mutation_id is not None:
            return upsert_vault(user_id, payload)
        existing = db.session.scalar(select(Vault).where(Vault.user_id == user_id))
        if existing and existing.revision != payload.base_revision:
            raise VaultRevisionConflictError(current_revision=existing.revision) from exc
        raise VaultRevisionConflictError(current_revision=None) from exc

    db.session.refresh(vault)
    return vault_to_response(vault), created


def delete_vault(user_id: uuid.UUID, payload: VaultDeleteRequest) -> None:
    from app.auth.service import verify_password
    from app.models.user import User

    user = db.session.get(User, user_id)
    if user is None or not verify_password(user.password_hash, payload.password):
        raise InvalidCredentialsError()

    db.session.execute(
        SyncEvent.__table__.delete().where(SyncEvent.user_id == user_id)
    )
    vault = db.session.scalar(select(Vault).where(Vault.user_id == user_id))
    if vault is not None:
        db.session.delete(vault)
    db.session.commit()
