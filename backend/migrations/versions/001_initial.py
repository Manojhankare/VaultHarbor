"""Initial database schema."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("failed_login_attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("lockout_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "kdf_algorithm",
            sa.String(length=32),
            nullable=False,
            server_default="pbkdf2-sha256",
        ),
        sa.Column("kdf_iterations", sa.Integer(), nullable=False, server_default="600000"),
        sa.Column("kdf_memory_kib", sa.Integer(), nullable=True),
        sa.Column("kdf_parallelism", sa.Integer(), nullable=True),
        sa.Column("kdf_salt", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.CheckConstraint(
            "kdf_algorithm IN ('pbkdf2-sha256', 'argon2id')",
            name="ck_users_kdf_algorithm",
        ),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "devices",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("device_name", sa.String(length=100), nullable=False),
        sa.Column("device_type", sa.String(length=32), nullable=False, server_default="browser"),
        sa.Column("device_identifier", sa.Text(), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint(
            "user_id", "device_identifier", name="uq_devices_user_id_device_identifier"
        ),
        sa.CheckConstraint(
            "device_type IN ('browser', 'desktop', 'mobile', 'other')",
            name="ck_devices_device_type",
        ),
        sa.CheckConstraint(
            "char_length(device_name) >= 1 AND char_length(device_name) <= 100",
            name="ck_devices_device_name_length",
        ),
    )
    op.create_index("ix_devices_user_id", "devices", ["user_id"])

    op.create_table(
        "vaults",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("encrypted_vault", sa.Text(), nullable=False),
        sa.Column("wrapped_vault_key", sa.Text(), nullable=True),
        sa.Column("vault_version", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("revision", sa.BigInteger(), nullable=False, server_default="1"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("user_id"),
        sa.CheckConstraint("vault_version >= 1", name="ck_vaults_vault_version"),
        sa.CheckConstraint("revision >= 1", name="ck_vaults_revision"),
    )
    op.create_index("ix_vaults_user_id", "vaults", ["user_id"], unique=True)

    op.create_table(
        "sync_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("device_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("revision", sa.BigInteger(), nullable=False),
        sa.Column("operation", sa.String(length=16), nullable=False),
        sa.Column("client_mutation_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["device_id"], ["devices.id"], ondelete="SET NULL"),
        sa.UniqueConstraint("user_id", "revision", name="uq_sync_events_user_id_revision"),
        sa.UniqueConstraint(
            "user_id",
            "client_mutation_id",
            name="uq_sync_events_user_id_client_mutation_id",
        ),
        sa.CheckConstraint(
            "operation IN ('CREATE', 'UPDATE')",
            name="ck_sync_events_operation",
        ),
    )
    op.create_index("ix_sync_events_user_id", "sync_events", ["user_id"])
    op.create_index("ix_sync_events_device_id", "sync_events", ["device_id"])
    op.create_index(
        "ix_sync_events_user_id_revision",
        "sync_events",
        ["user_id", "revision"],
    )

    op.create_table(
        "refresh_tokens",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("device_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("token_hash", sa.CHAR(length=64), nullable=False),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "issued_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("revoked_reason", sa.String(length=64), nullable=True),
        sa.Column("replaced_by_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["device_id"], ["devices.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["replaced_by_id"], ["refresh_tokens.id"], ondelete="SET NULL"),
        sa.UniqueConstraint("token_hash", name="uq_refresh_tokens_token_hash"),
    )
    op.create_index("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"])
    op.create_index("ix_refresh_tokens_device_id", "refresh_tokens", ["device_id"])
    op.create_index("ix_refresh_tokens_session_id", "refresh_tokens", ["session_id"])


def downgrade():
    op.drop_table("refresh_tokens")
    op.drop_table("sync_events")
    op.drop_table("vaults")
    op.drop_table("devices")
    op.drop_table("users")
