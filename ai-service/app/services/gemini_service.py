import google.generativeai as genai
from typing import List, Optional, Dict, Any
from app.config import settings


class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
    
    async def enhance_resume(self, text: str, extracted_skills: List[str]) -> dict:
        prompt = f"""
        Analyze this resume and provide:
        1. A professional summary (2-3 sentences)
        2. Categorize the skills into technical, soft, and domain
        3. Infer any missing skills based on experience
        4. Suggest suitable job roles
        5. Rate confidence of extraction (0-1)

        Raw extracted skills: {extracted_skills}
        
        Resume text:
        {text[:3000]}
        
        Respond in JSON format:
        {{
            "summary": "...",
            "technical_skills": [...],
            "soft_skills": [...],
            "domain_skills": [...],
            "inferred_skills": [...],
            "suggested_roles": [...],
            "confidence_score": 0.85
        }}
        """
        
        try:
            response = await self.model.generate_content_async(prompt)
            return self._parse_json_response(response.text)
        except Exception as e:
            return {
                "summary": "Failed to generate summary",
                "technical_skills": extracted_skills,
                "soft_skills": [],
                "domain_skills": [],
                "inferred_skills": [],
                "suggested_roles": ["Software Engineer"],
                "confidence_score": 0.5,
                "error": str(e)
            }
    
    async def chat(self, message: str, context: Optional[Dict[str, Any]] = None, 
                   history: Optional[List[Dict]] = None) -> str:
        system_prompt = """You are Esencelab's AI career assistant for Indian students. 
        Help with:
        - Resume tips and ATS optimization
        - Career path guidance for Indian tech industry
        - Interview preparation (DSA, System Design, Behavioral)
        - Skill development recommendations
        - Job search strategies for campus placements
        
        Be concise, actionable, and encouraging. For technical questions, provide examples.
        Use INR currency and Indian job market context when relevant."""
        
        context_str = ""
        if context:
            context_str = f"\n\nUser context: {context}"
        
        history_str = ""
        if history:
            history_str = "\n\nChat history: " + "\n".join(
                [f"{h['role']}: {h['content']}" for h in history[-5:]]
            )
        
        full_prompt = f"{system_prompt}{context_str}{history_str}\n\nUser: {message}"
        
        try:
            response = await self.model.generate_content_async(full_prompt)
            return response.text
        except Exception as e:
            return f"I apologize, but I encountered an error. Please try again. Error: {str(e)}"
    
    async def explain_job_match(self, candidate_skills: List[str], 
                                 job_requirements: List[str], 
                                 match_score: float) -> str:
        prompt = f"""
        A candidate has these skills: {candidate_skills}
        A job requires these skills: {job_requirements}
        Match score: {match_score}%
        
        Explain why this is a good or poor match in 2-3 sentences, and suggest what 
        the candidate should focus on improving.
        """
        
        try:
            response = await self.model.generate_content_async(prompt)
            return response.text
        except:
            return f"Match score: {match_score}%. Focus on improving the missing skills."
    
    async def analyze_skill_gaps(self, current_skills: List[str], 
                                  target_role: str) -> dict:
        prompt = f"""
        A candidate has these current skills: {current_skills}
        They want to become a: {target_role}
        
        Analyze skill gaps and recommend learning paths. Consider Indian context
        (courses from GFG, Scaler, Coding Ninjas, YouTube channels like Apna College).
        
        Respond in JSON format:
        {{
            "missing_skills": [...],
            "recommended_courses": [
                {{"title": "...", "provider": "...", "url": "...", "priority": "high/medium/low"}}
            ],
            "priority_order": [...],
            "estimated_time": "X months"
        }}
        """
        
        try:
            response = await self.model.generate_content_async(prompt)
            return self._parse_json_response(response.text)
        except Exception as e:
            return {
                "missing_skills": [],
                "recommended_courses": [],
                "priority_order": [],
                "error": str(e)
            }
    
    def _parse_json_response(self, text: str) -> dict:
        import json
        try:
            json_match = text[text.find('{'):text.rfind('}')+1]
            return json.loads(json_match)
        except:
            return {"raw_response": text}


gemini_service = GeminiService()
