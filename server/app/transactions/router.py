# app/transactions/router.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from datetime import date

from app.db import async_session_maker
from app.transactions import models, schemas
from app.users.router import fastapi_users  # import the FastAPIUsers instance
# Create a dependency to fetch the current active user
current_active_user = fastapi_users.current_user(active=True)

router = APIRouter(prefix="/transactions", tags=["transactions"])

# helper to get db session
async def get_session() -> AsyncSession:
    async with async_session_maker() as session:
        yield session

# -----------------------------
# LIST / FILTER / PAGINATE
# -----------------------------
@router.get("/", response_model=List[schemas.TransactionRead])
async def list_transactions(
    session: AsyncSession = Depends(get_session),
    current_user = Depends(current_active_user),
    type: Optional[str] = Query(None, description="INCOME or EXPENSE"),
    category: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    min_amount: Optional[float] = Query(None, ge=0),
    max_amount: Optional[float] = Query(None, ge=0),
    search: Optional[str] = Query(None, description="search in note or category"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
):
    """
    Returns list of transactions for current user with optional filters and pagination.
    """
    q = select(models.Transaction).where(models.Transaction.user_id == current_user.id)

    if type:
        q = q.where(models.Transaction.type == type.upper())

    if category:
        q = q.where(models.Transaction.category == category)

    if date_from:
        q = q.where(models.Transaction.date >= date_from)

    if date_to:
        q = q.where(models.Transaction.date <= date_to)

    if min_amount is not None:
        q = q.where(models.Transaction.amount >= min_amount)

    if max_amount is not None:
        q = q.where(models.Transaction.amount <= max_amount)

    if search:
        term = f"%{search.lower()}%"
        q = q.where(
            or_(
                models.Transaction.note.ilike(term),
                models.Transaction.category.ilike(term),
            )
        )

    q = q.order_by(desc(models.Transaction.date), desc(models.Transaction.id)).offset(skip).limit(limit)

    result = await session.execute(q)
    rows = result.scalars().all()
    return rows

# -----------------------------
# GET ONE
# -----------------------------
@router.get("/{transaction_id}", response_model=schemas.TransactionRead)
async def get_transaction(
    transaction_id: int,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(current_active_user),
):
    q = select(models.Transaction).where(models.Transaction.id == transaction_id)
    result = await session.execute(q)
    tx = result.scalar_one_or_none()
    if not tx or tx.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return tx

# -----------------------------
# CREATE
# -----------------------------
@router.post("/", response_model=schemas.TransactionRead, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    payload: schemas.TransactionCreate,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(current_active_user),
):
    tx = models.Transaction(
        user_id=current_user.id,
        type=payload.type.upper(),
        category=payload.category,
        amount=payload.amount,
        date=payload.date,
        note=payload.note
    )
    session.add(tx)
    await session.commit()
    await session.refresh(tx)
    return tx

# -----------------------------
# UPDATE
# -----------------------------
@router.put("/{transaction_id}", response_model=schemas.TransactionRead)
async def update_transaction(
    transaction_id: int,
    payload: schemas.TransactionUpdate,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(current_active_user),
):
    q = select(models.Transaction).where(models.Transaction.id == transaction_id)
    result = await session.execute(q)
    tx = result.scalar_one_or_none()
    if not tx or tx.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    # apply updates
    data = payload.dict(exclude_unset=True)
    for key, val in data.items():
        setattr(tx, key, val)
    session.add(tx)
    await session.commit()
    await session.refresh(tx)
    return tx

# -----------------------------
# DELETE
# -----------------------------
@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: int,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(current_active_user),
):
    q = select(models.Transaction).where(models.Transaction.id == transaction_id)
    result = await session.execute(q)
    tx = result.scalar_one_or_none()
    if not tx or tx.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    await session.delete(tx)
    await session.commit()
    return None