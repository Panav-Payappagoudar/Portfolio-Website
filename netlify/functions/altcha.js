import { createChallenge } from 'altcha-lib';

export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  try {
    const hmacKey = process.env.ALTCHA_HMAC_KEY || process.env.EMAIL_PASS || 'altcha-prod-hmac-panav-portfolio-secure-key-2025';
    const challenge = await createChallenge({
      hmacKey,
      maxNumber: 50000,
      expires: new Date(Date.now() + 15 * 60 * 1000)
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(challenge)
    };
  } catch (error) {
    console.error('[ALTCHA ERROR]', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Failed to generate challenge' })
    };
  }
}
