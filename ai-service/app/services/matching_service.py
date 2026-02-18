from typing import List, Dict


class MatchingService:
    @staticmethod
    def calculate_match_score(candidate_skills: List[str], 
                               job_requirements: List[str]) -> float:
        if not job_requirements:
            return 0.0
        
        candidate_lower = [s.lower() for s in candidate_skills]
        requirements_lower = [r.lower() for r in job_requirements]
        
        matched = 0
        for req in requirements_lower:
            for skill in candidate_lower:
                if req in skill or skill in req:
                    matched += 1
                    break
        
        base_score = (matched / len(job_requirements)) * 100
        
        bonus = 0
        high_value_skills = ['python', 'javascript', 'react', 'java', 'aws', 
                            'machine learning', 'dsa', 'system design']
        for skill in candidate_lower:
            if any(hv in skill for hv in high_value_skills):
                bonus += 2
        
        final_score = min(100, base_score + bonus)
        return round(final_score, 2)
    
    @staticmethod
    def get_matched_skills(candidate_skills: List[str], 
                           job_requirements: List[str]) -> List[str]:
        matched = []
        candidate_lower = {s.lower(): s for s in candidate_skills}
        requirements_lower = [r.lower() for r in job_requirements]
        
        for req in requirements_lower:
            for skill_lower, skill_original in candidate_lower.items():
                if req in skill_lower or skill_lower in req:
                    matched.append(skill_original)
                    break
        
        return matched
    
    @staticmethod
    def get_missing_skills(candidate_skills: List[str], 
                           job_requirements: List[str]) -> List[str]:
        matched = MatchingService.get_matched_skills(candidate_skills, job_requirements)
        matched_lower = [m.lower() for m in matched]
        
        missing = []
        for req in job_requirements:
            req_lower = req.lower()
            if not any(req_lower in m or m in req_lower for m in matched_lower):
                missing.append(req)
        
        return missing
    
    @staticmethod
    def rank_candidates(candidates: List[Dict], 
                        job_requirements: List[str]) -> List[Dict]:
        ranked = []
        for candidate in candidates:
            skills = candidate.get('skills', [])
            if isinstance(skills, list) and skills and isinstance(skills[0], dict):
                skill_names = [s.get('name', '') for s in skills]
            else:
                skill_names = skills if isinstance(skills, list) else []
            
            score = MatchingService.calculate_match_score(skill_names, job_requirements)
            ranked.append({
                **candidate,
                'match_score': score
            })
        
        ranked.sort(key=lambda x: x['match_score'], reverse=True)
        return ranked


matching_service = MatchingService()
