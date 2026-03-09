from datetime import datetime
from typing import List

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from database import notifications_collection
from routes.user import get_current_user
from schemas.notification_schema import NotificationResponse

router = APIRouter()


@router.get("/", response_model=List[NotificationResponse])
async def list_notifications(current_user: dict = Depends(get_current_user)):
    cursor = notifications_collection.find({"user_id": current_user["id"]}).sort("created_at", -1).limit(30)
    notifications = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        notifications.append(doc)
    return notifications


@router.patch("/{notification_id}/read")
async def mark_notification_as_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(status_code=400, detail="Invalid notification id")

    result = await notifications_collection.update_one(
        {"_id": ObjectId(notification_id), "user_id": current_user["id"]},
        {"$set": {"is_read": True, "read_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}


@router.patch("/read-all")
async def mark_all_notifications_as_read(current_user: dict = Depends(get_current_user)):
    await notifications_collection.update_many(
        {"user_id": current_user["id"], "is_read": False},
        {"$set": {"is_read": True, "read_at": datetime.utcnow()}},
    )
    return {"message": "All notifications marked as read"}
