"""squad strength: player_club_snapshots + team_squad_strength

Revision ID: 0005_squad_strength
Revises: 0004_calibration
Create Date: 2026-06-17
"""
from alembic import op
import sqlalchemy as sa

revision = "0005_squad_strength"
down_revision = "0004_calibration"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "player_club_snapshots",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("player_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("national_team_id", sa.String(), nullable=False),
        sa.Column("season", sa.Integer(), nullable=False),
        sa.Column("club_name", sa.String(), nullable=True),
        sa.Column("club_elo", sa.Float(), nullable=True),
        sa.Column("position", sa.String(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_pcs_player", "player_club_snapshots", ["player_id"])
    op.create_index("ix_pcs_team", "player_club_snapshots", ["national_team_id"])

    op.create_table(
        "team_squad_strength",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("team_id", sa.String(), sa.ForeignKey("teams.team_id"), nullable=False),
        sa.Column("season", sa.Integer(), nullable=False),
        sa.Column("strength_elo", sa.Float(), nullable=True),
        sa.Column("score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("matched", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("as_of", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_tss_team_season", "team_squad_strength", ["team_id", "season"])


def downgrade() -> None:
    op.drop_index("ix_tss_team_season", table_name="team_squad_strength")
    op.drop_table("team_squad_strength")
    op.drop_index("ix_pcs_team", table_name="player_club_snapshots")
    op.drop_index("ix_pcs_player", table_name="player_club_snapshots")
    op.drop_table("player_club_snapshots")
