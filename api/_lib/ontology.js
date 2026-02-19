export const SKILL_ONTOLOGY = {
  Python: ['python', 'py', 'pandas', 'numpy', 'django', 'flask', 'fastapi', 'scipy'],
  JavaScript: ['javascript', 'js', 'es6', 'nodejs', 'node', 'express', 'nextjs'],
  TypeScript: ['typescript', 'ts', 'tsx'],
  React: ['react', 'reactjs', 'jsx', 'redux', 'hooks'],
  Angular: ['angular', 'angularjs', 'ngrx'],
  Vue: ['vue', 'vuejs', 'vuex'],
  SQL: ['sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'database'],
  NoSQL: ['mongodb', 'mongo', 'redis', 'cassandra', 'dynamodb', 'nosql'],
  Git: ['git', 'github', 'gitlab', 'bitbucket', 'version control'],
  Docker: ['docker', 'containerization', 'kubernetes', 'k8s', 'container'],
  AWS: ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'rds'],
  Azure: ['azure', 'microsoft azure'],
  GCP: ['gcp', 'google cloud', 'bigquery', 'gke'],
  Java: ['java', 'spring', 'spring boot', 'hibernate', 'maven'],
  'C++': ['c++', 'cpp', 'stl'],
  C: ['c programming', 'c language'],
  Go: ['go', 'golang', 'gin'],
  Rust: ['rust', 'cargo'],
  'Machine Learning': ['machine learning', 'ml', 'scikit-learn', 'sklearn', 'pytorch', 'tensorflow', 'keras'],
  'Data Science': ['data science', 'data analysis', 'analytics', 'statistics'],
  DevOps: ['devops', 'ci/cd', 'cicd', 'jenkins', 'terraform', 'pipeline'],
  DSA: ['data structures', 'algorithms', 'dsa', 'competitive programming', 'leetcode'],
  'System Design': ['system design', 'architecture', 'scalability', 'distributed systems'],
  'REST API': ['rest', 'restful', 'api', 'rest api', 'json'],
  GraphQL: ['graphql', 'gql', 'apollo'],
  Testing: ['testing', 'jest', 'pytest', 'unittest', 'selenium', 'cypress'],
  Linux: ['linux', 'ubuntu', 'centos', 'shell', 'bash', 'unix'],
  'HTML/CSS': ['html', 'css', 'sass', 'scss', 'tailwind', 'bootstrap', 'responsive design'],
  Mobile: ['android', 'ios', 'react native', 'flutter', 'kotlin', 'swift'],
  Blockchain: ['blockchain', 'ethereum', 'smart contracts', 'web3', 'solidity'],
  Tableau: ['tableau'],
  Excel: ['excel'],
  Figma: ['figma'],
  Node: ['node', 'nodejs'],
};

export const ROLE_SKILLS = {
  'software engineer': ['Python', 'JavaScript', 'TypeScript', 'React', 'SQL', 'Git', 'DSA', 'System Design', 'REST API'],
  'frontend developer': ['React', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Figma', 'Testing'],
  'backend developer': ['Python', 'Java', 'Node', 'SQL', 'NoSQL', 'Docker', 'AWS', 'REST API'],
  'full stack developer': ['React', 'TypeScript', 'Node', 'SQL', 'NoSQL', 'Git', 'REST API', 'Testing'],
  'data analyst': ['SQL', 'Python', 'Data Science', 'Tableau', 'Excel', 'Statistics'],
  'data scientist': ['Python', 'Machine Learning', 'Data Science', 'SQL', 'Statistics', 'GCP'],
  'ml engineer': ['Python', 'Machine Learning', 'AWS', 'Docker', 'MLOps', 'System Design'],
  'devops engineer': ['Linux', 'Docker', 'AWS', 'Azure', 'GCP', 'DevOps', 'Kubernetes'],
  'qa engineer': ['Testing', 'JavaScript', 'Python', 'REST API'],
};

export function getRoleSkills(role) {
  if (!role) {
    return ROLE_SKILLS['software engineer'];
  }

  const normalized = role.toLowerCase().trim();
  const exact = ROLE_SKILLS[normalized];
  if (exact) {
    return exact;
  }

  const closest = Object.entries(ROLE_SKILLS).find(([key]) => normalized.includes(key) || key.includes(normalized));
  return closest ? closest[1] : ROLE_SKILLS['software engineer'];
}

