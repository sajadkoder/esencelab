import pdfParse from 'pdf-parse';
import { assertMethod, sendJson } from '../../_lib/http.js';
import { requireAuth } from '../../_lib/auth.js';
import { parseResumeText } from '../../_lib/nlp.js';
import { generateGeminiJson } from '../../_lib/gemini.js';

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

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

function readContentType(req) {
  const headerValue = req.headers['content-type'] || req.headers['Content-Type'];
  return String(headerValue || '').toLowerCase();
}

function decodeHeaderValue(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

async function readRawRequestBuffer(req, maxBytes = MAX_UPLOAD_BYTES) {
  if (Buffer.isBuffer(req.body)) {
    if (req.body.length > maxBytes) {
      return { error: 'too_large' };
    }
    return { buffer: req.body };
  }

  if (req.body && req.body instanceof Uint8Array) {
    const buffer = Buffer.from(req.body);
    if (buffer.length > maxBytes) {
      return { error: 'too_large' };
    }
    return { buffer };
  }

  if (typeof req.body === 'string') {
    const buffer = Buffer.from(req.body, 'utf8');
    if (buffer.length > maxBytes) {
      return { error: 'too_large' };
    }
    return { buffer };
  }

  const chunks = [];
  let total = 0;

  for await (const chunk of req) {
    const chunkBuffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += chunkBuffer.length;
    if (total > maxBytes) {
      return { error: 'too_large' };
    }
    chunks.push(chunkBuffer);
  }

  return { buffer: Buffer.concat(chunks) };
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
        sendJson(res, 400, { error: 'Unable to parse PDF content. Try a text-based PDF or TXT file.' });
        return;
      }
    } else {
      resumeText = buffer.toString('utf8');
    }
  }

  if (!resumeText) {
    const contentType = readContentType(req);
    const expectsBinaryUpload = contentType.includes('application/pdf')
      || contentType.includes('application/octet-stream')
      || contentType.includes('text/plain');

    if (expectsBinaryUpload) {
      const rawResult = await readRawRequestBuffer(req);
      if (rawResult.error === 'too_large') {
        sendJson(res, 413, { error: 'Resume file too large. Upload a file under 4 MB.' });
        return;
      }

      const rawBuffer = rawResult.buffer;
      if (rawBuffer && rawBuffer.length > 0) {
        const headerFileName = decodeHeaderValue(req.headers['x-file-name'] || req.headers['X-File-Name']);
        const headerMimeType = decodeHeaderValue(req.headers['x-file-mime'] || req.headers['X-File-Mime']);
        const inferredFileName = String(headerFileName || fileName || '').toLowerCase();
        const inferredMimeType = String(headerMimeType || contentType || '').toLowerCase();
        const isTextFile = inferredMimeType.includes('text/plain') || inferredFileName.endsWith('.txt');
        const isPdf = inferredMimeType.includes('application/pdf')
          || inferredFileName.endsWith('.pdf')
          || rawBuffer.slice(0, 4).toString() === '%PDF';

        if (isTextFile) {
          resumeText = rawBuffer.toString('utf8');
        } else if (isPdf) {
          try {
            const parsed = await pdfParse(rawBuffer);
            resumeText = parsed.text || '';
          } catch {
            sendJson(res, 400, { error: 'Unable to parse PDF content. Try a text-based PDF or TXT file.' });
            return;
          }
        } else {
          resumeText = rawBuffer.toString('utf8');
        }
      }
    }
  }

  if (!resumeText || !resumeText.trim()) {
    sendJson(res, 400, { error: 'Resume text is empty. Provide text or upload a valid PDF/TXT resume.' });
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
