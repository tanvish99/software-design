from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config import settings

class Base(DeclarativeBase):
    pass

engine = create_async_engine(
    settings.POSTGRES_URL,
    echo=False,
)

async_session_maker = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)