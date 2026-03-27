from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import UserUpdate
from app.services.cloudinary_service import upload_file
from bson import ObjectId
import datetime

router = APIRouter()

def _pub(user: dict) -> dict:
    user = dict(user)
    user["id"] = str(user["_id"])
    user.pop("_id", None)
    user.pop("firebase_uid", None)
    user.pop("email", None)
    user.pop("followers", None)
    user.pop("following", None)
    user.pop("points_history", None)
    return user

@router.get("/me")
async def get_my_profile(current_user=Depends(get_current_user)):
    return _pub(current_user)

@router.get("/{username}")
async def get_profile(username: str, db=Depends(get_db)):
    user = await db.users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _pub(user)

@router.put("/me/profile")
async def update_profile(
    data: UserUpdate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    update_dict = {k: v for k, v in data.dict().items() if v is not None}
    if not update_dict:
        return _pub(current_user)
    update_dict["updated_at"] = datetime.datetime.utcnow()
    await db.users.update_one({"_id": current_user["_id"]}, {"$set": update_dict})
    updated = await db.users.find_one({"_id": current_user["_id"]})
    return _pub(updated)

@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    content = await file.read()
    result = await upload_file(
        content, folder="avatars", resource_type="image",
        public_id=f"avatar_{current_user['_id']}"
    )
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"photo_url": result["url"]}}
    )
    return {"photo_url": result["url"]}

@router.post("/{username}/follow")
async def toggle_follow(
    username: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    target = await db.users.find_one({"username": username})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target["_id"] == current_user["_id"]:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    already = current_user["_id"] in target.get("followers", [])
    if already:
        await db.users.update_one({"_id": target["_id"]}, {"$pull": {"followers": current_user["_id"]}, "$inc": {"followers_count": -1}})
        await db.users.update_one({"_id": current_user["_id"]}, {"$pull": {"following": target["_id"]}, "$inc": {"following_count": -1}})
        return {"following": False}
    else:
        await db.users.update_one({"_id": target["_id"]}, {"$addToSet": {"followers": current_user["_id"]}, "$inc": {"followers_count": 1}})
        await db.users.update_one({"_id": current_user["_id"]}, {"$addToSet": {"following": target["_id"]}, "$inc": {"following_count": 1}})
        await db.notifications.insert_one({
            "recipient_id": target["_id"],
            "sender_id": current_user["_id"],
            "sender_name": current_user.get("full_name", ""),
            "sender_photo": current_user.get("photo_url"),
            "type": "follow",
            "read": False,
            "created_at": datetime.datetime.utcnow()
        })
        return {"following": True}

@router.get("/me/stats")
async def get_my_stats(current_user=Depends(get_current_user), db=Depends(get_db)):
    uid = current_user["_id"]
    posts_count = await db.posts.count_documents({"author_id": uid, "is_deleted": {"$ne": True}})
    exp_count = await db.experiences.count_documents({"author_id": uid})
    return {
        "points": current_user.get("points", 0),
        "followers_count": current_user.get("followers_count", 0),
        "following_count": current_user.get("following_count", 0),
        "posts_count": posts_count,
        "experiences_count": exp_count
    }
