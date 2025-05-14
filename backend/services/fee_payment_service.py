from uuid import UUID

from fastapi import HTTPException

from models import Student
from repositories.fee_payment_repository import FeePaymentRepository
from repositories.student_repository import StudentRepository
from schemas import FeePaymentCreate, FeePaymentUpdate
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from datetime import datetime
from calendar import monthrange
from decimal import Decimal


class FeePaymentService:
    def __init__(self, db):
        self.payment_repo = FeePaymentRepository(db)
        self.student_repo = StudentRepository(db)

    async def get_all_payments(self):
        return await self.payment_repo.get_all()

    async def get_payment_by_id(self, payment_id: UUID):
        payment = await self.payment_repo.get_by_id(payment_id)
        if not payment:
            raise HTTPException(status_code=404, detail="Fee payment not found")
        return payment

    async def create_payment(self, payment: FeePaymentCreate):
        if not await self.student_repo.get_by_id(payment.student_id):
            raise HTTPException(status_code=400, detail="Invalid student_id: Student does not exist")
        return await self.payment_repo.create(payment)

    async def update_payment(self, payment_id: UUID, payment: FeePaymentUpdate):
        if payment.student_id and not await self.student_repo.get_by_id(payment.student_id):
            raise HTTPException(status_code=400, detail="Invalid student_id: Student does not exist")
        updated_payment = await self.payment_repo.update(payment_id, payment)
        if not updated_payment:
            raise HTTPException(status_code=404, detail="Fee payment not found")
        return updated_payment

    async def delete_payment(self, payment_id: UUID):
        deleted_payment = await self.payment_repo.delete(payment_id)
        if not deleted_payment:
            raise HTTPException(status_code=404, detail="Fee payment not found")
        return {"message": "Fee payment deleted"}

    async def calculate_student_fees_summary(self):
        try:
            summaries = await self.payment_repo.calculate_student_fees_summary()
            if not summaries:
                raise HTTPException(status_code=404, detail="No students or fee records found")
            return summaries
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    async def get_payments_by_student(self, student_id: UUID):
        payments = await self.payment_repo.get_payments_by_student_id(student_id)
        if not payments:
            raise HTTPException(status_code=404, detail="No fee payments found for the student")
        return payments
