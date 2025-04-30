import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
from typing import List, Optional

# Database Setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./school.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class StudentDB(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    date_of_birth = Column(String)
    contact = Column(String)
    address = Column(String)
    enrollment_date = Column(String)
    class_id = Column(Integer, ForeignKey("classes.id"))
    section_id = Column(Integer, ForeignKey("sections.id"))

class ClassDB(Base):
    __tablename__ = "classes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    academic_year = Column(String)

class SectionDB(Base):
    __tablename__ = "sections"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"))

class FeeStructureDB(Base):
    __tablename__ = "fee_structures"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String)
    amount = Column(Float)
    academic_year = Column(String)
    due_date = Column(String)

class FeePaymentDB(Base):
    __tablename__ = "fee_payments"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    fee_structure_id = Column(Integer, ForeignKey("fee_structures.id"))
    amount_paid = Column(Float)
    payment_date = Column(DateTime, default=datetime.utcnow)
    balance = Column(Float)

class CarRentDB(Base):
    __tablename__ = "car_rents"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    amount = Column(Float)
    academic_year = Column(String)

# Create Tables
Base.metadata.create_all(bind=engine)

# Pydantic Models
class StudentCreate(BaseModel):
    name: str
    date_of_birth: str
    contact: str
    address: str
    enrollment_date: str
    class_id: int
    section_id: int

class StudentResponse(BaseModel):
    id: int
    name: str
    date_of_birth: str
    contact: str
    address: str
    enrollment_date: str
    class_id: int
    section_id: int

class FeePaymentCreate(BaseModel):
    student_id: int
    fee_structure_id: int
    amount_paid: float

class FeePaymentResponse(BaseModel):
    id: int
    student_id: int
    fee_structure_id: int
    amount_paid: float
    payment_date: datetime
    balance: float

class DashboardResponse(BaseModel):
    total_students: int
    total_payments: float
    total_dues: float
    monthly_breakdown: List[dict]

# FastAPI App
app = FastAPI(title="School Management System")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# CRUD Endpoints
@app.post("/students/", response_model=StudentResponse)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    db_student = StudentDB(**student.dict())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@app.get("/students/", response_model=List[StudentResponse])
def read_students(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    students = db.query(StudentDB).offset(skip).limit(limit).all()
    return students

@app.get("/students/{student_id}", response_model=StudentResponse)
def read_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(StudentDB).filter(StudentDB.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@app.put("/students/{student_id}", response_model=StudentResponse)
def update_student(student_id: int, student: StudentCreate, db: Session = Depends(get_db)):
    db_student = db.query(StudentDB).filter(StudentDB.id == student_id).first()
    if db_student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    for key, value in student.dict().items():
        setattr(db_student, key, value)
    db.commit()
    db.refresh(db_student)
    return db_student

@app.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    db_student = db.query(StudentDB).filter(StudentDB.id == student_id).first()
    if db_student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(db_student)
    db.commit()
    return {"detail": "Student deleted"}

@app.post("/fee_payments/", response_model=FeePaymentResponse)
def create_fee_payment(payment: FeePaymentCreate, db: Session = Depends(get_db)):
    fee_structure = db.query(FeeStructureDB).filter(FeeStructureDB.id == payment.fee_structure_id).first()
    if fee_structure is None:
        raise HTTPException(status_code=404, detail="Fee structure not found")
    total_due = fee_structure.amount
    existing_payments = db.query(FeePaymentDB).filter(FeePaymentDB.student_id == payment.student_id, FeePaymentDB.fee_structure_id == payment.fee_structure_id).all()
    total_paid = sum(p.amount_paid for p in existing_payments) + payment.amount_paid
    balance = total_due - total_paid
    db_payment = FeePaymentDB(**payment.dict(), balance=balance)
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

@app.get("/dashboard/", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    total_students = db.query(StudentDB).count()
    total_payments = db.query(FeePaymentDB).with_entities(func.sum(FeePaymentDB.amount_paid)).scalar() or 0
    total_dues = db.query(FeeStructureDB).join(FeePaymentDB, isouter=True).with_entities(func.sum(FeeStructureDB.amount - FeePaymentDB.balance)).scalar() or 0
    monthly_breakdown = [
        {"month": "2025-01", "payments": 1000.0, "dues": 500.0}  # Sample data
    ]
    return {
        "total_students": total_students,
        "total_payments": total_payments,
        "total_dues": total_dues,
        "monthly_breakdown": monthly_breakdown
    }

# Sample Data
def init_db():
    with SessionLocal() as db:
        if db.query(ClassDB).count() == 0:
            db.add(ClassDB(name="Grade 1", academic_year="2025"))
            db.add(SectionDB(name="Section A", class_id=1))
            db.add(FeeStructureDB(category="Tuition", amount=1000.0, academic_year="2025", due_date="2025-06-01"))
            db.commit()

if __name__ == "__main__":
    init_db()
    uvicorn.run(app, host="0.0.0.0", port=8000)