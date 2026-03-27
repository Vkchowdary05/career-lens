from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from app.database import get_db
from app.dependencies import get_current_user
from app.models.post import PostCreate, CommentCreate
from app.services.cloudinary_service import upload_file
from app.services.points_service import award_points
from bson import ObjectId
import datetime

router = APIRouter()

def _s(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    if "author_id" in doc and isinstance(doc["author_id"], ObjectId):
        doc["author_id"] = str(doc["author_id"])
    if "likes" in doc:
        doc["likes"] = [str(x) for x in doc["likes"]]
    return doc

async def _enrich_post(post: dict, current_user_id, db) -> dict:
    post = _s(post)
    author = await db.users.find_one({"_id": ObjectId(post["author_id"]) if isinstance(post["author_id"], str) else post["author_id"]})
    if author:
        post["author"] = {
            "username": author["username"],
            "full_name": author["full_name"],
            "photo_url": author.get("photo_url")
        }
    post["is_liked"] = str(current_user_id) in post.get("likes", [])
    return post

@router.get("/posts")
async def get_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    feed_type: str = Query("latest"),
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    skip = (page - 1) * limit
    query = {"is_deleted": {"$ne": True}}
    if feed_type == "following":
        query["author_id"] = {"$in": current_user.get("following", [])}
    cursor = db.posts.find(query).sort("created_at", -1).skip(skip).limit(limit)
    posts = await cursor.to_list(length=limit)
    enriched = [await _enrich_post(p, current_user["_id"], db) for p in posts]
    return {"posts": enriched, "page": page, "has_more": len(posts) == limit}

@router.post("/posts")
async def create_post(
    data: PostCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    now = datetime.datetime.utcnow()
    doc = data.dict()
    doc["author_id"] = current_user["_id"]
    doc["likes"] = []
    doc["likes_count"] = 0
    doc["comments_count"] = 0
    doc["is_deleted"] = False
    doc["created_at"] = now
    doc["updated_at"] = now
    result = await db.posts.insert_one(doc)
    await db.users.update_one({"_id": current_user["_id"]}, {"$inc": {"posts_count": 1}})
    await award_points(current_user["_id"], "post_created", db)
    doc["_id"] = result.inserted_id
    return await _enrich_post(doc, current_user["_id"], db)

@router.post("/posts/{post_id}/like")
async def toggle_like(
    post_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    try:
        oid = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post id")
    post = await db.posts.find_one({"_id": oid})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    uid = current_user["_id"]
    already = uid in post.get("likes", [])
    if already:
        await db.posts.update_one({"_id": oid}, {"$pull": {"likes": uid}, "$inc": {"likes_count": -1}})
        return {"liked": False, "likes_count": post.get("likes_count", 1) - 1}
    else:
        await db.posts.update_one({"_id": oid}, {"$addToSet": {"likes": uid}, "$inc": {"likes_count": 1}})
        await award_points(post["author_id"], "post_liked_received", db)
        await db.notifications.insert_one({
            "recipient_id": post["author_id"],
            "sender_id": uid,
            "sender_name": current_user.get("full_name", ""),
            "sender_photo": current_user.get("photo_url"),
            "type": "like",
            "post_id": oid,
            "read": False,
            "created_at": datetime.datetime.utcnow()
        })
        return {"liked": True, "likes_count": post.get("likes_count", 0) + 1}

@router.post("/posts/{post_id}/upload-image")
async def upload_post_image(
    post_id: str,
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    try:
        oid = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    post = await db.posts.find_one({"_id": oid, "author_id": current_user["_id"]})
    if not post:
        raise HTTPException(status_code=404, detail="Not found or unauthorized")
    content = await file.read()
    result = await upload_file(content, folder="post_images", resource_type="image")
    await db.posts.update_one({"_id": oid}, {"$set": {"image_url": result["url"]}})
    return {"image_url": result["url"]}

@router.get("/posts/{post_id}/comments")
async def get_comments(
    post_id: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        oid = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    top_level = await db.comments.find({
        "parent_ref_id": oid,
        "parent_type": "post",
        "parent_comment_id": None
    }).sort("created_at", 1).to_list(100)
    result = []
    for c in top_level:
        c = _s(c)
        author = await db.users.find_one({"_id": ObjectId(c.get("author_id", ""))}) if c.get("author_id") else None
        if author:
            c["author"] = {"username": author["username"], "full_name": author["full_name"], "photo_url": author.get("photo_url")}
        replies_raw = await db.comments.find({"parent_comment_id": c["id"]}).sort("created_at", 1).to_list(20)
        c["replies"] = [_s(r) for r in replies_raw]
        result.append(c)
    return result

@router.post("/posts/{post_id}/comments")
async def add_comment(
    post_id: str,
    data: CommentCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    try:
        oid = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    now = datetime.datetime.utcnow()
    doc = {
        "parent_ref_id": oid,
        "parent_type": "post",
        "parent_comment_id": data.parent_comment_id,
        "author_id": current_user["_id"],
        "content": data.content,
        "likes": [],
        "likes_count": 0,
        "created_at": now
    }
    result = await db.comments.insert_one(doc)
    await db.posts.update_one({"_id": oid}, {"$inc": {"comments_count": 1}})
    await award_points(current_user["_id"], "comment_made", db)
    doc["_id"] = result.inserted_id
    return _s(doc)

@router.delete("/posts/{post_id}")
async def delete_post(
    post_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    try:
        oid = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    post = await db.posts.find_one({"_id": oid, "author_id": current_user["_id"]})
    if not post:
        raise HTTPException(status_code=404, detail="Not found or unauthorized")
    await db.posts.update_one({"_id": oid}, {"$set": {"is_deleted": True}})
    return {"deleted": True}

@router.get("/trending-companies")
async def trending_companies(db=Depends(get_db), current_user=Depends(get_current_user)):
    pipeline = [
        {"$match": {"is_public": True}},
        {"$group": {"_id": "$company_slug", "company_name": {"$first": "$company_name"}, "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    result = await db.experiences.aggregate(pipeline).to_list(5)
    return [{"name": r["company_name"], "slug": r["_id"], "count": r["count"]} for r in result]

@router.get("/top-contributors")
async def top_contributors(db=Depends(get_db), current_user=Depends(get_current_user)):
    users = await db.users.find({}).sort("points", -1).limit(5).to_list(5)
    return [{"username": u["username"], "full_name": u["full_name"], "photo_url": u.get("photo_url"), "points": u.get("points", 0)} for u in users]
