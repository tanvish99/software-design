# app/budgets/router.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import date
from sqlalchemy import func

from app.db import async_session_maker
from app.budgets import models, schemas
from app.users.router import fastapi_users
from app.transactions.models import Transaction

# same dependency as transactions router
current_active_user = fastapi_users.current_user(active=True)

router = APIRouter(prefix="/budgets", tags=["budgets"])


# session helper (same as transactions)
async def get_session() -> AsyncSession:
    async with async_session_maker() as session:
        yield session


# -----------------------------------
# GET ALL budgets for logged-in user
# -----------------------------------
@router.get("/", response_model=list[schemas.BudgetRead])
async def list_budgets(
    session: AsyncSession = Depends(get_session),
    current_user = Depends(current_active_user)
):
    query = select(models.Budget).where(models.Budget.user_id == current_user.id)
    result = await session.execute(query)
    return result.scalars().all()


# -----------------------------------
# CREATE
# -----------------------------------
@router.post("/", response_model=schemas.BudgetRead, status_code=status.HTTP_201_CREATED)
async def create_budget(
    payload: schemas.BudgetCreate,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(current_active_user)
):
    budget = models.Budget(
        user_id=current_user.id,
        category=payload.category,
        amount=payload.amount,
        period=payload.period
    )

    session.add(budget)
    await session.commit()
    await session.refresh(budget)
    return budget


# -----------------------------------
# UPDATE
# -----------------------------------
@router.put("/{budget_id}", response_model=schemas.BudgetRead)
async def update_budget(
    budget_id: int,
    payload: schemas.BudgetUpdate,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(current_active_user)
):
    query = select(models.Budget).where(models.Budget.id == budget_id)
    result = await session.execute(query)
    budget = result.scalar_one_or_none()

    if not budget or budget.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")

    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(budget, key, value)

    await session.commit()
    await session.refresh(budget)
    return budget


# -----------------------------------
# DELETE
# -----------------------------------
@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(
    budget_id: int,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(current_active_user)
):
    query = select(models.Budget).where(models.Budget.id == budget_id)
    result = await session.execute(query)
    budget = result.scalar_one_or_none()

    if not budget or budget.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")

    await session.delete(budget)
    await session.commit()
    return None

# -----------------------------------
# SPENT AMOUNT PER CATEGORY (CURRENT MONTH)
# -----------------------------------
@router.get("/spent")
async def get_spent_by_category(
    session: AsyncSession = Depends(get_session),
    current_user = Depends(current_active_user)
):
    """
    Returns spending totals per category for the current month.
    Only EXPENSE transactions are counted.
    """

    today = date.today()
    first_day = date(today.year, today.month, 1)

    query = (
        select(
            Transaction.category,
            func.sum(Transaction.amount)
        )
        .where(
            Transaction.user_id == current_user.id,
            Transaction.type == "EXPENSE",
            Transaction.date >= first_day,
            Transaction.date <= today
        )
        .group_by(Transaction.category)
    )

    result = await session.execute(query)
    rows = result.all()

    return {category: float(total or 0) for category, total in rows}