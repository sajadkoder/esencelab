from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Optional
from datetime import datetime
from app.services.nlp_service import nlp_service
from app.services.gemini_service import gemini_service
from app.utils.pdf_extractor import extract_text_from_pdf, clean_text
from app.models.schemas import ResumeParseResponse, ResumeParseRequest

router = APIRouter()


@router.post("/parse", response_model=ResumeParseResponse)
async def parse_resume(file: Optional[UploadFile] = File(None), request: Optional[ResumeParseRequest] = None):
    text = ""
    
    if file:
        if not file.filename.endswith(('.pdf', '.txt')):
            raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported")
        
        content = await file.read()
        if file.filename.endswith('.pdf'):
            text = extract_text_from_pdf(content)
        else:
            text = content.decode('utf-8')
    elif request and request.text:
        text = request.text
    else:
        raise HTTPException(status_code=400, detail="Either file or text is required")
    
    text = clean_text(text)
    
    entities = nlp_service.extract_entities(text)
    skills = nlp_service.extract_skills(text)
    education = nlp_service.extract_education(text)
    experience = nlp_service.extract_experience(text)
    experience_level, _ = nlp_service.calculate_experience_level(text)
    
    enhanced = await gemini_service.enhance_resume(text, skills)
    
    all_skills = list(set(skills + enhanced.get('inferred_skills', [])))
    
    return ResumeParseResponse(
        skills=all_skills,
        education=education,
        experience=experience,
        summary=enhanced.get('summary', ''),
        experience_level=experience_level,
        suggested_roles=enhanced.get('suggested_roles', ['Software Engineer']),
        confidence_score=enhanced.get('confidence_score', 0.7)
    )


@router.post("/extract-skills")
async def extract_skills(text: str):
    skills = nlp_service.extract_skills(text)
    categorized = nlp_service.categorize_skills(skills)
    
    return {
        "skills": skills,
        "categorized": categorized,
        "count": len(skills)
    }
