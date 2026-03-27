import json
from openai import AsyncOpenAI
from app.config import settings

_client = AsyncOpenAI(
    api_key=settings.GROK_API_KEY,
    base_url=settings.GROK_BASE_URL
)

async def analyze_jd_and_cv(job_description: str, cv_text: str, role_category: str, country: str) -> dict:
    prompt = f"""You are a professional resume expert and career coach.

Job Description:
{job_description}

Candidate CV/Profile Summary:
{cv_text if cv_text else "Not provided — analyze JD only."}

Role Category: {role_category}
Target Country: {country}

Analyze the above and return a JSON object with EXACTLY this structure:
{{
  "must_have_skills": ["skill1", "skill2"],
  "good_to_have_skills": ["skill3", "skill4"],
  "hidden_critical_skills": [
    {{"skill": "Linux", "reason": "Essential for DevOps even if not explicitly mentioned", "urgency": "high"}}
  ],
  "skill_gaps": ["missing_skill1"],
  "experience_level_required": "3-5 years",
  "questions_to_ask_user": [
    {{"skill": "Docker", "question": "Do you have hands-on Docker experience?"}}
  ],
  "jd_summary": "2-3 sentence summary of what this role requires"
}}

Return ONLY valid compact JSON. No markdown fences, no explanation."""

    response = await _client.chat.completions.create(
        model=settings.GROK_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=1500
    )
    raw = response.choices[0].message.content.strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"error": "AI response could not be parsed", "raw": raw}


async def generate_latex_resume(
    user_profile: dict,
    job_description: str,
    confirmed_skills: list,
    skills_to_add: list,
    role_category: str,
    country: str
) -> str:
    profile_text = json.dumps(user_profile, indent=2, default=str)
    prompt = f"""You are an expert resume writer and LaTeX typesetter. Generate a complete, ATS-friendly LaTeX resume.

Candidate Profile:
{profile_text}

Job Description:
{job_description}

Confirmed Skills (user has these): {confirmed_skills}
Skills to Add (critical for this role, add even if not in original CV): {skills_to_add}
Role Category: {role_category}
Target Country: {country}

Rules:
1. Use article documentclass, geometry package for margins, hyperref for links.
2. Sections: Contact Header, Professional Summary, Work Experience, Projects, Education, Skills, Certifications (if any).
3. Tailor the professional summary to the job description keywords.
4. Include all skills_to_add in the Skills section.
5. If the candidate has a prestigious institution (IIT, NIT, IIM, MIT, Stanford, etc.) or CGPA above 8.5, highlight it prominently.
6. Use strong action verbs and quantified achievements in experience bullets.
7. Keep to 1 page if under 3 years experience, 2 pages otherwise.
8. Return ONLY the complete LaTeX code starting with \\documentclass. No fences, no explanation."""

    response = await _client.chat.completions.create(
        model=settings.GROK_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=4000
    )
    return response.choices[0].message.content.strip()


async def generate_company_analysis(company_name: str, experiences: list) -> dict:
    exp_text = "\n\n".join([
        f"Role: {e.get('role','N/A')} | Outcome: {e.get('outcome','N/A')} | "
        f"Source: {e.get('applicationSource','N/A')} | "
        f"Rounds: {[r.get('type','') for r in e.get('rounds', [])]} | "
        f"Tips: {(e.get('tipsAndAdvice','') or '')[:200]}"
        for e in experiences[:60]
    ])

    prompt = f"""You are a career intelligence analyst. Analyze these {len(experiences)} interview experiences at {company_name}.

{exp_text}

Return a JSON object with EXACTLY this structure:
{{
  "company_culture": "1-2 sentence description of interview culture",
  "primary_focus": "DSA-heavy|Development-heavy|Communication-heavy|Domain-specific|Mixed",
  "hiring_process_summary": "3-4 sentence overview of typical process",
  "top_tips": ["tip1", "tip2", "tip3"],
  "red_flags": ["flag1"],
  "green_flags": ["flag1"],
  "preparation_priority": ["topic1", "topic2", "topic3"],
  "difficulty_rating": 7,
  "candidate_experience_rating": 8
}}

Return ONLY valid compact JSON. No markdown, no explanation."""

    response = await _client.chat.completions.create(
        model=settings.GROK_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=1000
    )
    raw = response.choices[0].message.content.strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {}


async def skill_gap_response(skill: str, user_answer: str, is_critical: bool) -> dict:
    prompt = f"""Candidate answered "{user_answer}" about knowing "{skill}" (critical for this role: {is_critical}).
Generate a short encouraging chat response (1-2 sentences) and decide what to do.
Return JSON: {{"message": "...", "action": "add_to_resume|add_as_learning|skip", "learning_resources": ["resource name or url"] }}
Return ONLY valid compact JSON."""

    response = await _client.chat.completions.create(
        model=settings.GROK_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=300
    )
    raw = response.choices[0].message.content.strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"message": "Got it, noted!", "action": "add_to_resume", "learning_resources": []}
