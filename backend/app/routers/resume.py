from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.database import get_db
from app.dependencies import get_current_user
from app.models.resume import ResumeJobDetails, ResumeProfile, ResumeGenerateRequest, SkillAnswer
from app.services.grok_service import analyze_jd_and_cv, generate_latex_resume, skill_gap_response
from app.services.cloudinary_service import upload_file
from app.services.points_service import award_points
import datetime, io

router = APIRouter()

@router.post("/analyze-jd")
async def analyze_jd(
    data: ResumeJobDetails,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    analysis = await analyze_jd_and_cv(
        job_description=data.job_description,
        cv_text="",
        role_category=data.role_category,
        country=data.target_country
    )
    return analysis

@router.post("/upload-cv")
async def upload_cv(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    content = await file.read()
    result = await upload_file(content, folder="cvs", resource_type="raw")
    extracted_text = ""
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(content))
        for page in reader.pages:
            extracted_text += (page.extract_text() or "")
        extracted_text = extracted_text[:6000]
    except Exception:
        extracted_text = ""
    return {
        "cv_url": result["url"],
        "cv_public_id": result["public_id"],
        "extracted_text": extracted_text
    }

@router.post("/analyze-with-cv")
async def analyze_with_cv(
    job_details: ResumeJobDetails,
    profile: ResumeProfile,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    cv_text = profile.cv_extracted_text or f"Skills: {', '.join(profile.skills)}. Education: {len(profile.education)} entries. Work experience: {len(profile.work_experience)} positions."
    analysis = await analyze_jd_and_cv(
        job_description=job_details.job_description,
        cv_text=cv_text,
        role_category=job_details.role_category,
        country=job_details.target_country
    )
    return analysis

@router.post("/skill-chat")
async def skill_chat(
    skill: str,
    answer: str,
    is_critical: bool = False,
    current_user=Depends(get_current_user)
):
    response = await skill_gap_response(skill, answer, is_critical)
    return response

@router.post("/generate")
async def generate_resume(
    data: ResumeGenerateRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    # All answered skills go to confirmed (candidate has experience they described)
    # Skills not answered can be added as "learning" 
    confirmed_skills = [a.skill for a in data.skill_answers if a.answer and len(a.answer.strip()) > 2]
    skills_to_add = []  # Will be determined by AI based on JD gap analysis

    profile_dict = data.profile.dict()
    cv_text = profile_dict.pop("cv_extracted_text", None) or ""

    # Build a richer context string if CV was uploaded
    cv_context = f"\n\nExtracted CV text:\n{cv_text[:4000]}" if cv_text else ""

    latex_code = await generate_latex_resume(
        user_profile=profile_dict,
        job_description=data.job_details.job_description + cv_context,
        confirmed_skills=confirmed_skills,
        skills_to_add=skills_to_add,
        role_category=data.job_details.role_category,
        country=data.job_details.target_country
    )

    await db.resume_sessions.insert_one({
        "user_id": current_user["_id"],
        "job_details": data.job_details.dict(),
        "profile_snapshot": profile_dict,
        "latex_code": latex_code,
        "confirmed_skills": confirmed_skills,
        "skills_added": skills_to_add,
        "created_at": datetime.datetime.utcnow()
    })
    await award_points(current_user["_id"], "resume_generated", db)

    return {
        "latex_code": latex_code,
        "skills_added": skills_to_add,
        "confirmed_skills": confirmed_skills
    }

@router.get("/history")
async def resume_history(current_user=Depends(get_current_user), db=Depends(get_db)):
    sessions = await db.resume_sessions.find(
        {"user_id": current_user["_id"]}
    ).sort("created_at", -1).limit(10).to_list(10)
    for s in sessions:
        s["id"] = str(s["_id"])
        if "user_id" in s:
            s["user_id"] = str(s["user_id"])
        s.pop("_id", None)
        s.pop("latex_code", None)
    return sessions
