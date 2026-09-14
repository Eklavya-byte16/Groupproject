# 16 — Frontend Architecture

## Status
🟢 Confirmed (structure, API-client rule) · 🟡 Proposed (specific page inventory)

## 1. Folder-to-Responsibility Map

```text
frontend/src/api/client.js   → THE ONLY module that knows the API base URL / performs fetch
frontend/src/components/     → Reusable UI (buttons, tables, cards, upload widgets, charts)
frontend/src/pages/          → Page-specific composition (route-level views)
frontend/src/context/        → Shared React providers (auth/session, role/scope, notifications)
frontend/src/App.jsx         → Route definitions, top-level layout
frontend/src/main.jsx        → Entry point
```

## 2. API Client Rule (Non-Negotiable)

- `frontend/src/api/client.js` is the only place that knows the backend base URL and performs `fetch`.
- Components/pages call typed methods exported from `client.js` (e.g., `client.evaluations.list(scopeParams)`), never `fetch` directly.
- This keeps auth-token attachment, error normalization, and base-URL/env handling in one place.

## 3. Pages (Proposed Inventory)

| Page | Purpose | Primary Role(s) |
|---|---|---|
| `LoginPage` | Authentication | all |
| `DashboardPage` | Role-specific landing summary | all |
| `AcademicStructurePage` | Manage departments/subjects/years | Admin |
| `AssignmentsPage` | Manage Paper Checker assignments/deadlines | Admin |
| `QuestionPaperListPage` / `QuestionPaperEditorPage` | Author/review papers | Paper Checker, Admin |
| `AnswerPaperUploadPage` | Upload scripts | Paper Checker, Admin |
| `EvaluationQueuePage` / `EvaluationReviewPage` | Human review of AI suggestions | Paper Checker |
| `AnalyticsDashboardPage` | Charts + AI inference (clearly labeled) | Paper Checker, Admin |
| `QueryQueuePage` / `QueryDetailPage` | Student query triage/response | Admin, Paper Checker |
| `StudentResultsPage` | View own results | Student |
| `StudentQuerySubmitPage` | Submit a query | Student |
| `AuditLogPage` | Review audit trail | Admin |
| `AIAssistantPanel` | MCP-backed assistant chat | Admin, Paper Checker (post-MVP) |

## 4. Context Providers

- `AuthContext` — current user, token, login/logout.
- `ScopeContext` — resolved role + assignment scope (mirrors backend-resolved scope; used only for UI convenience, never trusted as the authorization source — backend always re-checks).
- `NotificationContext` — toast/banner system for async operation results (upload progress, evaluation status changes).

## 5. Protected Routes

- A `ProtectedRoute` wrapper component checks `AuthContext` for a valid session and, where applicable, a required role, redirecting to `LoginPage` otherwise.
- This is UX convenience only (per `04-user-roles-and-access-control.md` §5) — every API call the page makes is independently authorized server-side.

## 6. Loading & Error States

- Every page that calls the API client handles three states explicitly: loading, error, success — no silent blank states.
- Long-running operations (upload, AI evaluation) surface async status via polling or, 🟡 proposed, websocket/SSE updates rather than a spinner with no feedback.

## 7. Forms & File Upload

- Forms use controlled components; validation errors surfaced inline, mirroring backend Pydantic validation messages where possible.
- File upload components (answer papers, question paper attachments) show progress and validate file type/size client-side as a UX nicety — the backend validation (`17-file-upload-and-document-processing.md`) remains authoritative.

## 8. Dashboards & Charts

- Analytics dashboards visually distinguish **Observed Evidence** vs **AI Inference/Recommendation** sections (per `09-ai-analytics-and-learning-insights.md`) — never rendered in a single undifferentiated chart.

## 9. AI Assistant UI (Post-MVP)

- A chat-style panel that sends user messages to the backend, which brokers to the MCP server; the frontend never talks to MCP or Hugging Face directly — everything flows through `api/client.js` → backend.

## Open Questions
- ❓ Real-time update mechanism (polling vs SSE/websocket) for long-running evaluation jobs.
- ❓ Charting library selection for the analytics dashboard.
