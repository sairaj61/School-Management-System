from fastapi import APIRouter, Depends

from auth.auth_model import User
from auth.auth_service import current_active_user
from services.class_service import ClassService
from schemas import ClassCreate, ClassUpdate, ClassResponse
from database import get_db
from uuid import UUID

router = APIRouter()


@router.get("/", response_model=list[ClassResponse])
async def get_classes(db=Depends(get_db), user: User = Depends(current_active_user)):
    service = ClassService(db)
    return await service.get_all_classes()


@router.post("/", response_model=ClassResponse)
async def create_class(cls: ClassCreate, db=Depends(get_db), user: User = Depends(current_active_user)):
    service = ClassService(db)
    return await service.create_class(cls)


@router.put("/{class_id}", response_model=ClassResponse)
async def update_class(class_id: UUID, cls: ClassUpdate, db=Depends(get_db),
                       user: User = Depends(current_active_user)):
    service = ClassService(db)
    return await service.update_class(class_id, cls)


@router.delete("/{class_id}")
async def delete_class(class_id: UUID, db=Depends(get_db), user: User = Depends(current_active_user)):
    service = ClassService(db)
    return await service.delete_class(class_id)
