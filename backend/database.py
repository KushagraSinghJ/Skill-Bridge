import motor.motor_asyncio
from decouple import config

MONGO_URL = config("MONGO_URL", default="mongodb://localhost:27017")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)

db = client["milestone_db"]

users_collection = db["users"]
profiles_collection = db["profiles"]
<<<<<<< HEAD
opportunities_collection = db["opportunities"]
applications_collection = db["applications"]
messages_collection = db["messages"]
notifications_collection = db["notifications"]
=======
>>>>>>> origin/main
