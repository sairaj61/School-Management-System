from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, Body

from auth.auth_model import User
from auth.auth_service import current_active_user
from database import get_db

from schemas import (
    AutoManagementCreate, AutoManagementUpdate, AutoManagementResponse,
    AutoStudentMappingCreate, AutoStudentMappingResponse, AutoWithStudentsResponse
)
from services.auto_management_service import AutoManagementService

router = APIRouter(
    prefix="/autos",
    tags=["Auto Management"]
)


@router.get("/", response_model=list[AutoManagementResponse])
async def get_autos(user: User = Depends(current_active_user), db=Depends(get_db)):
    service = AutoManagementService(db)
    return await service.get_all_autos()


@router.get("/{auto_id}/students", response_model=AutoWithStudentsResponse)
async def get_auto_with_students(auto_id: UUID, db=Depends(get_db), user: User = Depends(current_active_user)):
    service = AutoManagementService(db)
    return await service.get_auto_with_students(auto_id)


@router.post("/", response_model=AutoManagementResponse)
async def create_auto(auto: AutoManagementCreate, db=Depends(get_db), user: User = Depends(current_active_user)):
    service = AutoManagementService(db)
    return await service.create_auto(auto)


@router.put("/{auto_id}", response_model=AutoManagementResponse)
async def update_auto(auto_id: UUID, auto: AutoManagementUpdate, db=Depends(get_db),
                      user: User = Depends(current_active_user)):
    service = AutoManagementService(db)
    return await service.update_auto(auto_id, auto)


@router.delete("/{auto_id}")
async def delete_auto(auto_id: UUID, db=Depends(get_db), user: User = Depends(current_active_user)):
    service = AutoManagementService(db)
    return await service.delete_auto(auto_id)


@router.post("/assign-student", response_model=AutoStudentMappingResponse)
async def assign_student(mapping: AutoStudentMappingCreate, db=Depends(get_db),
                         user: User = Depends(current_active_user)):
    service = AutoManagementService(db)
    return await service.assign_student(mapping)


@router.post("/{auto_id}/assign-students")
async def assign_students_bulk(
        auto_id: UUID,
        student_ids: List[UUID] = Body(...),
        db=Depends(get_db),
        user: User = Depends(current_active_user)
):
    """Assign multiple students to an auto"""
    service = AutoManagementService(db)
    return await service.assign_students_bulk(auto_id, student_ids)


@router.get("/with-students", response_model=List[AutoWithStudentsResponse])
async def get_all_autos_with_students(db=Depends(get_db), user: User = Depends(current_active_user)):
    """
    Get all autos with their student details and fees
    """
    service = AutoManagementService(db)
    return await service.get_all_autos_with_students()
