from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user_id
from app.models.mistake_note import MistakeNote
from app.models.question import Question
from app.models.subject import Subject
from app.models.unit import Unit
from app.schemas.stats import ReasonTagStats, ReasonTagStatsRow, StatsSummary

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


@router.get("/reason-tags", response_model=ReasonTagStats)
def get_reason_tag_stats(
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> ReasonTagStats:
    """分析画面用に、教科 × 単元 × 原因タグごとの件数を返す。

    克服済みのノートも含める（間違い方の傾向を見るため）。割合や分析文はフロントで作る。
    """
    rows = (
        db.query(
            Subject.id,
            Subject.name,
            Unit.id,
            Unit.name,
            MistakeNote.reason_tag,
            func.count(MistakeNote.id),
            func.count(MistakeNote.id).filter(MistakeNote.status == "mastered"),
            func.sum(MistakeNote.wrong_count),
        )
        .join(Question, MistakeNote.question_id == Question.id)
        .join(Subject, Question.subject_id == Subject.id)
        .outerjoin(Unit, Question.unit_id == Unit.id)
        .filter(MistakeNote.user_id == user_id)
        .group_by(Subject.id, Subject.name, Unit.id, Unit.name, MistakeNote.reason_tag)
        .all()
    )
    return ReasonTagStats(
        rows=[
            ReasonTagStatsRow(
                subject_id=subject_id,
                subject_name=subject_name,
                unit_id=unit_id,
                unit_name=unit_name,
                reason_tag=reason_tag,
                note_count=note_count,
                mastered_count=mastered_count,
                wrong_count_sum=wrong_count_sum,
            )
            for (
                subject_id,
                subject_name,
                unit_id,
                unit_name,
                reason_tag,
                note_count,
                mastered_count,
                wrong_count_sum,
            ) in rows
        ]
    )
