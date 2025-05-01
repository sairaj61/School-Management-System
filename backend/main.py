from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import dashboard, students, classes, sections, fee_payments

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

# Include routers
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(students.router, prefix="/students", tags=["Students"])
app.include_router(classes.router, prefix="/classes", tags=["Classes"])
app.include_router(sections.router, prefix="/sections", tags=["Sections"])
app.include_router(fee_payments.router, prefix="/fee_payments", tags=["Fee Payments"])

@app.get("/")
async def root():
    return {"message": "School Management System API"}