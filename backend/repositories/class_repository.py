from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from models import Class
from schemas import ClassCreate, ClassUpdate
from uuid import UUID

class ClassRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(Class).all()

    def get_by_id(self, class_id: UUID):
        return self.db.query(Class).filter(Class.id == class_id).first()

    def get_by_name_and_year(self, name: str, academic_year_id: int):
        return self.db.query(Class).filter(
            Class.name == name,
            Class.academic_year_id == academic_year_id
        ).first()

    def create(self, class_: ClassCreate):
        # Check if class with same name exists in the same academic year
        existing_class = self.get_by_name_and_year(class_.name, class_.academic_year_id)
        if existing_class:
            raise HTTPException(
                status_code=400,
                detail=f"Class with name '{class_.name}' already exists in this academic year"
            )

        try:
            db_class = Class(**class_.dict())
            self.db.add(db_class)
            self.db.commit()
            self.db.refresh(db_class)
            return db_class
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=400,
                detail="Error creating class. Please check your input."
            )

    def update(self, class_id: UUID, class_: ClassUpdate):
        db_class = self.get_by_id(class_id)
        if not db_class:
            return None

        # If either name or academic_year_id is being updated, check for duplicates
        if (class_.name or class_.academic_year_id):
            # Use new values if provided, otherwise use existing values
            check_name = class_.name if class_.name else db_class.name
            check_year_id = class_.academic_year_id if class_.academic_year_id else db_class.academic_year_id
            
            # Check for existing class with same name in same academic year (excluding current class)
            existing_class = self.db.query(Class).filter(
                Class.name == check_name,
                Class.academic_year_id == check_year_id,
                Class.id != class_id  # Exclude current class from check
            ).first()
            
            if existing_class:
                raise HTTPException(
                    status_code=400,
                    detail=f"Class with name '{check_name}' already exists in this academic year"
                )

        try:
            update_data = class_.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_class, key, value)
            
            self.db.commit()
            self.db.refresh(db_class)
            return db_class
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=400,
                detail="Error updating class. Please check your input."
            )

    def delete(self, class_id: UUID):
        db_class = self.get_by_id(class_id)
        if not db_class:
            return None
        self.db.delete(db_class)
        self.db.commit()
        return db_class