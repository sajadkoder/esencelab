import spacy
from typing import List, Tuple
import re

SKILL_ONTOLOGY = {
    'Python': ['python', 'py', 'pandas', 'numpy', 'django', 'flask', 'fastapi', 'scipy'],
    'JavaScript': ['javascript', 'js', 'es6', 'es7', 'es8', 'nodejs', 'node', 'express', 'jquery'],
    'TypeScript': ['typescript', 'ts', 'tsx'],
    'React': ['react', 'reactjs', 'jsx', 'nextjs', 'next.js', 'next', 'redux', 'hooks'],
    'Angular': ['angular', 'angularjs', 'ng', 'ngrx', 'typescript angular'],
    'Vue': ['vue', 'vuejs', 'vuex', 'vue.js'],
    'SQL': ['sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'database', 'rdbms'],
    'NoSQL': ['mongodb', 'mongo', 'redis', 'cassandra', 'dynamodb', 'nosql'],
    'Git': ['git', 'github', 'gitlab', 'bitbucket', 'version control'],
    'Docker': ['docker', 'containerization', 'kubernetes', 'k8s', 'container'],
    'AWS': ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'rds', 'cloudwatch'],
    'Azure': ['azure', 'microsoft azure', 'cloud azure'],
    'GCP': ['gcp', 'google cloud', 'bigquery', 'gke'],
    'Java': ['java', 'spring', 'springboot', 'spring boot', 'hibernate', 'maven'],
    'C++': ['c++', 'cpp', 'stl'],
    'C': ['c programming', 'c language'],
    'Go': ['go', 'golang', 'gin'],
    'Rust': ['rust', 'cargo'],
    'Machine Learning': ['machine learning', 'ml', 'scikit-learn', 'sklearn', 'pytorch', 'tensorflow', 'keras', 'deep learning'],
    'Data Science': ['data science', 'data analysis', 'analytics', 'statistics', 'numpy', 'pandas'],
    'DevOps': ['devops', 'ci/cd', 'jenkins', 'cicd', 'pipeline', 'terraform'],
    'DSA': ['data structures', 'algorithms', 'dsa', 'competitive programming', 'leetcode'],
    'System Design': ['system design', 'architecture', 'scalability', 'distributed systems'],
    'REST API': ['rest', 'restful', 'api', 'rest api', 'json'],
    'GraphQL': ['graphql', 'gql', 'apollo'],
    'Testing': ['testing', 'jest', 'pytest', 'unittest', 'selenium', 'cypress'],
    'Linux': ['linux', 'ubuntu', 'centos', 'shell', 'bash', 'unix'],
    'HTML/CSS': ['html', 'css', 'sass', 'scss', 'tailwind', 'bootstrap', 'responsive design'],
    'Mobile': ['android', 'ios', 'react native', 'flutter', 'kotlin', 'swift'],
    'Blockchain': ['blockchain', 'ethereum', 'smart contracts', 'web3', 'solidity'],
}


class NLPService:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_lg")
        except OSError:
            self.nlp = spacy.load("en_core_web_sm")
    
    def extract_entities(self, text: str) -> dict:
        doc = self.nlp(text)
        
        entities = {
            'persons': [],
            'organizations': [],
            'locations': [],
            'dates': [],
            'emails': [],
            'phones': []
        }
        
        for ent in doc.ents:
            if ent.label_ == 'PERSON':
                entities['persons'].append(ent.text)
            elif ent.label_ == 'ORG':
                entities['organizations'].append(ent.text)
            elif ent.label_ == 'GPE':
                entities['locations'].append(ent.text)
            elif ent.label_ == 'DATE':
                entities['dates'].append(ent.text)
        
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        entities['emails'] = re.findall(email_pattern, text)
        
        phone_pattern = r'[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}'
        entities['phones'] = re.findall(phone_pattern, text)
        
        return entities
    
    def extract_skills(self, text: str) -> List[str]:
        text_lower = text.lower()
        found_skills = []
        
        for skill, aliases in SKILL_ONTOLOGY.items():
            for alias in aliases:
                if alias in text_lower:
                    if skill not in found_skills:
                        found_skills.append(skill)
                    break
        
        return found_skills
    
    def categorize_skills(self, skills: List[str]) -> dict:
        technical = ['Python', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Java', 
                     'C++', 'Go', 'Rust', 'SQL', 'NoSQL', 'Git', 'Docker', 'AWS', 'Azure', 
                     'GCP', 'DSA', 'System Design', 'REST API', 'GraphQL', 'Linux', 'Mobile',
                     'Blockchain', 'Testing']
        soft = ['Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Time Management']
        domain = ['Machine Learning', 'Data Science', 'DevOps', 'HTML/CSS']
        
        categorized = {
            'technical': [],
            'soft': [],
            'domain': []
        }
        
        for skill in skills:
            if skill in technical:
                categorized['technical'].append(skill)
            elif skill in soft:
                categorized['soft'].append(skill)
            elif skill in domain:
                categorized['domain'].append(skill)
            else:
                categorized['technical'].append(skill)
        
        return categorized
    
    def extract_education(self, text: str) -> List[dict]:
        education = []
        doc = self.nlp(text)
        
        degree_patterns = [
            r'(B\.?Tech|B\.?E|M\.?Tech|M\.?E|B\.?Sc|M\.?Sc|PhD|Bachelor|Master|Diploma)',
            r'(B\.?Tech|M\.?Tech|B\.?E|M\.?E)\s*(in|of)?\s*(\w+)?'
        ]
        
        institutions = []
        for ent in doc.ents:
            if ent.label_ == 'ORG':
                institutions.append(ent.text)
        
        for pattern in degree_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                education.append({
                    'degree': match.group(0),
                    'institution': '',
                    'field': ''
                })
        
        return education
    
    def extract_experience(self, text: str) -> List[dict]:
        experience = []
        doc = self.nlp(text)
        
        companies = []
        for ent in doc.ents:
            if ent.label_ == 'ORG':
                companies.append(ent.text)
        
        job_titles = [
            'Software Engineer', 'Developer', 'Analyst', 'Manager', 'Lead',
            'Intern', 'Senior', 'Junior', 'Full Stack', 'Backend', 'Frontend',
            'Data Scientist', 'ML Engineer', 'DevOps Engineer'
        ]
        
        found_titles = []
        for title in job_titles:
            if title.lower() in text.lower():
                found_titles.append(title)
        
        return [{'company': c, 'title': t} for c, t in zip(companies, found_titles)]
    
    def calculate_experience_level(self, text: str) -> Tuple[str, int]:
        text_lower = text.lower()
        
        years_patterns = [
            r'(\d+)\+?\s*years?\s*(of)?\s*experience',
            r'(\d+)\+?\s*yrs?\s*(of)?\s*experience'
        ]
        
        total_years = 0
        for pattern in years_patterns:
            matches = re.findall(pattern, text_lower)
            for match in matches:
                if match[0]:
                    total_years = max(total_years, int(match[0]))
        
        if 'intern' in text_lower or 'fresher' in text_lower or total_years < 1:
            return 'fresher', 0
        elif total_years < 3:
            return 'junior', total_years
        elif total_years < 7:
            return 'mid', total_years
        else:
            return 'senior', total_years


nlp_service = NLPService()
