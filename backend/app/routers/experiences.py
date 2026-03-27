from fastapi import APIRouter, Depends, HTTPException, Query
from app.database import get_db
from app.dependencies import get_current_user
from app.models.experience import ExperienceCreate
from app.models.post import CommentCreate
from app.services.points_service import award_points
from slugify import slugify
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

def _calc_points(data: ExperienceCreate) -> int:
    pts = 25
    if data.prep_resources:
        pts += 20
    if data.tips_and_advice:
        pts += 10
    total_questions = sum(len(r.questions_asked) for r in data.rounds)
    if total_questions > 0:
        pts += 20
    return pts

@router.post("/")
async def create_experience(
    data: ExperienceCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    slug = slugify(data.company_name)
    await db.companies.update_one(
        {"slug": slug},
        {
            "$setOnInsert": {
                "name": data.company_name,
                "slug": slug,
                "created_at": datetime.datetime.utcnow()
            },
            "$inc": {"experience_count": 1}
        },
        upsert=True
    )
    now = datetime.datetime.utcnow()
    doc = data.dict()
    doc["company_slug"] = slug
    doc["rounds"] = [r.dict() for r in data.rounds]
    doc["prep_resources"] = [r.dict() for r in data.prep_resources]
    doc["author_id"] = current_user["_id"]
    doc["likes"] = []
    doc["likes_count"] = 0
    doc["comments_count"] = 0
    doc["views_count"] = 0
    doc["created_at"] = now
    doc["updated_at"] = now
    result = await db.experiences.insert_one(doc)
    pts = _calc_points(data)
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$inc": {"points": pts, "experiences_count": 1}}
    )
    doc["_id"] = result.inserted_id
    return {"experience": _s(doc), "points_earned": pts}

@router.get("/")
async def list_experiences(
    company_slug: str = Query(None),
    role: str = Query(None),
    outcome: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    skip = (page - 1) * limit
    query = {"is_public": True}
    if company_slug:
        query["company_slug"] = company_slug
    if role:
        query["role"] = {"$regex": role, "$options": "i"}
    if outcome:
        query["outcome"] = outcome
    cursor = db.experiences.find(query).sort("created_at", -1).skip(skip).limit(limit)
    exps = await cursor.to_list(length=limit)
    result = []
    for e in exps:
        e = _s(e)
        author = await db.users.find_one({"_id": ObjectId(e["author_id"])}) if e.get("author_id") else None
        if author:
            e["author"] = {"username": author["username"], "full_name": author["full_name"], "photo_url": author.get("photo_url"), "points": author.get("points", 0)}
        result.append(e)
    return {"experiences": result, "page": page, "has_more": len(exps) == limit}

@router.get("/meta/options")
async def get_meta_options():
    return {
        "round_types": ["Phone Screen", "Online Assessment", "System Design", "Behavioral", "Technical Interview", "Coding", "Take Home", "Final Round", "Group Discussion", "HR Interview", "Case Study Round", "Managerial Round", "Director Round", "Other"],
        "application_sources": ["Direct", "LinkedIn", "Indeed", "Glassdoor", "Company Website", "Referral", "Job Board", "Naukri", "Internshala", "Wellfound", "Unstop", "HackerEarth", "Campus Placement", "Cold Outreach", "Hackathon / Contest", "Other"],
        "outcomes": ["Got the Offer", "Rejected after Offer", "Waitlisted", "Rejected after Round 1", "Rejected after Round 2", "Rejected after Round 3", "Withdrew Application", "No Response", "Pending"],
        "package_ranges": ["Not Disclosed", "Below 3 LPA", "3-6 LPA", "6-10 LPA", "10-15 LPA", "15-20 LPA", "20-30 LPA", "30-50 LPA", "50+ LPA", "Above 1 CR"],
        "difficulty_levels": ["Easy", "Medium", "Hard", "Very Hard"],
        "employment_types": ["Full-time", "Internship", "Contract", "Part-time"],
        "experience_levels": ["Fresher", "0-1 year", "1-3 years", "3-5 years", "5+ years"]
    }

@router.get("/{experience_id}")
async def get_experience(
    experience_id: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        oid = ObjectId(experience_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    exp = await db.experiences.find_one({"_id": oid})
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    await db.experiences.update_one({"_id": oid}, {"$inc": {"views_count": 1}})
    exp = _s(exp)
    author = await db.users.find_one({"_id": ObjectId(exp["author_id"])}) if exp.get("author_id") else None
    if author:
        exp["author"] = {
            "username": author["username"],
            "full_name": author["full_name"],
            "photo_url": author.get("photo_url"),
            "bio": author.get("bio"),
            "points": author.get("points", 0),
            "college": author.get("college")
        }
    exp["is_liked"] = str(current_user["_id"]) in exp.get("likes", [])
    return exp

@router.post("/{experience_id}/like")
async def toggle_experience_like(
    experience_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    try:
        oid = ObjectId(experience_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    exp = await db.experiences.find_one({"_id": oid})
    if not exp:
        raise HTTPException(status_code=404, detail="Not found")
    uid = current_user["_id"]
    already = uid in exp.get("likes", [])
    if already:
        await db.experiences.update_one({"_id": oid}, {"$pull": {"likes": uid}, "$inc": {"likes_count": -1}})
        return {"liked": False}
    else:
        await db.experiences.update_one({"_id": oid}, {"$addToSet": {"likes": uid}, "$inc": {"likes_count": 1}})
        return {"liked": True}

@router.get("/{experience_id}/comments")
async def get_experience_comments(
    experience_id: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        oid = ObjectId(experience_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    comments = await db.comments.find({
        "parent_ref_id": oid,
        "parent_type": "experience",
        "parent_comment_id": None
    }).sort("created_at", 1).to_list(100)
    result = []
    for c in comments:
        c_dict = dict(c)
        c_dict["id"] = str(c_dict["_id"])
        c_dict.pop("_id", None)
        if isinstance(c_dict.get("author_id"), ObjectId):
            c_dict["author_id"] = str(c_dict["author_id"])
        author = await db.users.find_one({"_id": ObjectId(c_dict.get("author_id", ""))}) if c_dict.get("author_id") else None
        if author:
            c_dict["author"] = {"username": author["username"], "full_name": author["full_name"], "photo_url": author.get("photo_url")}
        result.append(c_dict)
    return result

@router.post("/{experience_id}/comments")
async def add_experience_comment(
    experience_id: str,
    data: CommentCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    try:
        oid = ObjectId(experience_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    doc = {
        "parent_ref_id": oid,
        "parent_type": "experience",
        "parent_comment_id": data.parent_comment_id,
        "author_id": current_user["_id"],
        "content": data.content,
        "likes": [],
        "likes_count": 0,
        "created_at": datetime.datetime.utcnow()
    }
    result = await db.comments.insert_one(doc)
    await db.experiences.update_one({"_id": oid}, {"$inc": {"comments_count": 1}})
    await award_points(current_user["_id"], "comment_made", db)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return doc
