import type { TargetRole } from '@/types';

export const TARGET_ROLES: TargetRole[] = [
  {
    id: '1',
    name: 'Software Engineer',
    requiredSkills: ['Python', 'JavaScript', 'React', 'SQL', 'Git', 'Data Structures'],
    category: 'Engineering',
  },
  {
    id: '2',
    name: 'Data Scientist',
    requiredSkills: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Pandas', 'TensorFlow'],
    category: 'Data',
  },
  {
    id: '3',
    name: 'Frontend Developer',
    requiredSkills: ['React', 'TypeScript', 'CSS', 'HTML', 'JavaScript', 'Figma'],
    category: 'Engineering',
  },
  {
    id: '4',
    name: 'Backend Developer',
    requiredSkills: ['Python', 'SQL', 'Docker', 'AWS', 'API Design', 'Node.js'],
    category: 'Engineering',
  },
  {
    id: '5',
    name: 'Machine Learning Engineer',
    requiredSkills: ['Python', 'Machine Learning', 'PyTorch', 'TensorFlow', 'Statistics', 'MLOps'],
    category: 'AI/ML',
  },
  {
    id: '6',
    name: 'DevOps Engineer',
    requiredSkills: ['Docker', 'AWS', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform'],
    category: 'Operations',
  },
  {
    id: '7',
    name: 'Full Stack Developer',
    requiredSkills: ['React', 'Node.js', 'SQL', 'JavaScript', 'Git', 'REST APIs'],
    category: 'Engineering',
  },
  {
    id: '8',
    name: 'Data Analyst',
    requiredSkills: ['SQL', 'Python', 'Tableau', 'Excel', 'Data Visualization', 'Statistics'],
    category: 'Data',
  },
  {
    id: '9',
    name: 'Product Manager',
    requiredSkills: ['Product Strategy', 'Agile', 'Data Analysis', 'Communication', 'User Research'],
    category: 'Product',
  },
  {
    id: '10',
    name: 'Cloud Engineer',
    requiredSkills: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Linux', 'Networking'],
    category: 'Operations',
  },
];

export const SKILL_CATEGORIES = [
  'Programming Languages',
  'Frameworks & Libraries',
  'Databases',
  'Cloud & DevOps',
  'Data Science',
  'Machine Learning',
  'Soft Skills',
  'Tools',
] as const;