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

# Comprehensive skill keywords for fallback extraction
KNOWN_SKILLS = [
    # Programming Languages
    "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "C", "Go", "Golang", "Rust",
    "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R", "MATLAB", "Perl", "Shell", "Bash",
    "PowerShell", "Lua", "Dart", "Elixir", "Haskell", "Objective-C", "SQL", "PL/SQL", "T-SQL",
    # Frontend
    "React", "React.js", "ReactJS", "Angular", "Vue", "Vue.js", "VueJS", "Next.js", "NextJS",
    "Nuxt.js", "Svelte", "HTML", "HTML5", "CSS", "CSS3", "SASS", "SCSS", "LESS",
    "Tailwind CSS", "TailwindCSS", "Bootstrap", "Material UI", "MUI", "Chakra UI",
    "jQuery", "Redux", "Zustand", "MobX", "Webpack", "Vite", "Babel",
    # Backend
    "Node.js", "NodeJS", "Express", "Express.js", "FastAPI", "Django", "Flask",
    "Spring", "Spring Boot", "ASP.NET", ".NET", ".NET Core", "Ruby on Rails", "Rails",
    "Laravel", "Gin", "Fiber", "NestJS", "Nest.js", "GraphQL", "gRPC",
    # Databases
    "MongoDB", "PostgreSQL", "MySQL", "MariaDB", "SQLite", "Oracle", "SQL Server",
    "Redis", "Cassandra", "DynamoDB", "Firebase", "Firestore", "Supabase",
    "Neo4j", "Elasticsearch", "CouchDB", "InfluxDB", "TimescaleDB",
    # Cloud & DevOps
    "AWS", "Amazon Web Services", "Azure", "Microsoft Azure", "GCP", "Google Cloud",
    "Google Cloud Platform", "Docker", "Kubernetes", "K8s", "Terraform", "Ansible",
    "Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "Travis CI",
    "CI/CD", "CICD", "ArgoCD", "Helm", "Prometheus", "Grafana", "Datadog",
    "New Relic", "Splunk", "ELK Stack", "Nginx", "Apache", "Caddy",
    "Lambda", "EC2", "S3", "ECS", "EKS", "CloudFormation", "CloudWatch",
    "IAM", "VPC", "Route 53", "CloudFront", "SQS", "SNS", "Kinesis",
    # Data & ML
    "Machine Learning", "Deep Learning", "NLP", "Natural Language Processing",
    "Computer Vision", "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "sklearn",
    "Pandas", "NumPy", "SciPy", "Matplotlib", "Seaborn", "Jupyter",
    "Apache Spark", "Spark", "Hadoop", "Hive", "Kafka", "Apache Kafka",
    "Airflow", "Apache Airflow", "dbt", "Snowflake", "BigQuery", "Redshift",
    "ETL", "Data Pipeline", "Data Engineering", "Data Science", "Data Analytics",
    "Tableau", "Power BI", "Looker", "Metabase",
    "LLM", "Large Language Models", "GPT", "Generative AI", "RAG",
    "LangChain", "Vector Database", "Pinecone", "Weaviate", "ChromaDB",
    # Mobile
    "React Native", "Flutter", "SwiftUI", "Android", "iOS", "Expo",
    "Xamarin", "Ionic", "Capacitor",
    # Testing
    "Jest", "Mocha", "Chai", "Cypress", "Selenium", "Playwright", "Puppeteer",
    "JUnit", "TestNG", "PyTest", "pytest", "RSpec", "Postman", "SonarQube",
    "Unit Testing", "Integration Testing", "E2E Testing", "TDD", "BDD",
    # Tools & Practices
    "Git", "GitHub", "GitLab", "Bitbucket", "SVN", "Jira", "Confluence",
    "Slack", "Trello", "Notion", "Figma", "Sketch", "Adobe XD",
    "VS Code", "IntelliJ", "Eclipse", "Vim",
    "Agile", "Scrum", "Kanban", "SAFe", "Waterfall", "Sprint",
    "REST", "RESTful", "RESTful APIs", "API", "APIs", "Microservices",
    "Serverless", "Event-Driven", "CQRS", "Domain-Driven Design", "DDD",
    "Design Patterns", "SOLID", "Clean Architecture", "System Design",
    "OAuth", "JWT", "SSO", "LDAP", "SAML", "OpenID Connect",
    # Networking & Security
    "TCP/IP", "HTTP", "HTTPS", "DNS", "Load Balancing", "CDN",
    "Firewall", "VPN", "SSL/TLS", "Encryption", "Penetration Testing",
    "OWASP", "SOC", "SIEM", "DevSecOps", "Zero Trust",
    # Soft Skills
    "Communication", "Leadership", "Problem Solving", "Problem-Solving",
    "Teamwork", "Collaboration", "Cross-Functional", "Mentoring",
    "Project Management", "Time Management", "Critical Thinking",
    "Stakeholder Management", "Presentation Skills", "Technical Writing",
    # Methodologies
    "Object-Oriented Programming", "OOP", "Functional Programming",
    "Data Structures", "Algorithms", "DSA",
    "Linux", "Unix", "Windows Server", "Networking",
]

# Build a case-insensitive lookup set
_SKILL_LOOKUP = {}
for s in KNOWN_SKILLS:
    _SKILL_LOOKUP[s.lower()] = s


def _extract_skills_fallback(text: str) -> list:
    """Regex-based fallback skill extraction from job description text."""
    if not text:
        return []

    found = set()
    text_lower = text.lower()

    # Direct keyword matching
    for key, canonical in _SKILL_LOOKUP.items():
        # Use word boundary matching for short terms to avoid false positives
        if len(key) <= 3:
            pattern = r'\b' + re.escape(key) + r'\b'
            if re.search(pattern, text_lower):
                found.add(canonical)
        else:
            if key in text_lower:
                found.add(canonical)

    # Extract years of experience patterns
    exp_match = re.search(r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience)?', text_lower)
    if exp_match:
        years = int(exp_match.group(1))
        if years <= 1:
            found.add("Fresher / 0-1 years")
        elif years <= 3:
            found.add("1-3 years experience")
        elif years <= 5:
            found.add("3-5 years experience")

    return list(found)


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
            # Replace single quotes with double quotes (careful with apostrophes)
            return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Strategy 4: Try line-by-line reconstruction
    try:
        lines = raw.strip().split('\n')
        json_lines = []
        in_json = False
        for line in lines:
            if '{' in line and not in_json:
                in_json = True
                json_lines.append(line[line.index('{'):])
            elif in_json:
                json_lines.append(line)
                if '}' in line:
                    break
        if json_lines:
            text = '\n'.join(json_lines)
            text = re.sub(r',\s*([}\]])', r'\1', text)
            return json.loads(text)
    except (json.JSONDecodeError, Exception):
        pass

    logger.error(f"All JSON parse strategies failed. Raw response (first 500 chars): {raw[:500]}")
    return {}


async def analyze_jd_and_cv(job_description: str, cv_text: str, role_category: str, country: str) -> dict:
    prompt = f"""You are an expert ATS systems engineer and technical recruiter with 15 years of experience.

Your job: Extract EVERY skill, technology, tool, methodology, and keyword from this job description.
Be exhaustive. Don't miss anything. Include both explicit and implicit requirements.

=== JOB DESCRIPTION START ===
{job_description}
=== JOB DESCRIPTION END ===

Candidate CV (if provided):
{cv_text if cv_text else "Not provided."}

Role Category: {role_category}
Target Country: {country}

INSTRUCTIONS:
1. Read the ENTIRE job description word by word.
2. Extract every technology, tool, framework, language, methodology, and skill mentioned.
3. Also extract implied skills (e.g., if they mention "build APIs" → REST, API Design, HTTP).
4. For {role_category} roles, always include common implicit skills like version control (Git), communication, problem-solving.

Return this EXACT JSON structure with NO markdown fences, NO explanation, ONLY the JSON:
{{
  "detected_skills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6", "skill7", "skill8", "skill9", "skill10"],
  "critical_skills": ["must-have skill 1", "must-have skill 2", "must-have skill 3"],
  "nice_to_have_skills": ["optional skill 1", "optional skill 2"],
  "experience_level": "Fresher / 1-3 years / 3-5 years / 5-10 years / 10+ years",
  "key_responsibilities": ["responsibility 1", "responsibility 2", "responsibility 3"],
  "ats_keywords": ["exact ATS phrase 1", "exact ATS phrase 2"],
  "jd_summary": "2-3 sentence summary of this role"
}}

CRITICAL RULES:
- detected_skills MUST have AT LEAST 10 items. If you find fewer, look harder.
- Look for: programming languages, frameworks, libraries, cloud platforms, databases, DevOps tools, soft skills, methodologies, certifications, domain knowledge.
- If the JD mentions "Docker", "Kubernetes", "AWS", "CI/CD" etc., each one is a separate detected skill.
- If the JD mentions "Agile", "Scrum", "cross-functional teams" etc., include those too.
- critical_skills = skills mentioned multiple times OR listed as "required" OR listed first in requirements.
- ats_keywords = exact multi-word phrases an ATS system would search for.
- Return ONLY valid JSON. No text before or after the JSON object."""

    try:
        response = await _client.chat.completions.create(
            model=settings.GEMINI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=4000
        )
        raw = response.choices[0].message.content.strip()
        logger.info(f"JD analysis raw response length: {len(raw)} chars")
        logger.debug(f"JD analysis raw response (first 300): {raw[:300]}")

        result = _parse_json(raw)

        # Validate and enrich the result
        detected = result.get("detected_skills", [])
        if not isinstance(detected, list):
            detected = []

        # If AI returned too few skills, supplement with fallback extraction
        if len(detected) < 5:
            logger.warning(f"AI returned only {len(detected)} skills, running fallback extraction")
            fallback_skills = _extract_skills_fallback(job_description)
            # Merge: AI skills first, then fallback (deduplicated)
            seen_lower = {s.lower() for s in detected}
            for fs in fallback_skills:
                if fs.lower() not in seen_lower:
                    detected.append(fs)
                    seen_lower.add(fs.lower())
            result["detected_skills"] = detected

        # Ensure critical_skills and nice_to_have exist
        if not result.get("critical_skills") or not isinstance(result.get("critical_skills"), list):
            # First 40% of detected skills are critical
            n = max(3, len(detected) // 3)
            result["critical_skills"] = detected[:n]

        if not result.get("nice_to_have_skills") or not isinstance(result.get("nice_to_have_skills"), list):
            result["nice_to_have_skills"] = detected[len(result.get("critical_skills", [])):] if len(detected) > 3 else []

        if not result.get("key_responsibilities"):
            result["key_responsibilities"] = []
        if not result.get("ats_keywords"):
            result["ats_keywords"] = detected[:10]
        if not result.get("experience_level"):
            result["experience_level"] = "Not specified"
        if not result.get("jd_summary"):
            result["jd_summary"] = f"{role_category} role in {country}"

        return result

    except Exception as e:
        logger.error(f"JD analysis error: {e}")
        # Complete fallback: use regex extraction
        fallback_skills = _extract_skills_fallback(job_description)
        if fallback_skills:
            n = max(3, len(fallback_skills) // 3)
            return {
                "detected_skills": fallback_skills,
                "critical_skills": fallback_skills[:n],
                "nice_to_have_skills": fallback_skills[n:],
                "experience_level": "Not specified",
                "key_responsibilities": [],
                "ats_keywords": fallback_skills[:10],
                "jd_summary": f"{role_category} role in {country} (extracted via keyword matching)"
            }
        return {"error": f"Analysis failed: {str(e)}", "detected_skills": [], "critical_skills": [], "nice_to_have_skills": []}


async def generate_latex_resume(
    user_profile: dict,
    job_description: str,
    confirmed_skills: list,
    skills_to_add: list,
    role_category: str,
    country: str
) -> str:
    profile_text = json.dumps(user_profile, indent=2, default=str)

    prompt = f"""You are an elite ATS resume engineer. Generate a LaTeX resume that MUST fit on exactly ONE page.

CANDIDATE PROFILE:
{profile_text}

JOB DESCRIPTION (extract EVERY keyword from this):
{job_description}

Skills candidate confirmed having: {confirmed_skills}
Skills to weave in (candidate is learning or familiar with): {skills_to_add}
Role: {role_category} | Country: {country}

═══════════════════════════════════════════════════
STRICT ONE-PAGE FORMATTING RULES:
═══════════════════════════════════════════════════

THE RESUME MUST FIT ON EXACTLY ONE PAGE. This is NON-NEGOTIABLE.

1. DOCUMENT SETUP (copy exactly):
   \\documentclass[10pt]{{article}}
   \\usepackage[top=0.3in, bottom=0.3in, left=0.4in, right=0.4in]{{geometry}}
   \\usepackage{{helvet}}
   \\renewcommand{{\\familydefault}}{{\\sfdefault}}
   \\usepackage[T1]{{fontenc}}
   \\usepackage[utf8]{{inputenc}}
   \\usepackage{{hyperref}}
   \\usepackage{{enumitem}}
   \\usepackage{{titlesec}}
   \\pagenumbering{{gobble}}
   \\titlespacing*{{\\section}}{{0pt}}{{4pt}}{{3pt}}
   \\setlength{{\\parindent}}{{0pt}}
   \\setlength{{\\parskip}}{{0pt}}
   \\setlength{{\\itemsep}}{{0pt}}

2. SECTION HEADERS: Use \\section*{{SECTION NAME}} with \\vspace{{-4pt}}\\hrule\\vspace{{4pt}} below each

3. BULLET POINTS: \\begin{{itemize}}[leftmargin=12pt, noitemsep, topsep=0pt, parsep=0pt, partopsep=0pt]

4. CONTENT LIMITS TO FIT ONE PAGE:
   - Professional Summary: MAX 2 sentences
   - Skills: One dense paragraph grouping by category, separated by |
   - Education: MAX 2 entries, each 1-2 lines
   - Work Experience: MAX 2 positions, MAX 3 bullets each, each bullet MAX 1 line
   - Projects: MAX 2 projects, MAX 2 bullets each
   - Each bullet point MUST be a single line (no wrapping)
   - Use \\small or \\footnotesize for body text if needed

5. KEYWORD MIRRORING:
   - Extract EXACT terms from JD and embed them verbatim in summary, skills, and bullets
   - If JD says "RESTful APIs", use "RESTful APIs" not "REST APIs"

6. SKILLS SECTION:
   - List ALL skills grouped: Languages: X, Y | Frameworks: A, B | Tools: C, D | Cloud: E, F
   - One dense line per category, all on 2-3 lines total

7. EXPERIENCE BULLETS:
   - Start with action verb (Engineered, Built, Led, Optimized, Deployed)
   - Include a metric: "Reduced load time by ~40%", "Served 10K+ users"
   - Keep each bullet to ONE line

8. STRUCTURE:
   No tables, no columns, no text boxes, no minipages.
   Contact info: Name centered (\\Large\\textbf), then email | phone | LinkedIn | GitHub on one line.

9. HONESTY:
   - confirmed_skills: present confidently
   - skills_to_add: mention as "familiar with" or "currently learning"

10. ABSOLUTE REQUIREMENTS:
    - The output MUST compile to EXACTLY 1 page
    - If content is too long, CUT the least important items
    - Return ONLY raw LaTeX code starting with \\documentclass
    - No explanation, no markdown fences, no text before or after the LaTeX code"""

    response = await _client.chat.completions.create(
        model=settings.GEMINI_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=8000
    )
    content = response.choices[0].message.content.strip()
    # Strip any accidental markdown fences Gemini may add
    content = re.sub(r"```(?:latex)?\s*", "", content)
    content = re.sub(r"\s*```", "", content).strip()

    # Ensure it starts with \documentclass
    if not content.startswith("\\documentclass"):
        idx = content.find("\\documentclass")
        if idx > 0:
            content = content[idx:]

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
                max_tokens=4000
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
