from fastapi import APIRouter, Depends

from models import User
from services.academic_year_service import AcademicYearService
from schemas import AcademicYearCreate, AcademicYearUpdate, AcademicYear
from database import get_db
from uuid import UUID

router = APIRouter()


@router.get("/", response_model=list[AcademicYear])
async def get_academic_years(db=Depends(get_db),current_user: User = Depends(current_active_user)):
    service = AcademicYearService(db)
    return await service.get_all_academic_years()


@router.get("/{year_id}", response_model=AcademicYear)
async def get_academic_year(year_id: UUID, db=Depends(get_db)):
    service = AcademicYearService(db)
    return await service.get_academic_year_by_id(year_id)


@router.post("/", response_model=AcademicYear)
async def create_academic_year(academic_year: AcademicYearCreate, db=Depends(get_db)):
    service = AcademicYearService(db)
    return await service.create_academic_year(academic_year)


@router.put("/{year_id}", response_model=AcademicYear)
async def update_academic_year(year_id: UUID, academic_year: AcademicYearUpdate, db=Depends(get_db)):
    service = AcademicYearService(db)
    return await service.update_academic_year(year_id, academic_year)


@router.delete("/{year_id}")
async def delete_academic_year(year_id: UUID, db=Depends(get_db)):
    service = AcademicYearService(db)
    return await service.delete_academic_year(year_id)


@router.post("/{year_id}/activate", response_model=AcademicYear)
async def activate_academic_year(year_id: UUID, db=Depends(get_db)):
    """Activate an academic year and deactivate others"""
    service = AcademicYearService(db)
    return await service.activate_academic_year(year_id)


@router.post("/{year_id}/deactivate", response_model=AcademicYear)
async def deactivate_academic_year(year_id: UUID, db=Depends(get_db)):
    """Deactivate an academic year"""
    service = AcademicYearService(db)
    return await service.deactivate_academic_year(year_id)
