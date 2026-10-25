import { defineConfig } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { portfolioData } from './src/data/portfolio.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    {
      name: 'html-inject-ssg',
      transformIndexHtml(html) {
        // 1. Inject Hero Section (Art-directed editorial composition)
        const heroHtml = `
          <div class="reveal-on-scroll">
            <!-- Dateline & Research Anchor -->
            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between pb-6 mb-10 sm:mb-14 border-b border-[rgba(243,239,230,0.08)] text-xs font-mono text-[#9e9a91]">
              <div class="flex items-center gap-2.5">
                <span class="w-1.5 h-1.5 rounded-full bg-[#c47847]"></span>
                <span class="text-[#f3efe6] font-medium tracking-tight">Panav Payappagoudar</span>
                <span class="text-[#8e8a82]">/</span>
                <span>Systems & Applied ML Researcher</span>
              </div>
              <div class="mt-2 sm:mt-0 text-[#8e8a82]">
                <span>VIT-AP University (ECS) · Amazon ML Scholar ’26</span>
              </div>
            </div>

            <!-- Large, Confident Headline with Editorial Serif -->
            <h1 class="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-[4.75rem] font-normal text-[#f3efe6] leading-[1.06] tracking-tight mb-8 max-w-5xl">
              Building software at the boundaries of <em class="italic font-normal text-[#c47847]">numerical physics</em>, satellite observation, & resilient systems.
            </h1>

            <!-- Narrative Supporting Copy -->
            <p class="text-base sm:text-lg text-[#9e9a91] font-light leading-relaxed max-w-2xl mb-12">
              Undergraduate researcher in the School of Electronics & Computer Science at VIT-AP University, and Amazon ML Summer Scholar ’26. Exploring deterministic simulation engines, automated remote sensing pipelines, and agentic clinical architectures.
            </p>

            <!-- Quiet, Functional Navigation Index -->
            <div class="flex flex-wrap items-center gap-6 pt-6 border-t border-[rgba(243,239,230,0.08)] text-xs font-mono">
              <a href="#work" class="text-[#f3efe6] hover:text-[#c47847] transition-colors flex items-center gap-1.5 underline underline-offset-4">
                <span>Selected Work (12)</span>
                <span>↓</span>
              </a>
              <a href="#experience" class="text-[#9e9a91] hover:text-[#f3efe6] transition-colors flex items-center gap-1.5">
                <span>Experience & Timeline</span>
                <span>↓</span>
              </a>
              <a href="#venture" class="text-[#9e9a91] hover:text-[#f3efe6] transition-colors flex items-center gap-1.5">
                <span>Venture</span>
                <span>↓</span>
              </a>
              <a href="#about" class="text-[#9e9a91] hover:text-[#f3efe6] transition-colors flex items-center gap-1.5">
                <span>About</span>
                <span>↓</span>
              </a>
              <button id="hero-copy-email-btn" class="text-[#9e9a91] hover:text-[#f3efe6] transition-colors flex items-center gap-1.5 ml-auto" title="Copy panav.p@proton.me">
                <span id="hero-copy-email-status">panav.p@proton.me</span>
              </button>
            </div>
          </div>
        `;
        html = html.replace('<!-- INJECT_HERO -->', heroHtml);

        // 2. Inject ALL 12 Projects in ONE Unified Collection
        const categoryMap = {
          'gravity-sandbox': 'systems',
          'claim-agent': 'ai',
          'geospatial-change': 'ai',
          'securex': 'security',
          'omitfs': 'systems',
          'vectorgit': 'systems',
          'human-following-robot': 'robotics',
          'sketch-to-face': 'ai',
          'gridshield': 'security',
          'clarity-ai': 'ai',
          'healthguard-ai': 'ai',
          'travel-booking': 'systems'
        };

        const projectsHtml = portfolioData.projects.map((p) => {
          const categorySlug = categoryMap[p.id] || 'systems';

          return `
            <div class="project-entry border border-[rgba(243,239,230,0.08)] bg-[#14151a] p-8 sm:p-10 rounded-lg flex flex-col justify-between reveal-on-scroll text-left group" data-category="${categorySlug}">
              <div>
                <!-- Metadata line: Category, Year, and Accolade -->
                <div class="flex flex-wrap items-baseline justify-between gap-2 mb-4 font-mono text-xs">
                  <div class="flex items-center gap-2">
                    <span class="text-[#c47847] uppercase tracking-wider">${p.category}</span>
                    <span class="text-[#8e8a82]">·</span>
                    <span class="text-[#8e8a82]">${p.year}</span>
                  </div>
                  ${p.accolade ? `<span class="text-[#f3efe6] font-medium text-xs">★ ${p.accolade}</span>` : ''}
                </div>

                <!-- Project Title & Subtitle -->
                <h3 class="font-editorial text-2xl sm:text-3xl font-normal text-[#f3efe6] tracking-tight mb-2 group-hover:text-[#c47847] transition-colors">
                  ${p.title}
                </h3>
                <p class="text-xs font-mono text-[#9e9a91] mb-6">${p.subtitle}</p>

                <!-- Natural, Concise Description -->
                <p class="text-sm text-[#9e9a91] font-light leading-relaxed mb-6">
                  ${p.description}
                </p>
              </div>

              <!-- Footer with Technologies and Direct Links -->
              <div class="pt-6 border-t border-[rgba(243,239,230,0.08)] mt-auto">
                <div class="text-xs font-mono text-[#8e8a82] mb-4">
                  ${p.technologies.slice(0, 5).join(' · ')}
                </div>

                <div class="flex items-center justify-between font-mono text-xs pt-1">
                  <div class="flex items-center gap-4">
                    ${p.repoUrl ? `<a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer" class="text-[#f3efe6] hover:text-[#c47847] underline underline-offset-4 transition-colors">Source code ↗</a>` : ''}
                    ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="text-[#c47847] hover:underline underline-offset-4 transition-colors">Live demo ↗</a>` : ''}
                  </div>
                  <button class="open-case-study-btn text-[#9e9a91] hover:text-[#f3efe6] flex items-center gap-1.5 transition-colors" data-project-id="${p.id}">
                    <span>Case study</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('');
        html = html.replace('<!-- INJECT_PROJECTS -->', projectsHtml);

        // 3. Inject Experience & Research Appointments
        const experienceHtml = portfolioData.experience.map((exp) => `
          <div class="py-8 border-b border-[rgba(243,239,230,0.08)] last:border-0 reveal-on-scroll text-left">
            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between mb-2">
              <h3 class="text-base font-medium text-[#f3efe6] tracking-tight">
                ${exp.role}
              </h3>
              <span class="font-mono text-xs text-[#8e8a82] mt-1 sm:mt-0">${exp.period}</span>
            </div>
            <div class="text-xs font-mono text-[#c47847] mb-3">${exp.organization} · ${exp.type}</div>
            <p class="text-sm text-[#9e9a91] font-light leading-relaxed">
              ${exp.description}
            </p>
          </div>
        `).join('');
        html = html.replace('<!-- INJECT_EXPERIENCE -->', experienceHtml);

        // 4. Inject Honors & Achievements
        const achievementsHtml = portfolioData.achievements.map((ach) => `
          <div class="py-4 border-b border-[rgba(243,239,230,0.08)] last:border-0 text-left">
            <div class="flex items-baseline justify-between mb-1">
              <h4 class="text-sm font-medium text-[#f3efe6]">${ach.title}</h4>
              <span class="font-mono text-[10px] text-[#8e8a82]">${ach.date}</span>
            </div>
            <div class="text-xs font-mono text-[#c47847] mb-1.5">${ach.org}</div>
            <p class="text-xs text-[#9e9a91] font-light leading-relaxed">${ach.detail}</p>
          </div>
        `).join('');
        html = html.replace('<!-- INJECT_ACHIEVEMENTS -->', achievementsHtml);

        // 5. Inject About / Disciplines Cards
        const capabilitiesHtml = `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            ${portfolioData.capabilities.map((cap) => `
              <div class="border border-[rgba(243,239,230,0.08)] bg-[#14151a] p-8 rounded-lg reveal-on-scroll">
                <h3 class="text-base font-medium text-[#f3efe6] mb-2">${cap.discipline}</h3>
                <p class="text-xs text-[#9e9a91] font-light leading-relaxed mb-6">${cap.description}</p>
                <div class="text-xs font-mono text-[#8e8a82] leading-relaxed">
                  ${cap.skills.join(' · ')}
                </div>
              </div>
            `).join('')}
          </div>
        `;
        html = html.replace('<!-- INJECT_ABOUT -->', capabilitiesHtml);

        // 6. Inject Case Study Modals for all 12 projects
        const modalsHtml = portfolioData.projects.map((p) => `
          <div id="modal-${p.id}" class="case-study-modal fixed inset-0 z-[100] modal-backdrop flex items-center justify-center p-4 opacity-0 pointer-events-none transition-all duration-300" role="dialog" aria-modal="true" aria-labelledby="modal-title-${p.id}">
            <div class="bg-[#14151a] border border-[rgba(243,239,230,0.12)] rounded-lg p-6 sm:p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto text-left relative shadow-2xl">
              <button class="close-case-study-btn absolute top-5 right-5 text-[#9e9a91] hover:text-[#f3efe6] p-2" data-modal-id="modal-${p.id}" aria-label="Close modal">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>

              <div class="text-xs font-mono text-[#c47847] mb-2">
                ${p.category} · ${p.year}
              </div>
              <h2 id="modal-title-${p.id}" class="font-editorial text-3xl sm:text-4xl text-[#f3efe6] font-normal tracking-tight mb-2">
                ${p.title}
              </h2>
              <p class="text-xs font-mono text-[#9e9a91] mb-8">${p.subtitle}</p>

              <div class="space-y-6 text-sm text-[#9e9a91] font-light leading-relaxed border-t border-[rgba(243,239,230,0.08)] pt-6">
                <div>
                  <h3 class="font-mono text-xs uppercase tracking-wider text-[#f3efe6] mb-2 font-medium">Problem & Context</h3>
                  <p>${p.caseStudy ? p.caseStudy.context : p.description}</p>
                </div>

                ${p.caseStudy ? `
                  <div>
                    <h3 class="font-mono text-xs uppercase tracking-wider text-[#f3efe6] mb-2 font-medium">Engineering Approach</h3>
                    <p>${p.caseStudy.approach}</p>
                  </div>

                  <div>
                    <h3 class="font-mono text-xs uppercase tracking-wider text-[#f3efe6] mb-2 font-medium">Outcome & Impact</h3>
                    <p class="text-[#f3efe6]">${p.caseStudy.outcome}</p>
                  </div>
                ` : ''}
              </div>

              <div class="mt-8 pt-6 border-t border-[rgba(243,239,230,0.08)] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                <div class="text-[#8e8a82]">
                  ${p.technologies.slice(0, 5).join(' · ')}
                </div>
                <div class="flex items-center gap-4">
                  ${p.repoUrl ? `<a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer" class="text-[#f3efe6] hover:underline">Source code ↗</a>` : ''}
                  ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="text-[#c47847] hover:underline">Live demo ↗</a>` : ''}
                </div>
              </div>
            </div>
          </div>
        `).join('');
        html = html.replace('<!-- INJECT_CASE_STUDY_MODALS -->', modalsHtml);

        return html;
      }
    },
    {
      name: 'netlify-functions-dev',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const host = req.headers.host || 'localhost:5173';
          const url = new URL(req.url, `http://${host}`);
          const pathname = url.pathname;

          let handlerFn = null;
          if (pathname === '/.netlify/functions/altcha' || pathname === '/api/altcha' || pathname === '/.netlify/functions/api/altcha') {
            const mod = await import('./netlify/functions/altcha.js');
            handlerFn = mod.handler;
          } else if (pathname === '/.netlify/functions/submit' || pathname === '/api/submit' || pathname === '/.netlify/functions/api/submit') {
            const mod = await import('./netlify/functions/submit.js');
            handlerFn = mod.handler;
          }

          if (!handlerFn) {
            return next();
          }

          try {
            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            const rawBody = Buffer.concat(chunks).toString('utf8');

            const event = {
              httpMethod: req.method,
              headers: req.headers,
              queryStringParameters: Object.fromEntries(url.searchParams.entries()),
              body: rawBody
            };

            const result = await handlerFn(event);
            res.statusCode = result.statusCode || 200;
            for (const [key, val] of Object.entries(result.headers || {})) {
              res.setHeader(key, val);
            }
            res.end(result.body || '');
          } catch (err) {
            console.error('[VITE DEV FUNCTIONS ERROR]', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, message: err.message }));
          }
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
        notFound: resolve(__dirname, '404.html')
      }
    }
  }
})
