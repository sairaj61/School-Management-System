from sqlalchemy.orm import Session
from models import Section
from schemas import SectionCreate, SectionUpdate

class SectionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(Section).all()

    def get_by_id(self, section_id: int):
        return self.db.query(Section).filter(Section.id == section_id).first()

    def create(self, section: SectionCreate):
        db_section = Section(**section.dict())
        self.db.add(db_section)
        self.db.commit()
        self.db.refresh(db_section)
        return db_section

    def update(self, section_id: int, section: SectionUpdate):
        db_section = self.get_by_id(section_id)
        if not db_section:
            return None
        for key, value in section.dict(exclude_unset=True).items():
            setattr(db_section, key, value)
        self.db.commit()
        self.db.refresh(db_section)
        return db_section

    def delete(self, section_id: int):
        db_section = self.get_by_id(section_id)
        if not db_section:
            return None
        self.db.delete(db_section)
        self.db.commit()
        return db_section