from uuid import UUID

from pydantic import BaseModel


class SubjectRef(BaseModel):
    id: UUID
    name: str

    model_config = {"from_attributes": True}


class UnitRef(BaseModel):
    id: UUID
    name: str

    model_config = {"from_attributes": True}


class QuestionRef(BaseModel):
    id: UUID
    subject: SubjectRef
    unit: UnitRef | None
    question_text: str
    correct_answer: str | None

    model_config = {"from_attributes": True}
