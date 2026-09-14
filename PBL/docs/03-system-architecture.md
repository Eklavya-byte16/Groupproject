# 03 — System Architecture

## Status
🟢 Confirmed (component list, technology stack) · 🟡 Proposed (exact worker topology, pgvector usage)

## 1. Logical Architecture

```mermaid
flowchart TB
    subgraph Users
        Admin
        PaperChecker[Paper Checker]
        Student
    end

    Admin --> FE[React Frontend - Vite]
    PaperChecker --> FE
    Student --> FE

    FE -->|fetch via api/client.js| API[FastAPI Application]

    subgraph Backend
        API --> AuthMW[Auth/RBAC Dependency Layer]
        AuthMW --> Routes[api/routes/*]
        Routes --> Services[services/*]
        Services --> DB[(PostgreSQL + pgvector)]
        Services --> AIProvider[AI Provider Abstraction]
        Services --> Workers[workers/* async jobs]
        AIProvider --> HF[Hugging Face Models/APIs]
        Services --> MCP[MCP Server]
        MCP --> Tools[Permission-checked MCP Tools]
        Tools --> DB
        Workers --> Email[Email Provider]
        Workers --> DB
    end
```

## 2. Component Responsibilities

| Component | Responsibility |
|---|---|
| React Frontend | UI rendering, routing, calling backend only through `api/client.js` |
| FastAPI Application | HTTP entrypoint, request lifecycle |
| Auth/RBAC Dependency Layer | Authentication + role/scope authorization on every protected route |
| `api/routes/*` | Thin HTTP handlers: parse/validate request, call service, return schema |
| `services/*` | Business logic, orchestration, transactions |
| `db/models/*` | SQLAlchemy ORM models (persistence shape) |
| `schemas/*` | Pydantic request/response contracts |
| `workers/*` | Async/background jobs (OCR, AI evaluation, email delivery, analytics rollups) |
| AI Provider Abstraction | Decouples services from a specific Hugging Face model/endpoint |
| MCP Server | Exposes controlled tools to the AI assistant; enforces per-call authorization |
| PostgreSQL (+ optional pgvector) | System of record; vector search for question-bank similarity/duplicate detection (🟡 proposed) |
| Email Provider | Abstracted inbound/outbound email integration |

## 3. Runtime Architecture (Docker Compose)

See `24-deployment-and-infrastructure.md` for full detail. Summary: `frontend`, `backend`, `db` (PostgreSQL), and optionally a `worker` service, all defined in `docker-compose.yml` at repo root.

## 4. Request Flow (synchronous)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant FE as React Frontend
    participant API as FastAPI Route
    participant AuthDep as Auth/RBAC Dependency
    participant Svc as Service Layer
    participant DB as PostgreSQL

    U->>FE: Interacts with page
    FE->>API: fetch() via api/client.js
    API->>AuthDep: Validate token, resolve role+scope
    AuthDep-->>API: Authorized principal
    API->>Svc: Call service function with validated schema
    Svc->>DB: Query/persist via SQLAlchemy
    DB-->>Svc: Rows
    Svc-->>API: Domain result
    API-->>FE: Pydantic response schema (JSON)
    FE-->>U: Rendered UI
```

## 5. AI Evaluation Flow (asynchronous)

```mermaid
sequenceDiagram
    participant Svc as Evaluation Service
    participant W as Worker
    participant AI as AI Provider (Hugging Face)
    participant DB as PostgreSQL

    Svc->>DB: Create evaluation job (status=pending)
    Svc->>W: Enqueue job
    W->>DB: Fetch answer + marking scheme + rubric
    W->>AI: Construct prompt, request structured output
    AI-->>W: Structured evaluation + confidence
    W->>DB: Persist AI suggestion (status=ai_suggested)
    alt confidence below threshold
        W->>DB: Flag mandatory_human_review = true
    end
    Note over Svc,DB: Human reviewer later confirms/adjusts via API
```

## 6. Data Flow Summary

- **Write path:** Frontend → API → Service → SQLAlchemy → PostgreSQL.
- **AI path:** Service enqueues → Worker → AI Provider → structured result persisted → human review gate.
- **MCP path:** AI assistant → MCP tool call → permission check against caller's role/scope → read-only query against Service/DB layer → result returned to assistant context.
- **Notification path:** Service/Worker → Email Provider abstraction → delivery + retry + audit.

## 7. External Integration Flow

```mermaid
flowchart LR
    Backend -->|HTTPS| HuggingFace[Hugging Face Inference API]
    Backend -->|SMTP/API| EmailProvider[Email Provider]
    Backend -->|MCP protocol| MCPClient[MCP-compatible AI Assistant Client]
```

## 8. Why This Shape

- Business logic isolated in `services/` keeps routes thin and testable, and keeps AI/DB coupling out of the HTTP layer.
- The AI Provider abstraction (see `08-ai-evaluation-engine.md`) means a Hugging Face model can be swapped without touching services or routes.
- MCP tools sit behind the same authorization primitives as the REST API — no parallel, weaker permission path.
- Async workers keep OCR/AI calls off the request/response cycle, satisfying NFR-PERF-002.

## Open Questions
- ❓ Task queue technology for `workers/` (e.g., Celery, arq, RQ) — not yet selected.
- ❓ Whether pgvector is required for MVP or deferred to question-bank duplicate detection phase.
