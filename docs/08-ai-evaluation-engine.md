# 08 — AI Evaluation Engine

## Status
🟢 Confirmed (abstraction requirement, human-review-gate principle) · 🟡 Proposed (specific model, prompt templates, confidence formula)

## 1. Why an Abstraction Layer

Business logic must never call a specific Hugging Face model directly. All AI-dependent services depend on an `AIProvider` interface:

```python
# backend/app/services/ai/provider.py  (conceptual — file layout is proposed)
class AIProvider(Protocol):
    def evaluate_answer(self, context: EvaluationContext) -> EvaluationResult: ...
    def score_query_seriousness(self, context: QueryContext) -> SeriousnessResult: ...
    def detect_weak_topics(self, context: AnalyticsContext) -> WeakTopicResult: ...
    def draft_response(self, context: DraftContext) -> DraftResult: ...
```

A `HuggingFaceProvider` implements this interface. Swapping models/vendors later means writing a new implementation of `AIProvider`, not touching `services/`.

## 2. Model Selection Criteria (Proposed)

- Task-appropriate (text classification for seriousness scoring vs. generative for evaluation/drafting).
- Supports structured/constrained output (JSON mode or reliable prompt-enforced structure).
- Deployable within institutional data-handling constraints (self-hosted vs. hosted inference — Open Question).

## 3. Evaluation Data Flow

```text
Input (student answer + rubric + question)
↓
Validation (non-empty, matched question, rubric present)
↓
Preprocessing (normalize OCR text, strip artifacts)
↓
Context Retrieval (marking scheme, learning outcome, prior similar evaluations if used for calibration)
↓
Prompt Construction (structured template — see §4)
↓
Hugging Face Model Call (via AIProvider)
↓
Structured Output (marks per criterion + rationale + confidence)
↓
Validation (schema check, marks within bounds, criterion coverage)
↓
Confidence Threshold Check
↓
Human Review Decision (auto-queue vs mandatory-review)
↓
Persistence (ai_execution_records + evaluations)
```

## 4. Prompt Architecture (Conceptual)

The prompt sent to the model is assembled from:

1. **System framing** — instructs the model to grade strictly against the provided rubric, output structured JSON, and never invent rubric criteria.
2. **Question + marking scheme** — the authoritative rubric/marking scheme text, injected verbatim.
3. **Student answer** — the OCR-extracted, cleaned answer text.
4. **Output contract** — an explicit schema the model must fill (see §5).

The rubric is always injected as data, never merged into a single freeform instruction — this both improves consistency and is a prompt-injection mitigation (a student's answer text cannot alter grading instructions because instructions and data are structurally separated).

## 5. Structured Output Contract (Proposed)

```json
{
  "criterion_scores": [
    {"criterion_id": "string", "awarded": "number", "max": "number", "rationale": "string"}
  ],
  "total_awarded": "number",
  "total_max": "number",
  "confidence": "number (0-1)",
  "flags": ["ambiguous_answer", "illegible_text", "rubric_mismatch"]
}
```

Every field is validated against a Pydantic schema in `backend/app/schemas/`. A response that fails schema validation is treated as a model failure (see §7), not silently coerced.

## 6. Confidence Scoring (Proposed, Open Question on exact formula)

Conceptually a function of:
- Model's own self-reported certainty (if supported by the model/prompting technique).
- Presence of `flags` such as `ambiguous_answer` or `illegible_text`.
- Upstream OCR extraction confidence (low OCR confidence caps the evaluation confidence).

## 7. Retry Behavior & Model Failures

- Transient failures (timeout, rate limit): retried with exponential backoff, capped at N attempts (🟡 N to be decided).
- Schema-invalid output: one re-prompt attempt with stricter formatting instructions; if it fails again, treated as a hard failure.
- Hard failure: evaluation marked `ai_unavailable`; routed to full manual evaluation. This must never block the pipeline (NFR-REL-001) and must never silently assign a default mark.

## 8. Human Review Triggers

An evaluation is routed to **mandatory** human review (cannot be bulk-accepted) when any of:
- Confidence below the configured threshold.
- Any `flags` entry present (`ambiguous_answer`, `illegible_text`, `rubric_mismatch`).
- Model failure/fallback occurred.
- Marking scheme was missing or incomplete for the matched question.

## 9. Why an LLM Alone Must Not Decide Marks

- LLMs can hallucinate criteria not present in the rubric, misjudge partial credit, or be inconsistent across near-identical answers.
- OCR errors compound model uncertainty — a misread word can flip an evaluation.
- Academic marks carry consequences (grades, standing) that require accountable human sign-off (see `21-ai-reliability-and-human-review.md` and `44` in the governing principles — human authority over final marks).
- The engine therefore always produces a *suggestion*, never a *final mark*; `evaluations.finalized_at` is only set after explicit human confirmation.

## Open Questions
- ❓ Specific Hugging Face model(s) for evaluation.
- ❓ Self-hosted vs hosted inference.
- ❓ Exact confidence formula and threshold value.
- ❓ Max retry count and backoff parameters.
