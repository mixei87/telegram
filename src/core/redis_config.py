from redis.asyncio import Redis
from src.core.config import settings

redis: Redis = Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT)
