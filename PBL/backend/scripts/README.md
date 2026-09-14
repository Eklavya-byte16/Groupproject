# scripts/

One-off operational scripts (seeding data, manual migrations, verification
scripts, DB inspection helpers) live here - never loose in `app/` or in the
`backend/` root. Run them with `python -m scripts.<name>` so they share the
same `app.core.config` settings as the real app instead of hardcoding values.
