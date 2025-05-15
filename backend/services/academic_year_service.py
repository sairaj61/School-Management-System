from fastapi import HTTPException
from repositories.academic_year_repository import AcademicYearRepository
from schemas import AcademicYearCreate, AcademicYearUpdate
from uuid import UUID


class AcademicYearService:
    def __init__(self, db):
        self.academic_year_repo = AcademicYearRepository(db)

    async def get_all_academic_years(self):
        all_years = await self.academic_year_repo.get_all()
        active_years = [year for year in all_years if year.status == "ACTIVE" or year.status == "ARCHIVED"]
        return active_years

    async def get_academic_year_by_id(self, year_id: UUID):
        academic_year = await self.academic_year_repo.get_by_id(year_id)
        if not academic_year:
            raise HTTPException(status_code=404, detail="Academic year not found")
        return academic_year

    async def create_academic_year(self, academic_year: AcademicYearCreate):
        return await self.academic_year_repo.create(academic_year)

    async def update_academic_year(self, year_id: UUID, academic_year: AcademicYearUpdate):
        updated_year = await self.academic_year_repo.update(year_id, academic_year)
        if not updated_year:
            raise HTTPException(status_code=404, detail="Academic year not found")
        return updated_year

    async def delete_academic_year(self, year_id: UUID):
        deleted_year = await self.academic_year_repo.delete(year_id)
        if not deleted_year:
            raise HTTPException(status_code=404, detail="Academic year not found")
        return {"message": "Academic year deleted"}

    async def activate_academic_year(self, year_id: UUID):
        """Activate an academic year and deactivate others"""
        return await self.academic_year_repo.activate_year(year_id)

    async def deactivate_academic_year(self, year_id: UUID):
        """Deactivate an academic year"""
        return await self.academic_year_repo.deactivate_year(year_id)
