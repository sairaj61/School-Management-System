from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from models import AcademicYear
from schemas import AcademicYearCreate, AcademicYearUpdate


class AcademicYearRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(AcademicYear).all()

    def get_by_id(self, year_id: int):
        return self.db.query(AcademicYear).filter(AcademicYear.id == year_id).first()

    def get_by_year(self, year: str):
        return self.db.query(AcademicYear).filter(AcademicYear.year == year).first()

    def create(self, academic_year: AcademicYearCreate):
        # Check if year already exists
        existing_year = self.get_by_year(academic_year.year)
        if existing_year:
            raise HTTPException(
                status_code=400,
                detail=f"Academic year '{academic_year.year}' already exists"
            )

        try:
            db_academic_year = AcademicYear(**academic_year.dict(), is_active=True)
            # Deactivate other years since this is a new year
            self.deactivate_all_years()

            self.db.add(db_academic_year)
            self.db.commit()
            self.db.refresh(db_academic_year)
            return db_academic_year
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=400,
                detail=f"Error creating academic year. Please check your input."
            )

    def update(self, year_id: int, academic_year: AcademicYearUpdate):
        db_academic_year = self.get_by_id(year_id)
        if not db_academic_year:
            return None

        # If year is being updated, check for duplicates
        if academic_year.year and academic_year.year != db_academic_year.year:
            # Check if the new year already exists (excluding current record)
            existing_year = self.db.query(AcademicYear).filter(
                AcademicYear.year == academic_year.year,
                AcademicYear.id != year_id
            ).first()

            if existing_year:
                raise HTTPException(
                    status_code=400,
                    detail=f"Academic year '{academic_year.year}' already exists"
                )

        try:
            for key, value in academic_year.dict(exclude_unset=True).items():
                setattr(db_academic_year, key, value)
            self.db.commit()
            self.db.refresh(db_academic_year)
            return db_academic_year
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=400,
                detail="Error updating academic year. Please check your input."
            )

    def delete(self, year_id: int):
        db_academic_year = self.get_by_id(year_id)
        if not db_academic_year:
            return None
        self.db.delete(db_academic_year)
        self.db.commit()
        return db_academic_year

    def deactivate_all_years(self):
        """Helper method to deactivate all academic years"""
        self.db.query(AcademicYear).update({AcademicYear.is_active: False})
        self.db.commit()

    def activate_year(self, year_id: int):
        """Activate a specific academic year and deactivate others"""
        db_academic_year = self.get_by_id(year_id)
        if not db_academic_year:
            raise HTTPException(status_code=404, detail="Academic year not found")

        self.deactivate_all_years()
        db_academic_year.is_active = True
        self.db.commit()
        self.db.refresh(db_academic_year)
        return db_academic_year

    def deactivate_year(self, year_id: int):
        """Deactivate a specific academic year"""
        db_academic_year = self.get_by_id(year_id)
        if not db_academic_year:
            raise HTTPException(status_code=404, detail="Academic year not found")

        if not db_academic_year.is_active:
            raise HTTPException(status_code=400, detail="Academic year is already inactive")

        db_academic_year.is_active = False
        self.db.commit()
        self.db.refresh(db_academic_year)
        return db_academic_year
