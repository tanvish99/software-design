from fastapi import FastAPI
from app.users.router import router as users_router
from app.transactions.router import router as transactions_router
from app.budgets.router import router as budgets_router
from app.dashboard.router import router as dashboard_router
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
app.include_router(transactions_router)
app.include_router(budgets_router)
app.include_router(dashboard_router)