from passlib.context import CryptContext
import bcrypt

def diagnostic():
    print("--- Diagnostic Start ---")
    try:
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        password = "password123"
        print(f"Testing with password: {password}")
        hashed = pwd_context.hash(password)
        print(f"Hashed result: {hashed}")
        
        verified = pwd_context.verify(password, hashed)
        print(f"Verified: {verified}")
        
        # Test direct bcrypt
        print("\nTesting direct bcrypt:")
        b_pwd = password.encode('utf-8')
        b_hashed = bcrypt.hashpw(b_pwd, bcrypt.gensalt())
        print(f"Direct Hashed: {b_hashed}")
        
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    diagnostic()
