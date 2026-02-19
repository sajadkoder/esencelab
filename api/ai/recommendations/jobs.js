import { assertMethod, sendJson } from '../../_lib/http.js';
import { requireAuth } from '../../_lib/auth.js';
import { getSupabaseClient } from '../../_lib/supabase.js';
import { scoreJobMatch, findMatchedAndMissingSkills } from '../../_lib/similarity.js';
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

function normalizeJobs(jobs) {
  if (!Array.isArray(jobs)) {
    return [];
  }

  return jobs.map((job) => ({
    ...job,
    requirements: ensureArray(job.requirements || job.skills),
  }));
}

async function fetchJobsFromSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'active')
    .order('posted_at', { ascending: false })
    .limit(120);

  return normalizeJobs(data || []);
}

export default async function handler(req, res) {
  if (!assertMethod(req, res, ['POST', 'OPTIONS'])) {
    return;
  }

  const auth = await requireAuth(req, res, ['student', 'admin']);
  if (!auth) {
    return;
  }

  const body = toBody(req);
  const candidateSkills = ensureArray(body.candidate_skills);
  const topN = Number.isFinite(Number(body.top_n)) ? Math.max(1, Math.min(20, Number(body.top_n))) : 6;
  const inputJobs = normalizeJobs(body.jobs || []);
  const jobs = inputJobs.length > 0 ? inputJobs : await fetchJobsFromSupabase();

  if (candidateSkills.length === 0) {
    sendJson(res, 400, { error: 'candidate_skills is required' });
    return;
  }

  if (jobs.length === 0) {
    sendJson(res, 200, { recommendations: [] });
    return;
  }

  const scored = jobs
    .map((job) => {
      const requirements = ensureArray(job.requirements || job.skills);
      const scoring = scoreJobMatch(candidateSkills, requirements);
      const breakdown = findMatchedAndMissingSkills(candidateSkills, requirements);
      return {
        ...job,
        match_score: scoring.final_score,
        similarity_score: scoring.tfidf_score,
        matched_skills: breakdown.matched_skills,
        missing_skills: breakdown.missing_skills,
      };
    })
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, topN);

  const summary = await generateGeminiText(
    `Candidate skills: ${candidateSkills.join(', ')}
Top job matches:
${scored.map((job) => `- ${job.title} at ${job.company}: ${job.match_score}%`).join('\n')}

Write a short recommendation summary in 2 lines.`,
    'Top jobs are ranked by skill overlap and TF-IDF similarity to your profile.',
  );

  sendJson(res, 200, {
    recommendations: scored,
    explanation: summary,
  });
}

