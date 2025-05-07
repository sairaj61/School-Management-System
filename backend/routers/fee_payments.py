from fastapi import APIRouter, Depends

from auth.auth_model import User
from auth.auth_service import current_active_user
from services.fee_payment_service import FeePaymentService
from schemas import FeePaymentCreate, FeePaymentUpdate, FeePaymentResponse
from database import get_db
from uuid import UUID

router = APIRouter()


@router.get("/", response_model=list[FeePaymentResponse])
async def get_fee_payments(db=Depends(get_db), user: User = Depends(current_active_user)):
    service = FeePaymentService(db)
    return await service.get_all_payments()


@router.post("/", response_model=FeePaymentResponse)
async def create_fee_payment(payment: FeePaymentCreate, db=Depends(get_db),
                             user: User = Depends(current_active_user)):
    service = FeePaymentService(db)
    return await service.create_payment(payment)


@router.put("/{payment_id}", response_model=FeePaymentResponse)
async def update_fee_payment(payment_id: UUID, payment: FeePaymentUpdate, db=Depends(get_db),
                             user: User = Depends(current_active_user)):
    service = FeePaymentService(db)
    return await service.update_payment(payment_id, payment)


@router.delete("/{payment_id}")
async def delete_fee_payment(payment_id: UUID, db=Depends(get_db),
                             user: User = Depends(current_active_user)):
    service = FeePaymentService(db)
    return await service.delete_payment(payment_id)
