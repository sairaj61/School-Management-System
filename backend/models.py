from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    date_of_birth = Column(String)
    contact = Column(String)
    address = Column(String)
    enrollment_date = Column(String)
    class_id = Column(Integer, ForeignKey("classes.id"))
    section_id = Column(Integer, ForeignKey("sections.id"))
    class_ = relationship("Class", back_populates="students")
    section = relationship("Section", back_populates="students")
    fee_payments = relationship("FeePayment", back_populates="student")

class Class(Base):
    __tablename__ = "classes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    academic_year = Column(String)
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
    amount = Column(Float)
    academic_year = Column(String)
    balance = Column(Float)
    student = relationship("Student", back_populates="fee_payments")