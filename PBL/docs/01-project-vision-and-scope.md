# 01 — Project Vision and Scope

## Status
🟢 Confirmed (vision, goals, non-goals) · 🟡 Proposed (MVP boundary, future scope items)

## 1. The Problem

Academic examination workflows in most institutions are manual, paper-heavy, and slow:

- Question papers are authored in isolation, without a shared question bank, syllabus mapping, or duplicate detection.
- Answer-paper checking is entirely manual: a single faculty member reads, interprets, and grades each script with no second layer of consistency checking.
- There is no structured record of *why* a mark was given, so disputes and re-evaluation requests are hard to resolve.
- Departments have no aggregate visibility into which topics or learning outcomes students are consistently failing.
- Student academic queries (about marks, doubts, grievances) arrive over email or in person with no triage — urgent issues and routine ones receive the same handling latency.
- Deadlines for paper submission, checking, and result publication are tracked informally (spreadsheets, verbal reminders), with no accountability trail.

## 2. Current Academic Workflow (as-is)

```text
Admin assigns subject → Faculty authors paper (offline) → Manual review →
Exam conducted → Answer scripts collected physically/digitally →
Faculty manually evaluates → Marks entered into a spreadsheet or portal →
Results published → Students email queries → Faculty manually triages →
Ad-hoc response
```

Problems with this workflow:

- No structured audit trail of who did what, when.
- No consistency checking across evaluators.
- No systemic analytics on student learning gaps.
- No prioritization of urgent student queries.
- No reusable question bank or duplicate detection.

## 3. Project Vision

Build an **AI-assisted academic examination platform** where AI augments — but never replaces — academic authority. AI performs first-pass evaluation, drafts, classification, and analytics; humans retain final say over marks, approvals, and any consequential decision.

> **Core principle:** AI assists academic staff; it does not blindly replace academic authority. Final academic decisions must remain under authorized human control.

## 4. System Goals

- G1 — Centralize question-paper authoring, review, and versioning.
- G2 — Provide AI-assisted first-pass evaluation of answer papers with mandatory human review paths.
- G3 — Produce topic/unit/department-level analytics distinguishing observed evidence from AI inference.
- G4 — Triage student queries by AI-assessed seriousness without ever auto-dismissing a student.
- G5 — Give paper checkers and admins an MCP-based AI assistant restricted to permission-checked tools.
- G6 — Maintain a complete audit trail for every academically consequential action.
- G7 — Enforce role- and scope-based authorization at the backend, not just the UI.

## 5. Non-Goals

- Not a Learning Management System (no course content delivery, no video lectures).
- Not a fully autonomous grading system — AI never has unchecked final authority over marks.
- Not a general-purpose email/helpdesk platform beyond academic query handling.
- Not building a custom OCR engine — will integrate an existing OCR solution (see Open Questions in 17-file-upload-and-document-processing.md).

## 6. Major Capabilities

| Capability | Status |
|---|---|
| Question paper authoring, mapping, versioning | 🟢 MVP |
| Answer paper upload + OCR + segmentation | 🟢 MVP |
| AI-assisted evaluation with confidence scoring | 🟢 MVP |
| Human review & override of AI marks | 🟢 MVP |
| Departmental analytics & weak-topic detection | 🟡 Post-MVP |
| Student query ingestion + seriousness scoring | 🟡 Post-MVP |
| MCP AI assistant | 🟡 Post-MVP |
| Email/notification system | 🟢 MVP (outbound), 🟡 (inbound query ingestion) |
| AI question generation | ⚪ Future |
| Student-facing self-service portal (full) | ⚪ Future |

## 7. Intended Users

- **Admin** — institutional/departmental administrator.
- **Paper Checker** (departmental academic staff) — authors and evaluates papers within an assigned scope.
- **Student** — architected for from day one, though the initial release may expose a reduced student-facing surface (e.g., query submission and result viewing only).

## 8. System Boundaries

In scope: question-paper lifecycle, answer-paper evaluation lifecycle, analytics, student query handling, AI assistant, notifications, auth, audit.

Out of scope: institutional ERP, fee/finance systems, attendance, timetabling, plagiarism detection for non-exam submissions.

## 9. MVP (Proposed)

1. Auth + RBAC + scope model
2. Academic structure (departments, subjects, academic years, assignments)
3. Question paper authoring/review/approval
4. Answer paper upload + AI evaluation + mandatory human review
5. Basic audit logging

## 10. Future Scope

- Advanced analytics dashboards with concept clustering
- MCP-based AI assistant
- AI question generation
- Full student self-service portal
- Multi-institution / multi-tenant support

## 11. Assumptions

- Institution provides authoritative source data for departments/subjects/academic years (imported or manually created by Admin).
- Hugging Face-hosted or self-hosted models are reachable from the backend environment.
- Answer papers are submitted as scanned/digital PDFs or images.

## 12. Constraints

- Must operate within the existing repository structure (see hard constraint in project master prompt).
- Must use the confirmed technology stack; no unjustified new dependencies.
- All configuration must flow through `backend/app/core/config.py`.

## Open Questions

- ❓ What is the exact scope of the student-facing surface for MVP?
- ❓ Is multi-institution support ever in scope, even long-term?
