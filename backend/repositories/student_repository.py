from datetime import datetime
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import selectinload

from models import Student, DayBoardingHistory, StudentStatus
from schemas import StudentCreate, StudentUpdate
from fastapi import HTTPException
from uuid import UUID


class StudentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, status: Optional[StudentStatus] = None):
        query = select(Student).options(selectinload(Student.day_boarding_history))

        if status:
            query = query.where(Student.status == status)

        result = await self.db.execute(query)
        students = result.scalars().all()

        response = []
        for student in students:
            current_day_boarding_fee = 0.0
            # Find the current day boarding fee (where end_date is None)
            for history in student.day_boarding_history:
                if history.end_date is None:
                    current_day_boarding_fee = str(history.day_boarding_fees)
                    break
            data = await self.getStudentResponse(current_day_boarding_fee, student)
            response.append(data)

        return response

    async def getStudentResponse(self, current_day_boarding_fee, student):
        data = {
            "id": str(student.id),
            "name": student.name,
            "roll_number": student.roll_number,
            "father_name": student.father_name,
            "mother_name": student.mother_name,
            "date_of_birth": student.date_of_birth,
            "contact": student.contact,
            "address": student.address,
            "enrollment_date": student.enrollment_date,
            "tuition_fees": str(student.tuition_fees),
            "auto_fees": str(student.auto_fees),
            "class_id": str(student.class_id),
            "section_id": str(student.section_id),
            "academic_year_id": str(student.academic_year_id),
            "status": student.status,
            "day_boarding_fees": current_day_boarding_fee
        }
        return data

    async def get_by_id(self, student_id: UUID, load_history: bool = False):
        query = select(Student).filter(Student.id == student_id)
        if load_history:
            query = query.options(selectinload(Student.day_boarding_history))

        result = await self.db.execute(query)
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
        if student.roll_number:
            existing_student = await self.get_by_roll_number_in_class(student.roll_number, student.class_id)
            if existing_student:
                raise HTTPException(
                    status_code=400,
                    detail=f"Student with roll number '{student.roll_number}' already exists in this class"
                )

        try:
            db_student = Student(**student.dict(exclude={"day_boarding_fees"}))
            self.db.add(db_student)
            await self.db.flush()  # ensures student.id is populated before creating history

            # Create day boarding history entry
            day_boarding = DayBoardingHistory(
                student_id=db_student.id,
                day_boarding_fees=student.day_boarding_fees,
                start_date=datetime.utcnow(),
                end_date=None
            )
            self.db.add(day_boarding)

            await self.db.commit()
            await self.db.refresh(db_student)
            return await self.getStudentResponse(student.day_boarding_fees, db_student)
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(
                status_code=400,
                detail="Error creating student. Please check your input."
            )

    async def update(self, student_id: UUID, student: StudentUpdate):
        db_student = await self.get_by_id(student_id, load_history=True)
        if not db_student:
            return None

        if student.roll_number:
            check_class = student.class_id if student.class_id else db_student.class_id
            if student.roll_number != db_student.roll_number:
                existing_student = await self.get_by_roll_number_in_class(student.roll_number, check_class)
                if existing_student and existing_student.id != student_id:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Student with roll number '{student.roll_number}' already exists in this class"
                    )

        try:
            update_data = student.dict(exclude_unset=True, exclude={"day_boarding_fees"})
            for key, value in update_data.items():
                setattr(db_student, key, value)

            # Handle day_boarding_fees update
            if student.day_boarding_fees is not None:
                current_fee = None
                for history in db_student.day_boarding_history:
                    if history.end_date is None:
                        current_fee = history
                        break

                if not current_fee or current_fee.day_boarding_fees != student.day_boarding_fees:
                    # End current fee if exists
                    if current_fee:
                        current_fee.end_date = datetime.utcnow()

                    # Add new history record
                    new_fee = DayBoardingHistory(
                        student_id=db_student.id,
                        day_boarding_fees=student.day_boarding_fees,
                        start_date=datetime.utcnow(),
                        end_date=None
                    )
                    self.db.add(new_fee)

            await self.db.commit()
            await self.db.refresh(db_student)
            return await self.getStudentResponse(student.day_boarding_fees, db_student)
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

    async def student_dropout(self, student_id: UUID):
        try:
            db_student = await self.get_by_id(student_id)
            if not db_student:
                raise HTTPException(status_code=404, detail="Student not found")

            db_student.status = StudentStatus.DROPPED_OFF.value  # Use enum value

            await self.db.commit()
            await self.db.refresh(db_student)
            return db_student

        except SQLAlchemyError as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while dropping out the student: {str(e)}"
            )
