
# Backend Only Auth

## Routes
POST /api/v1/auth/signup
POST /api/v1/auth/login
GET /api/v1/auth/me

## Curl

```bash
curl -X POST http://localhost:8000/api/v1/auth/signup \
-H "Content-Type: application/json" \
-d '{
"name":"Dr Atharv",
"email":"a@b.com",
"password":"Strong@123",
"department":"CSE",
"teaching_assignments":[{"academic_year":"FE","subject":"Programming"}]
}'
```
