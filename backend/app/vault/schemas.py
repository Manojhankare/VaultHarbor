"""Vault schemas."""

from __future__ import annotations

import uuid

from pydantic import BaseModel, Field, field_validator


class VaultPutRequest(BaseModel):
    encrypted_vault: str = Field(min_length=1)
    vault_version: int = Field(ge=1)
    base_revision: int = Field(ge=0)
    wrapped_vault_key: str | None = None
    client_mutation_id: uuid.UUID | None = None
    device_id: uuid.UUID | None = None


class VaultResponse(BaseModel):
    encrypted_vault: str
    wrapped_vault_key: str | None
    vault_version: int
    revision: int


class VaultPayload(BaseModel):
    vault: VaultResponse
