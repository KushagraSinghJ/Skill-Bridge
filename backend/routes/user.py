from fastapi import APIRouter, HTTPException
from database import users_collection
from schemas.user_schema import UserRegister, UserResponse, UserLogin
from auth.jwt_handler import signJWT
from auth.password_utils import hash_password, verify_password

router = APIRouter()


# -----------------------------
# REGISTER USER
# -----------------------------
@router.post("/register", response_model=UserResponse)
async def register_user(user: UserRegister):
    
    # Check if email already exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

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


# -----------------------------
# LOGIN USER
# -----------------------------
@router.post("/login")
async def login_user(user: UserLogin):

    existing_user = await users_collection.find_one({"email": user.email})

    if not existing_user:
        raise HTTPException(status_code=400, detail="User not found")

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
