from fastapi import APIRouter
from datetime import datetime
from typing import List, Optional
from app.services.gemini_service import gemini_service
from app.models.schemas import ChatRequest, ChatResponse

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    response = await gemini_service.chat(
        message=request.message,
        context=request.context,
        history=request.history
    )
    
    return ChatResponse(
        response=response,
        timestamp=datetime.utcnow().isoformat()
    )


@router.post("/career-advice")
async def career_advice(message: str, skills: Optional[List[str]] = None):
    context = {"skills": skills} if skills else None
    
    response = await gemini_service.chat(
        message=message,
        context=context
    )
    
    return {
        "advice": response,
        "timestamp": datetime.utcnow().isoformat()
    }
