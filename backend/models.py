from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum, DECIMAL, Boolean, DateTime
from sqlalchemy.orm import relationship
from database import Base
import enum
from datetime import datetime

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
    id = Column(Integer, primary_key=True, index=True)
    year = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=False)
    
    # Relationships
    students = relationship("Student", back_populates="academic_year")
    classes = relationship("Class", back_populates="academic_year")

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
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
    class_id = Column(Integer, ForeignKey("classes.id"))
    section_id = Column(Integer, ForeignKey("sections.id"))
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"))

    # Relationships
    class_ = relationship("Class", back_populates="students")
    section = relationship("Section", back_populates="students")
    fee_payments = relationship("FeePayment", back_populates="student")
    academic_year = relationship("AcademicYear", back_populates="students")

class Class(Base):
    __tablename__ = "classes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    academic_year_id = Column(Integer, ForeignKey("academic_years.id"))
    
    # Relationships
    academic_year = relationship("AcademicYear", back_populates="classes")
    students = relationship("Student", back_populates="class_")
    sections = relationship("Section", back_populates="class_")

class Section(Base):
    __tablename__ = "sections"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"))
    class_ = relationship("Class", back_populates="sections")
    students = relationship("Student", back_populates="section")

class FeePayment(Base):
    __tablename__ = "fee_payments"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    month = Column(Enum(Month))
    tuition_fees = Column(DECIMAL(10, 2))  # Amount being paid for tuition
    auto_fees = Column(DECIMAL(10, 2))     # Amount being paid for auto
    day_boarding_fees = Column(DECIMAL(10, 2))  # Amount being paid for day boarding
    total_amount = Column(DECIMAL(10, 2))  # Total of all fees being paid
    transaction_date = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    student = relationship("Student", back_populates="fee_payments")