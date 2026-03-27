from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_instance = Database()

async def connect_db():
    db_instance.client = AsyncIOMotorClient(settings.MONGODB_URL)
    db_instance.db = db_instance.client[settings.MONGODB_DB_NAME]
    await _create_indexes()
    print("[CareerLens] Connected to MongoDB.")

async def close_db():
    if db_instance.client:
        db_instance.client.close()

async def _create_indexes():
    db = db_instance.db
    await db.users.create_index("firebase_uid", unique=True)
    await db.users.create_index("username", unique=True)
    await db.users.create_index("email", unique=True)
    await db.posts.create_index([("created_at", -1)])
    await db.posts.create_index("author_id")
    await db.experiences.create_index("company_slug")
    await db.experiences.create_index([("created_at", -1)])
    await db.experiences.create_index("author_id")
    await db.companies.create_index("slug", unique=True)
    await db.tracker.create_index("user_id")
    await db.comments.create_index("parent_ref_id")
    await db.comments.create_index("parent_type")
    await db.notifications.create_index("recipient_id")
    await db.notifications.create_index([("created_at", -1)])

def get_db():
    return db_instance.db
