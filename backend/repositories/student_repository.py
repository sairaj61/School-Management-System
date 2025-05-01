from sqlalchemy.orm import Session
from models import Student
from schemas import StudentCreate, StudentUpdate

class StudentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(Student).all()

    def get_by_id(self, student_id: int):
        return self.db.query(Student).filter(Student.id == student_id).first()

    def create(self, student: StudentCreate):
        db_student = Student(**student.dict())
        self.db.add(db_student)
        self.db.commit()
        self.db.refresh(db_student)
        return db_student

    def update(self, student_id: int, student: StudentUpdate):
        db_student = self.get_by_id(student_id)
        if not db_student:
            return None
        for key, value in student.dict(exclude_unset=True).items():
            setattr(db_student, key, value)
        self.db.commit()
        self.db.refresh(db_student)
        return db_student

    def delete(self, student_id: int):
        db_student = self.get_by_id(student_id)
        if not db_student:
            return None
        self.db.delete(db_student)
        self.db.commit()
        return db_student