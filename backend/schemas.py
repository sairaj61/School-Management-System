from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
import re
from decimal import Decimal
from enum import Enum

class Month(str, Enum):
    JAN = "JAN"
    FEB = "FEB"
    MAR = "MAR"
    APR = "APR"
    MAY = "MAY"
    JUN = "JUN"
    JUL = "JUL"
    AUG = "AUG"
    SEP = "SEP"
    OCT = "OCT"
    NOV = "NOV"
    DEC = "DEC"

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

class StudentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    father_name: str = Field(..., min_length=1, max_length=100)
    mother_name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: str
    contact: str = Field(..., min_length=10, max_length=15)
    address: str = Field(..., min_length=1, max_length=200)
    enrollment_date: str
    tuition_fees: Decimal = Field(..., ge=0)
    auto_fees: Decimal = Field(..., ge=0)
    day_boarding_fees: Decimal = Field(..., ge=0)
    class_id: int = Field(..., gt=0)
    section_id: int = Field(..., gt=0)
    academic_year_id: int = Field(..., gt=0)

    @validator("date_of_birth", "enrollment_date")
    def validate_date(cls, value):
        try:
            datetime.strptime(value, "%Y-%m-%d")
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")
        return value

    @validator("date_of_birth")
    def dob_before_enrollment(cls, value, values):
        if "enrollment_date" in values:
            dob = datetime.strptime(value, "%Y-%m-%d")
            enroll = datetime.strptime(values["enrollment_date"], "%Y-%m-%d")
            if dob >= enroll:
                raise ValueError("Date of birth must be before enrollment date")
        return value

    @validator("contact")
    def validate_contact(cls, value):
        if not re.match(r"^\+?\d{10,15}$", value):
            raise ValueError("Contact must be a valid phone number (10-15 digits)")
        return value

class StudentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
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

    @validator("date_of_birth", "enrollment_date")
    def validate_date(cls, value):
        if value:
            try:
                datetime.strptime(value, "%Y-%m-%d")
            except ValueError:
                raise ValueError("Date must be in YYYY-MM-DD format")
        return value

    @validator("contact")
    def validate_contact(cls, value):
        if value and not re.match(r"^\+?\d{10,15}$", value):
            raise ValueError("Contact must be a valid phone number (10-15 digits)")
        return value

class StudentResponse(BaseModel):
    id: int
    name: str
    father_name: str
    mother_name: str
    date_of_birth: str
    contact: str
    address: str
    enrollment_date: str
    tuition_fees: Decimal
    auto_fees: Decimal
    day_boarding_fees: Decimal
    class_id: int
    section_id: int
    academic_year_id: int

    class Config:
        orm_mode = True

class ClassCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    academic_year_id: int = Field(..., gt=0)

    @validator("academic_year_id")
    def validate_academic_year(cls, value):
        if not re.match(r"^\d{4}-\d{4}$", value):
            raise ValueError("Academic year must be in YYYY-YYYY format")
        start, end = map(int, value.split("-"))
        if end != start + 1:
            raise ValueError("Academic year must span one year (e.g., 2023-2024)")
        return value

class ClassUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    academic_year_id: Optional[int] = Field(None, gt=0)

    @validator("academic_year_id")
    def validate_academic_year(cls, value):
        if value and not re.match(r"^\d{4}-\d{4}$", value):
            raise ValueError("Academic year must be in YYYY-YYYY format")
        if value:
            start, end = map(int, value.split("-"))
            if end != start + 1:
                raise ValueError("Academic year must span one year (e.g., 2023-2024)")
        return value

class ClassResponse(BaseModel):
    id: int
    name: str
    academic_year_id: int

    class Config:
        orm_mode = True

class SectionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    class_id: int = Field(..., gt=0)

class SectionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    class_id: Optional[int] = Field(None, gt=0)

class SectionResponse(BaseModel):
    id: int
    name: str
    class_id: int

    class Config:
        orm_mode = True

class FeePaymentCreate(BaseModel):
    student_id: int = Field(..., gt=0)
    academic_year_id: int = Field(..., gt=0)
    month: Month
    amount: Decimal = Field(..., ge=0)
    balance: Decimal = Field(..., ge=0)

class FeePaymentUpdate(BaseModel):
    student_id: Optional[int] = Field(None, gt=0)
    academic_year_id: Optional[int] = Field(None, gt=0)
    month: Optional[Month]
    amount: Optional[Decimal] = Field(None, ge=0)
    balance: Optional[Decimal] = Field(None, ge=0)

class FeePaymentResponse(BaseModel):
    id: int
    student_id: int
    academic_year_id: int
    month: Month
    amount: Decimal
    balance: Decimal

    class Config:
        orm_mode = True

class DashboardResponse(BaseModel):
    total_students: int
    total_payments: float
    total_dues: float
    students_with_payments: list[dict]