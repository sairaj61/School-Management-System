from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from models import Section
from schemas import SectionCreate, SectionUpdate
from fastapi import HTTPException
from uuid import UUID


class SectionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self):
        result = await self.db.execute(select(Section))
        return result.scalars().all()

    async def get_by_id(self, section_id: UUID):
        result = await self.db.execute(select(Section).filter(Section.id == section_id))
        return result.scalar_one_or_none()

    async def get_sections_by_class_id(self, class_id: UUID):
        result = await self.db.execute(select(Section).filter(Section.class_id == class_id))
        return result.scalars().all()

    async def get_by_name_and_class(self, name: str, class_id: UUID):
        result = await self.db.execute(
            select(Section).filter(
                Section.name == name,
                Section.class_id == class_id
            )
        )
        return result.scalar_one_or_none()

    async def create(self, section: SectionCreate):
        # Check if section with the same name exists in the same class
        existing_section = await self.get_by_name_and_class(section.name, section.class_id)
        if existing_section:
            raise HTTPException(
                status_code=400,
                detail=f"Section with name '{section.name}' already exists in this class"
            )

        try:
            db_section = Section(**section.dict())
            self.db.add(db_section)
            await self.db.commit()
            await self.db.refresh(db_section)
            return db_section
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(
                status_code=400,
                detail="Error creating section. Please check your input."
            )

    async def update(self, section_id: UUID, section: SectionUpdate):
        db_section = await self.get_by_id(section_id)
        if not db_section:
            return None

        # If name or class_id is being updated, check for duplicates
        if section.name or section.class_id:
            check_name = section.name if section.name else db_section.name
            check_class = section.class_id if section.class_id else db_section.class_id

            # Check for existing section with the same name in the same class (excluding current section)
            existing_section = await self.get_by_name_and_class(check_name, check_class)
            if existing_section and existing_section.id != section_id:
                raise HTTPException(
                    status_code=400,
                    detail=f"Section with name '{check_name}' already exists in this class"
                )

        try:
            for key, value in section.dict(exclude_unset=True).items():
                setattr(db_section, key, value)
            await self.db.commit()
            await self.db.refresh(db_section)
            return db_section
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(
                status_code=400,
                detail="Error updating section. Please check your input."
            )

    async def delete(self, section_id: UUID):
        db_section = await self.get_by_id(section_id)
        if not db_section:
            return None
        await self.db.delete(db_section)
        await self.db.commit()
        return db_section