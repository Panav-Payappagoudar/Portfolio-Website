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
});

