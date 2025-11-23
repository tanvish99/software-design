from fastapi import APIRouter
from fastapi_users import FastAPIUsers
from uuid import UUID

from app.users.manager import get_user_manager
from app.users.models import User
from app.users.schemas import UserRead, UserCreate, UserUpdate
from app.users.auth import auth_backend

fastapi_users = FastAPIUsers[User, UUID](
    get_user_manager,
    [auth_backend],
)

router = APIRouter()

# Authentication
router.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)

# Registration
router.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)

# Users
router.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)