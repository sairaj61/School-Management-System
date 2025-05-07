from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from models import Student
from schemas import StudentCreate, StudentUpdate
from fastapi import HTTPException
from uuid import UUID


class StudentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self):
        result = await self.db.execute(select(Student))
        return result.scalars().all()

    async def get_by_id(self, student_id: UUID):
        result = await self.db.execute(select(Student).filter(Student.id == student_id))
        return result.scalar_one_or_none()

    async def get_by_roll_number(self, roll_number: str):
        result = await self.db.execute(select(Student).filter(Student.roll_number == roll_number))
        return result.scalar_one_or_none()

    async def get_by_roll_number_in_class(self, roll_number: str, class_id: UUID):
        result = await self.db.execute(
            select(Student).filter(
                Student.roll_number == roll_number,
                Student.class_id == class_id
            )
        )
        return result.scalar_one_or_none()

    async def create(self, student: StudentCreate):
        # Check for duplicate roll number only if one is provided
        if student.roll_number:
            existing_student = await self.get_by_roll_number_in_class(student.roll_number, student.class_id)
            if existing_student:
                raise HTTPException(
                    status_code=400,
                    detail=f"Student with roll number '{student.roll_number}' already exists in this class"
                )

        try:
            db_student = Student(**student.dict())
            self.db.add(db_student)
            await self.db.commit()
            await self.db.refresh(db_student)
            return db_student
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(
                status_code=400,
                detail="Error creating student. Please check your input."
            )

    async def update(self, student_id: UUID, student: StudentUpdate):
        db_student = await self.get_by_id(student_id)
        if not db_student:
            return None

        # Check for duplicate roll number only if it's being updated
        if student.roll_number:
            # If class is also being updated, use new class_id, otherwise use existing
            check_class = student.class_id if student.class_id else db_student.class_id

            # Check for duplicates only if roll number is different
            if student.roll_number != db_student.roll_number:
                existing_student = await self.get_by_roll_number_in_class(student.roll_number, check_class)
                if existing_student and existing_student.id != student_id:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Student with roll number '{student.roll_number}' already exists in this class"
                    )

        try:
            update_data = student.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_student, key, value)

            await self.db.commit()
            await self.db.refresh(db_student)
            return db_student
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(
                status_code=400,
                detail="Error updating student. Please check your input."
            )

    async def delete(self, student_id: UUID):
        db_student = await self.get_by_id(student_id)
        if not db_student:
            return None
        await self.db.delete(db_student)
        await self.db.commit()
        return db_student

    async def get_by_class(self, class_id: UUID):
        result = await self.db.execute(select(Student).filter(Student.class_id == class_id))
        return result.scalars().all()

    async def get_by_section(self, section_id: UUID):
        result = await self.db.execute(select(Student).filter(Student.section_id == section_id))
        return result.scalars().all()