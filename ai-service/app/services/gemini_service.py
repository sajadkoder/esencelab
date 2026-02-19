import google.generativeai as genai
from typing import List, Optional, Dict, Any
from app.config import settings


class GeminiService:
    def __init__(self):
        self._model = None
        self._configured = False
    
    def _ensure_configured(self):
        if self._configured:
            return
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self._model = genai.GenerativeModel('gemini-2.0-flash-lite')
        self._configured = True
    
    @property
    def model(self):
        self._ensure_configured()
        return self._model
    
    async def enhance_resume(self, text: str, extracted_skills: List[str]) -> dict:
        if not self.model:
            return self._fallback_resume_analysis(extracted_skills)
        
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
            return self._fallback_resume_analysis(extracted_skills, str(e))
    
    def _fallback_resume_analysis(self, skills: List[str], error: str = "") -> dict:
        return {
            "summary": "Resume analyzed with local NLP processing",
            "technical_skills": skills,
            "soft_skills": [],
            "domain_skills": [],
            "inferred_skills": [],
            "suggested_roles": ["Software Engineer", "Developer"],
            "confidence_score": 0.6,
            "error": error if error else None
        }
    
    async def chat(self, message: str, context: Optional[Dict[str, Any]] = None, 
                   history: Optional[List[Dict]] = None) -> str:
        print("CHAT: Starting chat...")
        print(f"CHAT: self._configured = {self._configured}")
        model = self.model
        print(f"CHAT: model = {model}, type = {type(model)}, bool = {bool(model)}")
        
        if model is None:
            print("CHAT: model is None, using fallback")
            return self._fallback_chat(message)
        
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
            response = await model.generate_content_async(full_prompt)
            return response.text
        except Exception as e:
            print(f"CHAT ERROR: {e}")
            return self._fallback_chat(message, str(e))
    
    def _fallback_chat(self, message: str, error: str = "") -> str:
        responses = {
            "resume": "For resume tips: Use a clean format, highlight achievements with metrics, and tailor it to the job. Indian recruiters value academic scores and projects.",
            "interview": "For interviews: Practice DSA on LeetCode/GFG, prepare system design basics, and be ready with behavioral stories using the STAR method.",
            "career": "For career growth: Focus on core CS fundamentals, build projects, contribute to open source, and network on LinkedIn.",
            "skills": "Top skills in demand: Python, JavaScript, React, Node.js, SQL, AWS. Choose based on your interest in frontend, backend, or data science.",
        }
        
        message_lower = message.lower()
        for key, response in responses.items():
            if key in message_lower:
                return response
        
        return f"I'm here to help with your career questions about resumes, interviews, skills, and job searching. What would you like to know?"
    
    async def explain_job_match(self, candidate_skills: List[str], 
                                 job_requirements: List[str], 
                                 match_score: float) -> str:
        if not self.model:
            return f"Match score: {match_score}%. Focus on improving: {', '.join(set(job_requirements) - set(candidate_skills))}"
        
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
        if not self.model:
            return self._fallback_skill_gaps(current_skills, target_role)
        
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
            return self._fallback_skill_gaps(current_skills, target_role, str(e))
    
    def _fallback_skill_gaps(self, skills: List[str], target: str, error: str = "") -> dict:
        return {
            "missing_skills": [],
            "recommended_courses": [
                {"title": "DSA Course", "provider": "GeeksforGeeks", "url": "https://practice.geeksforgeeks.org", "priority": "high"},
                {"title": "System Design", "provider": "YouTube - Gaurav Sen", "url": "https://youtube.com", "priority": "medium"}
            ],
            "priority_order": skills,
            "estimated_time": "3-6 months",
            "error": error if error else None
        }
    
    def _parse_json_response(self, text: str) -> dict:
        import json
        try:
            json_match = text[text.find('{'):text.rfind('}')+1]
            return json.loads(json_match)
        except:
            return {"raw_response": text}


gemini_service = GeminiService()
