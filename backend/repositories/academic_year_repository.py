from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from models import AcademicYear
from schemas import AcademicYearCreate, AcademicYearUpdate


class AcademicYearRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self):
        result = await self.db.execute(select(AcademicYear))
        return result.scalars().all()

    async def get_by_id(self, year_id: UUID):
        result = await self.db.execute(select(AcademicYear).where(AcademicYear.id == year_id))
        return result.scalar_one_or_none()

    async def get_by_year(self, year: str):
        result = await self.db.execute(select(AcademicYear).where(AcademicYear.year == year))
        return result.scalar_one_or_none()

    async def create(self, academic_year: AcademicYearCreate):
        existing_year = await self.get_by_year(academic_year.year)
        if existing_year:
            raise HTTPException(status_code=400, detail=f"Academic year '{academic_year.year}' already exists")

        try:
            db_academic_year = AcademicYear(**academic_year.dict(), is_active=True)
            await self.deactivate_all_years()
            self.db.add(db_academic_year)
            await self.db.commit()
            await self.db.refresh(db_academic_year)
            return db_academic_year
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(status_code=400, detail="Error creating academic year.")

    async def update(self, year_id: UUID, academic_year: AcademicYearUpdate):
        db_academic_year = await self.get_by_id(year_id)
        if not db_academic_year:
            return None

        if academic_year.year and academic_year.year != db_academic_year.year:
            result = await self.db.execute(
                select(AcademicYear).where(
                    AcademicYear.year == academic_year.year,
                    AcademicYear.id != year_id
                )
            )
            existing_year = result.scalar_one_or_none()
            if existing_year:
                raise HTTPException(status_code=400, detail=f"Academic year '{academic_year.year}' already exists")

        try:
            for key, value in academic_year.dict(exclude_unset=True).items():
                setattr(db_academic_year, key, value)
            await self.db.commit()
            await self.db.refresh(db_academic_year)
            return db_academic_year
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(status_code=400, detail="Error updating academic year.")

    async def delete(self, year_id: UUID):
        db_academic_year = await self.get_by_id(year_id)
        if not db_academic_year:
            return None
        await self.db.delete(db_academic_year)
        await self.db.commit()
        return db_academic_year

    async def deactivate_all_years(self):
        await self.db.execute(update(AcademicYear).values(is_active=False))
        await self.db.commit()

    async def activate_year(self, year_id: UUID):
        db_academic_year = await self.get_by_id(year_id)
        if not db_academic_year:
            raise HTTPException(status_code=404, detail="Academic year not found")
        await self.deactivate_all_years()
        db_academic_year.is_active = True
        await self.db.commit()
        await self.db.refresh(db_academic_year)
        return db_academic_year

    async def deactivate_year(self, year_id: UUID):
        db_academic_year = await self.get_by_id(year_id)
        if not db_academic_year:
            raise HTTPException(status_code=404, detail="Academic year not found")
        if not db_academic_year.is_active:
            raise HTTPException(status_code=400, detail="Academic year is already inactive")
        db_academic_year.is_active = False
        await self.db.commit()
        await self.db.refresh(db_academic_year)
        return db_academic_year
