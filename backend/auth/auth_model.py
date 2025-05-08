import uuid

from fastapi_users import schemas
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTableUUID
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class User(SQLAlchemyBaseUserTableUUID, Base):
    pass


class UserRead(schemas.BaseUser[uuid.UUID]):
    pass


class UserCreate(schemas.BaseUserCreate):
    pass


class UserUpdate(schemas.BaseUserUpdate):
    pass
