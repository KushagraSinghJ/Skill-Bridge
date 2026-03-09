<<<<<<< HEAD
import time
from typing import Dict, Optional
=======

import time
from typing import Dict
>>>>>>> origin/main
from jose import jwt
from decouple import config

JWT_SECRET = config("SECRET_KEY", default="your_secret_key")
JWT_ALGORITHM = config("ALGORITHM", default="HS256")

def token_response(token: str):
    return {
        "access_token": token
    }

<<<<<<< HEAD
def signJWT(email: str, role: str, name: Optional[str] = None) -> Dict[str, str]:
    payload = {
        "email": email,
        "role": role,
        "name": name,
=======
def signJWT(user_id: str, role: str) -> Dict[str, str]:
    payload = {
        "user_id": user_id,
        "role": role,
>>>>>>> origin/main
        "expires": time.time() + 3600 # 1 hour
    }
    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token_response(token)

<<<<<<< HEAD
def decodeJWT(token: str) -> Optional[dict]:
    try:
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return decoded_token if decoded_token["expires"] >= time.time() else None
    except Exception as e:
        print(f"JWT decode error: {e}")
        return None
=======
def decodeJWT(token: str) -> dict:
    try:
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return decoded_token if decoded_token["expires"] >= time.time() else None
    except:
        return {}
>>>>>>> origin/main
