import re
from datetime import datetime
from decimal import Decimal
from typing import List
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, validator

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
    id: UUID
    status: str

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
    class_id: UUID
    section_id: UUID
    academic_year_id: UUID


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    roll_number: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    contact: Optional[str] = None
    address: Optional[str] = None
    enrollment_date: Optional[str] = None
    tuition_fees: Optional[Decimal] = None
    auto_fees: Optional[Decimal] = None
    day_boarding_fees: Optional[Decimal] = None
    class_id: Optional[UUID] = None
    section_id: Optional[UUID] = None
    academic_year_id: Optional[UUID] = None


class StudentResponse(StudentBase):
    id: UUID
    class_id: UUID
    section_id: UUID
    academic_year_id: UUID
    status: str

    class Config:
        orm_mode = True


class ClassBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)


class ClassCreate(ClassBase):
    academic_year_id: UUID


class ClassUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    academic_year_id: Optional[UUID] = None


class ClassResponse(ClassBase):
    id: UUID
    academic_year_id: UUID

    class Config:
        orm_mode = True


class SectionBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)


class SectionCreate(SectionBase):
    class_id: UUID


class SectionUpdate(BaseModel):
    name: Optional[str] = None
    class_id: Optional[UUID] = None


class SectionResponse(SectionBase):
    id: UUID
    class_id: UUID

    class Config:
        orm_mode = True


class FeePaymentBase(BaseModel):
    month: Month
    tuition_fees: Decimal = Field(..., ge=0)
    auto_fees: Decimal = Field(..., ge=0)
    day_boarding_fees: Decimal = Field(..., ge=0)
    receipt_number: Optional[str] = Field(None, min_length=1, max_length=20)


class FeePaymentCreate(FeePaymentBase):
    student_id: UUID


class FeePaymentUpdate(BaseModel):
    month: Optional[Month] = None
    tuition_fees: Optional[Decimal] = None
    auto_fees: Optional[Decimal] = None
    day_boarding_fees: Optional[Decimal] = None
    student_id: Optional[UUID] = None
    receipt_number: Optional[str] = None


class FeePaymentResponse(FeePaymentBase):
    id: UUID
    student_id: UUID
    total_amount: Decimal
    transaction_date: datetime
    receipt_number: Optional[str] = Field(None, min_length=0)

    class Config:
        orm_mode = True


class StudentPaymentInfo(BaseModel):
    id: UUID
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


class AutoManagementBase(BaseModel):
    name: str


class AutoManagementCreate(AutoManagementBase):
    pass


class AutoManagementUpdate(AutoManagementBase):
    name: Optional[str] = None


class AutoManagementResponse(AutoManagementBase):
    id: UUID

    class Config:
        orm_mode = True


class AutoStudentMappingBase(BaseModel):
    auto_id: UUID
    student_id: UUID


class AutoStudentMappingCreate(AutoStudentMappingBase):
    pass


class AutoStudentMappingUpdate(AutoStudentMappingBase):
    auto_id: Optional[UUID] = None
    student_id: Optional[UUID] = None


class AutoStudentMappingResponse(AutoStudentMappingBase):
    id: UUID

    class Config:
        orm_mode = True


class StudentDetailResponse(BaseModel):
    id: UUID
    auto_fees: float


class StudentDetailInAutoResponse(BaseModel):
    id: UUID
    name: str
    roll_number: str
    class_name: str
    section_name: str
    contact_number: Optional[str]
    address: Optional[str]
    auto_fees: float

    class Config:
        orm_mode = True


class AutoWithStudentsResponse(BaseModel):
    id: UUID
    name: str
    students: List[UUID]
    total_fees: float
    student_details: List[StudentDetailInAutoResponse]

    class Config:
        orm_mode = True


class AutoStudentBulkAssignRequest(BaseModel):
    auto_id: UUID
    student_ids: List[UUID]


class AutoWithStudentsListResponse(BaseModel):
    autos: List[AutoWithStudentsResponse]

    class Config:
        orm_mode = True
