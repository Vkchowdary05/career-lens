import datetime
from bson import ObjectId

POINTS_CONFIG = {
    "share_experience_basic": 25,
    "share_experience_with_questions": 20,
    "share_experience_with_resources": 20,
    "share_experience_with_tips": 10,
    "post_created": 5,
    "post_liked_received": 1,
    "comment_made": 2,
    "comment_received": 1,
    "resume_generated": 10,
    "application_tracked": 5,
    "application_stage_updated": 3,
}

async def award_points(user_id, action: str, db) -> int:
    points = POINTS_CONFIG.get(action, 0)
    if points <= 0:
        return 0
    if isinstance(user_id, str):
        user_id = ObjectId(user_id)
    await db.users.update_one(
        {"_id": user_id},
        {
            "$inc": {"points": points},
            "$push": {
                "points_history": {
                    "action": action,
                    "points": points,
                    "timestamp": datetime.datetime.utcnow()
                }
            }
        }
    )
    return points
