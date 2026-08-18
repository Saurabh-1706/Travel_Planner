import redis.asyncio as redis
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class RedisDB:
    client = None

redis_db = RedisDB()

async def get_redis_client():
    if redis_db.client is None:
        logger.info("Connecting to Redis...")
        redis_db.client = redis.from_url(settings.REDIS_URI, decode_responses=True)
        logger.info("Connected to Redis.")
    return redis_db.client

async def close_redis_connection():
    if redis_db.client is not None:
        logger.info("Closing Redis connection...")
        await redis_db.client.close()
        logger.info("Redis connection closed.")
