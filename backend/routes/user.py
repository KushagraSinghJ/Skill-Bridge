<<<<<<< HEAD
from fastapi import APIRouter, HTTPException, Depends, Header, Query
from database import users_collection, opportunities_collection, applications_collection
from schemas.user_schema import UserRegister, UserResponse, UserLogin, ProfileUpdate
from auth.jwt_handler import signJWT, decodeJWT
from auth.password_utils import hash_password, verify_password
from bson import ObjectId
from typing import Optional

router = APIRouter()

# Helper to get current user from token
async def get_current_user(authorization: str = Header(...)):
    token = authorization.split(" ")[1] if " " in authorization else authorization
    decoded = decodeJWT(token)
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user = await users_collection.find_one({"email": decoded["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user["id"] = str(user["_id"])
    return user
=======
from fastapi import APIRouter, HTTPException
from database import users_collection
from schemas.user_schema import UserRegister, UserResponse, UserLogin
from auth.jwt_handler import signJWT
from auth.password_utils import hash_password, verify_password

router = APIRouter()

>>>>>>> origin/main

# -----------------------------
# REGISTER USER
# -----------------------------
@router.post("/register", response_model=UserResponse)
async def register_user(user: UserRegister):
<<<<<<< HEAD
=======
    
>>>>>>> origin/main
    # Check if email already exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

<<<<<<< HEAD
    hashed_pwd = hash_password(user.password)
    user_data = user.dict()
    user_data["password"] = hashed_pwd

    result = await users_collection.insert_one(user_data)
    
    return UserResponse(
        id=str(result.inserted_id),
        name=user.name,
        email=user.email,
        role=user.role,
        skills=user.skills,
        location=user.location,
        bio=user.bio,
        organization_name=user.organization_name,
        organization_description=user.organization_description,
        website_url=user.website_url,
        message="User registered successfully"
    )
=======
    # 🔐 HASH THE PASSWORD
    hashed_pwd = hash_password(user.password)

    user_data = user.dict()
    user_data["password"] = hashed_pwd   # Replace plain password with hashed

    await users_collection.insert_one(user_data)

    return {
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "message": "User registered successfully"
    }

>>>>>>> origin/main

# -----------------------------
# LOGIN USER
# -----------------------------
@router.post("/login")
async def login_user(user: UserLogin):
<<<<<<< HEAD
=======

>>>>>>> origin/main
    existing_user = await users_collection.find_one({"email": user.email})

    if not existing_user:
        raise HTTPException(status_code=400, detail="User not found")
<<<<<<< HEAD
    if not verify_password(user.password, existing_user['password']):
        raise HTTPException(status_code=400, detail="Invalid password")
    
    # Use name or email for signJWT as needed. JWT_HANDLER uses email/role/username
    # Let's use email as the identifier.
    token_resp = signJWT(existing_user['email'], existing_user['role'], existing_user.get('name', existing_user.get('username')))
    
    user_info = {
        "id": str(existing_user["_id"]),
        "name": existing_user.get("name", existing_user.get("username")),
        "email": existing_user["email"],
        "role": existing_user["role"],
        "skills": existing_user.get("skills", []),
        "location": existing_user.get("location"),
        "bio": existing_user.get("bio"),
    }
    if existing_user["role"] == "ngo":
        user_info.update({
            "organization_name": existing_user.get("organization_name"),
            "organization_description": existing_user.get("organization_description"),
            "website_url": existing_user.get("website_url")
        })

    return {
        "user": user_info,
        "token": token_resp["access_token"],
        "message": "User logged in successfully"
    }

# -----------------------------
# UPDATE PROFILE
# -----------------------------
@router.put("/profile", response_model=UserResponse)
async def update_profile(profile: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in profile.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided to update")
    
    await users_collection.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": update_data}
    )
    
    updated_user = await users_collection.find_one({"_id": ObjectId(current_user["id"])})
    updated_user["id"] = str(updated_user["_id"])
    
    return {**updated_user, "message": "Profile updated successfully"}

# -----------------------------
# GET DASHBOARD STATS
# -----------------------------
@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    role = current_user["role"]
    stats = {}
    
    if role == "ngo":
        # Active Opportunities
        opp_count = await opportunities_collection.count_documents({"ngo_id": current_user["id"], "status": "open"})
        
        # Pending Applications count
        # 1. Get all NGO opp IDs
        opp_cursor = opportunities_collection.find({"ngo_id": current_user["id"]})
        opp_ids = []
        async for opp in opp_cursor:
            opp_ids.append(str(opp["_id"]))
        
        # 2. Count pending applications for those opps
        app_count = await applications_collection.count_documents({"opportunity_id": {"$in": opp_ids}, "status": "pending"})
        
        # Total volunteers (unique volunteers who applied to this NGO's opportunities)
        volunteers_cursor = applications_collection.distinct("volunteer_id", {"opportunity_id": {"$in": opp_ids}})
        volunteers_list = await volunteers_cursor
        unique_volunteers = len(volunteers_list)
        
        stats = {
            "activeOpps": opp_count,
            "pendingApps": app_count,
            "totalVolunteers": unique_volunteers,
            "totalOpps": await opportunities_collection.count_documents({"ngo_id": current_user["id"]})
        }
    else: # volunteer
        # My applications
        total_apps = await applications_collection.count_documents({"volunteer_id": current_user["id"]})
        accepted_apps = await applications_collection.count_documents({"volunteer_id": current_user["id"], "status": "accepted"})
        pending_apps = await applications_collection.count_documents({"volunteer_id": current_user["id"], "status": "pending"})
        
        stats = {
            "applications": total_apps,
            "accepted": accepted_apps,
            "pending": pending_apps,
            "skillsCount": len(current_user.get("skills", []))
        }
        
    return stats


# -----------------------------
# GET ALL VOLUNTEERS (NGO ONLY)
# -----------------------------
@router.get("/volunteers")
async def get_all_volunteers(
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] != "ngo":
        raise HTTPException(status_code=403, detail="Access denied: NGOs only")

    query = {"role": "volunteer"}
    if search and search.strip():
        search_value = search.strip()
        query["$or"] = [
            {"name": {"$regex": search_value, "$options": "i"}},
            {"email": {"$regex": search_value, "$options": "i"}},
            {"location": {"$regex": search_value, "$options": "i"}},
            {"skills": {"$elemMatch": {"$regex": search_value, "$options": "i"}}},
        ]

    cursor = users_collection.find(
        query,
        {
            "password": 0,
        },
    ).sort("name", 1).limit(limit)

    volunteers = []
    async for volunteer in cursor:
        volunteer["id"] = str(volunteer["_id"])
        volunteers.append(
            {
                "id": volunteer["id"],
                "name": volunteer.get("name"),
                "email": volunteer.get("email"),
                "location": volunteer.get("location"),
                "bio": volunteer.get("bio"),
                "skills": volunteer.get("skills", []),
            }
        )

    return volunteers
=======

    # 🔐 VERIFY HASHED PASSWORD
    if not verify_password(user.password, existing_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid password")

    # Generate JWT Token
    token_resp = signJWT(existing_user["email"], existing_user["role"])

    return {
        "username": existing_user["username"],
        "email": existing_user["email"],
        "role": existing_user["role"],
        "message": "User logged in successfully",
        "access_token": token_resp["access_token"],
        "token_type": "bearer"
    }
>>>>>>> origin/main
