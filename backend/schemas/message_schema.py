from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class MessageCreate(BaseModel):
    receiver_id: str
    content: str
    opportunity_id: Optional[str] = None


class MessageResponse(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    content: str
    opportunity_id: Optional[str] = None
    created_at: datetime
    sender_name: Optional[str] = None
    receiver_name: Optional[str] = None
