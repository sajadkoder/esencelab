const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

function geminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
}

function extractTextFromGeminiResponse(payload) {
  const candidates = payload?.candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return '';
  }

  const parts = candidates[0]?.content?.parts;
  if (!Array.isArray(parts) || parts.length === 0) {
    return '';
  }

  return parts.map((part) => part.text || '').join('\n').trim();
}

function parseJsonFromText(text) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first === -1 || last === -1 || first >= last) {
      return null;
    }

    try {
      return JSON.parse(text.slice(first, last + 1));
    } catch {
      return null;
    }
  }
}

export async function generateGeminiText(prompt, fallbackText = '') {
  const key = geminiApiKey();
  if (!key) {
    return fallbackText;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 768,
        },
      }),
    });

    if (!response.ok) {
      return fallbackText;
    }

    const payload = await response.json();
    return extractTextFromGeminiResponse(payload) || fallbackText;
  } catch {
    return fallbackText;
  }
}

export async function generateGeminiJson(prompt, fallbackValue = {}) {
  const responseText = await generateGeminiText(prompt, '');
  if (!responseText) {
    return fallbackValue;
  }

  const parsed = parseJsonFromText(responseText);
  if (!parsed || typeof parsed !== 'object') {
    return fallbackValue;
  }

  return parsed;
}

