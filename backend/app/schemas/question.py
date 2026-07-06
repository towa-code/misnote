from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.refs import SubjectRef, UnitRef


class QuestionCreate(BaseModel):
    subject_id: UUID
    unit_id: UUID | None = None
    question_text: str
    correct_answer: str | None = None
    memo: str = Field(..., min_length=1)  # 間違えた理由は必須
    learning: str | None = None
    next_review_at: date | None = None


class QuestionUpdate(BaseModel):
    subject_id: UUID
    unit_id: UUID | None = None
    question_text: str
    correct_answer: str | None = None


class QuestionResponse(BaseModel):
    id: UUID
    subject: SubjectRef
    unit: UnitRef | None
    question_text: str
    correct_answer: str | None
    created_at: datetime
    mistake_note_id: UUID | None

    model_config = {"from_attributes": True}
