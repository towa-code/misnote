from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import SessionLocal
from app.routers import attempts, mistake_notes, questions, subjects
from app.routers.units import subjects_router as units_subjects_router, units_router
from app.seed import ensure_seed_subjects, ensure_seed_user


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        ensure_seed_user(db)
        ensure_seed_subjects(db)
    finally:
        db.close()
    yield


app = FastAPI(title="misnote API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(subjects.router,        prefix="/v1/subjects",      tags=["subjects"])
app.include_router(units_subjects_router,  prefix="/v1/subjects",      tags=["units"])
app.include_router(units_router,           prefix="/v1/units",         tags=["units"])
app.include_router(questions.router,       prefix="/v1/questions",     tags=["questions"])
app.include_router(mistake_notes.router,   prefix="/v1/mistake-notes", tags=["mistake-notes"])
app.include_router(attempts.router,        prefix="/v1/questions",     tags=["attempts"])


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
