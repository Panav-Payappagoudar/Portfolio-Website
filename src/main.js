import './index.css';

// 1. Reduced Motion Detection
const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 2. Conditional Non-Blocking Loader (>= 300ms threshold only)
const LOADER_DELAY_MS = 300;
const LOADER_FAILSAFE_MS = 2500;
const NAV_FAILSAFE_MS = 4000;

let initialLoaderTimer = null;
let navLoaderTimer = null;
let failsafeTimer = null;

function setLoaderVisible(visible) {
  const el = document.getElementById('site-loader');
  if (!el) return;
  if (visible) {
    el.classList.add('active');
    el.setAttribute('aria-hidden', 'false');
  } else {
    el.classList.remove('active');
    el.setAttribute('aria-hidden', 'true');
  }
}

function clearAllLoaders() {
  if (initialLoaderTimer) {
    clearTimeout(initialLoaderTimer);
    initialLoaderTimer = null;
  }
  if (navLoaderTimer) {
    clearTimeout(navLoaderTimer);
    navLoaderTimer = null;
  }
  if (failsafeTimer) {
    clearTimeout(failsafeTimer);
    failsafeTimer = null;
  }
  setLoaderVisible(false);
}

// Handle browser back/forward (bfcache) and tab hide cleanly
window.addEventListener('pageshow', clearAllLoaders);
window.addEventListener('pagehide', clearAllLoaders);

// Only arm the conditional loader if initial DOM/document is still loading
if (typeof document !== 'undefined' && document.readyState !== 'complete') {
  initialLoaderTimer = setTimeout(() => {
    if (document.readyState !== 'complete') {
      setLoaderVisible(true);
      failsafeTimer = setTimeout(clearAllLoaders, LOADER_FAILSAFE_MS);
    }
  }, LOADER_DELAY_MS);
}

// 3. Clean legacy service workers (if any old registration exists)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    }).catch(() => {});
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;

  // Clear initial loader as soon as interactive DOM + critical fonts finish
  Promise.resolve(document.fonts ? document.fonts.ready : undefined)
    .catch(() => {})
    .finally(() => {
      clearAllLoaders();
    });

  // Conditional loader on genuine slow navigation clicks (> 300ms response)
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const anchor = e.target?.closest?.('a[href]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || anchor.hasAttribute('download')) return;
    if (anchor.target && anchor.target !== '_self') return;

    try {
      const targetUrl = new URL(anchor.href, window.location.origin);
      if (targetUrl.origin !== window.location.origin) return;
      if (targetUrl.pathname === window.location.pathname && targetUrl.search === window.location.search) return;
    } catch {
      return;
    }

    if (navLoaderTimer) clearTimeout(navLoaderTimer);
    navLoaderTimer = setTimeout(() => {
      setLoaderVisible(true);
      failsafeTimer = setTimeout(clearAllLoaders, NAV_FAILSAFE_MS);
    }, LOADER_DELAY_MS);
  });

  // Dynamically load ALTCHA Web Component only on pages that include the widget
  if (document.querySelector('altcha-widget')) {
    import('altcha').catch((err) => {
      console.warn('Failed to initialize verification widget:', err);
    });
  }

  // -------------------------------------------------------------
  // 4. NON-BLOCKING PAGE LOAD PROGRESS BAR
  // -------------------------------------------------------------
  const progressBar = document.getElementById('page-progress-bar');
  if (progressBar) {
    if (prefersReducedMotion) {
      progressBar.style.display = 'none';
    } else {
      requestAnimationFrame(() => {
        progressBar.style.transform = 'scaleX(0.65)';
      });
      let completed = false;
      const completeProgress = () => {
        if (completed) return;
        completed = true;
        progressBar.style.transform = 'scaleX(1)';
        setTimeout(() => {
          progressBar.classList.add('done');
          setTimeout(() => {
            progressBar.style.display = 'none';
          }, 350);
        }, 140);
      };

      if (document.readyState === 'complete') {
        completeProgress();
      } else {
        window.addEventListener('load', completeProgress, { once: true });
        setTimeout(completeProgress, 500);
      }
    }
  }

  // -------------------------------------------------------------
  // 4. NAVIGATION INTERACTIONS (HOME | EXPLORE ▾ | CONTACT)
  // -------------------------------------------------------------
  const mainNav = document.getElementById('main-nav');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const navBackdrop = document.getElementById('nav-backdrop');
  const exploreDropdown = document.getElementById('nav-explore-dropdown');
  const exploreBtn = document.getElementById('explore-btn');
  const exploreMenu = document.getElementById('explore-menu');

  // Subtle header border/background adjustment on scroll
  const handleScrollState = () => {
    if (!mainNav) return;
    if (window.scrollY > 16) {
      mainNav.classList.add('scrolled');
    } else {
      mainNav.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScrollState, { passive: true });
  requestAnimationFrame(handleScrollState);

  const toggleMobileNav = (forceState) => {
    if (!navLinks || !navToggle) return;
    const willOpen = forceState !== undefined ? forceState : !navLinks.classList.contains('open');
    if (willOpen) {
      navLinks.classList.add('open');
      navToggle.classList.add('open');
      navToggle.setAttribute('aria-expanded', 'true');
      navBackdrop?.classList.remove('opacity-0', 'pointer-events-none');
      body.style.overflow = 'hidden';
    } else {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navBackdrop?.classList.add('opacity-0', 'pointer-events-none');
      body.style.overflow = '';
    }
  };

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileNav();
    });

    navBackdrop?.addEventListener('click', () => toggleMobileNav(false));

    // Close mobile drawer when selecting a destination link
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          toggleMobileNav(false);
        }
      });
    });

    // Close drawer cleanly if viewport widens past mobile breakpoint
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navLinks.classList.contains('open')) {
        toggleMobileNav(false);
      }
    }, { passive: true });
  }

  // Explore Dropdown Toggle, Outside Click, and Full Keyboard Accessibility
  if (exploreDropdown && exploreBtn) {
    const setExploreOpen = (open) => {
      if (open) {
        exploreDropdown.classList.add('open');
        exploreBtn.setAttribute('aria-expanded', 'true');
      } else {
        exploreDropdown.classList.remove('open');
        exploreBtn.setAttribute('aria-expanded', 'false');
      }
    };

    // Click / Touch Toggle
    exploreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = exploreDropdown.classList.contains('open');
      setExploreOpen(!isOpen);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!exploreDropdown.contains(e.target)) {
        setExploreOpen(false);
      }
    });

    // Escape closes dropdown and refocuses Explore trigger
    exploreDropdown.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setExploreOpen(false);
        exploreBtn.focus();
      }
    });

    // Enter / Space / ArrowDown from trigger opens and focuses first item
    exploreBtn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        const wasOpen = exploreDropdown.classList.contains('open');
        if (!wasOpen) {
          setExploreOpen(true);
        } else if (e.key === 'Enter' || e.key === ' ') {
          setExploreOpen(false);
          e.preventDefault();
          return;
        }
        const firstItem = exploreMenu?.querySelector('.dropdown-item');
        firstItem?.focus();
        e.preventDefault();
      }
    });

    // Arrow key navigation between dropdown items
    const dropdownItems = Array.from(exploreMenu?.querySelectorAll('.dropdown-item') || []);
    dropdownItems.forEach((item, index) => {
      item.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          dropdownItems[(index + 1) % dropdownItems.length]?.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          dropdownItems[(index - 1 + dropdownItems.length) % dropdownItems.length]?.focus();
        } else if (e.key === 'Escape') {
          setExploreOpen(false);
          exploreBtn.focus();
        }
      });
    });
  }

  // -------------------------------------------------------------
  // 5. ONE-CLICK EMAIL COPY FEEDBACK
  // -------------------------------------------------------------
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const copyEmailStatus = document.getElementById('copy-email-status');

  if (copyEmailBtn && copyEmailStatus) {
    copyEmailBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const origText = 'panav.p@proton.me';
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(origText);
        } else {
          const tempInput = document.createElement('input');
          tempInput.value = origText;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          tempInput.remove();
        }
        copyEmailStatus.textContent = 'Copied panav.p@proton.me';
        copyEmailStatus.classList.add('underline');
        setTimeout(() => {
          copyEmailStatus.textContent = origText;
          copyEmailStatus.classList.remove('underline');
        }, 2200);
      } catch (err) {
        console.warn('Clipboard copy unavailable:', err);
      }
    });
  }

  // -------------------------------------------------------------
  // 6. WORK PAGE: CASE STUDY DRAWER TOGGLE
  // -------------------------------------------------------------
  const caseStudyToggles = document.querySelectorAll('.case-study-toggle-btn');
  caseStudyToggles.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      if (!targetId) return;
      const drawer = document.getElementById(targetId);
      if (!drawer) return;

      const labelSpan = btn.querySelector('span');
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        drawer.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
        if (labelSpan) labelSpan.textContent = 'Case Study Details ↓';
      } else {
        drawer.classList.remove('hidden');
        btn.setAttribute('aria-expanded', 'true');
        if (labelSpan) labelSpan.textContent = 'Hide Details ↑';
      }
    });
  });

  // Handle direct anchor jumping (e.g. /work#gravity-sandbox)
  if (window.location.hash) {
    try {
      const cleanHash = window.location.hash.slice(1);
      const targetElement = cleanHash ? document.getElementById(cleanHash) : null;
      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }, 120);
      }
    } catch {
      // Ignore invalid fragment
    }
  }

  // -------------------------------------------------------------
  // 7. EXPERIENCE PAGE: LIGHTWEIGHT PROGRESSIVE TIMELINE
  // -------------------------------------------------------------
  const timelineProgressLine = document.getElementById('timeline-progress-line');
  const timelineContainer = document.getElementById('timeline-container');

  if (timelineProgressLine && timelineContainer) {
    let totalLen = timelineContainer.offsetHeight || 1000;
    let rafPending = false;

    const updateTimelineProgress = () => {
      rafPending = false;
      totalLen = timelineContainer.offsetHeight || 1000;
      timelineProgressLine.setAttribute('y2', `${totalLen}`);
      timelineProgressLine.style.strokeDasharray = `${totalLen}`;

      if (prefersReducedMotion) {
        timelineProgressLine.style.strokeDashoffset = '0';
        return;
      }

      const rect = timelineContainer.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 800;
      const reachedPageBottom = window.scrollY + viewportHeight >= document.documentElement.scrollHeight - 16;

      if (reachedPageBottom) {
        timelineProgressLine.style.strokeDashoffset = '0';
        return;
      }

      const triggerY = viewportHeight * 0.72;
      const passed = triggerY - rect.top;
      const progress = Math.max(0, Math.min(1, passed / Math.max(totalLen, 1)));
      timelineProgressLine.style.strokeDashoffset = `${totalLen * (1 - progress)}`;
    };

    const requestTimelineUpdate = () => {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(updateTimelineProgress);
      }
    };

    updateTimelineProgress();
    window.addEventListener('scroll', requestTimelineUpdate, { passive: true });
    window.addEventListener('resize', requestTimelineUpdate, { passive: true });
  }

  // -------------------------------------------------------------
  // 8. CONTACT FORM SUBMISSION WITH ALTCHA VERIFICATION
  // -------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const formStatusMsg = document.getElementById('form-status-msg');
  const formErrorAlert = document.getElementById('form-error-alert');
  const successModal = document.getElementById('success-modal');
  const closeSuccessBtns = document.querySelectorAll('.close-success-btn');

  const showStatus = (msg, isError = false) => {
    if (formStatusMsg) {
      formStatusMsg.textContent = msg;
      formStatusMsg.className = `text-sm font-sans ${isError ? 'text-red-700 font-medium' : 'text-neutral-500'}`;
    }
  };

  const showFormError = (msg) => {
    if (formErrorAlert) {
      formErrorAlert.textContent = msg;
      formErrorAlert.classList.remove('hidden');
      formErrorAlert.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest' });
    } else {
      showStatus(msg, true);
    }
  };

  const clearFormError = () => {
    if (formErrorAlert) {
      formErrorAlert.textContent = '';
      formErrorAlert.classList.add('hidden');
    }
    showStatus('');
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
  };

  if (contactForm && submitBtn) {
    const altchaWidget = contactForm.querySelector('altcha-widget');
    if (altchaWidget) {
      altchaWidget.addEventListener('statechange', (ev) => {
        const state = ev.detail?.state;
        if (state === 'expired') {
          resetAltcha();
          showFormError('The security challenge expired. Please verify again to continue.');
        } else if (state === 'error') {
          showFormError('Security challenge encountered a connection error. Please try again or email directly at panav.p@proton.me.');
        } else if (state === 'verified') {
          clearFormError();
        }
      });
    }

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearFormError();

      const nameInput = contactForm.querySelector('input[name="name"]');
      const emailInput = contactForm.querySelector('input[name="email"]');
      const messageInput = contactForm.querySelector('textarea[name="message"]');
      const honeypotVal = contactForm.querySelector('input[name="_honeypot"]')?.value || '';

      const nameVal = nameInput?.value?.trim() || '';
      const emailVal = emailInput?.value?.trim() || '';
      const messageVal = messageInput?.value?.trim() || '';

      // Client-side validation mirroring server checks (prevents consuming valid ALTCHA token on typos)
      if (nameVal.length < 2) {
        showFormError('Please enter your name (at least 2 characters).');
        nameInput?.focus();
        return;
      }

      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!emailRegex.test(emailVal)) {
        showFormError('Please provide a valid email address.');
        emailInput?.focus();
        return;
      }

      if (messageVal.length < 5) {
        showFormError('Please write a message containing at least 5 characters.');
        messageInput?.focus();
        return;
      }

      let altchaPayload = null;
      if (altchaWidget) {
        altchaPayload = altchaWidget.value;
        if (!altchaPayload) {
          const hiddenInput = contactForm.querySelector('input[name="altcha"]');
          if (hiddenInput) altchaPayload = hiddenInput.value;
        }
      }

      if (!altchaPayload) {
        showFormError('Please complete the verification checkbox before submitting.');
        return;
      }

      const btnTextSpan = submitBtn.querySelector('span');
      const originalBtnLabel = btnTextSpan?.textContent || 'Send Message';
      if (btnTextSpan) btnTextSpan.textContent = 'Sending...';
      submitBtn.disabled = true;
      showStatus('Verifying & sending...');

      const payload = {
        name: nameVal,
        email: emailVal,
        message: messageVal,
        altcha: altchaPayload,
        _honeypot: honeypotVal
      };

      const fetchWithTimeout = async (url) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        try {
          return await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
          });
        } finally {
          clearTimeout(timeoutId);
        }
      };

      try {
        let response = await fetchWithTimeout('/.netlify/functions/submit');

        if (!response.ok && response.status === 404) {
          response = await fetchWithTimeout('/.netlify/functions/api/submit');
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success) {
          resetAltcha();
          throw new Error(data.message || 'Server error occurred while sending your message.');
        }

        if (successModal) {
          successModal.classList.remove('opacity-0', 'pointer-events-none');
          const closeBtn = successModal.querySelector('.close-success-btn');
          closeBtn?.focus();
        }

        contactForm.querySelectorAll('input:not([type="hidden"]), textarea').forEach((el) => {
          el.value = '';
        });

        showStatus('');
        resetAltcha();
      } catch (err) {
        const friendlyMessage = err?.name === 'AbortError'
          ? 'Request timed out. Please try again or email directly at panav.p@proton.me.'
          : (err?.message || 'Unable to send right now. You can also email directly at panav.p@proton.me.');
        console.error('Submission error:', err);
        resetAltcha();
        showStatus('');
        showFormError(friendlyMessage);
      } finally {
        if (btnTextSpan) btnTextSpan.textContent = originalBtnLabel;
        submitBtn.disabled = false;
      }
    });
  }

  closeSuccessBtns.forEach((btn) => {
    btn?.addEventListener('click', () => {
      if (successModal) {
        successModal.classList.add('opacity-0', 'pointer-events-none');
      }
    });
  });

  // Accessibility for ALTCHA widget logo link via scoped MutationObserver
  const altchaHost = document.querySelector('altcha-widget');
  if (altchaHost) {
    const labelLogoLink = () => {
      const root = altchaHost.shadowRoot || altchaHost;
      const logoLink = root.querySelector('a.altcha-logo');
      if (logoLink && !logoLink.getAttribute('aria-label')) {
        logoLink.setAttribute('aria-label', 'Altcha verification website');
        return true;
      }
      return Boolean(logoLink);
    };

    if (!labelLogoLink()) {
      const observer = new MutationObserver(() => {
        if (labelLogoLink()) observer.disconnect();
      });
      observer.observe(altchaHost, { childList: true, subtree: true });
      setTimeout(() => observer.disconnect(), 4000);
    }
  }

  // Global Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (successModal && !successModal.classList.contains('opacity-0')) {
        successModal.classList.add('opacity-0', 'pointer-events-none');
      }
      if (exploreDropdown && exploreDropdown.classList.contains('open')) {
        exploreDropdown.classList.remove('open');
        exploreBtn?.setAttribute('aria-expanded', 'false');
      }
      if (navLinks && navLinks.classList.contains('open')) {
        toggleMobileNav(false);
      }
    }
  });
});
