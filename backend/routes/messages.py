from datetime import datetime
from typing import Dict, List

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from database import messages_collection, notifications_collection, users_collection
from realtime import manager
from routes.user import get_current_user
from schemas.message_schema import MessageCreate, MessageResponse

router = APIRouter()


async def _hydrate_message(doc: dict) -> dict:
    sender = await users_collection.find_one({"_id": ObjectId(doc["sender_id"])})
    receiver = await users_collection.find_one({"_id": ObjectId(doc["receiver_id"])})
    doc["id"] = str(doc["_id"])
    doc["sender_name"] = sender.get("name") if sender else "Unknown"
    doc["receiver_name"] = receiver.get("name") if receiver else "Unknown"
    return doc


@router.post("/", response_model=MessageResponse)
async def send_message(payload: MessageCreate, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(payload.receiver_id):
        raise HTTPException(status_code=400, detail="Invalid receiver id")

    receiver = await users_collection.find_one({"_id": ObjectId(payload.receiver_id)})
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    if payload.receiver_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot message yourself")

    text = payload.content.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    message_data = {
        "sender_id": current_user["id"],
        "receiver_id": payload.receiver_id,
        "content": text,
        "opportunity_id": payload.opportunity_id,
        "created_at": datetime.utcnow(),
    }
    result = await messages_collection.insert_one(message_data)
    message_data["id"] = str(result.inserted_id)

    message_response = {
        **message_data,
        "sender_name": current_user.get("name", "Unknown"),
        "receiver_name": receiver.get("name", "Unknown"),
    }

    notification_data = {
        "user_id": payload.receiver_id,
        "type": "message",
        "title": "New Message",
        "body": f"{current_user.get('name', 'Someone')} sent you a message",
        "reference_id": message_data["id"],
        "is_read": False,
        "created_at": datetime.utcnow(),
    }
    notification_result = await notifications_collection.insert_one(notification_data)
    notification_data["id"] = str(notification_result.inserted_id)

    await manager.send_to_user(payload.receiver_id, {"type": "message", "data": message_response})
    await manager.send_to_user(payload.receiver_id, {"type": "notification", "data": notification_data})
    await manager.send_to_user(current_user["id"], {"type": "message", "data": message_response})

    return message_response


@router.get("/conversations")
async def list_conversations(current_user: dict = Depends(get_current_user)):
    query = {"$or": [{"sender_id": current_user["id"]}, {"receiver_id": current_user["id"]}]}
    cursor = messages_collection.find(query).sort("created_at", -1)

    latest_by_partner: Dict[str, dict] = {}
    async for doc in cursor:
        partner_id = doc["receiver_id"] if doc["sender_id"] == current_user["id"] else doc["sender_id"]
        if partner_id in latest_by_partner:
            continue

        partner = await users_collection.find_one({"_id": ObjectId(partner_id)})
        latest_by_partner[partner_id] = {
            "partner_id": partner_id,
            "partner_name": partner.get("name", "Unknown") if partner else "Unknown",
            "partner_role": partner.get("role", "unknown") if partner else "unknown",
            "last_message": doc["content"],
            "last_message_at": doc["created_at"],
        }

    return list(latest_by_partner.values())


@router.get("/with/{partner_id}", response_model=List[MessageResponse])
async def list_messages_with_partner(partner_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(partner_id):
        raise HTTPException(status_code=400, detail="Invalid partner id")

    query = {
        "$or": [
            {"sender_id": current_user["id"], "receiver_id": partner_id},
            {"sender_id": partner_id, "receiver_id": current_user["id"]},
        ]
    }
    cursor = messages_collection.find(query).sort("created_at", 1).limit(200)
    messages = []
    async for doc in cursor:
        hydrated = await _hydrate_message(doc)
        messages.append(hydrated)
    return messages
