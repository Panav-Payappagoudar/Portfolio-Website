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
                <div class="flex-shrink-0 pt-1">
                    <span class="font-mono text-[10px] text-brand-accent/70 tracking-widest uppercase leading-relaxed">${exp.date}</span>
                </div>
                <div>
                    <h4 class="text-base font-semibold text-white mb-1 group-hover:text-brand-accent transition-colors duration-300 tracking-tight">${exp.role}</h4>
                    <span class="font-mono text-[10px] text-white/35 uppercase tracking-widest">${exp.company}</span>
                    <p class="text-white/50 leading-[1.8] font-light mt-4 text-sm">${exp.description}</p>
                </div>
            </div>
        `).join('');
        html = html.replace('<!-- INJECT_EXPERIENCE -->', experienceHtml);

        // 4. Inject Projects — use inline grid-column style to guarantee spanning (Tailwind purges dynamic classes)
        const projectsHtml = portfolioData.projects.map((proj, index) => {
            const category = proj.tags?.[0] || 'Project';
            const link = proj.repoUrl && proj.repoUrl !== '#' ? proj.repoUrl : (proj.liveUrl !== '#' ? proj.liveUrl : null);

            const mediaHtml = proj.videoUrl
                ? `<div class="absolute inset-0 z-0">
                        <video src="${proj.videoUrl}" muted playsinline loop class="w-full h-full object-cover opacity-25 group-hover:opacity-55 transition-opacity duration-700"></video>
                        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                   </div>`
                : `<div class="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-brand-accent/8 via-transparent to-transparent"></div>`;

            // Use inline grid styles — guaranteed to work regardless of Tailwind purging
            let inlineStyle = `transition-delay: ${(index % 4) * 80}ms;`;
            let minH = 'min-height: 320px;';
            if (index === 0) {
                inlineStyle += ' grid-column: span 2; grid-row: span 2; min-height: 420px;';
                minH = '';
            } else if (index === 3 || index === 6 || index === 9) {
                inlineStyle += ' grid-column: span 2;';
            }

            return `
            <div class="project-card group relative p-7 rounded-2xl border border-white/[0.08] overflow-hidden interactable reveal-on-scroll text-left flex flex-col justify-end" data-category="${category}" style="${inlineStyle} ${minH} background: #040404;">
                ${mediaHtml}
                <div class="relative z-10 w-full mt-auto">
                    <div class="flex justify-between items-start mb-3">
                        <span class="font-mono text-[10px] text-brand-accent px-2 py-1 rounded border border-brand-accent/25 bg-brand-accent/8 tracking-widest uppercase">${category}</span>
                        ${link ? `<a href="${link}" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-full bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-200 interactable shrink-0" aria-label="View Project"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg></a>` : ''}
                    </div>
                    <h4 class="text-xl font-semibold text-white mb-2 tracking-tight leading-snug">${proj.title}</h4>
                    <p class="text-white/50 font-light text-sm mb-5 leading-relaxed line-clamp-3">${proj.description}</p>
                    <div class="flex flex-wrap gap-1.5">
                        ${(proj.tags || []).map(t => `<span class="px-2 py-0.5 bg-white/5 border border-white/[0.08] rounded text-[10px] font-mono text-white/40 uppercase tracking-wider">${t}</span>`).join('')}
                    </div>
                </div>
            </div>`;
        }).join('');
        html = html.replace('<!-- INJECT_PROJECTS -->', projectsHtml);

        // 5. Inject Achievements
        const trophyIcons = ['🏆','🎯','🥈','🔐','🥇','🏅','📜'];
        const achievementsHtml = portfolioData.achievements.map((ach, index) => `
            <div class="exp-row group grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 md:gap-12 py-9 px-5 border-b border-white/[0.05] last:border-0 reveal-on-scroll text-left" style="transition-delay: ${(index % 5) * 80}ms">
                <div class="flex-shrink-0 flex flex-col gap-1 pt-1">
                    <span class="text-lg">${trophyIcons[index] || '🏅'}</span>
                    <span class="font-mono text-[10px] text-brand-accent/70 tracking-widest uppercase leading-relaxed mt-1">${ach.date}</span>
                    <span class="font-mono text-[10px] text-white/25 uppercase tracking-wider leading-relaxed">${ach.organization}</span>
                </div>
                <div>
                    <h4 class="text-base font-semibold text-white mb-2 tracking-tight group-hover:text-brand-accent transition-colors duration-300">${ach.title}</h4>
                    <p class="text-white/50 leading-[1.8] text-sm font-light">${ach.description}</p>
                </div>
            </div>
        `).join('');
        html = html.replace('<!-- INJECT_ACHIEVEMENTS -->', achievementsHtml);

        // 6. Inject Education
        const eduHtml = portfolioData.education.map((edu, index) => `
            <div class="relative reveal-on-scroll text-left" style="transition-delay: ${index * 120}ms">
                <div class="absolute -left-[41px] top-6 w-4 h-4 rounded-full border-[3px] border-[#000] bg-brand-accent shadow-[0_0_20px_rgba(59,130,246,0.6)] z-10"></div>
                <div class="group p-7 rounded-2xl border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.02] transition-all duration-400 interactable w-full" style="background:#040404;">
                    <span class="font-mono text-[10px] text-brand-accent mb-2 block tracking-widest uppercase opacity-70">${edu.date}</span>
                    <h4 class="text-xl font-semibold text-white mb-1 tracking-tight">${edu.degree}</h4>
                    <span class="text-white/40 font-light block mb-3 text-sm">${edu.institution}</span>
                    <p class="text-white/50 font-light text-sm leading-relaxed">${edu.details}</p>
                </div>
            </div>
        `).join('');
        html = html.replace('<!-- INJECT_EDUCATION -->', eduHtml);

        // 7. Inject Skills — icons with direct comparison (no & encoding issues)
        const getCategoryIcon = (cat) => {
            if (cat.includes('AI') || cat.includes('Robot')) return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>`;
            if (cat.includes('Web3') || cat.includes('Security')) return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
            if (cat.includes('Engineer') || cat.includes('Infra')) return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`;
            if (cat.includes('Development') || cat.includes('Stack')) return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;
            if (cat.includes('Data') || cat.includes('Analysis')) return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`;
            return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`;
        };

        const skillsHtml = portfolioData.skills.map((cat, index) => `
            <div class="glow-card p-6 rounded-2xl reveal-on-scroll text-left relative overflow-hidden" style="transition-delay: ${(index % 3) * 100}ms">
                <div class="glow-border pointer-events-none"></div>
                <div class="relative z-10">
                    <div class="flex items-center gap-3 mb-5">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center text-brand-accent shrink-0" style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2);">
                            ${getCategoryIcon(cat.category)}
                        </div>
                        <h4 class="font-mono text-[10px] text-white/40 uppercase tracking-[0.25em]">${cat.category}</h4>
                    </div>
                    <div style="display:flex; flex-wrap:wrap; gap:6px;">
                        ${cat.items.map(item => `<span style="display:inline-block; padding:4px 10px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:6px; font-size:12px; font-weight:300; color:rgba(255,255,255,0.65); transition:all 0.2s ease; font-family:inherit;">${item}</span>`).join('')}
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
