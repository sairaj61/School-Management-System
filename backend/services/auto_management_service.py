from fastapi import HTTPException
from repositories.auto_management_repository import AutoManagementRepository, AutoStudentMappingRepository
from repositories.student_repository import StudentRepository
from schemas import AutoManagementCreate, AutoManagementUpdate, AutoStudentMappingCreate
from typing import List
from uuid import UUID

class AutoManagementService:
    def __init__(self, db):
        self.auto_repo = AutoManagementRepository(db)
        self.mapping_repo = AutoStudentMappingRepository(db)
        self.student_repo = StudentRepository(db)

    def get_all_autos(self):
        return self.auto_repo.get_all()

    def get_auto_with_students(self, auto_id):
        auto = self.auto_repo.get_by_id(auto_id)
        if not auto:
            raise HTTPException(status_code=404, detail="Auto not found")
        mappings = self.mapping_repo.get_by_auto_id(auto_id)
        return {
            "id": auto.id,
            "name": auto.name,
            "students": [mapping.student_id for mapping in mappings]
        }

    def create_auto(self, auto: AutoManagementCreate):
        return self.auto_repo.create(auto)

    def update_auto(self, auto_id, auto: AutoManagementUpdate):
        updated_auto = self.auto_repo.update(auto_id, auto)
        if not updated_auto:
            raise HTTPException(status_code=404, detail="Auto not found")
        return updated_auto

    def delete_auto(self, auto_id):
        deleted_auto = self.auto_repo.delete(auto_id)
        if not deleted_auto:
            raise HTTPException(status_code=404, detail="Auto not found")
        return {"message": "Auto deleted successfully"}

    def assign_student(self, mapping: AutoStudentMappingCreate):
        if not self.auto_repo.get_by_id(mapping.auto_id):
            raise HTTPException(status_code=404, detail="Auto not found")
        if not self.student_repo.get_by_id(mapping.student_id):
            raise HTTPException(status_code=404, detail="Student not found")
        return self.mapping_repo.create(mapping)

    def assign_students_bulk(self, auto_id: UUID, student_ids: List[UUID]):
        # Verify auto exists
        auto = self.auto_repo.get_by_id(auto_id)
        if not auto:
            raise HTTPException(status_code=404, detail="Auto not found")

        # Verify all students exist
        for student_id in student_ids:
            if not self.student_repo.get_by_id(student_id):
                raise HTTPException(
                    status_code=404, 
                    detail=f"Student with id {student_id} not found"
                )

        # Remove existing mappings for this auto
        self.mapping_repo.delete_by_auto(auto_id)

        # Create new mappings
        mappings = []
        for student_id in student_ids:
            mapping = AutoStudentMappingCreate(
                auto_id=auto_id,
                student_id=student_id
            )
            mappings.append(self.mapping_repo.create(mapping))

        return {
            "auto_id": auto_id,
            "assigned_students": len(mappings),
            "student_ids": student_ids
        }

    def get_all_autos_with_students(self):
        """Get all autos with their mapped students"""
        autos = self.auto_repo.get_all()
        result = []
        
        for auto in autos:
            mappings = self.mapping_repo.get_by_auto_id(auto.id)
            result.append({
                "id": auto.id,
                "name": auto.name,
                "students": [mapping.student_id for mapping in mappings]
            })
        
        return result 