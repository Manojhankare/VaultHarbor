"""User model."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, CheckConstraint, DateTime, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")

    failed_login_attempts: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )
    lockout_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    kdf_algorithm: Mapped[str] = mapped_column(
        String(32), nullable=False, default="pbkdf2-sha256", server_default="pbkdf2-sha256"
    )
    kdf_iterations: Mapped[int] = mapped_column(
        Integer, nullable=False, default=600_000, server_default="600000"
    )
    kdf_memory_kib: Mapped[int | None] = mapped_column(Integer, nullable=True)
    kdf_parallelism: Mapped[int | None] = mapped_column(Integer, nullable=True)
    kdf_salt: Mapped[str] = mapped_column(Text, nullable=False)

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

    devices = relationship("Device", back_populates="user", cascade="all, delete-orphan")
    vault = relationship("Vault", back_populates="user", uselist=False, cascade="all, delete-orphan")
    sync_events = relationship("SyncEvent", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )

    __table_args__ = (
        CheckConstraint(
            "kdf_algorithm IN ('pbkdf2-sha256', 'argon2id')",
            name="ck_users_kdf_algorithm",
        ),
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r}>"
