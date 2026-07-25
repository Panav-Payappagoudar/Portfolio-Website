import { portfolioData } from './data/portfolio.js';
import { initNetworkBackground } from './network.js';
import Lenis from 'lenis';
import './index.css';

// Initialize Lenis for buttery smooth scrolling
// eslint-disable-next-line no-unused-vars
const lenis = new Lenis({
  autoRaf: true,
  smoothWheel: true
});

// --- RENDER LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    initNetworkBackground();

    // 1. Populate Text
    document.getElementById('hero-bio-display').textContent = portfolioData.personalInfo.bio;
    document.getElementById('about-text-display').innerHTML = portfolioData.personalInfo.about;
    const emailLink = document.getElementById('email-link');
    emailLink.innerHTML = `<i data-lucide="mail" class="w-6 h-6 shrink-0"></i><span>${portfolioData.personalInfo.email}</span>`;
    emailLink.removeAttribute('href');
    emailLink.style.cursor = 'pointer';
    emailLink.title = "Click to copy email";
    
    emailLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(portfolioData.personalInfo.email).then(() => {
            const originalHtml = emailLink.innerHTML;
            emailLink.innerHTML = `<i data-lucide="check" class="w-6 h-6 shrink-0 text-green-400"></i><span class="text-green-400 font-medium">Copied to clipboard!</span>`;
            if (window.lucide) window.lucide.createIcons();
            setTimeout(() => {
                emailLink.innerHTML = originalHtml;
                if (window.lucide) window.lucide.createIcons();
            }, 2000);
        });
    });

    // 2. Populate Experience (Clean List Layout + Scroll Animation)
    const expContainer = document.getElementById('experience-container');
    portfolioData.experience.forEach((exp, index) => {
        if (exp.role.includes("Founder")) return; 
        
        const item = document.createElement('div');
        item.className = 'group grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-4 md:gap-10 py-8 border-b border-white/5 last:border-0 hover:bg-white/[0.05] hover:scale-[1.01] transition-all duration-300 px-4 -mx-4 rounded-xl interactable reveal-on-scroll text-left';
        item.style.transitionDelay = `${index * 100}ms`;
        item.innerHTML = `
            <div class="flex-shrink-0">
                    <span class="font-mono text-xs text-white/40 group-hover:text-brand-accent transition-colors">${exp.date}</span>
            </div>
            <div class="overflow-hidden">
                <div class="flex flex-col mb-2">
                        <h4 class="text-lg font-medium text-white">${exp.role}</h4>
                        <span class="text-sm font-light text-white/50">${exp.company}</span>
                </div>
                <p class="text-white/60 leading-relaxed text-sm font-light break-words w-full">${exp.description}</p>
            </div>
        `;
        expContainer.appendChild(item);
    });

    // 3. Populate Projects (Bento Grid with 4-Column Puzzle Layout + Animation)
    const projContainer = document.getElementById('projects-container');
    const filterBtns = document.querySelectorAll('.filter-btn');

    const renderProjects = (filterCategory) => {
        projContainer.innerHTML = '';
        
        const filteredProjects = portfolioData.projects.filter(proj => {
            if (filterCategory === 'All') return true;
            
            const tags = proj.tags.map(t => t.toLowerCase());
            if (filterCategory === 'AI' && tags.some(t => ['ai', 'ml', 'tensorflow', 'pytorch', 'gemini 2.5', 'gemini', 'gans', 'cnns', 'scikit-learn', 'data processing'].includes(t))) return true;
            if (filterCategory === 'Web3' && tags.some(t => ['blockchain', 'solidity', 'web3', 'security', 'cryptography', 'ipfs'].includes(t))) return true;
            if (filterCategory === 'Systems' && tags.some(t => ['rust', 'systems', 'backend', 'django', 'fastapi', 'node.js', 'redis', 'postgresql', 'c++', 'embedded systems', 'robotics'].includes(t))) return true;
            
            return false;
        });

        filteredProjects.forEach((proj, index) => {
            const card = document.createElement('div');
            
            // --- BENTO LOGIC (4 Column Grid) ---
            let colSpan = "md:col-span-1";
            let rowSpan = "md:row-span-1";
            
            const patternIndex = index % 6;
            if (patternIndex === 0) { // Big Feature
                colSpan = "md:col-span-2";
                rowSpan = "md:row-span-2";
            } else if (patternIndex === 3) { // Wide
                colSpan = "md:col-span-2";
                rowSpan = "md:row-span-1";
            }

            card.className = `group bg-[#0A0A0A] border border-white/10 hover:border-brand-accent/40 hover:shadow-2xl hover:shadow-brand-accent/10 hover:scale-[1.02] p-6 rounded-2xl transition-all duration-500 flex flex-col justify-between interactable relative overflow-hidden ${colSpan} ${rowSpan} text-left opacity-0 animate-fade-in`;
            card.style.animationDelay = `${(index % 4) * 100}ms`;
            card.style.animationFillMode = 'forwards';
            
            const linksHtml = `
                <div class="flex gap-4 mt-auto pt-6 border-t border-white/5 group-hover:border-white/10 transition-colors z-20">
                    ${proj.liveUrl !== '#' ? `<a href="${proj.liveUrl}" target="_blank" rel="noopener noreferrer" class="text-[10px] font-mono tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-1.5">LIVE <i data-lucide="arrow-up-right" class="w-3 h-3"></i></a>` : ''}
                    ${proj.repoUrl !== '#' ? `<a href="${proj.repoUrl}" target="_blank" rel="noopener noreferrer" class="text-[10px] font-mono tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-1.5">CODE <i data-lucide="github" class="w-3 h-3"></i></a>` : ''}
                </div>
            `;

            card.innerHTML = `
                <div class="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:translate-x-0 translate-x-2">
                        <i data-lucide="arrow-up-right" class="w-5 h-5 text-brand-accent"></i>
                </div>
                
                <div class="relative z-10 flex flex-col h-full">
                    <div class="mb-4">
                        <h4 class="text-xl font-medium mb-2 text-white group-hover:text-brand-accent transition-colors">${proj.title}</h4>
                        <p class="text-white/50 text-xs leading-relaxed font-light line-clamp-3">${proj.description}</p>
                    </div>
                    <div class="flex flex-wrap gap-2 mt-auto mb-4">
                        ${proj.tags.slice(0, 4).map(tag => `<span class="px-2.5 py-1 bg-brand-accent/10 border border-brand-accent/30 text-[10px] font-mono text-brand-accent rounded-full">${tag}</span>`).join('')}
                    </div>
                    ${linksHtml}
                </div>
            `;
            projContainer.appendChild(card);
        });

        if (window.lucide) window.lucide.createIcons();
    };

    renderProjects('All');

    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => {
                    b.classList.remove('active', 'border-brand-accent/50', 'bg-brand-accent/10', 'text-brand-accent');
                    b.classList.add('border-white/10', 'bg-transparent', 'text-white/50');
                });
                const target = e.target;
                target.classList.add('active', 'border-brand-accent/50', 'bg-brand-accent/10', 'text-brand-accent');
                target.classList.remove('border-white/10', 'bg-transparent', 'text-white/50');
                
                renderProjects(target.getAttribute('data-filter'));
            });
        });
    }

    // 4. Populate Achievements (Clean List Layout)
    const achContainer = document.getElementById('achievements-container');
    if (portfolioData.achievements) {
        portfolioData.achievements.forEach((ach, index) => {
            const item = document.createElement('div');
            item.className = 'group grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-4 md:gap-10 py-8 border-b border-white/5 last:border-0 hover:bg-white/[0.05] hover:scale-[1.01] transition-all duration-300 px-4 -mx-4 rounded-xl interactable reveal-on-scroll text-left';
            item.style.transitionDelay = `${index * 100}ms`;
            item.innerHTML = `
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
            `;
            achContainer.appendChild(item);
        });
    }

    // 5. Populate Education (Vertical Timeline Style + Animation)
    const eduContainer = document.getElementById('education-container');
    portfolioData.education.forEach((edu, index) => {
        const item = document.createElement('div');
        item.className = "relative pl-8 reveal-on-scroll text-left";
        item.style.transitionDelay = `${index * 200}ms`;
        item.innerHTML = `
            <div class="absolute left-[-5px] top-2 w-2.5 h-2.5 bg-brand-accent rounded-full border-2 border-black"></div>
            <div class="flex flex-col pb-10 border-l border-white/5 last:border-0 last:pb-0 pl-6 -ml-6">
                <span class="text-2xl text-white font-light mb-1">${edu.institution}</span>
                <span class="text-brand-accent font-mono text-xs uppercase tracking-wider mb-2">${edu.degree}</span>
                <div class="flex justify-between items-center text-white/40 text-sm font-light mt-2">
                    <span>${edu.date}</span>
                </div>
                <span class="text-white/30 text-xs mt-2 font-mono leading-relaxed">${edu.details}</span>
            </div>
        `;
        eduContainer.appendChild(item);
    });

    // 5. Populate Skills (Professional Grid List + Animation)
    const skillsContainer = document.getElementById('skills-list-container');
    portfolioData.skills.forEach((cat, index) => {
        const categoryBlock = document.createElement('div');
        categoryBlock.className = "bg-[#050505] p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors reveal-on-scroll text-left";
        categoryBlock.style.transitionDelay = `${index * 100}ms`;
        categoryBlock.innerHTML = `
            <div class="flex items-center gap-3 mb-6">
                <h4 class="font-mono text-xs text-brand-accent uppercase tracking-widest">${cat.category}</h4>
            </div>
            <div class="flex flex-wrap gap-2">
                ${cat.items.map(skill => 
                    `<span class="border border-white/10 bg-white/[0.02] hover:bg-brand-accent/10 hover:border-brand-accent/50 hover:text-white hover:scale-110 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300 ease-out px-3 py-1.5 text-xs sm:text-sm text-white/70 rounded-md cursor-default inline-block">${skill}</span>`
                ).join('')}
            </div>
        `;
        skillsContainer.appendChild(categoryBlock);
    });

    // 6. Socials Footer
    const socialFooter = document.getElementById('socials-footer-container');
    portfolioData.socials.forEach(s => {
        socialFooter.innerHTML += `<a href="${s.url}" target="_blank" class="interactable text-white/30 hover:text-white transition-colors hover:scale-110 transform duration-200"><i data-lucide="${s.icon}" class="w-5 h-5"></i></a>`;
    });

    // Initialize Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Re-trigger observer for new elements
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        observer.observe(el);
    });


});

// Mobile Menu Logic
const menuBtn = document.getElementById('menu-btn');
const closeMenu = document.getElementById('close-menu');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

if (menuBtn && closeMenu && mobileMenu) {
    menuBtn.addEventListener('click', () => {
        mobileMenu.style.transform = 'translateX(0)';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling glitch on Android
    });

    const closeMobileMenu = () => {
        mobileMenu.style.transform = 'translateX(-100%)';
        document.body.style.overflow = '';
    };

    closeMenu.addEventListener('click', closeMobileMenu);
    mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));
}

// Custom Cursor Logic
if (window.matchMedia("(pointer: fine)").matches) {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    if (cursorDot && cursorOutline) {
        document.body.classList.add('cursor-none');
        let mouseX = 0, mouseY = 0;
        let outlineX = 0, outlineY = 0;
        const spotlight = document.getElementById('spotlight');

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;

            if (spotlight) {
                spotlight.style.opacity = '1';
                spotlight.style.background = `radial-gradient(circle 800px at ${mouseX}px ${mouseY}px, rgba(59, 130, 246, 0.08), transparent 40%)`;
            }
        });

        const animateCursor = () => {
            let dx = mouseX - outlineX;
            let dy = mouseY - outlineY;
            
            outlineX += dx * 0.15;
            outlineY += dy * 0.15;
            
            cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
            
            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        document.querySelectorAll('.interactable, a, button, input, textarea').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('hovering');
                cursorOutline.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('hovering');
                cursorOutline.classList.remove('hovering');
            });
        });
    }
}

// Form Submit Logic
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const successModal = document.getElementById('success-modal');
    const modalContent = document.getElementById('success-modal-content');
    const closeBtns = [document.getElementById('close-modal-btn'), document.getElementById('close-modal-btn-2')];
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'SENDING...';
            submitBtn.disabled = true;

            const formData = new FormData(contactForm);
            const jsonBody = Object.fromEntries(formData.entries());

            fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jsonBody)
            })
            .then(async response => {
                const data = await response.json().catch(() => ({}));
                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'Server error');
                }
                return data;
            })
            .then(() => {
                successModal.classList.remove('opacity-0', 'pointer-events-none');
                modalContent.classList.remove('scale-95');
                modalContent.classList.add('scale-100');
                
                // Manually clear fields to avoid web-component reset bugs
                contactForm.querySelectorAll('input:not([type="hidden"]), textarea').forEach(el => {
                    if (el.type === 'checkbox') {
                        el.checked = false;
                    } else {
                        el.value = '';
                    }
                });
                
                // Reset Altcha if method exists
                const altchaWidget = document.querySelector('altcha-widget');
                if (altchaWidget && typeof altchaWidget.reset === 'function') {
                    try { altchaWidget.reset(); } catch(error) { console.warn(error); }
                }
            })
            .catch(error => {
                console.error('Submission error:', error);
                alert('Something went wrong: ' + error.message);
            })
            .finally(() => {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            });
        });
    }

    const closeModal = () => {
        successModal.classList.add('opacity-0', 'pointer-events-none');
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-95');
    };

    closeBtns.forEach(btn => btn?.addEventListener('click', closeModal));
});
