from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from typing import List, Dict
from bson import ObjectId
from datetime import datetime
import json
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

@router.websocket("/ws/chat/{chat_id}")
async def websocket_endpoint(websocket: WebSocket, chat_id: str, db = Depends(get_db)):
    await websocket.accept()
    
    # Add to active connections
    if chat_id not in active_connections:
        active_connections[chat_id] = []
    active_connections[chat_id].append(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            # Simply echo back the message to all participants
            if chat_id in active_connections:
                for ws in active_connections[chat_id]:
                    if ws != websocket:  # Don't send back to sender
                        try:
                            await ws.send_text(data)
                        except:
                            active_connections[chat_id].remove(ws)
    except WebSocketDisconnect:
        if chat_id in active_connections:
            active_connections[chat_id].remove(websocket)
            if not active_connections[chat_id]:
                del active_connections[chat_id]
