import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Draft(Base):
    """クイック保存の下書き。まだ問題（questions）になっていないメモ。

    保存するか削除するかのどちらかで、編集はしないので updated_at は持たない。
    科目も持たない（本登録するときに選ぶ）。
    """

    __tablename__ = "drafts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="drafts")
