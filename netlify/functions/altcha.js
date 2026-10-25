import { createChallenge } from 'altcha-lib';
import { getValidatedHmacKey, getCorsHeaders, checkRateLimit, getClientIp, logDiagnostic } from './security.js';

export async function handler(event) {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const corsHeaders = {
    ...getCorsHeaders(origin, 'GET, OPTIONS'),
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, code: 'METHOD_NOT_ALLOWED', message: 'Method Not Allowed' })
    };
  }

  const clientIp = getClientIp(event);

  // Rate limit: max 120 challenges per 15 minutes per client IP
  const rateLimitResult = checkRateLimit(`altcha_${clientIp}`, 120, 15 * 60 * 1000);
  if (!rateLimitResult.allowed) {
    const correlationId = logDiagnostic('RATE_LIMITED', { endpoint: 'altcha', clientIp });
    return {
      statusCode: 429,
      headers: {
        ...corsHeaders,
        'Retry-After': '900'
      },
      body: JSON.stringify({
        success: false,
        code: 'RATE_LIMITED',
        message: 'Too many challenge requests. Please try again later.',
        correlationId
      })
    };
  }

  try {
    const hmacKey = getValidatedHmacKey();
    if (!hmacKey) {
      const correlationId = logDiagnostic('MISSING_CONFIG', { endpoint: 'altcha', clientIp });
      return {
        statusCode: 503,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          code: 'MISSING_CONFIG',
          message: 'Security challenge configuration is unavailable.',
          correlationId
        })
      };
    }

    const challenge = await createChallenge({
      hmacKey,
      maxNumber: 50000,
      expires: new Date(Date.now() + 10 * 60 * 1000) // 10-minute validity
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(challenge)
    };
  } catch (error) {
    const correlationId = logDiagnostic('CHALLENGE_GEN_FAILED', { endpoint: 'altcha', clientIp, reason: error.message });
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        code: 'CHALLENGE_GEN_FAILED',
        message: 'Failed to generate security challenge.',
        correlationId
      })
    };
  }
}

