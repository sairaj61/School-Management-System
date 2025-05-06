from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from models import FeePayment
from schemas import FeePaymentCreate, FeePaymentUpdate
from fastapi import HTTPException
from datetime import datetime
from sqlalchemy.orm import joinedload

class FeePaymentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self):
        result = await self.db.execute(
            select(FeePayment).options(joinedload(FeePayment.student))
        )
        return result.scalars().all()

    async def get_by_id(self, payment_id: UUID):
        result = await self.db.execute(select(FeePayment).filter(FeePayment.id == payment_id))
        return result.scalar_one_or_none()

    async def create(self, fee_payment: FeePaymentCreate):
        try:
            # Calculate total amount
            total_amount = (
                fee_payment.tuition_fees +
                fee_payment.auto_fees +
                fee_payment.day_boarding_fees
            )

            db_fee_payment = FeePayment(
                **fee_payment.dict(),
                total_amount=total_amount,
                transaction_date=datetime.utcnow()
            )
            self.db.add(db_fee_payment)
            await self.db.commit()
            await self.db.refresh(db_fee_payment)
            return db_fee_payment
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(
                status_code=400,
                detail="Error creating fee payment. Please check your input."
            )

    async def update(self, payment_id: UUID, fee_payment: FeePaymentUpdate):
        db_fee_payment = await self.get_by_id(payment_id)
        if not db_fee_payment:
            return None

        try:
            update_data = fee_payment.dict(exclude_unset=True)

            # If any fee is updated, recalculate total
            if any(key in update_data for key in ['tuition_fees', 'auto_fees', 'day_boarding_fees']):
                total_amount = (
                    (update_data.get('tuition_fees') or db_fee_payment.tuition_fees) +
                    (update_data.get('auto_fees') or db_fee_payment.auto_fees) +
                    (update_data.get('day_boarding_fees') or db_fee_payment.day_boarding_fees)
                )
                update_data['total_amount'] = total_amount

            for key, value in update_data.items():
                setattr(db_fee_payment, key, value)

            await self.db.commit()
            await self.db.refresh(db_fee_payment)
            return db_fee_payment
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(
                status_code=400,
                detail="Error updating fee payment. Please check your input."
            )

    async def delete(self, payment_id: UUID):
        db_payment = await self.get_by_id(payment_id)
        if not db_payment:
            return None
        await self.db.delete(db_payment)
        await self.db.commit()
        return db_payment