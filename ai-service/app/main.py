from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from app.routers import resume, chatbot, matching
from app.config import settings
from app.services.gemini_service import gemini_service

app = FastAPI(
    title="Esencelab AI Service",
    description="AI-powered resume parsing and job matching using spaCy and Gemini",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:4000",
        "https://esencelab.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router, prefix="/resume", tags=["Resume Parsing"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["Career Chatbot"])
app.include_router(matching.router, prefix="/matching", tags=["Job Matching"])


@app.get("/")
async def root():
    return {
        "name": "Esencelab AI Service",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "endpoints": {
            "parse_resume": "/resume/parse",
            "extract_skills": "/resume/extract-skills",
            "chat": "/chatbot/chat",
            "match_jobs": "/matching/match",
            "skill_gaps": "/matching/skill-gaps"
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


@app.get("/debug")
async def debug():
    model = gemini_service.model
    return {
        "gemini_key_loaded": bool(settings.GEMINI_API_KEY),
        "gemini_key_prefix": settings.GEMINI_API_KEY[:10] + "..." if settings.GEMINI_API_KEY else "None",
        "model_loaded": model is not None,
        "model_name": str(model) if model else None
    }
