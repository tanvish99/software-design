# app/transactions/schemas.py
from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Optional
import datetime
from uuid import UUID

# avoid naming collision with 'date'
date_type = datetime.date

class TransactionCreate(BaseModel):
    type: str = Field(..., example="EXPENSE")
    category: str = Field(..., example="Food")
    amount: float = Field(..., ge=0)
    date: date_type = Field(..., example="2025-01-10")
    note: Optional[str] = None

class TransactionUpdate(BaseModel):
    type: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = Field(None, ge=0)
    date: Optional[date_type] = None
    note: Optional[str] = None

class TransactionRead(BaseModel):
    model_config = {"from_attributes": True}  # Pydantic v2 way of ORM mode

    id: int
    user_id: UUID
    type: str
    category: str
    amount: float
    date: date_type
    note: Optional[str] = None
    created_at: Optional[datetime.datetime] = None
    updated_at: Optional[datetime.datetime] = None