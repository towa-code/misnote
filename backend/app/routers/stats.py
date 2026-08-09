from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user_id
from app.models.mistake_note import MistakeNote
from app.schemas.stats import StatsSummary

router = APIRouter()


@router.get("/summary", response_model=StatsSummary)
def get_summary(
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> StatsSummary:
    """克服率の分子と分母。母数は「一度でも間違えた問題」＝ mistake_note 全件。"""
    total_count, mastered_count = (
        db.query(
            func.count(MistakeNote.id),
            func.count(MistakeNote.id).filter(MistakeNote.status == "mastered"),
        )
        .filter(MistakeNote.user_id == user_id)
        .one()
    )
    return StatsSummary(mastered_count=mastered_count, total_count=total_count)
