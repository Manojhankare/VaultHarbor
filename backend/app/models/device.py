"""Device model."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Device(db.Model):
    __tablename__ = "devices"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    device_name: Mapped[str] = mapped_column(String(100), nullable=False)
    device_type: Mapped[str] = mapped_column(String(32), nullable=False, default="browser")
    device_identifier: Mapped[str] = mapped_column(Text, nullable=False)
    last_seen_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utcnow,
        onupdate=utcnow,
        server_default=func.now(),
    )

    user = relationship("User", back_populates="devices")
    sync_events = relationship("SyncEvent", back_populates="device")
    refresh_tokens = relationship("RefreshToken", back_populates="device")

    __table_args__ = (
        UniqueConstraint("user_id", "device_identifier", name="uq_devices_user_id_device_identifier"),
        CheckConstraint(
            "device_type IN ('browser', 'desktop', 'mobile', 'other')",
            name="ck_devices_device_type",
        ),
        CheckConstraint(
            "char_length(device_name) >= 1 AND char_length(device_name) <= 100",
            name="ck_devices_device_name_length",
        ),
    )

    def __repr__(self) -> str:
        return f"<Device id={self.id} name={self.device_name!r}>"
