import Lenis from 'lenis';
import 'altcha';
import './index.css';

// 1. Initialize Lenis for smooth, restrained scrolling (respecting reduced motion preferences)
const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
  new Lenis({
    autoRaf: true,
    smoothWheel: true,
    duration: 0.85,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
  });
}

// 2. Unregister legacy service workers if any exist
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;

  // -------------------------------------------------------------
  // 3. UNIFIED PROJECTS FILTER & REAL-TIME KEYWORD SEARCH
  // -------------------------------------------------------------
  const filterTabs = document.querySelectorAll('#project-filter-tabs .filter-tab');
  const projectSearchInput = document.getElementById('project-search');
  const projectEntries = document.querySelectorAll('#projects-list .project-entry');
  const filterStatus = document.getElementById('filter-status');
  const noProjectsMsg = document.getElementById('no-projects-message');
  const resetFilterBtn = document.getElementById('reset-filter-btn');

  let activeFilter = 'all';
  let searchQuery = '';

  const applyFilters = () => {
    let visibleCount = 0;
    projectEntries.forEach(entry => {
      const category = entry.getAttribute('data-category') || '';
      const text = entry.textContent.toLowerCase();

      const matchesCategory = (activeFilter === 'all') || (category === activeFilter);
      const matchesSearch = !searchQuery || text.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        entry.style.display = '';
        visibleCount++;
      } else {
        entry.style.display = 'none';
      }
    });

    if (noProjectsMsg) {
      if (visibleCount === 0) {
        noProjectsMsg.classList.remove('hidden');
      } else {
        noProjectsMsg.classList.add('hidden');
      }
    }

    if (filterStatus) {
      filterStatus.textContent = visibleCount === 0 ? 'No projects match your filter' : `Showing ${visibleCount} projects`;
    }
  };

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      activeFilter = tab.getAttribute('data-filter') || 'all';
      applyFilters();
    });
  });

  if (projectSearchInput) {
    projectSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  if (resetFilterBtn) {
    resetFilterBtn.addEventListener('click', () => {
      activeFilter = 'all';
      searchQuery = '';
      if (projectSearchInput) projectSearchInput.value = '';
      filterTabs.forEach(t => {
        const isAll = (t.getAttribute('data-filter') || 'all') === 'all';
        t.classList.toggle('active', isAll);
        t.setAttribute('aria-selected', isAll ? 'true' : 'false');
      });
      applyFilters();
      if (projectSearchInput) projectSearchInput.focus();
    });
  }

  // -------------------------------------------------------------
  // 4. ONE-CLICK EMAIL COPY
  // -------------------------------------------------------------
  const setupEmailCopy = (btnId, statusId, emailStr) => {
    const btn = document.getElementById(btnId);
    const status = document.getElementById(statusId);
    if (!btn || !status) return;

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(emailStr);
        const originalText = status.textContent;
        status.textContent = 'Copied to clipboard';
        status.classList.add('text-[#c47847]');
        setTimeout(() => {
          status.textContent = originalText;
          status.classList.remove('text-[#c47847]');
        }, 2200);
      } catch (err) {
        console.error('Clipboard copy error:', err);
      }
    });
  };

  setupEmailCopy('hero-copy-email-btn', 'hero-copy-email-status', 'panav.p@proton.me');
  setupEmailCopy('copy-email-btn', 'copy-email-status', 'panav.p@proton.me');

  // -------------------------------------------------------------
  // 5. MOBILE NAVIGATION DRAWER & FOCUS MANAGEMENT
  // -------------------------------------------------------------
  const menuBtn = document.getElementById('menu-btn');
  const closeMenuBtn = document.getElementById('close-menu');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileBackdrop = document.getElementById('mobile-menu-backdrop');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  let previousActiveElement = null;

  const toggleMenu = (show) => {
    if (!mobileMenu || !mobileBackdrop) return;
    if (show) {
      previousActiveElement = document.activeElement;
      menuBtn?.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.remove('invisible', 'translate-x-full');
      mobileBackdrop.classList.remove('opacity-0', 'pointer-events-none');
      body.style.overflow = 'hidden';
      closeMenuBtn?.focus();
    } else {
      menuBtn?.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.add('translate-x-full');
      mobileBackdrop.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => {
        mobileMenu.classList.add('invisible');
      }, 300);
      body.style.overflow = '';
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
      }
    }
  };

  menuBtn?.addEventListener('click', () => toggleMenu(true));
  closeMenuBtn?.addEventListener('click', () => toggleMenu(false));
  mobileBackdrop?.addEventListener('click', () => toggleMenu(false));
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // -------------------------------------------------------------
  // 6. CASE STUDY MODALS WITH FOCUS TRAP & ACCESSIBILITY
  // -------------------------------------------------------------
  const openCaseStudyBtns = document.querySelectorAll('.open-case-study-btn');
  const closeCaseStudyBtns = document.querySelectorAll('.close-case-study-btn');
  const modals = document.querySelectorAll('.case-study-modal');
  let modalActiveTrigger = null;

  const openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modalActiveTrigger = document.activeElement;
    modal.classList.remove('opacity-0', 'pointer-events-none');
    body.style.overflow = 'hidden';
    
    // Set focus to the close button inside modal
    const closeBtn = modal.querySelector('.close-case-study-btn');
    if (closeBtn) closeBtn.focus();
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.add('opacity-0', 'pointer-events-none');
    body.style.overflow = '';
    if (modalActiveTrigger && typeof modalActiveTrigger.focus === 'function') {
      modalActiveTrigger.focus();
      modalActiveTrigger = null;
    }
  };

  openCaseStudyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projectId = btn.getAttribute('data-project-id');
      if (projectId) openModal(`modal-${projectId}`);
    });
  });

  closeCaseStudyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = btn.getAttribute('data-modal-id');
      if (modalId) {
        closeModal(document.getElementById(modalId));
      } else {
        closeModal(btn.closest('.case-study-modal'));
      }
    });
  });

  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });

    // Keyboard tab loop trapping inside modal
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  });

  // Global Escape key handler
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modals.forEach(modal => {
        if (!modal.classList.contains('pointer-events-none')) {
          closeModal(modal);
        }
      });
      const successModal = document.getElementById('success-modal');
      if (successModal && !successModal.classList.contains('pointer-events-none')) {
        successModal.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => successModal.classList.add('hidden'), 300);
      }
      if (mobileMenu && !mobileMenu.classList.contains('invisible')) {
        toggleMenu(false);
      }
      body.style.overflow = '';
    }
  });

  // -------------------------------------------------------------
  // 7. SCROLL REVEAL OBSERVER
  // -------------------------------------------------------------
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: "0px 0px -30px 0px"
    });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
  } else {
    document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('revealed'));
  }

  // -------------------------------------------------------------
  // 8. DYNAMIC COPYRIGHT YEAR
  // -------------------------------------------------------------
  const copyrightYear = document.getElementById('copyright-year');
  if (copyrightYear) {
    copyrightYear.textContent = `© 2024–${new Date().getFullYear()} Panav Payappagoudar. All rights reserved.`;
  }

  // -------------------------------------------------------------
  // 9. ALTCHA CONTACT FORM SUBMISSION WITH ACCESSIBLE FEEDBACK
  // -------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const successModal = document.getElementById('success-modal');
  const closeSuccessBtns = [document.getElementById('close-modal-btn'), document.getElementById('close-modal-btn-2')];
  const submitBtn = document.getElementById('submit-btn');
  const formErrorAlert = document.getElementById('form-error-alert');

  const showFormError = (msg) => {
    if (formErrorAlert) {
      formErrorAlert.textContent = msg;
      formErrorAlert.classList.remove('hidden');
      formErrorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      console.error(msg);
    }
  };

  const clearFormError = () => {
    if (formErrorAlert) {
      formErrorAlert.textContent = '';
      formErrorAlert.classList.add('hidden');
    }
  };

  const resetAltcha = () => {
    const widget = contactForm?.querySelector('altcha-widget');
    if (widget && typeof widget.reset === 'function') {
      try {
        widget.reset();
      } catch (err) {
        console.warn('Altcha reset warning:', err);
      }
    }
    const hiddenInput = contactForm?.querySelector('input[name="altcha"]');
    if (hiddenInput) {
      hiddenInput.value = '';
    }
  };

  if (contactForm && submitBtn) {
    const altchaEl = contactForm.querySelector('altcha-widget');
    if (altchaEl) {
      altchaEl.addEventListener('statechange', (ev) => {
        const state = ev.detail?.state;
        if (state === 'expired') {
          resetAltcha();
          showFormError('The security challenge expired. Please check the box again to continue.');
        } else if (state === 'error') {
          showFormError('Security challenge encountered a connection error. Please try again.');
        }
      });
    }

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearFormError();
      
      const originalBtnHtml = submitBtn.innerHTML;
      const altchaWidget = contactForm.querySelector('altcha-widget');
      let altchaPayload = null;
      
      if (altchaWidget) {
        altchaPayload = altchaWidget.value;
        if (!altchaPayload) {
          const hiddenInput = contactForm.querySelector('input[name="altcha"]');
          if (hiddenInput) altchaPayload = hiddenInput.value;
        }
      }
      
      if (!altchaPayload) {
        showFormError('Please verify the security challenge checkbox before sending your message.');
        return;
      }
      
      submitBtn.innerHTML = `<span>Sending...</span>`;
      submitBtn.disabled = true;

      const payload = {
        name: contactForm.querySelector('input[name="name"]')?.value || '',
        email: contactForm.querySelector('input[name="email"]')?.value || '',
        message: contactForm.querySelector('textarea[name="message"]')?.value || '',
        altcha: altchaPayload,
        _honeypot: contactForm.querySelector('input[name="_honeypot"]')?.value || ''
      };

      try {
        let response = await fetch('/.netlify/functions/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok && response.status === 404) {
          response = await fetch('/.netlify/functions/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
        
        const data = await response.json().catch(() => ({}));
        
        if (!response.ok || !data.success) {
          resetAltcha();
          throw new Error(data.message || 'Server error occurred during message transmission.');
        }
        
        if (successModal) {
          successModal.classList.remove('hidden');
          requestAnimationFrame(() => {
            successModal.classList.remove('opacity-0', 'pointer-events-none');
            const dismissBtn = successModal.querySelector('button');
            if (dismissBtn) dismissBtn.focus();
          });
        }

        contactForm.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]), textarea').forEach(el => {
          el.value = '';
        });
        const consentCb = contactForm.querySelector('#consent');
        if (consentCb) consentCb.checked = false;
        
        resetAltcha();
      } catch (err) {
        console.error('Submission error:', err);
        resetAltcha();
        showFormError(err.message || 'Unable to deliver message at this time. Please try emailing directly at panav.p@proton.me.');
      } finally {
        submitBtn.innerHTML = originalBtnHtml;
        submitBtn.disabled = false;
      }
    });
  }

  closeSuccessBtns.forEach(btn => {
    btn?.addEventListener('click', () => {
      if (successModal) {
        successModal.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => successModal.classList.add('hidden'), 300);
      }
    });
  });

  // 10. Altcha logo link accessible name check for WCAG link-name compliance
  const fixAltchaAccessibility = () => {
    const widget = document.querySelector('altcha-widget');
    if (widget && widget.shadowRoot) {
      const logoLink = widget.shadowRoot.querySelector('a.altcha-logo');
      if (logoLink && !logoLink.getAttribute('aria-label')) {
        logoLink.setAttribute('aria-label', 'Altcha verification website');
      }
    }
  };
  setTimeout(fixAltchaAccessibility, 200);
  setTimeout(fixAltchaAccessibility, 1000);

  // -------------------------------------------------------------
  // 11. ROLLS-ROYCE-INSPIRED CIRCULAR CURSOR
  // -------------------------------------------------------------
  const initRollsRoyceCursor = () => {
    // 1. Guard against duplicate execution
    if (typeof window === 'undefined' || window.__rrCursorInitialized) return;

    // 2. Fine pointer and hover media query check (desktop only, preserve touch on mobile/tablets)
    const finePointerMedia = window.matchMedia('(pointer: fine) and (hover: hover)');
    if (!finePointerMedia.matches) return;

    window.__rrCursorInitialized = true;

    // 3. Reduced motion preference
    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    let isReducedMotion = reducedMotionMedia.matches;
    reducedMotionMedia.addEventListener('change', (e) => {
      isReducedMotion = e.matches;
    });

    // 4. Inject cursor DOM element if not already present
    let cursorEl = document.getElementById('rr-cursor');
    if (!cursorEl) {
      cursorEl = document.createElement('div');
      cursorEl.id = 'rr-cursor';
      cursorEl.setAttribute('aria-hidden', 'true');
      cursorEl.innerHTML = `
        <div class="rr-cursor-ring-pos" id="rr-cursor-ring-pos">
          <div class="rr-cursor-ring" id="rr-cursor-ring">
            <span class="rr-cursor-label" id="rr-cursor-label">VIEW</span>
          </div>
        </div>
        <div class="rr-cursor-dot-pos" id="rr-cursor-dot-pos">
          <div class="rr-cursor-dot" id="rr-cursor-dot"></div>
        </div>
      `;
      document.body.appendChild(cursorEl);
    }

    const ringPosEl = document.getElementById('rr-cursor-ring-pos');
    const dotPosEl = document.getElementById('rr-cursor-dot-pos');
    if (!ringPosEl || !dotPosEl) return;

    // 5. Coordinates and animation state
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let dotX = -100;
    let dotY = -100;

    let hasMoved = false;
    let isVisible = false;
    let isClicking = false;
    let currentState = 'default'; // 'default' | 'hover' | 'view' | 'hidden'
    let rafId = null;

    let lastRenderedRingX = -999;
    let lastRenderedRingY = -999;
    let lastRenderedDotX = -999;
    let lastRenderedDotY = -999;

    // 6. State updater function
    const setCursorState = (state) => {
      if (currentState === state) return;
      currentState = state;

      cursorEl.classList.toggle('is-hover', state === 'hover');
      cursorEl.classList.toggle('is-view', state === 'view');
      cursorEl.classList.toggle('is-hidden', state === 'hidden');
    };

    // 7. RequestAnimationFrame loop for smooth easing movement
    const render = () => {
      if (hasMoved && isVisible) {
        const ringLerp = isReducedMotion ? 1.0 : 0.16;
        const dotLerp = isReducedMotion ? 1.0 : 0.72;

        ringX += (mouseX - ringX) * ringLerp;
        ringY += (mouseY - ringY) * ringLerp;

        dotX += (mouseX - dotX) * dotLerp;
        dotY += (mouseY - dotY) * dotLerp;

        // Snap when close to resting coordinates
        if (Math.abs(mouseX - ringX) < 0.05 && Math.abs(mouseY - ringY) < 0.05) {
          ringX = mouseX;
          ringY = mouseY;
        }
        if (Math.abs(mouseX - dotX) < 0.05 && Math.abs(mouseY - dotY) < 0.05) {
          dotX = mouseX;
          dotY = mouseY;
        }

        // Optimize DOM style updates to avoid unnecessary paint churn
        if (Math.abs(ringX - lastRenderedRingX) > 0.08 || Math.abs(ringY - lastRenderedRingY) > 0.08) {
          ringPosEl.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0)`;
          lastRenderedRingX = ringX;
          lastRenderedRingY = ringY;
        }
        if (Math.abs(dotX - lastRenderedDotX) > 0.08 || Math.abs(dotY - lastRenderedDotY) > 0.08) {
          dotPosEl.style.transform = `translate3d(${dotX.toFixed(2)}px, ${dotY.toFixed(2)}px, 0)`;
          lastRenderedDotX = dotX;
          lastRenderedDotY = dotY;
        }
      }
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    // 8. Event delegation helper to determine hovered interactive state
    const evaluateTargetState = (target, e) => {
      if (!target || !(target instanceof Element)) return 'default';

      // A. Form controls, text inputs, textareas, selects, and Altcha widget -> restore native cursor
      const isInputOrAltcha = target.closest('input, textarea, select, [contenteditable="true"], altcha-widget, [data-cursor-hidden]') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'ALTCHA-WIDGET';

      const path = (e && typeof e.composedPath === 'function') ? e.composedPath() : [];
      const isPathInputOrAltcha = path.some(el =>
        el instanceof Element && (
          el.tagName === 'ALTCHA-WIDGET' ||
          el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.tagName === 'SELECT' ||
          el.hasAttribute('data-cursor-hidden')
        )
      );

      if (isInputOrAltcha || isPathInputOrAltcha) {
        return 'hidden';
      }

      // B. Direct actions inside project entry (e.g., links or buttons within card) -> standard hover ring
      if (target.closest('.project-entry a, .project-entry button')) {
        return 'hover';
      }

      // C. Project card / portfolio entry -> expanded ring with "VIEW" badge
      if (target.closest('.project-entry, [data-cursor-view]')) {
        return 'view';
      }

      // D. Clickable links, buttons, tab filters, and interactive controls -> standard hover ring
      if (target.closest('a, button, [role="button"], [role="tab"], .filter-tab, summary, label[for]')) {
        return 'hover';
      }

      return 'default';
    };

    // 9. Pointer Move Handler
    const handlePointerMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!hasMoved) {
        hasMoved = true;
        isVisible = true;
        ringX = mouseX;
        ringY = mouseY;
        dotX = mouseX;
        dotY = mouseY;
        cursorEl.classList.add('rr-cursor-active');
        document.body.classList.add('has-custom-cursor');
      } else if (!isVisible) {
        isVisible = true;
        cursorEl.classList.add('rr-cursor-active');
      }

      setCursorState(evaluateTargetState(e.target, e));
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // 10. Pointer Leave / Enter Viewport Handlers
    document.addEventListener('mouseleave', () => {
      isVisible = false;
      cursorEl.classList.remove('rr-cursor-active');
    });

    document.addEventListener('mouseenter', (e) => {
      if (hasMoved) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        ringX = mouseX;
        ringY = mouseY;
        dotX = mouseX;
        dotY = mouseY;
        isVisible = true;
        cursorEl.classList.add('rr-cursor-active');
        setCursorState(evaluateTargetState(e.target, e));
      }
    });

    // 11. Mouse Down / Up Tactile Feedback
    window.addEventListener('mousedown', (e) => {
      if (currentState !== 'hidden' && e.button === 0) {
        isClicking = true;
        cursorEl.classList.add('is-clicking');
      }
    });

    window.addEventListener('mouseup', () => {
      if (isClicking) {
        isClicking = false;
        cursorEl.classList.remove('is-clicking');
      }
    });

    // 12. Cleanup if pointer capabilities change (e.g. docking/undocking or switching device mode)
    finePointerMedia.addEventListener('change', (e) => {
      if (!e.matches) {
        document.body.classList.remove('has-custom-cursor');
        if (cursorEl && cursorEl.parentNode) cursorEl.remove();
        if (rafId) cancelAnimationFrame(rafId);
        window.__rrCursorInitialized = false;
      }
    });
  };

  initRollsRoyceCursor();
});


