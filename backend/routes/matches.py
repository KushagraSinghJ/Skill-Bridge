from datetime import datetime
from typing import List

from bson import ObjectId
from fastapi import APIRouter, Depends, Query

from database import notifications_collection, opportunities_collection, users_collection
from routes.user import get_current_user
from schemas.match_schema import MatchSuggestion

router = APIRouter()


def _normalize_skills(skills):
    return {skill.strip().lower() for skill in (skills or []) if skill and skill.strip()}


def _location_match(user_location: str, target_location: str) -> bool:
    if not user_location or not target_location:
        return False
    a = user_location.strip().lower()
    b = target_location.strip().lower()
    return a in b or b in a


async def _create_match_notification_if_missing(user_id: str, reference_id: str, body: str):
    existing = await notifications_collection.find_one(
        {"user_id": user_id, "type": "match", "reference_id": reference_id}
    )
    if existing:
        return
    await notifications_collection.insert_one(
        {
            "user_id": user_id,
            "type": "match",
            "title": "New Match",
            "body": body,
            "reference_id": reference_id,
            "is_read": False,
            "created_at": datetime.utcnow(),
        }
    )


@router.get("/suggestions", response_model=List[MatchSuggestion])
async def get_match_suggestions(
    limit: int = Query(8, ge=1, le=30),
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] == "volunteer":
        volunteer_skills = _normalize_skills(current_user.get("skills", []))
        volunteer_location = current_user.get("location")
        cursor = opportunities_collection.find({"status": "open"}).sort("created_at", -1)
        matches = []

        async for opp in cursor:
            opp_skills = _normalize_skills(opp.get("required_skills", []))
            overlap = sorted(list(volunteer_skills.intersection(opp_skills)))
            location_match = _location_match(volunteer_location, opp.get("location"))
            score = len(overlap) * 3 + (2 if location_match else 0)
            if score <= 0:
                continue

            ngo = await users_collection.find_one({"_id": ObjectId(opp["ngo_id"])})
            suggestion = MatchSuggestion(
                score=score,
                location_match=location_match,
                matching_skills=overlap,
                opportunity_id=str(opp["_id"]),
                opportunity_title=opp.get("title"),
                duration=opp.get("duration"),
                location=opp.get("location"),
                ngo_id=opp.get("ngo_id"),
                ngo_name=(ngo.get("organization_name") or ngo.get("name")) if ngo else "NGO",
            )
            matches.append(suggestion)

        matches = sorted(matches, key=lambda x: x.score, reverse=True)[:limit]
        for match in matches[:3]:
            await _create_match_notification_if_missing(
                current_user["id"],
                match.opportunity_id,
                f"{match.opportunity_title} matches your profile",
            )
        return matches

    ngo_opps = []
    cursor_opp = opportunities_collection.find({"ngo_id": current_user["id"], "status": "open"})
    async for opp in cursor_opp:
        ngo_opps.append(opp)

    cursor_volunteers = users_collection.find({"role": "volunteer"})
    volunteers = []
    async for volunteer in cursor_volunteers:
        volunteer["id"] = str(volunteer["_id"])
        volunteers.append(volunteer)

    matches = []
    for opp in ngo_opps:
        opp_skills = _normalize_skills(opp.get("required_skills", []))
        for volunteer in volunteers:
            volunteer_skills = _normalize_skills(volunteer.get("skills", []))
            overlap = sorted(list(opp_skills.intersection(volunteer_skills)))
            location_match = _location_match(opp.get("location"), volunteer.get("location"))
            score = len(overlap) * 3 + (2 if location_match else 0)
            if score <= 0:
                continue

            matches.append(
                MatchSuggestion(
                    score=score,
                    location_match=location_match,
                    matching_skills=overlap,
                    opportunity_id=str(opp["_id"]),
                    opportunity_title=opp.get("title"),
                    location=opp.get("location"),
                    duration=opp.get("duration"),
                    volunteer_id=volunteer["id"],
                    volunteer_name=volunteer.get("name"),
                    volunteer_location=volunteer.get("location"),
                )
            )

    matches = sorted(matches, key=lambda x: x.score, reverse=True)[:limit]
    for match in matches[:3]:
        if not match.volunteer_id or not match.opportunity_id:
            continue
        await _create_match_notification_if_missing(
            current_user["id"],
            f"{match.opportunity_id}:{match.volunteer_id}",
            f"{match.volunteer_name or 'A volunteer'} is a strong match for {match.opportunity_title or 'your opportunity'}",
        )
    return matches
