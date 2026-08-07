import { defineConfig } from 'vite'
import { portfolioData } from './src/data/portfolio.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'html-inject-ssg',
      transformIndexHtml(html) {
        // 1. Inject Hero Bio
        html = html.replace('<!-- INJECT_HERO_BIO -->', portfolioData.personalInfo.bio);
        
        // 2. Inject About Text
        html = html.replace('<!-- INJECT_ABOUT_TEXT -->', portfolioData.personalInfo.about.replace(/\n\n/g, '<br><br>'));
        
        // 3. Inject Experience
        const experienceHtml = portfolioData.experience.map((exp, index) => `
            <div class="exp-row group grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 md:gap-12 py-10 px-5 border-b border-white/[0.05] last:border-0 reveal-on-scroll text-left" style="transition-delay: ${(index % 5) * 80}ms">
                <div class="flex-shrink-0">
                    <span class="font-mono text-xs text-brand-accent/70 tracking-widest uppercase">${exp.date}</span>
                </div>
                <div>
                    <h4 class="text-lg font-medium text-white mb-1 group-hover:text-brand-accent transition-colors duration-300">${exp.role}</h4>
                    <span class="font-mono text-xs text-white/40 uppercase tracking-widest">${exp.company}</span>
                    <p class="text-white/55 leading-relaxed font-light mt-4 text-sm">${exp.description}</p>
                </div>
            </div>
        `).join('');
        html = html.replace('<!-- INJECT_EXPERIENCE -->', experienceHtml);

        // 4. Inject Projects
        const projectsHtml = portfolioData.projects.map((proj, index) => {
            const category = proj.tags?.[0] || 'Project';
            const link = proj.liveUrl || proj.repoUrl || '#';
            const mediaHtml = proj.videoUrl 
                ? `
                    <div class="absolute inset-0 z-0">
                        <video src="${proj.videoUrl}" muted playsinline loop class="w-full h-full object-cover opacity-30 group-hover:opacity-60 transition-opacity duration-700"></video>
                        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
                    </div>
                `
                : `<div class="absolute inset-0 bg-gradient-to-br from-brand-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>`;

            // Magic Bento Grid Sizing Logic
            let spanClass = '';
            if (index === 0) spanClass = 'md:col-span-2 md:row-span-2 min-h-[400px]';
            else if (index === 3 || index === 6) spanClass = 'md:col-span-2';

            return `
            <div class="project-card group relative p-8 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/30 transition-all duration-500 flex flex-col justify-end min-h-[320px] overflow-hidden interactable reveal-on-scroll text-left ${spanClass}" data-category="${category}" style="transition-delay: ${(index % 4) * 100}ms">
                ${mediaHtml}
                <div class="relative z-10 w-full">
                    <div class="flex justify-between items-start mb-4">
                        <span class="font-mono text-xs text-brand-accent px-2 py-1 bg-brand-accent/10 rounded-sm border border-brand-accent/20 tracking-wider uppercase">${category}</span>
                        ${link !== '#' ? `<a href="${link}" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors interactable z-20 shrink-0" aria-label="View Project"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-right"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg></a>` : ''}
                    </div>
                    <h4 class="text-2xl font-medium text-white mb-2 tracking-tight drop-shadow-md">${proj.title}</h4>
                    <p class="text-white/70 font-light text-sm mb-6 leading-relaxed line-clamp-3 w-full">${proj.description}</p>
                    <div class="flex flex-wrap gap-2 mt-auto">
                        ${(proj.tags || []).map(t => `<span class="px-2 py-1 bg-black/50 backdrop-blur-md rounded border border-white/10 text-[10px] font-mono text-white/50 uppercase tracking-widest">${t}</span>`).join('')}
                    </div>
                </div>
            </div>`;
        }).join('');
        html = html.replace('<!-- INJECT_PROJECTS -->', projectsHtml);

        // 5. Inject Achievements
        const achievementsHtml = portfolioData.achievements.map((ach, index) => `
            <div class="exp-row group grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 md:gap-12 py-9 px-5 border-b border-white/[0.05] last:border-0 reveal-on-scroll text-left" style="transition-delay: ${(index % 5) * 80}ms">
                <div class="flex-shrink-0 flex flex-col gap-1">
                    <span class="font-mono text-xs text-brand-accent/70 tracking-widest uppercase">${ach.date}</span>
                    <span class="font-mono text-[10px] text-white/30 uppercase tracking-wider">${ach.organization}</span>
                </div>
                <div>
                    <h4 class="text-lg font-medium text-white mb-3 group-hover:text-brand-accent transition-colors duration-300">${ach.title}</h4>
                    <p class="text-white/55 leading-relaxed text-sm font-light">${ach.description}</p>
                </div>
            </div>
        `).join('');
        html = html.replace('<!-- INJECT_ACHIEVEMENTS -->', achievementsHtml);

        // 6. Inject Education
        const eduHtml = portfolioData.education.map((edu, index) => `
            <div class="relative reveal-on-scroll text-left" style="transition-delay: ${index * 100}ms">
                <div class="absolute -left-[41px] top-1 w-5 h-5 rounded-full border-[4px] border-black bg-brand-accent shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10 group-hover:scale-125 transition-transform duration-300"></div>
                <div class="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 interactable w-full">
                    <span class="font-mono text-xs text-brand-accent mb-2 block tracking-widest uppercase">${edu.date}</span>
                    <h4 class="text-2xl font-medium text-white mb-1">${edu.degree}</h4>
                    <span class="text-white/50 font-light block mb-4 text-sm">${edu.institution}</span>
                    <p class="text-white/60 font-light text-sm"><span class="text-brand-accent mr-2 opacity-50 block inline shrink-0">▪</span> ${edu.details}</p>
                </div>
            </div>
        `).join('');
        html = html.replace('<!-- INJECT_EDUCATION -->', eduHtml);

        // 7. Inject Skills
        const categoryIcons = {
            'AI/ML & Robotics': '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z"/><circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/></svg>',
            'Web3 & Security': '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
            'Engineering & Infra': '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
            'Development Stack': '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
            'Data & Analysis': '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        };
        const skillsHtml = portfolioData.skills.map((cat, index) => `
            <div class="glow-card p-7 rounded-2xl bg-[#080808] border border-white/[0.08] transition-all duration-500 group interactable reveal-on-scroll text-left relative overflow-hidden" style="transition-delay: ${(index % 3) * 120}ms">
                <div class="glow-border pointer-events-none"></div>
                <div class="relative z-10">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-9 h-9 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent shrink-0 group-hover:bg-brand-accent/20 transition-colors duration-300">
                            ${categoryIcons[cat.category] || ''}
                        </div>
                        <h4 class="font-mono text-[11px] text-white/50 uppercase tracking-[0.2em] group-hover:text-brand-accent transition-colors duration-300">${cat.category}</h4>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        ${cat.items.map(item => `<span class="skill-tag px-3 py-1.5 bg-white/[0.04] border border-white/[0.07] rounded-lg text-sm font-light text-white/60 hover:border-brand-accent/40 hover:text-white hover:bg-brand-accent/5 transition-all duration-200 cursor-default">${item}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
        html = html.replace('<!-- INJECT_SKILLS -->', skillsHtml);

        return html;
      }
    }
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
