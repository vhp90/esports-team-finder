from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class TeamCreate(BaseModel):
    name: str
    game: str
    description: str
    skill_level: str
    requirements: str
    max_members: int = 5

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    game: Optional[str] = None
    description: Optional[str] = None
    skill_level: Optional[str] = None
    requirements: Optional[str] = None
    max_members: Optional[int] = None

class TeamResponse(BaseModel):
    id: str
    name: str
    game: str
    description: str
    skill_level: str
    requirements: str
    max_members: int
    leader_id: str
    members: List[str]
    created_at: datetime
    updated_at: datetime
