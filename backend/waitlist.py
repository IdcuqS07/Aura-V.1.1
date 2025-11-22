from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Optional
import uuid

class WaitlistEntry(BaseModel):
    id: str
    wallet_address: str
    email: Optional[str] = None
    reason: Optional[str] = None
    status: str = "pending"  # pending, approved, rejected
    created_at: datetime
    approved_at: Optional[datetime] = None
    approved_by: Optional[str] = None

class WaitlistCreate(BaseModel):
    wallet_address: str
    email: Optional[str] = None
    reason: Optional[str] = None
