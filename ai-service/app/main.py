from __future__ import annotations

import io
import os
import re
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    import numpy as np
except Exception:  # pragma: no cover
    np = None

try:
    import pdfplumber
except Exception:  # pragma: no cover
    pdfplumber = None

try:
    import PyPDF2
except Exception:  # pragma: no cover
    PyPDF2 = None

try:
    import spacy
except Exception:  # pragma: no cover
    spacy = None

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
except Exception:  # pragma: no cover
    TfidfVectorizer = None
    cosine_similarity = None

app = FastAPI(title="EsenceLab AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NLP_MODEL = None
if spacy:
    try:
        NLP_MODEL = spacy.load("en_core_web_sm")
    except Exception:
        NLP_MODEL = None

SKILL_KEYWORDS = [
    "python", "javascript", "typescript", "java", "c++", "c#", "ruby", "go", "rust", "php",
    "react", "angular", "vue", "node.js", "express", "django", "flask", "spring", "rails",
    "html", "css", "sass", "tailwind", "bootstrap",
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins", "git",
    "machine learning", "deep learning", "tensorflow", "pytorch", "keras", "scikit-learn",
    "data analysis", "data science", "data engineering", "etl", "pandas", "numpy",
    "nlp", "natural language processing", "computer vision", "opencv",
    "agile", "scrum", "jira", "confluence",
    "rest api", "graphql", "microservices",
    "linux", "unix", "bash", "shell scripting",
    "testing", "unit testing", "integration testing", "selenium", "jest",
    "ci/cd", "devops", "firebase", "figma",
]

EMAIL_REGEX = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z|a-z]{2,}\b")
PHONE_REGEX = re.compile(r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b")
YEAR_REGEX = re.compile(r"\b(?:19|20)\d{2}\b")

EDUCATION_KEYWORDS = [
    "education",
    "academic",
    "qualification",
]

EXPERIENCE_KEYWORDS = [
    "experience",
    "work history",
    "employment",
    "internship",
]


class ResumeParseResponse(BaseModel):
    parsedData: Dict[str, Any]
    skills: List[str]


class MatchRequest(BaseModel):
    resumeSkills: List[str]
    jobRequirements: str
    includeExplanation: bool = False


class MatchResponse(BaseModel):
    matchScore: float
    matchedSkills: List[str]
    missingSkills: List[str]
    explanation: Optional[str] = None


def extract_text_from_pdf_bytes(content: bytes) -> str:
    text_chunks: List[str] = []

    if pdfplumber is not None:
        try:
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                for page in pdf.pages:
                    text_chunks.append(page.extract_text() or "")
            extracted = "\n".join(text_chunks).strip()
            if extracted:
                return extracted
        except Exception:
            pass

    if PyPDF2 is not None:
        try:
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            for page in reader.pages:
                text_chunks.append(page.extract_text() or "")
            return "\n".join(text_chunks).strip()
        except Exception:
            pass

    raise ValueError("Could not extract text from PDF")


def preprocess_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def extract_name(lines: List[str], normalized_text: str) -> Optional[str]:
    if NLP_MODEL:
        try:
            doc = NLP_MODEL(normalized_text[:5000])
            for ent in doc.ents:
                if ent.label_ == "PERSON":
                    candidate = ent.text.strip()
                    if len(candidate.split()) <= 4:
                        return candidate
        except Exception:
            pass

    for line in lines[:10]:
        clean = line.strip()
        if not clean:
            continue
        if any(token in clean.lower() for token in ["resume", "curriculum", "vitae", "email", "phone"]):
            continue
        if len(clean.split()) <= 4 and len(clean) <= 40:
            return clean

    return None


def extract_skills(text: str) -> List[str]:
    text_lower = text.lower()
    found_skills: List[str] = []

    for skill in SKILL_KEYWORDS:
        if skill in text_lower:
            formatted = skill.title() if len(skill) > 3 else skill.upper()
            if formatted not in found_skills:
                found_skills.append(formatted)

    return found_skills


def split_sections(lines: List[str]) -> Dict[str, List[str]]:
    sections: Dict[str, List[str]] = {
        "education": [],
        "experience": [],
        "summary": [],
    }
    current_section: Optional[str] = None

    for line in lines:
        lower = line.lower()
        if any(keyword in lower for keyword in EDUCATION_KEYWORDS):
            current_section = "education"
            continue
        if any(keyword in lower for keyword in EXPERIENCE_KEYWORDS):
            current_section = "experience"
            continue
        if any(keyword in lower for keyword in ["summary", "objective", "profile"]):
            current_section = "summary"
            continue

        if current_section and line.strip():
            sections[current_section].append(line.strip())

    return sections


def parse_education_entries(lines: List[str]) -> List[Dict[str, str]]:
    entries: List[Dict[str, str]] = []
    for line in lines[:8]:
        year_match = YEAR_REGEX.search(line)
        year = year_match.group(0) if year_match else ""
        cleaned = line.replace(year, "").strip(" ,-") if year else line.strip()
        if not cleaned:
            continue
        entries.append(
            {
                "institution": cleaned,
                "degree": "",
                "field": "",
                "year": year,
            }
        )
    return entries


def parse_experience_entries(lines: List[str]) -> List[Dict[str, str]]:
    entries: List[Dict[str, str]] = []
    for line in lines[:10]:
        year_matches = YEAR_REGEX.findall(line)
        duration = ""
        if len(year_matches) >= 2:
            duration = f"{year_matches[0]} - {year_matches[-1]}"
        elif len(year_matches) == 1:
            duration = year_matches[0]
        clean_line = line.strip()
        if not clean_line:
            continue
        entries.append(
            {
                "company": clean_line,
                "title": "",
                "duration": duration,
                "description": clean_line,
            }
        )
    return entries


def extract_orgs_and_dates(text: str) -> Dict[str, List[str]]:
    organizations: List[str] = []
    dates: List[str] = []

    if NLP_MODEL:
        try:
            doc = NLP_MODEL(text[:15000])
            for ent in doc.ents:
                if ent.label_ == "ORG" and ent.text not in organizations:
                    organizations.append(ent.text.strip())
                if ent.label_ in {"DATE", "TIME"} and ent.text not in dates:
                    dates.append(ent.text.strip())
        except Exception:
            pass

    if not dates:
        for match in YEAR_REGEX.findall(text):
            year = str(match)
            if year not in dates:
                dates.append(year)

    return {"organizations": organizations[:20], "dates": dates[:30]}


def parse_resume_text(text: str) -> Dict[str, Any]:
    normalized_text = preprocess_text(text)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    sections = split_sections(lines)

    emails = EMAIL_REGEX.findall(text)
    phones = PHONE_REGEX.findall(text)
    skills = extract_skills(normalized_text)
    entities = extract_orgs_and_dates(text)

    summary = " ".join(sections["summary"][:3]).strip() if sections["summary"] else None

    if not summary:
        for line in lines:
            lower = line.lower()
            if any(keyword in lower for keyword in ["summary", "objective", "profile"]) and len(line) > 20:
                summary = line
                break

    parsed = {
        "name": extract_name(lines, normalized_text),
        "email": emails[0] if emails else None,
        "phone": phones[0] if phones else None,
        "summary": summary,
        "education": parse_education_entries(sections["education"]),
        "experience": parse_experience_entries(sections["experience"]),
        "skills": skills,
        "organizations": entities["organizations"],
        "dates": entities["dates"],
    }

    return parsed


def empty_parsed_resume() -> Dict[str, Any]:
    return {
        "name": None,
        "email": None,
        "phone": None,
        "summary": None,
        "education": [],
        "experience": [],
        "skills": [],
        "organizations": [],
        "dates": [],
    }


def calculate_tfidf_match(resume_skills: List[str], job_requirements: str) -> float:
    if not resume_skills or not job_requirements.strip():
        return 0.0

    resume_text = " ".join(resume_skills)
    corpus = [resume_text, job_requirements]

    if TfidfVectorizer is None or cosine_similarity is None:
        resume_set = {skill.lower() for skill in resume_skills}
        job_skills = {skill.lower() for skill in extract_skills(job_requirements)}
        if not job_skills:
            return 0.0
        return len(resume_set & job_skills) / len(job_skills)

    vectorizer = TfidfVectorizer(ngram_range=(1, 2))
    tfidf_matrix = vectorizer.fit_transform(corpus)
    score = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])
    return max(0.0, min(score, 1.0))


def generate_explanation(match_score: float, matched: List[str], missing: List[str]) -> str:
    if match_score >= 0.75:
        verdict = "strong match"
    elif match_score >= 0.5:
        verdict = "moderate match"
    else:
        verdict = "low match"

    missing_hint = ", ".join(missing[:5]) if missing else "no major gaps"
    return f"Candidate is a {verdict}. Matched skills: {', '.join(matched[:6]) or 'none'}. Missing focus areas: {missing_hint}."


@app.get("/")
async def root():
    return {"message": "EsenceLab AI Service is running"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/ai/parse-resume", response_model=ResumeParseResponse)
async def parse_resume_endpoint(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        content = await file.read()
        parsed_data = empty_parsed_resume()

        try:
            text = extract_text_from_pdf_bytes(content)
            if text:
                parsed_data = parse_resume_text(text)
        except Exception:
            # Do not fail the full flow for malformed/scanned PDFs in demo mode.
            parsed_data = empty_parsed_resume()

        return ResumeParseResponse(parsedData=parsed_data, skills=parsed_data.get("skills", []))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error parsing resume: {str(exc)}")


@app.post("/ai/match", response_model=MatchResponse)
async def match_jobs(request: MatchRequest):
    try:
        resume_skills = [skill.strip() for skill in request.resumeSkills if skill.strip()]
        job_skills = extract_skills(request.jobRequirements)

        resume_set = {skill.lower() for skill in resume_skills}
        job_set = {skill.lower() for skill in job_skills}

        matched = sorted([skill.title() for skill in (resume_set & job_set)])
        missing = sorted([skill.title() for skill in (job_set - resume_set)])

        skill_overlap = len(matched) / len(job_set) if job_set else 0.0
        tfidf_score = calculate_tfidf_match(resume_skills, request.jobRequirements)
        final_score = round(((skill_overlap * 0.6) + (tfidf_score * 0.4)), 2)

        explanation = generate_explanation(final_score, matched, missing) if request.includeExplanation else None

        return MatchResponse(
            matchScore=max(0.0, min(final_score, 1.0)),
            matchedSkills=matched,
            missingSkills=missing,
            explanation=explanation,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error matching: {str(exc)}")


@app.post("/ai/extract-skills")
async def extract_skills_endpoint(text: str = Form(...)):
    try:
        return {"skills": extract_skills(preprocess_text(text))}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error extracting skills: {str(exc)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=3002)
