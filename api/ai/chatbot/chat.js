import { assertMethod, sendJson } from '../../_lib/http.js';
import { requireAuth } from '../../_lib/auth.js';
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

function fallbackResponse(message) {
  const lowered = message.toLowerCase();
  if (lowered.includes('resume')) {
    return 'Focus your resume on impact: use quantified outcomes, list role-relevant skills first, and keep each bullet action-oriented.';
  }
  if (lowered.includes('interview')) {
    return 'Prepare by practicing DSA daily, reviewing one system design case per week, and drafting STAR stories for behavioral rounds.';
  }
  if (lowered.includes('course') || lowered.includes('learn')) {
    return 'Prioritize one core skill gap at a time, pair a structured course with weekly hands-on projects, and track progress with milestones.';
  }
  return 'I can help with resume improvement, interview preparation, skill-roadmaps, and job strategy. Tell me your target role and current skills.';
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
  const message = String(body.message || '').trim();
  const context = body.context && typeof body.context === 'object' ? body.context : {};
  const history = Array.isArray(body.history) ? body.history.slice(-6) : [];

  if (!message) {
    sendJson(res, 400, { error: 'message is required' });
    return;
  }

  const prompt = `You are Esencelab's career assistant.
User role: ${auth.role}
User context: ${JSON.stringify(context)}
Recent history: ${JSON.stringify(history)}

Give practical, concise, actionable career advice tailored to campus recruitment and early-career hiring.
User message: ${message}`;

  const responseText = await generateGeminiText(prompt, fallbackResponse(message));

  sendJson(res, 200, {
    response: responseText,
    timestamp: new Date().toISOString(),
  });
}

