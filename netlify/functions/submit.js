import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import validator from 'validator';
import { z } from 'zod';
import { verifySolution } from 'altcha-lib';
import { isDisposableDomain, isProfaneText } from './blocklists.js';

dotenv.config();

const usedCaptchas = new Map();
const MAX_CACHE_ENTRIES = 1000;
const REPLAY_TTL_MS = 15 * 60 * 1000;

function purgeExpiredCaptchas() {
  const now = Date.now();
  for (const [token, timestamp] of usedCaptchas.entries()) {
    if (now - timestamp > REPLAY_TTL_MS) {
      usedCaptchas.delete(token);
    }
  }
}

function getHmacKey() {
  return process.env.ALTCHA_HMAC_KEY || process.env.EMAIL_PASS || 'altcha-prod-hmac-panav-portfolio-secure-key-2025';
}

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
    .email({ message: 'A valid email address is required' })
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
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method Not Allowed' })
    };
  }

  try {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Invalid JSON payload.' })
      };
    }

    const parseResult = submissionSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid input provided.';
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: firstError })
      };
    }

    const { name, email, message, altcha, _honeypot } = parseResult.data;

    // Honeypot check
    if (_honeypot && _honeypot.trim().length > 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Message sent successfully!' })
      };
    }

    // Anti-replay check
    purgeExpiredCaptchas();
    if (usedCaptchas.has(altcha)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'CAPTCHA token has already been used. Please refresh.' })
      };
    }

    // Cryptographic Altcha verification
    const hmacKey = getHmacKey();
    let isSignatureValid = false;
    try {
      isSignatureValid = await verifySolution(altcha, hmacKey);
    } catch (cryptoErr) {
      console.error('[ALTCHA CRYPTO ERROR]', cryptoErr.message);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'CAPTCHA verification failed. Please try again.' })
      };
    }

    if (!isSignatureValid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Invalid CAPTCHA solution.' })
      };
    }

    if (usedCaptchas.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = usedCaptchas.keys().next().value;
      if (oldestKey) usedCaptchas.delete(oldestKey);
    }
    usedCaptchas.set(altcha, Date.now());

    // Profanity shadow-ban
    if (isProfaneText(name) || isProfaneText(message)) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Message sent successfully!' })
      };
    }

    // Verify SMTP
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('[CONFIG] SMTP credentials unconfigured.');
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ success: false, message: 'Email service is temporarily unavailable.' })
      };
    }

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
      text: `Sender: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Message sent successfully!' })
    };
  } catch (error) {
    console.error('[SUBMISSION ERROR]', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'An internal server error occurred.' })
    };
  }
}
