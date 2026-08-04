from datetime import date, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user_id
from app.models.attempt import Attempt
from app.models.mistake_note import MistakeNote
from app.models.question import Question
from app.schemas.attempt import AttemptCreate, AttemptHistoryItem, AttemptResponse

router = APIRouter()

MASTERY_THRESHOLD = 3

# 解答後の correct_streak 0 / 1 / 2 / 3以上 に対応する提案間隔（日）
SUGGEST_INTERVALS = [1, 3, 7, 14]


def _suggest_next_review(correct_streak: int) -> date:
    days = SUGGEST_INTERVALS[min(correct_streak, len(SUGGEST_INTERVALS) - 1)]
    return date.today() + timedelta(days=days)


@router.post("/{question_id}/attempts", response_model=AttemptResponse, status_code=status.HTTP_201_CREATED)
def create_attempt(
    question_id: UUID,
    body: AttemptCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> AttemptResponse:
    question = db.query(Question).filter(Question.id == question_id, Question.user_id == user_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    note = question.mistake_note

    if not body.is_correct:
        if note is None:
            note = MistakeNote(
                user_id=user_id,
                question_id=question_id,
                wrong_count=1,
                correct_streak=0,
            )
            db.add(note)
            db.flush()
        else:
            note.wrong_count += 1
            note.correct_streak = 0
            if note.status == "mastered":
                note.status = "active"
    else:
        if note is not None:
            note.correct_streak += 1

    attempt = Attempt(
        user_id=user_id,
        question_id=question_id,
        user_answer=body.user_answer,
        is_correct=body.is_correct,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    if note:
        db.refresh(note)

    mistake_note_id = note.id if note else None
    correct_streak = note.correct_streak if note else None
    mastery_suggested = (correct_streak >= MASTERY_THRESHOLD) if correct_streak is not None else None
    suggested_next_review_at = (
        _suggest_next_review(correct_streak) if correct_streak is not None else None
    )

    return AttemptResponse(
        id=attempt.id,
        question_id=attempt.question_id,
        user_answer=attempt.user_answer,
        is_correct=attempt.is_correct,
        answered_at=attempt.answered_at,
        mistake_note_id=mistake_note_id,
        correct_streak=correct_streak,
        mastery_suggested=mastery_suggested,
        suggested_next_review_at=suggested_next_review_at,
    )


@router.get("/{question_id}/attempts", response_model=list[AttemptHistoryItem])
def list_attempts(
    question_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> list[Attempt]:
    question = db.query(Question).filter(Question.id == question_id, Question.user_id == user_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return (
        db.query(Attempt)
        .filter(Attempt.question_id == question_id)
        .order_by(Attempt.answered_at.desc())
        .all()
    )
