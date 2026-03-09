import subprocess
import time
import requests
import os

def run_debug_test():
    with open("logs.txt", "w") as log_file:
        log_file.write("Starting backend...\n")
        log_file.flush()
        
        backend_process = subprocess.Popen(
            ["python", "main_debug.py"],
            stdout=log_file,
            stderr=subprocess.STDOUT,
            text=True,
            cwd=os.getcwd()
        )
        
        # Wait for startup
        time.sleep(5)
        
        print("Running registration test...")
        url = "http://localhost:8001/api/auth/register"
        payload = {
            "name": "Test User",
            "email": "test_debug@example.com",
            "password": "Password123!",
            "role": "volunteer"
        }
        
        try:
            response = requests.post(url, json=payload, timeout=10)
            print(f"Status Code: {response.status_code}")
            print(f"Response Body: {response.text}")
        except Exception as e:
            print(f"Request failed: {e}")
        
        print("Stopping backend...")
        backend_process.terminate()
        backend_process.wait()
    
    with open("logs.txt", "r") as f:
        print("\n--- BACKEND LOGS ---")
        print(f.read())
        print("--- END LOGS ---")

if __name__ == "__main__":
    run_debug_test()
