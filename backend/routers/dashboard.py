from fastapi import APIRouter, Depends
from services.dashboard_service import DashboardService
from database import get_db

router = APIRouter()


@router.get("/")
async def get_dashboard(db=Depends(get_db)):
    service = DashboardService(db)
    return await service.get_dashboard()