from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class MessageCreate(BaseModel):
    sender_id: str
    content: str
    chat_id: str

class MessageResponse(BaseModel):
    id: str
    sender_id: str
    content: str
    chat_id: str
    created_at: datetime

class ChatCreate(BaseModel):
    name: Optional[str] = None
    participants: List[str]
    type: str = "direct"  # "direct" or "team"
    team_id: Optional[str] = None

class ChatResponse(BaseModel):
    id: str
    name: Optional[str]
    participants: List[str]
    type: str
    team_id: Optional[str]
    created_at: datetime
    last_message: Optional[MessageResponse] = None
