from sqlalchemy.orm import Session
from models import FeePayment
from schemas import FeePaymentCreate, FeePaymentUpdate

class FeePaymentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(FeePayment).all()

    def get_by_id(self, payment_id: int):
        return self.db.query(FeePayment).filter(FeePayment.id == payment_id).first()

    def create(self, payment: FeePaymentCreate):
        db_payment = FeePayment(**payment.dict())
        self.db.add(db_payment)
        self.db.commit()
        self.db.refresh(db_payment)
        return db_payment

    def update(self, payment_id: int, payment: FeePaymentUpdate):
        db_payment = self.get_by_id(payment_id)
        if not db_payment:
            return None
        for key, value in payment.dict(exclude_unset=True).items():
            setattr(db_payment, key, value)
        self.db.commit()
        self.db.refresh(db_payment)
        return db_payment

    def delete(self, payment_id: int):
        db_payment = self.get_by_id(payment_id)
        if not db_payment:
            return None
        self.db.delete(db_payment)
        self.db.commit()
        return db_payment