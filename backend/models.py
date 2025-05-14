from enum import Enum as PyEnum  # Import Python's Enum
from sqlalchemy import Column, String, Boolean, ForeignKey, Enum, DECIMAL, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
from utils.uuid_generator import generate_time_based_uuid


# ---------- Enums ----------
class Month(str, PyEnum):
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


class RecordStatus(str, PyEnum):
    ACTIVE = "ACTIVE"
    ARCHIVED = "ARCHIVED"
    DELETED = "DELETED"


class StudentStatus(PyEnum):
    ACTIVE = "ACTIVE"
    DROPPED_OFF = "DROPPED_OFF"
    ARCHIVED = "ARCHIVED"
    DELETED = "DELETED"


# ---------- Mixins ----------
class BaseAuditMixin:
    created_by = Column(UUID(as_uuid=True), nullable=True)
    updated_by = Column(UUID(as_uuid=True), nullable=True)
    created_date = Column(DateTime, default=datetime.utcnow)
    updated_date = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class StatusMixin:
    status = Column(Enum(RecordStatus), default=RecordStatus.ACTIVE)


class StudentStatusMixin:
    status = Column(Enum(StudentStatus), default=StudentStatus.ACTIVE)


class AuditMixin(StatusMixin, BaseAuditMixin):
    pass


class StudentAuditMixin(StudentStatusMixin, BaseAuditMixin):
    pass


# ---------- Models ----------
class AcademicYear(Base, AuditMixin):
    __tablename__ = "academic_years"
    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_time_based_uuid)
    year = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=False)

    students = relationship("Student", back_populates="academic_year")
    classes = relationship("Class", back_populates="academic_year")


class Student(Base, StudentAuditMixin):
    __tablename__ = "students"
    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_time_based_uuid)
    name = Column(String, index=True)
    roll_number = Column(String, index=True)
    father_name = Column(String)
    mother_name = Column(String)
    date_of_birth = Column(String)
    contact = Column(String)
    address = Column(String)
    enrollment_date = Column(String)
    tuition_fees = Column(DECIMAL(10, 2))
    auto_fees = Column(DECIMAL(10, 2))

    class_id = Column(UUID(as_uuid=True), ForeignKey("classes.id"))
    section_id = Column(UUID(as_uuid=True), ForeignKey("sections.id"))
    academic_year_id = Column(UUID(as_uuid=True), ForeignKey("academic_years.id"))

    # Relationships
    class_ = relationship("Class", back_populates="students")
    section = relationship("Section", back_populates="students")
    fee_payments = relationship("FeePayment", back_populates="student")
    academic_year = relationship("AcademicYear", back_populates="students")
    day_boarding_history = relationship(
        "DayBoardingHistory", back_populates="student", cascade="all, delete-orphan"
    )

    @property
    def is_currently_in_day_boarding(self):
        return any(h.end_date is None for h in self.day_boarding_history)


class DayBoardingHistory(Base):
    __tablename__ = "day_boarding_history"
    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_time_based_uuid)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    day_boarding_fees = Column(DECIMAL(10, 2))

    student = relationship("Student", back_populates="day_boarding_history")


class Class(Base, AuditMixin):
    __tablename__ = "classes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_time_based_uuid)
    name = Column(String, index=True)
    academic_year_id = Column(UUID(as_uuid=True), ForeignKey("academic_years.id"))

    academic_year = relationship("AcademicYear", back_populates="classes")
    students = relationship("Student", back_populates="class_")
    sections = relationship("Section", back_populates="class_")


class Section(Base, AuditMixin):
    __tablename__ = "sections"
    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_time_based_uuid)
    name = Column(String, index=True)
    class_id = Column(UUID(as_uuid=True), ForeignKey("classes.id"))

    class_ = relationship("Class", back_populates="sections")
    students = relationship("Student", back_populates="section")


class FeePayment(Base, AuditMixin):
    __tablename__ = "fee_payments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_time_based_uuid)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"))
    month = Column(Enum(Month))
    tuition_fees = Column(DECIMAL(10, 2))
    auto_fees = Column(DECIMAL(10, 2))
    day_boarding_fees = Column(DECIMAL(10, 2))
    total_amount = Column(DECIMAL(10, 2))
    transaction_date = Column(DateTime, default=datetime.utcnow)
    receipt_number = Column(String, nullable=True)

    student = relationship("Student", back_populates="fee_payments")


class AutoManagement(Base, AuditMixin):
    __tablename__ = "auto_management"
    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_time_based_uuid)
    name = Column(String, nullable=False)

    students = relationship("AutoStudentMapping", back_populates="auto")


class AutoStudentMapping(Base):
    __tablename__ = "auto_student_mapping"
    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_time_based_uuid)
    auto_id = Column(UUID(as_uuid=True), ForeignKey("auto_management.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)

    auto = relationship("AutoManagement", back_populates="students")
    student = relationship("Student", backref="auto_mappings")
