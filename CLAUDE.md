# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

misnote (間違いノートアプリ) is a spaced-repetition "mistake notebook" app for students: users log questions they got wrong, add notes on what they misunderstood, set their own next-review date, and re-attempt questions until they've mastered them.

The repo has three parts:
- `backend/` — FastAPI + PostgreSQL API. Functionally implemented for all core resources (subjects, units, questions, attempts, mistake notes).
- `frontend/` — Next.js app, tracked in this repo (no nested `.git`). 3 of the 5 planned screens are built and wired to the real API through the generated client: home (`/`), question registration (`/register`), subject/unit management (`/subjects`). `/mistakes` is still a "準備中" placeholder and the review screen has no route yet — those two are the remaining Phase 2 work.
- `docs/` — design docs (schema, API contracts, screen specs) written before implementation. Treat these as the source of truth for intended behavior, but verify against actual code since implementation can drift (see below).

There is currently no authentication: `backend/app/deps.py::get_current_user_id()` hardcodes a seed user UUID (`00000000-0000-0000-0000-000000000001`), auto-created on startup by `app/seed.py`. Real auth (local JWT, then AWS Cognito) is a later phase — see `docs/ROADMAP.md`.

**No automated test suite exists yet** (no pytest config/tests dir in `backend/`, no test framework wired up in `frontend/`).

## Commands

### Backend (`backend/`)

```bash
cp .env.example .env
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload      # serves on :8000
```

Swagger UI: `http://localhost:8000/docs` · OpenAPI JSON: `http://localhost:8000/openapi.json`

Migrations (Alembic):
```bash
alembic revision --autogenerate -m "message"
alembic upgrade head
alembic downgrade -1
```

Or via Docker (from repo root): `cp backend/.env.example backend/.env && docker compose up`.

### Frontend (`frontend/`)

```bash
npm run dev      # :3000
npm run build
npm run lint
```

`npm run generate` regenerates the typed API client into `src/generated/` from the backend's OpenAPI schema (`../backend/openapi.json` — run the backend first so that file exists, e.g. `curl http://localhost:8000/openapi.json -o ../backend/openapi.json`).

`frontend/CLAUDE.md` just points to `frontend/AGENTS.md`, which warns that this Next.js version (16.2.9) has breaking API/convention changes not reflected in training data, and to check `node_modules/next/dist/docs/` before writing Next.js code.

## Architecture

### Backend request flow

`app/main.py` wires per-resource `APIRouter`s under `/v1/...` prefixes (e.g. `subjects.router` → `/v1/subjects`, `questions.router` → `/v1/questions`). Note `units` is split into two routers combined at different prefixes: `units_subjects_router` (nested `/v1/subjects/{id}/units`) and `units_router` (`/v1/units/{id}`). `attempts.router` mounts under `/v1/questions` (`/v1/questions/{id}/attempts`).

Each resource follows the same triad:
- `app/models/<x>.py` — SQLAlchemy model.
- `app/schemas/<x>.py` — Pydantic request/response models. Nested reference shapes (e.g. a question's embedded subject/unit) live in `app/schemas/refs.py` (`SubjectRef`, `UnitRef`, `QuestionRef`).
- `app/routers/<x>.py` — endpoints; each has a local `_build_response()` helper that assembles the nested response shape from the ORM object.

All queries are scoped by `user_id` (from `get_current_user_id()`) for data isolation; `units` are scoped indirectly through their `subject_id`.

### Frontend structure

- `src/app/<route>/page.tsx` files are thin; the actual UI lives in `src/components/<feature>/` (e.g. `/` renders `components/home/home-content.tsx`).
- API calls go through the singletons exported by `src/lib/api.ts` (`subjectsApi`, `unitsApi`, `questionsApi`, `mistakeNotesApi`), which wrap the generated clients in `src/generated/`. No hand-written `fetch`.
- `src/components/layout/nav-items.tsx::NAV_ITEMS` is the single source of navigation entries, consumed by both `sidebar.tsx` (desktop) and `bottom-nav.tsx` (mobile); `app-shell.tsx` combines them.

### Mistake-note / mastery rules

This is the core domain logic, spread across `routers/attempts.py` and `routers/mistake_notes.py` — worth reading both before changing either:

- `mistake_notes.question_id` is UNIQUE (one note per question).
- Incorrect attempt (`POST /questions/{id}/attempts`, `is_correct=false`): creates the note if none exists; otherwise `wrong_count += 1`, `correct_streak` resets to 0, and `status` reverts `mastered → active`.
- Correct attempt: `correct_streak += 1`, but only if a note already exists (a question with no wrong attempts has no note, so nothing to increment).
- `MASTERY_THRESHOLD = 3`: once `correct_streak >= 3`, the attempt response includes `mastery_suggested: true`. This is advisory only — the note only moves to `status="mastered"` via an explicit `PUT /mistake-notes/{id}/status` call, never automatically.
- Manually reverting `mastered → active` via the status endpoint resets `correct_streak` to 0; setting `mastered` clears `next_review_at`.
- `GET /mistake-notes/today` returns notes where `status == "active" AND next_review_at <= today` (nulls excluded — unscheduled notes are a separate concern on the home screen).
- The list endpoints are status-partitioned: bare `GET /mistake-notes` returns only `status == "active"` notes, `GET /mistake-notes/mastered` only `status == "mastered"` ones. There is no endpoint returning both.
- `unit_id` on `questions` is nullable; if set, it must belong to the question's `subject_id` (`routers/questions.py::_validate_unit`, 400 on mismatch).
- Deleting a `Subject` or `Unit` returns 409 if it still has related units/questions attached.

### Conventions

- All PKs are UUIDs.
- List endpoints accept `limit`/`offset` query params (default 100/0).
- Errors are `{"detail": "..."}`; 400 = business-rule violation, 404 = not found, 409 = conflict (has dependents), 422 = Pydantic validation (automatic).
- `app/config.py` (pydantic-settings) reads `DATABASE_URL` and `SECRET_KEY` from `.env`.

## Docs map

`docs/design/` has the full pre-implementation spec: `db/schema.md` + `db/design.md` (ER diagram, indexes, mastery rules), `api/*.md` (per-resource endpoint contracts), `api/conventions.md` (auth, pagination, error codes, OpenAPI-generator workflow), `screens/*.md` (screen-by-screen UX spec), `mockups/*.html` (static HTML mockups). `docs/ROADMAP.md` has the phased implementation plan (Phase 0 Docker skeleton → Phase 1 backend API → Phase 2 frontend → Phase 3 local JWT → Phase 4 AWS). Treat these as design intent, not a guarantee of current behavior — cross-check against the actual router/model code, which has already diverged in small ways (e.g. auth base URL and Cognito flow in `conventions.md` describe the eventual AWS target, not the current no-auth local state).
