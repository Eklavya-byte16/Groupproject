# 15 — API Contracts and Endpoints

## Status
🟡 Proposed (no endpoints are yet Implemented in the repository as of this writing; verify against actual code before relying on this as ground truth — see §0)

## 0. Status Legend for This Document

- **Implemented** — exists in `backend/app/api/routes/` today.
- **Planned** — designed, part of MVP, not yet built.
- **Proposed** — designed for a later phase.

At time of writing, inspect `backend/app/api/routes/` directly to confirm current implementation status; this document should be kept in sync with that directory, not the other way around.

## 1. Conventions

- All endpoints are prefixed `/api/v1` (🟡 proposed versioning scheme).
- All protected endpoints require a bearer token (see `18-authentication-and-authorization.md`) and pass through the role/scope authorization dependency.
- Standard error shape: `{"detail": str, "code": str}` (🟡 proposed).

## 2. Auth (Planned)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/v1/auth/login` | none | Exchange credentials for a token |
| POST | `/api/v1/auth/logout` | required | Invalidate session/token |
| GET | `/api/v1/auth/me` | required | Return current principal + role + scope |

## 3. Academic Structure (Planned)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET/POST | `/api/v1/departments` | Admin | List/create departments |
| GET/POST | `/api/v1/subjects` | Admin | List/create subjects |
| GET/POST | `/api/v1/academic-years` | Admin | List/create academic years |
| GET/POST | `/api/v1/assignments` | Admin (write), scoped user (read own) | Manage Paper Checker assignments |

## 4. Question Papers (Planned)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET/POST | `/api/v1/question-papers` | Paper Checker (scoped), Admin | List/create question papers |
| GET | `/api/v1/question-papers/{id}` | scoped | Retrieve one paper (with versions) |
| PATCH | `/api/v1/question-papers/{id}` | scoped author | Edit draft |
| POST | `/api/v1/question-papers/{id}/submit-review` | scoped author | Submit for review |
| POST | `/api/v1/question-papers/{id}/approve` | Admin/reviewer | Approve |

## 5. Answer Papers & Evaluation (Planned)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/v1/answer-papers` | scoped | Upload a script |
| GET | `/api/v1/answer-papers/{id}` | scoped | Retrieve status/metadata |
| GET | `/api/v1/evaluations` | scoped | List evaluations (filterable by status) |
| GET | `/api/v1/evaluations/{id}` | scoped | Retrieve one evaluation with AI suggestion |
| PATCH | `/api/v1/evaluations/{id}` | scoped reviewer | Adjust marks |
| POST | `/api/v1/evaluations/{id}/finalize` | scoped reviewer | Finalize marks |

## 6. Analytics (Proposed — post-MVP)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/analytics/questions/{id}` | scoped | Question-level stats |
| GET | `/api/v1/analytics/topics/{id}` | scoped | Topic-level stats + AI inference (clearly separated fields) |
| GET | `/api/v1/analytics/department/{id}` | scoped | Department rollup |

## 7. Student Queries (Proposed — post-MVP)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/v1/queries` | Student (or unauthenticated ingestion via worker) | Submit a query |
| GET | `/api/v1/queries` | scoped | List queue (ordered by priority) |
| POST | `/api/v1/queries/{id}/respond` | scoped | Respond to a query |
| PATCH | `/api/v1/queries/{id}/priority` | scoped | Override AI priority |

## 8. Validation & Errors

- Every request body is validated via a `schemas/` Pydantic model; invalid payloads return `422` with field-level detail.
- Authorization failures return `403` (never `404`, which would leak resource existence across scope boundaries — 🟡 proposed convention, confirm with security review).
- Not-found within scope returns `404`.

## 9. Service Ownership

Every endpoint above is backed by exactly one primary service function (see `14-backend-architecture.md` §5) — this document should list the owning service as endpoints are implemented, e.g. `POST /evaluations/{id}/finalize → services.evaluation_service.finalize_evaluation`.

## Open Questions
- ❓ API versioning strategy confirmation.
- ❓ Standard error envelope shape.
- ❓ 403 vs 404 convention for out-of-scope resources.
