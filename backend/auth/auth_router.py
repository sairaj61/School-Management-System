from fastapi import APIRouter

from auth.auth_service import fastapi_users, auth_backend
from schemas import UserRead, UserCreate, UserUpdate

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


# # Protected Admin Route
# @router.get("/admin-only")
# async def admin_only(user: User = Depends(current_active_admin_user)):
#     if user.role != Role.ADMIN:
#         raise HTTPException(status_code=403, detail="Not authorized: Admin access required")
#     return {"message": "Welcome, admin!"}
