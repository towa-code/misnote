from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers import attempts, auth, mistake_notes, questions, subjects
from app.routers.units import subjects_router as units_subjects_router, units_router

app = FastAPI(title="misnote API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """既定のハンドラと同じ形を保ちつつ、password フィールドの入力値だけ伏せ字にする。

    既定の RequestValidationError ハンドラはバリデーションに失敗したフィールドの
    入力値をそのまま返すため、8文字未満・72バイト超などでパスワードが平文の
    まま応答ボディに乗ってしまう。devtools 履歴やログに残るのを防ぐ。
    """
    errors = jsonable_encoder(exc.errors())
    for error in errors:
        if "password" in error.get("loc", ()):
            error["input"] = "***"
        elif isinstance(error.get("input"), dict) and "password" in error["input"]:
            # password 以外のフィールドが原因のエラーでは input にボディ全体が入る
            # （例: name の入れ忘れ）。その中の password だけを伏せる。
            error["input"] = {**error["input"], "password": "***"}
    return JSONResponse(status_code=422, content={"detail": errors})


app.include_router(auth.router,            prefix="/v1/auth",          tags=["auth"])
app.include_router(subjects.router,        prefix="/v1/subjects",      tags=["subjects"])
app.include_router(units_subjects_router,  prefix="/v1/subjects",      tags=["units"])
app.include_router(units_router,           prefix="/v1/units",         tags=["units"])
app.include_router(questions.router,       prefix="/v1/questions",     tags=["questions"])
app.include_router(mistake_notes.router,   prefix="/v1/mistake-notes", tags=["mistake-notes"])
app.include_router(attempts.router,        prefix="/v1/questions",     tags=["attempts"])


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
