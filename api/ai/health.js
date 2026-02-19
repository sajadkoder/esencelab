import { assertMethod, sendJson } from '../_lib/http.js';

export default async function handler(req, res) {
  if (!assertMethod(req, res, ['GET', 'OPTIONS'])) {
    return;
  }

  sendJson(res, 200, {
    status: 'ok',
    service: 'esencelab-ai-serverless',
    runtime: 'nodejs',
    timestamp: new Date().toISOString(),
  });
}

