from sqlalchemy.orm import Session
from models import Section
from schemas import SectionCreate, SectionUpdate
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError

class SectionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(Section).all()

    def get_by_id(self, section_id: int):
        return self.db.query(Section).filter(Section.id == section_id).first()

    def get_sections_by_class_id(self, class_id: int):
        return self.db.query(Section).filter(Section.class_id == class_id).all()

    def get_by_name_and_class(self, name: str, class_id: int):
        return self.db.query(Section).filter(
            Section.name == name,
            Section.class_id == class_id
        ).first()

    def create(self, section: SectionCreate):
        # Check if section with same name exists in the same class
        existing_section = self.get_by_name_and_class(section.name, section.class_id)
        if existing_section:
            raise HTTPException(
                status_code=400,
                detail=f"Section with name '{section.name}' already exists in this class"
            )

        try:
            db_section = Section(**section.dict())
            self.db.add(db_section)
            self.db.commit()
            self.db.refresh(db_section)
            return db_section
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=400,
                detail="Error creating section. Please check your input."
            )

    def update(self, section_id: int, section: SectionUpdate):
        db_section = self.get_by_id(section_id)
        if not db_section:
            return None

        # If name or class_id is being updated, check for duplicates
        if (section.name or section.class_id):
            check_name = section.name if section.name else db_section.name
            check_class = section.class_id if section.class_id else db_section.class_id
            
            # Check for existing section with same name in same class (excluding current section)
            existing_section = self.db.query(Section).filter(
                Section.name == check_name,
                Section.class_id == check_class,
                Section.id != section_id
            ).first()
            
            if existing_section:
                raise HTTPException(
                    status_code=400,
                    detail=f"Section with name '{check_name}' already exists in this class"
                )

        try:
            for key, value in section.dict(exclude_unset=True).items():
                setattr(db_section, key, value)
            self.db.commit()
            self.db.refresh(db_section)
            return db_section
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=400,
                detail="Error updating section. Please check your input."
            )

    def delete(self, section_id: int):
        db_section = self.get_by_id(section_id)
        if not db_section:
            return None
        self.db.delete(db_section)
        self.db.commit()
        return db_section