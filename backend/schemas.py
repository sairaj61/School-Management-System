from pydantic import BaseModel
from typing import Optional

class StudentCreate(BaseModel):
    name: str
    date_of_birth: str
    contact: str
    address: str
    enrollment_date: str
    class_id: int
    section_id: int

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    date_of_birth: Optional[str] = None
    contact: Optional[str] = None
    address: Optional[str] = None
    enrollment_date: Optional[str] = None
    class_id: Optional[int] = None
    section_id: Optional[int] = None

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
    name: str
    academic_year: str

class ClassUpdate(BaseModel):
    name: Optional[str] = None
    academic_year: Optional[str] = None

class ClassResponse(BaseModel):
    id: int
    name: str
    academic_year: str

    class Config:
        orm_mode = True

class SectionCreate(BaseModel):
    name: str
    class_id: int

class SectionUpdate(BaseModel):
    name: Optional[str] = None
    class_id: Optional[int] = None

class SectionResponse(BaseModel):
    id: int
    name: str
    class_id: int

    class Config:
        orm_mode = True

class FeePaymentCreate(BaseModel):
    student_id: int
    amount: float
    academic_year: str
    balance: float

class FeePaymentUpdate(BaseModel):
    student_id: Optional[int] = None
    amount: Optional[float] = None
    academic_year: Optional[str] = None
    balance: Optional[float] = None

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