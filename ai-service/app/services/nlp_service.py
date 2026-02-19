import re
from typing import List, Tuple, Optional

try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False

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

DEGREE_PATTERN = r'(B\.?Tech|B\.?E|M\.?Tech|M\.?E|B\.?Sc|M\.?Sc|PhD|Bachelor|Master|Diploma|B\.?A|M\.?A|MBA)'
JOB_TITLES = [
    'Software Engineer', 'Software Developer', 'Full Stack Developer', 'Backend Developer',
    'Frontend Developer', 'Data Scientist', 'Data Analyst', 'ML Engineer', 'DevOps Engineer',
    'Senior Software Engineer', 'Junior Software Engineer', 'Technical Lead', 'Engineering Manager',
    'Product Manager', 'Project Manager', 'System Administrator', 'Database Administrator',
    'QA Engineer', 'Test Engineer', 'Security Engineer', 'Cloud Engineer', 'Site Reliability Engineer'
]


class NLPService:
    def __init__(self):
        self.nlp: Optional[any] = None
        if SPACY_AVAILABLE:
            try:
                self.nlp = spacy.load("en_core_web_lg")
            except OSError:
                try:
                    self.nlp = spacy.load("en_core_web_sm")
                except OSError:
                    pass
    
    def extract_entities(self, text: str) -> dict:
        entities = {
            'persons': [],
            'organizations': [],
            'locations': [],
            'dates': [],
            'emails': [],
            'phones': []
        }
        
        if self.nlp:
            doc = self.nlp(text)
            for ent in doc.ents:
                if ent.label_ == 'PERSON':
                    entities['persons'].append(ent.text)
                elif ent.label_ == 'ORG':
                    entities['organizations'].append(ent.text)
                elif ent.label_ == 'GPE':
                    entities['locations'].append(ent.text)
                elif ent.label_ == 'DATE':
                    entities['dates'].append(ent.text)
        else:
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            entities['emails'] = re.findall(email_pattern, text)
            
            name_pattern = r'(?:Name|NAME):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)'
            matches = re.findall(name_pattern, text)
            entities['persons'] = matches
            
            org_keywords = ['Inc', 'LLC', 'Ltd', 'Corp', 'Corporation', 'Company', 'Pvt', 'Private']
            org_pattern = r'([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*(?:\s+(?:' + '|'.join(org_keywords) + r'))?)'
            entities['organizations'] = re.findall(org_pattern, text)[:5]
        
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
        
        matches = re.finditer(DEGREE_PATTERN, text, re.IGNORECASE)
        for match in matches:
            education.append({
                'degree': match.group(0),
                'institution': '',
                'field': ''
            })
        
        if self.nlp and not education:
            doc = self.nlp(text)
            for ent in doc.ents:
                if ent.label_ == 'ORG' and any(kw in ent.text for kw in ['University', 'College', 'Institute', 'IIT', 'NIT', 'BITS']):
                    education.append({
                        'degree': '',
                        'institution': ent.text,
                        'field': ''
                    })
        
        return education
    
    def extract_experience(self, text: str) -> List[dict]:
        experience = []
        found_titles = []
        
        for title in JOB_TITLES:
            if title.lower() in text.lower():
                found_titles.append(title)
        
        if self.nlp:
            doc = self.nlp(text)
            companies = [ent.text for ent in doc.ents if ent.label_ == 'ORG']
            experience = [{'company': c, 'title': t} for c, t in zip(companies, found_titles)]
        else:
            for title in found_titles:
                experience.append({'company': '', 'title': title})
        
        return experience
    
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
