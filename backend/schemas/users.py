from typing import Optional
from fastapi_users import schemas

class UserRead(schemas.BaseUser[int]):
    first_name: Optional[str]
    last_name: Optional[str]

class UserCreate(schemas.BaseUserCreate):
    first_name: Optional[str]
    last_name: Optional[str]

class UserUpdate(schemas.BaseUserUpdate):
    first_name: Optional[str]
    last_name: Optional[str] 