from passlib.context import CryptContext

<<<<<<< HEAD
# Switch to pbkdf2_sha256 for better portability and avoiding bcrypt 72-char limit issues
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
=======
pwd_context = CryptContext(
    schemes=["bcrypt"],
>>>>>>> origin/main
    deprecated="auto"
)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
