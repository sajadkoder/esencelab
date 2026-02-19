import { verifyToken } from '@clerk/backend';
import { sendJson } from './http.js';

const ROLE_ALIASES = {
  recruiter: 'employer',
  student: 'student',
  employer: 'employer',
  admin: 'admin',
};

function normalizeRole(rawRole) {
  if (!rawRole || typeof rawRole !== 'string') {
    return 'student';
  }

  return ROLE_ALIASES[rawRole.toLowerCase()] || 'student';
}

function readBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }

  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  return token || null;
}

function decodeJwtPayloadWithoutVerify(token) {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) {
      return null;
    }
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payload = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

function extractRole(payload) {
  if (!payload || typeof payload !== 'object') {
    return 'student';
  }

  const metadataRole =
    payload.public_metadata?.role ||
    payload.metadata?.role ||
    payload.unsafe_metadata?.role ||
    payload.unsafeMetadata?.role;

  return normalizeRole(metadataRole || payload.role);
}

function extractUserId(payload) {
  return payload?.sub || payload?.user_id || payload?.userId || null;
}

export async function readAuthContext(req) {
  const token = readBearerToken(req);
  if (!token) {
    return null;
  }

  const clerkSecretKey = process.env.CLERK_SECRET_KEY;

  if (!clerkSecretKey) {
    const payload = decodeJwtPayloadWithoutVerify(token);
    if (!payload) {
      return null;
    }

    return {
      token,
      userId: extractUserId(payload),
      role: extractRole(payload),
      payload,
      verified: false,
    };
  }

  try {
    const payload = await verifyToken(token, { secretKey: clerkSecretKey });
    return {
      token,
      userId: extractUserId(payload),
      role: extractRole(payload),
      payload,
      verified: true,
    };
  } catch {
    return null;
  }
}

export async function requireAuth(req, res, allowedRoles = []) {
  const auth = await readAuthContext(req);
  if (!auth?.userId) {
    sendJson(res, 401, { error: 'Unauthorized' });
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(auth.role)) {
    sendJson(res, 403, { error: 'Forbidden', required_roles: allowedRoles });
    return null;
  }

  return auth;
}

