from fastapi import HTTPException
from repositories.section_repository import SectionRepository
from repositories.class_repository import ClassRepository
from schemas import SectionCreate, SectionUpdate, SectionResponse

class SectionService:
    def __init__(self, db):
        self.section_repo = SectionRepository(db)
        self.class_repo = ClassRepository(db)

    def get_all_sections(self):
        return self.section_repo.get_all()

    def get_section_by_id(self, section_id: int):
        section = self.section_repo.get_by_id(section_id)
        if not section:
            raise HTTPException(status_code=404, detail="Section not found")
        return section

    def create_section(self, section: SectionCreate):
        if not self.class_repo.get_by_id(section.class_id):
            raise HTTPException(status_code=400, detail="Invalid class_id")
        return self.section_repo.create(section)

    def update_section(self, section_id: int, section: SectionUpdate):
        if section.class_id and not self.class_repo.get_by_id(section.class_id):
            raise HTTPException(status_code=400, detail="Invalid class_id")
        updated_section = self.section_repo.update(section_id, section)
        if not updated_section:
            raise HTTPException(status_code=404, detail="Section not found")
        return updated_section

    def delete_section(self, section_id: int):
        deleted_section = self.section_repo.delete(section_id)
        if not deleted_section:
            raise HTTPException(status_code=404, detail="Section not found")
        return {"message": "Section deleted"}