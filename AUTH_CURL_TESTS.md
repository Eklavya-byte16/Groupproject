
# Auth curl

## Signup

curl -X POST http://localhost:8000/api/v1/auth/signup \
-H "Content-Type: application/json" \
-d '{"name":"Dr Atharv","email":"atharv@college.edu","password":"StrongPass@123","department":"CSE","teaching_assignments":[{"academic_year":"FE","subject":"C Programming"},{"academic_year":"SE","subject":"DBMS"}]}'

## Login

curl -X POST http://localhost:8000/api/v1/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"atharv@college.edu","password":"StrongPass@123"}'

SQL:

SELECT * FROM users;
SELECT * FROM teaching_assignments;
