import { sendJson } from './http.js';
import { getSupabaseClient } from './supabase.js';

const ROLE_ALIASES = {
  recruiter: 'employer',
  employer: 'employer',
  student: 'student',
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

function extractRoleFromSupabaseUser(user) {
  if (!user || typeof user !== 'object') {
    return 'student';
  }

  const appRole = user.app_metadata?.role;
  const userRole = user.user_metadata?.role;
  return normalizeRole(appRole || userRole || user.role);
}

export async function readAuthContext(req) {
  const token = readBearerToken(req);
  if (!token) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user?.id) {
    return null;
  }

  return {
    token,
    userId: data.user.id,
    role: extractRoleFromSupabaseUser(data.user),
    email: data.user.email || null,
    payload: data.user,
    verified: true,
  };
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
