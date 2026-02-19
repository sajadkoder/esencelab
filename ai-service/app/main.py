from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import PyPDF2
import re

app = FastAPI(title="EsenceLab AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    "ci/cd", "devops",
    "firebase", "figma",
    "project management", "product management",
]

class ResumeParseResponse(BaseModel):
    parsedData: dict
    skills: List[str]

class MatchRequest(BaseModel):
    resumeSkills: List[str]
    jobRequirements: str

class MatchResponse(BaseModel):
    matchScore: float
    matchedSkills: List[str]
    missingSkills: List[str]

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    with open(file_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
    return text

def parse_resume(text: str) -> dict:
    parsed = {
        "name": None,
        "email": None,
        "phone": None,
        "summary": None,
        "education": [],
        "experience": [],
        "skills": [],
    }
    
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    phone_pattern = r'\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b'
    
    emails = re.findall(email_pattern, text)
    phones = re.findall(phone_pattern, text)
    
    if emails:
        parsed["email"] = emails[0]
    if phones:
        parsed["phone"] = phones[0]
    
    lines = text.split('\n')
    for i, line in enumerate(lines):
        line_lower = line.lower().strip()
        
        if any(kw in line_lower for kw in ['summary', 'objective', 'profile']):
            if line.strip() and len(line.strip()) > 20:
                parsed["summary"] = line.strip()
                break
    
    return parsed

def extract_skills(text: str) -> List[str]:
    text_lower = text.lower()
    found_skills = []
    
    for skill in SKILL_KEYWORDS:
        if skill in text_lower:
            skill_formatted = skill.title() if len(skill) > 3 else skill.upper()
            if skill_formatted not in found_skills:
                found_skills.append(skill_formatted)
    
    return found_skills

@app.get("/")
async def root():
    return {"message": "EsenceLab AI Service is running"}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/ai/parse-resume", response_model=ResumeParseResponse)
async def parse_resume_endpoint(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            tmp_file.write(contents)
            tmp_path = tmp_file.name
        
        try:
            text = extract_text_from_pdf(tmp_path)
            
            if not text.strip():
                raise HTTPException(status_code=400, detail="Could not extract text from PDF")
            
            parsed_data = parse_resume(text)
            skills = extract_skills(text)
            
            parsed_data["skills"] = skills
            
            return ResumeParseResponse(
                parsedData=parsed_data,
                skills=skills
            )
        finally:
            os.unlink(tmp_path)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing resume: {str(e)}")

@app.post("/ai/match", response_model=MatchResponse)
async def match_jobs(request: MatchRequest):
    try:
        resume_skills = [s.lower() for s in request.resumeSkills]
        job_text = request.jobRequirements.lower()
        
        job_skills = extract_skills(request.jobRequirements)
        job_skills_lower = [s.lower() for s in job_skills]
        
        matched = []
        missing = []
        
        for skill in resume_skills:
            if skill in job_skills_lower:
                matched.append(skill.title())
        
        for skill in job_skills_lower:
            if skill not in resume_skills:
                missing.append(skill.title())
        
        if len(resume_skills) == 0 or len(job_skills_lower) == 0:
            match_score = 0.0
        else:
            matched_count = len(matched)
            total_job_skills = len(job_skills_lower)
            match_score = matched_count / total_job_skills if total_job_skills > 0 else 0.0
            
            if len(matched) > 0:
                resume_coverage = len(matched) / len(resume_skills)
                match_score = (match_score + resume_coverage) / 2
        
        match_score = min(match_score, 1.0)
        
        return MatchResponse(
            matchScore=round(match_score, 2),
            matchedSkills=matched,
            missingSkills=missing
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error matching: {str(e)}")

@app.post("/ai/extract-skills")
async def extract_skills_endpoint(text: str = Form(...)):
    try:
        skills = extract_skills(text)
        return {"skills": skills}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting skills: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3002)
