"""compliance: users.is_adult + users.region

Revision ID: 0003_compliance
Revises: 0002_auth
Create Date: 2026-06-15
"""
from alembic import op
import sqlalchemy as sa

revision = "0003_compliance"
down_revision = "0002_auth"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("is_adult", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("users", sa.Column("region", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "region")
    op.drop_column("users", "is_adult")
