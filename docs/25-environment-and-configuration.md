# 25 — Environment and Configuration

## Status
🟢 Confirmed (single-source-of-config rule) · 🟡 Proposed (exact variable list — grows as features land)

## 1. The Rule

All configuration is sourced through:

```python
# backend/app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ...

settings = Settings()
```

Consumed as:

```python
from app.core.config import settings
```

Never:
- a second config module,
- direct `os.environ` reads in application code,
- hardcoded environment-specific values (URLs, keys, thresholds).

## 2. Environments

- **development** — local Docker Compose, `backend/.env` from `backend/.env.example`.
- **testing** — CI environment, isolated test database, `AIProvider`/`EmailProvider` typically mocked.
- **production** — see `24-deployment-and-infrastructure.md`.

## 3. Proposed Variable Catalog (grows over time — keep in sync with `config.py`)

| Variable | Purpose | Environment(s) |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | all |
| `SECRET_KEY` / `JWT_SECRET` | Token signing (pending `18-authentication-and-authorization.md` decision) | all |
| `TOKEN_EXPIRY_MINUTES` | Session/token idle expiry (`FR-AUTH-003`) | all |
| `HUGGINGFACE_API_KEY` | Hugging Face inference credential | dev/prod (mocked in test) |
| `HUGGINGFACE_EVAL_MODEL` | Model identifier for answer evaluation | dev/prod |
| `AI_CONFIDENCE_THRESHOLD` | Mandatory-review cutoff (`08`, `21`) | all |
| `EMAIL_PROVIDER` | Which `EmailProvider` implementation to load | dev/prod |
| `EMAIL_CREDENTIALS_*` | Provider-specific credentials | dev/prod |
| `FILE_STORAGE_BACKEND` | `local` vs `s3` (`17`) | dev/prod |
| `FILE_STORAGE_PATH` / `S3_BUCKET` | Storage location | dev/prod |
| `MAX_UPLOAD_SIZE_MB` | Upload validation limit (`17`) | all |
| `QUERY_PRIORITY_ESCALATION_HOURS` | SLA escalation threshold (`10`) | all |
| `MCP_ENABLED` | Feature flag for MCP server (`11`) | dev/prod, post-MVP |

Exact final list must be verified against the current `backend/app/core/config.py` — this table is a living reference, not the source of truth.

## 4. Secrets

- Never committed to source control.
- `backend/.env.example` documents required variable *names* with placeholder/empty values, never real secrets.
- Production secrets sourced from the hosting platform's secret manager (🟡 specific mechanism Open Question).

## 5. Feature Flags (Proposed)

- Larger, still-evolving features (MCP assistant, analytics inference layer, email ingestion) are gated behind config-driven flags so they can be deployed disabled until ready, without branching the codebase.

## Open Questions
- ❓ Secret manager for production (cloud provider-specific vs. self-hosted vault).
- ❓ Full final variable list (to be reconciled against `config.py` as each phase in `23-development-roadmap.md` lands).
