from fastapi import APIRouter, Depends, Query
from app.database import get_db
from app.dependencies import get_current_user
from bson import ObjectId

router = APIRouter()

@router.get("/")
async def get_notifications(
    page: int = Query(1, ge=1),
    notif_type: str = Query(None),
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    skip = (page - 1) * 30
    query = {"recipient_id": current_user["_id"]}
    if notif_type and notif_type.lower() != "all":
        query["type"] = notif_type.lower()
    notifs = await db.notifications.find(query).sort("created_at", -1).skip(skip).limit(30).to_list(30)
    result = []
    for n in notifs:
        n_dict = dict(n)
        n_dict["id"] = str(n_dict["_id"])
        n_dict.pop("_id", None)
        if isinstance(n_dict.get("recipient_id"), ObjectId):
            n_dict["recipient_id"] = str(n_dict["recipient_id"])
        if isinstance(n_dict.get("sender_id"), ObjectId):
            n_dict["sender_id"] = str(n_dict["sender_id"])
        if isinstance(n_dict.get("post_id"), ObjectId):
            n_dict["post_id"] = str(n_dict["post_id"])
        result.append(n_dict)
    await db.notifications.update_many(
        {"recipient_id": current_user["_id"], "read": False},
        {"$set": {"read": True}}
    )
    return result

@router.get("/unread-count")
async def unread_count(db=Depends(get_db), current_user=Depends(get_current_user)):
    count = await db.notifications.count_documents({"recipient_id": current_user["_id"], "read": False})
    return {"unread_count": count}
