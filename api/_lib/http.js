const DEFAULT_ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS.join(', '));
}

export function handlePreflight(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

export function sendJson(res, statusCode, payload) {
  setCorsHeaders(res);
  res.status(statusCode).json(payload);
}

export function methodNotAllowed(req, res, allowedMethods) {
  sendJson(res, 405, {
    error: `Method ${req.method} not allowed`,
    allowed: allowedMethods,
  });
}

export function assertMethod(req, res, allowedMethods) {
  if (handlePreflight(req, res)) {
    return false;
  }

  if (!allowedMethods.includes(req.method)) {
    methodNotAllowed(req, res, allowedMethods);
    return false;
  }

  return true;
}

