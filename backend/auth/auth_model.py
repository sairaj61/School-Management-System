from typing import Optional
from uuid import UUID

from fastapi_users import schemas
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTableUUID
from sqlalchemy import Column, String, Boolean

from database import Base


class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "users"
    first_name = Column(String(length=50), nullable=True)
    last_name = Column(String(length=50), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)


class UserRead(schemas.BaseUser[UUID]):
    first_name: Optional[str]
    last_name: Optional[str]


class UserCreate(schemas.BaseUserCreate):
    first_name: Optional[str]
    last_name: Optional[str]


class UserUpdate(schemas.BaseUserUpdate):
    first_name: Optional[str]
    last_name: Optional[str]
