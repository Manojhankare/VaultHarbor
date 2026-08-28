"""Sync service."""

from __future__ import annotations

import uuid

from sqlalchemy import select

from app.extensions import db
from app.models.sync_event import SyncEvent
from app.models.vault import Vault
from app.sync.schemas import SyncChange, SyncResponse
from app.utils.errors import ValidationError


def get_sync_state(
    user_id: uuid.UUID,
    *,
    since_revision: int | None,
    limit: int,
) -> SyncResponse:
    if since_revision is not None and since_revision < 0:
        raise ValidationError("since_revision must be >= 0")

    limit = min(max(limit, 1), 100)

    vault = db.session.scalar(select(Vault).where(Vault.user_id == user_id))
    current_revision = vault.revision if vault else 0
    vault_version = vault.vault_version if vault else None

    query = (
        select(SyncEvent)
        .where(SyncEvent.user_id == user_id)
        .order_by(SyncEvent.revision.asc())
    )
    if since_revision is not None:
        query = query.where(SyncEvent.revision > since_revision)

    events = db.session.scalars(query.limit(limit + 1)).all()
    has_more = len(events) > limit
    events = events[:limit]

    changes = [
        SyncChange(
            revision=event.revision,
            operation=event.operation,
            device_id=event.device_id,
            created_at=event.created_at.isoformat(),
        )
        for event in events
    ]

    return SyncResponse(
        current_revision=current_revision,
        vault_version=vault_version,
        changes=changes,
        has_more=has_more,
    )
