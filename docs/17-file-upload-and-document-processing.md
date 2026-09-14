# 17 — File Upload and Document Processing

## Status
🟢 Confirmed (untrusted-input principle) · 🟡 Proposed (OCR engine, storage backend)

## 1. Principle

> Answer papers are sensitive academic documents. Treat uploaded files as untrusted input.

Every upload — regardless of uploader role — passes through the same validation pipeline before being trusted for processing.

## 2. Supported File Types (Proposed)

- PDF (multi-page)
- Image formats: JPEG, PNG
- 🟡 Open Question: whether scanned multi-file batch uploads are combined server-side or must be pre-combined by the uploader.

## 3. Validation

- MIME-type check (not just file extension).
- Size limit per file and per answer paper (🟡 exact limits Open Question).
- Page-count sanity bound for PDFs.
- 🟡 Proposed: malware/corruption scan before any processing touches the file content.

## 4. Storage

- Files stored under a UUID-derived path, never the original filename, to avoid path traversal and collision issues.
- Metadata (original filename, uploader, timestamp, linked `answer_paper_id`) stored separately in `answer_papers`/`answer_pages`.
- 🟡 Proposed: local volume for MVP/dev, S3-compatible object storage for production (see `24-deployment-and-infrastructure.md`).

## 5. OCR / Extraction

- Extraction output stored as a distinct record from any downstream interpretation (see `07-answer-paper-processing-and-evaluation.md` §2.4) so OCR quality can be audited/debugged independently.
- Engine selection: ❓ Open Question.

## 6. Page Handling

- Each page is tracked individually (`answer_pages`) to support page-level re-scan/replacement without discarding an entire script's processing state.

## 7. Corruption & Malicious Files

- Corrupted files fail validation with a specific error; nothing is silently skipped or partially processed.
- Malicious files (e.g., crafted PDFs attempting exploit payloads) are mitigated by: MIME validation, size/page bounds, and running extraction in an isolated worker process/container rather than the main API process (🟡 proposed hardening).

## 8. Retention

- 🟡 Open Question: retention period for original uploaded files vs. extracted text after an academic term closes (balances audit/dispute-resolution needs against storage/privacy minimization).

## 9. Access Control

- File retrieval endpoints re-check the caller's scope exactly as any other scoped resource (`04-user-roles-and-access-control.md`) — a signed/expiring URL, if used, is still gated by an authorization check at issuance, never a permanently public link.

## Open Questions
- ❓ OCR engine.
- ❓ Storage backend (local vs S3-compatible) and retention policy.
- ❓ Malware scanning tool.
- ❓ Whether extraction runs in an isolated process/container per file.
