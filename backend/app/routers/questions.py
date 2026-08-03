from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user_id
from app.models.mistake_note import MistakeNote
from app.models.question import Question
from app.models.unit import Unit
from app.schemas.question import QuestionCreate, QuestionResponse, QuestionUpdate
from app.schemas.refs import QuestionRef, SubjectRef, UnitRef

router = APIRouter()


def _build_response(q: Question) -> QuestionResponse:
    return QuestionResponse(
        id=q.id,
        subject=SubjectRef.model_validate(q.subject),
        unit=UnitRef.model_validate(q.unit) if q.unit else None,
        question_text=q.question_text,
        correct_answer=q.correct_answer,
        created_at=q.created_at,
        mistake_note_id=q.mistake_note.id if q.mistake_note else None,
    )


def _validate_unit(subject_id: UUID, unit_id: UUID | None, db: Session) -> None:
    if unit_id is None:
        return
    unit = db.get(Unit, unit_id)
    if not unit or unit.subject_id != subject_id:
        raise HTTPException(status_code=400, detail="unit_id does not belong to the specified subject")


@router.get("", response_model=list[QuestionResponse])
def list_questions(
    subject_id: UUID | None = Query(None),
    unit_id: UUID | None = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> list[QuestionResponse]:
    q = db.query(Question).filter(Question.user_id == user_id)
    if subject_id:
        q = q.filter(Question.subject_id == subject_id)
    if unit_id:
        q = q.filter(Question.unit_id == unit_id)
    questions = q.offset(offset).limit(limit).all()
    return [_build_response(question) for question in questions]


@router.get("/{question_id}", response_model=QuestionResponse)
def get_question(
    question_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> QuestionResponse:
    question = db.query(Question).filter(Question.id == question_id, Question.user_id == user_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return _build_response(question)


@router.post("", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
def create_question(
    body: QuestionCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> QuestionResponse:
    _validate_unit(body.subject_id, body.unit_id, db)

    question = Question(
        user_id=user_id,
        subject_id=body.subject_id,
        unit_id=body.unit_id,
        question_text=body.question_text,
        correct_answer=body.correct_answer,
    )
    db.add(question)
    db.flush()

    if body.memo or body.learning or body.reason_tag or body.next_review_at:
        note = MistakeNote(
            user_id=user_id,
            question_id=question.id,
            memo=body.memo,
            learning=body.learning,
            reason_tag=body.reason_tag,
            next_review_at=body.next_review_at,
        )
        db.add(note)

    db.commit()
    db.refresh(question)
    return _build_response(question)


@router.put("/{question_id}", response_model=QuestionResponse)
def update_question(
    question_id: UUID,
    body: QuestionUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> QuestionResponse:
    question = db.query(Question).filter(Question.id == question_id, Question.user_id == user_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    _validate_unit(body.subject_id, body.unit_id, db)

    question.subject_id = body.subject_id
    question.unit_id = body.unit_id
    question.question_text = body.question_text
    question.correct_answer = body.correct_answer
    db.commit()
    db.refresh(question)
    return _build_response(question)


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(
    question_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> None:
    question = db.query(Question).filter(Question.id == question_id, Question.user_id == user_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(question)
    db.commit()
