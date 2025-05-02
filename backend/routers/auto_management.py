from fastapi import APIRouter, Depends, Body
from services.auto_management_service import AutoManagementService
from schemas import (
    AutoManagementCreate, AutoManagementUpdate, AutoManagementResponse,
    AutoStudentMappingCreate, AutoStudentMappingResponse, AutoWithStudentsResponse,
    AutoStudentBulkAssignRequest
)
from database import get_db
from uuid import UUID
from typing import List

router = APIRouter(
    prefix="/autos",
    tags=["Auto Management"]
)

@router.get("/", response_model=list[AutoManagementResponse])
def get_autos(db=Depends(get_db)):
    service = AutoManagementService(db)
    return service.get_all_autos()

@router.get("/{auto_id}/students", response_model=AutoWithStudentsResponse)
def get_auto_with_students(auto_id: UUID, db=Depends(get_db)):
    service = AutoManagementService(db)
    return service.get_auto_with_students(auto_id)

@router.post("/", response_model=AutoManagementResponse)
def create_auto(auto: AutoManagementCreate, db=Depends(get_db)):
    service = AutoManagementService(db)
    return service.create_auto(auto)

@router.put("/{auto_id}", response_model=AutoManagementResponse)
def update_auto(auto_id: UUID, auto: AutoManagementUpdate, db=Depends(get_db)):
    service = AutoManagementService(db)
    return service.update_auto(auto_id, auto)

@router.delete("/{auto_id}")
def delete_auto(auto_id: UUID, db=Depends(get_db)):
    service = AutoManagementService(db)
    return service.delete_auto(auto_id)

@router.post("/assign-student", response_model=AutoStudentMappingResponse)
def assign_student(mapping: AutoStudentMappingCreate, db=Depends(get_db)):
    service = AutoManagementService(db)
    return service.assign_student(mapping)

@router.post("/{auto_id}/assign-students")
def assign_students_bulk(
    auto_id: UUID, 
    student_ids: List[UUID] = Body(...),
    db=Depends(get_db)
):
    """Assign multiple students to an auto"""
    service = AutoManagementService(db)
    return service.assign_students_bulk(auto_id, student_ids)

@router.get("/{auto_id}/students")
def get_auto_students(auto_id: UUID, db=Depends(get_db)):
    """Get all students assigned to an auto"""
    service = AutoManagementService(db)
    return service.get_auto_with_students(auto_id)

@router.get("/with-students", response_model=List[AutoWithStudentsResponse])
def get_all_autos_with_students(db=Depends(get_db)):
    """
    Get all autos with their student details and fees
    
    Returns a list of autos with detailed information about assigned students including:
    - Basic auto information (id, name)
    - List of assigned student IDs
    - Total fees collected from all students
    - Detailed student information including:
        - Student name
        - Roll number
        - Class and section
        - Contact information
        - Address
        - Auto fees
    """
    service = AutoManagementService(db)
    return service.get_all_autos_with_students() 