from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict
import uvicorn
import json
from datetime import datetime
import logging
import os
from dotenv import load_dotenv
from .auth import (
    Token,
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Esports Team Finder API")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/esports_team_finder")
client = None

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)

manager = ConnectionManager()

# Models
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    games: List[str] = []
    skill_level: str
    play_style: str
    availability: List[str] = []

class UserLogin(BaseModel):
    username: str
    password: str

class UserProfile(BaseModel):
    username: str
    email: EmailStr
    games: List[str]
    skill_level: str
    play_style: str
    availability: List[str]

class Message(BaseModel):
    content: str
    to_user: str

@app.on_event("startup")
async def startup_db_client():
    global client
    try:
        client = AsyncIOMotorClient(MONGODB_URL)
        await client.admin.command('ping')
        app.mongodb = client.get_default_database()
        logger.info("Successfully connected to MongoDB")
        
        # Create indexes
        await app.mongodb.users.create_index("username", unique=True)
        await app.mongodb.users.create_index("email", unique=True)
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown_db_client():
    global client
    if client:
        client.close()
        logger.info("Closed MongoDB connection")

# Auth routes
@app.post("/auth/register", response_model=Token)
async def register_user(user: UserCreate):
    # Check if username or email exists
    if await app.mongodb.users.find_one({"$or": [
        {"username": user.username},
        {"email": user.email}
    ]}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    # Create user
    user_dict = user.dict()
    user_dict["password"] = get_password_hash(user_dict["password"])
    user_dict["created_at"] = datetime.utcnow()
    
    await app.mongodb.users.insert_one(user_dict)
    
    # Create access token
    access_token = create_access_token(data={"sub": user.username})
    return Token(access_token=access_token, token_type="bearer")

@app.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await app.mongodb.users.find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["username"]})
    return Token(access_token=access_token, token_type="bearer")

# User routes
@app.get("/users/me", response_model=UserProfile)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    return UserProfile(**current_user)

@app.get("/users/match", response_model=List[UserProfile])
async def find_matches(
    game: str,
    current_user: dict = Depends(get_current_user)
):
    matches = await app.mongodb.users.find({
        "username": {"$ne": current_user["username"]},
        "games": game,
        "skill_level": current_user["skill_level"]
    }).to_list(10)
    
    return [UserProfile(**match) for match in matches]

# WebSocket endpoint
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: str,
    token: str = Depends(get_current_user)
):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Store message in database
            await app.mongodb.messages.insert_one({
                "from_user": user_id,
                "to_user": message_data["to_user"],
                "content": message_data["content"],
                "timestamp": datetime.utcnow()
            })
            
            # Send to recipient if online
            await manager.send_personal_message(
                json.dumps({
                    "from_user": user_id,
                    "content": message_data["content"],
                    "timestamp": datetime.utcnow().isoformat()
                }),
                message_data["to_user"]
            )
    except WebSocketDisconnect:
        manager.disconnect(user_id)

# Chat routes
@app.get("/messages/{other_user}")
async def get_messages(
    other_user: str,
    current_user: dict = Depends(get_current_user)
):
    messages = await app.mongodb.messages.find({
        "$or": [
            {
                "from_user": current_user["username"],
                "to_user": other_user
            },
            {
                "from_user": other_user,
                "to_user": current_user["username"]
            }
        ]
    }).sort("timestamp", 1).to_list(50)
    
    return messages

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
