
from fastapi import APIRouter
router=APIRouter(prefix="/exams", tags=["Exams"])
@router.get("/health")
async def health():
    return {"success":True,"module":"exam","status":"ok"}
