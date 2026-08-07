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
            <div class="group grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-4 md:gap-10 py-10 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors duration-500 px-4 -mx-4 rounded-xl interactable reveal-on-scroll text-left" style="transition-delay: ${index * 100}ms">
                <div class="flex-shrink-0">
                    <span class="font-mono text-sm text-brand-accent/80 transition-colors">${exp.date}</span>
                </div>
                <div class="overflow-hidden">
                    <div class="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
                        <div class="flex flex-col">
                            <h4 class="text-xl font-medium text-white group-hover:text-brand-accent transition-colors">${exp.role}</h4>
                            <span class="text-base font-light text-white/50">${exp.company}</span>
                        </div>
                    </div>
                    <p class="text-white/60 leading-relaxed font-light mt-4 mb-4 break-words w-full text-sm">${exp.description}</p>
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
            <div class="group grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-4 md:gap-10 py-8 border-b border-white/5 last:border-0 hover:bg-white/[0.05] hover:scale-[1.01] transition-all duration-300 px-4 -mx-4 rounded-xl interactable reveal-on-scroll text-left" style="transition-delay: ${index * 100}ms">
                <div class="flex-shrink-0">
                    <span class="font-mono text-xs text-brand-accent transition-colors">${ach.date}</span>
                </div>
                <div class="overflow-hidden">
                    <div class="flex flex-col mb-2">
                        <h4 class="text-lg font-medium text-white">${ach.title}</h4>
                        <span class="text-sm font-light text-white/50">${ach.organization}</span>
                    </div>
                    <p class="text-white/60 leading-relaxed text-sm font-light break-words w-full">${ach.description}</p>
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
        const skillsHtml = portfolioData.skills.map((cat, index) => `
            <div class="glow-card p-6 rounded-2xl bg-black border border-white/10 transition-all duration-500 group interactable reveal-on-scroll text-left relative overflow-hidden shadow-xl" style="transition-delay: ${(index % 3) * 100}ms">
                <div class="glow-border pointer-events-none"></div>
                <div class="relative z-10">
                    <h4 class="font-mono text-xs text-white/50 uppercase tracking-[0.2em] mb-6 group-hover:text-brand-accent transition-colors">${cat.category}</h4>
                    <div class="flex flex-wrap gap-2">
                        ${cat.items.map(item => `<span class="px-3 py-1.5 bg-white/5 border border-white/5 rounded-md text-sm font-light text-white/70 group-hover:border-white/20 transition-colors">${item}</span>`).join('')}
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
