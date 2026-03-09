import requests
import json

def test_registration():
    url = "http://localhost:8000/api/auth/register"
    payload = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "Password123!",
        "role": "volunteer",
        "location": "London",
        "skills": ["Python", "React"]
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_registration()
