# 02 — Functional and Non-Functional Requirements

## Status
🟢 Confirmed (structure/IDs) · 🟡 Proposed (specific thresholds, marked inline)

Requirement IDs are referenced by other documents (test cases, API docs, ADRs). Do not renumber existing IDs once merged.

## Functional Requirements

### Authentication & Roles
- **FR-AUTH-001** — Users authenticate with institutional credentials (email + password minimum).
- **FR-AUTH-002** — System supports role assignment: Admin, Paper Checker, Student.
- **FR-AUTH-003** — Sessions/tokens expire after a configurable idle period (see `19-security-and-data-privacy.md`).

### Academic Structure
- **FR-ACAD-001** — Admin can create/edit departments, subjects, academic years, semesters.
- **FR-ACAD-002** — Admin can assign Paper Checkers to a (department, subject, academic year) scope.
- **FR-ACAD-003** — Admin can set and modify deadlines tied to an assignment.

### Question Paper Management
- **FR-QP-001** — Paper Checker can author a question paper mapped to subject/unit/syllabus.
- **FR-QP-002** — Each question records marks, difficulty, and optionally Bloom's taxonomy level and learning outcome.
- **FR-QP-003** — System supports a reusable question bank with duplicate-detection assistance (🟡 AI-assisted, proposed).
- **FR-QP-004** — Question papers go through a review/approval workflow before publication.
- **FR-QP-005** — Question papers are versioned; prior versions remain retrievable.

### Answer Paper Processing
- **FR-EVAL-001** — Paper Checkers/Admins can upload scanned/digital answer papers.
- **FR-EVAL-002** — System extracts text via OCR and segments answers by question.
- **FR-EVAL-003** — AI produces a first-pass mark suggestion with a confidence score per answer.
- **FR-EVAL-004** — Human reviewer can accept, adjust, or reject any AI-suggested mark; final marks require explicit human confirmation.
- **FR-EVAL-005** — Marks below a configurable AI confidence threshold are flagged as mandatory-review (see `21-ai-reliability-and-human-review.md`).

### Analytics
- **FR-ANALYTICS-001** — System computes question-, topic-, unit-, class-, and department-level performance statistics from finalized (human-confirmed) marks only.
- **FR-ANALYTICS-002** — System surfaces AI-inferred weak-topic recommendations, clearly separated from observed statistics.

### Student Queries
- **FR-QUERY-001** — Students can submit academic queries (via email ingestion and/or in-app form).
- **FR-QUERY-002** — AI assigns a seriousness/priority score to each incoming query with explainable feature inputs.
- **FR-QUERY-003** — All queries — regardless of score — reach a human-reviewable queue; none are auto-dismissed.
- **FR-QUERY-004** — Admin/Paper Checker can respond to a query, optionally using an AI-drafted response.

### AI Assistant (MCP)
- **FR-AI-001** — Authorized users can query an AI assistant restricted to a defined set of permission-checked MCP tools.
- **FR-AI-002** — Every MCP tool call is scoped to the calling user's role and assignment scope.

### Notifications
- **FR-NOTIFY-001** — System sends email notifications for deadline reminders, assignment changes, and result publication.
- **FR-NOTIFY-002** — Failed notification deliveries are retried with backoff and logged.

### Deadlines
- **FR-DEADLINE-001** — System tracks per-assignment deadlines and surfaces overdue status to Admin.

## Non-Functional Requirements

### Security
- **NFR-SEC-001** — All authorization checks are enforced server-side; UI-only restriction is never sufficient.
- **NFR-SEC-002** — Uploaded files are treated as untrusted input and validated before processing (see `17-file-upload-and-document-processing.md`).
- **NFR-SEC-003** — Secrets are never hardcoded or logged; all sourced via `backend/app/core/config.py`.

### Performance
- **NFR-PERF-001** — 🟡 API p95 latency target < 500ms for non-AI endpoints (subject to team confirmation).
- **NFR-PERF-002** — 🟡 AI evaluation of a single answer should complete asynchronously; user is not blocked on the request/response cycle (see `backend/app/workers/`).

### Reliability
- **NFR-REL-001** — AI/model failures degrade gracefully to a "pending manual evaluation" state rather than blocking the pipeline.
- **NFR-REL-002** — Notification failures do not block core academic workflows.

### Auditability
- **NFR-AUDIT-001** — Every mark change, assignment change, and query-status change is recorded in an immutable audit log (see `20-audit-logging-and-accountability.md`).

### Scalability
- **NFR-SCALE-001** — 🟡 System should support at minimum a single mid-size institution's concurrent departmental load (exact figures: Open Question).

### Maintainability
- **NFR-MAINT-001** — Business logic lives in `backend/app/services/`, never directly in route handlers.
- **NFR-MAINT-002** — AI model access goes through an `AIProvider` abstraction; no business logic hardcodes a specific Hugging Face model.

### Privacy
- **NFR-PRIV-001** — Student academic records are visible only to users with an authorizing role and scope.
- **NFR-PRIV-002** — PII in AI prompts is minimized to what is functionally necessary.

### Observability
- **NFR-OBS-001** — 🟡 Structured logging for all service-layer operations (format/tooling: Open Question).

## Open Questions
- ❓ Exact performance SLAs (NFR-PERF-001/002).
- ❓ Expected concurrent user scale (NFR-SCALE-001).
- ❓ Logging/observability stack (NFR-OBS-001).
