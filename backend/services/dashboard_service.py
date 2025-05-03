from repositories.fee_payment_repository import FeePaymentRepository
from repositories.student_repository import StudentRepository
from schemas import DashboardResponse, StudentPaymentInfo


class DashboardService:
    def __init__(self, db):
        self.student_repo = StudentRepository(db)
        self.payment_repo = FeePaymentRepository(db)

    def get_dashboard(self) -> DashboardResponse:
        total_students = len(self.student_repo.get_all())
        fee_payments = self.payment_repo.get_all()
        
        total_payments = sum(payment.total_amount for payment in fee_payments)
        total_dues = sum(payment.total_amount for payment in fee_payments)
        
        students_with_payments = [
            StudentPaymentInfo(
                id=payment.student.id,
                name=payment.student.name,
                total_paid=payment.total_amount,
                total_balance=payment.total_amount,
                payment_status="Paid" if payment.total_amount <= 0 else "Pending"
            )
            for payment in fee_payments
        ]
        
        return DashboardResponse(
            total_students=total_students,
            total_payments=total_payments,
            total_dues=total_dues,
            students_with_payments=students_with_payments
        )