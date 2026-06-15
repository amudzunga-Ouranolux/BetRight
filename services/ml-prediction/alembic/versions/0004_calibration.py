"""calibration: model_versions.calibration_temp

Revision ID: 0004_calibration
Revises: 0003_compliance
Create Date: 2026-06-15
"""
from alembic import op
import sqlalchemy as sa

revision = "0004_calibration"
down_revision = "0003_compliance"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "model_versions",
        sa.Column("calibration_temp", sa.Float(), nullable=False, server_default="1.0"),
    )


def downgrade() -> None:
    op.drop_column("model_versions", "calibration_temp")
