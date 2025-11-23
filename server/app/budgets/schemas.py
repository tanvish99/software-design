# app/budgets/schemas.py
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
import datetime

class BudgetCreate(BaseModel):
    category: str = Field(..., example="Food")
    amount: float = Field(..., ge=0)
    period: str = Field(..., example="MONTHLY")

class BudgetUpdate(BaseModel):
    category: Optional[str] = None
    amount: Optional[float] = Field(None, ge=0)
    period: Optional[str] = None

class BudgetRead(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    user_id: UUID
    category: str
    amount: float
    period: str
    created_at: datetime.datetime
    updated_at: datetime.datetime