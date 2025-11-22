"""
Database Helper with Fallback
Handles MongoDB connection errors gracefully
"""
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure
import os

logger = logging.getLogger(__name__)

class DatabaseHelper:
    def __init__(self, mongo_url, db_name):
        self.mongo_url = mongo_url
        self.db_name = db_name
        self.client = None
        self.db = None
        self.is_connected = False
        
    async def connect(self):
        """Connect to MongoDB with short timeout"""
        try:
            # Short timeout for faster failure
            self.client = AsyncIOMotorClient(
                self.mongo_url, 
                serverSelectionTimeoutMS=2000,  # 2 seconds instead of 30
                connectTimeoutMS=2000
            )
            # Test connection
            await self.client.admin.command('ping')
            self.db = self.client[self.db_name]
            self.is_connected = True
            logger.info("✓ MongoDB connected")
            return True
        except (ServerSelectionTimeoutError, ConnectionFailure) as e:
            logger.warning(f"⚠ MongoDB not available: {str(e)[:100]}")
            self.is_connected = False
            return False
    
    async def get_collection(self, collection_name):
        """Get collection with connection check"""
        if not self.is_connected:
            await self.connect()
        
        if self.is_connected:
            return self.db[collection_name]
        return None
    
    async def find_one(self, collection_name, query):
        """Find one document with fallback"""
        try:
            collection = await self.get_collection(collection_name)
            if collection is None:
                return None
            return await collection.find_one(query)
        except Exception as e:
            logger.error(f"DB query error: {str(e)[:100]}")
            return None
    
    async def find_many(self, collection_name, query, limit=100):
        """Find many documents with fallback"""
        try:
            collection = await self.get_collection(collection_name)
            if collection is None:
                return []
            cursor = collection.find(query).limit(limit)
            return await cursor.to_list(length=limit)
        except Exception as e:
            logger.error(f"DB query error: {str(e)[:100]}")
            return []
    
    async def insert_one(self, collection_name, document):
        """Insert document with fallback"""
        try:
            collection = await self.get_collection(collection_name)
            if collection is None:
                logger.warning("Cannot insert: DB not connected")
                return None
            result = await collection.insert_one(document)
            return result.inserted_id
        except Exception as e:
            logger.error(f"DB insert error: {str(e)[:100]}")
            return None
    
    async def count_documents(self, collection_name, query={}):
        """Count documents with fallback"""
        try:
            collection = await self.get_collection(collection_name)
            if collection is None:
                return 0
            return await collection.count_documents(query)
        except Exception as e:
            logger.error(f"DB count error: {str(e)[:100]}")
            return 0

# Global instance
db_helper = None

def init_db_helper(mongo_url, db_name):
    global db_helper
    db_helper = DatabaseHelper(mongo_url, db_name)
    return db_helper

def get_db_helper():
    return db_helper
