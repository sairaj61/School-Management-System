from fastapi import APIRouter, Depends

from auth.auth_model import UserRead, UserCreate, UserUpdate, User
from auth.auth_service import fastapi_users, auth_backend, current_active_user

router = APIRouter()

# Auth routes
router.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/jwt",
    tags=["auth"],
)
router.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="",
    tags=["auth"],
)
router.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="",
    tags=["auth"],
)
router.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="",
    tags=["auth"],
)
router.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)


# Protected Admin Route
@router.get("/admin-only")
async def admin_only(user: User = Depends(current_active_user)):
    return {"message": f"Welcome, {user.email}!"}
