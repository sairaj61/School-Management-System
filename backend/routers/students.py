from fastapi import APIRouter, Depends
from services.student_service import StudentService
from schemas import StudentCreate, StudentUpdate, StudentResponse
from database import get_db

router = APIRouter()

@router.get("/", response_model=list[StudentResponse])
def get_students(db=Depends(get_db)):
    service = StudentService(db)
    return service.get_all_students()

@router.post("/", response_model=StudentResponse)
def create_student(student: StudentCreate, db=Depends(get_db)):
    service = StudentService(db)
    return service.create_student(student)

@router.put("/{student_id}", response_model=StudentResponse)
def update_student(student_id: int, student: StudentUpdate, db=Depends(get_db)):
    service = StudentService(db)
    return service.update_student(student_id, student)

@router.delete("/{student_id}")
def delete_student(student_id: int, db=Depends(get_db)):
    service = StudentService(db)
    return service.delete_student(student_id)