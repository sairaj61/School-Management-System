from fastapi import APIRouter, Depends
from services.class_service import ClassService
from schemas import ClassCreate, ClassUpdate, ClassResponse
from database import get_db
from uuid import UUID

router = APIRouter()


@router.get("/", response_model=list[ClassResponse])
def get_classes(db=Depends(get_db)):
    service = ClassService(db)
    return service.get_all_classes()


@router.post("/", response_model=ClassResponse)
def create_class(cls: ClassCreate, db=Depends(get_db)):
    service = ClassService(db)
    return service.create_class(cls)


@router.put("/{class_id}", response_model=ClassResponse)
def update_class(class_id: UUID, cls: ClassUpdate, db=Depends(get_db)):
    service = ClassService(db)
    return service.update_class(class_id, cls)


@router.delete("/{class_id}")
def delete_class(class_id: UUID, db=Depends(get_db)):
    service = ClassService(db)
    return service.delete_class(class_id)
