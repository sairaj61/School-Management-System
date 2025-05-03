from fastapi import HTTPException

from repositories.fee_payment_repository import FeePaymentRepository
from repositories.student_repository import StudentRepository
from schemas import FeePaymentCreate, FeePaymentUpdate


class FeePaymentService:
    def __init__(self, db):
        self.payment_repo = FeePaymentRepository(db)
        self.student_repo = StudentRepository(db)

    def get_all_payments(self):
        return self.payment_repo.get_all()

    def get_payment_by_id(self, payment_id: int):
        payment = self.payment_repo.get_by_id(payment_id)
        if not payment:
            raise HTTPException(status_code=404, detail="Fee payment not found")
        return payment

    def create_payment(self, payment: FeePaymentCreate):
        if not self.student_repo.get_by_id(payment.student_id):
            raise HTTPException(status_code=400, detail="Invalid student_id: Student does not exist")
        return self.payment_repo.create(payment)

    def update_payment(self, payment_id: int, payment: FeePaymentUpdate):
        if payment.student_id and not self.student_repo.get_by_id(payment.student_id):
            raise HTTPException(status_code=400, detail="Invalid student_id: Student does not exist")
        updated_payment = self.payment_repo.update(payment_id, payment)
        if not updated_payment:
            raise HTTPException(status_code=404, detail="Fee payment not found")
        return updated_payment

    def delete_payment(self, payment_id: int):
        deleted_payment = self.payment_repo.delete(payment_id)
        if not deleted_payment:
            raise HTTPException(status_code=404, detail="Fee payment not found")
        return {"message": "Fee payment deleted"}