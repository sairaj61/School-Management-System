from fastapi_users.db import SQLAlchemyBaseUserTable
from sqlalchemy import Column, String, Boolean
from database import Base
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTable

class User(SQLAlchemyBaseUserTable[int], Base):
    first_name = Column(String(length=50), nullable=True)
    last_name = Column(String(length=50), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False) 