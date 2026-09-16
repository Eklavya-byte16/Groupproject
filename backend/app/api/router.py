from fastapi import APIRouter

from app.api.routes import admin, auth, health

# Every new route module gets one line here. This is the single place
# that wires routers together, so it's always obvious what endpoints exist.
api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(admin.router)
