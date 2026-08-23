import { portfolioData } from './data/portfolio.js';
import Lenis from 'lenis';
import { initBackground } from './canvas-bg.js';
import './index.css';

// Initialize Lenis for buttery smooth scrolling
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

    // Initialize Background
    initBackground();

    // Mobile Menu Logic
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuBackdrop = document.getElementById('mobile-menu-backdrop');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const body = document.body;

    const toggleMenu = (show) => {
        if (show) {
            mobileMenu.classList.remove('translate-x-full');
            menuBackdrop.classList.remove('opacity-0', 'pointer-events-none');
            body.style.overflow = 'hidden';
        } else {
            mobileMenu.classList.add('translate-x-full');
            menuBackdrop.classList.add('opacity-0', 'pointer-events-none');
            body.style.overflow = '';
        }
    };

    if (menuBtn && closeBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => toggleMenu(true));
        closeBtn.addEventListener('click', () => toggleMenu(false));
        menuBackdrop.addEventListener('click', () => toggleMenu(false));
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                toggleMenu(false);
            });
        });
    }

    // Glow Cards Mouse Tracking
    document.getElementById('skills-list-container')?.addEventListener('mousemove', e => {
        for(const card of document.querySelectorAll('.glow-card')) {
            const rect = card.getBoundingClientRect(),
                  x = e.clientX - rect.left,
                  y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        }
    });

    // 1. Setup Email Copy
    const emailLink = document.getElementById('email-link');
    if (emailLink) {
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
    }

    // 3. Project Interactivity (Filters & Video Hover)
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Attach video hover events
    const attachVideoEvents = () => {
        const cards = document.querySelectorAll('.project-card');
        cards.forEach(card => {
            const videoEl = card.querySelector('video');
            if (videoEl) {
                card.addEventListener('mouseenter', () => {
                    videoEl.play().catch(e => console.warn('Video play blocked:', e));
                });
                card.addEventListener('mouseleave', () => {
                    videoEl.pause();
                    videoEl.currentTime = 0;
                });
            }
        });
    };

    const filterProjects = (filterCategory) => {
        const cards = document.querySelectorAll('.project-card');
        cards.forEach((card, index) => {
            const category = card.getAttribute('data-category');
            
            let shouldShow = false;
            if (filterCategory === 'All') {
                shouldShow = true;
            } else if (category === filterCategory) {
                shouldShow = true;
            } else if (filterCategory === 'AI' && category === 'AI & Data') {
                shouldShow = true;
            } else if (filterCategory === 'Web3' && category === 'Web3 & Security') {
                shouldShow = true;
            } else if (filterCategory === 'Systems' && category === 'Systems & Backend') {
                shouldShow = true;
            }

            if (shouldShow) {
                card.style.display = 'flex';
                card.style.animationDelay = `${(index % 4) * 100}ms`;
                card.classList.add('animate-fade-in');
            } else {
                card.style.display = 'none';
                card.classList.remove('animate-fade-in');
            }
        });
    };

    attachVideoEvents();

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
                filterProjects(target.getAttribute('data-filter'));
            });
        });
    }

    // --- 3D TILT PHYSICS ENGINE ---
    const init3DTilt = () => {
        const cards = document.querySelectorAll('.project-card');
        
        // Detect touch device to disable complex 3D math on mobile (prevents scroll jank)
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (isTouchDevice) return;

        cards.forEach(card => {
            let bounds;
            
            const rotateToMouse = (e) => {
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                const leftX = mouseX - bounds.x;
                const topY = mouseY - bounds.y;
                const center = {
                    x: leftX - bounds.width / 2,
                    y: topY - bounds.height / 2
                };
                
                // Calculate Rotation
                const maxRotation = 15; // Max degrees of tilt
                
                const tiltX = (center.y / (bounds.height / 2)) * -maxRotation;
                const tiltY = (center.x / (bounds.width / 2)) * maxRotation;
                
                card.style.transform = `perspective(1000px) scale(1.02) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-5px)`;
                
                // Update Glare Pos
                card.style.setProperty('--mouse-x', `${leftX}px`);
                card.style.setProperty('--mouse-y', `${topY}px`);
            };

            card.addEventListener('mouseenter', () => {
                bounds = card.getBoundingClientRect();
                card.classList.remove('is-leaving');
                document.addEventListener('mousemove', rotateToMouse);
            });

            card.addEventListener('mouseleave', () => {
                document.removeEventListener('mousemove', rotateToMouse);
                card.classList.add('is-leaving');
                card.style.transform = 'perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg) translateY(0px)';
                card.style.setProperty('--mouse-x', '50%');
                card.style.setProperty('--mouse-y', '50%');
            });
        });
    };
    init3DTilt();
    // 6. Socials Footer
    const socialFooter = document.getElementById('socials-footer-container');
    if (socialFooter) {
        portfolioData.socials.forEach(s => {
            socialFooter.innerHTML += `<a href="${s.url}" target="_blank" class="interactable text-white/30 hover:text-white transition-colors hover:scale-110 transform duration-200">${s.svg}</a>`;
        });
    }

    // Initialize Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Re-trigger observer for new elements
    const observerOptions = {
        threshold: 0.05,
        rootMargin: "0px 0px -40px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Apply stagger to sibling elements within same container
                const siblings = entry.target.parentElement?.querySelectorAll('.reveal-on-scroll:not(.revealed)');
                if (siblings && siblings.length > 1) {
                    let delay = 0;
                    siblings.forEach(sib => {
                        if (!sib.classList.contains('revealed')) {
                            setTimeout(() => {
                                sib.classList.add('revealed');
                                observer.unobserve(sib);
                            }, delay);
                            delay += 70;
                        }
                    });
                } else {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // Immediately reveal any already-visible elements (above the fold)
    setTimeout(() => {
        document.querySelectorAll('.reveal-on-scroll:not(.revealed)').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('revealed');
                observer.unobserve(el);
            }
        });
    }, 300);

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

// Global cursor logic continues
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

        // Attach cursor hover effects to interactive elements
        const attachCursorHover = (el) => {
            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('hovering');
                cursorOutline.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('hovering');
                cursorOutline.classList.remove('hovering');
            });
        };

        document.querySelectorAll('.interactable, a, button, input, textarea').forEach(attachCursorHover);
        
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

// ========================================================
// CONTACT FORM SUBMIT LOGIC (with proper Altcha extraction)
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const successModal = document.getElementById('success-modal');
    const modalContent = document.getElementById('success-modal-content');
    const closeBtns = [document.getElementById('close-modal-btn'), document.getElementById('close-modal-btn-2')];
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const originalBtnHtml = submitBtn.innerHTML;
            
            // --- Extract Altcha payload from the web component ---
            // The Altcha widget with auto="onsubmit" should have already solved
            // the challenge by the time the form submits. We read its value.
            const altchaWidget = document.querySelector('altcha-widget');
            let altchaPayload = null;
            
            if (altchaWidget) {
                // Method 1: Read from the widget's .value property (standard way)
                altchaPayload = altchaWidget.value;
                
                // Method 2: Fallback — look for a hidden input the widget may inject
                if (!altchaPayload) {
                    const hiddenInput = contactForm.querySelector('input[name="altcha"]');
                    if (hiddenInput) {
                        altchaPayload = hiddenInput.value;
                    }
                }
            }
            
            if (!altchaPayload) {
                alert('Please complete the CAPTCHA verification first.');
                return;
            }
            
            submitBtn.innerHTML = `<svg class="animate-spin h-5 w-5 mx-auto text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
            submitBtn.disabled = true;

            // Build JSON body manually (NOT from FormData, which can't read web components)
            const nameVal = contactForm.querySelector('input[name="name"]')?.value || '';
            const emailVal = contactForm.querySelector('input[name="email"]')?.value || '';
            const messageVal = contactForm.querySelector('textarea[name="message"]')?.value || '';
            const honeypotVal = contactForm.querySelector('input[name="_honeypot"]')?.value || '';
            
            const jsonBody = {
                name: nameVal,
                email: emailVal,
                message: messageVal,
                altcha: altchaPayload,
                _honeypot: honeypotVal
            };

            try {
                const response = await fetch('/.netlify/functions/api/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(jsonBody)
                });
                
                const data = await response.json().catch(() => ({}));
                
                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'Server error');
                }
                
                if (window.playChime) window.playChime();
                successModal.classList.remove('hidden');
                // Small timeout to allow display:block to apply before animating opacity
                setTimeout(() => {
                    successModal.classList.remove('opacity-0', 'pointer-events-none');
                    modalContent.classList.remove('translate-y-4');
                    modalContent.classList.add('translate-y-0');
                }, 10);
                
                // Manually clear fields to avoid web-component reset bugs
                contactForm.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]), textarea').forEach(el => {
                    el.value = '';
                });
                // Uncheck consent checkbox
                const consentCb = contactForm.querySelector('#consent');
                if (consentCb) consentCb.checked = false;
                
                // Reset Altcha widget
                if (altchaWidget && typeof altchaWidget.reset === 'function') {
                    try { altchaWidget.reset(); } catch(error) { console.warn(error); }
                }
            } catch (error) {
                console.error('Submission error:', error);
                alert('Something went wrong: ' + error.message);
            } finally {
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
            }
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
        { id: 'github', title: 'Open GitHub', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>', action: () => window.open('https://github.com/Panav-Payappagoudar', '_blank') },
        { id: 'linkedin', title: 'Open LinkedIn', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>', action: () => window.open('https://linkedin.com/in/panav-payappagoudar', '_blank') },
        { id: 'email', title: 'Copy Email Address', icon: 'copy', action: () => {
            navigator.clipboard.writeText(portfolioData.personalInfo.email);
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
            
            const iconHtml = cmd.svg 
                ? cmd.svg.replace('<svg ', `<svg class="w-4 h-4 mr-3 shrink-0 ${isSelected ? 'text-brand-accent' : 'text-white/50'}" `)
                : `<i data-lucide="${cmd.icon}" class="w-4 h-4 mr-3 shrink-0 ${isSelected ? 'text-brand-accent' : 'text-white/50'}"></i>`;
                
            el.innerHTML = `
                ${iconHtml}
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
