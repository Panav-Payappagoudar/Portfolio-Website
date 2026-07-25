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

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.warn('SW registration failed: ', err);
        });
    });
}

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
            if (window.playPop) window.playPop();
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

            const videoHtml = proj.videoUrl ? `
                <video src="${proj.videoUrl}" muted loop playsinline class="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none z-0"></video>
            ` : '';

            card.innerHTML = `
                <div class="absolute inset-0 bg-gradient-to-br from-black/80 via-[#0A0A0A]/90 to-transparent z-10 pointer-events-none"></div>
                ${videoHtml}
                <div class="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>
                <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:translate-x-0 translate-x-2 z-20">
                        <i data-lucide="arrow-up-right" class="w-5 h-5 text-brand-accent"></i>
                </div>
                
                <div class="relative z-20 flex flex-col h-full">
                    <div class="mb-4">
                        <h4 class="text-xl font-medium mb-2 text-white group-hover:text-brand-accent transition-colors drop-shadow-md">${proj.title}</h4>
                        <p class="text-white/70 text-xs leading-relaxed font-light line-clamp-3 drop-shadow">${proj.description}</p>
                    </div>
                    <div class="flex flex-wrap gap-2 mt-auto mb-4">
                        ${proj.tags.slice(0, 4).map(tag => `<span class="px-2.5 py-1 bg-black/50 backdrop-blur border border-brand-accent/30 text-[10px] font-mono text-brand-accent rounded-full">${tag}</span>`).join('')}
                    </div>
                    ${linksHtml}
                </div>
            `;
            
            if (proj.videoUrl) {
                const videoEl = card.querySelector('video');
                card.addEventListener('mouseenter', () => {
                    if (videoEl) videoEl.play().catch(e => console.warn('Video play blocked:', e));
                });
                card.addEventListener('mouseleave', () => {
                    if (videoEl) {
                        videoEl.pause();
                        videoEl.currentTime = 0;
                    }
                });
            }

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

    // 7. Dynamic Copyright
    const copyrightYear = document.getElementById('copyright-year');
    if (copyrightYear) {
        copyrightYear.textContent = `© 2024–${new Date().getFullYear()}`;
    }

    // 8. Scroll Progress Indicator
    const scrollProgress = document.getElementById('scroll-progress');
    if (scrollProgress && typeof lenis !== 'undefined') {
        lenis.on('scroll', (e) => {
            const scrollPercent = (e.scroll / e.limit) * 100;
            scrollProgress.style.width = `${scrollPercent}%`;
        });
    }

    // 9. Cookie Consent Logic
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies');
    if (cookieBanner && acceptCookiesBtn) {
        if (!localStorage.getItem('cookieConsent')) {
            setTimeout(() => {
                cookieBanner.classList.remove('translate-y-full');
            }, 1000);
        }
        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'true');
            cookieBanner.classList.add('translate-y-full');
        });
    }

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
        
        // Magnetic Buttons Logic
        const magneticBtns = document.querySelectorAll('.btn-magnetic');
        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const h = rect.width / 2;
                const v = rect.height / 2;
                const x = e.clientX - rect.left - h;
                const y = e.clientY - rect.top - v;
                
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = `translate(0px, 0px)`;
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
            
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = `<svg class="animate-spin h-5 w-5 mx-auto text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
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
                if (window.playChime) window.playChime();
                successModal.classList.remove('hidden');
                // Small timeout to allow display:block to apply before animating opacity
                setTimeout(() => {
                    successModal.classList.remove('opacity-0', 'pointer-events-none');
                    modalContent.classList.remove('translate-y-4');
                    modalContent.classList.add('translate-y-0');
                }, 10);
                
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
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
            });
        });
    }

    const closeModal = () => {
        successModal.classList.add('opacity-0', 'pointer-events-none');
        modalContent.classList.add('translate-y-4');
        modalContent.classList.remove('translate-y-0');
        setTimeout(() => {
            successModal.classList.add('hidden');
        }, 300); // Wait for transition
    };

    closeBtns.forEach(btn => btn?.addEventListener('click', closeModal));
});

// --- COMMAND PALETTE LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const paletteOverlay = document.getElementById('cmd-palette-overlay');
    const palette = document.getElementById('cmd-palette');
    const input = document.getElementById('cmd-input');
    const resultsContainer = document.getElementById('cmd-results');
    
    if (!paletteOverlay || !input) return;

    let isOpen = false;
    let selectedIndex = 0;

    const commands = [
        { id: 'home', title: 'Go to Home', icon: 'home', action: () => { if(typeof lenis !== 'undefined') lenis.scrollTo(0); else window.scrollTo(0,0); } },
        { id: 'projects', title: 'Go to Projects', icon: 'code', action: () => { const el = document.getElementById('projects'); if(el && typeof lenis !== 'undefined') lenis.scrollTo(el); } },
        { id: 'experience', title: 'Go to Experience', icon: 'briefcase', action: () => { const el = document.getElementById('experience'); if(el && typeof lenis !== 'undefined') lenis.scrollTo(el); } },
        { id: 'contact', title: 'Go to Contact', icon: 'mail', action: () => { const el = document.getElementById('contact'); if(el && typeof lenis !== 'undefined') lenis.scrollTo(el); } },
        { id: 'github', title: 'Open GitHub', icon: 'github', action: () => window.open('https://github.com/Panav-Payappagoudar', '_blank') },
        { id: 'linkedin', title: 'Open LinkedIn', icon: 'linkedin', action: () => window.open('https://linkedin.com/in/panav-payappagoudar', '_blank') },
        { id: 'email', title: 'Copy Email Address', icon: 'copy', action: () => {
            navigator.clipboard.writeText('panav.p@proton.me');
            alert('Email copied to clipboard!');
        }}
    ];

    let filteredCommands = [...commands];

    const togglePalette = (force) => {
        isOpen = force !== undefined ? force : !isOpen;
        if (isOpen) {
            paletteOverlay.classList.remove('opacity-0', 'pointer-events-none');
            palette.classList.remove('scale-95');
            palette.classList.add('scale-100');
            input.value = '';
            filterResults('');
            setTimeout(() => input.focus(), 100);
        } else {
            paletteOverlay.classList.add('opacity-0', 'pointer-events-none');
            palette.classList.remove('scale-100');
            palette.classList.add('scale-95');
            input.blur();
        }
    };

    const renderResults = () => {
        resultsContainer.innerHTML = '';
        if (filteredCommands.length === 0) {
            resultsContainer.innerHTML = '<div class="px-4 py-3 text-sm text-white/50 text-center font-mono">No commands found.</div>';
            return;
        }

        filteredCommands.forEach((cmd, index) => {
            const isSelected = index === selectedIndex;
            const el = document.createElement('div');
            el.className = `px-4 py-3 flex items-center rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-brand-accent/20 text-brand-accent' : 'text-white/70 hover:bg-white/5 hover:text-white'}`;
            el.innerHTML = `
                <i data-lucide="${cmd.icon}" class="w-4 h-4 mr-3 ${isSelected ? 'text-brand-accent' : 'text-white/50'}"></i>
                <span class="text-sm font-medium">${cmd.title}</span>
                ${isSelected ? '<span class="ml-auto text-[10px] font-mono opacity-50">ENTER</span>' : ''}
            `;
            
            el.addEventListener('click', () => {
                cmd.action();
                togglePalette(false);
            });
            
            el.addEventListener('mousemove', () => {
                if (selectedIndex !== index) {
                    selectedIndex = index;
                    renderResults();
                }
            });

            resultsContainer.appendChild(el);
        });

        if (window.lucide) window.lucide.createIcons();
    };

    const filterResults = (query) => {
        const q = query.toLowerCase();
        filteredCommands = commands.filter(cmd => cmd.title.toLowerCase().includes(q) || cmd.id.includes(q));
        selectedIndex = 0;
        renderResults();
    };

    input.addEventListener('input', (e) => {
        filterResults(e.target.value);
    });

    window.addEventListener('keydown', (e) => {
        // Cmd+K or Ctrl+K
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            togglePalette();
        }
        
        if (!isOpen) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            togglePalette(false);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % filteredCommands.length;
            renderResults();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
            renderResults();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
                filteredCommands[selectedIndex].action();
                togglePalette(false);
            }
        }
    });

    paletteOverlay.addEventListener('click', (e) => {
        if (e.target === paletteOverlay) togglePalette(false);
    });
});

// --- UI SOUND DESIGN ENGINE ---
document.addEventListener('DOMContentLoaded', () => {
    const soundToggle = document.getElementById('sound-toggle');
    const iconOn = document.getElementById('sound-icon-on');
    const iconOff = document.getElementById('sound-icon-off');
    
    if (!soundToggle) return;

    let soundEnabled = localStorage.getItem('soundEnabled') === 'true';
    let audioCtx = null;

    const initAudio = () => {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    };

    const updateToggleUI = () => {
        if (soundEnabled) {
            iconOff.classList.add('opacity-0', 'scale-50');
            iconOn.classList.remove('opacity-0', 'scale-50');
            soundToggle.classList.add('text-brand-accent');
            soundToggle.classList.remove('text-white/50');
        } else {
            iconOn.classList.add('opacity-0', 'scale-50');
            iconOff.classList.remove('opacity-0', 'scale-50');
            soundToggle.classList.remove('text-brand-accent');
            soundToggle.classList.add('text-white/50');
        }
    };

    updateToggleUI();

    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        localStorage.setItem('soundEnabled', soundEnabled.toString());
        updateToggleUI();
        if (soundEnabled) {
            initAudio();
            playPop(); // Feedback sound
        }
    });

    // Synthesizer Functions
    const playTick = () => {
        if (!soundEnabled || !audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    };

    const playPop = () => {
        if (!soundEnabled || !audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    };

    const playChime = () => {
        if (!soundEnabled || !audioCtx) return;
        
        const playTone = (freq, delay) => {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
            
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime + delay);
            gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + delay + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + 1.5);
            
            osc.start(audioCtx.currentTime + delay);
            osc.stop(audioCtx.currentTime + delay + 1.5);
        };

        playTone(523.25, 0); // C5
        playTone(659.25, 0.1); // E5
        playTone(783.99, 0.2); // G5
        playTone(1046.50, 0.3); // C6
    };

    // Attach Event Listeners
    // Use mouseover for event delegation to catch all dynamically created interactables
    document.body.addEventListener('mouseover', (e) => {
        if (!soundEnabled) return;
        // Check if element or parent has interactable class
        const target = e.target.closest('.interactable, .btn-magnetic, .group, a, button');
        if (target && !target.dataset.soundHovered) {
            target.dataset.soundHovered = 'true';
            playTick();
            target.addEventListener('mouseleave', () => {
                target.dataset.soundHovered = '';
            }, { once: true });
        }
    });

    // We can export these globally if needed, or attach them to specific actions
    window.playPop = playPop;
    window.playChime = playChime;
});
// Global Loader Fade Out
window.addEventListener('load', () => {
    const loader = document.getElementById('global-loader');
    if (loader) {
        // Add a tiny delay so the progress bar is visible for at least a split second
        setTimeout(() => {
            loader.classList.add('opacity-0');
            setTimeout(() => loader.remove(), 500); // Remove from DOM after fade
        }, 100);
    }
});
