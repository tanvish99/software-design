from fastapi import Depends
from fastapi_users import BaseUserManager, UUIDIDMixin
from uuid import UUID
from app.config import settings
from app.users.models import User
from fastapi_users.db import SQLAlchemyUserDatabase
from app.db import async_session_maker
from sqlalchemy.ext.asyncio import AsyncSession

async def get_user_db():
    async with async_session_maker() as session:
        yield SQLAlchemyUserDatabase(session, User)

class UserManager(UUIDIDMixin, BaseUserManager[User, UUID]):
    reset_password_token_secret = settings.SECRET
    verification_token_secret = settings.SECRET

async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)