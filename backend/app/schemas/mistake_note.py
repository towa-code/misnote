from datetime import date
from typing import Literal
from uuid import UUID

from pydantic import BaseModel

from app.schemas.refs import QuestionRef

# 間違いの原因タグ。「解く過程のどこで失敗したか」で切ってあるので分類同士が重ならない。
# 表示用の日本語ラベルはフロントエンド（src/lib/reason-tags.ts）が持つ。
ReasonTag = Literal["misread", "approach", "knowledge", "calculation", "time", "other"]


class MistakeNoteUpdate(BaseModel):
    memo: str | None = None
    learning: str | None = None
    next_review_at: date | None = None
    reason_tag: ReasonTag | None = None


class MistakeNoteStatusUpdate(BaseModel):
    status: Literal["active", "mastered"]


class MistakeNoteResponse(BaseModel):
    id: UUID
    question: QuestionRef
    memo: str | None
    learning: str | None
    reason_tag: ReasonTag | None
    status: Literal["active", "mastered"]
    wrong_count: int
    correct_streak: int
    next_review_at: date | None
