from typing import Optional

from fastapi import APIRouter, Depends, Query

from auth.auth_model import User
from auth.auth_service import current_active_user
from models import StudentStatus
from services.student_service import StudentService
from schemas import StudentCreate, StudentUpdate, StudentResponse
from database import get_db
from uuid import UUID

router = APIRouter()


@router.get("/", response_model=list[StudentResponse])
async def get_students(
    status: Optional[StudentStatus] = Query(None),
    db=Depends(get_db),
    user: User = Depends(current_active_user)
):
    service = StudentService(db)
    return await service.get_all_students(status=status)


@router.post("/", response_model=StudentResponse)
async def create_student(student: StudentCreate, db=Depends(get_db), user: User = Depends(current_active_user)):
    service = StudentService(db)
    return await service.create_student(student)


@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(student_id: UUID, student: StudentUpdate, db=Depends(get_db),
                         user: User = Depends(current_active_user)):
    service = StudentService(db)
    return await service.update_student(student_id, student)


@router.put("drop_out/{student_id}")
async def update_student(student_id: UUID, db=Depends(get_db),
                         user: User = Depends(current_active_user)):
    service = StudentService(db)
    return await service.student_dropout(student_id)


@router.delete("/{student_id}")
async def delete_student(student_id: UUID, db=Depends(get_db), user: User = Depends(current_active_user)):
    service = StudentService(db)
    return await service.delete_student(student_id)
