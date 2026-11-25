import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { portfolioData } from '../src/data/portfolio.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

let errors = [];

function check(condition, message) {
  if (!condition) {
    errors.push(`[FAIL] ${message}`);
    console.error(`❌ [FAIL] ${message}`);
  } else {
    console.log(`✅ [PASS] ${message}`);
  }
}

// 1. Check all expected files exist
const requiredFiles = [
  'index.html',
  'work/index.html',
  'experience/index.html',
  'achievements/index.html',
  'about/index.html',
  'contact/index.html',
  'work.html',
  'experience.html',
  'achievements.html',
  'about.html',
  'contact.html',
  'privacy.html',
  'terms.html',
  '404.html'
];

requiredFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  check(fs.existsSync(filePath), `File exists: ${file}`);
});

// 2. Navigation audit across all 6 core pages
const corePages = ['index.html', 'work/index.html', 'experience/index.html', 'achievements/index.html', 'about/index.html', 'contact/index.html'];

corePages.forEach(file => {
  const html = fs.readFileSync(path.join(rootDir, file), 'utf8');
  
  const hasHomeLink = /<a[^>]*href="\/"[^>]*>[\s\S]*?Home/i.test(html);
  const hasExploreBtn = /id="explore-btn"/i.test(html);
  const hasContactCta = /class="[^"]*nav-cta[^"]*"[^>]*href="\/contact"|href="\/contact"[^>]*class="[^"]*nav-cta[^"]*"/i.test(html);
  
  check(hasHomeLink, `${file}: Top nav has Home link to "/"`);
  check(hasExploreBtn, `${file}: Top nav has Explore dropdown button`);
  check(hasContactCta, `${file}: Top nav has Contact CTA button`);

  const navLinksMatch = html.match(/<div class="nav-links"[^>]*>([\s\S]*?)<\/div>/);
  if (navLinksMatch) {
    const navLinksHtml = navLinksMatch[1];
    const stripped = navLinksHtml.replace(/<div class="nav-dropdown"[\s\S]*?<\/div>\s*<\/div>/, '');
    const hasDirectWork = /href="\/work"[^>]*>[\s\S]*?Work<\/span><\/a>/i.test(stripped);
    const hasDirectExp = /href="\/experience"[^>]*>[\s\S]*?Experience<\/span><\/a>/i.test(stripped);
    check(!hasDirectWork, `${file}: Top nav does NOT contain top-level Work link outside dropdown`);
    check(!hasDirectExp, `${file}: Top nav does NOT contain top-level Experience link outside dropdown`);
  }

  check(/href="\/work"[\s\S]*?Work/i.test(html), `${file}: Explore menu contains Work`);
  check(/href="\/experience"[\s\S]*?Experience/i.test(html), `${file}: Explore menu contains Experience`);
  check(/href="\/achievements"[\s\S]*?Achievements/i.test(html), `${file}: Explore menu contains Achievements`);
  check(/href="\/about"[\s\S]*?About/i.test(html), `${file}: Explore menu contains About`);
  check(html.includes('id="page-progress-bar"'), `${file}: Contains non-blocking page-progress-bar element`);
});

// 3. Homepage content audit (INTRODUCTION ONLY + TWO ACTION LINKS)
const homeHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const homeMainMatch = homeHtml.match(/<main[\s\S]*?<\/main>/);
const homeMain = homeMainMatch ? homeMainMatch[0] : '';

check(!homeHtml.includes('id="projects"') && !homeHtml.includes('project-card'), 'Homepage: Contains ZERO project cards / grids');
check(!homeHtml.includes('id="experience"') && !homeHtml.includes('timeline-container'), 'Homepage: Contains ZERO experience timeline');
check(!homeHtml.includes('id="achievements"') && !homeHtml.includes('Triwizardathon'), 'Homepage: Contains ZERO achievements list');
check(!homeHtml.includes('400K+ Requests') && !homeHtml.includes('3.2x Latency'), 'Homepage: Contains ZERO stats/benchmark grid');
check(homeHtml.includes('Panav Payappagoudar'), 'Homepage: Contains Panav Payappagoudar name');
check(homeMain.includes('href="/work"') && homeMain.includes('Explore My Work'), 'Homepage: Contains "Explore My Work" CTA to /work');
check(homeMain.includes('href="/contact"') && homeMain.includes('Get in Touch'), 'Homepage: Contains "Get in Touch" CTA to /contact');
check(!homeMain.includes('href="/experience"') && !homeMain.includes('href="/about"'), 'Homepage main: Strictly limited to the two curated links (/work, /contact)');

// 4. Work page content & authenticity audit
const workHtml = fs.readFileSync(path.join(rootDir, 'work/index.html'), 'utf8');
portfolioData.projects.forEach(p => {
  check(workHtml.includes(`id="${p.id}"`), `Work page: Contains project "${p.title}" (id: ${p.id})`);
});
check(portfolioData.projects.length === 12, 'Verified 12 projects in portfolio data');
check(!workHtml.includes('<canvas'), 'Work page: Contains ZERO canvas visual diagrams');
check(!workHtml.includes('60 FPS') && !workHtml.includes('150 concurrent') && !workHtml.includes('92%') && !workHtml.includes('96.7%'), 'Work page: Contains ZERO unverified fabricated metrics');

// 5. Experience page content audit
const expHtml = fs.readFileSync(path.join(rootDir, 'experience/index.html'), 'utf8');
check(expHtml.includes('id="timeline-container"'), 'Experience page: Contains timeline-container');
check(expHtml.includes('id="timeline-progress-line"'), 'Experience page: Contains timeline-progress-line SVG');
portfolioData.experience.forEach(exp => {
  const roleEsc = exp.role.replace(/&/g, '&amp;');
  check(expHtml.includes(exp.role) || expHtml.includes(roleEsc), `Experience page: Contains role "${exp.role}"`);
});
check(portfolioData.experience.length === 10, 'Verified 10 experience roles in portfolio data');

// 6. Achievements page content & authenticity audit
const achHtml = fs.readFileSync(path.join(rootDir, 'achievements/index.html'), 'utf8');
portfolioData.achievements.forEach(ach => {
  const orgEsc = ach.org.replace(/&/g, '&amp;');
  check(achHtml.includes(ach.org) || achHtml.includes(orgEsc), `Achievements page: Contains achievement org "${ach.org}"`);
});
check(portfolioData.achievements.length === 9, 'Verified 9 verified achievements/recognitions');
check(!achHtml.includes('2× Hackathon Winner'), 'Achievements page: Removed inflated 2x Winner claim (uses verified 1x Winner)');
check(achHtml.includes('1× Winner'), 'Achievements page: Preserves verified 1x Winner record');

// 7. About page content audit
const aboutHtml = fs.readFileSync(path.join(rootDir, 'about/index.html'), 'utf8');
check(aboutHtml.includes('VIT-AP University'), 'About page: Contains VIT-AP background');
check(aboutHtml.includes('The Essentialist'), 'About page: References The Essentialist');
check(!aboutHtml.includes('<canvas'), 'About page: Contains ZERO canvas visual diagrams');

// 8. Contact page content audit
const contactHtml = fs.readFileSync(path.join(rootDir, 'contact/index.html'), 'utf8');
check(contactHtml.includes('id="contact-form"'), 'Contact page: Contains contact-form');
check(contactHtml.includes('altcha-widget'), 'Contact page: Contains altcha-widget');
check(contactHtml.includes('name="_honeypot"'), 'Contact page: Contains honeypot');
check(contactHtml.includes('id="form-error-alert"'), 'Contact page: Contains form-error-alert');
check(contactHtml.includes('id="success-modal"') && contactHtml.includes('opacity-0 pointer-events-none'), 'Contact page: Success modal starts hidden');
check(!contactHtml.includes('Ada Lovelace') && !contactHtml.includes('12.9165° N'), 'Contact page: No Ada Lovelace placeholder or GPS coordinates');

// 9. Legal accuracy checks
const privacyHtml = fs.readFileSync(path.join(rootDir, 'privacy.html'), 'utf8');
const termsHtml = fs.readFileSync(path.join(rootDir, 'terms.html'), 'utf8');
check(privacyHtml.includes('Panav Payappagoudar operates this personal portfolio website'), 'Privacy Policy: Natural opening wording');
check(!privacyHtml.includes('strictly through client-side SHA-256'), 'Privacy Policy: Accurate client+server ALTCHA disclosure');
check(privacyHtml.includes('Netlify') && privacyHtml.includes('Gmail SMTP') && privacyHtml.includes('self-hosted'), 'Privacy Policy: Accurately discloses Netlify, Gmail SMTP, and self-hosted fonts');
check(termsHtml.includes('respective third-party or open-source licenses'), 'Terms: Distinguishes third-party open-source licenses cleanly');

// 10. Site-wide typography & pill-clutter system checks
const allHtmlPages = [
  'index.html',
  'work/index.html',
  'experience/index.html',
  'achievements/index.html',
  'about/index.html',
  'contact/index.html',
  'privacy.html',
  'terms.html',
  '404.html'
];
allHtmlPages.forEach(file => {
  const html = fs.readFileSync(path.join(rootDir, file), 'utf8');
  check(!html.includes('font-mono'), `${file}: ZERO font-mono classes in HTML`);
  check(!html.includes('JetBrains') && !html.includes('fonts.googleapis.com'), `${file}: Uses self-hosted fonts with zero Google Fonts/JetBrains links`);
});
check(!homeHtml.includes('rounded-[6px] bg-[#FFFFFF] border border-neutral-200 text-xs font-mono'), 'Homepage: University context rendered as plain hierarchy without decorative bordered box');
check(!expHtml.includes('rounded-[4px] bg-[#F4F4F5]'), 'Experience page: Role classification rendered without grey pill badges');
check(!workHtml.includes('border border-neutral-200 rounded-[4px]') && !aboutHtml.includes('rounded-[4px] border border-neutral-200'), 'Work & About pages: Technologies rendered cleanly without bordered pill chips');

// 11. Performance, SEO, JSON-LD & AI Discoverability checks
corePages.forEach(file => {
  const html = fs.readFileSync(path.join(rootDir, file), 'utf8');
  const ldMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  check(ldMatches.length === 1, `${file}: Contains valid JSON-LD structured data script`);
  if (ldMatches[0]) {
    let parsed = null;
    try {
      parsed = JSON.parse(ldMatches[0][1]);
    } catch {
      parsed = null;
    }
    check(Boolean(parsed && parsed['@graph'] && parsed['@graph'].some(n => n['@type'] === 'Person')), `${file}: JSON-LD parses cleanly and defines Person schema`);
  }
  check(!html.includes('localhost:') && !html.includes('http://localhost'), `${file}: Contains zero localhost URLs`);
  check(html.includes('id="site-loader"'), `${file}: Includes conditional site-loader element`);
});

const distWorkHtml = fs.readFileSync(path.join(rootDir, 'dist/work/index.html'), 'utf8');
check(distWorkHtml.includes('SoftwareSourceCode') && distWorkHtml.includes('CreativeWork'), 'dist/work/index.html: Structured data includes project SoftwareSourceCode & CreativeWork schemas');

const distHomeHtml = fs.readFileSync(path.join(rootDir, 'dist/index.html'), 'utf8');
check(/rel="preload" as="font" type="font\/woff2"/i.test(distHomeHtml), 'dist/index.html: Critical self-hosted WOFF2 fonts are preloaded');

const robotsTxt = fs.readFileSync(path.join(rootDir, 'dist/robots.txt'), 'utf8');
check(robotsTxt.includes('User-agent: Googlebot') && robotsTxt.includes('User-agent: OAI-SearchBot') && robotsTxt.includes('User-agent: ChatGPT-User'), 'robots.txt: Permits search & user-retrieval crawlers');
check(robotsTxt.includes('User-agent: GPTBot\nDisallow: /') || robotsTxt.includes('User-agent: GPTBot\r\nDisallow: /'), 'robots.txt: Restricts GPTBot model training while permitting OAI-SearchBot');
check(robotsTxt.includes('User-agent: Google-Extended') && robotsTxt.includes('Disallow: /'), 'robots.txt: Restricts model-training crawlers');

const sitemapXml = fs.readFileSync(path.join(rootDir, 'dist/sitemap.xml'), 'utf8');
check(sitemapXml.includes('https://panav.xyz/work') && !sitemapXml.includes('localhost') && !sitemapXml.includes('/work.html'), 'sitemap.xml: Canonical extensionless URLs only');

const llmsTxt = fs.readFileSync(path.join(rootDir, 'dist/llms.txt'), 'utf8');
const llmsFullTxt = fs.readFileSync(path.join(rootDir, 'dist/llms-full.txt'), 'utf8');
check(llmsTxt.length > 300 && llmsTxt.length < 4000, 'llms.txt: Concise structured AI discovery index');
check(llmsFullTxt.includes('Gravity Sandbox') && llmsFullTxt.includes('ClaimAgent'), 'llms-full.txt: Complete project reference present');
check(fs.existsSync(path.join(rootDir, 'dist/android-chrome-192x192.png')) && fs.existsSync(path.join(rootDir, 'dist/android-chrome-512x512.png')) && fs.existsSync(path.join(rootDir, 'dist/apple-touch-icon.png')), 'dist/: PWA & Apple touch icons present');

const ardPath = path.join(rootDir, 'dist/.well-known/ard.json');
check(fs.existsSync(ardPath), 'dist/.well-known/ard.json exists');
if (fs.existsSync(ardPath)) {
  const ardJson = JSON.parse(fs.readFileSync(ardPath, 'utf8'));
  check(Array.isArray(ardJson.entries) && ardJson.entries.length === 3 && ardJson.host?.identifier === 'panav.xyz', 'dist/.well-known/ard.json valid ARD manifest');
}

console.log('\n==========================================');
if (errors.length > 0) {
  console.error(`FAILED with ${errors.length} error(s).`);
  process.exit(1);
} else {
  console.log('ALL SITE ARCHITECTURE, AUTHENTICITY & LEGAL AUDIT CHECKS PASSED!');
  process.exit(0);
}
