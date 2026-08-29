"""Vault schemas."""

from __future__ import annotations

import uuid

from pydantic import BaseModel, Field, field_validator


class VaultPutRequest(BaseModel):
    encrypted_vault: str = Field(min_length=1)
    vault_version: int = Field(ge=1)
    base_revision: int = Field(ge=0)
    wrapped_vault_key: str | None = None
    recovery_wrapped_vault_key: str | None = None
    recovery_salt: str | None = None
    recovery_kdf_algorithm: str | None = None
    recovery_kdf_iterations: int | None = Field(default=None, ge=100_000, le=2_000_000)
    client_mutation_id: uuid.UUID | None = None
    device_id: uuid.UUID | None = None


class VaultDeleteRequest(BaseModel):
    password: str = Field(min_length=1, max_length=128)
    confirm: str = Field(min_length=1, max_length=16)

    @field_validator("confirm")
    @classmethod
    def validate_confirm(cls, value: str) -> str:
        if value != "DELETE":
            raise ValueError("confirm must be exactly DELETE")
        return value


class VaultResponse(BaseModel):
    encrypted_vault: str
    wrapped_vault_key: str | None
    vault_version: int
    revision: int
    recovery_wrapped_vault_key: str | None = None
    recovery_salt: str | None = None
    recovery_kdf_algorithm: str | None = None
    recovery_kdf_iterations: int | None = None


class VaultPayload(BaseModel):
    vault: VaultResponse
