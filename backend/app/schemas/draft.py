from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class DraftCreate(BaseModel):
    body: str = Field(..., min_length=1)


class DraftResponse(BaseModel):
    id: UUID
    body: str
    created_at: datetime

    model_config = {"from_attributes": True}
