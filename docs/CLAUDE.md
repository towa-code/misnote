# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This directory is the **design documentation subtree** of the misnote (間違いノートアプリ) implementation repo — a digital mistake-notebook app targeting elementary/middle/high school students. It allows users to record wrong/difficult questions and schedule spaced-repetition reviews. Everything under `docs/` is Markdown design documents (plus static HTML mockups); the implementation lives in `backend/` and `frontend/` at the repo root.

## Document Map

| File | Contents |
|------|----------|
| `design/overview.md` | App description, feature list, tech stack, system architecture diagram, screen list |
| `design/api/conventions.md` | Auth, error codes, pagination, OpenAPI Generator workflow, full endpoint list |
| `design/api/subjects.md` | Subjects API (GET/POST/PUT/DELETE) |
| `design/api/units.md` | Units API |
| `design/api/questions.md` | Questions API — full CRUD, unit validation, mistake_note auto-create |
| `design/api/attempts.md` | Attempts API — correct_streak side effects, mastery_suggested |
| `design/api/mistake-notes.md` | Mistake-notes API — today/mastered filters, status endpoint, nested response shape |
| `design/api/drafts.md` | Drafts API — quick-save notes that aren't questions yet |
| `design/db/schema.md` | Full schema (6 tables) — all columns and FK relationships |
| `design/db/design.md` | ER diagram, indexes, design rationale, correct_streak/mastery rules |
| `design/screens/transitions.md` | Screen transition diagram |
| `design/screens/home.md` | Home screen — today's review + unscheduled section |
| `design/screens/register.md` | Question registration form |
| `design/screens/review.md` | Review flow — self-grading, mastery_suggested UI, memo update |
| `design/screens/mistake-list.md` | Mistake list — active/mastered tabs |
| `design/screens/subjects.md` | Subject & unit management |
| `design/screens/quick-save.md` | Quick save — draft list plus the save modal |
| `design/screens/common-ui.md` | Color tokens, interactions, responsive breakpoints (applies to all screens) |
| `design/mockups/` | Static HTML mockups (one per screen + `00_prototype.html` combining all screens) |
| `ROADMAP.md` | Implementation roadmap (Phase 0–4: local Docker → backend → frontend → local JWT → AWS) |
| `superpowers/specs/2026-07-31-auth-design.md` | Design doc for local JWT auth (Phase 3): token scheme, password-hashing library choice, `deps.py`/`units.py` changes, frontend auth routes |

## Architecture Summary

**Frontend:** Next.js + TypeScript + Tailwind CSS

**Backend:** FastAPI (Python) + SQLAlchemy ORM + Pydantic validation

**API contract flow:**
1. FastAPI auto-generates `openapi.json` at runtime
2. `openapi-generator-cli` converts it to TypeScript types + fetch client under `frontend/src/generated/`
3. Next.js consumes the generated client — no hand-written fetch calls

**Infrastructure (AWS):** Cognito (auth/JWT) → API Gateway → ECS+Fargate (FastAPI) → RDS PostgreSQL. CloudWatch for logging.

**Auth:** All API requests require `Authorization: Bearer {token}`. Currently a local JWT that FastAPI itself issues and verifies (Phase 3, implemented) — see `docs/superpowers/specs/2026-07-31-auth-design.md`. Base URL: `http://localhost:8000/v1`. Phase 4 will swap the token source to AWS Cognito (base URL becomes `https://api.misnote.com/v1`); only the verification step in `deps.py` is expected to change.

## Key DB Design Decisions

- `unit_id` on `questions` is nullable (questions can exist without a unit); when set, the unit must belong to the question's subject
- `mistake_notes.question_id` is UNIQUE — one note per question. An incorrect attempt creates the note if absent, otherwise updates it (`wrong_count` +1, `correct_streak` reset, `mastered` reverts to `active`)
- `correct_streak` on `mistake_notes` tracks consecutive correct answers; at 3 the API sets `mastery_suggested: true` and the UI *suggests* mastering — the transition to `mastered` is always a user action, never automatic
- `next_review_at` is user-set (not auto-calculated) and nullable; `GET /mistake-notes/today` filters by this date and excludes `null` (the home screen shows unscheduled notes separately)
- `attempts.user_answer` is optional — the review flow is self-graded
- All PKs are UUIDs; all tables are scoped to `user_id` for data isolation
- `drafts` (quick save) hangs off `users` only — it is a note that isn't a question yet, so it holds just `body` and has no link to subjects, questions, or notes. Promoting one copies its text into the register form and then deletes the draft
