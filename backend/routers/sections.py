from fastapi import APIRouter, Depends
from services.section_service import SectionService
from schemas import SectionCreate, SectionUpdate, SectionResponse
from database import get_db
from uuid import UUID

router = APIRouter()

@router.get("/", response_model=list[SectionResponse])
def get_sections(db=Depends(get_db)):
    service = SectionService(db)
    return service.get_all_sections()

@router.get("/by-class/{class_id}", response_model=list[SectionResponse])
def get_sections_by_class_id(class_id: UUID, db=Depends(get_db)):
    service = SectionService(db)
    return service.get_sections_by_class_id(class_id)

@router.post("/", response_model=SectionResponse)
def create_section(section: SectionCreate, db=Depends(get_db)):
    service = SectionService(db)
    return service.create_section(section)

@router.put("/{section_id}", response_model=SectionResponse)
def update_section(section_id: UUID, section: SectionUpdate, db=Depends(get_db)):
    service = SectionService(db)
    return service.update_section(section_id, section)

@router.delete("/{section_id}")
def delete_section(section_id: UUID, db=Depends(get_db)):
    service = SectionService(db)
    return service.delete_section(section_id)