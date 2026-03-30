from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from app.database import get_db
from app.dependencies import get_current_user
from app.models.tracker import ApplicationCreate, StageUpdate
from app.services.cloudinary_service import upload_file
from app.services.points_service import award_points
from bson import ObjectId
import datetime

router = APIRouter()

VALID_STAGES = ['Applied', 'Shortlisted', 'Assignment/OA', 'Interview Rounds', 'Offer Received', 'Offer Accepted', 'Rejected', 'Withdrawn']

def _s(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    if isinstance(doc.get("user_id"), ObjectId):
        doc["user_id"] = str(doc["user_id"])
    return doc

@router.get("/stats/summary")
async def stats_summary(current_user=Depends(get_current_user), db=Depends(get_db)):
    apps = await db.tracker.find({"user_id": current_user["_id"], "is_deleted": {"$ne": True}}).to_list(500)
    total = len(apps)
    active = sum(1 for a in apps if a["current_stage"] not in ["Offer Accepted", "Rejected", "Withdrawn"])
    offers = sum(1 for a in apps if a["current_stage"] in ["Offer Received", "Offer Accepted"])
    rejected = sum(1 for a in apps if a["current_stage"] == "Rejected")
    responded = sum(1 for a in apps if a["current_stage"] != "Applied")
    response_rate = round((responded / total) * 100) if total > 0 else 0
    return {"total": total, "active": active, "offers": offers, "rejected": rejected, "response_rate": response_rate}

@router.get("/meta/stages")
async def get_stages():
    return {"stages": VALID_STAGES}

@router.get("")
async def list_applications(current_user=Depends(get_current_user), db=Depends(get_db)):
    apps = await db.tracker.find(
        {"user_id": current_user["_id"], "is_deleted": {"$ne": True}}
    ).sort("updated_at", -1).to_list(200)
    return [_s(a) for a in apps]

@router.post("")
async def create_application(
    data: ApplicationCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    now = datetime.datetime.utcnow()
    doc = data.dict()
    doc["user_id"] = current_user["_id"]
    doc["current_stage"] = "Applied"
    doc["stage_history"] = [{
        "stage": "Applied",
        "timestamp": data.applied_date or now,
        "notes": data.notes
    }]
    doc["activity_log"] = [{"action": "Application created", "timestamp": now}]
    doc["is_deleted"] = False
    doc["created_at"] = now
    doc["updated_at"] = now
    result = await db.tracker.insert_one(doc)
    await award_points(current_user["_id"], "application_tracked", db)
    doc["_id"] = result.inserted_id
    return _s(doc)

@router.get("/{app_id}")
async def get_application(
    app_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    try:
        oid = ObjectId(app_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    app = await db.tracker.find_one({"_id": oid, "user_id": current_user["_id"]})
    if not app:
        raise HTTPException(status_code=404, detail="Not found")
    return _s(app)

@router.put("/{app_id}/stage")
async def update_stage(
    app_id: str,
    data: StageUpdate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    if data.new_stage not in VALID_STAGES:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Must be one of: {VALID_STAGES}")
    try:
        oid = ObjectId(app_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    app = await db.tracker.find_one({"_id": oid, "user_id": current_user["_id"]})
    if not app:
        raise HTTPException(status_code=404, detail="Not found")
    now = datetime.datetime.utcnow()
    stage_entry = {"stage": data.new_stage, "timestamp": data.date or now, "notes": data.notes}
    await db.tracker.update_one(
        {"_id": oid},
        {
            "$set": {"current_stage": data.new_stage, "updated_at": now},
            "$push": {
                "stage_history": stage_entry,
                "activity_log": {"action": f"Moved to {data.new_stage}", "notes": data.notes, "timestamp": now}
            }
        }
    )
    await award_points(current_user["_id"], "application_stage_updated", db)
    return {"updated": True, "new_stage": data.new_stage}

@router.post("/{app_id}/upload-resume")
async def upload_resume_for_app(
    app_id: str,
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    try:
        oid = ObjectId(app_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    app = await db.tracker.find_one({"_id": oid, "user_id": current_user["_id"]})
    if not app:
        raise HTTPException(status_code=404, detail="Not found")
    content = await file.read()
    result = await upload_file(content, folder="tracker_resumes", resource_type="raw")
    await db.tracker.update_one(
        {"_id": oid},
        {"$set": {"resume_url": result["url"], "resume_public_id": result["public_id"], "updated_at": datetime.datetime.utcnow()}}
    )
    return {"resume_url": result["url"]}

@router.delete("/{app_id}")
async def delete_application(
    app_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    try:
        oid = ObjectId(app_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    await db.tracker.update_one(
        {"_id": oid, "user_id": current_user["_id"]},
        {"$set": {"is_deleted": True}}
    )
    return {"deleted": True}
