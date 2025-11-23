from fastapi import FastAPI
from app.users.router import router as users_router
from app.db import Base, engine
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "*"
]

app = FastAPI(title="Finance Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(users_router)