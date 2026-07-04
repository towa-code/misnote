"""make_correct_answer_nullable

Revision ID: 79366a46c7d1
Revises: 
Create Date: 2026-07-04 08:36:47.638323

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '79366a46c7d1'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("questions", "correct_answer",
                    existing_type=sa.Text(), nullable=True)


def downgrade() -> None:
    op.alter_column("questions", "correct_answer",
                    existing_type=sa.Text(), nullable=False)
