import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_auth_flow():
    # 1. Register a new user
    print("\n--- Testing Registration ---")
    register_payload = {
        "username": "testuser_jwt",
        "email": f"test_jwt_{int(time.time())}@example.com",
        "password": "password123",
        "role": "user"
    }
    resp = requests.post(f"{BASE_URL}/api/user/register", json=register_payload)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.json()}")
    
    if resp.status_code != 200:
        print("Registration failed, skipping login test.")
        return

    # 2. Login
    print("\n--- Testing Login ---")
    login_payload = {
        "email": register_payload["email"],
        "password": "password123"
    }
    resp = requests.post(f"{BASE_URL}/api/user/login", json=login_payload)
    print(f"Status: {resp.status_code}")
    login_data = resp.json()
    print(f"Response: {login_data}")
    
    if resp.status_code != 200:
        print("Login failed, skipping protected route test.")
        return
    
    token = login_data.get("access_token")
    if not token:
        print("Access token not found in response.")
        return

    # 3. Access Protected Route
    print("\n--- Testing Protected Route (/api/profile/profile) ---")
    profile_payload = {
        "email": register_payload["email"],
        "full_name": "Test User",
        "bio": "I am a test user.",
        "skills": ["Python", "JWT"]
    }
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.post(f"{BASE_URL}/api/profile/profile", json=profile_payload, headers=headers)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.json()}")

if __name__ == "__main__":
    test_auth_flow()
