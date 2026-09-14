# 20 — Audit Logging and Accountability

## Status
🟢 Confirmed (principle, event categories) · 🟡 Proposed (exact schema)

## 1. Principle

> Deadline and accountability logic should be transparent. Do not automatically punish users based solely on algorithmic decisions.

Audit logging exists to answer, after the fact, exactly what happened, who did it, and — where AI was involved — what the AI suggested versus what a human decided.

## 2. What Must Be Auditable

| Question | Event |
|---|---|
| Who uploaded a paper? | `answer_paper.uploaded` |
| Who evaluated it? | `evaluation.human_reviewed`, `evaluation.finalized` |
| What AI model evaluated it? | `ai_execution_records` linked to `evaluation.ai_suggested` (model identifier + prompt version) |
| What marks did AI suggest? | Stored on the `ai_execution_records`/`evaluations` row itself, immutable once written |
| What marks did the teacher finalize? | `evaluation.finalized` (records final marks + reviewer identity) |
| Who changed the result? | Any `evaluation.*` event carries `actor_user_id` |
| Who assigned a paper? | `assignment.created` / `assignment.updated` |
| Who changed a deadline? | `deadline.updated` |
| Who reviewed a student query? | `query.reviewed`, `query.responded`, `query.priority_overridden` |

## 3. Audit Event Schema (Proposed)

```json
{
  "id": "uuid",
  "occurred_at": "timestamp",
  "actor_user_id": "uuid | null (null for system/worker-initiated events)",
  "actor_role": "string",
  "event_type": "string (dot-namespaced, e.g. evaluation.finalized)",
  "resource_type": "string",
  "resource_id": "uuid",
  "scope": {"department_id": "uuid", "subject_id": "uuid", "academic_year_id": "uuid"},
  "before": "object | null",
  "after": "object | null",
  "ai_execution_record_id": "uuid | null"
}
```

## 4. Immutability

- `audit_logs` is append-only. No application code path updates or deletes an existing audit row.
- Corrections to academic data (e.g., a re-evaluation after a dispute) create *new* rows/events; they never rewrite history.

## 5. AI Accountability Chain

Every AI-influenced decision maintains a traceable chain:

```text
ai_execution_records (model + prompt version + raw output + confidence)
        ↓ referenced by
evaluations.ai_execution_record_id  OR  query_classifications.ai_execution_record_id
        ↓ reviewed/confirmed by
audit_logs (actor_user_id = the human who accepted/adjusted it)
```

This means any finalized mark or query priority can always be traced back to (a) exactly which model/prompt produced the AI suggestion, and (b) exactly which human confirmed or changed it.

## 6. Deadlines & Accountability — Explicit Guardrail

- Overdue status is visible and factual (`deadline.overdue` event), but the system does not automatically apply penalties, restrict access, or take disciplinary action based solely on an overdue flag or an AI-derived signal.
- Any consequence tied to a missed deadline is a human (Admin) decision, recorded as its own distinct audited action — never an automated side effect.

## 7. Access to Audit Logs

- Restricted to Admin (`04-user-roles-and-access-control.md` permission matrix).
- 🟡 Proposed: read-only export capability for institutional compliance reviews.

## Open Questions
- ❓ Retention period for audit logs (likely longer than operational data retention).
- ❓ Whether audit logs require external/immutable storage (e.g., write-once storage) beyond database-level append-only discipline.
