from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import dashboard, students, classes, sections, fee_payments, academic_years, auto_management
from auth.auth import auth_backend, fastapi_users, current_active_user
from schemas import UserRead, UserCreate, UserUpdate
from models import User

app = FastAPI(title="School Management System API")

# Enable CORS for frontend at http://localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

# Auth routes
app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

# Include routers
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(students.router, prefix="/students", tags=["Students"])
app.include_router(classes.router, prefix="/classes", tags=["Classes"])
app.include_router(sections.router, prefix="/sections", tags=["Sections"])
app.include_router(fee_payments.router, prefix="/fee_payments", tags=["Fee Payments"])
app.include_router(academic_years.router, prefix="/academic-years", tags=["Academic Years"])
app.include_router(auto_management.router, prefix="/auto-management", tags=["Auto Management"])

# Protected route example
@app.get("/authenticated-route")
async def authenticated_route(user: User = Depends(current_active_user)):
    return {"message": f"Hello {user.email}"}

@app.get("/")
async def root():
    return {"message": "School Management System API"}