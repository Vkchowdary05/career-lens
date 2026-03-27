from fastapi import APIRouter, Depends, Query
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter()

@router.get("/")
async def get_leaderboard(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    skip = (page - 1) * limit
    users = await db.users.find({}).sort("points", -1).skip(skip).limit(limit).to_list(limit)
    result = []
    for i, u in enumerate(users):
        result.append({
            "rank": skip + i + 1,
            "id": str(u["_id"]),
            "username": u["username"],
            "full_name": u["full_name"],
            "photo_url": u.get("photo_url"),
            "college": u.get("college"),
            "current_company": u.get("current_company"),
            "points": u.get("points", 0),
            "experiences_count": u.get("experiences_count", 0),
            "badges": u.get("badges", []),
            "is_current_user": str(u["_id"]) == str(current_user["_id"])
        })
    return {"leaderboard": result, "page": page, "has_more": len(users) == limit}
