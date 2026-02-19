import { assertMethod, sendJson } from '../../_lib/http.js';
import { requireAuth } from '../../_lib/auth.js';
import { getRoleSkills } from '../../_lib/ontology.js';
import { findMatchedAndMissingSkills, scoreJobMatch } from '../../_lib/similarity.js';
import { getSupabaseClient } from '../../_lib/supabase.js';
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

function computePriorityOrder(missingSkills, roleSkills) {
  const importance = new Map(roleSkills.map((skill, index) => [skill.toLowerCase(), roleSkills.length - index]));
  return [...missingSkills].sort((a, b) => {
    const aWeight = importance.get(a.toLowerCase()) || 0;
    const bWeight = importance.get(b.toLowerCase()) || 0;
    return bWeight - aWeight;
  });
}

function recommendLocalCourses(missingSkills) {
  const catalog = [
    { title: 'DSA Self Paced', provider: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/courses/dsa-self-paced', skills: ['DSA', 'Algorithms'] },
    { title: 'System Design Primer', provider: 'YouTube - Gaurav Sen', url: 'https://www.youtube.com/c/GauravSensei', skills: ['System Design'] },
    { title: 'React and TypeScript', provider: 'Frontend Masters', url: 'https://frontendmasters.com', skills: ['React', 'TypeScript'] },
    { title: 'SQL for Data Analysis', provider: 'Mode Analytics', url: 'https://mode.com/sql-tutorial/', skills: ['SQL'] },
    { title: 'AWS Cloud Practitioner', provider: 'AWS Skill Builder', url: 'https://explore.skillbuilder.aws/', skills: ['AWS'] },
  ];

  return catalog
    .map((course) => ({
      ...course,
      relevance: course.skills.filter((skill) => missingSkills.some((gap) => gap.toLowerCase() === skill.toLowerCase())).length,
    }))
    .filter((course) => course.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 6);
}

async function recommendCoursesFromSupabase(missingSkills) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return recommendLocalCourses(missingSkills);
  }

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .limit(200);

  if (error || !Array.isArray(data)) {
    return recommendLocalCourses(missingSkills);
  }

  const ranked = data
    .map((course) => {
      const courseSkills = Array.isArray(course.skills) ? course.skills : [];
      const relevance = courseSkills.filter((skill) =>
        missingSkills.some((gap) => String(gap).toLowerCase() === String(skill).toLowerCase()),
      ).length;

      return {
        id: course.id,
        title: course.title,
        provider: course.provider,
        url: course.url,
        skills: courseSkills,
        relevance,
        rating: course.rating || 0,
      };
    })
    .filter((course) => course.relevance > 0)
    .sort((a, b) => (b.relevance - a.relevance) || (Number(b.rating) - Number(a.rating)))
    .slice(0, 8);

  if (ranked.length === 0) {
    return recommendLocalCourses(missingSkills);
  }

  return ranked;
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
  const currentSkills = ensureArray(body.current_skills);
  const targetRole = String(body.target_role || 'software engineer');
  const roleSkills = getRoleSkills(targetRole);

  if (currentSkills.length === 0) {
    sendJson(res, 400, { error: 'current_skills must be a non-empty array' });
    return;
  }

  const { matched_skills: matchedSkills, missing_skills: missingSkills } = findMatchedAndMissingSkills(currentSkills, roleSkills);
  const scoring = scoreJobMatch(currentSkills, roleSkills);
  const priorityOrder = computePriorityOrder(missingSkills, roleSkills);
  const recommendedCourses = await recommendCoursesFromSupabase(missingSkills);

  const explanation = await generateGeminiText(
    `Current skills: ${currentSkills.join(', ')}
Target role: ${targetRole}
Required role skills: ${roleSkills.join(', ')}
Missing skills: ${missingSkills.join(', ')}
Similarity score: ${scoring.final_score}

Provide a concise skill-gap explanation and an ordered 3-step improvement plan.`,
    `You match ${matchedSkills.length} of ${roleSkills.length} core skills for ${targetRole}. Prioritize ${priorityOrder.slice(0, 3).join(', ')} next.`,
  );

  sendJson(res, 200, {
    target_role: targetRole,
    similarity_score: scoring.final_score,
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    priority_order: priorityOrder,
    recommended_courses: recommendedCourses,
    explanation,
  });
}

