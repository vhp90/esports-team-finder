from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class NotificationCreate(BaseModel):
    recipient_id: str
    type: str  # "team_invite", "team_request", "similar_interest"
    title: str
    message: str
    team_id: Optional[str] = None
    sender_id: Optional[str] = None

class NotificationResponse(BaseModel):
    id: str
    recipient_id: str
    type: str
    title: str
    message: str
    team_id: Optional[str]
    sender_id: Optional[str]
    read: bool = False
    created_at: datetime
