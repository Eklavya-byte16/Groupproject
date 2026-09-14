# 19 — Security and Data Privacy

## Status
🟢 Confirmed (threat categories, general mitigations) · 🟡 Proposed (specific tools/thresholds)

## 1. Threat Model Overview

| Threat | Mitigation | Status |
|---|---|---|
| Broken authentication | Strong password hashing, token expiry, rate-limited login | 🟡 |
| Broken authorization / scope bypass | Server-side role+scope check on every route and service call (never UI-only) | 🟢 |
| SQL injection | SQLAlchemy parameterized queries exclusively; no raw string-built SQL | 🟢 |
| XSS | React's default escaping; no `dangerouslySetInnerHTML` with unsanitized content; backend validates/encodes any user content later rendered | 🟢 |
| CSRF | 🟡 Applicable primarily if session cookies are used; if bearer-token-in-header auth is chosen, CSRF risk is reduced — final posture depends on `18-authentication-and-authorization.md` token decision |
| Malicious file upload | MIME validation, size/page bounds, isolated extraction processing (`17-file-upload-and-document-processing.md`) | 🟡 |
| Prompt injection (via answer text, query text) | Structural separation of instructions vs. data in prompts (`08-ai-evaluation-engine.md` §4); MCP tool outputs treated as data, not instructions (`11-mcp-ai-assistant.md` §6) | 🟢 principle / 🟡 implementation |
| Model manipulation (adversarial answer text aiming to inflate AI marks) | Structured output validation, confidence flags, mandatory human review for flagged/low-confidence cases | 🟢 |
| Data leakage across scope | Scope re-validation at service layer on every resource access | 🟢 |
| Secret exposure | All secrets sourced from `backend/app/core/config.py`/environment, never hardcoded or logged | 🟢 |
| API abuse / scraping | Rate limiting | 🟡 |
| Email spoofing (inbound query ingestion) | Identity matching with manual fallback for unmatched senders; SPF/DKIM verification where provider supports it | 🟡 |

## 2. Sensitive Academic Information

- Marks, evaluation rationale, and query content are treated as sensitive personal academic data.
- Visibility strictly bound by role + scope (`04-user-roles-and-access-control.md`).
- AI prompts sent to Hugging Face include only the minimum necessary content (rubric + answer text) — not full student PII (`NFR-PRIV-002`).

## 3. Rate Limiting

- 🟡 Proposed at minimum on: login endpoint, query submission endpoint, MCP tool invocation — exact limits are an Open Question.

## 4. Email Security

- Outbound: recipient scoping strictly enforced (never CC/BCC broader distribution than the intended recipient).
- Inbound: attachments validated per `17-file-upload-and-document-processing.md`; sender identity matched or queued for manual resolution.

## 5. Audit Logs

- See `20-audit-logging-and-accountability.md` for full detail — audit logs are themselves a security control (detecting misuse after the fact) and must be tamper-resistant (append-only, no update/delete path from application code).

## 6. Backups

- 🟡 Proposed: scheduled PostgreSQL backups with tested restore procedure — exact schedule/retention Open Question, see `24-deployment-and-infrastructure.md`.

## 7. Retention

- See Open Questions in `13-database-data-model.md` and `17-file-upload-and-document-processing.md`.

## 8. Threat Scenarios (Illustrative)

- **Scenario A:** A Paper Checker manipulates a URL/ID to attempt viewing an answer paper outside their assignment scope. → Service-layer scope check returns 403; attempt logged.
- **Scenario B:** A student crafts answer text designed to instruct the AI to award full marks regardless of content. → Prompt structure separates rubric/instructions from student-supplied data; structured-output validation checks marks against rubric bounds; anomalous patterns can be flagged (🟡 proposed heuristic) for mandatory human review.
- **Scenario C:** An uploaded "answer paper" PDF contains an embedded exploit targeting the PDF parser. → File processed in an isolated worker (🟡 proposed), MIME/structure validated before parsing, parser kept updated.

## Open Questions
- ❓ Rate-limiting tool/thresholds.
- ❓ CSRF posture (depends on auth mechanism decision).
- ❓ Backup schedule/retention.
- ❓ Malware scanning tool for uploads.
