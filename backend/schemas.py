from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
import re

class StudentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: str
    contact: str = Field(..., min_length=10, max_length=15)
    address: str = Field(..., min_length=1, max_length=200)
    enrollment_date: str
    class_id: int = Field(..., gt=0)
    section_id: int = Field(..., gt=0)

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
    date_of_birth: Optional[str]
    contact: Optional[str] = Field(None, min_length=10, max_length=15)
    address: Optional[str] = Field(None, min_length=1, max_length=200)
    enrollment_date: Optional[str]
    class_id: Optional[int] = Field(None, gt=0)
    section_id: Optional[int] = Field(None, gt=0)

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
    date_of_birth: str
    contact: str
    address: str
    enrollment_date: str
    class_id: int
    section_id: int

    class Config:
        orm_mode = True

class ClassCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    academic_year: str

    @validator("academic_year")
    def validate_academic_year(cls, value):
        if not re.match(r"^\d{4}-\d{4}$", value):
            raise ValueError("Academic year must be in YYYY-YYYY format")
        start, end = map(int, value.split("-"))
        if end != start + 1:
            raise ValueError("Academic year must span one year (e.g., 2023-2024)")
        return value

class ClassUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    academic_year: Optional[str]

    @validator("academic_year")
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
    academic_year: str

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
    amount: float = Field(..., ge=0)
    academic_year: str
    balance: float = Field(..., ge=0)

    @validator("academic_year")
    def validate_academic_year(cls, value):
        if not re.match(r"^\d{4}-\d{4}$", value):
            raise ValueError("Academic year must be in YYYY-YYYY format")
        start, end = map(int, value.split("-"))
        if end != start + 1:
            raise ValueError("Academic year must span one year (e.g., 2023-2024)")
        return value

class FeePaymentUpdate(BaseModel):
    student_id: Optional[int] = Field(None, gt=0)
    amount: Optional[float] = Field(None, ge=0)
    academic_year: Optional[str]
    balance: Optional[float] = Field(None, ge=0)

    @validator("academic_year")
    def validate_academic_year(cls, value):
        if value and not re.match(r"^\d{4}-\d{4}$", value):
            raise ValueError("Academic year must be in YYYY-YYYY format")
        if value:
            start, end = map(int, value.split("-"))
            if end != start + 1:
                raise ValueError("Academic year must span one year (e.g., 2023-2024)")
        return value

class FeePaymentResponse(BaseModel):
    id: int
    student_id: int
    amount: float
    academic_year: str
    balance: float

    class Config:
        orm_mode = True

class DashboardResponse(BaseModel):
    total_students: int
    total_payments: float
    total_dues: float
    students_with_payments: list[dict]