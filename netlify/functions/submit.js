import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import validator from 'validator';
import { z } from 'zod';
import { verifySolution, extractParams } from 'altcha-lib';
import { isDisposableDomain, isProfaneText } from './blocklists.js';
import { getValidatedHmacKey, getCorsHeaders, checkRateLimit, getClientIp, logDiagnostic } from './security.js';

dotenv.config();

// Bounded anti-replay token cache
const usedCaptchas = new Map();
const MAX_CACHE_ENTRIES = 1000;
const REPLAY_TTL_MS = 10 * 60 * 1000; // 10 minutes (aligned with challenge TTL)

function purgeExpiredCaptchas() {
  const now = Date.now();
  for (const [token, timestamp] of usedCaptchas.entries()) {
    if (now - timestamp > REPLAY_TTL_MS) {
      usedCaptchas.delete(token);
    }
  }
}

// Strict schema with defense against control characters, CRLF injection, and SMTP address escaping
const submissionSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, { message: 'Name must contain at least 2 characters' })
    .max(100, { message: 'Name must not exceed 100 characters' })
    .regex(/^[^\r\n\t\x00-\x1F\x7F]+$/, { message: 'Name contains invalid control characters' }),

  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .max(150, { message: 'Email must not exceed 150 characters' })
    .regex(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/, {
      message: 'A valid email address is required'
    })
    .refine((val) => {
      const domain = val.split('@')[1];
      return !isDisposableDomain(domain);
    }, { message: 'Disposable/burner email domains are prohibited.' }),

  message: z
    .string({ required_error: 'Message is required' })
    .trim()
    .min(5, { message: 'Message must contain at least 5 characters' })
    .max(2000, { message: 'Message must not exceed 2000 characters' }),

  altcha: z
    .string({ required_error: 'CAPTCHA verification token is required' })
    .trim()
    .min(1, { message: 'CAPTCHA verification token is required' })
    .max(4096, { message: 'CAPTCHA token exceeds maximum allowable length' }),

  _honeypot: z
    .string()
    .optional()
    .or(z.literal(''))
}).strict();

export async function handler(event) {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const corsHeaders = getCorsHeaders(origin, 'POST, OPTIONS');

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, code: 'METHOD_NOT_ALLOWED', message: 'Method Not Allowed' })
    };
  }

  const clientIp = getClientIp(event);

  // 1. Resource Exhaustion Defense: Restrict incoming body size (Max 20KB)
  if (event.body && event.body.length > 20480) {
    const correlationId = logDiagnostic('PAYLOAD_TOO_LARGE', { endpoint: 'submit', clientIp, size: event.body.length });
    return {
      statusCode: 413,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Payload exceeds maximum permissible size.',
        correlationId
      })
    };
  }

  // 2. Client IP Rate Limiting (Separate attempt throttling from successful send quota)
  const attemptLimit = checkRateLimit(`submit_attempt_${clientIp}`, 30, 60 * 60 * 1000);
  if (!attemptLimit.allowed) {
    const correlationId = logDiagnostic('RATE_LIMITED', { endpoint: 'submit', clientIp, type: 'attempts' });
    return {
      statusCode: 429,
      headers: {
        ...corsHeaders,
        'Retry-After': '3600'
      },
      body: JSON.stringify({
        success: false,
        code: 'RATE_LIMITED',
        message: 'Too many submission attempts from this IP. Please try again later.',
        correlationId
      })
    };
  }

  try {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      const correlationId = logDiagnostic('INVALID_PAYLOAD', { endpoint: 'submit', clientIp, reason: 'Malformed JSON' });
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          code: 'INVALID_PAYLOAD',
          message: 'Invalid JSON payload.',
          correlationId
        })
      };
    }

    const parseResult = submissionSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues?.[0]?.message || parseResult.error.errors?.[0]?.message || 'Invalid input provided.';
      const correlationId = logDiagnostic('INVALID_PAYLOAD', { endpoint: 'submit', clientIp, reason: firstError });
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          code: 'INVALID_PAYLOAD',
          message: firstError,
          correlationId
        })
      };
    }

    const { name, email, message, altcha, _honeypot } = parseResult.data;

    // 3. Honeypot check (Silent 200 OK drop)
    if (_honeypot && _honeypot.trim().length > 0) {
      logDiagnostic('HONEYPOT_TRIGGERED', { endpoint: 'submit', clientIp });
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true, message: 'Message sent successfully!' })
      };
    }

    // 4. Cryptographic Configuration Check (Fail closed if secret is unconfigured)
    const hmacKey = getValidatedHmacKey();
    if (!hmacKey) {
      const correlationId = logDiagnostic('MISSING_CONFIG', { endpoint: 'submit', clientIp });
      return {
        statusCode: 503,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          code: 'MISSING_CONFIG',
          message: 'Security verification service is temporarily unavailable.',
          correlationId
        })
      };
    }

    // 5. Altcha Parameter Extraction and Expiration Check
    let altchaParams = null;
    try {
      altchaParams = extractParams(altcha);
    } catch {
      const correlationId = logDiagnostic('INVALID_PAYLOAD', { endpoint: 'submit', clientIp, reason: 'Failed to decode Altcha token' });
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          code: 'INVALID_PAYLOAD',
          message: 'Invalid verification token format. Please re-verify.',
          correlationId
        })
      };
    }

    const expiresSec = altchaParams?.expires || altchaParams?.expire;
    if (expiresSec) {
      const expDate = new Date(parseInt(expiresSec, 10) * 1000);
      if (!Number.isNaN(expDate.getTime()) && expDate.getTime() < Date.now()) {
        const correlationId = logDiagnostic('EXPIRED_CHALLENGE', { endpoint: 'submit', clientIp, expiredAt: expDate.toISOString() });
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            success: false,
            code: 'EXPIRED_CHALLENGE',
            message: 'Security challenge has expired. Please verify the checkbox again.',
            correlationId
          })
        };
      }
    }

    // 6. Anti-Replay Check
    purgeExpiredCaptchas();
    if (usedCaptchas.has(altcha)) {
      const correlationId = logDiagnostic('REPLAY_REJECTED', { endpoint: 'submit', clientIp });
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          code: 'REPLAY_REJECTED',
          message: 'Verification token has already been used. Please re-verify.',
          correlationId
        })
      };
    }

    // 7. Cryptographic Proof-of-Work Verification
    let isSignatureValid = false;
    try {
      isSignatureValid = await verifySolution(altcha, hmacKey);
    } catch (cryptoErr) {
      const correlationId = logDiagnostic('SIGNATURE_FAILED', { endpoint: 'submit', clientIp, reason: cryptoErr.message });
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          code: 'SIGNATURE_FAILED',
          message: 'Security verification failed. Please try again.',
          correlationId
        })
      };
    }

    if (!isSignatureValid) {
      const correlationId = logDiagnostic('SIGNATURE_FAILED', { endpoint: 'submit', clientIp, reason: 'Hash or signature mismatch' });
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          code: 'SIGNATURE_FAILED',
          message: 'Invalid CAPTCHA solution. Please try again.',
          correlationId
        })
      };
    }

    // Record token into bounded anti-replay cache
    if (usedCaptchas.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = usedCaptchas.keys().next().value;
      if (oldestKey) usedCaptchas.delete(oldestKey);
    }
    usedCaptchas.set(altcha, Date.now());

    // 7. Profanity Shadow-Ban
    if (isProfaneText(name) || isProfaneText(message)) {
      logDiagnostic('PROFANITY_SHADOW_BAN', { endpoint: 'submit', clientIp });
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true, message: 'Message sent successfully!' })
      };
    }

    // 8. Verify SMTP Availability
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      const correlationId = logDiagnostic('SMTP_UNAVAILABLE', { endpoint: 'submit', clientIp });
      return {
        statusCode: 503,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          code: 'SMTP_UNAVAILABLE',
          message: 'Email service is temporarily unavailable. Please email directly at panav.p@proton.me.',
          correlationId
        })
      };
    }

    // 9. Send Email via Transporter
    const sanitizedHeaderName = name.replace(/[\r\n\t]/g, ' ').replace(/"/g, "'");
    const recipientEmail = (process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER || 'panav.p@proton.me').trim();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER?.trim(),
        pass: process.env.EMAIL_PASS?.replace(/\s+/g, '')
      }
    });

    const mailOptions = {
      from: `"${sanitizedHeaderName} (Portfolio)" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      replyTo: email,
      subject: `New Portfolio Message from ${sanitizedHeaderName}`,
      text: `Sender: ${name}\nEmail: ${email}\nClient IP: ${clientIp}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; line-height: 1.6; color: #111;">
          <h2 style="border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">New Portfolio Contact</h2>
          <p><strong>Name:</strong> ${validator.escape(name)}</p>
          <p><strong>Email:</strong> <a href="mailto:${validator.escape(email)}">${validator.escape(email)}</a></p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f7f7f7; border-left: 4px solid #3b82f6; padding: 12px; white-space: pre-wrap; font-family: monospace;">${validator.escape(message)}</div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (smtpErr) {
      const correlationId = logDiagnostic('SMTP_FAILED', { endpoint: 'submit', clientIp, reason: smtpErr.message });
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          code: 'SMTP_FAILED',
          message: 'Unable to deliver message at this time. Please email directly at panav.p@proton.me.',
          correlationId
        })
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, message: 'Message sent successfully!' })
    };
  } catch (error) {
    const correlationId = logDiagnostic('UNCAUGHT_SUBMISSION_ERROR', { endpoint: 'submit', clientIp, reason: error.message });
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        code: 'INTERNAL_ERROR',
        message: 'An unexpected internal error occurred.',
        correlationId
      })
    };
  }
}

