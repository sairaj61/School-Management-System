from fastapi import HTTPException
from repositories.student_repository import StudentRepository
from repositories.class_repository import ClassRepository
from repositories.section_repository import SectionRepository
from schemas import StudentCreate, StudentUpdate, StudentResponse

class StudentService:
    def __init__(self, db):
        self.student_repo = StudentRepository(db)
        self.class_repo = ClassRepository(db)
        self.section_repo = SectionRepository(db)

    def get_all_students(self):
        return self.student_repo.get_all()

    def get_student_by_id(self, student_id: int):
        student = self.student_repo.get_by_id(student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        return student

    def create_student(self, student: StudentCreate):
        # Validate class_id
        if not self.class_repo.get_by_id(student.class_id):
            raise HTTPException(status_code=400, detail="Invalid class_id")
        # Validate section_id
        if not self.section_repo.get_by_id(student.section_id):
            raise HTTPException(status_code=400, detail="Invalid section_id")
        return self.student_repo.create(student)

    def update_student(self, student_id: int, student: StudentUpdate):
        if student.class_id and not self.class_repo.get_by_id(student.class_id):
            raise HTTPException(status_code=400, detail="Invalid class_id")
        if student.section_id and not self.section_repo.get_by_id(student.section_id):
            raise HTTPException(status_code=400, detail="Invalid section_id")
        updated_student = self.student_repo.update(student_id, student)
        if not updated_student:
            raise HTTPException(status_code=404, detail="Student not found")
        return updated_student

    def delete_student(self, student_id: int):
        deleted_student = self.student_repo.delete(student_id)
        if not deleted_student:
            raise HTTPException(status_code=404, detail="Student not found")
        return {"message": "Student deleted"}