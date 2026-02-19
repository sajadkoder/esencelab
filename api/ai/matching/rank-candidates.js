import { assertMethod, sendJson } from '../../_lib/http.js';
import { requireAuth } from '../../_lib/auth.js';
import { scoreJobMatch, findMatchedAndMissingSkills } from '../../_lib/similarity.js';

function toBody(req) {
  if (!req.body) {
    return {};
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

function extractCandidateSkills(candidate) {
  const rawSkills = candidate?.skills;
  if (!Array.isArray(rawSkills)) {
    return [];
  }

  return rawSkills
    .map((skill) => {
      if (typeof skill === 'string') {
        return skill;
      }
      if (skill && typeof skill === 'object') {
        return skill.name || skill.skill || '';
      }
      return '';
    })
    .map((value) => String(value).trim())
    .filter(Boolean);
}

export default async function handler(req, res) {
  if (!assertMethod(req, res, ['POST', 'OPTIONS'])) {
    return;
  }

  const auth = await requireAuth(req, res, ['employer', 'admin']);
  if (!auth) {
    return;
  }

  const body = toBody(req);
  const candidates = Array.isArray(body.candidates) ? body.candidates : [];
  const jobRequirements = Array.isArray(body.job_requirements)
    ? body.job_requirements.map((item) => String(item).trim()).filter(Boolean)
    : [];

  if (candidates.length === 0 || jobRequirements.length === 0) {
    sendJson(res, 400, { error: 'candidates and job_requirements are required arrays' });
    return;
  }

  const ranked = candidates
    .map((candidate) => {
      const skills = extractCandidateSkills(candidate);
      const score = scoreJobMatch(skills, jobRequirements);
      const breakdown = findMatchedAndMissingSkills(skills, jobRequirements);
      return {
        ...candidate,
        match_score: score.final_score,
        similarity_score: score.tfidf_score,
        matched_skills: breakdown.matched_skills,
        missing_skills: breakdown.missing_skills,
      };
    })
    .sort((a, b) => b.match_score - a.match_score);

  sendJson(res, 200, {
    ranked_candidates: ranked,
  });
}

