from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    body: str
    reference_id: Optional[str] = None
    is_read: bool
    created_at: datetime
