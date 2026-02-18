from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class SkillCategory(str, Enum):
    TECHNICAL = "technical"
    SOFT = "soft"
    DOMAIN = "domain"


class Skill(BaseModel):
    name: str
    score: float
    category: SkillCategory


class Education(BaseModel):
    institution: str
    degree: str
    field: str
    start_date: str
    end_date: Optional[str] = None


class Experience(BaseModel):
    company: str
    title: str
    description: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None


class ResumeParseRequest(BaseModel):
    text: Optional[str] = None


class ResumeParseResponse(BaseModel):
    skills: List[str]
    education: List[Education]
    experience: List[Experience]
    summary: str
    experience_level: str
    suggested_roles: List[str]
    confidence_score: float


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None
    history: Optional[List[ChatMessage]] = None


class ChatResponse(BaseModel):
    response: str
    timestamp: str


class JobMatchRequest(BaseModel):
    candidate_skills: List[str]
    job_requirements: List[str]
    job_title: str
    company: str


class JobMatchResponse(BaseModel):
    match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    explanation: str


class SkillGapRequest(BaseModel):
    current_skills: List[str]
    target_role: str


class SkillGapResponse(BaseModel):
    missing_skills: List[str]
    recommended_courses: List[dict]
    priority_order: List[str]
