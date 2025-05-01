from fastapi import HTTPException
from repositories.class_repository import ClassRepository
from repositories.academic_year_repository import AcademicYearRepository
from schemas import ClassCreate, ClassUpdate, ClassResponse
from uuid import UUID

class ClassService:
    def __init__(self, db):
        self.class_repo = ClassRepository(db)
        self.academic_year_repo = AcademicYearRepository(db)

    def get_all_classes(self):
        return self.class_repo.get_all()

    def get_class(self, class_id: UUID):
        class_ = self.class_repo.get_by_id(class_id)
        if not class_:
            raise HTTPException(status_code=404, detail="Class not found")
        return class_

    def create_class(self, class_: ClassCreate):
        # Validate academic year exists
        academic_year = self.academic_year_repo.get_by_id(class_.academic_year_id)
        if not academic_year:
            raise HTTPException(
                status_code=400,
                detail="Invalid academic_year_id: Academic year does not exist"
            )
        return self.class_repo.create(class_)

    def update_class(self, class_id: UUID, class_: ClassUpdate):
        # Validate academic year if provided
        if class_.academic_year_id:
            academic_year = self.academic_year_repo.get_by_id(class_.academic_year_id)
            if not academic_year:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid academic_year_id: Academic year does not exist"
                )
        
        updated_class = self.class_repo.update(class_id, class_)
        if not updated_class:
            raise HTTPException(status_code=404, detail="Class not found")
        return updated_class

    def delete_class(self, class_id: UUID):
        deleted_class = self.class_repo.delete(class_id)
        if not deleted_class:
            raise HTTPException(status_code=404, detail="Class not found")
        return deleted_class