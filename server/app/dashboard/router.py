# app/dashboard/router.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from datetime import date, datetime
from dateutil.relativedelta import relativedelta

from app.db import async_session_maker
from app.users.router import fastapi_users
from app.transactions.models import Transaction

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

current_active_user = fastapi_users.current_user(active=True)

async def get_session() -> AsyncSession:
    async with async_session_maker() as session:
        yield session


@router.get("/summary")
async def summary(
    session: AsyncSession = Depends(get_session),
    current_user = Depends(current_active_user),
):
    """
    Returns totals for the current month:
    { total_income: float, total_expense: float, balance: float }
    """
    today = date.today()
    first_day = date(today.year, today.month, 1)

    q = (
        select(
            Transaction.type,
            func.coalesce(func.sum(Transaction.amount), 0).label("total")
        )
        .where(
            Transaction.user_id == current_user.id,
            Transaction.date >= first_day,
            Transaction.date <= today
        )
        .group_by(Transaction.type)
    )

    result = await session.execute(q)
    rows = result.all()

    totals = {"INCOME": 0.0, "EXPENSE": 0.0}
    for ttype, total in rows:
        totals[ttype] = float(total)

    total_income = totals.get("INCOME", 0.0)
    total_expense = totals.get("EXPENSE", 0.0)
    balance = total_income - total_expense

    return {"total_income": total_income, "total_expense": total_expense, "balance": balance}


@router.get("/recent")
async def recent_transactions(
    limit: int = Query(5, ge=1, le=50),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(current_active_user),
):
    """
    Recent transactions for the user (ordered by date desc, then id desc).
    Returns list of transactions (same shape as /transactions/)
    """
    q = (
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .order_by(desc(Transaction.date), desc(Transaction.id))
        .limit(limit)
    )
    result = await session.execute(q)
    rows = result.scalars().all()
    return rows


@router.get("/category-expense")
async def category_expense(
    session: AsyncSession = Depends(get_session),
    current_user = Depends(current_active_user),
):
    """
    Expense totals per category for the current month.
    Returns an object: { "Food": 230.0, "Rent": 900.0, ... }
    """
    today = date.today()
    first_day = date(today.year, today.month, 1)

    q = (
        select(Transaction.category, func.coalesce(func.sum(Transaction.amount), 0))
        .where(
            Transaction.user_id == current_user.id,
            Transaction.type == "EXPENSE",
            Transaction.date >= first_day,
            Transaction.date <= today,
        )
        .group_by(Transaction.category)
    )

    result = await session.execute(q)
    rows = result.all()
    return {category: float(total or 0) for category, total in rows}


@router.get("/monthly-trend")
async def monthly_trend(
    months: int = Query(6, ge=1, le=36),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(current_active_user),
):
    """
    Returns income and expense totals per month for the last `months` months (including current).
    Response shape:
    {
      "labels": ["2025-06","2025-07",...],
      "income": [1200.0, 1500.0, ...],
      "expense": [900.0, 1100.0, ...]
    }
    """
    today = date.today()
    start = (today.replace(day=1) - relativedelta(months=months-1))
    # Build month list in ascending order
    months_list = []
    cur = start
    for _ in range(months):
        months_list.append(cur)
        cur = (cur + relativedelta(months=1))

    # Use date range and group by year-month via date_trunc
    # Note: date_trunc('month', transaction.date) returns a timestamp; group by that
    month_trunc = func.date_trunc("month", Transaction.date).label("month")
    q = (
        select(
            month_trunc,
            Transaction.type,
            func.coalesce(func.sum(Transaction.amount), 0).label("total"),
        )
        .where(
            Transaction.user_id == current_user.id,
            Transaction.date >= start,
            Transaction.date <= today,
        )
        .group_by(month_trunc, Transaction.type)
        .order_by(month_trunc)
    )

    result = await session.execute(q)
    rows = result.all()  # list of (month_datetime, type, total)

    # Build mapping month -> {INCOME: x, EXPENSE: y}
    from collections import OrderedDict
    data_map: "OrderedDict[str, dict]" = OrderedDict()
    for m in months_list:
        key = m.strftime("%Y-%m")
        data_map[key] = {"INCOME": 0.0, "EXPENSE": 0.0}

    for month_dt, ttype, total in rows:
        key = month_dt.strftime("%Y-%m")
        if key not in data_map:
            # possible if DB has older months; ignore or include
            data_map[key] = {"INCOME": 0.0, "EXPENSE": 0.0}
        data_map[key][ttype] = float(total or 0)

    labels = list(data_map.keys())
    income = [data_map[k]["INCOME"] for k in labels]
    expense = [data_map[k]["EXPENSE"] for k in labels]

    return {"labels": labels, "income": income, "expense": expense}