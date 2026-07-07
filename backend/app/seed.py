from sqlalchemy.orm import Session

from app.deps import SEED_USER_ID
from app.models.subject import Subject
from app.models.unit import Unit
from app.models.user import User

SEED_SUBJECTS = {
    "数学": ["二次方程式", "因数分解"],
    "英語": ["文法", "長文読解"],
}


def ensure_seed_user(db: Session) -> None:
    if not db.get(User, SEED_USER_ID):
        db.add(User(id=SEED_USER_ID, email="seed@misnote.local", name="シードユーザー"))
        db.commit()


def ensure_seed_subjects(db: Session) -> None:
    for subject_name, unit_names in SEED_SUBJECTS.items():
        subject = (
            db.query(Subject)
            .filter(Subject.user_id == SEED_USER_ID, Subject.name == subject_name)
            .first()
        )
        if not subject:
            subject = Subject(user_id=SEED_USER_ID, name=subject_name)
            db.add(subject)
            db.commit()
            db.refresh(subject)

        for unit_name in unit_names:
            unit = (
                db.query(Unit)
                .filter(Unit.subject_id == subject.id, Unit.name == unit_name)
                .first()
            )
            if not unit:
                db.add(Unit(subject_id=subject.id, name=unit_name))
        db.commit()
