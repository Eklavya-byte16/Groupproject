# 21 — AI Reliability and Human Review

## Status
🟢 Confirmed (principle: mandatory human review triggers) · 🟡 Proposed (exact thresholds/formulas)

## 1. Known Failure Modes

- **Hallucination** — AI invents rubric criteria or facts not present in the marking scheme.
- **Inconsistent scoring** — near-identical answers receive different marks across separate model calls.
- **Model bias** — systematic over/under-scoring for certain answer styles, lengths, or phrasing.
- **OCR mistakes** — misread handwriting/text corrupts the input the AI evaluates against.
- **Ambiguous answers** — genuinely unclear or partially-correct answers where even human graders would disagree.
- **Ambiguous questions** — a poorly-worded question makes any evaluation (human or AI) unreliable at the source.

## 2. Confidence

- Every AI evaluation and every query-seriousness classification carries a confidence value (see `08-ai-evaluation-engine.md` §6, `10-student-query-and-seriousness-analysis.md` §3).
- Confidence is a **self-assessment signal**, not a guarantee — it informs routing (auto-queue vs. mandatory review), never bypasses human confirmation for final marks entirely.

## 3. When AI MUST Request Human Review (Non-Negotiable Triggers)

An evaluation is routed to **mandatory** review (cannot be bulk-accepted by a reviewer without opening it) when any of:
1. Confidence below the configured threshold.
2. The model's own output includes a flag (`ambiguous_answer`, `illegible_text`, `rubric_mismatch`).
3. A model call failed and a fallback/manual path was used.
4. The marking scheme was missing/incomplete at evaluation time.
5. OCR extraction confidence for the underlying answer was itself low.

Query seriousness classification analogously never *removes* a query from the human queue regardless of confidence (`10-student-query-and-seriousness-analysis.md` §4).

## 4. Overrides

- A human reviewer can override any AI suggestion (mark or priority) at any time; the override is captured in `audit_logs` with both the original AI value and the human-set value preserved (`20-audit-logging-and-accountability.md` §5).

## 5. Reproducibility

- `ai_execution_records` stores the model identifier and prompt/template version alongside every output, so a given evaluation can be explained (and, if needed, re-run for comparison) against exactly the model/prompt state that produced it.
- Prompt templates are version-controlled; a prompt change is a reviewable code change, not a silent runtime edit.

## 6. Model & Prompt Versioning

- 🟡 Proposed: `model_version` and `prompt_version` are explicit fields, incremented deliberately; historical `ai_execution_records` remain tied to the version active at the time, even after the active version changes.

## 7. Evaluation Datasets (Proposed)

- 🟡 A held-out set of previously human-graded answer/mark pairs, used to periodically sanity-check AI evaluation quality after any model or prompt change, before rolling the change out broadly.

## 8. Relationship to Human Authority Principle

This document operationalizes the governing rule that final academic marks, disciplinary action, and query dismissal remain human-controlled (see `05` workflows 8–9 and `10` §4). AI's role throughout is: recommend, classify, summarize, detect, prioritize, draft — never silently final.

## Open Questions
- ❓ Exact confidence threshold value(s) per evaluation type.
- ❓ Composition and refresh cadence of the evaluation dataset used for quality sanity-checks.
- ❓ Formal process for approving a model/prompt version change before production rollout.
