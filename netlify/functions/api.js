import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import validator from 'validator';
import { createChallenge, verifySolution } from 'altcha-lib';

dotenv.config();

const app = express();

// Basic Security Headers
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent payload bloat
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

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
  let { name, email, message, altcha } = req.body;

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

  // Basic sanitization to prevent HTML injection in emails
  name = validator.escape(name);
  message = validator.escape(message);

  try {
    // 2. Verify Altcha payload
    const isValid = await verifySolution(altcha, HMAC_KEY);
    
    if (!isValid) {
      console.warn(`[SECURITY] Invalid CAPTCHA payload from IP: ${req.ip}`);
      return res.status(400).json({ success: false, message: 'CAPTCHA verification failed.' });
    }

    // 3. Setup Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // 4. Send Email
    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER, 
      subject: `New Portfolio Message from ${validator.unescape(name)}`, // unescape for subject line readability
      text: `Name: ${validator.unescape(name)}\nEmail: ${email}\n\nMessage:\n${validator.unescape(message)}`, // unescape for text body readability
      replyTo: email
    };

    await transporter.sendMail(mailOptions);
    console.log(`[SUCCESS] Email sent from ${email} (IP: ${req.ip})`);
    return res.status(200).json({ success: true, message: 'Message sent successfully!' });

  } catch (error) {
    console.error('Error processing submission:', error);
    return res.status(500).json({ success: false, message: 'Server error processing request.' });
  }
});

export const handler = serverless(app);
