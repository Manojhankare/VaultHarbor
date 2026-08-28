"""Vault model."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import BigInteger, CheckConstraint, DateTime, ForeignKey, Integer, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Vault(db.Model):
    __tablename__ = "vaults"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    encrypted_vault: Mapped[str] = mapped_column(Text, nullable=False)
    wrapped_vault_key: Mapped[str | None] = mapped_column(Text, nullable=True)
    vault_version: Mapped[int] = mapped_column(Integer, nullable=False, default=1, server_default="1")
    revision: Mapped[int] = mapped_column(BigInteger, nullable=False, default=1, server_default="1")

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

    user = relationship("User", back_populates="vault")

    __table_args__ = (
        CheckConstraint("vault_version >= 1", name="ck_vaults_vault_version"),
        CheckConstraint("revision >= 1", name="ck_vaults_revision"),
    )

    def __repr__(self) -> str:
        return f"<Vault id={self.id} user_id={self.user_id} revision={self.revision}>"
