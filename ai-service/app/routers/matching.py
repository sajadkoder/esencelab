from fastapi import APIRouter
from app.services.matching_service import matching_service
from app.services.gemini_service import gemini_service
from app.models.schemas import JobMatchRequest, JobMatchResponse, SkillGapRequest, SkillGapResponse

router = APIRouter()


@router.post("/match", response_model=JobMatchResponse)
async def match_jobs(request: JobMatchRequest):
    score = matching_service.calculate_match_score(
        request.candidate_skills,
        request.job_requirements
    )
    
    matched = matching_service.get_matched_skills(
        request.candidate_skills,
        request.job_requirements
    )
    
    missing = matching_service.get_missing_skills(
        request.candidate_skills,
        request.job_requirements
    )
    
    explanation = await gemini_service.explain_job_match(
        request.candidate_skills,
        request.job_requirements,
        score
    )
    
    return JobMatchResponse(
        match_score=score,
        matched_skills=matched,
        missing_skills=missing,
        explanation=explanation
    )


@router.post("/skill-gaps", response_model=SkillGapResponse)
async def analyze_skill_gaps(request: SkillGapRequest):
    result = await gemini_service.analyze_skill_gaps(
        request.current_skills,
        request.target_role
    )
    
    return SkillGapResponse(
        missing_skills=result.get('missing_skills', []),
        recommended_courses=result.get('recommended_courses', []),
        priority_order=result.get('priority_order', [])
    )


@router.post("/rank-candidates")
async def rank_candidates(candidates: list, job_requirements: list):
    ranked = matching_service.rank_candidates(candidates, job_requirements)
    return {"ranked_candidates": ranked}
