"""initial schema

Revision ID: 0001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op
from sqlalchemy import text

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── users ─────────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("onboarding_complete", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # ── lifestyles ────────────────────────────────────────────────────────────
    op.create_table(
        "lifestyles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column("water_intake", sa.String(20), nullable=True),
        sa.Column("sleep_hours", sa.String(20), nullable=True),
        sa.Column("diet", sa.String(30), nullable=True),
        sa.Column("stress_level", sa.String(5), nullable=True),
        sa.Column("sun_exposure", sa.String(20), nullable=True),
        sa.Column("spf_use", sa.String(20), nullable=True),
        sa.Column("exercise", sa.String(20), nullable=True),
        sa.Column("current_routine", sa.String(20), nullable=True),
        sa.Column(
            "concerns",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            server_default=text("'[]'::jsonb"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index("ix_lifestyles_user_id", "lifestyles", ["user_id"])

    # ── analyses ──────────────────────────────────────────────────────────────
    op.create_table(
        "analyses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("skin_type", sa.String(20), nullable=False),
        sa.Column("confidence", sa.Integer(), nullable=False),
        sa.Column(
            "probabilities",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=text("'{}'::jsonb"),
        ),
        sa.Column(
            "lifestyle_snapshot",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index("ix_analyses_user_id", "analyses", ["user_id"])
    op.create_index("ix_analyses_created_at", "analyses", ["created_at"])


def downgrade() -> None:
    op.drop_table("analyses")
    op.drop_table("lifestyles")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
