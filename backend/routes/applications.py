from fastapi import APIRouter, HTTPException, Depends
from database import (
    applications_collection,
    notifications_collection,
    opportunities_collection,
    users_collection,
)
from schemas.application_schema import ApplicationCreate, ApplicationResponse, ApplicationStatusUpdate
from routes.user import get_current_user
from bson import ObjectId
from typing import List
from datetime import datetime
from realtime import manager

router = APIRouter()


async def _create_notification(user_id: str, notification_type: str, title: str, body: str, reference_id: str):
    notification_data = {
        "user_id": user_id,
        "type": notification_type,
        "title": title,
        "body": body,
        "reference_id": reference_id,
        "is_read": False,
        "created_at": datetime.utcnow(),
    }
    inserted = await notifications_collection.insert_one(notification_data)
    notification_data["id"] = str(inserted.inserted_id)
    await manager.send_to_user(user_id, {"type": "notification", "data": notification_data})

# -----------------------------
# APPLY TO OPPORTUNITY (VOLUNTEER ONLY)
# -----------------------------
@router.post("/", response_model=ApplicationResponse)
async def apply_to_opportunity(application: ApplicationCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "volunteer":
        raise HTTPException(status_code=403, detail="Access denied: Volunteers only")

    if not ObjectId.is_valid(application.opportunity_id):
        raise HTTPException(status_code=400, detail="Invalid opportunity id")

    # Check if opportunity exists and is open
    opportunity = await opportunities_collection.find_one({"_id": ObjectId(application.opportunity_id)})
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    if opportunity.get("status") != "open":
        raise HTTPException(status_code=400, detail="This opportunity is no longer open for applications")

    # Check if already applied
    existing = await applications_collection.find_one({
        "volunteer_id": current_user["id"],
        "opportunity_id": application.opportunity_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied to this opportunity")

    app_data = application.dict(exclude_none=True)
    app_data["volunteer_id"] = current_user["id"]
    app_data["status"] = "pending"
    app_data["applied_at"] = datetime.utcnow()

    result = await applications_collection.insert_one(app_data)
    app_data["id"] = str(result.inserted_id)

    volunteer_name = current_user.get("name") or current_user.get("email") or "A volunteer"
    await _create_notification(
        user_id=opportunity["ngo_id"],
        notification_type="application",
        title="New Application",
        body=f"{volunteer_name} applied to {opportunity.get('title', 'your opportunity')}",
        reference_id=app_data["id"],
    )

    return app_data

# -----------------------------
# GET MY APPLICATIONS (VOLUNTEER)
# -----------------------------
@router.get("/my", response_model=List[ApplicationResponse])
async def get_my_applications(current_user: dict = Depends(get_current_user)):
    cursor = applications_collection.find({"volunteer_id": current_user["id"]}).sort("applied_at", -1)
    applications = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        # Fetch opportunity details for UI
        opp = await opportunities_collection.find_one({"_id": ObjectId(doc["opportunity_id"])})
        if opp:
            doc["opportunity_title"] = opp.get("title")
            # Fetch NGO details
            ngo = await users_collection.find_one({"_id": ObjectId(opp.get("ngo_id"))})
            if ngo:
                doc["ngo_name"] = ngo.get("organization_name") or ngo.get("name")
        applications.append(doc)
    return applications

# -----------------------------
# GET NGO APPLICATIONS (NGO ONLY)
# -----------------------------
@router.get("/ngo", response_model=List[ApplicationResponse])
async def get_ngo_applications(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "ngo":
        raise HTTPException(status_code=403, detail="Access denied: NGOs only")
    
    # Find all opportunities belonging to this NGO
    cursor_opps = opportunities_collection.find({"ngo_id": current_user["id"]})
    opp_ids = []
    async for opp in cursor_opps:
        opp_ids.append(str(opp["_id"]))
    
    # Find all applications for these opportunities
    cursor_apps = applications_collection.find({"opportunity_id": {"$in": opp_ids}}).sort("applied_at", -1)
    applications = []
    async for doc in cursor_apps:
        doc["id"] = str(doc["_id"])
        # Fetch opportunity details
        opp = await opportunities_collection.find_one({"_id": ObjectId(doc["opportunity_id"])})
        if opp:
            doc["opportunity_title"] = opp.get("title")
        # Fetch Volunteer details
        volunteer = await users_collection.find_one({"_id": ObjectId(doc["volunteer_id"])})
        if volunteer:
            doc["volunteer_name"] = volunteer.get("name")
            doc["volunteer_email"] = volunteer.get("email")
            doc["volunteer_location"] = volunteer.get("location")
            doc["volunteer_bio"] = volunteer.get("bio")
            doc["volunteer_skills"] = volunteer.get("skills", [])
        applications.append(doc)
    return applications

# -----------------------------
# UPDATE APPLICATION STATUS (NGO ONLY)
# -----------------------------
@router.patch("/{application_id}/status", response_model=ApplicationResponse)
async def update_application_status(
    application_id: str,
    payload: ApplicationStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "ngo":
        raise HTTPException(status_code=403, detail="Access denied: NGOs only")
    if not ObjectId.is_valid(application_id):
        raise HTTPException(status_code=400, detail="Invalid application id")

    application = await applications_collection.find_one({"_id": ObjectId(application_id)})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    opportunity = await opportunities_collection.find_one({"_id": ObjectId(application["opportunity_id"])})
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    if opportunity.get("ngo_id") != current_user["id"]:
        raise HTTPException(status_code=401, detail="Not authorized to update this application")

    await applications_collection.update_one(
        {"_id": ObjectId(application_id)},
        {"$set": {"status": payload.status}}
    )

    updated = await applications_collection.find_one({"_id": ObjectId(application_id)})
    updated["id"] = str(updated["_id"])
    updated_opp = await opportunities_collection.find_one({"_id": ObjectId(updated["opportunity_id"])})
    if updated_opp:
        updated["opportunity_title"] = updated_opp.get("title")
        ngo = await users_collection.find_one({"_id": ObjectId(updated_opp.get("ngo_id"))})
        if ngo:
            updated["ngo_name"] = ngo.get("organization_name") or ngo.get("name")

    volunteer = await users_collection.find_one({"_id": ObjectId(updated["volunteer_id"])})
    if volunteer:
        updated["volunteer_name"] = volunteer.get("name")
        updated["volunteer_email"] = volunteer.get("email")
        updated["volunteer_location"] = volunteer.get("location")
        updated["volunteer_bio"] = volunteer.get("bio")
        updated["volunteer_skills"] = volunteer.get("skills", [])

    await _create_notification(
        user_id=updated["volunteer_id"],
        notification_type="application_status",
        title="Application Update",
        body=f"Your application for {updated.get('opportunity_title', 'an opportunity')} was {payload.status}",
        reference_id=updated["id"],
    )

    return updated
