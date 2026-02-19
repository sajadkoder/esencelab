import { SKILL_ONTOLOGY, ROLE_SKILLS } from './ontology.js';

const DEGREE_REGEX =
  /\b(B\.?\s?Tech|B\.?\s?E|M\.?\s?Tech|M\.?\s?E|B\.?\s?Sc|M\.?\s?Sc|MBA|PhD|Bachelor|Master|Diploma)\b/gi;
const YEAR_REGEX = /\b(?:19|20)\d{2}\b/g;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}/g;
const LINKEDIN_REGEX = /(https?:\/\/)?(www\.)?linkedin\.com\/[A-Za-z0-9\-_/]+/gi;
const GITHUB_REGEX = /(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9\-_/]+/gi;

const EXPERIENCE_TITLES = [
  'Software Engineer',
  'Software Developer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'Data Analyst',
  'Machine Learning Engineer',
  'ML Engineer',
  'DevOps Engineer',
  'QA Engineer',
  'Product Manager',
];

const ORGANIZATION_HINTS = [
  'Inc',
  'LLC',
  'Ltd',
  'Corporation',
  'Company',
  'University',
  'College',
  'Institute',
  'School',
  'Labs',
];

const COMMON_LOCATIONS = [
  'Bangalore',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Mumbai',
  'Pune',
  'Delhi',
  'Noida',
  'Gurgaon',
  'Remote',
  'India',
];

function uniq(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function escapeRegExp(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function cleanText(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\u0000/g, ' ')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function extractContactDetails(text) {
  const emails = uniq(text.match(EMAIL_REGEX) || []);
  const phones = uniq((text.match(PHONE_REGEX) || []).map((value) => value.trim()));
  const linkedin = uniq(text.match(LINKEDIN_REGEX) || []);
  const github = uniq(text.match(GITHUB_REGEX) || []);

  return {
    emails,
    phones,
    linkedin,
    github,
  };
}

function extractLikelyName(text) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8);

  for (const line of lines) {
    const looksLikeName = /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$/.test(line);
    if (looksLikeName && !line.toLowerCase().includes('resume')) {
      return line;
    }
  }

  return '';
}

function extractOrganizations(text) {
  const organizations = [];
  const lines = text.split('\n').map((line) => line.trim());
  for (const line of lines) {
    if (ORGANIZATION_HINTS.some((hint) => line.includes(hint))) {
      organizations.push(line);
    }
  }
  return uniq(organizations).slice(0, 10);
}

function extractLocations(text) {
  const matches = COMMON_LOCATIONS.filter((location) => new RegExp(`\\b${escapeRegExp(location)}\\b`, 'i').test(text));
  return uniq(matches);
}

function extractDates(text) {
  return uniq(text.match(YEAR_REGEX) || []).slice(0, 20);
}

export function extractNamedEntities(text) {
  return {
    persons: uniq([extractLikelyName(text)]),
    organizations: extractOrganizations(text),
    locations: extractLocations(text),
    dates: extractDates(text),
  };
}

export function extractSkills(text) {
  const normalized = text.toLowerCase();
  const skills = [];

  for (const [canonical, aliases] of Object.entries(SKILL_ONTOLOGY)) {
    for (const alias of aliases) {
      const aliasRegex = new RegExp(`\\b${escapeRegExp(alias.toLowerCase())}\\b`, 'i');
      if (aliasRegex.test(normalized)) {
        skills.push(canonical);
        break;
      }
    }
  }

  return uniq(skills);
}

export function extractEducation(text) {
  const education = [];
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);

  for (const line of lines) {
    const degreeMatch = line.match(DEGREE_REGEX);
    if (!degreeMatch) {
      continue;
    }

    const yearMatches = line.match(YEAR_REGEX) || [];
    const institutionMatch = ORGANIZATION_HINTS.some((hint) => line.includes(hint)) ? line : '';

    education.push({
      degree: degreeMatch[0],
      institution: institutionMatch,
      field: '',
      year: yearMatches[0] || '',
    });
  }

  return uniq(education.map((item) => JSON.stringify(item))).map((item) => JSON.parse(item)).slice(0, 8);
}

export function extractExperience(text) {
  const experience = [];
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);

  for (const line of lines) {
    const title = EXPERIENCE_TITLES.find((jobTitle) =>
      line.toLowerCase().includes(jobTitle.toLowerCase()),
    );

    if (!title) {
      continue;
    }

    const years = line.match(YEAR_REGEX) || [];
    const company = extractOrganizations(line)[0] || '';

    experience.push({
      title,
      company,
      duration: years.length >= 2 ? `${years[0]}-${years[1]}` : years[0] || '',
      description: line,
    });
  }

  return uniq(experience.map((item) => JSON.stringify(item))).map((item) => JSON.parse(item)).slice(0, 12);
}

export function inferExperienceLevel(text) {
  const lowered = text.toLowerCase();
  const yearMatch = lowered.match(/(\d+)\+?\s*(years|yrs)\s*(of)?\s*experience/);
  const years = yearMatch ? Number.parseInt(yearMatch[1], 10) : 0;

  if (lowered.includes('fresher') || lowered.includes('intern') || years < 1) {
    return 'fresher';
  }

  if (years < 3) {
    return 'junior';
  }

  if (years < 7) {
    return 'mid';
  }

  return 'senior';
}

export function inferSuggestedRoles(skills) {
  const normalized = new Set(skills.map((skill) => skill.toLowerCase()));
  const ranked = Object.entries(ROLE_SKILLS)
    .map(([role, roleSkills]) => {
      const matched = roleSkills.filter((skill) => normalized.has(skill.toLowerCase())).length;
      const score = roleSkills.length ? matched / roleSkills.length : 0;
      return {
        role,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.role.replace(/\b\w/g, (char) => char.toUpperCase()));

  return ranked.length > 0 ? ranked : ['Software Engineer'];
}

export function parseResumeText(text) {
  const cleaned = cleanText(text);
  const skills = extractSkills(cleaned);
  const contactDetails = extractContactDetails(cleaned);
  const entities = extractNamedEntities(cleaned);
  const education = extractEducation(cleaned);
  const experience = extractExperience(cleaned);

  return {
    raw_text: cleaned,
    skills,
    education,
    experience,
    contact_details: contactDetails,
    named_entities: entities,
    experience_level: inferExperienceLevel(cleaned),
    suggested_roles: inferSuggestedRoles(skills),
    confidence_score: skills.length > 0 ? 0.82 : 0.55,
  };
}
