from repositories.fee_payment_repository import FeePaymentRepository
from repositories.student_repository import StudentRepository
from schemas import DashboardResponse, StudentPaymentInfo


class DashboardService:
    def __init__(self, db):
        self.student_repo = StudentRepository(db)
        self.payment_repo = FeePaymentRepository(db)

    async def get_dashboard(self) -> DashboardResponse:
        # Fetch total students
        total_students = len(await self.student_repo.get_all())

        # Fetch all fee payments
        fee_payments = await self.payment_repo.get_all()

        # Calculate total payments and dues
        total_payments = sum(payment.total_amount for payment in fee_payments)
        total_dues = sum(payment.total_amount for payment in fee_payments)

        # Prepare student payment information
        students_with_payments = []
        for payment in fee_payments:
            if payment.student:  # Ensure student is loaded
                students_with_payments.append(
                    StudentPaymentInfo(
                        id=payment.student.id,
                        name=payment.student.name,
                        total_paid=payment.total_amount,
                        total_balance=payment.total_amount,
                        payment_status="Paid" if payment.total_amount <= 0 else "Pending"
                    )
                )

        return DashboardResponse(
            total_students=total_students,
            total_payments=total_payments,
            total_dues=total_dues,
            students_with_payments=students_with_payments
        )


#     get to 10 or n non paying student by all time /by month /by three months -> 10 will be by default
#  Cal clulated current moth loss or profit /all time loss or profit
# add column in the student -> status -> active/droppoff /
# add status /created by /updated by /updated data /created date column in all table
#  staus will be active /archived /deleted -> in case of archived -> will be droffof for student
# add day boarting starting date and ennding date
# may create a new screen to manage dayboarding
