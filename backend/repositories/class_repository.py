from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from models import Class
from schemas import ClassCreate, ClassUpdate
from uuid import UUID


class ClassRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self):
        result = await self.db.execute(select(Class))
        return result.scalars().all()

    async def get_by_id(self, class_id: UUID):
        result = await self.db.execute(select(Class).filter(Class.id == class_id))
        return result.scalar_one_or_none()

    async def get_by_name_and_year(self, name: str, academic_year_id: UUID):
        result = await self.db.execute(
            select(Class).filter(
                Class.name == name,
                Class.academic_year_id == academic_year_id
            )
        )
        return result.scalar_one_or_none()

    async def create(self, class_: ClassCreate):
        # Check if class with the same name exists in the same academic year
        existing_class = await self.get_by_name_and_year(class_.name, class_.academic_year_id)
        if existing_class:
            raise HTTPException(
                status_code=400,
                detail=f"Class with name '{class_.name}' already exists in this academic year"
            )

        try:
            db_class = Class(**class_.dict())
            self.db.add(db_class)
            await self.db.commit()
            await self.db.refresh(db_class)
            return db_class
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(
                status_code=400,
                detail="Error creating class. Please check your input."
            )

    async def update(self, class_id: UUID, class_: ClassUpdate):
        db_class = await self.get_by_id(class_id)
        if not db_class:
            return None

        # If either name or academic_year_id is being updated, check for duplicates
        if class_.name or class_.academic_year_id:
            # Use new values if provided, otherwise use existing values
            check_name = class_.name if class_.name else db_class.name
            check_year_id = class_.academic_year_id if class_.academic_year_id else db_class.academic_year_id

            # Check for existing class with the same name in the same academic year (excluding current class)
            existing_class = await self.get_by_name_and_year(check_name, check_year_id)
            if existing_class and existing_class.id != class_id:
                raise HTTPException(
                    status_code=400,
                    detail=f"Class with name '{check_name}' already exists in this academic year"
                )

        try:
            update_data = class_.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_class, key, value)

            await self.db.commit()
            await self.db.refresh(db_class)
            return db_class
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(
                status_code=400,
                detail="Error updating class. Please check your input."
            )

    async def delete(self, class_id: UUID):
        db_class = await self.get_by_id(class_id)
        if not db_class:
            return None
        await self.db.delete(db_class)
        await self.db.commit()
        return db_class