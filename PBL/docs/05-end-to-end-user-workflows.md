# 05 — End-to-End User Workflows

## Status
🟢 Confirmed (workflow list) · 🟡 Proposed (exact backend/service names)

Each workflow follows: **Actor → Action → Backend → Database → AI (if applicable) → Result → Audit**

## 1. Admin Creates Academic Structure
- Actor: Admin
- Action: Creates department, subject, academic year, semester
- Backend: `routes/academic.py` → `services/academic_service.py`
- Database: `departments`, `subjects`, `academic_years`
- AI: none
- Result: Structure available for assignment creation
- Audit: `audit_logs` entry `academic_structure.created`

## 2. Admin Creates Paper-Checker Assignment
- Actor: Admin
- Action: Assigns a Paper Checker to (department, subject, academic_year), sets deadline
- Backend: `routes/assignments.py` → `services/assignment_service.py`
- Database: `assignments`, `deadlines`
- AI: none
- Result: Paper Checker gains scoped access
- Audit: `assignment.created`

## 3. Question Paper Creation
- Actor: Paper Checker
- Action: Authors questions, maps to unit/syllabus/marks/difficulty
- Backend: `routes/question_papers.py` → `services/question_paper_service.py`
- Database: `question_papers`, `questions`
- AI: 🟡 optional duplicate-detection / generation assist
- Result: Draft question paper
- Audit: `question_paper.created`

## 4. Question Paper Review
- Actor: Admin / senior Paper Checker (see Open Question in `04-...`)
- Action: Reviews and approves/rejects draft
- Backend: `services/question_paper_service.py` (status transition)
- Database: `question_papers.status`
- AI: none
- Result: Paper approved or sent back with comments
- Audit: `question_paper.reviewed`

## 5. Exam Completion
- Actor: Admin (marks exam as conducted)
- Action: Updates exam status
- Backend: `services/exam_service.py`
- Database: `examinations`
- AI: none
- Result: Answer-paper upload window opens
- Audit: `exam.completed`

## 6. Answer-Paper Upload
- Actor: Paper Checker/Admin
- Action: Uploads scanned/digital scripts
- Backend: `routes/answer_papers.py` → `services/answer_paper_service.py`
- Database: `answer_papers`
- AI: none at this stage
- Result: Files stored, queued for processing
- Audit: `answer_paper.uploaded`

## 7. AI Evaluation
- Actor: System (worker), triggered post-upload
- Action: OCR → segmentation → AI marking suggestion
- Backend: `workers/evaluation_worker.py` → `services/ai_evaluation_service.py`
- Database: `evaluations`, `ai_execution_records`
- AI: Hugging Face model via `AIProvider`
- Result: Draft marks + confidence per answer
- Audit: `evaluation.ai_suggested`

## 8. Human Review
- Actor: Paper Checker
- Action: Reviews AI suggestion, accepts/adjusts/rejects
- Backend: `routes/evaluations.py` → `services/ai_evaluation_service.py`
- Database: `evaluations.status`, `evaluations.final_marks`
- AI: none (human decision)
- Result: Evaluation confirmed or returned for re-check
- Audit: `evaluation.human_reviewed`

## 9. Final Marks
- Actor: Paper Checker
- Action: Confirms final marks
- Backend: `services/ai_evaluation_service.py`
- Database: `evaluations.finalized_at`
- AI: none
- Result: Marks locked for this answer paper
- Audit: `evaluation.finalized`

## 10. Analytics Generation
- Actor: System (scheduled/triggered worker)
- Action: Aggregates finalized marks into statistics
- Backend: `workers/analytics_worker.py` → `services/analytics_service.py`
- Database: `performance_aggregates` (or equivalent)
- AI: none (pure aggregation)
- Result: Question/topic/unit/class/department stats available
- Audit: `analytics.generated`

## 11. Weak-Topic Detection
- Actor: System
- Action: AI infers weak topics from aggregated statistics
- Backend: `services/analytics_service.py` → `AIProvider`
- Database: `topic_insights` (labeled as AI inference, not fact)
- AI: Hugging Face model
- Result: Recommendations surfaced to Paper Checker/Admin dashboards
- Audit: `analytics.ai_inference_generated`

## 12. Student Query
- Actor: Student
- Action: Submits a query (email or in-app)
- Backend: `routes/queries.py` / email ingestion worker → `services/query_service.py`
- Database: `queries`
- AI: none at ingestion
- Result: Query recorded, pending classification
- Audit: `query.received`

## 13. Query Seriousness Analysis
- Actor: System (worker)
- Action: AI scores seriousness/priority
- Backend: `workers/query_analysis_worker.py` → `services/query_service.py` → `AIProvider`
- Database: `queries.priority_score`, `query_classifications`
- AI: Hugging Face model
- Result: Query placed in prioritized admin queue
- Audit: `query.classified`

## 14. Admin Review
- Actor: Admin/Paper Checker
- Action: Reviews queued query, may override AI priority
- Backend: `services/query_service.py`
- Database: `queries.status`
- AI: none (human decision)
- Result: Query assigned for response
- Audit: `query.reviewed`

## 15. Response Generation
- Actor: Admin/Paper Checker (optionally AI-drafted)
- Action: Sends response to student
- Backend: `services/query_service.py` → Email Provider
- Database: `queries.response`, `notifications`
- AI: 🟡 optional draft generation
- Result: Student notified
- Audit: `query.responded`

## 16. Deadline Management
- Actor: System (scheduled check) / Admin
- Action: Detects approaching/overdue deadlines, notifies
- Backend: `workers/deadline_worker.py` → `services/assignment_service.py`
- Database: `deadlines.status`
- AI: none
- Result: Reminder sent; overdue status visible to Admin
- Audit: `deadline.reminder_sent` / `deadline.overdue`

## Open Questions
- ❓ Exact worker/queue implementation for scheduled jobs (10, 13, 16).
- ❓ Whether question-paper review (workflow 4) requires a distinct approver role.
