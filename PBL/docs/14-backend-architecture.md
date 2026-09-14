# 14 — Backend Architecture

## Status
🟢 Confirmed — this document maps directly to the existing repository structure and must not diverge from it without an ADR (see `42` in the governing rules).

## 1. Folder-to-Responsibility Map

```text
backend/app/main.py            → FastAPI app instantiation, middleware registration
backend/app/core/config.py     → THE single source of settings (Pydantic Settings)
backend/app/api/router.py      → Central route registration (aggregates all routers)
backend/app/api/routes/        → HTTP layer — one resource per file, thin handlers only
backend/app/db/models/         → SQLAlchemy ORM models (persistence shape)
backend/app/schemas/           → Pydantic request/response contracts (API layer validation)
backend/app/services/          → Business logic — the only place complex logic may live
backend/app/workers/           → Async/background processing (OCR, AI evaluation, analytics, email, deadlines)
backend/scripts/               → One-off/maintenance scripts, run via `python -m scripts.<name>`
backend/tests/                 → Tests, mirroring the app structure
```

## 2. Full Request Lifecycle

```text
HTTP request
↓
Router (api/router.py dispatches to api/routes/<resource>.py)
↓
Authentication dependency (resolves user identity from token)
↓
Authorization dependency (resolves role + scope, checks against target resource)
↓
Pydantic validation (schemas/<resource>.py — request body/query params)
↓
Service call (services/<resource>_service.py — business logic, transactions)
↓
Database/repository interaction (db/models/ via SQLAlchemy session)
↓
AI service call if required (services/ai/* → AIProvider, possibly deferred to a worker)
↓
Persistence (commit)
↓
Response schema (schemas/<resource>.py — response shape)
↓
HTTP response
```

Routes must never skip the service layer to talk to `db/models/` directly — this keeps business rules (e.g., "only finalized evaluations count as evidence") centralized and testable in one place, not duplicated across route handlers.

## 3. Configuration Rule (Non-Negotiable)

All settings come from:

```python
from app.core.config import settings
```

Never:
- create a second config module,
- read `os.environ` directly in application code,
- hardcode environment-specific values.

See `25-environment-and-configuration.md` for the full settings catalog.

## 4. Route File Convention

- One resource per file under `api/routes/` (e.g., `question_papers.py`, `answer_papers.py`, `evaluations.py`, `queries.py`, `assignments.py`).
- All routers are registered exclusively in `api/router.py` — no route file self-registers or is mounted elsewhere.

## 5. Service Layer Convention

- `services/<domain>_service.py` per domain, matching the route resource it backs (e.g., `evaluation_service.py` backs `routes/evaluations.py`).
- Services own transactions; a route handler calls exactly one top-level service function per request in the common case.
- AI-dependent services depend on `AIProvider` (see `08-ai-evaluation-engine.md`), never a concrete Hugging Face client.

## 6. Workers Convention

- `workers/` hosts background jobs triggered by services (e.g., enqueue an evaluation job) or scheduled (deadline checks, analytics rollups).
- Workers call back into `services/` for any DB/business-logic interaction — they do not reimplement business rules independently.
- Task queue technology is an Open Question (see `03-system-architecture.md`).

## 7. Scripts Convention

- `backend/scripts/` holds one-off/maintenance scripts (e.g., data backfills, one-time migrations of legacy data).
- Executed as `python -m scripts.<name>`, never imported into the running application.

## 8. Tests Convention

- `backend/tests/` mirrors `backend/app/` structure (e.g., `tests/services/test_evaluation_service.py`).
- See `22-testing-and-quality-strategy.md` for the full strategy.

## Open Questions
- ❓ Task queue/worker runtime selection.
- ❓ Whether a `repositories/` layer is introduced between `services/` and `db/models/` for complex query reuse (currently: services call SQLAlchemy directly; revisit only if duplication becomes a problem — do not add speculatively).
