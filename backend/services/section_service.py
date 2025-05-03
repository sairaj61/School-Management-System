from fastapi import HTTPException

from repositories.class_repository import ClassRepository
from repositories.section_repository import SectionRepository
from schemas import SectionCreate, SectionUpdate


class SectionService:
    def __init__(self, db):
        self.section_repo = SectionRepository(db)
        self.class_repo = ClassRepository(db)

    def get_all_sections(self):
        return self.section_repo.get_all()

    def get_sections_by_class_id(self, class_id: int):
        # First validate if class exists
        class_exists = self.class_repo.get_by_id(class_id)
        if not class_exists:
            raise HTTPException(status_code=404, detail=f"Class with id {class_id} not found")
        return self.section_repo.get_sections_by_class_id(class_id)

    def get_section_by_id(self, section_id: int):
        section = self.section_repo.get_by_id(section_id)
        if not section:
            raise HTTPException(status_code=404, detail="Section not found")
        return section

    def create_section(self, section: SectionCreate):
        # Validate if class exists
        class_exists = self.class_repo.get_by_id(section.class_id)
        if not class_exists:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid class_id: Class with id {section.class_id} does not exist"
            )
        return self.section_repo.create(section)

    def update_section(self, section_id: int, section: SectionUpdate):
        # If class_id is being updated, validate if new class exists
        if section.class_id:
            class_exists = self.class_repo.get_by_id(section.class_id)
            if not class_exists:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid class_id: Class with id {section.class_id} does not exist"
                )
        
        updated_section = self.section_repo.update(section_id, section)
        if not updated_section:
            raise HTTPException(status_code=404, detail="Section not found")
        return updated_section

    def delete_section(self, section_id: int):
        deleted_section = self.section_repo.delete(section_id)
        if not deleted_section:
            raise HTTPException(status_code=404, detail="Section not found")
        return {"message": "Section deleted"}