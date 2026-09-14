# 26 — Project Development Conventions

## Status
🟢 Confirmed — these are the project's non-negotiable rules. Violating them requires an ADR (see §7), not a silent exception.

## 1. Folder Rules

- `backend/app/core/config.py` — the only settings source.
- `backend/app/schemas/` — the only location for Pydantic schemas.
- `backend/app/api/routes/` — one resource per file; all registration happens in `backend/app/api/router.py`.
- `backend/app/services/` — the only location for business logic; routes call services, never the reverse.
- `backend/scripts/` — one-off scripts only, run via `python -m scripts.<name>`.
- `backend/tests/` — mirrors app structure.
- `frontend/src/api/client.js` — the only fetch/API-base-URL logic.
- `frontend/src/components/` — reusable UI.
- `frontend/src/pages/` — page-specific composition.
- `frontend/src/context/` — shared providers.
- `docs/` — the only documentation directory (no `documentation/`, `architecture/`, `specification/`, etc.).

## 2. Naming

- Documentation files: lowercase, kebab-case, numerically prefixed, descriptive (`08-ai-evaluation-engine.md`, not `ai.md`).
- Backend route/service files: `snake_case`, singular-domain-named (`evaluation_service.py`, `question_papers.py`).
- Frontend components: `PascalCase.jsx`; pages: `PascalCasePage.jsx`.

## 3. Routes

- Thin handlers: parse/validate → call one service function → return schema. No business logic in a route file.
- Every route requires explicit auth/authorization dependencies unless it is genuinely public (e.g., login).

## 4. Schemas

- Every request body and response has an explicit Pydantic schema — no returning raw ORM objects or ad-hoc dicts from a route.

## 5. Services

- Own transactions and business rules.
- AI-dependent services depend on `AIProvider`; email-dependent services depend on `EmailProvider` — never a concrete vendor SDK imported directly into a service.

## 6. Models

- SQLAlchemy models under `backend/app/db/models/` represent persistence shape only; business rules live in services, not as heavy model methods.

## 7. Architectural Decision Records (ADRs)

Any deviation from the confirmed folder structure, or any significant architectural choice (e.g., token mechanism, task queue, OCR engine), is documented as an ADR with:

```text
Decision
Context
Options considered
Chosen option
Reason
Trade-offs
Status (Proposed / Accepted / Superseded)
```

ADRs prevent future contributors from having to ask "why is it built this way?" — store them under `docs/adr/` (🟡 proposed subfolder, not yet created).

## 8. Tests

- New business logic in `services/` ships with unit tests in the mirrored `tests/` location.
- New routes ship with at least one integration test covering an authorized and an unauthorized case (see `22-testing-and-quality-strategy.md` §3).

## 9. Frontend API Usage

- Components/pages never call `fetch` directly — always through `api/client.js`.

## 10. Git Conventions (Proposed)

- 🟡 Branch naming: `feature/<short-desc>`, `fix/<short-desc>`.
- 🟡 Commit messages: imperative mood, reference an FR-/NFR- ID or workflow number where applicable.

## 11. PR Expectations (Proposed)

- 🟡 PR description states: what changed, which requirement/workflow it implements, and which docs (if any) were updated to stay consistent (`39` — architectural consistency rule).
- A PR that adds a new entity, endpoint, or role capability must update the corresponding `docs/` file(s) in the same PR.

## 12. Error Handling

- Services raise domain-specific exceptions; routes translate these to HTTP responses via a shared exception-handling layer (🟡 proposed: FastAPI exception handlers registered in `main.py`) — routes do not `try/except` generic exceptions ad hoc per-endpoint.

## 13. Logging

- See `NFR-OBS-001` (Open Question on stack). Convention regardless of stack: log at service-layer boundaries (entry, key decisions, exit/error), not inside tight loops or low-level DB calls.

## 14. Configuration

- Restated from `25-environment-and-configuration.md`: `from app.core.config import settings`, always.

## 15. Documentation Requirements

- Any new capability gets documented in the relevant existing `docs/` file before or alongside the PR that implements it — not retroactively "someday."
- Confirmed/Proposed/Future/Open Question labeling is mandatory on every new section.

## Open Questions
- ❓ Git branch/commit convention finalization.
- ❓ PR template formalization.
- ❓ ADR storage location (`docs/adr/` proposed but not created).
