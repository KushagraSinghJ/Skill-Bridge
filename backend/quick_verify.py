import motor.motor_asyncio
import asyncio
from decouple import config

async def verify():
    try:
        url = config("MONGO_URL", default="mongodb://localhost:27017")
        client = motor.motor_asyncio.AsyncIOMotorClient(url)
        await client.admin.command('ismaster')
        print("DB: OK")
    except Exception as e:
        print(f"DB: FAILED - {e}")

if __name__ == "__main__":
    asyncio.run(verify())
