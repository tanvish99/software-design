from sqlalchemy import Boolean, Column, String
from sqlalchemy.orm import Mapped, mapped_column
from fastapi_users.db import SQLAlchemyBaseUserTableUUID

from app.db import Base

class User(SQLAlchemyBaseUserTableUUID, Base):
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)