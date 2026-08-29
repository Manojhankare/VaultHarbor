"""Create password_reset_tokens if missing (repair partial 002)."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect
from sqlalchemy.dialects import postgresql

revision = "003_password_reset_tokens_repair"
down_revision = "002_password_reset_and_recovery"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    if "password_reset_tokens" in inspect(bind).get_table_names():
        return

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


def downgrade():
    bind = op.get_bind()
    if "password_reset_tokens" not in inspect(bind).get_table_names():
        return
    op.drop_index("ix_password_reset_tokens_code_hash", table_name="password_reset_tokens")
    op.drop_index("ix_password_reset_tokens_user_id", table_name="password_reset_tokens")
    op.drop_table("password_reset_tokens")
