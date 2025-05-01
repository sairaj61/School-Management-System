from sqlalchemy.orm import Session
from models import Student
from schemas import StudentCreate, StudentUpdate
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from uuid import UUID

class StudentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(Student).all()

    def get_by_id(self, student_id: UUID):
        return self.db.query(Student).filter(Student.id == student_id).first()

    def get_by_roll_number(self, roll_number: str):
        return self.db.query(Student).filter(Student.roll_number == roll_number).first()

    def get_by_roll_number_in_class(self, roll_number: str, class_id: UUID):
        return self.db.query(Student).filter(
            Student.roll_number == roll_number,
            Student.class_id == class_id
        ).first()

    def create(self, student: StudentCreate):
        # Check for duplicate roll number only if one is provided
        if student.roll_number:
            existing_student = self.get_by_roll_number_in_class(student.roll_number, student.class_id)
            if existing_student:
                raise HTTPException(
                    status_code=400,
                    detail=f"Student with roll number '{student.roll_number}' already exists in this class"
                )

        try:
            db_student = Student(**student.dict())
            self.db.add(db_student)
            self.db.commit()
            self.db.refresh(db_student)
            return db_student
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=400,
                detail="Error creating student. Please check your input."
            )

    def update(self, student_id: UUID, student: StudentUpdate):
        db_student = self.get_by_id(student_id)
        if not db_student:
            return None

        # Check for duplicate roll number only if it's being updated
        if student.roll_number:
            # If class is also being updated, use new class_id, otherwise use existing
            check_class = student.class_id if student.class_id else db_student.class_id
            
            # Check for duplicates only if roll number is different
            if student.roll_number != db_student.roll_number:
                existing_student = self.db.query(Student).filter(
                    Student.roll_number == student.roll_number,
                    Student.class_id == check_class,
                    Student.id != student_id
                ).first()
                
                if existing_student:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Student with roll number '{student.roll_number}' already exists in this class"
                    )

        try:
            update_data = student.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_student, key, value)
            
            self.db.commit()
            self.db.refresh(db_student)
            return db_student
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=400,
                detail="Error updating student. Please check your input."
            )

    def delete(self, student_id: UUID):
        db_student = self.get_by_id(student_id)
        if not db_student:
            return None
        self.db.delete(db_student)
        self.db.commit()
        return db_student

    def get_by_class(self, class_id: UUID):
        return self.db.query(Student).filter(Student.class_id == class_id).all()

    def get_by_section(self, section_id: UUID):
        return self.db.query(Student).filter(Student.section_id == section_id).all()