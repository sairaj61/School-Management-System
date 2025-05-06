from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models import AutoManagement, AutoStudentMapping
from schemas import AutoManagementCreate, AutoManagementUpdate, AutoStudentMappingCreate
from fastapi import HTTPException
from uuid import UUID


class AutoManagementRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self):
        result = await self.db.execute(select(AutoManagement))
        return result.scalars().all()

    async def get_by_id(self, auto_id: UUID):
        result = await self.db.execute(select(AutoManagement).filter(AutoManagement.id == auto_id))
        return result.scalar_one_or_none()

    async def create(self, auto: AutoManagementCreate):
        db_auto = AutoManagement(**auto.dict())
        self.db.add(db_auto)
        await self.db.commit()
        await self.db.refresh(db_auto)
        return db_auto

    async def update(self, auto_id: UUID, auto: AutoManagementUpdate):
        db_auto = await self.get_by_id(auto_id)
        if not db_auto:
            return None

        for key, value in auto.dict(exclude_unset=True).items():
            setattr(db_auto, key, value)

        await self.db.commit()
        await self.db.refresh(db_auto)
        return db_auto

    async def delete(self, auto_id: UUID):
        db_auto = await self.get_by_id(auto_id)
        if not db_auto:
            return None
        await self.db.delete(db_auto)
        await self.db.commit()
        return db_auto

    async def delete_auto(self, auto_id: UUID):
        try:
            # First, delete all student mappings for this auto
            mappings = await self.db.execute(
                select(AutoStudentMapping).filter(AutoStudentMapping.auto_id == auto_id)
            )
            mappings_list = mappings.scalars().all()  # Get the list of mappings

            if mappings_list:
                for mapping in mappings_list:
                    await self.db.delete(mapping)

            # Then, delete the auto
            auto = await self.get_by_id(auto_id)
            if not auto:
                raise HTTPException(status_code=404, detail="Auto not found")

            await self.db.delete(auto)
            await self.db.commit()

            return {"message": "Auto and its mappings deleted successfully"}
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(status_code=500, detail=str(e))


class AutoStudentMappingRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self):
        result = await self.db.execute(select(AutoStudentMapping))
        return result.scalars().all()

    async def get_by_auto_id(self, auto_id: UUID):
        result = await self.db.execute(select(AutoStudentMapping).filter(AutoStudentMapping.auto_id == auto_id))
        return result.scalars().all()

    async def create(self, mapping: AutoStudentMappingCreate):
        db_mapping = AutoStudentMapping(**mapping.dict())
        self.db.add(db_mapping)
        await self.db.commit()
        await self.db.refresh(db_mapping)
        return db_mapping

    async def delete_by_student(self, student_id: UUID):
        await self.db.execute(
            select(AutoStudentMapping).filter(AutoStudentMapping.student_id == student_id).delete(synchronize_session=False)
        )
        await self.db.commit()

    async def delete_by_auto(self, auto_id: UUID):
        """Delete all mappings for a specific auto"""
        await self.db.execute(
            select(AutoStudentMapping).filter(AutoStudentMapping.auto_id == auto_id).delete(synchronize_session=False)
        )
        await self.db.commit()

    async def get_students_by_auto(self, auto_id: UUID):
        """Get all student IDs mapped to an auto"""
        result = await self.db.execute(select(AutoStudentMapping).filter(AutoStudentMapping.auto_id == auto_id))
        return [mapping.student_id for mapping in result.scalars().all()]