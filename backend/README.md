# AI Faculty Assistant — FastAPI Backend

Current milestone: **Phase 5B — Grounded RAG Reference Answer Pipeline**.

## Completed phases

- Phase 1 — Foundation / authentication
- Phase 2 — Exam management
- Phase 3 — Knowledge document ingestion foundation
- Phase 4 — Deterministic theoretical question-paper ingestion and validation
- Phase 5A — Hugging Face LLM abstraction + structured Reference Answer Agent
- Phase 5B — Real BGE embeddings + pgvector retrieval + grounded evidence

## Phase 5A / 5B

The reference-answer pipeline is now grounded in exam-scoped faculty knowledge:

```text
Question
   |
   v
BAAI/bge-small-en-v1.5 embedding
   |
   v
PostgreSQL + pgvector cosine retrieval
   |
   v
Relevant syllabus / notes / sample-answer chunks
   |
   v
ReferenceAnswerAgent
   |
   v
Hugging Face LLM
   |
   v
Teacher-reviewable reference answer + evidence
```

Phase 5B stores 384-dimensional real embeddings, preserves source file and PDF page metadata, uses an HNSW cosine index, and returns retrieved evidence alongside the generated answer. Uploaded document text is treated as untrusted reference material; instructions inside documents are not treated as system instructions.

### Hugging Face configuration

```env
HF_TOKEN=hf_...
HF_PROVIDER=auto
LLM_MODEL=meta-llama/Llama-3.1-8B-Instruct
LLM_TIMEOUT_SECONDS=60
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
EMBEDDING_DIMENSIONS=384
EMBEDDING_TIMEOUT_SECONDS=60
RAG_TOP_K=5
RAG_MIN_SIMILARITY=0.15
```

### Phase 5B APIs

Knowledge upload expects multipart field `files`:

```bash
curl -X POST "http://localhost:8000/api/v1/exams/$EXAM_ID/knowledge" \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@/e/Projects/PBL/test_data/oop_notes.pdf" \
  -F "type=theory_notes"
```

Test retrieval directly:

```bash
curl -X POST "http://localhost:8000/api/v1/exams/$EXAM_ID/knowledge/search" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"Explain abstraction and encapsulation", "top_k":5}'
```

Generate a grounded reference answer:

```bash
curl -X POST "http://localhost:8000/api/v1/exams/$EXAM_ID/questions/$QUESTION_ID/reference-answer/draft" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"top_k":5}'
```

The `academic_context` field remains optional as supplemental teacher context for backwards compatibility; retrieval from the exam knowledge base is now automatic.
