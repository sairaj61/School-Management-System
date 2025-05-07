from fastapi import APIRouter, Depends

from auth.auth_model import User
from auth.auth_service import current_active_user
from services.section_service import SectionService
from schemas import SectionCreate, SectionUpdate, SectionResponse
from database import get_db
from uuid import UUID

router = APIRouter()


@router.get("/", response_model=list[SectionResponse])
async def get_sections(db=Depends(get_db), user: User = Depends(current_active_user)):
    service = SectionService(db)
    return await service.get_all_sections()


@router.get("/by-class/{class_id}", response_model=list[SectionResponse])
async def get_sections_by_class_id(class_id: UUID, db=Depends(get_db), user: User = Depends(current_active_user)):
    service = SectionService(db)
    return await service.get_sections_by_class_id(class_id)


@router.post("/", response_model=SectionResponse)
async def create_section(section: SectionCreate, db=Depends(get_db), user: User = Depends(current_active_user)):
    service = SectionService(db)
    return await service.create_section(section)


@router.put("/{section_id}", response_model=SectionResponse)
async def update_section(section_id: UUID, section: SectionUpdate, db=Depends(get_db),
                         user: User = Depends(current_active_user)):
    service = SectionService(db)
    return await service.update_section(section_id, section)


@router.delete("/{section_id}")
async def delete_section(section_id: UUID, db=Depends(get_db), user: User = Depends(current_active_user)):
    service = SectionService(db)
    return await service.delete_section(section_id)
