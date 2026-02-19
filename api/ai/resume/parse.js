import pdfParse from 'pdf-parse';
import { assertMethod, sendJson } from '../../_lib/http.js';
import { requireAuth } from '../../_lib/auth.js';
import { parseResumeText } from '../../_lib/nlp.js';
import { generateGeminiJson } from '../../_lib/gemini.js';

function toObjectBody(req) {
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

function decodeBase64File(rawBase64) {
  if (!rawBase64 || typeof rawBase64 !== 'string') {
    return null;
  }

  const cleaned = rawBase64.includes(',') ? rawBase64.split(',').pop() : rawBase64;
  if (!cleaned) {
    return null;
  }

  try {
    return Buffer.from(cleaned, 'base64');
  } catch {
    return null;
  }
}

function fallbackSummary(parsed) {
  const topSkills = parsed.skills.slice(0, 6).join(', ') || 'general technical skills';
  return `Candidate profile highlights ${topSkills}. Experience level appears ${parsed.experience_level}.`;
}

export default async function handler(req, res) {
  if (!assertMethod(req, res, ['POST', 'OPTIONS'])) {
    return;
  }

  const auth = await requireAuth(req, res, ['student', 'employer', 'admin']);
  if (!auth) {
    return;
  }

  const body = toObjectBody(req);
  const { text, fileBase64, fileName = '' } = body;
  let resumeText = typeof text === 'string' ? text : '';

  if (!resumeText && fileBase64) {
    const buffer = decodeBase64File(fileBase64);
    if (!buffer) {
      sendJson(res, 400, { error: 'Invalid file payload' });
      return;
    }

    const normalizedFileName = String(fileName || '').toLowerCase();
    const isPdf = normalizedFileName.endsWith('.pdf') || buffer.slice(0, 4).toString() === '%PDF';

    if (isPdf) {
      try {
        const parsed = await pdfParse(buffer);
        resumeText = parsed.text || '';
      } catch {
        sendJson(res, 400, { error: 'Unable to parse PDF content' });
        return;
      }
    } else {
      resumeText = buffer.toString('utf8');
    }
  }

  if (!resumeText || !resumeText.trim()) {
    sendJson(res, 400, { error: 'Either text or fileBase64 is required' });
    return;
  }

  const parsed = parseResumeText(resumeText);

  const aiSummary = await generateGeminiJson(
    `You are an expert resume analyst.
Return valid JSON with this shape:
{
  "summary": "2-3 sentence summary",
  "suggested_roles": ["role 1", "role 2", "role 3"],
  "confidence_score": 0.0
}

Use this extracted profile:
skills: ${JSON.stringify(parsed.skills)}
education: ${JSON.stringify(parsed.education)}
experience: ${JSON.stringify(parsed.experience)}
contact: ${JSON.stringify(parsed.contact_details)}
`,
    {},
  );

  const response = {
    ...parsed,
    summary: typeof aiSummary.summary === 'string' ? aiSummary.summary : fallbackSummary(parsed),
    suggested_roles: Array.isArray(aiSummary.suggested_roles) && aiSummary.suggested_roles.length > 0
      ? aiSummary.suggested_roles
      : parsed.suggested_roles,
    confidence_score:
      typeof aiSummary.confidence_score === 'number'
        ? Math.max(0, Math.min(1, aiSummary.confidence_score))
        : parsed.confidence_score,
  };

  sendJson(res, 200, response);
}

