from fastapi import HTTPException
from repositories.class_repository import ClassRepository
from repositories.academic_year_repository import AcademicYearRepository
from schemas import ClassCreate, ClassUpdate, ClassResponse

class ClassService:
    def __init__(self, db):
        self.class_repo = ClassRepository(db)
        self.academic_year_repo = AcademicYearRepository(db)

    def get_all_classes(self):
        return self.class_repo.get_all()

    def get_class_by_id(self, class_id: int):
        cls = self.class_repo.get_by_id(class_id)
        if not cls:
            raise HTTPException(status_code=404, detail="Class not found")
        return cls

    def create_class(self, cls: ClassCreate):
        # Validate that academic year exists
        academic_year = self.academic_year_repo.get_by_id(cls.academic_year_id)
        if not academic_year:
            raise HTTPException(
                status_code=400, 
                detail=f"Academic year with id {cls.academic_year_id} does not exist"
            )
        return self.class_repo.create(cls)

    def update_class(self, class_id: int, cls: ClassUpdate):
        # If academic_year_id is being updated, validate it exists
        if cls.academic_year_id:
            academic_year = self.academic_year_repo.get_by_id(cls.academic_year_id)
            if not academic_year:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Academic year with id {cls.academic_year_id} does not exist"
                )
        
        updated_class = self.class_repo.update(class_id, cls)
        if not updated_class:
            raise HTTPException(status_code=404, detail="Class not found")
        return updated_class

    def delete_class(self, class_id: int):
        deleted_class = self.class_repo.delete(class_id)
        if not deleted_class:
            raise HTTPException(status_code=404, detail="Class not found")
        return {"message": "Class deleted"}