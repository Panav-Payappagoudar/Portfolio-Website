import { handler as altchaHandler } from './altcha.js';
import { handler as submitHandler } from './submit.js';
import { getCorsHeaders } from './security.js';

/**
 * Legacy /api/* router consolidating all traffic onto the canonical altcha and submit handlers
 * so challenge validation, rate limiting, and anti-replay caches remain single-source-of-truth.
 */
export async function handler(event) {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const rawPath = (event.path || event.rawUrl || '').split('?')[0].replace(/\/+$/, '');

  if (rawPath.endsWith('/altcha')) {
    return altchaHandler(event);
  }

  if (rawPath.endsWith('/submit')) {
    return submitHandler(event);
  }

  return {
    statusCode: 404,
    headers: getCorsHeaders(origin, 'GET, POST, OPTIONS'),
    body: JSON.stringify({ success: false, message: 'Resource not found.' })
  };
}
