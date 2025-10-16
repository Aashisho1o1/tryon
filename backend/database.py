from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from config import settings
import logging

logger = logging.getLogger(__name__)


class MongoDB:
    """MongoDB database connection manager"""

    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

    @classmethod
    async def connect_db(cls):
        """Connect to MongoDB"""
        try:
            cls.client = AsyncIOMotorClient(settings.MONGODB_URL)
            cls.db = cls.client[settings.MONGODB_DB_NAME]

            # Test the connection
            await cls.client.admin.command('ping')
            logger.info(f"Connected to MongoDB: {settings.MONGODB_DB_NAME}")

            # Create indexes
            await cls.create_indexes()

        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    @classmethod
    async def close_db(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            logger.info("Closed MongoDB connection")

    @classmethod
    async def create_indexes(cls):
        """Create database indexes for better performance"""
        try:
            # Jewelry items indexes
            await cls.db.jewelry_items.create_index("item_id", unique=True)
            await cls.db.jewelry_items.create_index("type")
            await cls.db.jewelry_items.create_index("status")
            await cls.db.jewelry_items.create_index([("created_at", -1)])
            await cls.db.jewelry_items.create_index([("metadata.tags", 1)])

            # Analytics events indexes
            await cls.db.analytics_events.create_index("jewelry_id")
            await cls.db.analytics_events.create_index("event_type")
            await cls.db.analytics_events.create_index([("timestamp", -1)])
            await cls.db.analytics_events.create_index("session_id")

            logger.info("Database indexes created successfully")
        except Exception as e:
            logger.error(f"Failed to create indexes: {e}")

    @classmethod
    def get_db(cls) -> AsyncIOMotorDatabase:
        """Get database instance"""
        return cls.db


# Dependency for FastAPI routes
async def get_database() -> AsyncIOMotorDatabase:
    """FastAPI dependency to get database"""
    return MongoDB.get_db()
