import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

import { fileURLToPath } from 'url';

let devFallbackKey = null;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Structured diagnostic logger for security and verification events.
 * Redacts raw tokens, keys, credentials, and message content.
 */
export function logDiagnostic(category, details = {}) {
  const correlationId = details.correlationId || crypto.randomUUID().slice(0, 8);
  const sanitized = {
    timestamp: new Date().toISOString(),
    correlationId,
    category,
    endpoint: details.endpoint || 'unknown',
    clientIp: details.clientIp ? `${details.clientIp.slice(0, 7)}***` : undefined,
    reason: details.reason || undefined,
    expiredAt: details.expiredAt || undefined
  };

  // Ensure sensitive data is never present
  delete sanitized.hmacKey;
  delete sanitized.emailPass;
  delete sanitized.token;
  delete sanitized.altcha;
  delete sanitized.message;

  console.warn(`[SECURITY DIAGNOSTIC] [${category}] id=${correlationId}`, JSON.stringify(sanitized));
  return correlationId;
}

/**
 * Resolves a cryptographically validated HMAC key for Altcha.
 * - In production: strictly requires ALTCHA_HMAC_KEY in environment (fails closed if missing).
 * - In local development: uses a consistent filesystem-cached ephemeral session key
 *   shared across all child processes and worker threads without hardcoding secrets.
 */
export function getValidatedHmacKey() {
  const envKey = process.env.ALTCHA_HMAC_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim().length >= 16) {
    return envKey.trim();
  }

  // Production environment check: fail closed
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.CONTEXT === 'production' ||
    (process.env.NETLIFY === 'true' && process.env.CONTEXT !== 'dev');

  if (isProduction) {
    logDiagnostic('MISSING_CONFIG', {
      reason: 'ALTCHA_HMAC_KEY is missing or fewer than 16 characters in production context.'
    });
    return null;
  }

  // In-memory cache hit
  if (devFallbackKey) {
    return devFallbackKey;
  }

  // Consistent multi-process session key for local development
  try {
    const candidateDirs = [
      path.resolve(process.cwd(), 'node_modules', '.cache'),
      path.resolve(__dirname, '..', '..', 'node_modules', '.cache')
    ];
    let keyFile = null;
    let cacheDir = null;
    for (const dir of candidateDirs) {
      if (fs.existsSync(dir)) {
        cacheDir = dir;
        keyFile = path.join(dir, 'altcha-dev.key');
        break;
      }
    }
    if (!cacheDir) {
      cacheDir = candidateDirs[0];
      keyFile = path.join(cacheDir, 'altcha-dev.key');
    }

    if (keyFile && fs.existsSync(keyFile)) {
      const cached = fs.readFileSync(keyFile, 'utf8').trim();
      if (cached.length >= 32) {
        devFallbackKey = cached;
        return devFallbackKey;
      }
    }

    devFallbackKey = crypto.randomBytes(32).toString('hex');
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(keyFile, devFallbackKey, 'utf8');
    console.warn('[SECURITY NOTICE] ALTCHA_HMAC_KEY unset. Initialized consistent local development session key in node_modules/.cache/altcha-dev.key.');
    return devFallbackKey;
  } catch {
    if (!devFallbackKey) {
      devFallbackKey = crypto.randomBytes(32).toString('hex');
    }
    return devFallbackKey;
  }
}

/**
 * Validates cross-origin requests against trusted domains.
 * Permits production custom domains, local development, and legitimate Netlify deploy previews.
 */
export function isAllowedOrigin(origin) {
  if (!origin) return true; // Direct same-origin request without Origin header
  const normalized = origin.trim().toLowerCase();
  
  // Trusted production domains
  if (normalized === 'https://panav.xyz' || normalized === 'https://www.panav.xyz') {
    return true;
  }
  
  // Trusted local development domains
  if (/^http:\/\/localhost(:\d+)?$/.test(normalized) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(normalized)) {
    return true;
  }

  // Trusted Netlify deployment context URLs
  if (process.env.URL && normalized === process.env.URL.toLowerCase()) return true;
  if (process.env.DEPLOY_PRIME_URL && normalized === process.env.DEPLOY_PRIME_URL.toLowerCase()) return true;
  if (process.env.DEPLOY_URL && normalized === process.env.DEPLOY_URL.toLowerCase()) return true;
  if (process.env.SITE_NAME) {
    const siteRegex = new RegExp(`^https:\\/\\/([a-z0-9-]+--)?${process.env.SITE_NAME.toLowerCase()}\\.netlify\\.app$`);
    if (siteRegex.test(normalized)) return true;
  }

  // Trusted Netlify deploy previews and branch deploys for Panav portfolio
  if (
    /^https:\/\/([a-z0-9-]+--)?panav[a-z0-9-]*\.netlify\.app$/.test(normalized) ||
    /^https:\/\/deploy-preview-\d+--panav[a-z0-9-]*\.netlify\.app$/.test(normalized)
  ) {
    return true;
  }
  
  return false;
}

/**
 * Generates strict CORS and baseline security response headers.
 */
export function getCorsHeaders(origin, allowedMethods = 'GET, POST, OPTIONS') {
  const baseHeaders = {
    'Content-Type': 'application/json',
    'Vary': 'Origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY'
  };

  if (!origin) {
    return baseHeaders;
  }

  if (isAllowedOrigin(origin)) {
    return {
      ...baseHeaders,
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': allowedMethods,
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    };
  }

  return baseHeaders;
}

/**
 * Extracts the verified client IP from Netlify gateway headers.
 */
export function getClientIp(event) {
  const headers = event.headers || {};
  return (
    headers['x-nf-client-connection-ip'] ||
    headers['client-ip'] ||
    (headers['x-forwarded-for'] ? headers['x-forwarded-for'].split(',')[0].trim() : null) ||
    '127.0.0.1'
  );
}

/**
 * In-memory sliding rate limiter with capacity-bounded eviction.
 */
const rateLimitMap = new Map();
const MAX_RATE_LIMIT_ENTRIES = 5000;

export function checkRateLimit(key, maxRequests = 5, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  
  // Evict expired entries when capacity is approached
  if (rateLimitMap.size > MAX_RATE_LIMIT_ENTRIES) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetTime) {
        rateLimitMap.delete(k);
      }
    }
  }

  const record = rateLimitMap.get(key);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count, resetTime: record.resetTime };
}

