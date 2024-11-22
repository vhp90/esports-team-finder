from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from typing import List, Dict
from bson import ObjectId
from datetime import datetime
import json
import jwt
from config import settings

from dependencies import get_current_user, get_db
from models.chat import ChatCreate, ChatResponse, MessageCreate, MessageResponse

router = APIRouter()

# Store active websocket connections: chat_id -> list of websockets
active_connections: Dict[str, List[WebSocket]] = {}

@router.post("/chats/", response_model=ChatResponse)
async def create_chat(
    chat: ChatCreate,
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Ensure current user is in participants
    if str(current_user["_id"]) not in chat.participants:
        chat.participants.append(str(current_user["_id"]))
    
    chat_dict = chat.dict()
    chat_dict["created_at"] = datetime.utcnow()
    
    result = await db.chats.insert_one(chat_dict)
    created_chat = await db.chats.find_one({"_id": result.inserted_id})
    created_chat["id"] = str(created_chat["_id"])
    
    return created_chat

@router.get("/chats/", response_model=List[ChatResponse])
async def get_my_chats(
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    chats = []
    cursor = db.chats.find({"participants": str(current_user["_id"])})
    
    async for chat in cursor:
        chat["id"] = str(chat["_id"])
        # Get last message
        last_message = await db.messages.find_one(
            {"chat_id": chat["id"]},
            sort=[("created_at", -1)]
        )
        if last_message:
            last_message["id"] = str(last_message["_id"])
            chat["last_message"] = last_message
        chats.append(chat)
    
    return chats

@router.get("/chats/{chat_id}/messages", response_model=List[MessageResponse])
async def get_chat_messages(
    chat_id: str,
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify user is participant
    chat = await db.chats.find_one({"_id": ObjectId(chat_id)})
    if not chat or str(current_user["_id"]) not in chat["participants"]:
        raise HTTPException(status_code=403, detail="Not a participant of this chat")
    
    messages = []
    cursor = db.messages.find({"chat_id": chat_id}).sort("created_at", 1)
    async for msg in cursor:
        msg["id"] = str(msg["_id"])
        messages.append(msg)
    
    return messages

@router.post("/chats/{chat_id}/messages", response_model=MessageResponse)
async def create_message(
    chat_id: str,
    message: MessageCreate,
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify user is participant
    chat = await db.chats.find_one({"_id": ObjectId(chat_id)})
    if not chat or str(current_user["_id"]) not in chat["participants"]:
        raise HTTPException(status_code=403, detail="Not a participant of this chat")
    
    message_dict = message.dict()
    message_dict["created_at"] = datetime.utcnow()
    message_dict["sender_id"] = str(current_user["_id"])
    
    result = await db.messages.insert_one(message_dict)
    created_message = await db.messages.find_one({"_id": result.inserted_id})
    created_message["id"] = str(created_message["_id"])
    
    # Notify participants through WebSocket if connected
    if chat_id in active_connections:
        for ws in active_connections[chat_id]:
            try:
                await ws.send_json(created_message)
            except:
                # Remove dead connections
                active_connections[chat_id].remove(ws)
    
    return created_message

async def get_user_from_token(token: str, db):
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if user is None:
            return None
        return user
    except jwt.JWTError:
        return None

@router.websocket("/ws/chat/{chat_id}")
async def websocket_endpoint(websocket: WebSocket, chat_id: str, db = Depends(get_db)):
    await websocket.accept()
    
    try:
        # Wait for authentication message
        auth_message = await websocket.receive_text()
        auth_data = json.loads(auth_message)
        
        if auth_data.get("type") != "authenticate" or not auth_data.get("token"):
            await websocket.close(code=4001)
            return
        
        # Verify token and user
        user = await get_user_from_token(auth_data["token"], db)
        if not user:
            await websocket.close(code=4001)
            return
            
        # Verify user is participant of the chat
        chat = await db.chats.find_one({"_id": ObjectId(chat_id)})
        if not chat or str(user["_id"]) not in chat["participants"]:
            await websocket.close(code=4003)
            return
        
        # Add to active connections
        if chat_id not in active_connections:
            active_connections[chat_id] = []
        active_connections[chat_id].append(websocket)
        
        try:
            while True:
                message = await websocket.receive_json()
                if message.get("type") == "message":
                    # Create message in database
                    message_create = MessageCreate(
                        content=message["content"],
                        chat_id=chat_id
                    )
                    await create_message(chat_id, message_create, db, user)
        except WebSocketDisconnect:
            if chat_id in active_connections and websocket in active_connections[chat_id]:
                active_connections[chat_id].remove(websocket)
                if not active_connections[chat_id]:
                    del active_connections[chat_id]
    except Exception as e:
        print(f"WebSocket error: {e}")
        if chat_id in active_connections and websocket in active_connections[chat_id]:
            active_connections[chat_id].remove(websocket)
            if not active_connections[chat_id]:
                del active_connections[chat_id]
