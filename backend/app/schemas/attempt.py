from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class AttemptCreate(BaseModel):
    user_answer: str | None = None
    is_correct: bool


class AttemptResponse(BaseModel):
    id: UUID
    question_id: UUID
    user_answer: str | None
    is_correct: bool
    answered_at: datetime
    mistake_note_id: UUID | None
    correct_streak: int | None
    mastery_suggested: bool | None
    suggested_next_review_at: date | None


class AttemptHistoryItem(BaseModel):
    id: UUID
    question_id: UUID
    user_answer: str | None
    is_correct: bool
    answered_at: datetime

    model_config = {"from_attributes": True}
