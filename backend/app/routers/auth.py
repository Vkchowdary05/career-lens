from fastapi import APIRouter, Depends, HTTPException
from app.database import get_db
from app.services.firebase_service import verify_firebase_token
from app.models.user import UserRegister
from app.dependencies import get_current_user
from slugify import slugify
import datetime
from bson import ObjectId

router = APIRouter()

def _serialize_user(user: dict) -> dict:
    user = dict(user)
    user["id"] = str(user["_id"])
    user.pop("_id", None)
    user.pop("firebase_uid", None)
    user.pop("points_history", None)
    user.pop("followers", None)
    user.pop("following", None)
    return user

@router.post("/register")
async def register(data: UserRegister, db=Depends(get_db)):
    existing = await db.users.find_one({"firebase_uid": data.firebase_uid})
    if existing:
        return _serialize_user(existing)

    base_username = slugify(data.full_name or data.email.split("@")[0])
    username = data.username or base_username
    counter = 0
    while await db.users.find_one({"username": username}):
        counter += 1
        username = f"{base_username}{counter}"

    now = datetime.datetime.utcnow()
    doc = {
        "firebase_uid": data.firebase_uid,
        "email": data.email,
        "full_name": data.full_name,
        "username": username,
        "photo_url": data.photo_url,
        "auth_provider": data.auth_provider,
        "bio": None,
        "college": None,
        "graduation_year": None,
        "current_company": None,
        "current_role": None,
        "location": None,
        "linkedin_url": None,
        "github_url": None,
        "portfolio_url": None,
        "open_to_opportunities": False,
        "points": 0,
        "points_history": [],
        "followers": [],
        "following": [],
        "followers_count": 0,
        "following_count": 0,
        "experiences_count": 0,
        "posts_count": 0,
        "badges": [],
        "created_at": now,
        "updated_at": now
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize_user(doc)

@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    return _serialize_user(current_user)
