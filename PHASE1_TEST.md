
# Phase 1 Test Guide

1. Start postgres & api
2. Run alembic upgrade head
3. Start FastAPI
4. Test:
GET /api/v1/exams/health -> {"success":true}
