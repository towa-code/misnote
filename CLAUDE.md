# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

misnote (間違いノートアプリ) is a spaced-repetition "mistake notebook" app for students: users log questions they got wrong, add notes on what they misunderstood, set their own next-review date, and re-attempt questions until they've mastered them.

The repo has three parts:
- `backend/` — FastAPI + PostgreSQL API. Functionally implemented for all core resources (subjects, units, questions, attempts, mistake notes, drafts).
- `frontend/` — Next.js app, tracked in this repo (no nested `.git`). All 5 designed screens are built and wired to the real API through the generated client: home (`/`), question registration (`/register`), subject/unit management (`/subjects`), mistake list (`/mistakes`), review (`/review/[id]`). Auth added three more: `/login`, `/signup`, `/account`, and quick save added `/quick`.
- `docs/` — design docs (schema, API contracts, screen specs) written before implementation. Treat these as the source of truth for intended behavior, but verify against actual code since implementation can drift (see below).

Local JWT authentication is implemented: `backend/app/deps.py::get_current_user_id()` validates the `Authorization: Bearer` header (HS256, 7-day expiry) and returns the signed-in user's id — every endpoint depends on it except `/v1/auth/register` and `/v1/auth/login`. Hashing (`bcrypt`) and JWT (`python-jose`) utilities live in `app/auth.py`; registration/login/`me` are in `app/routers/auth.py`. There is no seed user anymore — `app/seed.py` was removed when auth landed, and users start with an empty account after registering. AWS Cognito (Phase 4) will replace this, swapping only how `deps.py` verifies the token.

Backend tests: `cd backend && pip install -r requirements-dev.txt && pytest`. Tests run against a separate PostgreSQL database (`misnote_test`) and each test is rolled back afterward. The `tests/conftest.py` `client` fixture overrides the `get_current_user_id` dependency so most tests don't need a real token; tests that exercise auth itself use the `anon_client` fixture instead.

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

Every endpoint requires a token; get one with:
```bash
curl -X POST http://localhost:8000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "..."}'
# use the returned access_token as: -H "Authorization: Bearer <token>"
```

### Frontend (`frontend/`)

```bash
npm run dev      # :3000
npm run build
npm run lint
```

`npm run generate` regenerates the typed API client into `src/generated/` from the backend's OpenAPI schema (`../backend/openapi.json` — run the backend first so that file exists, e.g. `curl http://localhost:8000/openapi.json -o ../backend/openapi.json`). The generator needs Java 11+; the system `java` is 1.8 and gets rejected, so run it with the Homebrew JDK instead: `JAVA_HOME=/opt/homebrew/opt/openjdk npm run generate`.

`frontend/CLAUDE.md` just points to `frontend/AGENTS.md`, which warns that this Next.js version (16.2.9) has breaking API/convention changes not reflected in training data, and to check `node_modules/next/dist/docs/` before writing Next.js code. One example that already bit us: Next.js 16's bundled React Compiler lint rules make `react-hooks/set-state-in-effect` (a synchronous `setState` inside `useEffect`) a hard lint error — see the documented `eslint-disable-next-line` in `src/components/auth/auth-gate.tsx`.

## Architecture

### Backend request flow

`app/main.py` wires per-resource `APIRouter`s under `/v1/...` prefixes (e.g. `subjects.router` → `/v1/subjects`, `questions.router` → `/v1/questions`). Note `units` is split into two routers combined at different prefixes: `units_subjects_router` (nested `/v1/subjects/{id}/units`) and `units_router` (`/v1/units/{id}`). `attempts.router` mounts under `/v1/questions` (`/v1/questions/{id}/attempts`). `auth.router` mounts at `/v1/auth` (`/register`, `/login`, `/me`) and is the only router with endpoints that don't require a token (`/register`, `/login`). `drafts.router` mounts at `/v1/drafts` and `stats.router` at `/v1/stats`.

Each resource follows the same triad:
- `app/models/<x>.py` — SQLAlchemy model.
- `app/schemas/<x>.py` — Pydantic request/response models. Nested reference shapes (e.g. a question's embedded subject/unit) live in `app/schemas/refs.py` (`SubjectRef`, `UnitRef`, `QuestionRef`).
- `app/routers/<x>.py` — endpoints; each has a local `_build_response()` helper that assembles the nested response shape from the ORM object.

All queries are scoped by `user_id` (from `get_current_user_id()`) for data isolation, including `units` — each `units.py` endpoint checks the parent subject's owner before reading or writing.

### Frontend structure

- `src/app/<route>/page.tsx` files are thin; the actual UI lives in `src/components/<feature>/` (e.g. `/` renders `components/home/home-content.tsx`).
- API calls go through the singletons exported by `src/lib/api.ts` (`subjectsApi`, `unitsApi`, `questionsApi`, `mistakeNotesApi`), which wrap the generated clients in `src/generated/`. No hand-written `fetch`.
- `src/components/layout/nav-items.tsx::NAV_ITEMS` is the single source of navigation entries, consumed by both `sidebar.tsx` (desktop) and `bottom-nav.tsx` (mobile); `app-shell.tsx` combines them.
- `src/components/auth/auth-gate.tsx` wraps `AppShell` in `app/layout.tsx`: it renders `/login`/`/signup` without the shell, redirects to `/login` when there's no token, and otherwise renders the shelled app.
- `src/lib/auth-token.ts` is the sole place that touches `localStorage` for the token (`getToken`/`setToken`/`clearToken`); `src/lib/api.ts` reads it to attach the `Authorization` header and clears it on a 401 response.

### Mistake-note / mastery rules

This is the core domain logic, spread across `routers/attempts.py` and `routers/mistake_notes.py` — worth reading both before changing either:

- `mistake_notes.question_id` is UNIQUE (one note per question).
- Incorrect attempt (`POST /questions/{id}/attempts`, `is_correct=false`): creates the note if none exists; otherwise `wrong_count += 1`, `correct_streak` resets to 0, and `status` reverts `mastered → active`.
- Correct attempt: `correct_streak += 1`, but only if a note already exists (a question with no wrong attempts has no note, so nothing to increment).
- The attempt response also carries `suggested_next_review_at`: a next-review date derived from the post-attempt `correct_streak` via `SUGGEST_INTERVALS = [1, 3, 7, 14]` in `routers/attempts.py` (streak 0/1/2/3+ → today +1/+3/+7/+14 days), or `null` when there is no note. Like `mastery_suggested` it is advisory — nothing writes `next_review_at`; the frontend puts the date into the review screen's date field and the user saves it through `PUT /mistake-notes/{id}`. See `docs/superpowers/specs/2026-08-04-review-interval-suggestion-design.md`.
- `MASTERY_THRESHOLD = 3`: once `correct_streak >= 3`, the attempt response includes `mastery_suggested: true`. This is advisory only — the note only moves to `status="mastered"` via an explicit `PUT /mistake-notes/{id}/status` call, never automatically.
- Manually reverting `mastered → active` via the status endpoint resets `correct_streak` to 0; setting `mastered` clears `next_review_at`.
- `GET /mistake-notes/today` returns notes where `status == "active" AND next_review_at <= today` (nulls excluded — unscheduled notes are a separate concern on the home screen).
- The list endpoints are status-partitioned: bare `GET /mistake-notes` returns only `status == "active"` notes, `GET /mistake-notes/mastered` only `status == "mastered"` ones. There is no endpoint returning both.
- `mistake_notes.reason_tag` is the "why did I get this wrong" tag: a nullable VARCHAR holding one of `misread` / `approach` / `knowledge` / `calculation` / `time` / `other`, validated by the `ReasonTag` `Literal` in `app/schemas/mistake_note.py` rather than a DB constraint. It is set through `POST /v1/questions` and `PUT /v1/mistake-notes/{id}`; that PUT decides whether to write it from `model_fields_set`, so an explicit `null` clears the tag (the other three fields use `is not None` and cannot be cleared). Japanese labels live only in `frontend/src/lib/reason-tags.ts`. See `docs/superpowers/specs/2026-08-03-reason-tags-design.md`.
- `unit_id` on `questions` is nullable; if set, it must belong to the question's `subject_id` (`routers/questions.py::_validate_unit`, 400 on mismatch).
- Deleting a `Subject` or `Unit` returns 409 if it still has related units/questions attached.

### Quick save (drafts)

`drafts` is deliberately **separate** from `questions`/`mistake_notes` — it holds a note that isn't a question yet, with only `body` (plus `id`/`user_id`/`created_at`). It exists because `questions.subject_id` is NOT NULL, so saving "just the question text" is impossible through `questions`. Keeping it separate is also what let the register form's required `memo` (commit d9d14c4) stay required.

- `GET/POST /v1/drafts`, `GET/DELETE /v1/drafts/{id}`. The list is `created_at DESC`. No update endpoint — a draft is either promoted or deleted, which is why there's no `updated_at`.
- `/quick` lists drafts and saves through a modal; the modal stays open after each save so several can be typed in a row. It is the only modal in the app and uses the native `<dialog>` + `showModal()`. **`m-auto` is required on it** — Tailwind's preflight sets `margin: 0`, which kills `<dialog>`'s default centering.
- Promoting a draft goes through the normal register form: `/register?draft=<id>` prefills `question_text` from `GET /drafts/{id}`, and a successful `POST /questions` then deletes the draft. Both draft calls fail soft — a missing draft just renders an empty form, and a failed delete still navigates home. `app/register/page.tsx` reads `searchParams` server-side and passes `draftId` down, so no `useSearchParams`/Suspense is involved.
- See `docs/superpowers/specs/2026-08-09-quick-save-design.md` for why the originally proposed "note-less question = unorganized" design was dropped.

### Mastery-rate bar (stats)

`GET /v1/stats/summary` returns `{mastered_count, total_count}` — the only endpoint on `app/routers/stats.py`. It exists solely to feed the sidebar's mastery-rate bar (`frontend/src/components/layout/mastery-progress.tsx`).

- **克服率 = mastered notes ÷ all mistake notes (active + mastered).** The denominator is "questions you've gotten wrong at least once", so a question with no note isn't counted. Percentages are computed client-side; the endpoint returns raw counts only.
- One COUNT query using PostgreSQL's `FILTER` clause. No new table, no migration.
- The sidebar mounts once in `AppShell`, so the component refetches on every `usePathname()` change — without that, mastering a question wouldn't move the bar until a reload.
- It renders `null` while loading and on failure (a 0% bar would read as "克服率0"), and the sidebar is `hidden lg:flex`, so on mobile the bar is invisible but the request still fires.
- This is a slice of the `stats-dashboard` backlog item; the other three proposed `/v1/stats` endpoints don't exist. See `docs/superpowers/specs/2026-08-09-mastery-progress-design.md`.

### Conventions

- All PKs are UUIDs.
- List endpoints accept `limit`/`offset` query params (default 100/0).
- Errors are `{"detail": "..."}`; 400 = business-rule violation, 404 = not found, 409 = conflict (has dependents), 422 = Pydantic validation (automatic).
- `app/config.py` (pydantic-settings) reads `DATABASE_URL` and `SECRET_KEY` from `.env`.

## Docs map

`docs/design/` has the full pre-implementation spec: `db/schema.md` + `db/design.md` (ER diagram, indexes, mastery rules), `api/*.md` (per-resource endpoint contracts), `api/conventions.md` (auth, pagination, error codes, OpenAPI-generator workflow), `screens/*.md` (screen-by-screen UX spec), `mockups/*.html` (static HTML mockups). `docs/ROADMAP.md` has the phased implementation plan (Phase 0 Docker skeleton → Phase 1 backend API → Phase 2 frontend → Phase 3 local JWT → Phase 4 AWS, now on Phase 4). `docs/superpowers/specs/2026-07-31-auth-design.md` is the design doc for the Phase 3 local-JWT work. `docs/newfunction/` is the backlog of feature ideas — everything there is a proposal, not something to implement unasked (its README says so explicitly). Treat these as design intent, not a guarantee of current behavior — cross-check against the actual router/model code, which can still diverge in small ways as implementation continues.
