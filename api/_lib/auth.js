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

async function extractRoleFromProfile(supabase, authUserId) {
  if (!supabase || !authUserId) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('clerk_user_id', authUserId)
      .maybeSingle();

    if (error || !data?.role) {
      return null;
    }

    return normalizeRole(data.role);
  } catch {
    return null;
  }
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

  const roleFromProfile = await extractRoleFromProfile(supabase, data.user.id);
  const resolvedRole = roleFromProfile || extractRoleFromSupabaseUser(data.user);

  return {
    token,
    userId: data.user.id,
    role: resolvedRole,
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
