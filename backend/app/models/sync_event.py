"""Sync event model."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import BigInteger, CheckConstraint, DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class SyncEvent(db.Model):
    __tablename__ = "sync_events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    device_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("devices.id", ondelete="SET NULL"), nullable=True, index=True
    )
    revision: Mapped[int] = mapped_column(BigInteger, nullable=False)
    operation: Mapped[str] = mapped_column(String(16), nullable=False)
    client_mutation_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow, server_default=func.now()
    )

    user = relationship("User", back_populates="sync_events")
    device = relationship("Device", back_populates="sync_events")

    __table_args__ = (
        UniqueConstraint("user_id", "revision", name="uq_sync_events_user_id_revision"),
        UniqueConstraint(
            "user_id", "client_mutation_id", name="uq_sync_events_user_id_client_mutation_id"
        ),
        CheckConstraint("operation IN ('CREATE', 'UPDATE')", name="ck_sync_events_operation"),
    )

    def __repr__(self) -> str:
        return f"<SyncEvent user_id={self.user_id} revision={self.revision} op={self.operation}>"
