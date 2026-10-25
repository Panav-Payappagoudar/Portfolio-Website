/* global process */
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import validator from 'validator';
import { z } from 'zod';
import { createChallenge, verifySolution, extractParams } from 'altcha-lib';
import { isDisposableDomain, isProfaneText } from './blocklists.js';
import { isAllowedOrigin, getValidatedHmacKey, logDiagnostic } from './security.js';

dotenv.config();

const app = express();

// ============================================================================
// 1. ARCHITECTURAL SECURITY & TRUSTED PROXY CONFIGURATION
// ============================================================================
// Netlify Functions execute behind AWS Lambda / Netlify API Gateway reverse proxies.
// Trusting the first hop ensures `req.ip` reflects the actual client IP for rate limiting.
app.set('trust proxy', 1);

// Disable X-Powered-By header to eliminate server technology fingerprinting
app.disable('x-powered-by');

// Apply Helmet security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ============================================================================
// 2. STRICT CORS (CROSS-ORIGIN RESOURCE SHARING) POLICY
// ============================================================================
// Validated via shared security module to eliminate blanket *.netlify.app wildcard trust.


app.use(cors({
  origin: function (origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400 // Cache preflight response for 24 hours
}));

// ============================================================================
// 3. RESOURCE EXHAUSTION DEFENSE (PAYLOAD SIZE LIMITS)
// ============================================================================
// Strictly restrict incoming body size to 20kb to neutralize buffer overflow and memory starvation attacks
app.use(express.json({ limit: '20kb', strict: true }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));

// ============================================================================
// 4. RATE LIMITING POLICIES (DEFENSE AGAINST BRUTE FORCE & DOS)
// ============================================================================

// Rate limiter for challenge generation (Prevents CPU exhaustion via challenge floods)
const challengeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 120, // Max 120 challenges per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, code: 'RATE_LIMITED', message: 'Too many challenge requests. Please try again later.' },
  handler: (req, res, next, options) => {
    const correlationId = logDiagnostic('RATE_LIMITED', { endpoint: 'api/altcha', clientIp: req.ip });
    res.status(options.statusCode).json({ ...options.message, correlationId });
  }
});

// Rate limiter for form submission attempts (Max 30 attempts per hour per IP)
const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, code: 'RATE_LIMITED', message: 'Too many submissions from this IP. Please try again after one hour.' },
  handler: (req, res, next, options) => {
    const correlationId = logDiagnostic('RATE_LIMITED', { endpoint: 'api/submit', clientIp: req.ip });
    res.status(options.statusCode).json({ ...options.message, correlationId });
  }
});

// ============================================================================
// 5. BOUNDED ANTI-REPLAY CACHE (MEMORY-LEAK PROOF)
// ============================================================================
const usedCaptchas = new Map(); // token -> timestamp
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

// ============================================================================
// 6. CRYPTOGRAPHIC SECRET KEY RESOLUTION (DELEGATED TO SECURITY MODULE)
// ============================================================================
// Uses getValidatedHmacKey() from ./security.js to prevent credential reuse and hardcoded secrets.


// ============================================================================
// 7. ZOD INPUT VALIDATION SCHEMA (INJECTION & XSS DEFENSE)
// ============================================================================
// Uses strict typing, boundary limits, and regex controls to guarantee
// no SQL, NoSQL, HTML, or SMTP Header Injection can manifest.
const submissionSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, { message: 'Name must contain at least 2 characters' })
    .max(100, { message: 'Name must not exceed 100 characters' })
    // Regex mathematically enforces that no CRLF, null bytes, or ASCII control characters exist
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
    }, { message: 'Disposable/burner email domains are prohibited. Please use a permanent email address.' }),

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
}).strict(); // Rejects unmapped attributes (prevents Mass Assignment & Prototype Pollution)

// ============================================================================
// 8. API ENDPOINTS
// ============================================================================

// GET /api/altcha - Generate Cryptographic Proof-of-Work Challenge
app.get(['/api/altcha', '/altcha', '/.netlify/functions/api/altcha'], challengeLimiter, async (req, res, next) => {
  try {
    const hmacKey = getValidatedHmacKey();
    if (!hmacKey) {
      const correlationId = logDiagnostic('MISSING_CONFIG', { endpoint: 'api/altcha', clientIp: req.ip });
      return res.status(503).json({
        success: false,
        code: 'MISSING_CONFIG',
        message: 'Security challenge configuration is unavailable.',
        correlationId
      });
    }
    const challenge = await createChallenge({
      hmacKey,
      maxNumber: 50000, // Balanced computational difficulty for client devices
      expires: new Date(Date.now() + 10 * 60 * 1000) // Explicit 10-minute validity window
    });
    return res.status(200).json(challenge);
  } catch (error) {
    const correlationId = logDiagnostic('CHALLENGE_GEN_FAILED', { endpoint: 'api/altcha', clientIp: req.ip, reason: error.message });
    return res.status(500).json({
      success: false,
      code: 'CHALLENGE_GEN_FAILED',
      message: 'Failed to generate security challenge.',
      correlationId
    });
  }
});

// POST /api/submit - Validated Form Submission
app.post(['/api/submit', '/submit', '/.netlify/functions/api/submit'], submissionLimiter, async (req, res, next) => {
  try {
    // 1. Zod Schema Validation
    const parseResult = submissionSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues?.[0]?.message || parseResult.error.errors?.[0]?.message || 'Invalid input provided.';
      const correlationId = logDiagnostic('INVALID_PAYLOAD', { endpoint: 'api/submit', clientIp: req.ip, reason: firstError });
      return res.status(400).json({ success: false, code: 'INVALID_PAYLOAD', message: firstError, correlationId });
    }

    const { name, email, message, altcha, _honeypot } = parseResult.data;

    // 2. Honeypot Bot Trap (Silent 200 OK drop)
    if (_honeypot && _honeypot.trim().length > 0) {
      logDiagnostic('HONEYPOT_TRIGGERED', { endpoint: 'api/submit', clientIp: req.ip });
      return res.status(200).json({ success: true, message: 'Message sent successfully!' });
    }

    // 3. Cryptographic Configuration Check (Fail closed if secret is unconfigured)
    const hmacKey = getValidatedHmacKey();
    if (!hmacKey) {
      const correlationId = logDiagnostic('MISSING_CONFIG', { endpoint: 'api/submit', clientIp: req.ip });
      return res.status(503).json({
        success: false,
        code: 'MISSING_CONFIG',
        message: 'Security verification service temporarily unavailable.',
        correlationId
      });
    }

    // 4. Altcha Parameter Extraction and Expiration Check
    let altchaParams = null;
    try {
      altchaParams = extractParams(altcha);
    } catch {
      const correlationId = logDiagnostic('INVALID_PAYLOAD', { endpoint: 'api/submit', clientIp: req.ip, reason: 'Failed to decode Altcha token' });
      return res.status(400).json({
        success: false,
        code: 'INVALID_PAYLOAD',
        message: 'Invalid verification token format. Please re-verify.',
        correlationId
      });
    }

    const expiresSec = altchaParams?.expires || altchaParams?.expire;
    if (expiresSec) {
      const expDate = new Date(parseInt(expiresSec, 10) * 1000);
      if (!Number.isNaN(expDate.getTime()) && expDate.getTime() < Date.now()) {
        const correlationId = logDiagnostic('EXPIRED_CHALLENGE', { endpoint: 'api/submit', clientIp: req.ip, expiredAt: expDate.toISOString() });
        return res.status(400).json({
          success: false,
          code: 'EXPIRED_CHALLENGE',
          message: 'Security challenge has expired. Please verify the checkbox again.',
          correlationId
        });
      }
    }

    // 5. Anti-Replay Defense
    purgeExpiredCaptchas();
    if (usedCaptchas.has(altcha)) {
      const correlationId = logDiagnostic('REPLAY_REJECTED', { endpoint: 'api/submit', clientIp: req.ip });
      return res.status(400).json({
        success: false,
        code: 'REPLAY_REJECTED',
        message: 'Verification token has already been used. Please re-verify.',
        correlationId
      });
    }

    // 6. Cryptographic Proof-of-Work Verification
    let isSignatureValid = false;
    try {
      isSignatureValid = await verifySolution(altcha, hmacKey);
    } catch (cryptoErr) {
      const correlationId = logDiagnostic('SIGNATURE_FAILED', { endpoint: 'api/submit', clientIp: req.ip, reason: cryptoErr.message });
      return res.status(400).json({
        success: false,
        code: 'SIGNATURE_FAILED',
        message: 'Security verification failed. Please try again.',
        correlationId
      });
    }

    if (!isSignatureValid) {
      const correlationId = logDiagnostic('SIGNATURE_FAILED', { endpoint: 'api/submit', clientIp: req.ip, reason: 'Hash or signature mismatch' });
      return res.status(400).json({
        success: false,
        code: 'SIGNATURE_FAILED',
        message: 'Invalid CAPTCHA solution. Please try again.',
        correlationId
      });
    }

    // Record token into bounded anti-replay cache
    if (usedCaptchas.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = usedCaptchas.keys().next().value;
      if (oldestKey) usedCaptchas.delete(oldestKey);
    }
    usedCaptchas.set(altcha, Date.now());

    // 6. Profanity / Abusive Text Filter (Shadow Ban)
    if (isProfaneText(name) || isProfaneText(message)) {
      logDiagnostic('PROFANITY_SHADOW_BAN', { endpoint: 'api/submit', clientIp: req.ip });
      return res.status(200).json({ success: true, message: 'Message sent successfully!' });
    }

    // 7. Verify SMTP Service Availability
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      const correlationId = logDiagnostic('SMTP_UNAVAILABLE', { endpoint: 'api/submit', clientIp: req.ip });
      return res.status(503).json({
        success: false,
        code: 'SMTP_UNAVAILABLE',
        message: 'Email service is temporarily unavailable. Please email directly at panav.p@proton.me.',
        correlationId
      });
    }

    // 7. Contextual Sanitization & Safe Email Construction
    // Header names are sanitized to eliminate CRLF/header injection
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
      text: `Sender: ${name}\nEmail: ${email}\nClient IP: ${req.ip}\n\nMessage:\n${message}`,
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
      const correlationId = logDiagnostic('SMTP_FAILED', { endpoint: 'api/submit', clientIp: req.ip, reason: smtpErr.message });
      return res.status(500).json({
        success: false,
        code: 'SMTP_FAILED',
        message: 'Unable to deliver message at this time. Please email directly at panav.p@proton.me.',
        correlationId
      });
    }

    return res.status(200).json({ success: true, message: 'Message sent successfully!' });

  } catch (error) {
    const correlationId = logDiagnostic('UNCAUGHT_SUBMISSION_ERROR', { endpoint: 'api/submit', clientIp: req.ip, reason: error.message });
    return res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'An unexpected internal error occurred.',
      correlationId
    });
  }
});

// Explicit 404 handler for unauthorized / probing paths
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found.' });
});

// ============================================================================
// 9. CENTRALIZED ERROR HANDLING MIDDLEWARE
// ============================================================================
// Suppresses all internal stack traces, database states, and operational details
app.use((err, req, res, next) => {
  console.error('[UNCAUGHT API EXCEPTION]', err.message);
  res.status(500).json({ success: false, message: 'An internal server error occurred.' });
});

export const handler = serverless(app);
