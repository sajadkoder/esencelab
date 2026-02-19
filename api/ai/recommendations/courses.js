import { assertMethod, sendJson } from '../../_lib/http.js';
import { requireAuth } from '../../_lib/auth.js';
import { getSupabaseClient } from '../../_lib/supabase.js';

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

function normalizeCourses(courses) {
  if (!Array.isArray(courses)) {
    return [];
  }

  return courses.map((course) => ({
    ...course,
    skills: ensureArray(course.skills),
  }));
}

async function fetchCoursesFromSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from('courses')
    .select('*')
    .order('rating', { ascending: false })
    .limit(200);

  return normalizeCourses(data || []);
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
  const missingSkills = ensureArray(body.missing_skills);
  const currentSkills = ensureArray(body.current_skills);
  const topN = Number.isFinite(Number(body.top_n)) ? Math.max(1, Math.min(20, Number(body.top_n))) : 6;
  const inputCourses = normalizeCourses(body.courses || []);

  const courses = inputCourses.length > 0 ? inputCourses : await fetchCoursesFromSupabase();
  if (courses.length === 0) {
    sendJson(res, 200, { recommendations: [] });
    return;
  }

  const targetSkills = missingSkills.length > 0 ? missingSkills : currentSkills;
  const ranked = courses
    .map((course) => {
      const overlapSkills = course.skills.filter((skill) =>
        targetSkills.some((target) => target.toLowerCase() === skill.toLowerCase()),
      );
      const relevance = overlapSkills.length;
      const rating = Number(course.rating || 0);
      const score = relevance * 10 + rating;
      return {
        ...course,
        relevance_score: Math.round(score * 100) / 100,
        targeted_skill_gaps: overlapSkills,
      };
    })
    .filter((course) => course.relevance_score > 0)
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, topN);

  sendJson(res, 200, {
    recommendations: ranked,
  });
}

