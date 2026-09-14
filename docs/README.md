# Documentation Index — AI-Assisted Academic Examination Platform

## Purpose

This `docs/` directory is the single source of truth for the engineering design of the platform. It is written for backend, frontend, AI/ML, database, DevOps, and QA contributors, and for technical leads reviewing architecture. It is **not** a pitch deck or user manual.

Every document distinguishes:

- **Confirmed** — decided and binding on implementation.
- **Proposed** — a recommendation awaiting team sign-off.
- **Future** — out of scope for the current build.
- **Open Question** — a decision the team must still make.

No section should be read as "already built" unless explicitly labeled **Implemented**.

## Architecture Summary

The system is a FastAPI + PostgreSQL backend, a React/Vite frontend, an AI evaluation/analytics layer built on Hugging Face models behind a provider abstraction, and an MCP server exposing permission-checked tools to an AI assistant. Human academic staff retain final authority over marks, approvals, and disciplinary/administrative decisions; AI recommends, classifies, drafts, and prioritizes.

## Documentation Map & Reading Order

```text
Start here
    ↓
01 Project Vision & Scope
    ↓
02 Requirements (FR/NFR)
    ↓
03 System Architecture
    ↓
04 Roles & Access Control
    ↓
05 End-to-End Workflows
    ↓
06 Question Paper Management
    ↓
07 Answer Paper Processing & Evaluation
    ↓
08 AI Evaluation Engine
    ↓
09 AI Analytics & Learning Insights
    ↓
10 Student Query & Seriousness Analysis
    ↓
11 MCP AI Assistant
    ↓
12 Email & Notification System
    ↓
13 Database Data Model
    ↓
14 Backend Architecture
    ↓
15 API Contracts & Endpoints
    ↓
16 Frontend Architecture
    ↓
17 File Upload & Document Processing
    ↓
18 Authentication & Authorization
    ↓
19 Security & Data Privacy
    ↓
20 Audit Logging & Accountability
    ↓
21 AI Reliability & Human Review
    ↓
22 Testing & Quality Strategy
    ↓
23 Development Roadmap
    ↓
24 Deployment & Infrastructure
    ↓
25 Environment & Configuration
    ↓
26 Project Development Conventions
```

| File | Contents |
|---|---|
| `01-project-vision-and-scope.md` | Problem statement, goals, non-goals, MVP, future scope |
| `02-functional-and-nonfunctional-requirements.md` | FR-/NFR- catalog with IDs |
| `03-system-architecture.md` | Logical/runtime architecture, Mermaid diagrams |
| `04-user-roles-and-access-control.md` | Admin / Paper Checker / Student roles, scopes |
| `05-end-to-end-user-workflows.md` | 16 canonical workflows, actor→action→result |
| `06-question-paper-management.md` | Authoring, mapping, versioning, AI generation |
| `07-answer-paper-processing-and-evaluation.md` | Upload → OCR → segmentation → evaluation pipeline |
| `08-ai-evaluation-engine.md` | AIProvider abstraction, prompt architecture, confidence |
| `09-ai-analytics-and-learning-insights.md` | Weak-topic detection, evidence vs inference |
| `10-student-query-and-seriousness-analysis.md` | Query ingestion, priority scoring, escalation |
| `11-mcp-ai-assistant.md` | MCP tools, authorization, prompt-injection defenses |
| `12-email-and-notification-system.md` | Inbound/outbound email, templates, retries |
| `13-database-data-model.md` | Entities, relationships, indexes, pgvector |
| `14-backend-architecture.md` | Mapping to `backend/app/*` |
| `15-api-contracts-and-endpoints.md` | Endpoint catalog by domain |
| `16-frontend-architecture.md` | Mapping to `frontend/src/*` |
| `17-file-upload-and-document-processing.md` | File validation, storage, OCR pipeline |
| `18-authentication-and-authorization.md` | Auth flow, RBAC + scope model |
| `19-security-and-data-privacy.md` | Threat model, mitigations |
| `20-audit-logging-and-accountability.md` | Audit event catalog |
| `21-ai-reliability-and-human-review.md` | Hallucination, confidence thresholds, overrides |
| `22-testing-and-quality-strategy.md` | Test pyramid, critical test cases |
| `23-development-roadmap.md` | Phased implementation plan |
| `24-deployment-and-infrastructure.md` | Docker Compose topology |
| `25-environment-and-configuration.md` | Env vars → `config.py` mapping |
| `26-project-development-conventions.md` | Developer handbook / non-negotiable rules |

## Terminology Conventions

- **Role** — a coarse identity category (Admin, Paper Checker, Student).
- **Scope** — the department/subject/academic-year boundary a role's permissions are constrained to.
- **Service** — a module in `backend/app/services/` containing business logic.
- **Provider** — an abstraction (e.g. `AIProvider`, `EmailProvider`) decoupling business logic from a specific vendor.
- **Confidence** — a numeric AI self-assessment of evaluation reliability, not a guarantee of correctness.

## Status Legend

- 🟢 **Confirmed** — binding
- 🟡 **Proposed** — needs approval
- ⚪ **Future** — out of current scope
- ❓ **Open Question** — unresolved, listed explicitly at the end of the relevant document
