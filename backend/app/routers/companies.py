from fastapi import APIRouter, Depends, Query, HTTPException
from app.database import get_db
from app.dependencies import get_current_user
from app.services.grok_service import generate_company_analysis
import datetime

router = APIRouter()

@router.get("/")
async def list_companies(
    search: str = Query(None),
    sort_by: str = Query("experiences"),
    page: int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=50),
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    skip = (page - 1) * limit
    query = {}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    sort_field = "experience_count" if sort_by == "experiences" else "name"
    sort_dir = -1 if sort_by != "alpha" else 1
    companies = await db.companies.find(query).sort(sort_field, sort_dir).skip(skip).limit(limit).to_list(limit)
    result = []
    for c in companies:
        c_dict = dict(c)
        c_dict["id"] = str(c_dict["_id"])
        c_dict.pop("_id", None)
        pipeline = [
            {"$match": {"company_slug": c_dict["slug"], "is_public": True}},
            {"$group": {
                "_id": None,
                "total": {"$sum": 1},
                "offers": {"$sum": {"$cond": [{"$eq": ["$outcome", "Got the Offer"]}, 1, 0]}},
                "avg_rounds": {"$avg": {"$size": "$rounds"}}
            }}
        ]
        agg = await db.experiences.aggregate(pipeline).to_list(1)
        if agg:
            s = agg[0]
            c_dict["stats"] = {
                "total_experiences": s["total"],
                "offer_rate": round((s["offers"] / s["total"]) * 100) if s["total"] > 0 else 0,
                "avg_rounds": round(s.get("avg_rounds", 0), 1)
            }
        else:
            c_dict["stats"] = {"total_experiences": 0, "offer_rate": 0, "avg_rounds": 0}
        top_rounds_pipeline = [
            {"$match": {"company_slug": c_dict["slug"], "is_public": True}},
            {"$unwind": "$rounds"},
            {"$group": {"_id": "$rounds.round_type", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 3}
        ]
        top_rounds = await db.experiences.aggregate(top_rounds_pipeline).to_list(3)
        c_dict["top_round_types"] = [r["_id"] for r in top_rounds if r.get("_id")]
        result.append(c_dict)
    return {"companies": result, "page": page, "has_more": len(companies) == limit}

@router.get("/meta/options")
async def company_options(
    search: str = Query(""),
    db=Depends(get_db)
):
    query = {}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    companies = await db.companies.find(query).sort("experience_count", -1).limit(20).to_list(20)
    return [{"name": c["name"], "slug": c["slug"]} for c in companies]

@router.get("/{slug}")
async def get_company(
    slug: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    company = await db.companies.find_one({"slug": slug})
    if company:
        result = dict(company)
        result["id"] = str(result["_id"])
        result.pop("_id", None)
    else:
        result = {"name": slug.replace("-", " ").title(), "slug": slug, "experience_count": 0}

    experiences = await db.experiences.find({"company_slug": slug, "is_public": True}).sort("created_at", -1).limit(100).to_list(100)

    round_dist = {}
    all_questions = []
    source_dist = {}
    outcome_dist = {}
    package_dist = {}

    for e in experiences:
        src = e.get("application_source", "Other")
        source_dist[src] = source_dist.get(src, 0) + 1
        out = e.get("outcome", "Other")
        outcome_dist[out] = outcome_dist.get(out, 0) + 1
        pkg = e.get("package_range")
        if pkg:
            package_dist[pkg] = package_dist.get(pkg, 0) + 1
        for r in e.get("rounds", []):
            rt = r.get("round_type", "Other")
            round_dist[rt] = round_dist.get(rt, 0) + 1
            for q in r.get("questions_asked", []):
                if q:
                    all_questions.append({"question": q, "round_type": rt})

    result["round_distribution"] = sorted(
        [{"type": k, "count": v} for k, v in round_dist.items()],
        key=lambda x: -x["count"]
    )
    result["source_distribution"] = [{"source": k, "count": v} for k, v in source_dist.items()]
    result["outcome_distribution"] = [{"outcome": k, "count": v} for k, v in outcome_dist.items()]
    result["package_distribution"] = [{"range": k, "count": v} for k, v in package_dist.items()]
    result["questions"] = all_questions[:200]
    result["total_experiences"] = len(experiences)
    return result

@router.get("/{slug}/analysis")
async def get_ai_analysis(
    slug: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    cached = await db.company_analysis.find_one({"slug": slug})
    if cached:
        age_days = (datetime.datetime.utcnow() - cached.get("generated_at", datetime.datetime.utcnow())).days
        if age_days < 7:
            cached.pop("_id", None)
            return cached

    experiences = await db.experiences.find({"company_slug": slug, "is_public": True}).to_list(50)
    if len(experiences) < 3:
        return {"error": "Not enough data yet. At least 3 experiences needed for analysis."}

    company = await db.companies.find_one({"slug": slug})
    company_name = company["name"] if company else slug.replace("-", " ").title()

    analysis = await generate_company_analysis(company_name, experiences)
    analysis["slug"] = slug
    analysis["generated_at"] = datetime.datetime.utcnow()
    analysis["experience_count"] = len(experiences)

    await db.company_analysis.update_one({"slug": slug}, {"$set": analysis}, upsert=True)
    return analysis

@router.get("/{slug}/experiences")
async def get_company_experiences(
    slug: str,
    role: str = Query(None),
    outcome: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=30),
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    skip = (page - 1) * limit
    query = {"company_slug": slug, "is_public": True}
    if role:
        query["role"] = {"$regex": role, "$options": "i"}
    if outcome:
        query["outcome"] = outcome
    exps = await db.experiences.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    result = []
    for e in exps:
        e = dict(e)
        e["id"] = str(e["_id"])
        e.pop("_id", None)
        result.append(e)
    return {"experiences": result, "page": page, "has_more": len(exps) == limit}
