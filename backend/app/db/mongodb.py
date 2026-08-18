from motor.motor_asyncio import AsyncIOMotorClient
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class MongoDB:
    client: AsyncIOMotorClient = None

db = MongoDB()

async def connect_to_mongo():
    logger.info("Connecting to MongoDB...")
    db.client = AsyncIOMotorClient(settings.MONGODB_URI)
    logger.info("Connected to MongoDB.")

async def close_mongo_connection():
    logger.info("Closing MongoDB connection...")
    if db.client is not None:
        db.client.close()
    logger.info("MongoDB connection closed.")

def get_database():
    return db.client[settings.DATABASE_NAME]
