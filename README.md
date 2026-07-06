# Secure, Serverless Personal Portfolio Architecture

A production-grade, highly secure, and extremely performant personal portfolio built with a static frontend and a serverless backend. Designed to be completely "hacker-proof" and resilient to spam without sacrificing user experience or relying on expensive SaaS tools.

## 🌟 Overview & Philosophy

This project rejects the modern trend of using bloated frameworks (like React or Next.js) and expensive third-party form providers (like Formspree) for simple portfolios. Instead, it relies on fundamental web technologies (HTML, CSS, Vanilla JS) backed by modern serverless infrastructure to achieve:

1. **Zero Attack Surface:** No databases to inject, no CMS to compromise, and no stateful servers to hijack.
2. **Infinite Scalability:** Hosted on Netlify's global Edge CDN.
3. **Absolute Privacy & Spam Resistance:** Uses a cryptographic Proof-of-Work CAPTCHA (Altcha) instead of privacy-invasive alternatives like Google reCAPTCHA.

---

## 🏗️ System Design & Architecture

### The Tech Stack (And Why It Was Chosen)

| Component | Technology | Why We Chose It | The Alternative We Rejected |
| :--- | :--- | :--- | :--- |
| **Frontend** | Vanilla HTML, JS, Tailwind CSS | Lightning fast, zero dependencies, no complex build steps (webpack/vite) to maintain. | **React/Next.js:** Overkill for a static portfolio. Introduces unnecessary JS payload and dependency bloat. |
| **Backend** | Node.js (Express via Netlify Functions) | Executes code on-demand at the edge. Scales infinitely for free. Costs nothing when idle. | **VPS / Heroku Node Server:** Requires maintenance, constant uptime costs, and is susceptible to traditional server attacks. |
| **Styling** | Tailwind CSS (via CDN) | Rapid UI development with utility classes. | **Vanilla CSS / SASS:** Harder to maintain consistency across a complex design system. |
| **Email Delivery** | Nodemailer (Gmail SMTP) | Free, completely reliable, and self-hosted via our serverless function. | **Formspree / SendGrid:** Often charge money for basic contact forms, enforce limits, or inject their branding. |
| **Bot Protection** | Altcha (Proof-of-Work) | Open-source, GDPR compliant, no cookies, no tracking. Relies on cryptography. | **Google reCAPTCHA:** Invasive, tracks users across the web, and adds heavy external scripts that slow down page loads. |

### File Structure

```text
/
├── index.html           # The entire frontend application (UI, Content, DOM Logic)
├── netlify.toml         # Netlify configuration (Routing and Environment Variables)
└── netlify/
    └── functions/
        └── api.js       # The serverless backend API (Express app)
```

---

## 🛡️ How We Made It "Hacker-Proof"

The backend (`api.js`) is designed with defense-in-depth principles:

### 1. Proof-of-Work CAPTCHA (Altcha)
To stop spam bots, we do not use traditional image CAPTCHAs. We use **Altcha**, a cryptographic Proof-of-Work (PoW) mechanism. 
* **How it works:** When a user visits the site, the server generates a cryptographic puzzle. Before the contact form can be submitted, the user's browser must compute the solution. 
* **Why it matters:** This calculation takes a few hundred milliseconds for a human's device, but if a spam bot tries to send 10,000 emails, it would fry its CPU. It makes spamming mathematically unprofitable and computationally unfeasible.

### 2. Strict Rate Limiting
Even with PoW, we enforce a strict rate limit at the server level using `express-rate-limit`:
* **Limit:** Max 5 submissions per hour per IP address.
* **Result:** Mitigates DDoS attacks on the `/submit` endpoint and absolutely prevents inbox flooding from persistent attackers.

### 3. Payload Size Limiting (Anti-Bloat)
We limit the Express JSON body parser to `10kb`:
`app.use(express.json({ limit: '10kb' }));`
* Hackers often try to crash servers or inflate billing costs by sending massive, multi-gigabyte payloads in POST requests. This rule instantly drops any abnormally large requests before they are even processed.

### 4. Input Sanitization & XSS Prevention
We use the industry-standard `validator` library to rigorously check all inputs:
* **Strict Constraints:** Names cannot exceed 100 characters; Messages cannot exceed 2000 characters.
* **Escaping:** All input is passed through `validator.escape()` before being processed. If an attacker submits `<script>alert('hack')</script>`, it is neutralized into safe text. It prevents cross-site scripting (XSS) attacks in case the email content is ever rendered in a web client.

### 5. HTTP Security Headers
We use `helmet()` to automatically configure secure HTTP headers, protecting the API from MIME-sniffing, Clickjacking, and other common web vulnerabilities.

---

## 🚀 How to Host This Yourself on Netlify

Netlify is the perfect host for this architecture because it seamlessly handles both the static frontend CDN and the Node.js serverless backend without needing Docker containers or server configurations.

### Step 1: Clone and Prepare
1. Clone this repository to your local machine.
2. Edit `index.html` to replace the `portfolioData` JSON object with your own information, links, and projects.

### Step 2: Set Up Netlify
1. Create a free account at [Netlify](https://www.netlify.com/).
2. Click **"Add new site"** -> **"Import an existing project"** and connect your GitHub repository.

### Step 3: Configure Environment Variables
Before deploying, you must configure your backend secrets so Nodemailer can send emails securely. In your Netlify Site Dashboard, go to **Site configuration > Environment variables** and add the following:

* `EMAIL_USER`: Your Gmail address (e.g., `you@gmail.com`).
* `EMAIL_PASS`: An **App Password** for your Gmail. *(Do NOT use your normal password. Go to your Google Account Security settings, enable 2-Step Verification, and generate an "App Password" specifically for this).*
* `ALTCHA_HMAC_KEY`: A long, random string of characters used to cryptographically sign the CAPTCHA challenges (e.g., `super-secret-random-key-928374`). You can type anything here, just keep it secret.

### Step 4: Deploy
Trigger a deployment. Netlify will read the `netlify.toml` file, configure the `/api/*` redirects automatically, and spin up your Express backend as an edge function.

Your secure, scalable portfolio is now live!
