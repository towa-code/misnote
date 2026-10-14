from uuid import UUID

from pydantic import BaseModel

from app.schemas.mistake_note import ReasonTag


class StatsSummary(BaseModel):
    mastered_count: int
    total_count: int


class ReasonTagStatsRow(BaseModel):
    """教科 × 単元 × 原因タグ 1組ぶんの集計。unit / reason_tag が null の組もそのまま1行になる。"""

    subject_id: UUID
    subject_name: str
    unit_id: UUID | None
    unit_name: str | None
    reason_tag: ReasonTag | None
    note_count: int
    mastered_count: int
    wrong_count_sum: int


class ReasonTagStats(BaseModel):
    rows: list[ReasonTagStatsRow]
