"""Sync schemas."""

from __future__ import annotations

import uuid

from pydantic import BaseModel, Field


class SyncChange(BaseModel):
    revision: int
    operation: str
    device_id: uuid.UUID | None
    created_at: str


class SyncResponse(BaseModel):
    current_revision: int
    vault_version: int | None
    changes: list[SyncChange]
    has_more: bool
