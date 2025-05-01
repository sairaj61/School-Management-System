from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
import re
from decimal import Decimal
from models import Month

# Base Models
class AcademicYearBase(BaseModel):
    year: str = Field(..., min_length=4, max_length=9)

    @validator('year')
    def validate_year_format(cls, v):
        # Check for YYYY format
        if re.match(r'^\d{4}$', v):
            return v
        # Check for YYYY-YYYY format
        if re.match(r'^\d{4}-\d{4}$', v):
            start, end = map(int, v.split('-'))
            if end != start + 1:
                raise ValueError("For YYYY-YYYY format, second year must be first year + 1")
            return v
        raise ValueError("Year must be in YYYY or YYYY-YYYY format")

class AcademicYearCreate(AcademicYearBase):
    pass

class AcademicYearUpdate(AcademicYearBase):
    pass

class AcademicYear(AcademicYearBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True

class StudentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    roll_number: Optional[str] = Field(None, min_length=1, max_length=20)
    father_name: str = Field(..., min_length=1, max_length=100)
    mother_name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: str
    contact: str = Field(..., min_length=10, max_length=15)
    address: str = Field(..., min_length=1, max_length=200)
    enrollment_date: str
    tuition_fees: Decimal = Field(..., ge=0)
    auto_fees: Decimal = Field(..., ge=0)
    day_boarding_fees: Decimal = Field(..., ge=0)

class StudentCreate(StudentBase):
    class_id: int = Field(..., gt=0)
    section_id: int = Field(..., gt=0)
    academic_year_id: int = Field(..., gt=0)

class StudentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    roll_number: Optional[str] = Field(None, min_length=1, max_length=20)
    father_name: Optional[str] = Field(None, min_length=1, max_length=100)
    mother_name: Optional[str] = Field(None, min_length=1, max_length=100)
    date_of_birth: Optional[str]
    contact: Optional[str] = Field(None, min_length=10, max_length=15)
    address: Optional[str] = Field(None, min_length=1, max_length=200)
    enrollment_date: Optional[str]
    tuition_fees: Optional[Decimal] = Field(None, ge=0)
    auto_fees: Optional[Decimal] = Field(None, ge=0)
    day_boarding_fees: Optional[Decimal] = Field(None, ge=0)
    class_id: Optional[int] = Field(None, gt=0)
    section_id: Optional[int] = Field(None, gt=0)
    academic_year_id: Optional[int] = Field(None, gt=0)

class StudentResponse(StudentBase):
    id: int
    class_id: int
    section_id: int
    academic_year_id: int

    class Config:
        orm_mode = True

class ClassBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)

class ClassCreate(ClassBase):
    academic_year_id: int = Field(..., gt=0)

class ClassUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    academic_year_id: Optional[int] = Field(None, gt=0)

class ClassResponse(ClassBase):
    id: int
    academic_year_id: int

    class Config:
        orm_mode = True

class SectionBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)

class SectionCreate(SectionBase):
    class_id: int = Field(..., gt=0)

class SectionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    class_id: Optional[int] = Field(None, gt=0)

class SectionResponse(SectionBase):
    id: int
    class_id: int

    class Config:
        orm_mode = True

class FeePaymentBase(BaseModel):
    month: Month
    tuition_fees: Decimal = Field(..., ge=0)
    auto_fees: Decimal = Field(..., ge=0)
    day_boarding_fees: Decimal = Field(..., ge=0)

class FeePaymentCreate(FeePaymentBase):
    student_id: int = Field(..., gt=0)

class FeePaymentUpdate(BaseModel):
    month: Optional[Month]
    tuition_fees: Optional[Decimal] = Field(None, ge=0)
    auto_fees: Optional[Decimal] = Field(None, ge=0)
    day_boarding_fees: Optional[Decimal] = Field(None, ge=0)
    student_id: Optional[int] = Field(None, gt=0)

class FeePaymentResponse(FeePaymentBase):
    id: int
    student_id: int
    total_amount: Decimal
    transaction_date: datetime

    class Config:
        orm_mode = True

class StudentPaymentInfo(BaseModel):
    id: int
    name: str
    total_paid: Decimal
    total_balance: Decimal
    payment_status: str

class DashboardResponse(BaseModel):
    total_students: int
    total_payments: Decimal
    total_dues: Decimal
    students_with_payments: List[StudentPaymentInfo]

    class Config:
        orm_mode = True 