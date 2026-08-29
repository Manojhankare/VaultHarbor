"""Password reset and recovery fields."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "002_password_reset_and_recovery"
down_revision = "001_initial"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "password_reset_tokens",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("code_hash", sa.CHAR(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index(
        "ix_password_reset_tokens_user_id",
        "password_reset_tokens",
        ["user_id"],
    )
    op.create_index(
        "ix_password_reset_tokens_code_hash",
        "password_reset_tokens",
        ["code_hash"],
    )

    op.add_column(
        "vaults",
        sa.Column("recovery_wrapped_vault_key", sa.Text(), nullable=True),
    )
    op.add_column("vaults", sa.Column("recovery_salt", sa.Text(), nullable=True))
    op.add_column(
        "vaults",
        sa.Column("recovery_kdf_algorithm", sa.String(length=32), nullable=True),
    )
    op.add_column(
        "vaults",
        sa.Column("recovery_kdf_iterations", sa.Integer(), nullable=True),
    )


def downgrade():
    op.drop_column("vaults", "recovery_kdf_iterations")
    op.drop_column("vaults", "recovery_kdf_algorithm")
    op.drop_column("vaults", "recovery_salt")
    op.drop_column("vaults", "recovery_wrapped_vault_key")
    op.drop_index("ix_password_reset_tokens_code_hash", table_name="password_reset_tokens")
    op.drop_index("ix_password_reset_tokens_user_id", table_name="password_reset_tokens")
    op.drop_table("password_reset_tokens")
