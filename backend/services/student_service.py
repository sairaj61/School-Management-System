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
            raise HTTPException(status_code=400, detail="Invalid class_id: Class does not exist")
        # Validate section_id belongs to the selected class
        section = self.section_repo.get_by_id(student.section_id)
        if not section:
            raise HTTPException(status_code=400, detail="Invalid section_id: Section does not exist")
        if section.class_id != student.class_id:
            raise HTTPException(status_code=400, detail="Section does not belong to the selected class")
        return self.student_repo.create(student)

    def update_student(self, student_id: int, student: StudentUpdate):
        if student.class_id and not self.class_repo.get_by_id(student.class_id):
            raise HTTPException(status_code=400, detail="Invalid class_id: Class does not exist")
        if student.section_id:
            section = self.section_repo.get_by_id(student.section_id)
            if not section:
                raise HTTPException(status_code=400, detail="Invalid section_id: Section does not exist")
            # If class_id is also updated, ensure section belongs to it
            class_id = student.class_id or self.student_repo.get_by_id(student_id).class_id
            if section.class_id != class_id:
                raise HTTPException(status_code=400, detail="Section does not belong to the selected class")
        updated_student = self.student_repo.update(student_id, student)
        if not updated_student:
            raise HTTPException(status_code=404, detail="Student not found")
        return updated_student

    def delete_student(self, student_id: int):
        deleted_student = self.student_repo.delete(student_id)
        if not deleted_student:
            raise HTTPException(status_code=404, detail="Student not found")
        return {"message": "Student deleted"}