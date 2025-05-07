from fastapi import APIRouter, Depends

from auth.auth_model import User
from auth.auth_service import current_active_user
from services.dashboard_service import DashboardService
from database import get_db

router = APIRouter()


@router.get("/")
async def get_dashboard(db=Depends(get_db), user: User = Depends(current_active_user)):
    service = DashboardService(db)
    return await service.get_dashboard()
