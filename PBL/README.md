# Full-Stack Template

A clean, production-grade starting structure for working on frontend and
backend at the same time — verified working: backend tests pass, frontend
builds, both run together via `docker-compose up`.

## Structure

```
.
├── .github/workflows/ci.yml   backend tests + frontend build, on every push/PR
├── backend/
│   ├── app/
│   │   ├── main.py            FastAPI app + CORS, includes api_router
│   │   ├── core/config.py     the ONE settings module - see rules below
│   │   ├── api/
│   │   │   ├── router.py      the ONE place routers get registered
│   │   │   └── routes/        one file per resource (health.py, etc.)
│   │   ├── db/models/         SQLAlchemy models
│   │   ├── schemas/           Pydantic request/response schemas
│   │   ├── services/          business logic, called by routes
│   │   └── workers/           background/async tasks (celery, rq, etc.)
│   ├── scripts/                seed/verify/one-off scripts - never in app/
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/client.js      the ONE place fetch/base-URL logic lives
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js         dev-server proxies /api to the backend
│   ├── package.json
│   └── Dockerfile
├── docs/                       architecture/API/data-model notes
├── docker-compose.yml           runs both services together, hot-reload
└── .gitignore
```

## Running it

```bash
docker-compose up --build
# backend:  http://localhost:8000/api/v1/health
# frontend: http://localhost:5173
```

Or without Docker:

```bash
# backend
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload

# frontend (separate terminal)
cd frontend && npm install && npm run dev
```

Working on both at once: the frontend's Vite dev server proxies any
`/api/...` request to the backend container (`vite.config.js`), so there's
no CORS setup needed while you're iterating on both sides together — just
run `docker-compose up` and edit files in either folder; both hot-reload.

## Rules that keep this clean as it grows

These come directly from patterns that turn messy in real projects as they
scale — worth holding the line on from day one:

1. **One config module.** `app/core/config.py` is the only place settings
   are declared. A second `config.py` appearing anywhere else in `app/` is
   a sign something got duplicated instead of imported.
2. **One schemas location, one routing location.** Don't let a `schemas.py`
   file and a `schemas/` package coexist, or a `dependencies.py` show up in
   two different folders — pick the package form and stick to it.
3. **Scripts stay in `scripts/`.** Seed data, DB verification, one-off
   migrations — none of it belongs loose in the backend root or inside
   `app/`. Run them as `python -m scripts.seed_admin` so they reuse
   `app.core.config` instead of hardcoding values.
4. **One route per file** under `api/routes/`, registered in exactly one
   place (`api/router.py`). Makes it obvious what endpoints exist without
   grepping.
5. **Don't commit shell-command fragments as files.** A stray copy-paste
   into a terminal (e.g. `docker compose ... up -d --build` run from the
   wrong directory) can silently create a file named after the command
   tail - worth a `git status` glance before committing.
