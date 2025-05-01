from fastapi import HTTPException
from repositories.academic_year_repository import AcademicYearRepository
from schemas import AcademicYearCreate, AcademicYearUpdate

class AcademicYearService:
    def __init__(self, db):
        self.academic_year_repo = AcademicYearRepository(db)

    def get_all_academic_years(self):
        # Get all academic years and filter for active ones
        all_years = self.academic_year_repo.get_all()
        active_years = [year for year in all_years if year.is_active]
        return active_years

    def get_active_academic_year(self):
        years = self.academic_year_repo.get_all()
        active_year = next((year for year in years if year.is_active), None)
        if not active_year:
            raise HTTPException(
                status_code=404,
                detail="No active academic year found"
            )
        return active_year

    def get_academic_year_by_id(self, year_id: int):
        academic_year = self.academic_year_repo.get_by_id(year_id)
        if not academic_year:
            raise HTTPException(status_code=404, detail="Academic year not found")
        return academic_year

    def create_academic_year(self, academic_year: AcademicYearCreate):
        return self.academic_year_repo.create(academic_year)

    def update_academic_year(self, year_id: int, academic_year: AcademicYearUpdate):
        updated_year = self.academic_year_repo.update(year_id, academic_year)
        if not updated_year:
            raise HTTPException(status_code=404, detail="Academic year not found")
        return updated_year

    def delete_academic_year(self, year_id: int):
        deleted_year = self.academic_year_repo.delete(year_id)
        if not deleted_year:
            raise HTTPException(status_code=404, detail="Academic year not found")
        return {"message": "Academic year deleted"}

    def activate_academic_year(self, year_id: int):
        """Activate an academic year and deactivate others"""
        return self.academic_year_repo.activate_year(year_id)

    def deactivate_academic_year(self, year_id: int):
        """Deactivate an academic year"""
        return self.academic_year_repo.deactivate_year(year_id) 