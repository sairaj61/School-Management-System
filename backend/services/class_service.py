from fastapi import HTTPException
from repositories.class_repository import ClassRepository
from schemas import ClassCreate, ClassUpdate, ClassResponse

class ClassService:
    def __init__(self, db):
        self.class_repo = ClassRepository(db)

    def get_all_classes(self):
        return self.class_repo.get_all()

    def get_class_by_id(self, class_id: int):
        cls = self.class_repo.get_by_id(class_id)
        if not cls:
            raise HTTPException(status_code=404, detail="Class not found")
        return cls

    def create_class(self, cls: ClassCreate):
        return self.class_repo.create(cls)

    def update_class(self, class_id: int, cls: ClassUpdate):
        updated_class = self.class_repo.update(class_id, cls)
        if not updated_class:
            raise HTTPException(status_code=404, detail="Class not found")
        return updated_class

    def delete_class(self, class_id: int):
        deleted_class = self.class_repo.delete(class_id)
        if not deleted_class:
            raise HTTPException(status_code=404, detail="Class not found")
        return {"message": "Class deleted"}