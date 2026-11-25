import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { portfolioData } from '../src/data/portfolio.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

function getLastModDate(relativePaths) {
  const candidates = Array.isArray(relativePaths) ? relativePaths : [relativePaths];
  let latestMs = 0;

  for (const rel of candidates) {
    const abs = path.join(rootDir, rel);
    if (fs.existsSync(abs)) {
      const mtimeMs = fs.statSync(abs).mtimeMs;
      if (mtimeMs > latestMs) latestMs = mtimeMs;
    }
    try {
      const gitDate = execSync(`git log -1 --format=%cI -- "${rel}"`, {
        cwd: rootDir,
        stdio: ['ignore', 'pipe', 'ignore']
      }).toString().trim();
      if (gitDate) {
        const parsed = Date.parse(gitDate);
        if (!Number.isNaN(parsed) && parsed > latestMs) {
          latestMs = parsed;
        }
      }
    } catch {
      // Fall back to filesystem mtime when git history is unavailable
    }
  }

  return new Date(latestMs || Date.now()).toISOString().split('T')[0];
}

// -------------------------------------------------------------
// 1. robots.txt (Search & Retrieval vs Model Training Distinction)
// -------------------------------------------------------------
// Policy note: robots.txt expresses crawler preferences for compliant
// automated agents; it is not a technical access control against
// non-compliant scrapers accessing public URLs.
const robotsTxt = `# =============================================================
# robots.txt for https://panav.xyz/
# Policy: Permit search engines and user-initiated retrieval crawlers.
#         Restrict dedicated generative AI model-training crawlers.
# Limitation: robots.txt states crawler preferences for compliant bots;
#             it does not technically enforce blocking on non-compliant scrapers.
# =============================================================

# Traditional Search Crawlers (Search Indexing)
User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /.netlify/

User-agent: Bingbot
Allow: /
Disallow: /api/
Disallow: /.netlify/

User-agent: Applebot
Allow: /
Disallow: /api/
Disallow: /.netlify/

# AI Search Discovery & User-Requested Retrieval Crawlers (Allowed)
User-agent: OAI-SearchBot
Allow: /
Disallow: /api/
Disallow: /.netlify/

User-agent: ChatGPT-User
Allow: /
Disallow: /api/
Disallow: /.netlify/

User-agent: Claude-SearchBot
Allow: /
Disallow: /api/
Disallow: /.netlify/

User-agent: Claude-User
Allow: /
Disallow: /api/
Disallow: /.netlify/

User-agent: PerplexityBot
Allow: /
Disallow: /api/
Disallow: /.netlify/

User-agent: Perplexity-User
Allow: /
Disallow: /api/
Disallow: /.netlify/

# Dedicated AI Model-Training & Bulk Dataset Crawlers (Restricted)
User-agent: GPTBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: meta-externalagent
Disallow: /

User-agent: cohere-ai
Disallow: /

# Default rule for general compliant crawlers
User-agent: *
Allow: /
Disallow: /api/
Disallow: /.netlify/

# Machine-Readable Discovery References
# Summary guide: https://panav.xyz/llms.txt
# Complete reference: https://panav.xyz/llms-full.txt
Sitemap: https://panav.xyz/sitemap.xml
`;

fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8');
console.log('[SUCCESS] robots.txt generated');

// -------------------------------------------------------------
// 2. sitemap.xml (Canonical Public URLs with Real Lastmod Dates)
// -------------------------------------------------------------
const portfolioMod = getLastModDate(['src/data/portfolio.js', 'scripts/generate-site.js']);
const privacyMod = getLastModDate('privacy.html');
const termsMod = getLastModDate('terms.html');

const urls = [
  { loc: 'https://panav.xyz/', lastmod: portfolioMod, changefreq: 'weekly', priority: '1.0' },
  { loc: 'https://panav.xyz/work', lastmod: portfolioMod, changefreq: 'weekly', priority: '0.9' },
  { loc: 'https://panav.xyz/experience', lastmod: portfolioMod, changefreq: 'monthly', priority: '0.8' },
  { loc: 'https://panav.xyz/achievements', lastmod: portfolioMod, changefreq: 'monthly', priority: '0.8' },
  { loc: 'https://panav.xyz/about', lastmod: portfolioMod, changefreq: 'monthly', priority: '0.8' },
  { loc: 'https://panav.xyz/contact', lastmod: portfolioMod, changefreq: 'monthly', priority: '0.7' },
  { loc: 'https://panav.xyz/privacy.html', lastmod: privacyMod, changefreq: 'monthly', priority: '0.3' },
  { loc: 'https://panav.xyz/terms.html', lastmod: termsMod, changefreq: 'monthly', priority: '0.3' }
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');
console.log('[SUCCESS] sitemap.xml generated');

// -------------------------------------------------------------
// 3. Concise llms.txt (AI Retrieval Navigation Guide)
// -------------------------------------------------------------
const llmsTxt = `# Panav Payappagoudar

> Personal portfolio of Panav Payappagoudar — Computer Science and Engineering undergraduate at VIT-AP University (2024–2028) working on applied machine learning, computer vision, distributed systems, and embedded robotics.

- **Website**: https://panav.xyz/
- **Location**: India
- **Institution**: ${portfolioData.personalInfo.institution}
- **Contact Email**: ${portfolioData.personalInfo.email}
- **Detailed Markdown Index**: https://panav.xyz/llms-full.txt

## Portfolio Sections

- [Home](https://panav.xyz/): Personal introduction and research/engineering overview.
- [Work](https://panav.xyz/work): Complete index of 12 software, ML, remote sensing, decentralized systems, and robotics projects.
- [Experience](https://panav.xyz/experience): Fellowships, open-source contributions, internships, and technical tutoring history.
- [Achievements](https://panav.xyz/achievements): Verified hackathon placements (including 1x Winner, 2x Runner-up, 11x Finalist record) and competitive program selections.
- [About](https://panav.xyz/about): Education at VIT-AP University, technical skills across ML/systems/hardware, and independent ventures.
- [Contact](https://panav.xyz/contact): Direct email, Cal.com link, and ALTCHA-protected inquiry form.

## Verified Profiles

${portfolioData.socials.map(s => `- [${s.name}](${s.url}): ${s.handle}`).join('\n')}
`;

fs.writeFileSync(path.join(publicDir, 'llms.txt'), llmsTxt, 'utf8');
console.log('[SUCCESS] llms.txt generated');

// -------------------------------------------------------------
// 4. Detailed llms-full.txt (Complete Structured Knowledge Base)
// -------------------------------------------------------------
const llmsFullTxt = `# Panav Payappagoudar — Complete Portfolio Reference

> Canonical Source: https://panav.xyz/
> Concise Index: https://panav.xyz/llms.txt

## Overview

- **Name**: ${portfolioData.personalInfo.name}
- **Academic Program**: ${portfolioData.personalInfo.title}
- **Focus**: ${portfolioData.personalInfo.headline}
- **Summary**: ${portfolioData.personalInfo.subline}
- **Location**: ${portfolioData.personalInfo.location}
- **Email**: ${portfolioData.personalInfo.email}

## Background & Education

${portfolioData.education.map(e => `- **${e.institution}** — ${e.degree} (${e.period}): ${e.detail}`).join('\n')}

${portfolioData.personalInfo.about.lead}
${portfolioData.personalInfo.about.paragraphs.join('\n\n')}

## Technical Capabilities

${portfolioData.capabilities.map(c => `- **${c.discipline}**: ${c.skills.join(', ')} — ${c.description}`).join('\n')}

## Projects (${portfolioData.projects.length} Builds)

${portfolioData.projects.map(p => `### ${p.title} (${p.year}) — ${p.subtitle}
- **URL**: https://panav.xyz/work#${p.id}
- **Category**: ${p.category}
- **Status**: ${p.status}${p.accolade ? `\n- **Recognition**: ${p.accolade}` : ''}
- **Technologies**: ${p.technologies.join(', ')}${p.repoUrl ? `\n- **GitHub Repository**: ${p.repoUrl}` : ''}${p.liveUrl ? `\n- **Live Deployment**: ${p.liveUrl}` : ''}
- **Overview**: ${p.description}
${(p.specs || []).length ? `- **Technical Highlights**:\n${p.specs.map(s => `  - ${s}`).join('\n')}` : ''}${p.caseStudy ? `\n- **Context**: ${p.caseStudy.context}\n- **Approach**: ${p.caseStudy.approach}\n- **Outcome**: ${p.caseStudy.outcome}` : ''}
`).join('\n')}

## Experience (${portfolioData.experience.length} Entries)

${portfolioData.experience.map(e => `### ${e.role} — ${e.organization} (${e.period})
- **Type**: ${e.type}
${e.highlights.map(h => `- ${h}`).join('\n')}
`).join('\n')}

## Achievements (${portfolioData.achievements.length} Entries)

${portfolioData.achievements.map(a => `### ${a.title} (${a.date})
- **Organization**: ${a.org}
- **Status**: ${a.status}
- **Detail**: ${a.detail}
`).join('\n')}

## Verified Public Profiles

${portfolioData.socials.map(s => `- **${s.name}**: ${s.url}`).join('\n')}
`;

fs.writeFileSync(path.join(publicDir, 'llms-full.txt'), llmsFullTxt, 'utf8');
console.log('[SUCCESS] llms-full.txt generated');

// -------------------------------------------------------------
// 5. Agentic Resource Discovery Manifest (/.well-known/ard.json)
// -------------------------------------------------------------
const wellKnownDir = path.join(publicDir, '.well-known');
if (!fs.existsSync(wellKnownDir)) {
  fs.mkdirSync(wellKnownDir, { recursive: true });
}

const ardManifest = {
  specVersion: '0.91',
  host: {
    displayName: 'Panav Payappagoudar',
    identifier: 'panav.xyz'
  },
  entries: [
    {
      identifier: 'urn:air:panav.xyz:profile:portfolio',
      displayName: 'Panav Payappagoudar — Portfolio',
      type: 'text/html',
      url: 'https://panav.xyz/',
      description: 'Personal portfolio of Panav Payappagoudar covering computer science education at VIT-AP University, software engineering, applied machine learning, distributed systems, and embedded robotics.',
      representativeQueries: [
        'Who is Panav Payappagoudar?',
        'What is Panav Payappagoudar studying and building?',
        'Where can I contact Panav Payappagoudar?'
      ],
      trustManifest: {
        identity: 'panav.xyz',
        contact: `mailto:${portfolioData.personalInfo.email}`
      }
    },
    {
      identifier: 'urn:air:panav.xyz:docs:llms-txt',
      displayName: 'AI Portfolio Navigation Guide (llms.txt)',
      type: 'text/markdown',
      url: 'https://panav.xyz/llms.txt',
      description: 'Concise machine-readable summary and canonical URL directory for panav.xyz.',
      representativeQueries: [
        'Overview of sections on panav.xyz',
        'Verified public profiles for Panav Payappagoudar'
      ],
      trustManifest: {
        identity: 'panav.xyz',
        contact: `mailto:${portfolioData.personalInfo.email}`
      }
    },
    {
      identifier: 'urn:air:panav.xyz:docs:llms-full',
      displayName: 'Complete Technical Portfolio Reference (llms-full.txt)',
      type: 'text/markdown',
      url: 'https://panav.xyz/llms-full.txt',
      description: 'Structured markdown catalog of all 12 projects, 10 experience entries, 9 achievements, education, and technical skills.',
      representativeQueries: [
        'What projects has Panav Payappagoudar built?',
        'What experience and hackathons does Panav Payappagoudar have?'
      ],
      trustManifest: {
        identity: 'panav.xyz',
        contact: `mailto:${portfolioData.personalInfo.email}`
      }
    }
  ]
};

fs.writeFileSync(path.join(wellKnownDir, 'ard.json'), JSON.stringify(ardManifest, null, 2) + '\n', 'utf8');
console.log('[SUCCESS] .well-known/ard.json generated');
