from sqlalchemy.orm import Session
from models import Class
from schemas import ClassCreate, ClassUpdate

class ClassRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(Class).all()

    def get_by_id(self, class_id: int):
        return self.db.query(Class).filter(Class.id == class_id).first()

    def create(self, cls: ClassCreate):
        db_class = Class(**cls.dict())
        self.db.add(db_class)
        self.db.commit()
        self.db.refresh(db_class)
        return db_class

    def update(self, class_id: int, cls: ClassUpdate):
        db_class = self.get_by_id(class_id)
        if not db_class:
            return None
        for key, value in cls.dict(exclude_unset=True).items():
            setattr(db_class, key, value)
        self.db.commit()
        self.db.refresh(db_class)
        return db_class

    def delete(self, class_id: int):
        db_class = self.get_by_id(class_id)
        if not db_class:
            return None
        self.db.delete(db_class)
        self.db.commit()
        return db_class