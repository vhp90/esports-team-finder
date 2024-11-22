from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId
from datetime import datetime

from dependencies import get_current_user, get_db
from models.notification import NotificationCreate, NotificationResponse

router = APIRouter()

@router.post("/notifications/", response_model=NotificationResponse)
async def create_notification(
    notification: NotificationCreate,
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    notification_dict = notification.dict()
    notification_dict["created_at"] = datetime.utcnow()
    notification_dict["read"] = False
    
    result = await db.notifications.insert_one(notification_dict)
    
    created_notification = await db.notifications.find_one({"_id": result.inserted_id})
    created_notification["id"] = str(created_notification["_id"])
    
    return created_notification

@router.get("/me/", response_model=List[NotificationResponse])
async def get_my_notifications(
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    notifications = []
    cursor = db.notifications.find({"recipient_id": str(current_user["_id"])})
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        notifications.append(doc)
    return notifications

@router.put("/notifications/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: str,
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.notifications.update_one(
        {"_id": ObjectId(notification_id), "recipient_id": str(current_user["_id"])},
        {"$set": {"read": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification marked as read"}
