from sqlalchemy.orm import Session
from models import AutoManagement, AutoStudentMapping
from schemas import (
    AutoManagementCreate, 
    AutoManagementUpdate,
    AutoStudentMappingCreate
)
from fastapi import HTTPException
from uuid import UUID

class AutoManagementRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(AutoManagement).all()

    def get_by_id(self, auto_id: UUID):
        return self.db.query(AutoManagement).filter(AutoManagement.id == auto_id).first()

    def create(self, auto: AutoManagementCreate):
        db_auto = AutoManagement(**auto.dict())
        self.db.add(db_auto)
        self.db.commit()
        self.db.refresh(db_auto)
        return db_auto

    def update(self, auto_id: UUID, auto: AutoManagementUpdate):
        db_auto = self.get_by_id(auto_id)
        if not db_auto:
            return None
        
        for key, value in auto.dict(exclude_unset=True).items():
            setattr(db_auto, key, value)
        
        self.db.commit()
        self.db.refresh(db_auto)
        return db_auto

    def delete(self, auto_id: UUID):
        db_auto = self.get_by_id(auto_id)
        if not db_auto:
            return None
        self.db.delete(db_auto)
        self.db.commit()
        return db_auto

class AutoStudentMappingRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(AutoStudentMapping).all()

    def get_by_auto_id(self, auto_id: UUID):
        return self.db.query(AutoStudentMapping).filter(AutoStudentMapping.auto_id == auto_id).all()

    def create(self, mapping: AutoStudentMappingCreate):
        db_mapping = AutoStudentMapping(**mapping.dict())
        self.db.add(db_mapping)
        self.db.commit()
        self.db.refresh(db_mapping)
        return db_mapping

    def delete_by_student(self, student_id: UUID):
        mappings = self.db.query(AutoStudentMapping).filter(
            AutoStudentMapping.student_id == student_id
        ).all()
        for mapping in mappings:
            self.db.delete(mapping)
        self.db.commit()

    def delete_by_auto(self, auto_id: UUID):
        """Delete all mappings for a specific auto"""
        mappings = self.db.query(AutoStudentMapping).filter(
            AutoStudentMapping.auto_id == auto_id
        ).all()
        for mapping in mappings:
            self.db.delete(mapping)
        self.db.commit()

    def get_students_by_auto(self, auto_id: UUID):
        """Get all student IDs mapped to an auto"""
        mappings = self.db.query(AutoStudentMapping).filter(
            AutoStudentMapping.auto_id == auto_id
        ).all()
        return [mapping.student_id for mapping in mappings] 