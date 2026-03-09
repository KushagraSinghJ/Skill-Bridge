from datetime import datetime
import re
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query

from database import opportunities_collection, users_collection
from routes.user import get_current_user
from schemas.opportunity_schema import OpportunityCreate, OpportunityResponse, OpportunityUpdate

router = APIRouter()


# -----------------------------
# CREATE OPPORTUNITY (NGO ONLY)
# -----------------------------
@router.post("/", response_model=OpportunityResponse)
async def create_opportunity(opportunity: OpportunityCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "ngo":
        raise HTTPException(status_code=403, detail="Access denied: NGOs only")

    opp_data = opportunity.dict()
    opp_data["ngo_id"] = current_user["id"]
    opp_data["created_at"] = datetime.utcnow()
    opp_data["updated_at"] = datetime.utcnow()

    result = await opportunities_collection.insert_one(opp_data)
    opp_data["id"] = str(result.inserted_id)

    return opp_data


# -----------------------------
# GET NGO OPPORTUNITIES
# -----------------------------
@router.get("/ngo", response_model=List[OpportunityResponse])
async def get_ngo_opportunities(current_user: dict = Depends(get_current_user)):
    cursor = opportunities_collection.find({"ngo_id": current_user["id"]}).sort("created_at", -1)
    opportunities = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        opportunities.append(doc)
    return opportunities


# -----------------------------
# GET ALL OPPORTUNITIES (NGO VIEW)
# -----------------------------
@router.get("/all", response_model=List[OpportunityResponse])
async def get_all_opportunities_for_ngo(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "ngo":
        raise HTTPException(status_code=403, detail="Access denied: NGOs only")

    cursor = opportunities_collection.find({}).sort("created_at", -1)
    opportunities = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        ngo = await users_collection.find_one({"_id": ObjectId(doc["ngo_id"])})
        if ngo:
            doc["ngo_name"] = ngo.get("name")
            doc["organization_name"] = ngo.get("organization_name")
        opportunities.append(doc)
    return opportunities


# -----------------------------
# UPDATE OPPORTUNITY
# -----------------------------
@router.put("/{id}", response_model=OpportunityResponse)
async def update_opportunity(id: str, opportunity: OpportunityUpdate, current_user: dict = Depends(get_current_user)):
    existing_opp = await opportunities_collection.find_one({"_id": ObjectId(id)})
    if not existing_opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    if existing_opp["ngo_id"] != current_user["id"]:
        raise HTTPException(status_code=401, detail="Not authorized to update this opportunity")

    update_data = {k: v for k, v in opportunity.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()

    await opportunities_collection.update_one({"_id": ObjectId(id)}, {"$set": update_data})

    updated_opp = await opportunities_collection.find_one({"_id": ObjectId(id)})
    updated_opp["id"] = str(updated_opp["_id"])
    return updated_opp


# -----------------------------
# DELETE OPPORTUNITY
# -----------------------------
@router.delete("/{id}")
async def delete_opportunity(id: str, current_user: dict = Depends(get_current_user)):
    existing_opp = await opportunities_collection.find_one({"_id": ObjectId(id)})
    if not existing_opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    if existing_opp["ngo_id"] != current_user["id"]:
        raise HTTPException(status_code=401, detail="Not authorized to delete this opportunity")

    await opportunities_collection.delete_one({"_id": ObjectId(id)})
    return {"message": "Opportunity deleted successfully"}


# -----------------------------
# BROWSE OPPORTUNITIES (VOLUNTEER)
# -----------------------------
@router.get("/", response_model=List[OpportunityResponse])
async def browse_opportunities(
    search: Optional[str] = Query(None),
    skill: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    duration: Optional[str] = Query(None),
):
    query = {"status": "open"}

    if search and search.strip():
        escaped_search = re.escape(search.strip())
        query["$or"] = [
            {"title": {"$regex": escaped_search, "$options": "i"}},
            {"description": {"$regex": escaped_search, "$options": "i"}},
            {"required_skills": {"$elemMatch": {"$regex": escaped_search, "$options": "i"}}},
        ]

    if skill and skill.strip():
        escaped_skill = re.escape(skill.strip())
        query["required_skills"] = {"$elemMatch": {"$regex": escaped_skill, "$options": "i"}}

    if location and location.strip():
        escaped_location = re.escape(location.strip())
        query["location"] = {"$regex": escaped_location, "$options": "i"}

    if duration and duration.strip():
        escaped_duration = re.escape(duration.strip())
        query["duration"] = {"$regex": escaped_duration, "$options": "i"}

    cursor = opportunities_collection.find(query).sort("created_at", -1)
    opportunities = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        ngo = await users_collection.find_one({"_id": ObjectId(doc["ngo_id"])})
        if ngo:
            doc["ngo_name"] = ngo.get("name")
            doc["organization_name"] = ngo.get("organization_name")
        opportunities.append(doc)
    return opportunities
