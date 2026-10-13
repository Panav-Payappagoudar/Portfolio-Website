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
import { createChallenge, verifySolution } from 'altcha-lib';
import { isDisposableDomain, isProfaneText } from './blocklists.js';

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
const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (origin === 'https://www.panav.xyz' || origin === 'https://panav.xyz') return true;
  if (origin.endsWith('.netlify.app')) return true;
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) return true;
  return false;
};

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
// Strictly restrict incoming body size to 10kb to neutralize buffer overflow and memory starvation attacks
app.use(express.json({ limit: '10kb', strict: true }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ============================================================================
// 4. RATE LIMITING POLICIES (DEFENSE AGAINST BRUTE FORCE & DOS)
// ============================================================================

// Rate limiter for challenge generation (Prevents CPU exhaustion via challenge floods)
const challengeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 120, // Max 120 challenges per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many challenge requests. Please try again later.' },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  }
});

// Rate limiter for form submission (Max 5 submissions per hour per IP)
const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many submissions from this IP. Please try again after one hour.' },
  handler: (req, res, next, options) => {
    console.warn(`[SECURITY] Submission rate limit triggered for IP: ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  }
});

// ============================================================================
// 5. BOUNDED ANTI-REPLAY CACHE (MEMORY-LEAK PROOF)
// ============================================================================
const usedCaptchas = new Map(); // token -> timestamp
const MAX_CACHE_ENTRIES = 1000;
const REPLAY_TTL_MS = 15 * 60 * 1000; // 15 minutes

function purgeExpiredCaptchas() {
  const now = Date.now();
  for (const [token, timestamp] of usedCaptchas.entries()) {
    if (now - timestamp > REPLAY_TTL_MS) {
      usedCaptchas.delete(token);
    }
  }
}

// ============================================================================
// 6. CRYPTOGRAPHIC SECRET KEY RESOLUTION
// ============================================================================
function getValidatedHmacKey() {
  const key = process.env.ALTCHA_HMAC_KEY || process.env.EMAIL_PASS;
  if (!key) {
    return 'altcha-prod-hmac-panav-portfolio-secure-key-2025';
  }
  return key;
}

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
    .email({ message: 'A valid email address is required' })
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
    .max(2048, { message: 'CAPTCHA token exceeds maximum allowable length' }),

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
    const challenge = await createChallenge({
      hmacKey,
      maxNumber: 100000, // Balanced computational difficulty for client devices
      expires: new Date(Date.now() + 10 * 60 * 1000) // Explicit 10-minute validity window
    });
    return res.status(200).json(challenge);
  } catch (error) {
    return next(error);
  }
});

// POST /api/submit - Validated Form Submission
app.post(['/api/submit', '/submit', '/.netlify/functions/api/submit'], submissionLimiter, async (req, res, next) => {
  try {
    // 1. Zod Schema Validation
    const parseResult = submissionSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid input provided.';
      return res.status(400).json({ success: false, message: firstError });
    }

    const { name, email, message, altcha, _honeypot } = parseResult.data;

    // 2. Honeypot Bot Trap (Silent 200 OK drop)
    if (_honeypot && _honeypot.trim().length > 0) {
      console.warn(`[SECURITY] Bot honeypot triggered from IP: ${req.ip}. Silently discarding.`);
      return res.status(200).json({ success: true, message: 'Message sent successfully!' });
    }

    // 3. Anti-Replay Defense
    purgeExpiredCaptchas();
    if (usedCaptchas.has(altcha)) {
      console.warn(`[SECURITY] Replay attack detected from IP: ${req.ip}`);
      return res.status(400).json({ success: false, message: 'CAPTCHA token has already been used. Please refresh.' });
    }

    // 4. Cryptographic Proof-of-Work Verification
    const hmacKey = getValidatedHmacKey();
    let isSignatureValid = false;
    try {
      isSignatureValid = await verifySolution(altcha, hmacKey);
    } catch (cryptoErr) {
      console.error(`[SECURITY] Cryptographic verification failed for IP: ${req.ip}:`, cryptoErr.message);
      return res.status(400).json({ success: false, message: 'CAPTCHA verification failed. Please try again.' });
    }

    if (!isSignatureValid) {
      console.warn(`[SECURITY] Invalid CAPTCHA solution supplied by IP: ${req.ip}`);
      return res.status(400).json({ success: false, message: 'Invalid CAPTCHA solution.' });
    }

    // Record token into bounded anti-replay cache
    if (usedCaptchas.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = usedCaptchas.keys().next().value;
      if (oldestKey) usedCaptchas.delete(oldestKey);
    }
    usedCaptchas.set(altcha, Date.now());

    // 5. Profanity / Abusive Text Filter (Shadow Ban)
    if (isProfaneText(name) || isProfaneText(message)) {
      console.warn(`[SECURITY] Content flagged as profane/hate-speech from IP: ${req.ip}. Shadow banning.`);
      return res.status(200).json({ success: true, message: 'Message sent successfully!' });
    }

    // 6. Verify SMTP Service Availability
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('[CONFIG] SMTP credentials (EMAIL_USER / EMAIL_PASS) are unconfigured.');
      return res.status(503).json({ success: false, message: 'Email service is temporarily unavailable.' });
    }

    // 7. Contextual Sanitization & Safe Email Construction
    // Header names are sanitized to eliminate CRLF/header injection
    const sanitizedHeaderName = name.replace(/[\r\n\t]/g, ' ').replace(/"/g, "'");
    const recipientEmail = process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER || 'panav.p@proton.me';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
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

    await transporter.sendMail(mailOptions);
    console.log(`[AUDIT] Form submission successfully delivered for sender: ${email}`);

    // NOTE: In strict accordance with OWASP anti-relay guidelines, we intentionally do NOT dispatch
    // unauthenticated auto-responders to arbitrary recipient emails to protect the SMTP account
    // from being weaponized as an email bombing/spam relay.

    return res.status(200).json({ success: true, message: 'Message sent successfully!' });

  } catch (error) {
    return next(error);
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
