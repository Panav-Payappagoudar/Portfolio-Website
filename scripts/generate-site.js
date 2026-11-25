import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { portfolioData } from '../src/data/portfolio.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Helper to escape HTML
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// -------------------------------------------------------------
// SCHEMA.ORG STRUCTURED DATA GRAPH GENERATOR (FACTUAL ONLY)
// -------------------------------------------------------------
function buildStructuredData(canonicalPath, pageTitle, pageDescription) {
  const info = portfolioData.personalInfo;
  const fullUrl = `https://panav.xyz${canonicalPath}`;

  const personNode = {
    '@type': 'Person',
    '@id': 'https://panav.xyz/#person',
    name: info.name,
    url: 'https://panav.xyz/',
    email: `mailto:${info.email}`,
    jobTitle: 'Computer Science Undergraduate & Applied ML Engineer',
    description: info.headline,
    affiliation: {
      '@type': 'CollegeOrUniversity',
      name: 'VIT-AP University'
    },
    knowsAbout: [
      'Applied Machine Learning',
      'Computer Vision',
      'Distributed Systems',
      'Remote Sensing & Geospatial Analysis',
      'Embedded Robotics',
      'Rust',
      'Python'
    ],
    sameAs: portfolioData.socials.map(s => s.url)
  };

  const websiteNode = {
    '@type': 'WebSite',
    '@id': 'https://panav.xyz/#website',
    name: 'Panav Payappagoudar',
    url: 'https://panav.xyz/',
    author: { '@id': 'https://panav.xyz/#person' },
    publisher: { '@id': 'https://panav.xyz/#person' }
  };

  const graph = [websiteNode, personNode];

  if (canonicalPath === '/' || canonicalPath === '/about') {
    graph.push({
      '@type': 'ProfilePage',
      '@id': `${fullUrl}#webpage`,
      url: fullUrl,
      name: pageTitle,
      description: pageDescription,
      isPartOf: { '@id': 'https://panav.xyz/#website' },
      mainEntity: { '@id': 'https://panav.xyz/#person' }
    });
  } else if (canonicalPath === '/work') {
    graph.push({
      '@type': 'CollectionPage',
      '@id': `${fullUrl}#webpage`,
      url: fullUrl,
      name: pageTitle,
      description: pageDescription,
      isPartOf: { '@id': 'https://panav.xyz/#website' },
      author: { '@id': 'https://panav.xyz/#person' },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: portfolioData.projects.map((p, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          item: {
            '@type': p.repoUrl ? 'SoftwareSourceCode' : 'CreativeWork',
            name: p.title,
            description: p.description,
            url: `https://panav.xyz/work#${p.id}`,
            dateCreated: p.year,
            keywords: p.technologies.join(', '),
            author: { '@id': 'https://panav.xyz/#person' },
            ...(p.repoUrl ? { codeRepository: p.repoUrl, programmingLanguage: p.technologies.slice(0, 3) } : {})
          }
        }))
      }
    });
  } else if (canonicalPath === '/contact') {
    graph.push({
      '@type': 'ContactPage',
      '@id': `${fullUrl}#webpage`,
      url: fullUrl,
      name: pageTitle,
      description: pageDescription,
      isPartOf: { '@id': 'https://panav.xyz/#website' },
      mainEntity: { '@id': 'https://panav.xyz/#person' }
    });
  } else {
    graph.push({
      '@type': 'WebPage',
      '@id': `${fullUrl}#webpage`,
      url: fullUrl,
      name: pageTitle,
      description: pageDescription,
      isPartOf: { '@id': 'https://panav.xyz/#website' },
      about: { '@id': 'https://panav.xyz/#person' }
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

// -------------------------------------------------------------
// GLOBAL HEAD TEMPLATE
// -------------------------------------------------------------
function renderHead(pageTitle, pageDescription, canonicalPath = '/') {
  const jsonLd = buildStructuredData(canonicalPath, pageTitle, pageDescription);

  return `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <meta name="theme-color" content="#F9F9F9">
    
    <title>${esc(pageTitle)}</title>
    <meta name="description" content="${esc(pageDescription)}">
    <meta name="author" content="${esc(portfolioData.personalInfo.name)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://panav.xyz${canonicalPath}">
    
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/manifest.json">
    <link rel="alternate" type="text/markdown" href="/llms.txt" title="AI & LLM Context">
    <link rel="alternate" type="text/markdown" href="/llms-full.txt" title="Complete AI Context Reference">

    <!-- Open Graph -->
    <meta property="og:site_name" content="Panav Payappagoudar">
    <meta property="og:type" content="${canonicalPath === '/' || canonicalPath === '/about' ? 'profile' : 'website'}">
    <meta property="og:url" content="https://panav.xyz${canonicalPath}">
    <meta property="og:title" content="${esc(pageTitle)}">
    <meta property="og:description" content="${esc(pageDescription)}">
    <meta property="og:image" content="https://panav.xyz/og-image.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Panav Payappagoudar — Portfolio Preview">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="https://panav.xyz${canonicalPath}">
    <meta name="twitter:title" content="${esc(pageTitle)}">
    <meta name="twitter:description" content="${esc(pageDescription)}">
    <meta name="twitter:image" content="https://panav.xyz/og-image.png">

    <script type="application/ld+json">${jsonLd}</script>
    <link rel="stylesheet" href="/src/index.css">
  `;
}

// -------------------------------------------------------------
// GLOBAL NAVIGATION TEMPLATE (EXACT THREE ITEMS: Home | Explore ▾ | Contact)
// -------------------------------------------------------------
function renderNav(activePage = 'home') {
  const isExploreActive = ['work', 'experience', 'achievements', 'about'].includes(activePage);

  return `
    <!-- Conditional non-blocking loader (displayed only if loading exceeds ~300ms) -->
    <div id="site-loader" class="site-loader" aria-hidden="true" role="status" aria-live="polite">
      <div class="site-loader-inner">
        <span class="site-loader-label">Panav Payappagoudar</span>
        <div class="site-loader-track" aria-hidden="true">
          <div class="site-loader-bar"></div>
        </div>
      </div>
    </div>

    <!-- Non-blocking top progress bar -->
    <div id="page-progress-bar" class="page-progress-bar" aria-hidden="true"></div>

    <!-- Skip to main content -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] focus:px-4 focus:py-2 focus:bg-[#111111] focus:text-white focus:text-xs focus:font-sans focus:font-medium focus:rounded-[6px] focus:outline-none shadow-lg">
      Skip to content
    </a>

    <!-- Top Navigation Bar (Home | Explore | Contact) -->
    <nav class="nav" id="main-nav" aria-label="Main Navigation">
      <a href="/" class="nav-brand" aria-label="Panav Payappagoudar Homepage">
        <span class="w-2 h-2 rounded-full bg-[#111111] inline-block shrink-0" aria-hidden="true"></span>
        <span>Panav Payappagoudar</span>
      </a>

      <!-- Three Top-Level Navigation Items: Home | Explore ▾ | Contact -->
      <div class="nav-links" id="nav-links" role="menubar">
        <!-- 1. Home -->
        <a href="/" class="nav-link ${activePage === 'home' ? 'active' : ''}" role="menuitem"${activePage === 'home' ? ' aria-current="page"' : ''}>
          <span>Home</span>
        </a>

        <!-- 2. Explore (Dropdown) -->
        <div class="nav-item has-dropdown" id="nav-explore-dropdown">
          <button type="button" class="nav-link nav-dropdown-trigger ${isExploreActive ? 'active' : ''}" id="explore-btn" aria-haspopup="true" aria-expanded="false" aria-controls="explore-menu" role="menuitem">
            <span>Explore</span>
            <svg class="dropdown-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div class="nav-dropdown" id="explore-menu" role="menu" aria-labelledby="explore-btn">
            <div class="nav-dropdown-content">
              <a href="/work" class="dropdown-item ${activePage === 'work' ? 'active' : ''}" role="menuitem"${activePage === 'work' ? ' aria-current="page"' : ''}>
                <span class="dropdown-title">Work</span>
                <span class="dropdown-desc">Projects and engineering</span>
              </a>
              <a href="/experience" class="dropdown-item ${activePage === 'experience' ? 'active' : ''}" role="menuitem"${activePage === 'experience' ? ' aria-current="page"' : ''}>
                <span class="dropdown-title">Experience</span>
                <span class="dropdown-desc">Research, internships and roles</span>
              </a>
              <a href="/achievements" class="dropdown-item ${activePage === 'achievements' ? 'active' : ''}" role="menuitem"${activePage === 'achievements' ? ' aria-current="page"' : ''}>
                <span class="dropdown-title">Achievements</span>
                <span class="dropdown-desc">Competitions and programs</span>
              </a>
              <a href="/about" class="dropdown-item ${activePage === 'about' ? 'active' : ''}" role="menuitem"${activePage === 'about' ? ' aria-current="page"' : ''}>
                <span class="dropdown-title">About</span>
                <span class="dropdown-desc">Education and background</span>
              </a>
            </div>
          </div>
        </div>

        <!-- 3. Contact (Black CTA Button) -->
        <a href="/contact" class="nav-cta" id="nav-contact-cta" role="menuitem"${activePage === 'contact' ? ' aria-current="page"' : ''}>Contact</a>
      </div>

      <!-- Mobile Hamburger Toggle -->
      <button type="button" class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="nav-links">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>

    <!-- Mobile Drawer Backdrop Overlay -->
    <div id="nav-backdrop" class="fixed inset-0 bg-black/20 z-[98] opacity-0 pointer-events-none transition-opacity duration-300 md:hidden"></div>
  `;
}

// -------------------------------------------------------------
// GLOBAL FOOTER TEMPLATE
// -------------------------------------------------------------
function renderFooter() {
  return `
    <footer class="py-10 sm:py-12 border-t border-neutral-200 bg-[#FFFFFF] text-[13px] sm:text-sm font-sans text-neutral-500">
      <div class="max-w-6xl mx-auto px-5 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 text-left">
        <div>
          <span>© 2024–${new Date().getFullYear()} Panav Payappagoudar</span>
        </div>
        <div class="flex flex-wrap items-center gap-x-6 gap-y-1">
          <a href="/privacy.html" class="hover:text-[#111111] transition-colors inline-flex items-center min-h-[44px] sm:min-h-0 sm:py-1">Privacy</a>
          <a href="/terms.html" class="hover:text-[#111111] transition-colors inline-flex items-center min-h-[44px] sm:min-h-0 sm:py-1">Terms</a>
          <a href="https://github.com/Panav-Payappagoudar" target="_blank" rel="noopener noreferrer" class="hover:text-[#111111] transition-colors inline-flex items-center min-h-[44px] sm:min-h-0 sm:py-1">GitHub ↗</a>
          <a href="https://linkedin.com/in/panav-payappagoudar" target="_blank" rel="noopener noreferrer" class="hover:text-[#111111] transition-colors inline-flex items-center min-h-[44px] sm:min-h-0 sm:py-1">LinkedIn ↗</a>
          <a href="https://panav-payappagoudar.medium.com/" target="_blank" rel="noopener noreferrer" class="hover:text-[#111111] transition-colors inline-flex items-center min-h-[44px] sm:min-h-0 sm:py-1">Medium ↗</a>
        </div>
      </div>
    </footer>
  `;
}

// =============================================================
// 1. PAGE: HOME (/) — PERSONAL INTRODUCTION ONLY
// =============================================================
function generateHomePage() {
  const info = portfolioData.personalInfo;
  const [roleLabel, institutionLabel] = (info.title || '').split(' · ');

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth bg-[#F9F9F9] text-[#111111]">
<head>
  ${renderHead(
    'Panav Payappagoudar | Software Engineer & Applied ML Researcher',
    'Personal portfolio of Panav Payappagoudar, Computer Science undergraduate at VIT-AP University working on applied machine learning, computer vision, distributed systems, and embedded robotics.',
    '/'
  )}
</head>
<body class="antialiased bg-[#F9F9F9] text-[#111111] min-h-screen flex flex-col justify-between selection:bg-[#111111] selection:text-white">
  ${renderNav('home')}

  <!-- INTRODUCTION ONLY HERO -->
  <main id="main-content" class="flex-grow flex items-center pt-24 pb-16 sm:pt-36 sm:pb-28">
    <div class="max-w-4xl mx-auto px-5 sm:px-8 text-left space-y-7 sm:space-y-10 w-full">
      
      <!-- Academic Context Label -->
      <div class="space-y-0.5 text-sm sm:text-[15px] font-sans">
        <p class="font-medium text-[#111111]">${esc(roleLabel || info.title)}</p>
        ${institutionLabel ? `<p class="text-neutral-500">${esc(institutionLabel)}</p>` : ''}
      </div>

      <!-- Introduction Heading -->
      <div class="space-y-3.5 sm:space-y-4">
        <h1 class="font-heading hero-display font-bold tracking-tight text-[#111111]">
          ${esc(info.name)}
        </h1>
        <p class="font-heading hero-lead text-neutral-800 font-semibold tracking-tight max-w-3xl">
          ${esc(info.headline)}
        </p>
      </div>

      <!-- Concise Narrative Paragraph -->
      <div class="body-copy text-neutral-600 font-sans font-normal max-w-2xl">
        <p>
          ${esc(info.subline)}
        </p>
      </div>

      <!-- Two Curated Action Links Only -->
      <div class="pt-2 flex flex-wrap items-center gap-3 sm:gap-4 text-sm font-sans font-medium">
        <a href="/work" class="px-5 py-3 min-h-[44px] rounded-[6px] bg-[#111111] text-white hover:bg-neutral-800 transition-colors inline-flex items-center gap-2 group">
          <span>Explore My Work</span>
          <span class="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">→</span>
        </a>
        <a href="/contact" class="px-5 py-3 min-h-[44px] rounded-[6px] bg-[#FFFFFF] border border-neutral-300 text-neutral-800 hover:border-[#111111] hover:text-[#111111] transition-colors inline-flex items-center">
          <span>Get in Touch</span>
        </a>
      </div>

    </div>
  </main>

  ${renderFooter()}
  <script type="module" src="/src/main.js"></script>
</body>
</html>`;
}

// =============================================================
// 2. PAGE: WORK (/work)
// =============================================================
function generateWorkPage() {
  const projects = portfolioData.projects;
  const flagshipProjects = projects.filter(p => p.featured);
  const secondaryProjects = projects.filter(p => !p.featured);

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth bg-[#F9F9F9] text-[#111111]">
<head>
  ${renderHead(
    'Projects & Engineering Work | Panav Payappagoudar',
    'Index of 12 software, applied machine learning, astrophysics simulation, remote sensing, and embedded robotics projects built by Panav Payappagoudar.',
    '/work'
  )}
</head>
<body class="antialiased bg-[#F9F9F9] text-[#111111] min-h-screen flex flex-col justify-between selection:bg-[#111111] selection:text-white">
  ${renderNav('work')}

  <main id="main-content" class="flex-grow pt-24 sm:pt-32">
    <div class="max-w-5xl mx-auto px-5 sm:px-6 py-10 sm:py-12 text-left space-y-14 sm:space-y-16">
      <!-- Page Header -->
      <header class="pb-8 border-b border-neutral-200 space-y-3 sm:space-y-4">
        <p class="text-sm font-sans font-medium text-neutral-500">Projects &amp; Builds</p>
        <h1 class="font-heading page-title font-bold tracking-tight text-[#111111]">Work</h1>
        <p class="font-sans body-copy text-neutral-600 max-w-2xl font-normal">
          A collection of 12 software, machine learning, security, and embedded systems projects spanning hackathon prototypes, undergraduate research, and independent experiments.
        </p>
      </header>

      <!-- Flagship Projects -->
      <section class="space-y-10" aria-labelledby="flagship-heading">
        <div>
          <p class="text-sm font-sans font-medium text-neutral-500 mb-1">Selected Work</p>
          <h2 id="flagship-heading" class="font-heading section-title font-bold text-[#111111] tracking-tight">Flagship Systems &amp; Architectures</h2>
        </div>

        <div class="space-y-8">
          ${flagshipProjects.map((p, idx) => `
            <article id="${esc(p.id)}" class="p-5 sm:p-8 rounded-[6px] bg-[#FFFFFF] border border-neutral-200 scroll-mt-24 space-y-6 hover:border-neutral-400 transition-colors">
              <!-- Header Meta -->
              <div class="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-neutral-200 text-sm font-sans">
                <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-neutral-500">
                  <span class="text-[#111111] font-medium">0${idx + 1}</span>
                  <span aria-hidden="true">·</span>
                  <span class="text-neutral-700 font-medium">${esc(p.category)}</span>
                  <span aria-hidden="true">·</span>
                  <span>${esc(p.year)}</span>
                  <span aria-hidden="true">·</span>
                  <span>${esc(p.status)}</span>
                </div>
                ${p.accolade ? `<span class="text-[#111111] font-semibold">${esc(p.accolade)}</span>` : ''}
              </div>

              <!-- Content Grid -->
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                <div class="lg:col-span-7 space-y-4">
                  <div>
                    <h3 class="font-heading card-title font-bold text-[#111111] tracking-tight">
                      ${esc(p.title)}
                    </h3>
                    <p class="text-sm sm:text-base font-medium text-neutral-500 mt-1">
                      ${esc(p.subtitle)}
                    </p>
                  </div>
                  <p class="body-copy text-neutral-700 font-sans">
                    ${esc(p.description)}
                  </p>

                  <div class="pt-1 text-sm font-sans font-medium text-neutral-500 leading-relaxed">
                    ${p.technologies.map(t => esc(t)).join(' · ')}
                  </div>
                </div>

                <!-- Technical Specifications -->
                <div class="lg:col-span-5 p-5 sm:p-6 rounded-[6px] bg-[#F9F9F9] border border-neutral-200 space-y-4">
                  <div class="text-sm font-heading font-semibold text-[#111111] pb-2.5 border-b border-neutral-200">Technical Details</div>
                  <ul class="space-y-2.5 text-neutral-700 font-sans">
                    ${(p.specs || []).map(s => `
                      <li class="flex items-start gap-2.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-2 shrink-0" aria-hidden="true"></span>
                        <span class="leading-relaxed text-sm sm:text-[15px]">${esc(s)}</span>
                      </li>
                    `).join('')}
                  </ul>

                  <div class="pt-3 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2 font-sans text-sm">
                    <div class="flex flex-wrap items-center gap-4">
                      ${p.repoUrl ? `<a href="${esc(p.repoUrl)}" target="_blank" rel="noopener noreferrer" class="font-semibold text-[#111111] hover:underline inline-flex items-center gap-1 min-h-[44px] sm:min-h-0 sm:py-1"><span>GitHub ↗</span></a>` : ''}
                      ${p.liveUrl ? `<a href="${esc(p.liveUrl)}" target="_blank" rel="noopener noreferrer" class="font-semibold text-[#111111] hover:underline inline-flex items-center gap-1 min-h-[44px] sm:min-h-0 sm:py-1"><span>Live Demo ↗</span></a>` : ''}
                    </div>
                    
                    ${p.caseStudy ? `
                      <button type="button" class="case-study-toggle-btn text-sm font-sans text-neutral-700 hover:text-[#111111] font-medium underline underline-offset-4 min-h-[44px] sm:min-h-0 py-1.5" data-target="case-${esc(p.id)}" aria-expanded="false" aria-controls="case-${esc(p.id)}">
                        <span>Case Study Details ↓</span>
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>

              ${p.caseStudy ? `
                <!-- Expandable Case Study Drawer -->
                <div id="case-${esc(p.id)}" class="case-study-drawer hidden pt-5 border-t border-neutral-200 text-sm font-sans text-neutral-700">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                    <div class="p-4 sm:p-5 rounded-[6px] bg-[#F9F9F9] border border-neutral-200 space-y-2">
                      <span class="text-sm font-heading font-semibold text-[#111111] block">1. Problem Context</span>
                      <p class="text-sm sm:text-[15px] leading-relaxed text-neutral-600">
                        ${esc(p.caseStudy.context)}
                      </p>
                    </div>
                    <div class="p-4 sm:p-5 rounded-[6px] bg-[#F9F9F9] border border-neutral-200 space-y-2">
                      <span class="text-sm font-heading font-semibold text-[#111111] block">2. Implementation</span>
                      <p class="text-sm sm:text-[15px] leading-relaxed text-neutral-600">
                        ${esc(p.caseStudy.approach)}
                      </p>
                    </div>
                    <div class="p-4 sm:p-5 rounded-[6px] bg-[#F9F9F9] border border-neutral-200 space-y-2">
                      <span class="text-sm font-heading font-semibold text-[#111111] block">3. Outcome</span>
                      <p class="text-sm sm:text-[15px] leading-relaxed text-neutral-600">
                        ${esc(p.caseStudy.outcome)}
                      </p>
                    </div>
                  </div>
                </div>
              ` : ''}
            </article>
          `).join('')}
        </div>
      </section>

      <!-- Secondary Projects & Systems Collection -->
      <section class="pt-12 border-t border-neutral-200 space-y-8" aria-labelledby="secondary-heading">
        <div>
          <p class="text-sm font-sans font-medium text-neutral-500 mb-1">Experiments &amp; Additional Builds</p>
          <h2 id="secondary-heading" class="font-heading section-title font-bold text-[#111111] tracking-tight">Specialized Systems, Tooling &amp; Research Models</h2>
          <p class="font-sans body-copy text-neutral-600 max-w-2xl font-normal mt-1">
            Rust prototypes, computer vision research, machine learning pipelines, mobile apps, and web systems.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          ${secondaryProjects.map((p, idx) => `
            <article id="${esc(p.id)}" class="p-5 sm:p-6 rounded-[6px] bg-[#FFFFFF] border border-neutral-200 hover:border-neutral-400 transition-colors space-y-4 flex flex-col justify-between scroll-mt-24">
              <div class="space-y-3">
                <div class="flex flex-wrap items-baseline justify-between gap-2 text-[13px] font-sans text-neutral-500 pb-3 border-b border-neutral-200">
                  <span class="text-[#111111] font-medium">${idx + 6 < 10 ? '0' : ''}${idx + 6} · ${esc(p.category)}</span>
                  <span>${esc(p.status)} · ${esc(p.year)}</span>
                </div>
                <div>
                  <h3 class="font-heading card-title font-bold text-[#111111] tracking-tight">
                    ${esc(p.title)}
                  </h3>
                  <p class="text-sm font-medium text-neutral-500 mt-0.5">
                    ${esc(p.subtitle)}
                  </p>
                </div>
                <p class="body-copy text-neutral-600 font-sans">
                  ${esc(p.description)}
                </p>
              </div>

              <div class="pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
                <div class="text-sm font-sans font-medium text-neutral-500 leading-relaxed">
                  ${p.technologies.map(t => esc(t)).join(' · ')}
                </div>
                ${p.repoUrl ? `<a href="${esc(p.repoUrl)}" target="_blank" rel="noopener noreferrer" class="font-semibold text-[#111111] hover:underline inline-flex items-center gap-1 font-sans text-sm min-h-[44px] sm:min-h-0 sm:py-1 shrink-0"><span>GitHub ↗</span></a>` : ''}
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    </div>
  </main>

  ${renderFooter()}
  <script type="module" src="/src/main.js"></script>
</body>
</html>`;
}

// =============================================================
// 3. PAGE: EXPERIENCE (/experience)
// =============================================================
function generateExperiencePage() {
  const experiences = portfolioData.experience;

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth bg-[#F9F9F9] text-[#111111]">
<head>
  ${renderHead(
    'Experience & Research | Panav Payappagoudar',
    'Chronological record of academic research, open-source participation, internships, and technical tutoring by Panav Payappagoudar.',
    '/experience'
  )}
</head>
<body class="antialiased bg-[#F9F9F9] text-[#111111] min-h-screen flex flex-col justify-between selection:bg-[#111111] selection:text-white">
  ${renderNav('experience')}

  <main id="main-content" class="flex-grow pt-24 sm:pt-32">
    <div class="max-w-5xl mx-auto px-5 sm:px-6 py-10 sm:py-12 text-left">
      <!-- Page Header -->
      <header class="mb-12 sm:mb-16 pb-8 border-b border-neutral-200 space-y-3 sm:space-y-4">
        <p class="text-sm font-sans font-medium text-neutral-500">Timeline</p>
        <h1 class="font-heading page-title font-bold tracking-tight text-[#111111]">Experience</h1>
        <p class="font-sans body-copy text-neutral-600 max-w-2xl font-normal">
          A chronological record of academic research, open-source cohorts, internships, independent projects, and technical mentoring.
        </p>
      </header>

      <!-- Progressive Timeline -->
      <div class="relative pl-7 sm:pl-48 space-y-8 sm:space-y-10" id="timeline-container">
        <!-- Progressive SVG line tracking scroll (static fallback always visible) -->
        <svg class="absolute left-3 sm:left-40 top-0 bottom-0 w-1 h-full pointer-events-none" aria-hidden="true" preserveAspectRatio="none">
          <line x1="0" y1="0" x2="0" y2="100%" stroke="#E4E4E7" stroke-width="2"></line>
          <line id="timeline-progress-line" x1="0" y1="0" x2="0" y2="100%" stroke="#111111" stroke-width="2" style="stroke-dasharray: 1000; stroke-dashoffset: 0;"></line>
        </svg>

        ${experiences.map(e => {
    const [expKind, expState] = (e.type || '').split(' · ');
    return `
          <div class="timeline-item relative group">
            <!-- Timeline Marker Dot -->
            <div class="timeline-dot absolute -left-[22px] sm:-left-[39px] top-3 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#FFFFFF] border-2 border-[#111111] group-hover:bg-[#111111] transition-colors" aria-hidden="true"></div>

            <!-- Date Left Rail on Desktop -->
            <div class="timeline-date-rail hidden sm:block sm:absolute sm:-left-48 top-2.5 text-[13px] font-sans font-medium text-neutral-500 text-right w-36 leading-snug">
              ${esc(e.period)}
            </div>

            <!-- Content Entry -->
            <article class="p-6 sm:p-8 rounded-[6px] bg-[#FFFFFF] border border-neutral-200 space-y-3 hover:border-neutral-400 transition-colors max-w-3xl">
              <div>
                <div class="flex flex-wrap items-baseline gap-x-2 text-[13px] sm:text-sm font-sans mb-1.5">
                  <span class="font-semibold text-[#111111]">${esc(expKind || e.type)}</span>
                  ${expState ? `<span class="text-neutral-300" aria-hidden="true">·</span><span class="text-neutral-500">${esc(expState)}</span>` : ''}
                  <span class="sm:hidden text-neutral-300" aria-hidden="true">·</span>
                  <span class="sm:hidden text-neutral-500">${esc(e.period)}</span>
                </div>

                <h2 class="font-heading text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
                  ${esc(e.role)}
                </h2>
                <div class="text-sm sm:text-base font-medium text-neutral-600 mt-0.5">
                  ${esc(e.organization)}
                </div>
              </div>

              <ul class="space-y-2 text-sm sm:text-[15px] text-neutral-700 leading-relaxed font-sans pt-1">
                ${e.highlights.map(h => `
                  <li class="flex items-start gap-2.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-2 shrink-0" aria-hidden="true"></span>
                    <span>${esc(h)}</span>
                  </li>
                `).join('')}
              </ul>
            </article>
          </div>
        `;
  }).join('')}
      </div>
    </div>
  </main>

  ${renderFooter()}
  <script type="module" src="/src/main.js"></script>
</body>
</html>`;
}

// =============================================================
// 4. PAGE: ACHIEVEMENTS (/achievements) — EDITORIAL CHRONOLOGICAL LIST
// =============================================================
function generateAchievementsPage() {
  const achievements = portfolioData.achievements;

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth bg-[#F9F9F9] text-[#111111]">
<head>
  ${renderHead(
    'Achievements & Recognition | Panav Payappagoudar',
    'Verified hackathon results, open-source selections, and training programs earned by Panav Payappagoudar.',
    '/achievements'
  )}
</head>
<body class="antialiased bg-[#F9F9F9] text-[#111111] min-h-screen flex flex-col justify-between selection:bg-[#111111] selection:text-white">
  ${renderNav('achievements')}

  <main id="main-content" class="flex-grow pt-24 sm:pt-32">
    <div class="max-w-5xl mx-auto px-5 sm:px-6 py-10 sm:py-12 text-left">
      <!-- Page Header -->
      <header class="mb-12 sm:mb-14 pb-8 border-b border-neutral-200 space-y-3 sm:space-y-4">
        <p class="text-sm font-sans font-medium text-neutral-500">Recognition &amp; Programs</p>
        <h1 class="font-heading page-title font-bold tracking-tight text-[#111111]">Achievements</h1>
        <p class="font-sans body-copy text-neutral-600 max-w-2xl font-normal">
          Hackathon placements, competitive program selections, and technical milestones across undergraduate study.
        </p>
      </header>

      <!-- Editorial Chronological List -->
      <div class="divide-y divide-neutral-200 border-b border-neutral-200">
        ${achievements.map((a, idx) => `
          <article class="py-7 sm:py-8 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 items-baseline">
            <div class="md:col-span-4 space-y-1 text-sm font-sans">
              <div class="flex items-center gap-2 text-neutral-500">
                <span class="text-[#111111] font-medium">0${idx + 1}</span>
                <span aria-hidden="true">·</span>
                <span>${esc(a.date)}</span>
              </div>
              <div class="${a.status === 'Winner' ? 'font-semibold text-[#111111]' : 'font-medium text-neutral-600'}">
                ${esc(a.status)}
              </div>
            </div>

            <div class="md:col-span-8 space-y-2">
              <h2 class="font-heading card-title font-bold text-[#111111] tracking-tight">
                ${esc(a.title)}
              </h2>
              <div class="text-sm font-sans font-medium text-neutral-500">
                ${esc(a.org)}
              </div>
              <p class="body-copy text-neutral-700 font-sans pt-1">
                ${esc(a.detail)}
              </p>
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  </main>

  ${renderFooter()}
  <script type="module" src="/src/main.js"></script>
</body>
</html>`;
}

// =============================================================
// 5. PAGE: ABOUT (/about)
// =============================================================
function generateAboutPage() {
  const about = portfolioData.personalInfo.about || {};
  const educationList = portfolioData.education || [];
  const capabilities = portfolioData.capabilities || [];

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth bg-[#F9F9F9] text-[#111111]">
<head>
  ${renderHead(
    'About Panav Payappagoudar',
    'Education at VIT-AP University, technical capabilities across applied ML and systems programming, and background of Panav Payappagoudar.',
    '/about'
  )}
</head>
<body class="antialiased bg-[#F9F9F9] text-[#111111] min-h-screen flex flex-col justify-between selection:bg-[#111111] selection:text-white">
  ${renderNav('about')}

  <main id="main-content" class="flex-grow pt-24 sm:pt-32">
    <div class="max-w-5xl mx-auto px-5 sm:px-6 py-10 sm:py-12 text-left space-y-14 sm:space-y-16">
      <!-- Page Header -->
      <header class="pb-8 border-b border-neutral-200 space-y-3 sm:space-y-4">
        <p class="text-sm font-sans font-medium text-neutral-500">Background</p>
        <h1 class="font-heading page-title font-bold tracking-tight text-[#111111]">About</h1>
        <p class="font-sans body-copy text-neutral-600 max-w-2xl font-normal">
          Education, technical interests, campus research, and independent experiments.
        </p>
      </header>

      <!-- Education & Background Narrative -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        <div class="lg:col-span-5 space-y-6">
          <h2 class="font-heading section-title font-bold text-[#111111] tracking-tight">Education</h2>
          <div class="space-y-6 border-l-2 border-neutral-200 pl-4">
            ${educationList.map(edu => `
              <div class="space-y-1">
                <div class="text-[13px] font-sans font-medium text-neutral-500">${esc(edu.period)}</div>
                <div class="font-heading font-bold text-base text-[#111111]">${esc(edu.institution)}</div>
                <div class="text-sm font-medium text-neutral-700">${esc(edu.degree)}</div>
                <p class="text-sm sm:text-[15px] text-neutral-600 leading-relaxed pt-1">${esc(edu.detail)}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="lg:col-span-7 space-y-5 body-copy text-neutral-700 font-sans">
          <p class="font-heading hero-lead font-semibold text-[#111111]">
            ${esc(about.lead)}
          </p>
          ${(about.paragraphs || []).map(p => `
            <p class="leading-relaxed text-neutral-600">${esc(p)}</p>
          `).join('')}
        </div>
      </section>

      <!-- Technical Focus Areas (Editorial Specification List) -->
      <section class="pt-12 border-t border-neutral-200 space-y-8" aria-labelledby="capabilities-heading">
        <div>
          <p class="text-sm font-sans font-medium text-neutral-500 mb-1">Technical Focus</p>
          <h2 id="capabilities-heading" class="font-heading section-title font-bold text-[#111111] tracking-tight">Tools &amp; Areas of Work</h2>
        </div>

        <div class="divide-y divide-neutral-200 border-t border-b border-neutral-200">
          ${capabilities.map(c => `
            <div class="py-6 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
              <div class="md:col-span-5 space-y-1">
                <h3 class="font-heading text-lg sm:text-xl font-bold text-[#111111] tracking-tight">${esc(c.discipline)}</h3>
                <p class="text-sm sm:text-[15px] text-neutral-600 leading-relaxed font-sans">${esc(c.description)}</p>
              </div>

              <div class="md:col-span-7 text-sm sm:text-base font-sans text-neutral-700 leading-relaxed">
                ${c.skills.map(s => esc(s)).join(' · ')}
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Beyond Coursework -->
      <section class="pt-12 border-t border-neutral-200 space-y-6" aria-labelledby="beyond-heading">
        <div>
          <p class="text-sm font-sans font-medium text-neutral-500 mb-1">Side Projects &amp; Writing</p>
          <h2 id="beyond-heading" class="font-heading section-title font-bold text-[#111111] tracking-tight">Outside Research</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-6 sm:p-8 rounded-[6px] bg-[#FFFFFF] border border-neutral-200 space-y-4 flex flex-col justify-between">
            <div class="space-y-2">
              <div class="flex flex-wrap items-center justify-between gap-2 text-[13px] font-sans font-medium text-neutral-500">
                <span>Independent Venture</span>
                <span>Oct 2025 – Present</span>
              </div>
              <h3 class="font-heading card-title font-bold text-[#111111]">The Essentialist</h3>
              <p class="body-copy text-neutral-600 font-sans">
                A minimalist print-on-demand apparel storefront built around clean typography and software engineering culture.
              </p>
            </div>
            <div class="pt-2">
              <a href="https://the-essentialist-2.creator-spring.com" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-sm font-sans font-semibold text-[#111111] hover:underline min-h-[44px] sm:min-h-0 sm:py-1">
                <span>Visit Storefront ↗</span>
              </a>
            </div>
          </div>

          <div class="p-6 sm:p-8 rounded-[6px] bg-[#FFFFFF] border border-neutral-200 space-y-4 flex flex-col justify-between">
            <div class="space-y-2">
              <div class="flex flex-wrap items-center justify-between gap-2 text-[13px] font-sans font-medium text-neutral-500">
                <span>Technical Writing</span>
                <span>Medium &amp; Hashnode</span>
              </div>
              <h3 class="font-heading card-title font-bold text-[#111111]">Notes &amp; Walkthroughs</h3>
              <p class="body-copy text-neutral-600 font-sans">
                Write-ups dissecting applied ML experiments, Web3 security designs, and hackathon build architectures.
              </p>
            </div>
            <div class="pt-2">
              <a href="https://panav-payappagoudar.medium.com/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-sm font-sans font-semibold text-[#111111] hover:underline min-h-[44px] sm:min-h-0 sm:py-1">
                <span>Read on Medium ↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>

  ${renderFooter()}
  <script type="module" src="/src/main.js"></script>
</body>
</html>`;
}

// =============================================================
// 6. PAGE: CONTACT (/contact)
// =============================================================
function generateContactPage() {
  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth bg-[#F9F9F9] text-[#111111]">
<head>
  ${renderHead(
    'Contact Panav Payappagoudar',
    'Get in touch with Panav Payappagoudar via direct email, Cal.com, or the verified contact form for internships and engineering research.',
    '/contact'
  )}
</head>
<body class="antialiased bg-[#F9F9F9] text-[#111111] min-h-screen flex flex-col justify-between selection:bg-[#111111] selection:text-white">
  ${renderNav('contact')}

  <main id="main-content" class="flex-grow pt-24 sm:pt-32">
    <div class="max-w-5xl mx-auto px-5 sm:px-6 py-10 sm:py-12 text-left">
      <!-- Page Header -->
      <header class="mb-12 sm:mb-14 pb-8 border-b border-neutral-200 space-y-3 sm:space-y-4">
        <p class="text-sm font-sans font-medium text-neutral-500">Get in Touch</p>
        <h1 class="font-heading page-title font-bold tracking-tight text-[#111111]">Contact</h1>
        <p class="font-sans body-copy text-neutral-600 max-w-2xl font-normal">
          Reach out regarding software engineering internships, machine learning research, or collaborative builds.
        </p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        <!-- Direct Info & Links -->
        <div class="lg:col-span-5 space-y-8 min-w-0">
          <div>
            <span class="text-sm font-sans font-medium text-neutral-500 block mb-1.5">Direct Email</span>
            <button type="button" id="copy-email-btn" class="max-w-full text-lg sm:text-2xl font-heading font-bold text-[#111111] hover:text-neutral-600 transition-colors flex flex-wrap items-center gap-2.5 sm:gap-3 text-left py-1 min-h-[44px]" title="Copy email address">
              <span id="copy-email-status" class="break-anywhere">${esc(portfolioData.personalInfo.email)}</span>
              <span class="text-xs font-sans font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-[6px] px-2.5 py-1 transition-colors shrink-0">Copy</span>
              <span class="sr-only">email address</span>
            </button>
          </div>

          <div class="p-5 sm:p-6 rounded-[6px] bg-[#FFFFFF] border border-neutral-200 space-y-4 text-sm font-sans">
            <div>
              <span class="text-[13px] text-neutral-500 block mb-0.5">Location</span>
              <span class="text-[#111111] font-medium">India</span>
            </div>
            <div>
              <span class="text-[13px] text-neutral-500 block mb-0.5">Availability</span>
              <span class="text-[#111111] font-medium leading-relaxed block">Open to internships, research collaborations &amp; technical discussions</span>
            </div>
            <div>
              <span class="text-[13px] text-neutral-500 block mb-0.5">Schedule a chat</span>
              <a href="https://cal.com/panav-payappagoudar/consulting" target="_blank" rel="noopener noreferrer" class="text-[#111111] hover:underline font-medium break-anywhere inline-flex items-center min-h-[44px] sm:min-h-0 sm:py-0.5">cal.com/panav-payappagoudar ↗</a>
            </div>
          </div>

          <div class="space-y-1 sm:space-y-2 font-sans text-sm">
            <span class="text-neutral-500 font-medium block mb-2">Profiles &amp; Writing</span>
            ${portfolioData.socials.map(s => `
              <div class="flex items-center justify-between py-2 sm:py-2.5 border-b border-neutral-200 gap-4">
                <span class="text-neutral-500 shrink-0">${esc(s.name)}</span>
                <a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" class="text-[#111111] hover:underline font-medium text-right break-anywhere inline-flex items-center min-h-[44px] sm:min-h-0">${esc(s.handle)} ↗</a>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Contact Form Card -->
        <div class="lg:col-span-7 p-5 sm:p-10 rounded-[6px] bg-[#FFFFFF] border border-neutral-200 min-w-0">
          <form id="contact-form" class="space-y-6" novalidate>
            <!-- Honeypot -->
            <div class="hidden" aria-hidden="true">
              <label>Leave blank: <input type="text" name="_honeypot" tabindex="-1" autocomplete="off" /></label>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label for="form-name" class="block text-sm font-sans font-medium text-[#111111] mb-2">Name <span class="text-neutral-400" aria-hidden="true">*</span></label>
                <input type="text" id="form-name" name="name" required aria-required="true" autocomplete="name" class="w-full px-3.5 py-2.5 min-h-[44px] bg-[#F9F9F9] focus:bg-[#FFFFFF] border border-neutral-300 rounded-[6px] text-[#111111] placeholder:text-neutral-400 font-sans text-sm sm:text-[15px] focus:outline-none focus:border-[#111111] transition-colors" placeholder="Your name" />
              </div>
              <div>
                <label for="form-email" class="block text-sm font-sans font-medium text-[#111111] mb-2">Email <span class="text-neutral-400" aria-hidden="true">*</span></label>
                <input type="email" id="form-email" name="email" required aria-required="true" autocomplete="email" class="w-full px-3.5 py-2.5 min-h-[44px] bg-[#F9F9F9] focus:bg-[#FFFFFF] border border-neutral-300 rounded-[6px] text-[#111111] placeholder:text-neutral-400 font-sans text-sm sm:text-[15px] focus:outline-none focus:border-[#111111] transition-colors" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label for="form-message" class="block text-sm font-sans font-medium text-[#111111] mb-2">Message <span class="text-neutral-400" aria-hidden="true">*</span></label>
              <textarea id="form-message" name="message" rows="5" required aria-required="true" class="w-full px-3.5 py-3 bg-[#F9F9F9] focus:bg-[#FFFFFF] border border-neutral-300 rounded-[6px] text-[#111111] placeholder:text-neutral-400 font-sans text-sm sm:text-[15px] focus:outline-none focus:border-[#111111] transition-colors resize-y" placeholder="Share details regarding your inquiry, project, or question..."></textarea>
            </div>

            <!-- ALTCHA Verification -->
            <div class="pt-1">
              <altcha-widget
                id="altcha-widget"
                challengeurl="/.netlify/functions/altcha"
                hidefooter="true"
                hidelogo="false"
                strings='{"label":"Verify you are human","verifying":"Verifying...","verified":"Verified"}'
              ></altcha-widget>
            </div>

            <!-- Error Banner -->
            <div id="form-error-alert" class="hidden p-3.5 rounded-[6px] bg-red-50 border border-red-200 text-red-700 text-sm font-sans" role="alert" aria-live="assertive"></div>

            <!-- Action Strip -->
            <div class="pt-1 flex flex-wrap items-center justify-between gap-4">
              <button type="submit" id="submit-btn" class="px-6 py-3 min-h-[44px] bg-[#111111] text-white font-sans font-medium rounded-[6px] hover:bg-neutral-800 transition-colors text-sm inline-flex items-center gap-2 disabled:opacity-60">
                <span>Send Message</span>
                <span aria-hidden="true">→</span>
              </button>
              <span id="form-status-msg" class="text-sm font-sans text-neutral-500" aria-live="polite"></span>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>

  <!-- Global Success Notification Modal -->
  <div id="success-modal" class="case-modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 opacity-0 pointer-events-none" role="dialog" aria-modal="true" aria-labelledby="modal-success-title">
    <div class="case-modal-panel w-full max-w-md bg-[#FFFFFF] border border-neutral-300 rounded-[6px] p-6 sm:p-8 text-left space-y-5 shadow-2xl">
      <div class="flex items-center justify-between">
        <span class="text-sm font-sans font-medium text-neutral-500">Confirmation</span>
        <button type="button" class="close-success-btn p-2 min-w-[44px] min-h-[44px] text-neutral-500 hover:text-[#111111] inline-flex items-center justify-center" aria-label="Close Notification">✕</button>
      </div>
      <h2 id="modal-success-title" class="font-heading text-2xl font-bold text-[#111111] tracking-tight">Message Sent</h2>
      <p class="text-sm text-neutral-600 leading-relaxed font-sans">
        Thank you for reaching out. Your message has been verified and sent. I will get back to you soon.
      </p>
      <button type="button" class="close-success-btn w-full py-3 min-h-[44px] bg-[#111111] text-white font-sans font-medium rounded-[6px] hover:bg-neutral-800 transition-colors text-sm">
        Close
      </button>
    </div>
  </div>

  ${renderFooter()}
  <script type="module" src="/src/main.js"></script>
</body>
</html>`;
}

// -------------------------------------------------------------
// EXECUTE GENERATION
// -------------------------------------------------------------
fs.writeFileSync(path.join(rootDir, 'index.html'), generateHomePage(), 'utf8');
console.log('[SUCCESS] index.html generated');

const workContent = generateWorkPage();
fs.writeFileSync(path.join(rootDir, 'work/index.html'), workContent, 'utf8');
fs.writeFileSync(path.join(rootDir, 'work.html'), workContent, 'utf8');
console.log('[SUCCESS] work/index.html & work.html generated');

const expContent = generateExperiencePage();
fs.writeFileSync(path.join(rootDir, 'experience/index.html'), expContent, 'utf8');
fs.writeFileSync(path.join(rootDir, 'experience.html'), expContent, 'utf8');
console.log('[SUCCESS] experience/index.html & experience.html generated');

const achContent = generateAchievementsPage();
fs.writeFileSync(path.join(rootDir, 'achievements/index.html'), achContent, 'utf8');
fs.writeFileSync(path.join(rootDir, 'achievements.html'), achContent, 'utf8');
console.log('[SUCCESS] achievements/index.html & achievements.html generated');

const aboutContent = generateAboutPage();
fs.writeFileSync(path.join(rootDir, 'about/index.html'), aboutContent, 'utf8');
fs.writeFileSync(path.join(rootDir, 'about.html'), aboutContent, 'utf8');
console.log('[SUCCESS] about/index.html & about.html generated');

const contactContent = generateContactPage();
fs.writeFileSync(path.join(rootDir, 'contact/index.html'), contactContent, 'utf8');
fs.writeFileSync(path.join(rootDir, 'contact.html'), contactContent, 'utf8');
console.log('[SUCCESS] contact/index.html & contact.html generated');
