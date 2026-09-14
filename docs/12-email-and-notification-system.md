# 12 — Email and Notification System

## Status
🟢 Confirmed (outbound notification requirement, provider abstraction) · 🟡 Proposed (inbound email ingestion, specific provider)

## 1. Scope

- **Outbound:** deadline reminders, assignment change notices, result publication notices, query responses.
- **Inbound:** 🟡 Proposed — student query submission via email (see `10-student-query-and-seriousness-analysis.md`).

## 2. Provider Abstraction

```python
# backend/app/services/notifications/provider.py (conceptual)
class EmailProvider(Protocol):
    def send(self, message: OutboundEmail) -> DeliveryResult: ...
    def fetch_inbound(self) -> list[InboundEmail]: ...  # if inbound is enabled
```

No specific provider (SMTP relay, SendGrid, SES, etc.) is assumed in business logic; a concrete implementation is selected in `backend/app/core/config.py`-driven configuration. **This is an Open Question**, not a decision.

## 3. Templates

- Notifications use named templates (e.g., `deadline_reminder`, `result_published`, `query_response`) with variable substitution, stored under a templates directory (🟡 exact location proposed: `backend/app/services/notifications/templates/`).
- Templates are versioned in source control; changes go through normal code review, not ad-hoc edits.

## 4. Retry & Failure Handling

- Failed sends are retried with exponential backoff up to a configured max attempt count.
- After exhausting retries, the notification is marked `failed` and surfaced to Admin (does not silently disappear).
- **NFR-REL-002:** notification failures never block the underlying academic workflow (e.g., a failed "result published" email does not prevent the result from being published).

## 5. Identity Matching (Inbound)

- Inbound email sender address is matched against known student/staff email addresses.
- Unmatched senders are queued for manual identity resolution rather than silently dropped or auto-assumed.

## 6. Security

- Outbound emails never include sensitive academic content beyond what the recipient is authorized to see (e.g., a result notification goes only to the student it concerns).
- Inbound attachments are treated as untrusted input, subject to the same validation as answer-paper uploads (`17-file-upload-and-document-processing.md`).
- Credentials for the email provider are sourced exclusively from `backend/app/core/config.py` / environment configuration — never hardcoded.

## 7. Attachments

- Outbound: none by default beyond what's explicitly generated (e.g., a report PDF, if requested).
- Inbound: 🟡 Proposed — supported for query submissions (e.g., a student attaching a screenshot); subject to file validation.

## 8. Audit Trail

- Every notification attempt (send or inbound receipt) is recorded: recipient/sender, template/subject, delivery status, timestamp, and — for inbound — the resulting `query` record it was linked to, if any.

## Open Questions
- ❓ Concrete email provider (SMTP vs SendGrid/SES/etc.).
- ❓ Inbound email ingestion mechanism and timeline (IMAP polling vs provider webhook).
- ❓ Template storage location/format finalization.
