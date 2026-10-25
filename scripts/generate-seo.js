import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { portfolioData } from '../src/data/portfolio.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '../public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate robots.txt
const robotsTxt = `User-agent: *
Allow: /

# Explicit AI Crawlers & LLM Agents
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: cohere-ai
Allow: /

# AI Context Reference
# See https://panav.xyz/llms.txt for LLM-optimized context
Sitemap: https://panav.xyz/sitemap.xml
`;

fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
console.log('[SUCCESS] robots.txt generated');

// 2. Generate sitemap.xml
const today = new Date().toISOString().split('T')[0];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://panav.xyz/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://panav.xyz/privacy.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://panav.xyz/terms.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
`;

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml);
console.log('[SUCCESS] sitemap.xml generated');

// 3. Generate llms.txt
let llmsTxt = `# Panav Payappagoudar — Software Developer & Systems Engineer

## Personal Info
- **Name**: ${portfolioData.personalInfo.name}
- **Title**: ${portfolioData.personalInfo.title}
- **Headline**: ${portfolioData.personalInfo.headline}
- **Institution**: ${portfolioData.personalInfo.institution}
- **Location**: ${portfolioData.personalInfo.location}
- **Email**: ${portfolioData.personalInfo.email}
- **About**: ${portfolioData.personalInfo.about.lead} ${portfolioData.personalInfo.about.paragraphs.join(' ')}

## Social & Professional Links
${portfolioData.socials.map(s => `- **${s.name}**: ${s.url}`).join('\n')}

## Projects & Systems (Unified Index)
${portfolioData.projects.map(p => `### ${p.title} (${p.year}) — ${p.subtitle}
- **Category**: ${p.category}${p.accolade ? `\n- **Accolade**: ${p.accolade}` : ''}
- **Description**: ${p.description}
- **Technologies**: ${p.technologies.join(', ')}
- **Repository**: ${p.repoUrl || 'N/A'}${p.liveUrl ? `\n- **Live Demo**: ${p.liveUrl}` : ''}`).join('\n\n')}

## Engineering & Research Experience
${portfolioData.experience.map(e => `### ${e.role} at ${e.organization} (${e.period}) [${e.type}]
- ${e.description}`).join('\n\n')}

## Education
${portfolioData.education.map(e => `- **${e.institution}**: ${e.degree} (${e.period}) — ${e.detail}`).join('\n')}

## Capabilities
${portfolioData.capabilities.map(c => `- **${c.discipline}**: ${c.skills.join(', ')} (${c.description})`).join('\n')}

## Honors & Awards
${portfolioData.achievements.map(a => `- **${a.title}** (${a.org}, ${a.date}): ${a.detail}`).join('\n')}
`;

fs.writeFileSync(path.join(publicDir, 'llms.txt'), llmsTxt);
console.log('[SUCCESS] llms.txt generated');
