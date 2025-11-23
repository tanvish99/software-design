from fastapi_users import schemas
from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class UserRead(schemas.BaseUser[UUID]):
    full_name: Optional[str] = None

class UserCreate(schemas.BaseUserCreate):
    full_name: Optional[str] = None

class UserUpdate(schemas.BaseUserUpdate):
    full_name: Optional[str] = None