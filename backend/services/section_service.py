from fastapi import HTTPException
from repositories.class_repository import ClassRepository
from repositories.section_repository import SectionRepository
from schemas import SectionCreate, SectionUpdate
from uuid import UUID


class SectionService:
    def __init__(self, db):
        self.section_repo = SectionRepository(db)
        self.class_repo = ClassRepository(db)

    async def get_all_sections(self):
        return await self.section_repo.get_all()

    async def get_sections_by_class_id(self, class_id: UUID):
        # First validate if class exists
        class_exists = await self.class_repo.get_by_id(class_id)
        if not class_exists:
            raise HTTPException(status_code=404, detail=f"Class with id {class_id} not found")
        return await self.section_repo.get_sections_by_class_id(class_id)

    async def get_section_by_id(self, section_id: UUID):
        section = await self.section_repo.get_by_id(section_id)
        if not section:
            raise HTTPException(status_code=404, detail="Section not found")
        return section

    async def create_section(self, section: SectionCreate):
        # Validate if class exists
        class_exists = await self.class_repo.get_by_id(section.class_id)
        if not class_exists:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid class_id: Class with id {section.class_id} does not exist"
            )
        return await self.section_repo.create(section)

    async def update_section(self, section_id: UUID, section: SectionUpdate):
        # If class_id is being updated, validate if new class exists
        if section.class_id:
            class_exists = await self.class_repo.get_by_id(section.class_id)
            if not class_exists:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid class_id: Class with id {section.class_id} does not exist"
                )

        updated_section = await self.section_repo.update(section_id, section)
        if not updated_section:
            raise HTTPException(status_code=404, detail="Section not found")
        return updated_section

    async def delete_section(self, section_id: UUID):
        deleted_section = await self.section_repo.delete(section_id)
        if not deleted_section:
            raise HTTPException(status_code=404, detail="Section not found")
        return {"message": "Section deleted"}