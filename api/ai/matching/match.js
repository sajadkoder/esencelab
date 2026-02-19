import { assertMethod, sendJson } from '../../_lib/http.js';
import { requireAuth } from '../../_lib/auth.js';
import { findMatchedAndMissingSkills, scoreJobMatch } from '../../_lib/similarity.js';
import { generateGeminiText } from '../../_lib/gemini.js';

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

function ensureArray(value) {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : [];
}

function fallbackExplanation(score, matched, missing) {
  if (score >= 75) {
    return `Strong match with ${matched.length} aligned skills. Focus on ${missing.slice(0, 3).join(', ') || 'advanced depth'} to improve further.`;
  }

  if (score >= 45) {
    return `Partial match with solid foundations in ${matched.slice(0, 4).join(', ') || 'core areas'}. Building ${missing.slice(0, 3).join(', ') || 'missing requirements'} should increase fit quickly.`;
  }

  return `Current alignment is limited. Prioritize ${missing.slice(0, 4).join(', ') || 'the listed requirements'} before applying.`;
}

export default async function handler(req, res) {
  if (!assertMethod(req, res, ['POST', 'OPTIONS'])) {
    return;
  }

  const auth = await requireAuth(req, res, ['student', 'employer', 'admin']);
  if (!auth) {
    return;
  }

  const body = toBody(req);
  const candidateSkills = ensureArray(body.candidate_skills);
  const jobRequirements = ensureArray(body.job_requirements);
  const jobTitle = String(body.job_title || 'role');

  if (candidateSkills.length === 0 || jobRequirements.length === 0) {
    sendJson(res, 400, { error: 'candidate_skills and job_requirements are required arrays' });
    return;
  }

  const { matched_skills: matchedSkills, missing_skills: missingSkills } = findMatchedAndMissingSkills(candidateSkills, jobRequirements);
  const score = scoreJobMatch(candidateSkills, jobRequirements);

  const aiExplanation = await generateGeminiText(
    `Candidate skills: ${candidateSkills.join(', ')}
Job requirements: ${jobRequirements.join(', ')}
Job title: ${jobTitle}
Match score: ${score.final_score}

Explain this match in 2 concise sentences and suggest next 2 priorities.`,
    fallbackExplanation(score.final_score, matchedSkills, missingSkills),
  );

  sendJson(res, 200, {
    match_score: score.final_score,
    similarity_score: score.tfidf_score,
    overlap_score: score.overlap_score,
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    explanation: aiExplanation,
  });
}
