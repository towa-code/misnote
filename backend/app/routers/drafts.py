from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user_id
from app.models.draft import Draft
from app.schemas.draft import DraftCreate, DraftResponse

router = APIRouter()


@router.get("", response_model=list[DraftResponse])
def list_drafts(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> list[Draft]:
    return (
        db.query(Draft)
        .filter(Draft.user_id == user_id)
        .order_by(Draft.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/{draft_id}", response_model=DraftResponse)
def get_draft(
    draft_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> Draft:
    draft = db.query(Draft).filter(Draft.id == draft_id, Draft.user_id == user_id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    return draft


@router.post("", response_model=DraftResponse, status_code=status.HTTP_201_CREATED)
def create_draft(
    body: DraftCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> Draft:
    draft = Draft(user_id=user_id, body=body.body)
    db.add(draft)
    db.commit()
    db.refresh(draft)
    return draft


@router.delete("/{draft_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_draft(
    draft_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> None:
    draft = db.query(Draft).filter(Draft.id == draft_id, Draft.user_id == user_id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    db.delete(draft)
    db.commit()
