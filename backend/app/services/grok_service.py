import json
import re
import logging
from openai import AsyncOpenAI
from app.config import settings

logger = logging.getLogger(__name__)

# Gemini 2.5 Flash via OpenAI-compatible endpoint
_client = AsyncOpenAI(
    api_key=settings.GEMINI_API_KEY,
    base_url=settings.GEMINI_BASE_URL,
)


def _parse_json(raw: str) -> dict:
    """Robustly extract JSON from Gemini responses using multiple strategies."""
    if not raw or not raw.strip():
        logger.error("Empty response from AI")
        return {}

    # Strategy 1: Strip markdown fences and parse
    try:
        cleaned = re.sub(r"```(?:json)?\s*", "", raw.strip())
        cleaned = re.sub(r"\s*```", "", cleaned).strip()
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Strategy 2: Find the first { ... } block (greedy) and parse it
    try:
        match = re.search(r'\{[\s\S]*\}', raw)
        if match:
            return json.loads(match.group(0))
    except json.JSONDecodeError:
        pass

    # Strategy 3: Try to fix common issues (trailing commas, single quotes)
    try:
        match = re.search(r'\{[\s\S]*\}', raw)
        if match:
            text = match.group(0)
            # Remove trailing commas before } or ]
            text = re.sub(r',\s*([}\]])', r'\1', text)
            return json.loads(text)
    except json.JSONDecodeError:
        pass

    logger.error(f"All JSON parse strategies failed. Raw response (first 500 chars): {raw[:500]}")
    return {}


async def analyze_jd_and_cv(job_description: str, cv_text: str, role_category: str, country: str) -> dict:
    prompt = f"""You are an expert ATS systems engineer and technical recruiter with 15 years of experience.

Your job: Extract EVERY skill, technology, tool, methodology, and keyword from this job description.
Be exhaustive. Don't miss anything. Include both explicit and implicit requirements.

Job Description:
{job_description}

Candidate CV (if provided):
{cv_text if cv_text else "Not provided."}

Role Category: {role_category}
Target Country: {country}

Extract and classify ALL skills/keywords. Return this EXACT JSON structure:
{{
  "detected_skills": ["list", "of", "ALL", "skills", "technologies", "tools", "mentioned", "or", "implied"],
  "critical_skills": ["subset", "that", "are", "MUST-HAVE", "deal-breakers"],
  "nice_to_have_skills": ["skills", "that", "give", "bonus", "points", "but", "are", "optional"],
  "experience_level": "Fresher / 1-3 years / 3-5 years / 5-10 years / 10+ years",
  "key_responsibilities": ["responsibility 1", "responsibility 2"],
  "ats_keywords": ["exact", "phrases", "an", "ATS", "would", "scan", "for"],
  "jd_summary": "2-3 sentence summary of this role"
}}

IMPORTANT RULES:
- detected_skills must have AT LEAST 8-15 items. Read carefully - skills are often hidden in sentences.
- Extract programming languages, frameworks, cloud services, databases, methodologies (Agile, Scrum), soft skills, domain knowledge.
- For a software engineering role, always include: version control (Git), communication skills, problem-solving even if not stated.
- critical_skills = skills mentioned multiple times or listed first in requirements.
- ats_keywords = exact phrases HR software would search for (e.g., "RESTful APIs", "CI/CD pipeline", "cross-functional teams").
- Return ONLY valid JSON. No markdown fences."""

    response = await _client.chat.completions.create(
        model=settings.GEMINI_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=4000
    )
    raw = response.choices[0].message.content.strip()
    logger.info(f"JD analysis raw response length: {len(raw)} chars")
    try:
        result = _parse_json(raw)
        if not result or (not result.get("detected_skills") and not result.get("error")):
            logger.warning(f"Parsed JSON has no detected_skills. Keys: {list(result.keys()) if result else 'empty'}")
            # If we got an empty parse, return a meaningful error
            if not result:
                return {"error": "AI response could not be parsed", "raw": raw[:500]}
        return result
    except Exception as e:
        logger.error(f"JD analysis parse error: {e}")
        return {"error": f"AI response could not be parsed: {str(e)}", "raw": raw[:500]}


async def generate_latex_resume(
    user_profile: dict,
    job_description: str,
    confirmed_skills: list,
    skills_to_add: list,
    role_category: str,
    country: str
) -> str:
    profile_text = json.dumps(user_profile, indent=2, default=str)

    prompt = f"""You are an elite ATS resume engineer. Your ONLY goal is to maximize the ATS score for this resume.

CANDIDATE PROFILE:
{profile_text}

JOB DESCRIPTION (extract EVERY keyword from this):
{job_description}

Skills candidate confirmed having: {confirmed_skills}
Skills to weave in (candidate is learning or familiar with): {skills_to_add}
Role: {role_category} | Country: {country}

═══════════════════════════════════════════════════
ATS OPTIMIZATION RULES — FOLLOW EVERY SINGLE ONE:
═══════════════════════════════════════════════════

1. KEYWORD MIRRORING:
   - Extract the EXACT technical terms, tools, and phrases from the JD.
   - These exact strings MUST appear verbatim in the resume: in Summary, Skills section, and woven into bullet points.
   - If JD says "RESTful APIs", write "RESTful APIs" not "REST APIs".
   - If JD says "cross-functional collaboration", write those exact words.

2. SKILLS SECTION — CRITICAL:
   - List ALL skills from confirmed_skills + skills_to_add + skills mentioned in JD.
   - Group them: Languages | Frameworks | Tools | Cloud | Databases | Methodologies
   - Include EVERY keyword from the JD that could be a skill, even if barely mentioned.
   - It's acceptable to list skills the candidate is "learning" or "familiar with".

3. PROFESSIONAL SUMMARY — 4-5 sentences:
   - First sentence: "{role_category} professional with [X years] of experience in [top 3 JD skills]."
   - Mention the TARGET COMPANY name if provided (personalizes the resume).
   - Pack in as many JD keywords as grammatically possible.
   - End with: "Passionate about [domain from JD] and eager to contribute to [company/team goal]."

4. WORK EXPERIENCE bullets — EACH bullet must:
   - Start with a strong action verb (Engineered, Architected, Led, Optimized, Implemented, Deployed, Automated).
   - Include a metric/number whenever possible (even estimated): "Reduced load time by ~40%", "Served 10K+ daily users".
   - Embed JD keywords naturally: "Built RESTful APIs using Node.js...", "Implemented CI/CD pipelines...".
   - If the candidate has no work experience, create 2 internship/project-style bullets that sound professional.

5. PROJECTS SECTION — ESSENTIAL for freshers:
   - Each project: Name | Tech Stack | 2-3 bullet points
   - Tech stack MUST include JD-relevant technologies.
   - Bullets should mention scale: "Processed 1M+ records", "Reduced query time by 60%".
   - Add realistic GitHub link placeholder: \\href{{https://github.com/user/project}}{{github.com/user/repo}}

6. EDUCATION:
   - If CGPA >= 8.0 or institution is prestigious (IIT, NIT, IIM, BITS, VIT, IIIT, MIT, Stanford, etc.), add a line: "Relevant Coursework: Data Structures, OS, DBMS, CN, [JD-relevant subjects]".

7. CERTIFICATIONS — add these if skills_to_add list is non-empty:
   - Create a "Currently Learning / Certifications" section.
   - E.g., "AWS Solutions Architect (In Progress)", "Google Cloud Professional (Pursuing)".
   - This shows initiative and gets ATS keyword matches for cloud/tools skills.

8. STRUCTURE AND FORMATTING — LaTeX requirements:
   - Use \\documentclass{{article}}
   - Packages: geometry (margins: top=0.5in, bottom=0.5in, left=0.6in, right=0.6in), hyperref, enumitem, titlesec, fontenc, inputenc
   - Section headers: \\section*{{}} with \\hrule below each
   - Bullet points: \\begin{{itemize}}[leftmargin=*, noitemsep, topsep=2pt]
   - Font: \\usepackage{{helvet}} \\renewcommand{{\\familydefault}}{{\\sfdefault}} for clean ATS-parseable sans-serif
   - Contact line: Name (\\Large\\textbf) | Email | Phone | LinkedIn | GitHub all on ONE line separated by | 
   - No tables, no columns, no text boxes (ATS parsers choke on these)
   - 1 page for <3 years experience, 2 pages for senior

9. HONESTY BALANCE:
   - Skills the candidate confirmed having (confirmed_skills): present confidently.
   - Skills to add (skills_to_add): mention as "familiar with", "exposure to", or "currently upskilling in".
   - Never outright lie but optimize framing: "Experience with X" can mean brief exposure.
   - The goal is to GET the interview, not to be dishonest — the candidate can learn during the process.

10. ABSOLUTE REQUIREMENTS:
    - Every keyword from ats_keywords list extracted from the JD MUST appear somewhere in the resume.
    - The Skills section must be the most keyword-dense section.
    - Return ONLY the raw LaTeX code starting with \\documentclass. No explanation, no fences.

Generate the complete LaTeX resume now:"""

    response = await _client.chat.completions.create(
        model=settings.GEMINI_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=16000
    )
    content = response.choices[0].message.content.strip()
    # Strip any accidental markdown fences Gemini may add
    content = re.sub(r"```(?:latex)?\s*", "", content)
    content = re.sub(r"\s*```", "", content).strip()

    # Completeness check: if \end{document} is missing, request continuation
    if "\\end{document}" not in content:
        logger.warning("LaTeX output appears truncated (missing \\end{document}). Requesting continuation...")
        try:
            continuation = await _client.chat.completions.create(
                model=settings.GEMINI_MODEL,
                messages=[
                    {"role": "user", "content": prompt},
                    {"role": "assistant", "content": content},
                    {"role": "user", "content": "The LaTeX code was cut off. Continue EXACTLY from where you stopped. Output ONLY the remaining LaTeX code, no explanation. Make sure it ends with \\end{document}."}
                ],
                temperature=0.2,
                max_tokens=8000
            )
            extra = continuation.choices[0].message.content.strip()
            extra = re.sub(r"```(?:latex)?\s*", "", extra)
            extra = re.sub(r"\s*```", "", extra).strip()
            content = content + "\n" + extra
        except Exception as e:
            logger.error(f"LaTeX continuation failed: {e}")
            # Append a basic closing so it at least compiles
            content += "\n\n\\end{document}"

    return content


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

Return ONLY valid JSON. No markdown, no explanation."""

    response = await _client.chat.completions.create(
        model=settings.GEMINI_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=1000
    )
    raw = response.choices[0].message.content.strip()
    try:
        return _parse_json(raw)
    except Exception:
        return {}


async def skill_gap_response(skill: str, user_answer: str, is_critical: bool) -> dict:
    prompt = f"""You are a friendly career coach helping someone land a job.

The skill "{skill}" is {"CRITICAL for this role" if is_critical else "helpful for this role"}.
The candidate said: "{user_answer}"

Based on their answer:
1. Give 1-2 encouraging sentences of feedback.
2. Decide the action: 
   - "add_to_resume" = they have it or have some exposure
   - "add_as_learning" = they're learning it / can frame it as in-progress
   - "skip" = completely unrelated, skip it
3. Suggest 1-2 free learning resources if action is "add_as_learning"

Return JSON:
{{"message": "your encouraging feedback", "action": "add_to_resume|add_as_learning|skip", "feedback": "short coaching note", "learning_resources": ["resource name or url"] }}
Return ONLY valid JSON. No markdown fences."""

    response = await _client.chat.completions.create(
        model=settings.GEMINI_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=400
    )
    raw = response.choices[0].message.content.strip()
    try:
        return _parse_json(raw)
    except Exception:
        return {"message": "Got it, noted!", "action": "add_to_resume", "learning_resources": []}
