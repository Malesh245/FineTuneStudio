"""MongoDB async connection using Motor."""
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGO_URI, MONGO_DB

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    """Connect to MongoDB. Called on app startup."""
    global client, db
    try:
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[MONGO_DB]
        # Verify connection
        await client.admin.command("ping")
        print(f"[OK] MongoDB connected: {MONGO_URI}/{MONGO_DB}")
    except Exception as e:
        print(f"[WARN] MongoDB not available ({e}). Running in demo mode.")
        db = None


async def close_db():
    """Close MongoDB connection. Called on app shutdown."""
    global client
    if client:
        client.close()
        print("[INFO] MongoDB disconnected")


def get_db():
    """Get the database instance."""
    return db
