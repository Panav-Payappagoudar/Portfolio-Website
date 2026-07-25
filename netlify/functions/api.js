/* global process */
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import validator from 'validator';
import { createChallenge, verifySolution } from 'altcha-lib';

// Zero-dependency dynamic blocklist caches (to avoid esbuild / ESM interop issues on Netlify Production)
let disposableDomainsCache = null;
let badWordsCache = null;

async function getDisposableDomains() {
  if (!disposableDomainsCache) {
    try {
      const res = await fetch('https://raw.githubusercontent.com/ivolo/disposable-email-domains/master/index.json');
      disposableDomainsCache = await res.json();
    } catch (e) {
      console.error('Failed to fetch disposable domains', e);
      disposableDomainsCache = [];
    }
  }
  return disposableDomainsCache;
}

async function getBadWords() {
  if (!badWordsCache) {
    try {
      const res = await fetch('https://raw.githubusercontent.com/web-mech/badwords/master/lib/lang.json');
      const data = await res.json();
      badWordsCache = data.words || [];
    } catch (e) {
      console.error('Failed to fetch bad words', e);
      badWordsCache = ['fuck', 'shit', 'bitch', 'asshole', 'cunt', 'slut']; // Minimal fallback
    }
  }
  return badWordsCache;
}

function isProfane(text, badWordsList) {
  const words = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
  return words.some(word => badWordsList.includes(word));
}

dotenv.config();

const app = express();

// Basic Security Headers
app.use(helmet());
// Strict CORS Configuration
const allowedOrigins = ['https://www.panav.xyz', 'https://panav.xyz', 'http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json({ limit: '10kb' })); // Limit body size to prevent payload bloat
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Anti-Replay Cache (In-Memory)
const usedCaptchas = new Set();

// Memory cleanup every hour to prevent memory leaks
setInterval(() => {
  usedCaptchas.clear();
  console.log('[SECURITY] Cleared Anti-Replay cache to prevent memory bloat.');
}, 60 * 60 * 1000);

// Rate Limiting: Max 5 submissions per hour per IP
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, 
  message: { success: false, message: 'Too many requests from this IP, please try again after an hour' },
  handler: (req, res, next, options) => {
    console.warn(`[SECURITY] Rate limit triggered for IP: ${req.ip}`);
    res.status(options.statusCode).send(options.message);
  }
});

// Your secret key for Altcha (can be any random string)
const HMAC_KEY = process.env.ALTCHA_HMAC_KEY || 'default-secret-key-change-me-in-production';

// GET endpoint to generate Altcha challenge
app.get(['/api/altcha', '/altcha', '/.netlify/functions/api/altcha'], async (req, res) => {
  try {
    const challenge = await createChallenge({
      hmacKey: HMAC_KEY,
      maxNumber: 100000, // difficulty level
    });
    res.json(challenge);
  } catch (error) {
    console.error('Error generating challenge:', error);
    res.status(500).json({ error: 'Failed to generate challenge' });
  }
});

// POST endpoint to handle form submission with Rate Limiting
app.post(['/api/submit', '/submit', '/.netlify/functions/api/submit'], limiter, async (req, res) => {
  let { name, email, message, altcha, _honeypot } = req.body;

  // Honeypot Security Check (Silent Drop)
  if (_honeypot) {
    console.warn(`[SECURITY] HONEYPOT TRIGGERED for IP: ${req.ip}. Silently dropping spam.`);
    return res.status(200).json({ success: true, message: 'Message sent successfully!' });
  }

  if (!altcha) {
    return res.status(400).json({ success: false, message: 'CAPTCHA verification missing.' });
  }

  // 1. Input Validation and Sanitization
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  // Trim whitespace
  name = name.trim();
  email = email.trim();
  message = message.trim();

  // Enforce lengths
  if (name.length > 100) return res.status(400).json({ success: false, message: 'Name too long.' });
  if (message.length > 2000) return res.status(400).json({ success: false, message: 'Message too long.' });
  if (!validator.isEmail(email) || email.length > 150) {
    return res.status(400).json({ success: false, message: 'Invalid email address.' });
  }

  // Block Disposable/Burner Emails
  const emailDomain = email.split('@')[1].toLowerCase();
  const disposableDomains = await getDisposableDomains();
  if (disposableDomains.includes(emailDomain)) {
    console.warn(`[SECURITY] Blocked disposable email domain: ${emailDomain} from IP: ${req.ip}`);
    return res.status(400).json({ success: false, message: 'Disposable email addresses are not allowed. Please use a permanent email provider.' });
  }

  // Basic sanitization to prevent HTML injection in emails
  name = validator.escape(name);
  message = validator.escape(message);

    try {
    // 2. Verify Altcha payload & Prevent Replay Attacks
    if (usedCaptchas.has(altcha)) {
      console.warn(`[SECURITY] REPLAY ATTACK BLOCKED from IP: ${req.ip}. Signature already used.`);
      return res.status(400).json({ success: false, message: 'CAPTCHA already used. Please refresh the page.' });
    }

    const isValid = await verifySolution(altcha, HMAC_KEY);
    
    if (!isValid) {
      console.warn(`[SECURITY] Invalid CAPTCHA payload from IP: ${req.ip}`);
      return res.status(400).json({ success: false, message: 'CAPTCHA verification failed.' });
    }

    // Mark as used
    usedCaptchas.add(altcha);

    // 3. Setup Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: 'panav.p@proton.me', 
      subject: `New Portfolio Message from ${validator.unescape(name)}`, // unescape for subject line readability
      text: `Name: ${validator.unescape(name)}\nEmail: ${email}\n\nMessage:\n${validator.unescape(message)}`, // unescape for text body readability
      replyTo: email
    };

    // 4. Hate Speech & Profanity Filter (Shadow Ban)
    const badWordsList = await getBadWords();
    const unescapedName = validator.unescape(name);
    const unescapedMessage = validator.unescape(message);
    
    if (isProfane(unescapedName, badWordsList) || isProfane(unescapedMessage, badWordsList)) {
      console.warn(`[SECURITY] SHADOW BAN TRIGGERED for IP: ${req.ip}. Email: ${email}. Content flagged as profane/hate-speech.`);
      // Return 200 OK to the client so they think it succeeded, but DO NOT send the email.
      return res.status(200).json({ success: true, message: 'Message sent successfully!' });
    }

    // 5. Send Email to Site Owner
    await transporter.sendMail(mailOptions);
    console.log(`[SUCCESS] Email sent from ${email} (IP: ${req.ip})`);

    // 6. Send Auto-Responder to User
    const autoResponderOptions = {
      from: `"Panav Payappagoudar" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Thank you for reaching out!`,
      text: `Hi ${validator.unescape(name)},\n\nThank you for reaching out! I've received your message and will get back to you as soon as possible.\n\nBest regards,\nPanav Payappagoudar\n\nGitHub: https://github.com/Panav-Payappagoudar\nLinkedIn: https://linkedin.com/in/panav-payappagoudar`
    };

    try {
      await transporter.sendMail(autoResponderOptions);
      console.log(`[SUCCESS] Auto-responder sent to ${email}`);
    } catch (autoResponderError) {
      // Don't fail the entire request if the auto-responder fails
      console.error(`[WARNING] Failed to send auto-responder to ${email}:`, autoResponderError);
    }

    return res.status(200).json({ success: true, message: 'Message sent successfully!' });

  } catch (error) {
    console.error('Error processing submission:', error);
    return res.status(500).json({ success: false, message: 'Server error processing request.' });
  }
});

export const handler = serverless(app);
