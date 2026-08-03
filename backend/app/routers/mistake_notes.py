from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user_id
from app.models.mistake_note import MistakeNote
from app.schemas.mistake_note import MistakeNoteResponse, MistakeNoteStatusUpdate, MistakeNoteUpdate
from app.schemas.refs import QuestionRef, SubjectRef, UnitRef

router = APIRouter()


def _build_response(note: MistakeNote) -> MistakeNoteResponse:
    q = note.question
    return MistakeNoteResponse(
        id=note.id,
        question=QuestionRef(
            id=q.id,
            subject=SubjectRef.model_validate(q.subject),
            unit=UnitRef.model_validate(q.unit) if q.unit else None,
            question_text=q.question_text,
            correct_answer=q.correct_answer,
        ),
        memo=note.memo,
        learning=note.learning,
        reason_tag=note.reason_tag,
        status=note.status,
        wrong_count=note.wrong_count,
        correct_streak=note.correct_streak,
        next_review_at=note.next_review_at,
    )


@router.get("/today", response_model=list[MistakeNoteResponse])
def list_today(
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> list[MistakeNoteResponse]:
    notes = (
        db.query(MistakeNote)
        .filter(
            MistakeNote.user_id == user_id,
            MistakeNote.status == "active",
            MistakeNote.next_review_at <= date.today(),
        )
        .all()
    )
    return [_build_response(n) for n in notes]


@router.get("/mastered", response_model=list[MistakeNoteResponse])
def list_mastered(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> list[MistakeNoteResponse]:
    notes = (
        db.query(MistakeNote)
        .filter(MistakeNote.user_id == user_id, MistakeNote.status == "mastered")
        .offset(offset).limit(limit).all()
    )
    return [_build_response(n) for n in notes]


@router.get("", response_model=list[MistakeNoteResponse])
def list_active(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> list[MistakeNoteResponse]:
    notes = (
        db.query(MistakeNote)
        .filter(MistakeNote.user_id == user_id, MistakeNote.status == "active")
        .offset(offset).limit(limit).all()
    )
    return [_build_response(n) for n in notes]


@router.get("/{note_id}", response_model=MistakeNoteResponse)
def get_note(
    note_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> MistakeNoteResponse:
    note = db.query(MistakeNote).filter(MistakeNote.id == note_id, MistakeNote.user_id == user_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="MistakeNote not found")
    return _build_response(note)


@router.put("/{note_id}", response_model=MistakeNoteResponse)
def update_note(
    note_id: UUID,
    body: MistakeNoteUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> MistakeNoteResponse:
    note = db.query(MistakeNote).filter(MistakeNote.id == note_id, MistakeNote.user_id == user_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="MistakeNote not found")
    if body.memo is not None:
        note.memo = body.memo
    if body.learning is not None:
        note.learning = body.learning
    if body.next_review_at is not None:
        note.next_review_at = body.next_review_at
    # 他の3つと違い、送信の有無で判定する。null を明示的に送ればタグを外せる
    # （分類を間違えたときに直せる必要があるため）。
    if "reason_tag" in body.model_fields_set:
        note.reason_tag = body.reason_tag
    db.commit()
    db.refresh(note)
    return _build_response(note)


@router.put("/{note_id}/status", response_model=MistakeNoteResponse)
def update_status(
    note_id: UUID,
    body: MistakeNoteStatusUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> MistakeNoteResponse:
    note = db.query(MistakeNote).filter(MistakeNote.id == note_id, MistakeNote.user_id == user_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="MistakeNote not found")
    note.status = body.status
    if body.status == "mastered":
        note.next_review_at = None
    else:
        note.correct_streak = 0
    db.commit()
    db.refresh(note)
    return _build_response(note)
