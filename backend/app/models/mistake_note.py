import uuid

from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class MistakeNote(Base):
    __tablename__ = "mistake_notes"
    __table_args__ = (UniqueConstraint("question_id", name="uq_mistake_notes_question_id"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id"), nullable=False)
    memo = Column(Text, nullable=True)
    learning = Column(Text, nullable=True)
    # 値の妥当性は app/schemas/mistake_note.py の ReasonTag（Pydantic）が保証する。
    # タグ一覧は今後増減する前提なので、ネイティブ ENUM にはしない。
    reason_tag = Column(String(32), nullable=True)
    status = Column(Enum("active", "mastered", name="mistake_status"), nullable=False, default="active")
    wrong_count = Column(Integer, nullable=False, default=1)
    correct_streak = Column(Integer, nullable=False, default=0)
    next_review_at = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="mistake_notes")
    question = relationship("Question", back_populates="mistake_note")
