from decimal import Decimal
from typing import Optional
from uuid import UUID

from fastapi import HTTPException

from models import StudentStatus
from repositories.class_repository import ClassRepository
from repositories.section_repository import SectionRepository
from repositories.student_repository import StudentRepository
from schemas import StudentCreate, StudentUpdate


class StudentService:
    def __init__(self, db):
        self.student_repo = StudentRepository(db)
        self.class_repo = ClassRepository(db)
        self.section_repo = SectionRepository(db)

    async def get_all_students(self, status: Optional[StudentStatus] = None):
        return await self.student_repo.get_all(status=status)

    async def get_student(self, student_id: UUID):
        student = await self.student_repo.get_by_id(student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        return student

    async def create_student(self, student: StudentCreate):
        # Validate fees are non-negative
        if any(fee < Decimal('0.00') for fee in [
            student.tuition_fees,
            student.auto_fees,
            student.day_boarding_fees
        ]):
            raise HTTPException(
                status_code=400,
                detail="Fees cannot be negative"
            )
        return await self.student_repo.create(student)

    async def update_student(self, student_id: UUID, student: StudentUpdate):
        # Validate fees if provided
        if student.tuition_fees is not None and student.tuition_fees < Decimal('0.00'):
            raise HTTPException(
                status_code=400,
                detail="Tuition fees cannot be negative"
            )
        if student.auto_fees is not None and student.auto_fees < Decimal('0.00'):
            raise HTTPException(
                status_code=400,
                detail="Auto fees cannot be negative"
            )
        if student.day_boarding_fees is not None and student.day_boarding_fees < Decimal('0.00'):
            raise HTTPException(
                status_code=400,
                detail="Day boarding fees cannot be negative"
            )

        updated_student = await self.student_repo.update(student_id, student)
        if not updated_student:
            raise HTTPException(status_code=404, detail="Student not found")
        return updated_student

    async def delete_student(self, student_id: UUID):
        deleted_student = await self.student_repo.delete(student_id)
        if not deleted_student:
            raise HTTPException(status_code=404, detail="Student not found")
        return deleted_student

    async def get_students_by_class(self, class_id: UUID):
        return await self.student_repo.get_by_class(class_id)

    async def get_students_by_section(self, section_id: UUID):
        return await self.student_repo.get_by_section(section_id)

    async def update_student_status(self, student_id: UUID, status: StudentStatus):
        return await self.student_repo.update_student_status(student_id, status)

    async def get_day_boarding_students(self, current_academic_year_id: UUID):
        return await self.student_repo.get_day_boarding_students_for_current_year(current_academic_year_id)