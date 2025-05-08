import enum
from datetime import datetime

from sqlalchemy import Column, String, Boolean
from sqlalchemy import ForeignKey, Enum, DECIMAL, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import Base
from utils.uuid_generator import generate_time_based_uuid


class Month(str, enum.Enum):
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


class AcademicYear(Base):
    __tablename__ = "academic_years"
    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_time_based_uuid)
    year = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=False)

    # Relationships
    students = relationship("Student", back_populates="academic_year")
    classes = relationship("Class", back_populates="academic_year")


class Student(Base):
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
    day_boarding_fees = Column(DECIMAL(10, 2))
    class_id = Column(UUID(as_uuid=True), ForeignKey("classes.id"))
    section_id = Column(UUID(as_uuid=True), ForeignKey("sections.id"))
    academic_year_id = Column(UUID(as_uuid=True), ForeignKey("academic_years.id"))

    # Relationships
    class_ = relationship("Class", back_populates="students")
    section = relationship("Section", back_populates="students")
    fee_payments = relationship("FeePayment", back_populates="student")
    academic_year = relationship("AcademicYear", back_populates="students")


class Class(Base):
    __tablename__ = "classes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_time_based_uuid)
    name = Column(String, index=True)
    academic_year_id = Column(UUID(as_uuid=True), ForeignKey("academic_years.id"))

    # Relationships
    academic_year = relationship("AcademicYear", back_populates="classes")
    students = relationship("Student", back_populates="class_")
    sections = relationship("Section", back_populates="class_")


class Section(Base):
    __tablename__ = "sections"
    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_time_based_uuid)
    name = Column(String, index=True)
    class_id = Column(UUID(as_uuid=True), ForeignKey("classes.id"))
    class_ = relationship("Class", back_populates="sections")
    students = relationship("Student", back_populates="section")


class FeePayment(Base):
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

    # Relationships
    student = relationship("Student", back_populates="fee_payments")


class AutoManagement(Base):
    __tablename__ = "auto_management"
    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_time_based_uuid)
    name = Column(String, nullable=False)

    # Relationship
    students = relationship("AutoStudentMapping", back_populates="auto")


class AutoStudentMapping(Base):
    __tablename__ = "auto_student_mapping"
    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_time_based_uuid)
    auto_id = Column(UUID(as_uuid=True), ForeignKey("auto_management.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)

    # Relationships
    auto = relationship("AutoManagement", back_populates="students")
    student = relationship("Student", backref="auto_mappings")



