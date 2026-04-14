// ═══════════════════════════════════════════════════════════
//   HAILEY DEVICE REPAIR — main.js
// ═══════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ─── Promo banner: removed ─────────────────────────────────

  // ─── Theme toggle ────────────────────────────────────────
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const THEME_KEY = 'hdr-theme';

  // Track whether a reveal animation is in progress
  var revealInProgress = false;

  function setTheme(theme, announce, triggerEl) {
    var skipTransition = announce === false;
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Block all theme changes while reveal is animating
    if (revealInProgress) return;

    // Try circular reveal if we have a trigger element and no reduced motion
    if (!skipTransition && !prefersReduced && triggerEl) {
      revealInProgress = true;
      var rect = triggerEl.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;

      // Create overlay with the TARGET theme colors
      var overlay = document.createElement('div');
      overlay.className = 'theme-reveal';
      overlay.style.setProperty('--reveal-x', cx + 'px');
      overlay.style.setProperty('--reveal-y', cy + 'px');

      // Set the overlay background to the target theme's base color
      if (theme === 'dark') {
        overlay.style.background = '#0d1117';
      } else {
        overlay.style.background = '#f8f9fb';
      }

      document.body.appendChild(overlay);

      // Force reflow then start animation
      overlay.offsetHeight;
      overlay.classList.add('expanding');

      // When animation ends, swap theme and clean up
      function finishReveal() {
        if (!overlay.parentNode) return; // Already removed
        html.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
        // Brief delay to let the theme paint, then remove overlay
        requestAnimationFrame(function() {
          requestAnimationFrame(function() {
            if (overlay.parentNode) overlay.remove();
            revealInProgress = false;
          });
        });
      }
      overlay.addEventListener('animationend', finishReveal);
      // Safety timeout in case animationend doesn't fire
      setTimeout(finishReveal, 800);

      if (announce !== false) announceToSR(theme === 'dark' ? 'Dark theme enabled' : 'Light theme enabled');
      return;
    }

    // Fallback: simple crossfade
    if (!skipTransition && !prefersReduced) {
      html.classList.add('theme-transition');
      clearTimeout(html._themeTransitionTimer);
      html._themeTransitionTimer = setTimeout(function() {
        html.classList.remove('theme-transition');
      }, 550);
    }
    html.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    if (announce !== false) announceToSR(theme === 'dark' ? 'Dark theme enabled' : 'Light theme enabled');
  }

  // Screen reader live announcements
  function announceToSR(msg) {
    let el = document.getElementById('srAnnounce');
    if (!el) {
      el = document.createElement('div');
      el.id = 'srAnnounce';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      el.setAttribute('aria-atomic', 'true');
      el.className = 'sr-only';
      document.body.appendChild(el);
    }
    el.textContent = '';
    requestAnimationFrame(() => { el.textContent = msg; });
  }

  // Init: respect saved preference, then system preference (no SR announce on load)
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) {
    setTheme(saved, false);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    setTheme('light', false);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const current = html.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark', true, themeToggle);
    });
  }

  // Floating theme toggle (available on all pages)
  const floatingToggle = document.getElementById('floatingThemeToggle');
  if (floatingToggle) {
    floatingToggle.addEventListener('click', function() {
      const current = html.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark', true, floatingToggle);
    });
  }

  // ─── Cookie consent banner ───────────────────────────────
  const cookieBanner = document.getElementById('cookieBanner');
  const cookieAccept = document.getElementById('cookieAccept');
  const cookieDecline = document.getElementById('cookieDecline');
  if (cookieBanner && !localStorage.getItem('hdr_cookie_consent')) {
    setTimeout(() => cookieBanner.classList.add('visible'), 1500);
  }
  function dismissCookie(choice) {
    localStorage.setItem('hdr_cookie_consent', choice);
    cookieBanner.classList.remove('visible');
    announceToSR('Cookie preferences saved');
  }
  if (cookieAccept) cookieAccept.addEventListener('click', () => dismissCookie('accepted'));
  if (cookieDecline) cookieDecline.addEventListener('click', () => dismissCookie('declined'));
  if (cookieBanner) {
    cookieBanner.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') dismissCookie('declined');
    });
  }

  // ─── Nav: scroll shadow with depth-based intensity ────────
  const nav = document.getElementById('nav');
  const scrollVignette = document.querySelector('.scroll-vignette');
  const vignetteReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (nav) {
    // Shadow intensity scales from 0 at top to 1 at ~50% page depth
    const maxDepthPx = window.innerHeight * 2; // ~2 viewports of scroll
    const heroHeight = document.getElementById('hero')?.offsetHeight || window.innerHeight;
    let compactTriggered = false;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      nav.classList.toggle('scrolled', scrollY > 10);

      // Nav morph: compact after scrolling past the hero section
      if (scrollY > heroHeight * 0.4) {
        if (!compactTriggered) {
          compactTriggered = true;
          nav.classList.add('nav--compact');
        }
      } else {
        if (compactTriggered) {
          compactTriggered = false;
          nav.classList.remove('nav--compact');
        }
      }

      if (scrollY > 10) {
        const depth = Math.min(scrollY / maxDepthPx, 1);
        // Calculate shadow values: blur 8-24px, spread 0-4px, opacity 0.15-0.4
        const blur = 8 + depth * 16;
        const spread = depth * 4;
        const opacity = 0.15 + depth * 0.25;
        nav.style.boxShadow = `0 2px ${blur.toFixed(1)}px ${spread.toFixed(1)}px rgba(0,0,0,${opacity.toFixed(3)})`;
        
        // Update vignette intensity — subtle depth immersion effect
        if (scrollVignette && !vignetteReducedMotion) {
          // Vignette fades in starting at 20% scroll depth, max at 80%
          const vignetteDepth = Math.max(0, (depth - 0.2) / 0.6);
          const vignetteIntensity = Math.min(vignetteDepth, 1);
          scrollVignette.style.setProperty('--vignette-intensity', vignetteIntensity.toFixed(3));
          scrollVignette.classList.toggle('active', vignetteIntensity > 0.01);
        }
      } else {
        nav.style.boxShadow = '';
        // Reset vignette at top
        if (scrollVignette) {
          scrollVignette.classList.remove('active');
        }
      }
    }, { passive: true });
  }

  // ─── Mobile nav hamburger ────────────────────────────────
  const hamburger = document.getElementById('navHamburger');
  const mobileMenu = document.getElementById('navMobile');
  const navBackdrop = document.getElementById('navBackdrop');

  if (hamburger && mobileMenu) {
    const closeMenu = () => {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('menu-open');
      if (navBackdrop) navBackdrop.classList.remove('visible');
      hamburger.focus();
    };
    const openMenu = () => {
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.classList.add('menu-open');
      if (navBackdrop) navBackdrop.classList.add('visible');
      // Focus first link in mobile menu
      const firstLink = mobileMenu.querySelector('a');
      if (firstLink) firstLink.focus();
    };

    hamburger.addEventListener('click', () => {
      const expanded = hamburger.getAttribute('aria-expanded') === 'true';
      if (!expanded) {
        hamburger.classList.remove('hamburger-pressed');
        void hamburger.offsetWidth; // reflow to restart animation
        hamburger.classList.add('hamburger-pressed');
        hamburger.addEventListener('animationend', () => hamburger.classList.remove('hamburger-pressed'), { once: true });
      }
      expanded ? closeMenu() : openMenu();
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Escape key closes menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMenu();
      }
    });

    // Backdrop click closes menu
    if (navBackdrop) {
      navBackdrop.addEventListener('click', closeMenu);
    }

    // Focus trap inside mobile menu
    mobileMenu.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusable = mobileMenu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  // ─── Scroll animation choreography ────────────────────────
  // Auto-add data-animate to section headers for entrance choreography.
  // Eyebrow → title → subtitle → content
  document.querySelectorAll('.section-header').forEach(function(header) {
    var eyebrow = header.querySelector('.section-eyebrow');
    var sub = header.querySelector('.section-sub');
    // Only add if not already animated
    if (eyebrow && !eyebrow.hasAttribute('data-animate')) {
      eyebrow.setAttribute('data-animate', 'fade');
    }
    if (sub && !sub.hasAttribute('data-animate')) {
      sub.setAttribute('data-animate', '');
    }
  });

  const animEls = document.querySelectorAll('[data-animate]');

  if ('IntersectionObserver' in window && animEls.length) {
    // Track per-section stagger counters for choreographed entrance
    // Elements within the same <section> ancestor stagger together
    const sectionCounters = new WeakMap();

    function getSection(el) {
      var s = el.closest('section, .section');
      return s || el.parentElement;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        var section = getSection(entry.target);
        var count = sectionCounters.get(section) || 0;
        sectionCounters.set(section, count + 1);
        // Stagger: first 3 items get 100ms spacing (header choreography),
        // then items 4+ get 60ms spacing (content fills in faster)
        var delay;
        if (count < 3) {
          delay = count * 100; // 0, 100, 200ms for header elements
        } else {
          delay = 200 + (count - 2) * 60; // 260, 320, 380... for content
        }
        // Cap at 600ms total to avoid excessive waits
        delay = Math.min(delay, 600);
        setTimeout(function() {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    animEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: show everything immediately
    animEls.forEach(el => el.classList.add('visible'));
  }

  // ─── Contact form (validation + mailto fallback) ─────────
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const formProgressFill = document.getElementById('formProgressFill');
  const formProgressCount = document.getElementById('formProgressCount');
  const formProgressSteps = document.getElementById('formProgressSteps');

  // Inline validation helpers (defined early so submit can use them)
  const validators = {
    name: {
      test: v => v.trim().length >= 2,
      msg: 'Please enter your name (at least 2 characters)'
    },
    contact: {
      test: v => {
        const trimmed = v.trim();
        const phoneish = /[\d\s\-\+\(\)]{7,}/.test(trimmed);
        const emailish = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
        return phoneish || emailish;
      },
      msg: 'Please enter a valid phone number or email'
    },
    issue: {
      test: v => v.trim().length >= 5,
      msg: 'Please describe the issue (at least 5 characters)'
    }
  };

  function validateField(input) {
    const name = input.id;
    const validator = validators[name];
    if (!validator) return true;

    const errorEl = document.getElementById(name + 'Error');
    const isValid = validator.test(input.value);

    if (!isValid && input.value.length > 0) {
      input.classList.add('invalid');
      input.classList.remove('valid');
      if (errorEl) errorEl.textContent = validator.msg;
      return false;
    } else if (isValid) {
      input.classList.remove('invalid');
      input.classList.add('valid');
      if (errorEl) errorEl.textContent = '';
      return true;
    } else {
      input.classList.remove('invalid', 'valid');
      if (errorEl) errorEl.textContent = '';
      return false;
    }
  }

  function updateFormProgress() {
    if (!contactForm) return;
    const steps = [
      contactForm.querySelector('#name'),
      contactForm.querySelector('#contact'),
      contactForm.querySelector('#device'),
      contactForm.querySelector('#issue')
    ];
    const stepEls = formProgressSteps ? formProgressSteps.querySelectorAll('.form-progress-step') : [];
    let complete = 0;
    let activeIndex = 0;

    steps.forEach((field, idx) => {
      const isFilled = !!field && field.value.trim().length > 0;
      const isValid = field && (field.tagName === 'SELECT' ? isFilled && field.value !== '' : validators[field.id] ? validators[field.id].test(field.value) : isFilled);
      if (isValid) complete++;
      if (activeIndex === 0 && !isValid) activeIndex = idx;
    });
    if (complete === steps.length) activeIndex = steps.length - 1;

    if (formProgressFill) formProgressFill.style.width = ((complete / steps.length) * 100) + '%';
    if (formProgressCount) formProgressCount.textContent = complete + '/' + steps.length + ' complete';
    stepEls.forEach((el, idx) => {
      el.classList.toggle('is-active', idx === activeIndex);
      el.classList.toggle('is-done', idx < complete);
    });
  }

  if (contactForm) {
    // Bind blur/input validation
    ['name', 'contact', 'issue', 'device'].forEach(id => {
      const input = contactForm.querySelector('#' + id);
      if (input) {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
          if (input.classList.contains('invalid')) validateField(input);
          updateFormProgress();
        });
        if (input.tagName === 'SELECT') {
          input.addEventListener('change', updateFormProgress);
        }
      }
    });
    updateFormProgress();
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput    = contactForm.querySelector('#name');
      const contactInput = contactForm.querySelector('#contact');
      const issueInput   = contactForm.querySelector('#issue');
      const name    = nameInput.value.trim();
      const contact = contactInput.value.trim();
      const device  = contactForm.querySelector('#device').value;
      const issue   = issueInput.value.trim();
      const mailin  = contactForm.querySelector('#mailinCheck').checked;

      // Run inline validation on all required fields
      const fields = [nameInput, contactInput, issueInput];
      let allValid = true;
      fields.forEach(input => {
        if (!validateField(input)) {
          allValid = false;
        }
      });

      if (!allValid) {
        // Focus the first invalid field
        const firstInvalid = fields.find(f => f.classList.contains('invalid'));
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // ─── Submit via Formspree (or fallback to mailto) ───────
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const formError = document.getElementById('formError');
      const FORMSPREE_ID = contactForm.dataset.formspree; // set data-formspree="YOUR_ID" on <form>

      // Disable button + show spinner
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="material-symbols-outlined spin-icon">progress_activity</span> Sending…';
      }

      if (FORMSPREE_ID) {
        // Real Formspree submission
        fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            name: name,
            contact: contact,
            device: device || 'Not specified',
            issue: issue,
            mailin: mailin ? 'Yes' : 'No'
          })
        })
        .then(response => {
          if (response.ok) {
            showFormSuccess();
          } else {
            throw new Error('Submission failed');
          }
        })
        .catch(() => {
          // Show error, re-enable button
          if (formError) {
            formError.classList.add('visible');
            formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          restoreSubmitBtn();
        });
      } else {
        // Fallback: mailto (no Formspree ID configured)
        const subject = encodeURIComponent(`Quote Request — ${device || 'Device'} Repair`);
        const mailBody = encodeURIComponent(
          `Name: ${name}\nContact: ${contact}\nDevice: ${device || 'Not specified'}\n` +
          `Mail-In: ${mailin ? 'Yes' : 'No'}\n\nIssue:\n${issue}`
        );
        window.location.href = `mailto:samuel@haileyrepair.com?subject=${subject}&body=${mailBody}`;
        showFormSuccess();
      }

      function showFormSuccess() {
        if (formSuccess) {
          formSuccess.classList.add('visible');
          formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        contactForm.reset();
        updateFormProgress();
        // Hide success after 8 seconds
        setTimeout(() => {
          if (formSuccess) formSuccess.classList.remove('visible');
          restoreSubmitBtn();
        }, 8000);
      }

      function restoreSubmitBtn() {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = submitBtn.dataset.originalText || '<span class="material-symbols-outlined">send</span> Send Quote Request';
        }
      }
    });
  }

  // ─── Recently Fixed ticker: clone items for seamless loop ─
  const tickerScroll = document.querySelector('.ticker-scroll');
  if (tickerScroll) {
    // Clone all ticker items to create seamless infinite loop
    const items = tickerScroll.querySelectorAll('.ticker-item');
    items.forEach(item => {
      const clone = item.cloneNode(true);
      tickerScroll.appendChild(clone);
    });
  }

  // ─── Smooth anchor offset for sticky nav ─────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const navH = nav ? nav.offsetHeight : 64;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });

      // Highlight pulse on arrival — brief accent ring around section eyebrow
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        var eyebrow = target.querySelector('.section-eyebrow');
        if (eyebrow && !eyebrow.classList.contains('anchor-pulse')) {
          // Small delay to sync with scroll arrival
          setTimeout(function() {
            eyebrow.classList.add('anchor-pulse');
            // Clean up after animation
            setTimeout(function() {
              eyebrow.classList.remove('anchor-pulse');
            }, 800);
          }, Math.min(400, Math.abs(top - window.scrollY) / 3));
        }
      }
    });
  });

  // ─── Active nav link on scroll ───────────────────────────
  const navLinks = document.querySelectorAll('.nav-links .nav-link');
  const sections = [];

  navLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    let id = '';
    // Try hash first: /#services or #services
    const hashIdx = href.lastIndexOf('#');
    if (hashIdx >= 0) {
      id = href.substring(hashIdx + 1);
    } else {
      // Try page path: /pricing → look for #pricing section
      const pathMatch = href.match(/\/([a-z0-9-]+)$/);
      if (pathMatch) id = pathMatch[1];
    }
    if (!id) return;
    const section = document.getElementById(id);
    if (section) sections.push({ id, el: section, link });
  });

  function updateActiveNav() {
    const navH = nav ? nav.offsetHeight : 64;
    const scrollY = window.scrollY + navH + 100;
    let current = '';

    sections.forEach(({ id, el }) => {
      if (el.offsetTop <= scrollY) current = id;
    });

    navLinks.forEach(link => {
      // Find this link in sections array
      const match = sections.find(s => s.link === link);
      const isActive = match ? match.id === current : false;
      link.classList.toggle('active', isActive);
    });
  }

  if (sections.length) {
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
  }

  // ─── Count-up animation for trust stats ──────────────────
  const countEls = document.querySelectorAll('.trust-counter');

  if ('IntersectionObserver' in window && countEls.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        countObserver.unobserve(el);

        const end = parseFloat(el.getAttribute('data-target'), 10);
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = parseInt(el.getAttribute('data-duration'), 10) || 1200;
        const decimals = parseInt(el.getAttribute('data-decimals'), 10) || 0;
        // Detect decimal display: either explicit data-decimals attr, or the target has a decimal point in string form
        const showDecimal = decimals > 0 || el.getAttribute('data-target').toString().includes('.');
        const start = performance.now();

        function tick(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = eased * end;
          el.textContent = prefix + (showDecimal ? current.toFixed(decimals || 1) : Math.round(current)) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });

    countEls.forEach(el => countObserver.observe(el));
  }

  // ─── Scroll progress bar ──────────────────────────────────
  const progressBar = document.getElementById('scrollProgress');
  const navProgressFill = document.getElementById('navProgressFill');
  if (progressBar) {
    // Scroll velocity tracking for comet tail glow effect
    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();
    let velocityDecayTimer = null;

    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = progress + '%';
      if (navProgressFill) navProgressFill.style.width = progress + '%';

      // Calculate scroll velocity (px/ms)
      const now = performance.now();
      const dt = now - lastScrollTime;
      if (dt > 0) {
        const dy = Math.abs(scrollTop - lastScrollY);
        const velocity = dy / dt; // px per ms

        // Map velocity to glow intensity (0.5-4 px/ms range maps to 0-1)
        const intensity = Math.min(velocity / 4, 1);

        // Set glow properties based on velocity
        const glowWidth = Math.round(20 + intensity * 80); // 20-100px
        const glowBlur = Math.round(intensity * 8); // 0-8px
        const glowOpacity = intensity * 0.9; // 0-0.9

        progressBar.style.setProperty('--progress-glow-width', glowWidth + 'px');
        progressBar.style.setProperty('--progress-glow-blur', glowBlur + 'px');
        progressBar.style.setProperty('--progress-glow-opacity', glowOpacity.toFixed(2));

        // Clear existing decay timer
        clearTimeout(velocityDecayTimer);

        // Decay glow after scroll stops
        velocityDecayTimer = setTimeout(() => {
          progressBar.style.setProperty('--progress-glow-width', '0px');
          progressBar.style.setProperty('--progress-glow-blur', '0px');
          progressBar.style.setProperty('--progress-glow-opacity', '0');
        }, 150);
      }

      lastScrollY = scrollTop;
      lastScrollTime = now;
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    // ─── Section landmarks on progress bar ──────────────────
    // Add small dots indicating section positions on the progress bar
    (function sectionLandmarksInit() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      // Key sections to show as landmarks (not all sections, just main ones)
      var landmarkSections = [
        'services', 'pricing', 'process', 'workshop',
        'mailin', 'area', 'compare', 'faq', 'contact'
      ];

      var landmarks = [];
      var container = document.createElement('div');
      container.className = 'progress-landmarks';
      container.setAttribute('aria-hidden', 'true');
      progressBar.appendChild(container);

      // Create landmark dots
      landmarkSections.forEach(function(id) {
        var section = document.getElementById(id);
        if (!section) return;

        var dot = document.createElement('div');
        dot.className = 'progress-landmark';
        dot.dataset.section = id;
        container.appendChild(dot);

        landmarks.push({ id: id, element: section, dot: dot });
      });

      // Calculate and update landmark positions
      function updateLandmarkPositions() {
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;

        landmarks.forEach(function(landmark) {
          var rect = landmark.element.getBoundingClientRect();
          var sectionTop = rect.top + window.scrollY;
          var position = (sectionTop / docHeight) * 100;

          // Clamp between 1% and 99% to keep dots visible
          position = Math.max(1, Math.min(position, 99));
          landmark.dot.style.left = position + '%';
          landmark.position = position;
        });
      }

      // Update which landmark is active based on scroll position
      function updateActiveLandmark() {
        var scrollTop = window.scrollY;
        var viewMid = scrollTop + window.innerHeight / 2;

        landmarks.forEach(function(landmark) {
          var rect = landmark.element.getBoundingClientRect();
          var sectionTop = rect.top + scrollTop;
          var sectionBot = sectionTop + rect.height;

          if (viewMid >= sectionTop && viewMid < sectionBot) {
            landmark.dot.classList.add('active');
          } else {
            landmark.dot.classList.remove('active');
          }
        });
      }

      // Initial positioning
      updateLandmarkPositions();
      updateActiveLandmark();

      // Update on scroll (throttled with RAF)
      var ticking = false;
      window.addEventListener('scroll', function() {
        if (!ticking) {
          requestAnimationFrame(function() {
            updateActiveLandmark();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });

      // Update positions on resize
      var resizeTimer;
      window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
          updateLandmarkPositions();
          updateActiveLandmark();
        }, 100);
      });
    })();
  }

  // ─── Hero typing effect (rotating taglines) ─────────────
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const typerEl = document.getElementById('heroTyper');
  if (typerEl && !prefersReducedMotion) {
    const phrases = [
      'Let me fix it.',
      'Save hundreds.',
      'Same-day repair.',
      'No fix, no charge.',
      'Text me anytime.'
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let pauseTimer = null;

    const TYPE_SPEED = 60;
    const DELETE_SPEED = 35;
    const PAUSE_AFTER = 2500;
    const PAUSE_BEFORE = 400;

    // Start after page loads and a small delay
    setTimeout(() => {
      typerEl.classList.add('typing');
      typerEl.textContent = '';
      charIndex = 0;
      typeLoop();
    }, 1000);

    function typeLoop() {
      const current = phrases[phraseIndex];

      if (!isDeleting) {
        // Typing forward
        charIndex++;
        typerEl.textContent = current.slice(0, charIndex);

        if (charIndex === current.length) {
          // Done typing — show cursor, then pause and delete
          typerEl.classList.add('cursor-blink');
          pauseTimer = setTimeout(() => {
            typerEl.classList.remove('cursor-blink');
            isDeleting = true;
            typeLoop();
          }, PAUSE_AFTER);
          return;
        }
        // Hide cursor while typing
        typerEl.classList.remove('cursor-blink');
        setTimeout(typeLoop, TYPE_SPEED + Math.random() * 30);
      } else {
        // Deleting
        charIndex--;
        typerEl.textContent = current.slice(0, charIndex);

        if (charIndex === 0) {
          // Done deleting — move to next phrase (cursor stays hidden)
          isDeleting = false;
          typerEl.classList.remove('cursor-blink');
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(typeLoop, PAUSE_BEFORE);
          return;
        }
        // Hide cursor while deleting
        typerEl.classList.remove('cursor-blink');
        setTimeout(typeLoop, DELETE_SPEED);
      }
    }
  }

  // ─── Hero accent shimmer (one-shot on load) ─────────────
  if (!prefersReducedMotion) {
    const heroAccent = document.querySelector('.hero-headline-accent');
    if (heroAccent) {
      setTimeout(() => heroAccent.classList.add('shimmer'), 800);
    }
  }

  // ─── Hero parallax glow (mouse) ──────────────────────────
  // Store mouse offsets for composing with scroll parallax
  var heroMouseX = 0, heroMouseY = 0;
  if (!prefersReducedMotion) {
    const heroGlows = document.querySelectorAll('.hero-glow, .hero-glow-1, .hero-glow-2');
    if (heroGlows.length) {
      let ticking = false;
      let breathingIdleTimer = null;
      const IDLE_DELAY = 3000; // Resume breathing after 3s of no mouse
      
      // Start breathing on page load
      setTimeout(() => {
        heroGlows.forEach(glow => glow.classList.add('breathing'));
      }, 2000); // Wait for entrance animations
      
      function pauseBreathing() {
        heroGlows.forEach(glow => glow.classList.remove('breathing'));
        clearTimeout(breathingIdleTimer);
        breathingIdleTimer = setTimeout(() => {
          // Only resume if hero is still visible
          if (window.scrollY < window.innerHeight) {
            heroGlows.forEach(glow => glow.classList.add('breathing'));
          }
        }, IDLE_DELAY);
      }
      
      document.addEventListener('mousemove', (e) => {
        // Pause breathing on any mouse movement
        pauseBreathing();
        
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const cx = (e.clientX / window.innerWidth - 0.5) * 2;
          const cy = (e.clientY / window.innerHeight - 0.5) * 2;
          heroMouseX = cx;
          heroMouseY = cy;
          // Compose with scroll offset (applied by scroll parallax below)
          heroGlows.forEach((glow, i) => {
            const mFactor = (i + 1) * 15;
            var scrollOff = parseFloat(glow.dataset.scrollY || 0);
            glow.style.transform = 'translate(' + (cx * mFactor) + 'px, ' + (cy * mFactor + scrollOff) + 'px)';
          });
          ticking = false;
        });
      }, { passive: true });
    }
  }

  // ─── Hero perspective tilt — text floats in 3D space ────
  // Subtle 3D rotation of hero text based on mouse position
  (function heroPerspectiveTilt() {
    if (prefersReducedMotion) return;
    
    var heroInner = document.querySelector('.hero-inner');
    var hero = document.getElementById('hero');
    if (!heroInner || !hero) return;
    
    // Maximum rotation angles (degrees)
    var MAX_TILT_X = 2; // Vertical tilt (up/down)
    var MAX_TILT_Y = 3; // Horizontal tilt (left/right)
    var LERP = 0.08; // Smoothing factor
    
    // Current and target values
    var currentTiltX = 0;
    var currentTiltY = 0;
    var targetTiltX = 0;
    var targetTiltY = 0;
    var isAnimating = false;
    
    // Set up perspective on parent
    hero.style.perspective = '1000px';
    hero.style.perspectiveOrigin = '50% 50%';
    
    // Set initial transform style
    heroInner.style.transformStyle = 'preserve-3d';
    heroInner.style.willChange = 'transform';
    
    function animate() {
      // Smooth interpolation
      currentTiltX += (targetTiltX - currentTiltX) * LERP;
      currentTiltY += (targetTiltY - currentTiltY) * LERP;
      
      // Apply transform (negative Y for natural feel — move mouse right, text tilts left)
      heroInner.style.transform = 'rotateX(' + currentTiltX.toFixed(3) + 'deg) rotateY(' + (-currentTiltY).toFixed(3) + 'deg)';
      
      // Continue animation if not settled
      var diff = Math.abs(targetTiltX - currentTiltX) + Math.abs(targetTiltY - currentTiltY);
      if (diff > 0.01) {
        requestAnimationFrame(animate);
      } else {
        isAnimating = false;
      }
    }
    
    function startAnimation() {
      if (!isAnimating) {
        isAnimating = true;
        requestAnimationFrame(animate);
      }
    }
    
    hero.addEventListener('mousemove', function(e) {
      // Only apply effect when hero is visible
      if (window.scrollY > hero.offsetHeight) return;
      
      var rect = hero.getBoundingClientRect();
      var cx = (e.clientX - rect.left) / rect.width; // 0-1
      var cy = (e.clientY - rect.top) / rect.height; // 0-1
      
      // Map to -1 to 1 range
      var nx = (cx - 0.5) * 2;
      var ny = (cy - 0.5) * 2;
      
      // Set target angles
      targetTiltY = nx * MAX_TILT_Y;
      targetTiltX = ny * MAX_TILT_X;
      
      startAnimation();
    }, { passive: true });
    
    hero.addEventListener('mouseleave', function() {
      // Return to neutral
      targetTiltX = 0;
      targetTiltY = 0;
      startAnimation();
    }, { passive: true });
    
    // Reset on scroll past hero
    window.addEventListener('scroll', function() {
      if (window.scrollY > hero.offsetHeight * 0.8) {
        targetTiltX = 0;
        targetTiltY = 0;
        startAnimation();
      }
    }, { passive: true });
  })();

  // ─── Hero mountain scroll parallax ────────────────────────
  (function() {
    var back  = document.querySelector('.hero-mountain-back');
    var front = document.querySelector('.hero-mountain-front');
    if (!back || !front) return;

    var hero       = document.querySelector('.hero');
    var parallaxBack  = 0.25;   // fraction of scroll speed — further = slower
    var parallaxFront = 0.55;   // closer = faster
    var ticking = false;

    function updateParallax() {
      var scrollY = window.scrollY;
      var heroH   = hero ? hero.offsetHeight : window.innerHeight;
      // Fade out as hero scrolls away
      var progress = Math.max(0, 1 - scrollY / (heroH * 0.8));
      back.style.transform  = 'translateY('  + (scrollY * parallaxBack  * progress).toFixed(2) + 'px)';
      front.style.transform = 'translateY(' + (scrollY * parallaxFront * progress).toFixed(2) + 'px)';
      ticking = false;
    }

    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    // Init at 0
    updateParallax();
  })();

  // ─── Back-to-top button with progress ring ──────────────
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    var progressRing = backToTop.querySelector('.back-to-top-ring-progress');
    var circumference = 2 * Math.PI * 20; // r=20
    
    window.addEventListener('scroll', function() {
      var scrollY = window.scrollY;
      backToTop.classList.toggle('visible', scrollY > 500);
      
      // Update progress ring
      if (progressRing) {
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var scrollRatio = docHeight > 0 ? Math.min(1, scrollY / docHeight) : 0;
        var offset = circumference * (1 - scrollRatio);
        progressRing.style.strokeDashoffset = offset;
        
        // Add complete class when fully scrolled (>98%)
        backToTop.classList.toggle('scroll-complete', scrollRatio > 0.98);
      }
    }, { passive: true });

    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ─── Review carousel ────────────────────────────────────
  const carousel = document.getElementById('reviewCarousel');
  if (carousel) {
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dots = carousel.querySelectorAll('.carousel-dot');
    let currentSlide = 0;
    let autoTimer = null;
    const AUTO_INTERVAL = 5000;

    function goToSlide(index) {
      // Exit current
      slides[currentSlide].classList.remove('carousel-slide--active');
      slides[currentSlide].classList.add('carousel-slide--exit');
      dots[currentSlide].classList.remove('carousel-dot--active');
      dots[currentSlide].setAttribute('aria-selected', 'false');

      // Clear exit class after animation
      const prevSlide = slides[currentSlide];
      setTimeout(() => prevSlide.classList.remove('carousel-slide--exit'), 500);

      // Enter new
      currentSlide = index;
      slides[currentSlide].classList.add('carousel-slide--active');
      dots[currentSlide].classList.add('carousel-dot--active');
      dots[currentSlide].setAttribute('aria-selected', 'true');
    }

    function nextSlide() {
      goToSlide((currentSlide + 1) % slides.length);
    }

    function startAuto() {
      stopAuto();
      if (!prefersReducedMotion) {
        autoTimer = setInterval(nextSlide, AUTO_INTERVAL);
      }
    }

    function stopAuto() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        if (i !== currentSlide) {
          goToSlide(i);
          startAuto(); // Reset timer on manual interaction
        }
      });
    });

    // Pause on hover
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);

    // Start auto-rotate
    startAuto();
  }

  // ─── Button ripple effect ────────────────────────────────
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      ripple.classList.add('btn-ripple');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  // ─── Before/After gallery sliders ────────────────────────
  document.querySelectorAll('[data-gallery-slider]').forEach(slider => {
    const before = slider.querySelector('.gallery-before');
    const handle = slider.querySelector('.gallery-handle');
    if (!before || !handle) return;

    let isDragging = false;

    function setPosition(x) {
      const rect = slider.getBoundingClientRect();
      let pct = ((x - rect.left) / rect.width) * 100;
      pct = Math.max(5, Math.min(95, pct));
      before.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
      handle.style.left = pct + '%';
      handle.setAttribute('aria-valuenow', Math.round(pct));
    }

    slider.addEventListener('pointerdown', e => {
      isDragging = true;
      slider.setPointerCapture(e.pointerId);
      setPosition(e.clientX);
    });

    slider.addEventListener('pointermove', e => {
      if (!isDragging) return;
      setPosition(e.clientX);
    });

    slider.addEventListener('pointerup', () => { isDragging = false; });
    slider.addEventListener('pointercancel', () => { isDragging = false; });

    // Keyboard support
    handle.addEventListener('keydown', e => {
      const rect = slider.getBoundingClientRect();
      const currentPct = parseFloat(handle.getAttribute('aria-valuenow')) || 50;
      let newPct = currentPct;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        newPct = Math.max(5, currentPct - 5);
        e.preventDefault();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        newPct = Math.min(95, currentPct + 5);
        e.preventDefault();
      }
      if (newPct !== currentPct) {
        before.style.clipPath = 'inset(0 ' + (100 - newPct) + '% 0 0)';
        handle.style.left = newPct + '%';
        handle.setAttribute('aria-valuenow', Math.round(newPct));
      }
    });

    // Prevent img drag (for when real images are added)
    slider.addEventListener('dragstart', e => e.preventDefault());
  });

  /* ── REVIEWS PAGE: Filter by category ──────────────────── */
  const filterBtns = document.querySelectorAll('.reviews-filter-btn');
  const reviewCards = document.querySelectorAll('.review-full-card');
  const reviewsEmpty = document.getElementById('reviewsEmpty');

  if (filterBtns.length && reviewCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        // Update active state
        filterBtns.forEach(b => {
          b.classList.remove('reviews-filter-btn--active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('reviews-filter-btn--active');
        btn.setAttribute('aria-selected', 'true');

        // Filter cards
        let visible = 0;
        reviewCards.forEach(card => {
          const cats = card.dataset.category || '';
          const show = filter === 'all' || cats.split(' ').includes(filter);
          card.hidden = !show;
          if (show) visible++;
        });

        // Show/hide empty state
        if (reviewsEmpty) reviewsEmpty.hidden = visible > 0;
      });
    });
  }

  /* ── Page load curtain ────────────────── */
  const curtain = document.getElementById('pageCurtain');
  if (curtain) {
    // Remove curtain once page fully loaded (or after 1.5s max)
    const removeCurtain = () => curtain.classList.add('done');
    if (document.readyState === 'complete') {
      setTimeout(removeCurtain, 300);
    } else {
      window.addEventListener('load', () => setTimeout(removeCurtain, 300));
    }
    // Safety: always remove after 1.5s even if load event is slow
    setTimeout(removeCurtain, 1500);
    // Fix back-button: bfcache restores the page with curtain still active
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) curtain.classList.add('done');
    });
  }

  /* ── Text luminance reveal — scroll-linked gradient text wipe ────────── */
  /* Velocity-aware: faster scrolling boosts reveal progress ahead of normal position */
  (function() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var reveals = document.querySelectorAll('[data-text-reveal]');
    if (!reveals.length) return;

    // Velocity tracking
    var lastScrollY = window.scrollY;
    var lastTime = performance.now();
    var velocityBoost = 0; // 0-15% bonus based on scroll speed

    function updateReveal() {
      var vh = window.innerHeight;

      // Calculate scroll velocity
      var now = performance.now();
      var dt = now - lastTime;
      if (dt > 0) {
        var dy = Math.abs(window.scrollY - lastScrollY);
        var velocity = dy / dt; // px/ms
        // Map velocity to boost: 0-4 px/ms → 0-15% bonus
        velocityBoost = Math.min(15, velocity * 3.75);
        // Decay boost gradually when scrolling slow
        if (velocity < 0.5) {
          velocityBoost *= 0.8;
        }
      }
      lastScrollY = window.scrollY;
      lastTime = now;

      reveals.forEach(function(el) {
        if (el.classList.contains('text-revealed')) return;
        var rect = el.getBoundingClientRect();
        // Start revealing when element enters viewport, complete when center of element reaches 40% from top
        var start = vh * 0.85;   // element entering bottom 85% of viewport
        var end = vh * 0.25;     // element well into view (top 25%)
        var current = rect.top + rect.height / 2;
        var progress;
        if (current >= start) {
          progress = 0;
        } else if (current <= end) {
          progress = 100;
        } else {
          progress = ((start - current) / (start - end)) * 100;
        }
        // Add velocity boost — fast scrolling reveals text ahead
        var boostedProgress = Math.min(100, progress + velocityBoost);
        // Apply easeOutCubic for a natural deceleration at the end
        var t = boostedProgress / 100;
        var eased = 1 - Math.pow(1 - t, 3);
        var easedProgress = eased * 100;
        el.style.setProperty('--reveal-progress', easedProgress.toFixed(1));
        // Lock when fully revealed to remove gradient overhead
        if (boostedProgress >= 100) {
          el.classList.add('text-revealed');
          el.style.removeProperty('--reveal-progress');
        }
      });
    }

    var ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function() {
          updateReveal();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial check (elements might already be in view)
    updateReveal();
  })();

  /* ── Character-split wave reveal for section titles ─────────────────────── */
  /* Wraps each character in a span and animates them in with a staggered wave */
  (function splitTextReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    var titles = document.querySelectorAll('.section-title');
    if (!titles.length) return;
    
    // Process each title: wrap characters in spans
    titles.forEach(function(title) {
      // Skip if already processed
      if (title.dataset.splitProcessed) return;
      title.dataset.splitProcessed = 'true';
      
      // Store original HTML for screen readers
      var originalText = title.textContent;
      title.setAttribute('aria-label', originalText);
      
      // Process text nodes and preserve existing HTML elements
      function processNode(node) {
        if (node.nodeType === 3) { // Text node
          var text = node.textContent;
          var fragment = document.createDocumentFragment();
          
          for (var i = 0; i < text.length; i++) {
            var char = text[i];
            var span = document.createElement('span');
            span.className = 'split-char';
            span.textContent = char === ' ' ? '\u00A0' : char; // Non-breaking space
            span.setAttribute('aria-hidden', 'true');
            fragment.appendChild(span);
          }
          
          node.parentNode.replaceChild(fragment, node);
        } else if (node.nodeType === 1) { // Element node
          // Process child nodes (e.g., <br>, <span class="text-accent">)
          var children = Array.prototype.slice.call(node.childNodes);
          children.forEach(processNode);
        }
      }
      
      var children = Array.prototype.slice.call(title.childNodes);
      children.forEach(processNode);
      
      // Add class for CSS targeting
      title.classList.add('split-ready');
    });
    
    // Animate when entering viewport
    var charDelay = 20; // ms between each character
    
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !entry.target.classList.contains('split-revealed')) {
          var title = entry.target;
          title.classList.add('split-revealing');
          
          var chars = title.querySelectorAll('.split-char');
          chars.forEach(function(char, i) {
            char.style.transitionDelay = (i * charDelay) + 'ms';
          });
          
          // Use requestAnimationFrame to ensure styles are applied before triggering
          requestAnimationFrame(function() {
            requestAnimationFrame(function() {
              title.classList.add('split-revealed');
              
              // Clean up transition delays after animation completes
              var totalDuration = chars.length * charDelay + 600; // 600ms base animation
              setTimeout(function() {
                chars.forEach(function(char) {
                  char.style.transitionDelay = '';
                });
                title.classList.remove('split-revealing');
              }, totalDuration);
            });
          });
          
          observer.unobserve(title);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });
    
    titles.forEach(function(title) {
      observer.observe(title);
    });
  })();

  /* ── Border beam — animated gradient border on hover ────────────────────── */
  (function() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.border-beam-hover').forEach(function(el) {
      el.addEventListener('mouseenter', function() {
        el.classList.add('border-beam-active');
      });
      el.addEventListener('mouseleave', function() {
        el.classList.remove('border-beam-active');
      });
    });
  })();

  /* ── 3D card tilt with specular glare + dynamic shadow ────────────────────── */
  (function() {
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    document.querySelectorAll('.card-tilt').forEach(function(card) {
      // Create specular glare overlay
      var glare = document.createElement('div');
      glare.className = 'card-glare';
      glare.setAttribute('aria-hidden', 'true');
      card.appendChild(glare);

      // State for spring animation
      var current = { rotX: 0, rotY: 0, lift: 0 };
      var target = { rotX: 0, rotY: 0, lift: 0 };
      var rafId = null;
      var isHovered = false;
      var SPRING = 0.12; // spring stiffness (0-1)
      var MAX_TILT = 8; // degrees
      var MAX_LIFT = 12; // px

      function lerp(a, b, t) { return a + (b - a) * t; }

      function animate() {
        current.rotX = lerp(current.rotX, target.rotX, SPRING);
        current.rotY = lerp(current.rotY, target.rotY, SPRING);
        current.lift = lerp(current.lift, target.lift, SPRING);

        // Apply transform
        card.style.transform =
          'perspective(800px) rotateX(' + current.rotX.toFixed(2) + 'deg) rotateY(' + current.rotY.toFixed(2) + 'deg) translateY(' + (-current.lift).toFixed(1) + 'px) scale(' + (1 + current.lift * 0.001).toFixed(4) + ')';

        // Dynamic shadow — shifts opposite to tilt
        var shadowX = -current.rotY * 1.5;
        var shadowY = current.rotX * 1.5 + current.lift;
        var shadowBlur = 20 + current.lift * 2;
        var shadowSpread = current.lift * 0.3;
        card.style.boxShadow =
          shadowX.toFixed(1) + 'px ' +
          shadowY.toFixed(1) + 'px ' +
          shadowBlur.toFixed(0) + 'px ' +
          shadowSpread.toFixed(0) + 'px rgba(0,0,0,' + (0.08 + current.lift * 0.008).toFixed(3) + ')';

        // Check if animation can stop
        var settled = Math.abs(current.rotX - target.rotX) < 0.05 &&
                      Math.abs(current.rotY - target.rotY) < 0.05 &&
                      Math.abs(current.lift - target.lift) < 0.1;
        if (settled && !isHovered) {
          card.style.transform = '';
          card.style.boxShadow = '';
          rafId = null;
          return;
        }
        rafId = requestAnimationFrame(animate);
      }

      function startAnim() {
        if (!rafId) rafId = requestAnimationFrame(animate);
      }

      card.addEventListener('mouseenter', function() {
        isHovered = true;
        glare.style.opacity = '1';
        startAnim();
      });

      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var normalX = x / rect.width;   // 0-1
        var normalY = y / rect.height;  // 0-1
        var midX = normalX - 0.5;       // -0.5 to 0.5
        var midY = normalY - 0.5;

        target.rotY = midX * MAX_TILT * 2;
        target.rotX = -midY * MAX_TILT * 2;
        target.lift = MAX_LIFT;

        // Position specular glare — follows cursor but offset for realistic light reflection
        glare.style.setProperty('--glare-x', (normalX * 100).toFixed(1) + '%');
        glare.style.setProperty('--glare-y', (normalY * 100).toFixed(1) + '%');

        // Set border accent side — the edge nearest the cursor glows
        card.style.setProperty('--edge-x', (normalX * 100).toFixed(1) + '%');
        card.style.setProperty('--edge-y', (normalY * 100).toFixed(1) + '%');

        startAnim();
      });

      card.addEventListener('mouseleave', function() {
        isHovered = false;
        target.rotX = 0;
        target.rotY = 0;
        target.lift = 0;
        glare.style.opacity = '0';
        startAnim();
      });
    });
  })();

  /* ═══════════════════════════════════════════════
   HERO PARTICLES — Tech dust & repair sparks
   Mixed particle types: dots (dust), sparks (accent),
   crosses (screw heads), lines (circuit traces).
   Each has unique motion, size, and opacity ranges.
═══════════════════════════════════════════════ */
  var particleContainer = document.querySelector('.hero-particles');
  if (particleContainer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var PARTICLE_COUNT = 35;
    // Weights: [type, weight] — dots are most common
    var TYPES = [
      { type: 'dot',   weight: 50, sizeMin: 2, sizeMax: 5, durationMin: 10, durationMax: 22, opacityMin: 0.06, opacityMax: 0.18 },
      { type: 'spark', weight: 15, sizeMin: 2, sizeMax: 4, durationMin: 4, durationMax: 8, opacityMin: 0.2, opacityMax: 0.5 },
      { type: 'cross', weight: 20, sizeMin: 5, sizeMax: 9, durationMin: 12, durationMax: 25, opacityMin: 0.06, opacityMax: 0.14 },
      { type: 'line',  weight: 15, sizeMin: 12, sizeMax: 28, durationMin: 8, durationMax: 16, opacityMin: 0.06, opacityMax: 0.15 }
    ];
    var totalWeight = TYPES.reduce(function(s, t) { return s + t.weight; }, 0);

    function pickType() {
      var r = Math.random() * totalWeight;
      for (var i = 0; i < TYPES.length; i++) {
        r -= TYPES[i].weight;
        if (r <= 0) return TYPES[i];
      }
      return TYPES[0];
    }

    function randRange(min, max) { return min + Math.random() * (max - min); }

    for (var i = 0; i < PARTICLE_COUNT; i++) {
      var cfg = pickType();
      var el = document.createElement('span');
      el.classList.add('hero-particle', 'hero-particle--' + cfg.type);

      // Size
      var size = randRange(cfg.sizeMin, cfg.sizeMax);
      if (cfg.type === 'line') {
        el.style.width = size + 'px';
        el.style.height = '1.5px';
      } else {
        el.style.width = el.style.height = size + 'px';
      }

      // Position — spread across full width, bottom 60% of hero
      el.style.left = Math.random() * 100 + '%';
      el.style.top = (40 + Math.random() * 55) + '%';

      // Motion custom properties
      var driftY = -(30 + Math.random() * 70) + 'vh';
      var sway = (Math.random() - 0.5) * 60 + 'px';
      var rotate = Math.random() * 360 + 'deg';
      var opacity = randRange(cfg.opacityMin, cfg.opacityMax);
      el.style.setProperty('--p-drift-y', driftY);
      el.style.setProperty('--p-sway', sway);
      el.style.setProperty('--p-rotate', rotate);
      el.style.setProperty('--p-opacity', opacity.toFixed(2));

      // Timing
      el.style.animationDuration = randRange(cfg.durationMin, cfg.durationMax).toFixed(1) + 's';
      el.style.animationDelay = (Math.random() * 15).toFixed(1) + 's';

      particleContainer.appendChild(el);
    }

    // ── Mouse parallax on particles ──
    // Shift particle container slightly opposite to cursor for depth
    if (window.matchMedia('(pointer: fine)').matches || window.matchMedia('(hover: hover)').matches) {
      var pTicking = false;
      document.addEventListener('mousemove', function(e) {
        if (pTicking) return;
        pTicking = true;
        requestAnimationFrame(function() {
          var cx = (e.clientX / window.innerWidth - 0.5) * 2;  // -1 to 1
          var cy = (e.clientY / window.innerHeight - 0.5) * 2;
          particleContainer.style.transform = 'translate(' + (cx * -8).toFixed(1) + 'px, ' + (cy * -6).toFixed(1) + 'px)';
          pTicking = false;
        });
      }, { passive: true });
    }
  }

  /* ── Pricing page tabs ─────────────────── */
  const pricingTabs = document.querySelectorAll('.pricing-tab');
  if (pricingTabs.length) {
    pricingTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        // Deactivate all
        pricingTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('.pricing-panel').forEach(p => {
          p.classList.remove('active');
          p.hidden = true;
        });
        // Activate selected
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        const panel = document.getElementById('panel-' + target);
        if (panel) {
          panel.classList.add('active');
          panel.hidden = false;
        }
      });

      // Keyboard: arrow keys between tabs
      tab.addEventListener('keydown', e => {
        const tabs = Array.from(pricingTabs);
        const idx = tabs.indexOf(tab);
        let next;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          next = tabs[(idx + 1) % tabs.length];
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          next = tabs[(idx - 1 + tabs.length) % tabs.length];
        }
        if (next) {
          e.preventDefault();
          next.focus();
          next.click();
        }
      });
    });
  }

  /* ── Service worker registration ─────── */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  /* ── Smooth page transitions ──────────── */
  // When clicking internal links, fade out via curtain before navigating
  if (curtain && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      // Only intercept internal navigation (not anchors, tel:, sms:, mailto:, external)
      if (!href || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('sms:') || href.startsWith('mailto:') || href.startsWith('http') || link.target === '_blank') return;
      // Must be a local page link
      if (!href.startsWith('/') && !href.endsWith('.html')) return;
      e.preventDefault();
      curtain.classList.remove('done');
      setTimeout(() => { window.location.href = href; }, 300);
    });
  }

  // ─── Device Check Wizard ─────────────────────────────────
  const dcStep1 = document.getElementById('dcStep1');
  const dcStep2 = document.getElementById('dcStep2');
  const dcStep3 = document.getElementById('dcStep3');
  const dcStep4 = document.getElementById('dcStep4');

  if (dcStep1) {
    const dcProgressBar = document.getElementById('dcProgressBar');
    const dcStepLabels = document.querySelectorAll('.dc-step');
    const dcProblems = document.getElementById('dcProblems');
    const dcResults = document.getElementById('dcResults');
    const dcNext2 = document.getElementById('dcNext2');
    const dcNext3 = document.getElementById('dcNext3');
    const dcDeviceLabel = document.getElementById('dcDeviceLabel');

    let state = { device: '', problems: [], urgency: 'no-rush', condition: 'works' };

    // Pricing database
    const repairData = {
      iphone: {
        label: 'iPhone',
        problems: [
          { id: 'screen', icon: 'broken_image', label: 'Cracked / broken screen', sub: 'Display damage', price: [39, 69], time: '45–60 min' },
          { id: 'battery', icon: 'battery_alert', label: 'Battery drains fast', sub: 'Swelling or short life', price: [35, 49], time: '30–45 min' },
          { id: 'charging', icon: 'bolt', label: 'Won\'t charge', sub: 'Port or cable issue', price: [39, 59], time: '45–60 min' },
          { id: 'water', icon: 'water_drop', label: 'Water damage', sub: 'Liquid exposure', price: [49, 89], time: '1–3 hrs' },
          { id: 'camera', icon: 'broken_image', label: 'Camera not working', sub: 'Blurry, black, or cracked', price: [45, 79], time: '45–60 min' },
          { id: 'button', icon: 'touch_app', label: 'Buttons not responding', sub: 'Home, power, or volume', price: [35, 55], time: '30–45 min' },
          { id: 'speaker', icon: 'volume_off', label: 'No sound / speaker issue', sub: 'Muffled or silent', price: [35, 55], time: '30–45 min' },
          { id: 'other', icon: 'build', label: 'Something else', sub: 'Not listed above', price: [29, 89], time: 'Varies' }
        ]
      },
      android: {
        label: 'Android Phone',
        problems: [
          { id: 'screen', icon: 'broken_image', label: 'Cracked / broken screen', sub: 'LCD or AMOLED', price: [49, 89], time: '60–90 min' },
          { id: 'battery', icon: 'battery_alert', label: 'Battery drains fast', sub: 'Swelling or short life', price: [35, 55], time: '30–45 min' },
          { id: 'charging', icon: 'bolt', label: 'Won\'t charge', sub: 'USB-C port issue', price: [35, 59], time: '45–60 min' },
          { id: 'water', icon: 'water_drop', label: 'Water damage', sub: 'Liquid exposure', price: [49, 89], time: '1–3 hrs' },
          { id: 'camera', icon: 'broken_image', label: 'Camera not working', sub: 'Blurry, black, or cracked', price: [45, 79], time: '45–60 min' },
          { id: 'software', icon: 'restart_alt', label: 'Frozen / boot loop', sub: 'Won\'t start properly', price: [29, 49], time: '30–60 min' },
          { id: 'back', icon: 'screen_rotation', label: 'Back glass cracked', sub: 'Rear panel damage', price: [35, 69], time: '45–60 min' },
          { id: 'other', icon: 'build', label: 'Something else', sub: 'Not listed above', price: [29, 89], time: 'Varies' }
        ]
      },
      laptop: {
        label: 'Laptop / PC',
        problems: [
          { id: 'screen', icon: 'broken_image', label: 'Broken / dim screen', sub: 'Cracked or no display', price: [99, 199], time: '1–2 hrs' },
          { id: 'battery', icon: 'battery_alert', label: 'Battery won\'t hold charge', sub: 'Short life or swelling', price: [69, 99], time: '30–60 min' },
          { id: 'keyboard', icon: 'keyboard', label: 'Keyboard issues', sub: 'Sticky or dead keys', price: [79, 129], time: '1–2 hrs' },
          { id: 'slow', icon: 'speed', label: 'Running slow', sub: 'SSD/RAM upgrade', price: [49, 99], time: '1–2 hrs' },
          { id: 'virus', icon: 'warning', label: 'Virus / malware', sub: 'Popups, slowdown', price: [39, 59], time: '1–2 hrs' },
          { id: 'noboot', icon: 'restart_alt', label: 'Won\'t turn on', sub: 'Dead or boot failure', price: [49, 129], time: '1–3 hrs' },
          { id: 'water', icon: 'water_drop', label: 'Liquid spill', sub: 'Keyboard or internal', price: [79, 149], time: '2–4 hrs' },
          { id: 'other', icon: 'build', label: 'Something else', sub: 'Not listed above', price: [49, 149], time: 'Varies' }
        ]
      },
      tablet: {
        label: 'iPad / Tablet',
        problems: [
          { id: 'screen', icon: 'broken_image', label: 'Cracked screen', sub: 'Glass or LCD', price: [59, 129], time: '60–90 min' },
          { id: 'battery', icon: 'battery_alert', label: 'Battery drains fast', sub: 'Short life', price: [49, 79], time: '45–60 min' },
          { id: 'charging', icon: 'bolt', label: 'Won\'t charge', sub: 'Port issue', price: [39, 69], time: '45–60 min' },
          { id: 'button', icon: 'touch_app', label: 'Button not working', sub: 'Home or power', price: [35, 59], time: '30–45 min' },
          { id: 'water', icon: 'water_drop', label: 'Water damage', sub: 'Liquid exposure', price: [49, 89], time: '1–3 hrs' },
          { id: 'other', icon: 'build', label: 'Something else', sub: 'Not listed above', price: [39, 99], time: 'Varies' }
        ]
      },
      console: {
        label: 'Game Console',
        problems: [
          { id: 'disc', icon: 'broken_image', label: 'Disc read errors', sub: 'Won\'t read games', price: [49, 89], time: '1–2 hrs' },
          { id: 'hdmi', icon: 'monitor', label: 'No video output', sub: 'HDMI port issue', price: [59, 99], time: '1–2 hrs' },
          { id: 'overheat', icon: 'warning', label: 'Overheating', sub: 'Thermal paste / fan', price: [39, 69], time: '1–2 hrs' },
          { id: 'drift', icon: 'touch_app', label: 'Controller drift', sub: 'Joy-Con or thumbstick', price: [25, 45], time: '30–45 min' },
          { id: 'nopower', icon: 'restart_alt', label: 'Won\'t turn on', sub: 'Power supply issue', price: [49, 89], time: '1–2 hrs' },
          { id: 'other', icon: 'build', label: 'Something else', sub: 'Not listed above', price: [39, 99], time: 'Varies' }
        ]
      },
      other: {
        label: 'Other Device',
        problems: [
          { id: 'screen', icon: 'broken_image', label: 'Screen / display issue', sub: 'Cracked or dead', price: [39, 129], time: 'Varies' },
          { id: 'battery', icon: 'battery_alert', label: 'Battery issue', sub: 'Won\'t hold charge', price: [29, 79], time: 'Varies' },
          { id: 'nopower', icon: 'restart_alt', label: 'Won\'t turn on', sub: 'Dead device', price: [29, 89], time: 'Varies' },
          { id: 'other', icon: 'build', label: 'Something else', sub: 'Not listed above', price: [29, 99], time: 'Varies' }
        ]
      }
    };

    function setStep(step) {
      [dcStep1, dcStep2, dcStep3, dcStep4].forEach((p, i) => {
        p.classList.toggle('active', i + 1 === step);
      });
      dcProgressBar.style.width = (step * 25) + '%';
      dcStepLabels.forEach((el, i) => {
        el.classList.toggle('active', i + 1 === step);
        el.classList.toggle('done', i + 1 < step);
      });
      // Scroll to wizard top
      const wizard = document.getElementById('device-check');
      if (wizard) wizard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Step 1: Device selection
    dcStep1.querySelectorAll('.dc-option').forEach(btn => {
      btn.addEventListener('click', () => {
        state.device = btn.dataset.device;
        state.problems = [];
        populateProblems();
        setStep(2);
      });
    });

    // Populate step 2 problems
    function populateProblems() {
      const data = repairData[state.device];
      dcDeviceLabel.textContent = 'Select all that apply for your ' + data.label;
      dcProblems.innerHTML = '';
      data.problems.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'dc-option';
        btn.dataset.problem = p.id;
        btn.innerHTML = `
          <span class="material-symbols-outlined">${p.icon}</span>
          <span class="dc-option-text">
            <strong>${p.label}</strong>
            <span class="dc-option-sub">${p.sub}</span>
          </span>
          <span class="dc-check"><span class="material-symbols-outlined">check</span></span>
        `;
        btn.addEventListener('click', () => {
          btn.classList.toggle('selected');
          const pid = btn.dataset.problem;
          if (state.problems.includes(pid)) {
            state.problems = state.problems.filter(x => x !== pid);
          } else {
            state.problems.push(pid);
          }
          dcNext2.disabled = state.problems.length === 0;
        });
        dcProblems.appendChild(btn);
      });
      dcNext2.disabled = true;
    }

    // Step 2 next
    dcNext2.addEventListener('click', () => {
      if (state.problems.length === 0) return;
      setStep(3);
    });

    // Step 3 next — generate results
    dcNext3.addEventListener('click', () => {
      state.urgency = document.querySelector('input[name="urgency"]:checked')?.value || 'no-rush';
      state.condition = document.querySelector('input[name="condition"]:checked')?.value || 'works';
      generateResults();
      setStep(4);
    });

    // Back buttons
    document.getElementById('dcBack2')?.addEventListener('click', () => setStep(1));
    document.getElementById('dcBack3')?.addEventListener('click', () => setStep(2));
    document.getElementById('dcBack4')?.addEventListener('click', () => {
      state = { device: '', problems: [], urgency: 'no-rush', condition: 'works' };
      setStep(1);
    });

    function generateResults() {
      const data = repairData[state.device];
      const selected = data.problems.filter(p => state.problems.includes(p.id));

      let totalLow = 0;
      let totalHigh = 0;

      let rowsHTML = '';
      selected.forEach(p => {
        totalLow += p.price[0];
        totalHigh += p.price[1];
        rowsHTML += `
          <div class="dc-estimate-row">
            <span class="dc-estimate-label">
              <span class="material-symbols-outlined">${p.icon}</span>
              ${p.label}
            </span>
            <span class="dc-estimate-value">$${p.price[0]}–$${p.price[1]}</span>
          </div>`;
      });

      // Time estimate
      let timeStr = selected.length === 1 ? selected[0].time : 'Varies by repair';
      if (selected.length > 1 && selected.length <= 3) timeStr = '1–3 hours (combined)';
      if (selected.length > 3) timeStr = '2–4 hours (combined)';

      // Urgency badge
      const urgLabels = { 'no-rush': ['No rush', 'no-rush'], 'soon': ['Within 1–2 days', 'soon'], 'asap': ['ASAP — priority', 'asap'] };
      const [urgText, urgClass] = urgLabels[state.urgency];

      // Condition note
      const condNotes = {
        works: 'Since your device still works, this is likely a straightforward repair.',
        partial: 'Partially working devices usually have a good prognosis — I\'ll confirm once I see it.',
        dead: 'Devices that won\'t turn on need diagnosis first. The estimate above covers the most likely fix — I\'ll confirm the exact cost before starting.'
      };

      // SMS body
      const smsIssues = selected.map(p => p.label.toLowerCase()).join(', ');
      const smsBody = encodeURIComponent(`Hi, I used the Device Check tool. I have a ${data.label} with: ${smsIssues}. Urgency: ${urgText.toLowerCase()}. Can you help?`);

      dcResults.innerHTML = `
        <div class="dc-results-header">
          <span class="material-symbols-outlined">check_circle</span>
          <h2>Here's your estimate</h2>
          <p>${data.label} — ${selected.length} repair${selected.length > 1 ? 's' : ''}</p>
          <span class="dc-urgency-badge dc-urgency-badge--${urgClass}">
            <span class="material-symbols-outlined">schedule</span> ${urgText}
          </span>
        </div>

        <div class="dc-estimate-card">
          <div class="dc-estimate-card-header">
            <span class="material-symbols-outlined">description</span>
            Repair Breakdown
          </div>
          <div class="dc-estimate-rows">
            ${rowsHTML}
            <div class="dc-estimate-row">
              <span class="dc-estimate-label">
                <span class="material-symbols-outlined">timer</span>
                Estimated time
              </span>
              <span class="dc-estimate-time">${timeStr}</span>
            </div>
          </div>
          <div class="dc-estimate-card-footer">
            <span>Estimated total</span>
            <span style="color: var(--accent);">$${totalLow}${totalHigh > totalLow ? '–$' + totalHigh : ''}</span>
          </div>
        </div>

        <p class="dc-results-note">
          ${condNotes[state.condition]}<br />
          This is an estimate based on common repairs. Final pricing confirmed after free in-person diagnosis. All repairs include a <strong>90-day warranty</strong>.
        </p>

        <div class="dc-results-cta">
          <a href="sms:+12083666111?body=${smsBody}" class="btn btn-primary">
            <span class="material-symbols-outlined">sms</span> Text This Estimate to Samuel
          </a>
          <a href="/contact" class="btn btn-outline">
            <span class="material-symbols-outlined">description</span> Request Full Quote
          </a>
        </div>
      `;
    }
  }

  // ─── Floating Help Widget ─────────────────────────────────
  const helpFab = document.getElementById('helpFab');
  const helpTrigger = document.getElementById('helpFabTrigger');

  if (helpFab && helpTrigger) {
    // Check if dismissed this session
    if (sessionStorage.getItem('hdr_help_dismissed') === '1') {
      helpFab.classList.add('dismissed');
    }

    helpTrigger.addEventListener('click', () => {
      if (helpFab.classList.contains('open')) {
        helpFab.classList.remove('open');
      } else {
        helpFab.classList.add('open');
      }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (helpFab.classList.contains('open') && !helpFab.contains(e.target)) {
        helpFab.classList.remove('open');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && helpFab.classList.contains('open')) {
        helpFab.classList.remove('open');
        helpTrigger.focus();
      }
    });

    // Hide after clicking a contact option (they navigated)
    helpFab.querySelectorAll('.help-fab-option').forEach(opt => {
      opt.addEventListener('click', () => {
        helpFab.classList.remove('open');
      });
    });

    // Don't show immediately — wait for scroll to indicate engagement
    helpFab.style.opacity = '0';
    helpFab.style.transform = 'translateY(16px)';
    helpFab.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    let helpShown = false;
    const showHelp = () => {
      if (!helpShown && window.scrollY > 300) {
        helpShown = true;
        helpFab.style.opacity = '1';
        helpFab.style.transform = 'translateY(0)';
        window.removeEventListener('scroll', showHelp);
      }
    };
    window.addEventListener('scroll', showHelp, { passive: true });
    // Also show after 8 seconds if user hasn't scrolled
    setTimeout(() => {
      if (!helpShown) {
        helpShown = true;
        helpFab.style.opacity = '1';
        helpFab.style.transform = 'translateY(0)';
      }
    }, 8000);
  }

})();

// ─── FAQ Hub: Search + Category Filters ───────────────────
(function() {
  const search = document.getElementById('faqSearch');
  const count  = document.getElementById('faqSearchCount');
  const filters = document.getElementById('faqFilters');
  const noResults = document.getElementById('faqNoResults');
  if (!search || !filters) return;

  const items = Array.from(document.querySelectorAll('.faq-hub-item'));
  const categories = Array.from(document.querySelectorAll('.faq-hub-category'));
  let activeCategory = 'all';

  function applyFilters() {
    const query = search.value.toLowerCase().trim();
    let visible = 0;

    items.forEach(item => {
      const cat = item.getAttribute('data-category');
      const text = item.textContent.toLowerCase();
      const matchesCat = activeCategory === 'all' || cat === activeCategory;
      const matchesSearch = !query || text.includes(query);
      const show = matchesCat && matchesSearch;
      item.hidden = !show;
      if (show) visible++;
    });

    // Show/hide category headings
    categories.forEach(catDiv => {
      const cat = catDiv.getAttribute('data-cat');
      const matchesCat = activeCategory === 'all' || cat === activeCategory;
      const hasVisible = Array.from(catDiv.querySelectorAll('.faq-hub-item')).some(i => !i.hidden);
      catDiv.hidden = !matchesCat || !hasVisible;
    });

    // Update count
    if (query) {
      count.textContent = visible + ' found';
    } else {
      count.textContent = '';
    }

    // No results
    if (noResults) {
      noResults.hidden = visible > 0;
    }
  }

  // Search input
  search.addEventListener('input', applyFilters);

  // Category filter buttons
  filters.addEventListener('click', function(e) {
    const btn = e.target.closest('.faq-hub-filter');
    if (!btn) return;
    activeCategory = btn.getAttribute('data-category');
    filters.querySelectorAll('.faq-hub-filter').forEach(b => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
    });
    applyFilters();
  });

  // Keyboard: arrows between filters
  filters.addEventListener('keydown', function(e) {
    const btns = Array.from(filters.querySelectorAll('.faq-hub-filter'));
    const idx = btns.indexOf(document.activeElement);
    if (idx < 0) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      btns[(idx + 1) % btns.length].focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      btns[(idx - 1 + btns.length) % btns.length].focus();
    }
  });
})();

// ─── Float Labels: Select handling ────────────────────────
// Selects don't support :placeholder-shown, so we toggle a class
(function() {
  document.querySelectorAll('.form-group select').forEach(function(sel) {
    function update() {
      if (sel.value) {
        sel.classList.add('has-value');
      } else {
        sel.classList.remove('has-value');
      }
    }
    sel.addEventListener('change', update);
    update(); // Initial state
  });
})();

// ─── Timeline scroll-fill animation ──────────────────────
(function() {
  var timeline = document.getElementById('processTimeline');
  var fill = document.getElementById('timelineFill');
  var glow = document.getElementById('timelineGlow');
  if (!timeline || !fill) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateFill() {
    var rect = timeline.getBoundingClientRect();
    var viewH = window.innerHeight;

    // Calculate how far through the timeline the viewport center is
    var timelineTop = rect.top;
    var timelineH = rect.height;

    if (timelineTop > viewH) {
      fill.style.height = '0%';
      if (glow) { glow.classList.remove('active'); }
      return;
    }
    if (timelineTop + timelineH < 0) {
      fill.style.height = '100%';
      if (glow) { glow.classList.remove('active'); }
      return;
    }

    // Progress: 0 when section top hits viewport bottom, 1 when section bottom hits viewport top
    var scrolled = viewH - timelineTop;
    var total = viewH + timelineH;
    var pct = Math.max(0, Math.min(100, (scrolled / total) * 125));

    fill.style.height = (reduceMotion ? 100 : pct) + '%';

    // Position the glow dot at the fill's leading edge
    if (glow && !reduceMotion && pct > 0 && pct < 100) {
      glow.classList.add('active');
      glow.style.top = pct + '%';
    } else if (glow) {
      glow.classList.remove('active');
    }
  }

  if (!reduceMotion) {
    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() { updateFill(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
  }
  updateFill();
})();


/* ═══════════════════════════════════════════════
   TIMELINE DOT PARALLAX
   Timeline dots float gently as you scroll through
   the section, creating subtle depth perception.
═══════════════════════════════════════════════ */
(function timelineDotParallaxInit() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var dots = document.querySelectorAll('.timeline-dot');
  var timeline = document.getElementById('processTimeline');
  if (!dots.length || !timeline) return;

  var PARALLAX_STRENGTH = 15; // max px offset
  var lastScrollY = window.scrollY;
  var ticking = false;

  function updateParallax() {
    var rect = timeline.getBoundingClientRect();
    var viewH = window.innerHeight;

    // Only animate when timeline is in view
    if (rect.top > viewH || rect.bottom < 0) {
      dots.forEach(function(dot) {
        dot.style.setProperty('--parallax-y', '0px');
      });
      return;
    }

    // Calculate progress through timeline (0 = top of section at bottom of viewport, 1 = bottom at top)
    var scrolled = viewH - rect.top;
    var total = viewH + rect.height;
    var progress = Math.max(0, Math.min(1, scrolled / total));

    // Apply staggered parallax to each dot
    dots.forEach(function(dot, i) {
      // Each dot has a slightly different parallax offset based on its position
      var dotOffset = i * 0.12; // Stagger factor
      var effectiveProgress = progress + dotOffset;
      // Sine wave for smooth floating effect
      var offset = Math.sin(effectiveProgress * Math.PI * 2) * PARALLAX_STRENGTH;
      dot.style.setProperty('--parallax-y', offset + 'px');
    });
  }

  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(function() {
        updateParallax();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  updateParallax();
})();


/* ═══════════════════════════════════════════════
   MAGNETIC BUTTONS
   Buttons pull toward cursor within a proximity radius.
   Uses CSS custom properties for GPU-accelerated transform.
═══════════════════════════════════════════════ */
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Only on pointer/hover devices (not touch-only)
  var hasPointer = window.matchMedia('(pointer: fine)').matches || window.matchMedia('(hover: hover)').matches;
  if (!hasPointer) return;

  var MAGNETIC_RADIUS = 80;  // px — attraction zone around button
  var MAGNETIC_STRENGTH = 0.35; // 0-1 — how far the button moves
  var buttons = document.querySelectorAll('[data-magnetic]');

  buttons.forEach(function(btn) {
    // Wrap children in an inner span for counter-shift effect
    if (!btn.querySelector('.btn-magnetic-inner')) {
      var inner = document.createElement('span');
      inner.className = 'btn-magnetic-inner';
      while (btn.firstChild) inner.appendChild(btn.firstChild);
      btn.appendChild(inner);
    }

    var rafId = null;

    function handleMove(e) {
      if (rafId) return;
      rafId = requestAnimationFrame(function() {
        rafId = null;
        var rect = btn.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = e.clientX - cx;
        var dy = e.clientY - cy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var radius = Math.max(rect.width, rect.height) / 2 + MAGNETIC_RADIUS;

        if (dist < radius) {
          var pull = 1 - (dist / radius);  // 1 at center, 0 at edge
          var moveX = dx * pull * MAGNETIC_STRENGTH;
          var moveY = dy * pull * MAGNETIC_STRENGTH;
          btn.style.transform = 'translate(' + moveX.toFixed(1) + 'px, ' + moveY.toFixed(1) + 'px)';
          var innerEl = btn.querySelector('.btn-magnetic-inner');
          if (innerEl) {
            innerEl.style.transform = 'translate(' + (moveX * 0.3).toFixed(1) + 'px, ' + (moveY * 0.3).toFixed(1) + 'px)';
          }
          btn.classList.add('is-magnetic');
        } else {
          release();
        }
      });
    }

    function release() {
      btn.style.transform = '';
      var innerEl = btn.querySelector('.btn-magnetic-inner');
      if (innerEl) innerEl.style.transform = '';
      btn.classList.remove('is-magnetic');
    }

    document.addEventListener('mousemove', handleMove, { passive: true });
    btn.addEventListener('mouseleave', release);
  });
})();


/* ═══════════════════════════════════════════════
   MAGNETIC NAV LINKS
   Subtle magnetic pull effect on navigation links.
═══════════════════════════════════════════════ */
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var hasPointer = window.matchMedia('(pointer: fine)').matches || window.matchMedia('(hover: hover)').matches;
  if (!hasPointer) return;

  var links = document.querySelectorAll('.nav-links .nav-link');
  if (!links.length) return;

  var RADIUS = 50;    // px — smaller attraction zone (subtle)
  var STRENGTH = 0.2; // lower strength for readability

  links.forEach(function(link) {
    var rafId = null;

    function handleMove(e) {
      if (rafId) return;
      rafId = requestAnimationFrame(function() {
        rafId = null;
        var rect = link.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = e.clientX - cx;
        var dy = e.clientY - cy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var triggerRadius = Math.max(rect.width, rect.height) / 2 + RADIUS;

        if (dist < triggerRadius) {
          var pull = 1 - (dist / triggerRadius);
          var moveX = dx * pull * STRENGTH;
          var moveY = dy * pull * STRENGTH;
          link.style.transform = 'translate(' + moveX.toFixed(1) + 'px, ' + moveY.toFixed(1) + 'px)';
        } else {
          link.style.transform = '';
        }
      });
    }

    function release() {
      link.style.transform = '';
    }

    link.addEventListener('mouseenter', function() {
      document.addEventListener('mousemove', handleMove, { passive: true });
    });
    link.addEventListener('mouseleave', function() {
      document.removeEventListener('mousemove', handleMove);
      release();
    });
  });
})();


/* ═══════════════════════════════════════════════
   CARD CURSOR-GLOW
   Radial spotlight follows mouse across service cards.
═══════════════════════════════════════════════ */
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var hasPointer2 = window.matchMedia('(pointer: fine)').matches || window.matchMedia('(hover: hover)').matches;
  if (!hasPointer2) return;

  var cards = document.querySelectorAll('[data-card-glow]');
  if (!cards.length) return;

  cards.forEach(function(card) {
    var rafId = null;

    card.addEventListener('mousemove', function(e) {
      if (rafId) return;
      rafId = requestAnimationFrame(function() {
        rafId = null;
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        card.style.setProperty('--glow-x', x + 'px');
        card.style.setProperty('--glow-y', y + 'px');
        card.classList.add('card-glow-active');
      });
    }, { passive: true });

    card.addEventListener('mouseleave', function() {
      card.classList.remove('card-glow-active');
    });
  });
})();


/* ═══════════════════════════════════════════════
   SERVICE CARD ICON ENTRANCE ANIMATIONS
   Each icon gets a unique animation when its parent
   card scrolls into view. Staggered by card position.
═══════════════════════════════════════════════ */
(function() {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var iconEls = document.querySelectorAll('[data-icon-anim]');
  if (!iconEls.length) return;

  if (reduceMotion) {
    iconEls.forEach(function(el) { el.classList.add('icon-animated'); });
    return;
  }

  if ('IntersectionObserver' in window) {
    // Track stagger per parent container
    var parentStagger = new WeakMap();

    var iconObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.classList.contains('icon-animated')) return;

        // Get stagger index from parent
        var parent = el.closest('.services-grid') || el.parentElement;
        var count = parentStagger.get(parent) || 0;
        parentStagger.set(parent, count + 1);

        // Stagger the animation trigger by 120ms per card
        var delay = Math.min(count, 7) * 120;
        setTimeout(function() {
          el.classList.add('icon-animated');
        }, delay);

        iconObserver.unobserve(el);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -20px 0px' });

    iconEls.forEach(function(el) { iconObserver.observe(el); });
  } else {
    iconEls.forEach(function(el) { el.classList.add('icon-animated'); });
  }
})();


/* ═══════════════════════════════════════════════
   SCROLL-BASED ACCENT HUE SHIFT
   Creates a visual temperature journey — blue at top
   gradually warms toward purple/magenta as user scrolls.
═══════════════════════════════════════════════ */
(function scrollAccentShift() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  
  // Define color journey: hue values (HSL)
  // Blue (215°) → Indigo (240°) → Purple (270°) → Magenta (290°)
  var START_HUE = 215; // Blue at top
  var END_HUE = 290;   // Magenta at bottom
  var SATURATION = 90; // Keep it vibrant
  var LIGHTNESS_DARK = 64;  // For dark mode
  var LIGHTNESS_LIGHT = 50; // For light mode (darker for contrast)
  
  var root = document.documentElement;
  var ticking = false;
  
  function updateAccentColor() {
    var scrollY = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    
    // Calculate scroll progress (0-1)
    var progress = Math.min(1, Math.max(0, scrollY / docHeight));
    
    // Ease the progress for smoother transitions
    // Using easeInOutQuad: slower at edges, faster in middle
    var eased = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    
    // Calculate current hue
    var currentHue = START_HUE + (END_HUE - START_HUE) * eased;
    
    // Check current theme
    var isDark = root.getAttribute('data-theme') !== 'light';
    var lightness = isDark ? LIGHTNESS_DARK : LIGHTNESS_LIGHT;
    
    // Generate colors
    var accentHSL = 'hsl(' + currentHue.toFixed(1) + ', ' + SATURATION + '%, ' + lightness + '%)';
    var accentHoverHSL = 'hsl(' + currentHue.toFixed(1) + ', ' + SATURATION + '%, ' + (lightness + (isDark ? 8 : -10)) + '%)';
    var accentDim = 'hsla(' + currentHue.toFixed(1) + ', ' + SATURATION + '%, ' + lightness + '%, ' + (isDark ? '0.12' : '0.06') + ')';
    var accentGlow = 'hsla(' + currentHue.toFixed(1) + ', ' + SATURATION + '%, ' + lightness + '%, ' + (isDark ? '0.25' : '0.15') + ')';
    
    // Apply to custom properties
    root.style.setProperty('--accent', accentHSL);
    root.style.setProperty('--accent-hover', accentHoverHSL);
    root.style.setProperty('--accent-dim', accentDim);
    root.style.setProperty('--accent-glow', accentGlow);
    
    // Also update the text accent color
    root.style.setProperty('--color-accent', accentHSL);
  }
  
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(function() {
        updateAccentColor();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  
  // Initial call
  updateAccentColor();
  
  // Also update when theme changes
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'data-theme') {
        updateAccentColor();
      }
    });
  });
  observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
})();

/* ═══════════════════════════════════════════════
   KONAMI CODE EASTER EGG
   ↑↑↓↓←→←→BA triggers a brief "arcade mode"
   with CRT scanlines, green tint, and a fun toast.
═══════════════════════════════════════════════ */
(function() {
  var KONAMI = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  // ArrowUp=38, ArrowDown=40, ArrowLeft=37, ArrowRight=39, B=66, A=65
  var pos = 0;
  var triggered = false;

  // Create arcade overlay elements (once)
  var arcadeOverlay = document.createElement('div');
  arcadeOverlay.className = 'arcade-mode';
  arcadeOverlay.setAttribute('aria-hidden', 'true');
  document.documentElement.appendChild(arcadeOverlay);

  var arcadeToast = document.createElement('div');
  arcadeToast.className = 'arcade-toast';
  arcadeToast.setAttribute('role', 'alert');
  arcadeToast.innerHTML = '<div class="arcade-toast-title">🕹️ KONAMI CODE!</div><div class="arcade-toast-sub">You found the secret. Samuel fixes devices like a boss.</div>';
  document.documentElement.appendChild(arcadeToast);

  document.addEventListener('keydown', function(e) {
    if (triggered) return;

    if (e.keyCode === KONAMI[pos]) {
      pos++;
      if (pos === KONAMI.length) {
        triggered = true;
        activateArcadeMode();
      }
    } else {
      pos = 0;
      // Check if this key matches the start of the sequence
      if (e.keyCode === KONAMI[0]) pos = 1;
    }
  });

  function activateArcadeMode() {
    document.body.classList.add('konami-active');
    arcadeOverlay.classList.add('active');

    // Show toast after a brief delay
    setTimeout(function() {
      arcadeToast.classList.add('show');
    }, 300);

    // Play a subtle "achievement unlocked" effect
    // Auto-dismiss after 4 seconds
    setTimeout(function() {
      arcadeToast.classList.remove('show');
    }, 4000);

    setTimeout(function() {
      arcadeOverlay.classList.remove('active');
      document.body.classList.remove('konami-active');
      // Allow re-trigger after full reset
      setTimeout(function() {
        triggered = false;
        pos = 0;
      }, 1000);
    }, 4500);
  }
})();


/* ═══════════════════════════════════════════════
   HERO SCROLL PARALLAX — Layered depth on scroll
   Background elements move at different rates as
   you scroll, creating a 3D depth illusion.
   Content fades and lifts as it scrolls away.
═══════════════════════════════════════════════ */
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var hero = document.getElementById('hero');
  if (!hero) return;

  var heroInner = hero.querySelector('.hero-inner');
  var heroGrid = hero.querySelector('.hero-bg-grid');
  var heroGlow1 = hero.querySelector('.hero-glow-1');
  var heroGlow2 = hero.querySelector('.hero-glow-2');
  var heroMountains = hero.querySelector('.hero-mountains');
  var heroScrollHint = hero.querySelector('.hero-scroll-hint');
  var scrollHintBooped = false; // Track if we've played the boop

  // Parallax rates: higher = moves faster relative to scroll
  var RATES = {
    grid: 0.08,
    glow1: 0.25,
    glow2: 0.18,
    mountains: 0.04,
    content: 0.35,
    contentOpacity: 1.5,  // Fade speed (multiplier on scroll ratio)
    contentScale: 0.06    // How much to scale down
  };

  var heroHeight = 0;
  var ticking = false;
  var lastScroll = -1;

  function updateHeroHeight() {
    heroHeight = hero.offsetHeight || window.innerHeight;
  }
  updateHeroHeight();
  window.addEventListener('resize', updateHeroHeight, { passive: true });

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(applyParallax);
  }

  function applyParallax() {
    ticking = false;
    var scrollY = window.scrollY || window.pageYOffset;

    // Only apply when hero is in view (plus a small buffer)
    if (scrollY > heroHeight + 100) {
      if (lastScroll <= heroHeight + 100) {
        // Just left viewport — set final state
        resetHeroElements();
        lastScroll = scrollY;
      }
      return;
    }
    lastScroll = scrollY;

    // Scroll ratio: 0 at top, 1 at hero bottom
    var ratio = Math.min(scrollY / heroHeight, 1);

    // ── Grid: subtle upward shift ──
    if (heroGrid) {
      heroGrid.style.transform = 'translateY(' + (-scrollY * RATES.grid).toFixed(1) + 'px)';
    }

    // ── Glow blobs: drift upward faster, composing with mouse offset ──
    if (heroGlow1) {
      var scrollOff1 = -scrollY * RATES.glow1;
      heroGlow1.dataset.scrollY = scrollOff1;
      // Re-compose with mouse position stored in outer scope
      var mx1 = (typeof heroMouseX !== 'undefined' ? heroMouseX : 0) * 30;
      var my1 = (typeof heroMouseY !== 'undefined' ? heroMouseY : 0) * 30;
      heroGlow1.style.transform = 'translate(' + mx1.toFixed(1) + 'px, ' + (my1 + scrollOff1).toFixed(1) + 'px)';
    }
    if (heroGlow2) {
      var scrollOff2 = -scrollY * RATES.glow2;
      heroGlow2.dataset.scrollY = scrollOff2;
      var mx2 = (typeof heroMouseX !== 'undefined' ? heroMouseX : 0) * 15;
      var my2 = (typeof heroMouseY !== 'undefined' ? heroMouseY : 0) * 15;
      heroGlow2.style.transform = 'translate(' + mx2.toFixed(1) + 'px, ' + (my2 + scrollOff2).toFixed(1) + 'px)';
    }

    // ── Mountains: very slight upward creep (back range barely moves) ──
    if (heroMountains) {
      heroMountains.style.transform = 'translateY(' + (-scrollY * RATES.mountains).toFixed(1) + 'px)';
    }

    // ── Content: fade out + lift + slight scale down ──
    if (heroInner) {
      var contentY = -scrollY * RATES.content;
      var contentOpacity = Math.max(0, 1 - ratio * RATES.contentOpacity);
      var contentScale = 1 - ratio * RATES.contentScale;
      heroInner.style.transform = 'translateY(' + contentY.toFixed(1) + 'px) scale(' + contentScale.toFixed(3) + ')';
      heroInner.style.opacity = contentOpacity.toFixed(3);
    }

    // ── Scroll hint: boop on first scroll, then fade out ──
    if (heroScrollHint) {
      // Trigger "boop" squish animation on first meaningful scroll
      if (!scrollHintBooped && scrollY > 5) {
        scrollHintBooped = true;
        heroScrollHint.classList.add('boop');
      }
      heroScrollHint.style.opacity = Math.max(0, 1 - ratio * 4).toFixed(3);
    }
  }

  function resetHeroElements() {
    // When scrolled past hero, set everything to "gone" state
    if (heroInner) {
      heroInner.style.opacity = '0';
    }
    if (heroScrollHint) {
      heroScrollHint.style.opacity = '0';
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  // Initial call in case page loads scrolled
  applyParallax();
})();


/* ═══════════════════════════════════════════════
   TRUST METRICS — Animated counter on scroll
   Numbers count up from 0 to target when the
   trust metrics strip scrolls into view.
   Uses easeOutExpo for a satisfying deceleration.
═══════════════════════════════════════════════ */
(function() {
  var counters = document.querySelectorAll('.trust-counter');
  if (!counters.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Easing function: easeOutExpo — fast start, slow finish
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function animateCounter(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';

    var target = parseFloat(el.dataset.target);
    var duration = parseInt(el.dataset.duration, 10) || 1500;
    var decimals = parseInt(el.dataset.decimals, 10) || 0;

    if (reduceMotion) {
      el.textContent = decimals > 0 ? target.toFixed(decimals) : target.toString();
      el.classList.add('counted');
      return;
    }

    var start = performance.now();

    function tick(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var easedProgress = easeOutExpo(progress);
      var current = easedProgress * target;

      if (decimals > 0) {
        el.textContent = current.toFixed(decimals);
      } else {
        el.textContent = Math.round(current).toString();
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        // Final value — ensure exact target
        el.textContent = decimals > 0 ? target.toFixed(decimals) : target.toString();
        el.classList.add('counted');
      }
    }

    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          // Small delay to let the slide-up animation start first
          var metric = entry.target.closest('.trust-metric');
          var delay = 0;
          if (metric) {
            // Get sibling index for stagger
            var siblings = Array.from(metric.parentElement.children);
            var idx = siblings.indexOf(metric);
            delay = idx * 150 + 200; // 200ms base + 150ms per metric
          }
          setTimeout(function() {
            animateCounter(entry.target);
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function(el) { observer.observe(el); });
  } else {
    // Fallback: show final values immediately
    counters.forEach(function(el) {
      var target = parseFloat(el.dataset.target);
      var decimals = parseInt(el.dataset.decimals, 10) || 0;
      el.textContent = decimals > 0 ? target.toFixed(decimals) : target.toString();
    });
  }
})();


/* ═══════════════════════════════════════════════
   FAQ ACCORDION — Smooth height animation
   Intercepts native <details> toggle to add
   smooth open/close height transitions, keyboard
   navigation, and staggered scroll-in indices.
═══════════════════════════════════════════════ */
(function() {
  var faqItems = document.querySelectorAll('.faq-list .faq-item');
  if (!faqItems.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ANIMATION_DURATION = reduceMotion ? 0 : 300; // ms

  // Set stagger index CSS custom property for scroll-in
  faqItems.forEach(function(item, i) {
    item.style.setProperty('--faq-idx', i);
  });

  // Wrap each answer's content for padding management
  faqItems.forEach(function(item) {
    var answer = item.querySelector('.faq-answer');
    if (!answer || answer.classList.contains('faq-answer--managed')) return;

    // Wrap children in .faq-answer-inner
    var inner = document.createElement('div');
    inner.className = 'faq-answer-inner';
    while (answer.firstChild) {
      inner.appendChild(answer.firstChild);
    }
    answer.appendChild(inner);
    answer.classList.add('faq-answer--managed');
  });

  // If reduced motion, skip animation management
  if (reduceMotion) return;

  // ── Smooth toggle handler ──
  faqItems.forEach(function(item) {
    var summary = item.querySelector('summary');
    var answer = item.querySelector('.faq-answer');
    if (!summary || !answer) return;

    var isAnimating = false;

    summary.addEventListener('click', function(e) {
      e.preventDefault();
      if (isAnimating) return;

      if (item.hasAttribute('open')) {
        // ── CLOSING ──
        closeItem(item, answer);
      } else {
        // ── OPENING ──
        openItem(item, answer);
      }
    });

    function openItem(detailsEl, answerEl) {
      isAnimating = true;

      // Trigger arrow bounce animation
      var chevron = detailsEl.querySelector('.faq-chevron');
      if (chevron) {
        chevron.classList.remove('arrow-bounce-close');
        chevron.classList.add('arrow-bounce-open');
      }

      // Set open attribute first so content is rendered
      detailsEl.setAttribute('open', '');

      // Measure the target height
      var targetHeight = answerEl.scrollHeight;

      // Start from 0
      answerEl.style.height = '0px';
      answerEl.style.opacity = '0';
      answerEl.style.overflow = 'hidden';
      answerEl.style.transition = 'height ' + ANIMATION_DURATION + 'ms cubic-bezier(0.34, 1.12, 0.64, 1), opacity ' + Math.round(ANIMATION_DURATION * 0.7) + 'ms ease';

      // Force reflow
      answerEl.offsetHeight;

      // Animate to target
      answerEl.style.height = targetHeight + 'px';
      answerEl.style.opacity = '1';

      // Add reading lamp effect after a slight delay
      var inner = answerEl.querySelector('.faq-answer-inner');
      if (inner) {
        setTimeout(function() {
          inner.classList.add('reading-lit');
        }, 150);
      }

      // Clean up after animation
      setTimeout(function() {
        answerEl.style.height = '';
        answerEl.style.overflow = '';
        answerEl.style.transition = '';
        answerEl.style.opacity = '';
        isAnimating = false;
      }, ANIMATION_DURATION + 50);
    }

    function closeItem(detailsEl, answerEl) {
      isAnimating = true;

      // Trigger arrow bounce animation
      var chevron = detailsEl.querySelector('.faq-chevron');
      if (chevron) {
        chevron.classList.remove('arrow-bounce-open');
        chevron.classList.add('arrow-bounce-close');
      }

      // Set current height explicitly for transition start
      var currentHeight = answerEl.scrollHeight;
      answerEl.style.height = currentHeight + 'px';
      answerEl.style.overflow = 'hidden';
      answerEl.style.transition = 'height ' + ANIMATION_DURATION + 'ms cubic-bezier(0.34, 0, 0.64, 1), opacity ' + Math.round(ANIMATION_DURATION * 0.5) + 'ms ease';

      // Force reflow
      answerEl.offsetHeight;

      // Animate to 0
      answerEl.style.height = '0px';
      answerEl.style.opacity = '0';

      // Remove reading lamp effect
      var inner = answerEl.querySelector('.faq-answer-inner');
      if (inner) {
        inner.classList.remove('reading-lit');
      }

      // Remove open after animation
      setTimeout(function() {
        detailsEl.removeAttribute('open');
        answerEl.style.height = '';
        answerEl.style.overflow = '';
        answerEl.style.transition = '';
        answerEl.style.opacity = '';
        isAnimating = false;
      }, ANIMATION_DURATION + 50);
    }
  });

  // ── Keyboard navigation: arrow keys between FAQ items ──
  var faqList = document.querySelector('.faq-list');
  if (faqList) {
    faqList.addEventListener('keydown', function(e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;

      var focused = document.activeElement;
      if (!focused || !focused.matches('.faq-question')) return;

      e.preventDefault();
      var summaries = Array.from(faqList.querySelectorAll('.faq-question'));
      var idx = summaries.indexOf(focused);
      if (idx === -1) return;

      var nextIdx;
      if (e.key === 'ArrowDown') {
        nextIdx = (idx + 1) % summaries.length;
      } else {
        nextIdx = (idx - 1 + summaries.length) % summaries.length;
      }
      summaries[nextIdx].focus();
    });
  }
})();


/* ═══════════════════════════════════════════════
   CONTACT FORM MICRO-INTERACTIONS
   Valid checkmarks, textarea counter, submit
   button success/error animations.
═══════════════════════════════════════════════ */
(function() {
  var contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  // ── Add valid check icons to form fields ──
  var fieldIds = ['name', 'contact', 'issue'];
  fieldIds.forEach(function(id) {
    var input = contactForm.querySelector('#' + id);
    if (!input) return;
    var group = input.closest('.form-group');
    if (!group || group.querySelector('.form-valid-check')) return;

    var check = document.createElement('span');
    check.className = 'material-symbols-outlined form-valid-check';
    check.setAttribute('aria-hidden', 'true');
    check.textContent = 'check_circle';
    group.appendChild(check);
  });

  // ── Textarea character counter ──
  var textarea = contactForm.querySelector('#issue');
  if (textarea) {
    var group = textarea.closest('.form-group');
    if (group && !group.querySelector('.textarea-counter')) {
      var counter = document.createElement('span');
      counter.className = 'textarea-counter';
      counter.setAttribute('aria-hidden', 'true');
      counter.textContent = '0 chars';
      group.appendChild(counter);

      textarea.addEventListener('input', function() {
        var len = textarea.value.length;
        counter.textContent = len + (len === 1 ? ' char' : ' chars');
        counter.classList.toggle('has-text', len > 0);
      });
    }
  }

  // ── Enhanced submit button states ──
  // Observe the submit button for state changes
  var submitBtn = contactForm.querySelector('button[type="submit"]');
  if (!submitBtn) return;

  // Store original classes for restoration
  var originalBtnClass = submitBtn.className;

  // Watch for the form success/error elements becoming visible
  var formSuccess = document.getElementById('formSuccess');
  var formError = document.getElementById('formError');

  // Confetti burst function for form success
  function createConfetti(buttonEl) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    var container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    
    var rect = buttonEl.getBoundingClientRect();
    var centerX = rect.left + rect.width / 2;
    var centerY = rect.top + rect.height / 2;
    
    var colors = ['#34d399', '#4f8ef7', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
    var particleCount = 25;
    
    for (var i = 0; i < particleCount; i++) {
      var particle = document.createElement('div');
      particle.className = 'confetti';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.left = centerX + 'px';
      particle.style.top = centerY + 'px';
      
      // Random spread direction - fan upward and outward
      var angle = (Math.random() * 140 - 70) * Math.PI / 180; // -70 to +70 degrees from vertical
      var velocity = 80 + Math.random() * 120; // 80-200px
      var tx = Math.sin(angle) * velocity;
      var ty = -Math.cos(angle) * velocity * 0.8; // Upward bias
      
      particle.style.setProperty('--tx', tx + 'px');
      particle.style.setProperty('--ty', ty + 'px');
      particle.style.animationDelay = (Math.random() * 0.15) + 's';
      particle.style.animationDuration = (2 + Math.random() * 1) + 's';
      
      // Vary particle size
      var size = 6 + Math.random() * 6;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      
      container.appendChild(particle);
    }
    
    // Clean up after animation
    setTimeout(function() {
      container.remove();
    }, 4000);
  }
  
  // Mutation observer to detect when success/error appear
  if (formSuccess) {
    var successObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (m.attributeName === 'class' && formSuccess.classList.contains('visible')) {
          // Success! Animate the button with glow
          submitBtn.classList.add('btn-success', 'success-glow');
          submitBtn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">check_circle</span> Sent!';
          submitBtn.disabled = false;
          
          // Trigger confetti burst
          createConfetti(submitBtn);

          // Clean up after animation
          setTimeout(function() {
            submitBtn.classList.remove('btn-success', 'success-glow');
          }, 2000);
        }
      });
    });
    successObserver.observe(formSuccess, { attributes: true });
  }

  if (formError) {
    var errorObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (m.attributeName === 'class' && formError.classList.contains('visible')) {
          // Error! Shake the button
          submitBtn.classList.add('btn-error');
          setTimeout(function() {
            submitBtn.classList.remove('btn-error');
          }, 600);
        }
      });
    });
    errorObserver.observe(formError, { attributes: true });
  }
})();


/* ═══════════════════════════════════════════════
   CARD SIBLING DEPTH FOCUS
   When one card is hovered, siblings recede.
   JS fallback for :has() selector enhancement.
   Applied to both service cards and workshop cards.
═══════════════════════════════════════════════ */
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(hover: hover)').matches) return;

  function setupGridFocus(gridSelector, cardSelector) {
    var grid = document.querySelector(gridSelector);
    if (!grid) return;

    var cards = grid.querySelectorAll(cardSelector);

    cards.forEach(function(card) {
      card.addEventListener('mouseenter', function() {
        grid.classList.add('card-focus-active');
        card.classList.add('card-focused');
      });

      card.addEventListener('mouseleave', function() {
        card.classList.remove('card-focused');
        // Check if any card is still focused
        if (!grid.querySelector('.card-focused')) {
          grid.classList.remove('card-focus-active');
        }
      });
    });
  }

  // Service cards
  setupGridFocus('.cards-grid', '.card');
  // Workshop cards
  setupGridFocus('.workshop-grid', '.workshop-card');
})();


/* ═══════════════════════════════════════════════
   CARD SHINE SWEEP
   Diagonal light sweep across cards on hover.
═══════════════════════════════════════════════ */
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function initShineSweep() {
    // Apply to both service cards and workshop cards
    var cards = document.querySelectorAll('.card, .workshop-card');
    cards.forEach(function(card) {
      if (card.querySelector('.shine-sweep')) return;
      var shine = document.createElement('span');
      shine.className = 'shine-sweep';
      card.appendChild(shine);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShineSweep);
  } else {
    initShineSweep();
  }
})();


/* ═══════════════════════════════════════════════
   FORM FOCUS RING PULSE
   Expanding ring animation on focus entry.
═══════════════════════════════════════════════ */
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var groups = document.querySelectorAll('.form-group');
  if (!groups.length) return;

  groups.forEach(function(group) {
    var input = group.querySelector('input, textarea, select');
    if (!input) return;

    input.addEventListener('focus', function() {
      group.classList.add('focus-pulsing');
      
      // Create secondary ripple wave after a short delay
      setTimeout(function() {
        var ripple = document.createElement('div');
        ripple.className = 'focus-ripple-wave';
        group.appendChild(ripple);
        
        // Clean up after animation
        ripple.addEventListener('animationend', function() {
          ripple.remove();
        });
      }, 150);
      
      // Add breathing class after initial transition completes
      setTimeout(function() {
        input.classList.add('focus-breathing');
      }, 350);
    });
    
    input.addEventListener('blur', function() {
      input.classList.remove('focus-breathing');
    });

    // Remove pulse class after animation completes
    group.addEventListener('animationend', function(e) {
      if (e.animationName === 'focusRingPulse') {
        group.classList.remove('focus-pulsing');
      }
    });
  });
})();


/* ═══════════════════════════════════════════════
   CURSOR SPOTLIGHT — ambient glow follows mouse
   Creates a subtle accent-colored radial glow
   that tracks the cursor across the entire page.
   Context-aware: shifts color based on which section
   the cursor is hovering over.
   Only on pointer devices, respects reduced-motion.
═══════════════════════════════════════════════ */
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var hasPointer = window.matchMedia('(pointer: fine)').matches || window.matchMedia('(hover: hover)').matches;
  if (!hasPointer) return;

  var spotlight = document.querySelector('.cursor-spotlight');
  if (!spotlight) return;

  var rafId = null;
  var targetX = 0;
  var targetY = 0;
  var currentX = 0;
  var currentY = 0;
  var isActive = false;
  var currentContext = '';

  // Section context → spotlight color class mapping
  var sectionContexts = {
    'hero': 'spotlight-hero',      // purple-blue gradient
    'services': 'spotlight-blue',  // primary blue
    'pricing': 'spotlight-green',  // trust green
    'process': 'spotlight-cyan',   // workflow cyan
    'workshop': 'spotlight-purple', // creative purple
    'compare': 'spotlight-orange', // decision orange
    'faq': 'spotlight-blue',       // informational blue
    'contact': 'spotlight-green'   // action green
  };

  // Smooth interpolation for buttery movement
  var LERP = 0.12;

  // Get section from element at cursor position
  function getContextAtPoint(x, y) {
    var el = document.elementFromPoint(x, y);
    if (!el) return '';
    var section = el.closest('section[id]');
    if (!section) return '';
    return section.id;
  }

  // Update context class on spotlight
  function updateContext(sectionId) {
    if (sectionId === currentContext) return;
    // Remove old context class
    if (currentContext && sectionContexts[currentContext]) {
      spotlight.classList.remove(sectionContexts[currentContext]);
    }
    // Add new context class
    currentContext = sectionId;
    if (sectionId && sectionContexts[sectionId]) {
      spotlight.classList.add(sectionContexts[sectionId]);
    }
  }

  document.addEventListener('mousemove', function(e) {
    targetX = e.clientX;
    targetY = e.clientY;

    // Update section context
    var newSection = getContextAtPoint(targetX, targetY);
    updateContext(newSection);

    if (!isActive) {
      isActive = true;
      currentX = targetX;
      currentY = targetY;
      spotlight.classList.add('active');
      tick();
    }
  }, { passive: true });

  document.addEventListener('mouseleave', function() {
    isActive = false;
    spotlight.classList.remove('active');
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  function tick() {
    if (!isActive) return;

    // Lerp toward target for smooth trailing
    currentX += (targetX - currentX) * LERP;
    currentY += (targetY - currentY) * LERP;

    spotlight.style.setProperty('--spotlight-x', currentX.toFixed(1) + 'px');
    spotlight.style.setProperty('--spotlight-y', currentY.toFixed(1) + 'px');

    rafId = requestAnimationFrame(tick);
  }
})();

// ─── SECTION ENTRY PULSE ──────────────────────────────────────────
// Triggers a single expanding ring pulse on section eyebrows when they enter viewport
(function sectionPulseInit() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var eyebrows = document.querySelectorAll('.section-eyebrow');
  if (!eyebrows.length || !('IntersectionObserver' in window)) return;

  var pulseObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !entry.target.classList.contains('pulsed')) {
        entry.target.classList.add('pulsed');
        pulseObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -20% 0px'
  });

  eyebrows.forEach(function(el) {
    pulseObserver.observe(el);
  });
})();

// ─── SECTION TITLE SHIMMER ────────────────────────────────────────
// Light gleam sweeps across section titles once when they enter viewport
(function titleShimmerInit() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var titles = document.querySelectorAll('.section-title');
  if (!titles.length || !('IntersectionObserver' in window)) return;

  var shimmerObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !entry.target.classList.contains('shimmer-active')) {
        entry.target.classList.add('shimmer-active');
        shimmerObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '0px 0px -10% 0px'
  });

  titles.forEach(function(el) {
    shimmerObserver.observe(el);
  });
})();

// ─── GOOGLE STAR PULSE ────────────────────────────────────────────
// Golden glow pulse on the "Leave a Review" star when it enters viewport
(function starPulseInit() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var starIcon = document.querySelector('.gbp-star-icon');
  if (!starIcon || !('IntersectionObserver' in window)) return;

  var starObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !entry.target.classList.contains('star-pulse')) {
        entry.target.classList.add('star-pulse');
        starObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5,
    rootMargin: '0px 0px -10% 0px'
  });

  starObserver.observe(starIcon);
})();

// ─── READING LAMP — PRICING TEXT LUMINANCE ──────────────────────────
// Pricing paragraphs start dimmed and "light up" as user scrolls to them
(function readingLampInit() {
  // Apply to pricing bodies and workshop card descriptions
  var readingElements = document.querySelectorAll('.pricing-body, .workshop-card-desc');
  if (!readingElements.length || !('IntersectionObserver' in window)) return;

  var readingObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('reading-lit');
        readingObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '0px 0px -15% 0px'
  });

  readingElements.forEach(function(el) {
    readingObserver.observe(el);
  });
})();

// ─── WAVE DIVIDER ANIMATION ─────────────────────────────────────────
// Triggers gentle undulating wave animation when wave dividers enter viewport
(function waveAnimationInit() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var waves = document.querySelectorAll('.wave-divider');
  if (!waves.length || !('IntersectionObserver' in window)) return;

  var waveObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('wave-visible');
        // Keep observing so animation starts/stops based on visibility
      } else {
        entry.target.classList.remove('wave-visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '50px 0px 50px 0px'
  });

  waves.forEach(function(wave) {
    waveObserver.observe(wave);
  });
})();

// ─── MAGNETIC SECTION TITLES ────────────────────────────────────────
// Section titles subtly shift toward cursor when nearby
(function magneticTitlesInit() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var hasPointer = window.matchMedia('(pointer: fine)').matches || window.matchMedia('(hover: hover)').matches;
  if (!hasPointer) return;

  var titles = document.querySelectorAll('.section-title');
  if (!titles.length) return;

  // Magnetic effect parameters
  var MAGNETIC_RADIUS = 150; // px — cursor must be within this distance
  var MAX_SHIFT = 8; // px — maximum shift amount
  var LERP = 0.1; // smoothing factor

  titles.forEach(function(title) {
    var currentX = 0;
    var currentY = 0;
    var targetX = 0;
    var targetY = 0;
    var rafId = null;
    var isAnimating = false;

    function tick() {
      currentX += (targetX - currentX) * LERP;
      currentY += (targetY - currentY) * LERP;

      // Apply transform
      title.style.transform = 'translate(' + currentX.toFixed(2) + 'px, ' + currentY.toFixed(2) + 'px)';

      // Continue animation if not settled
      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        rafId = requestAnimationFrame(tick);
      } else {
        isAnimating = false;
        if (targetX === 0 && targetY === 0) {
          title.style.transform = '';
        }
      }
    }

    function startAnimation() {
      if (!isAnimating) {
        isAnimating = true;
        tick();
      }
    }

    title.addEventListener('mousemove', function(e) {
      var rect = title.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      var centerY = rect.top + rect.height / 2;

      var dx = e.clientX - centerX;
      var dy = e.clientY - centerY;
      var distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < MAGNETIC_RADIUS) {
        // Calculate shift amount based on distance (closer = stronger)
        var strength = 1 - (distance / MAGNETIC_RADIUS);
        var shift = strength * MAX_SHIFT;

        // Normalize direction and apply shift
        targetX = (dx / distance) * shift || 0;
        targetY = (dy / distance) * shift || 0;
      } else {
        targetX = 0;
        targetY = 0;
      }

      startAnimation();
    }, { passive: true });

    title.addEventListener('mouseleave', function() {
      targetX = 0;
      targetY = 0;
      startAnimation();
    });
  });
})();

// ─── Viewport-centered section glow ─────────────────────────
// Adds a subtle background glow to the section that contains viewport center
(function viewportCenteredGlow() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var sections = document.querySelectorAll('.section[id]');
  if (!sections.length) return;

  var currentActiveSection = null;
  var ticking = false;

  function findCenteredSection() {
    var viewportCenter = window.innerHeight / 2;
    var containingSection = null;

    // Find the section that contains the viewport center
    for (var i = 0; i < sections.length; i++) {
      var section = sections[i];
      var rect = section.getBoundingClientRect();
      
      // Check if viewport center is within this section
      if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
        containingSection = section;
        break;
      }
    }

    // Fallback: find section closest to viewport center
    if (!containingSection) {
      var closestSection = null;
      var closestDistance = Infinity;

      sections.forEach(function(section) {
        var rect = section.getBoundingClientRect();
        // Distance from viewport center to nearest edge of section
        var distToTop = Math.abs(rect.top - viewportCenter);
        var distToBottom = Math.abs(rect.bottom - viewportCenter);
        var distance = Math.min(distToTop, distToBottom);

        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          if (distance < closestDistance) {
            closestDistance = distance;
            closestSection = section;
          }
        }
      });

      containingSection = closestSection;
    }

    return containingSection;
  }

  function updateActiveSection() {
    var centered = findCenteredSection();

    if (centered !== currentActiveSection) {
      // Remove from previous
      if (currentActiveSection) {
        currentActiveSection.classList.remove('section-centered');
      }

      // Add to new
      if (centered) {
        centered.classList.add('section-centered');
      }

      currentActiveSection = centered;
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateActiveSection);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  
  // Initial check
  updateActiveSection();
})();

// ── Section Dividers ──
// Inject gradient divider lines at the top of sections for visual rhythm
(function sectionDividers() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  
  var sections = document.querySelectorAll('.section');
  var skipIds = ['services']; // First section after ticker doesn't need divider
  
  sections.forEach(function(section) {
    if (skipIds.includes(section.id)) return;
    
    var divider = document.createElement('div');
    divider.className = 'section-divider';
    divider.setAttribute('aria-hidden', 'true');
    section.insertBefore(divider, section.firstChild);
  });
})();

// ── Scroll-Linked Accent Hue Shift ──
// Gradually shifts accent color from blue (215°) to magenta (290°) as user scrolls
// Creates a subtle, evolving color experience
(function accentHueShift() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  
  var BASE_HUE = 215;   // Starting hue (blue)
  var END_HUE = 290;    // Ending hue (magenta)
  var HUE_RANGE = END_HUE - BASE_HUE;
  
  var ticking = false;
  var currentHue = BASE_HUE;
  
  function updateHue() {
    var scrollY = window.scrollY || window.pageYOffset;
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    
    // Calculate scroll progress (0 to 1)
    var progress = Math.min(scrollY / maxScroll, 1);
    
    // Apply easeInOutSine for smooth transitions at extremes
    var easedProgress = -(Math.cos(Math.PI * progress) - 1) / 2;
    
    // Calculate new hue
    var newHue = Math.round(BASE_HUE + (HUE_RANGE * easedProgress));
    
    // Only update if hue changed (avoid unnecessary DOM writes)
    if (newHue !== currentHue) {
      currentHue = newHue;
      document.documentElement.style.setProperty('--accent-hue', newHue);
    }
    
    ticking = false;
  }
  
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateHue);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', onScroll, { passive: true });
  
  // Initial call
  updateHue();
})();

// ── Hero Headline Proximity Glow ──
// Characters near the cursor glow brighter, creating an interactive spotlight
(function heroHeadlineProximityGlow() {
  // Guards
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (!window.matchMedia('(hover: hover)').matches) return;
  
  var headline = document.querySelector('.hero-headline');
  if (!headline) return;
  
  // Find the static text node "Don't replace it." - we need to wrap its characters
  var staticText = headline.childNodes[0]; // "Don't replace it.\n        "
  if (!staticText || staticText.nodeType !== 3) return;
  
  var textContent = staticText.textContent.trim();
  if (!textContent) return;
  
  // Create a span to hold the proximity-glow characters
  var glowContainer = document.createElement('span');
  glowContainer.className = 'headline-proximity-glow';
  
  // Wrap each character in a span
  textContent.split('').forEach(function(char) {
    var span = document.createElement('span');
    span.className = 'proximity-char';
    span.textContent = char === ' ' ? '\u00A0' : char; // Use nbsp for spaces
    span.setAttribute('aria-hidden', 'true');
    glowContainer.appendChild(span);
  });
  
  // Replace the text node with the container
  headline.replaceChild(glowContainer, staticText);
  
  // Keep the original text accessible
  glowContainer.setAttribute('aria-label', textContent);
  
  var chars = glowContainer.querySelectorAll('.proximity-char');
  var charRects = []; // Cache bounding rects for performance
  var ticking = false;
  var heroRect = null;
  
  // Calculate effect radius and intensity
  var EFFECT_RADIUS = 120; // px — characters within this distance get glow
  var MAX_GLOW = 1; // Maximum glow intensity (0-1)
  
  function updateCharRects() {
    charRects = Array.from(chars).map(function(char) {
      var rect = char.getBoundingClientRect();
      return {
        el: char,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2
      };
    });
    heroRect = headline.closest('.hero').getBoundingClientRect();
  }
  
  function updateGlow(e) {
    var mouseX = e.clientX;
    var mouseY = e.clientY;
    
    // Only process if mouse is near the hero
    if (heroRect && (mouseY > heroRect.bottom + 50 || mouseY < heroRect.top - 50)) {
      // Reset all chars when mouse is far away
      chars.forEach(function(char) {
        char.style.removeProperty('--glow-intensity');
      });
      ticking = false;
      return;
    }
    
    charRects.forEach(function(item) {
      var dx = mouseX - item.centerX;
      var dy = mouseY - item.centerY;
      var distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < EFFECT_RADIUS) {
        // Calculate intensity: closer = brighter
        var intensity = 1 - (distance / EFFECT_RADIUS);
        // Apply easing for smoother falloff
        intensity = intensity * intensity; // quadratic easing
        item.el.style.setProperty('--glow-intensity', intensity.toFixed(3));
      } else {
        item.el.style.removeProperty('--glow-intensity');
      }
    });
    
    ticking = false;
  }
  
  function onMouseMove(e) {
    if (!ticking) {
      requestAnimationFrame(function() {
        updateGlow(e);
      });
      ticking = true;
    }
  }
  
  // Update rects on load and resize
  window.addEventListener('load', updateCharRects);
  window.addEventListener('resize', updateCharRects);
  
  // Listen for mouse movement
  document.addEventListener('mousemove', onMouseMove, { passive: true });
  
  // Reset on mouse leave
  document.addEventListener('mouseleave', function() {
    chars.forEach(function(char) {
      char.style.removeProperty('--glow-intensity');
    });
  });
  
  // Initial rect calculation
  setTimeout(updateCharRects, 500);
})();

/* ═══════════════════════════════════════════════
   PARTICLE BURST — CTA button click feedback
   ═══════════════════════════════════════════════ */
(function() {
  var PARTICLE_COLORS = ['#4f8ef7', '#6ba3fa', '#a0c4ff', '#ffffff', 'rgba(255,255,255,0.8)'];
  var PARTICLE_COUNT = 36;
  var PARTICLE_GRAVITY = 0.25;
  var PARTICLE_FRICTION = 0.97;
  var PARTICLE_LIFE = 0.022; // per-frame decay rate

  function createCanvas() {
    var canvas = document.createElement('canvas');
    canvas.style.cssText = [
      'position:fixed',
      'top:0',
      'left:0',
      'width:100%',
      'height:100%',
      'pointer-events:none',
      'z-index:9999',
      'overflow:visible'
    ].join(';');
    document.body.appendChild(canvas);
    return canvas;
  }

  function burst(x, y) {
    var canvas = createCanvas();
    var ctx = canvas.getContext('2d');
    var W = window.innerWidth;
    var H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    var particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      var angle = (Math.PI * 2 * i / PARTICLE_COUNT) + (Math.random() - 0.5) * 0.5;
      var speed = 2.5 + Math.random() * 5;
      var size = 2 + Math.random() * 4;
      var color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (1 + Math.random() * 2), // slight upward bias
        size: size,
        color: color,
        alpha: 1,
        life: 1
      });
    }

    var rafId = null;
    var alive = true;

    function draw() {
      if (!alive) return;
      ctx.clearRect(0, 0, W, H);

      var anyAlive = false;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.vy += PARTICLE_GRAVITY;
        p.vx *= PARTICLE_FRICTION;
        p.vy *= PARTICLE_FRICTION;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= PARTICLE_LIFE;
        p.alpha = Math.max(0, p.life);

        if (p.life > 0) {
          anyAlive = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.size * 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      if (anyAlive) {
        rafId = requestAnimationFrame(draw);
      } else {
        alive = false;
        canvas.remove();
      }
    }

    draw();

    // Safety: remove canvas after 2s even if some particles stuck
    setTimeout(function() {
      alive = false;
      if (canvas.parentNode) canvas.remove();
    }, 2000);
  }

  document.addEventListener('click', function(e) {
    var target = e.target.closest('.btn-primary');
    if (!target) return;
    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    burst(e.clientX, e.clientY);
  }, true);
})();

/* ═══════════════════════════════════════════════
   HERO LIVE STATUS CLOCK
   Shows current Hailey, ID time + open/closed status
   Business hours: Mon-Sat 9am–7pm MT
═══════════════════════════════════════════════ */
(function() {
  var clockEl = document.getElementById('heroClock');
  var dotEl = document.getElementById('heroStatusDot');
  if (!clockEl || !dotEl) return;

  var HAILEY_TZ = 'America/Boise'; // Mountain Time

  function isOpen() {
    var now = new Date();
    // Get time in Mountain Time
    var timeStr = now.toLocaleTimeString('en-US', { timeZone: HAILEY_TZ });
    var [time, period] = timeStr.split(' ');
    var [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    // Get day of week in Mountain Time
    var dayStr = now.toLocaleDateString('en-US', { timeZone: HAILEY_TZ, weekday: 'short' });
    var dayNum = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(dayStr);

    // Open Mon-Sat (0=Sun is closed) 9am–7pm (9–18)
    var isOpen = dayNum >= 1 && dayNum <= 6 && hours >= 9 && hours < 19;
    // Closing soon: within 30 min of close
    var closingSoon = dayNum >= 1 && dayNum <= 6 && hours === 18 && minutes >= 30;
    return { open: isOpen, closingSoon: closingSoon };
  }

  function updateClock() {
    var now = new Date();
    var timeStr = now.toLocaleTimeString('en-US', {
      timeZone: HAILEY_TZ,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    var { open, closingSoon } = isOpen();

    clockEl.textContent = timeStr + ' MT — ' + (open ? 'Open' : 'Closed');

    dotEl.classList.remove('closed', 'closing-soon');
    if (!open) {
      dotEl.classList.add('closed');
    } else if (closingSoon) {
      dotEl.classList.add('closing-soon');
    }
  }

  updateClock();
  // Update every minute
  setInterval(updateClock, 60000);
})();

/* ═══════════════════════════════════════════════
   KEYBOARD SHORTCUTS — ? to show, 1-5 to navigate
═══════════════════════════════════════════════ */
(function() {
  var overlay = document.getElementById('kbdOverlay');
  if (!overlay) return;

  // Section targets for number keys
  var SECTION_KEYS = {
    '1': 'services',
    '2': 'pricing',
    '3': 'process',
    '4': 'compare',
    '5': 'contact'
  };

  document.addEventListener('keydown', function(e) {
    // Don't fire if user is typing in an input/textarea/select
    var tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return;

    var key = e.key;

    if (key === '?') {
      e.preventDefault();
      var isVisible = overlay.classList.contains('visible');
      overlay.classList.toggle('visible', !isVisible);
      overlay.setAttribute('aria-hidden', isVisible ? 'true' : 'false');
      document.body.style.overflow = isVisible ? '' : 'hidden';
      return;
    }

    if (overlay.classList.contains('visible') && key === 'Escape') {
      e.preventDefault();
      overlay.classList.remove('visible');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      return;
    }

    if (SECTION_KEYS[key]) {
      e.preventDefault();
      var target = document.getElementById(SECTION_KEYS[key]);
      if (target) {
        // Close overlay first if open
        if (overlay.classList.contains('visible')) {
          overlay.classList.remove('visible');
          overlay.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        }
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Set focus to the section for accessibility
        setTimeout(function() { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }, 500);
      }
    }
  });

  // Close overlay when clicking the backdrop
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      overlay.classList.remove('visible');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  });
})();

// ─── Section title text scramble on scroll entry ─────
(function() {
  var TEXT_CHARS = '!<>-_\\/\\[]{}—=+*^?#_日照函数式ANDROID＆疆́àiPhone★↯↭⌘✦⚡✗✓◈⬟◉✱⛓╱╲│┤╔╗║╚╝╟╢ℹ️⌥⎋⏎⇧⌃⇪⎙⏏⌨⎗';
  var PREFS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function scrambleEl(el, finalText, charDur, totalDur) {
    var start = Date.now();
    var frame;
    function step() {
      var elapsed = Date.now() - start;
      var progress = Math.min(elapsed / totalDur, 1);
      var easedProgress = 1 - Math.pow(1 - progress, 2);
      var charsSoFar = Math.round(finalText.length * easedProgress);
      var result = '';
      for (var i = 0; i < finalText.length; i++) {
        result += (i < charsSoFar) ? finalText[i] : TEXT_CHARS[Math.floor(Math.random() * TEXT_CHARS.length)];
      }
      el.textContent = result;
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        el.textContent = finalText;
        el.classList.add('scramble-done');
      }
    }
    frame = requestAnimationFrame(step);
    return function() { cancelAnimationFrame(frame); };
  }

  var titleEls = document.querySelectorAll('.section-title[data-text-scramble]');
  if (!titleEls.length) return;

  var titleObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var finalText = el.textContent.replace(/\s*$/, '');
      titleObserver.unobserve(el);
      if (PREFS_REDUCED) { el.classList.add('scramble-done'); return; }
      scrambleEl(el, finalText, 40, 700);
    });
  }, { threshold: 0.15 });


  titleEls.forEach(function(el) { titleObserver.observe(el); });

  // ─── Section context pill — wayfinding breadcrumb on scroll ─
  (function() {
    var pill = document.getElementById('sectionContext');
    if (!pill) return;
    var iconEl = pill.querySelector('.section-context-icon');
    var labelEl = pill.querySelector('.section-context-label');

    var sections = [
      { id: 'services', icon: 'apps',          label: 'Services' },
      { id: 'pricing',  icon: 'sell',           label: 'Pricing' },
      { id: 'process',  icon: 'build',           label: 'How It Works' },
      { id: 'compare',  icon: 'table_compare',   label: 'Vs. Chains' },
      { id: 'workshop', icon: 'hardware',        label: 'Workshop' },
      { id: 'area',     icon: 'map',             label: 'Service Area' },
      { id: 'faq',      icon: 'help',            label: 'FAQ' },
      { id: 'google',   icon: 'star',             label: 'Google Reviews' },
      { id: 'contact',  icon: 'mail',            label: 'Get in Touch' }
    ];

    var HERO_HIDE = 280;  // px from top — hide pill in hero
    var FOOTER_SHOW = 0.88; // scroll fraction — hide when in last 12% of page
    var currentSection = null;

    // Build observer for each section (use eyebrow/title as sentinel)
    var sentinels = [];
    sections.forEach(function(sec) {
      var el = document.getElementById(sec.id);
      if (!el) return;
      // Observe the first meaningful child as the sentinel
      var sentinel = el.querySelector('.section-header, .section-eyebrow, .section-title, h2');
      if (!sentinel) sentinel = el;
      sentinel.dataset.section = sec.id;
      sentinels.push(sentinel);
    });

    function showPill(id) {
      var sec = sections.find(function(s) { return s.id === id; });
      if (!sec || id === currentSection) return;
      currentSection = id;
      pill.dataset.section = id;
      iconEl.textContent = sec.icon;
      labelEl.textContent = sec.label;
      pill.classList.add('visible');
    }

    function hidePill() {
      if (!currentSection) return;
      currentSection = null;
      pill.classList.remove('visible');
    }

    // Watch each section sentinel
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var id = entry.target.dataset.section;
        if (entry.isIntersecting) {
          showPill(id);
        }
        // Only hide if ALL sentinels are out
        var anyVisible = sentinels.some(function(s) {
          var r = s.getBoundingClientRect();
          return r.top < window.innerHeight * 0.75 && r.bottom > 0;
        });
        if (!anyVisible) hidePill();
      });
    }, { threshold: 0.1, rootMargin: '-10% 0px -60% 0px' });

    sentinels.forEach(function(el) { observer.observe(el); });

    // Hide pill near top (hero area) and near bottom (footer)
    function updatePillPosition() {
      var scrollY = window.scrollY;
      var docH = document.documentElement.scrollHeight;
      var scrollFrac = (scrollY + window.innerHeight) / docH;
      if (scrollY < HERO_HIDE || scrollFrac > FOOTER_SHOW) {
        hidePill();
      }
    }

    window.addEventListener('scroll', function() {
      updatePillPosition();
    }, { passive: true });
    updatePillPosition();
  })();
})();

/* ═══════════════════════════════════════════════════════════
   INSTANT REPAIR ESTIMATOR — Interactive diagnostic tool
   ═══════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // Device & symptom data with estimates
  var estimatorData = {
    iphone: {
      name: 'iPhone',
      symptoms: [
        { id: 'cracked-screen', label: 'Cracked screen', icon: 'phone_iphone', time: '30-90 min', cost: '$80-250', urgency: 85, causes: ['Impact damage', 'Drop onto hard surface', 'Pressure on display'] },
        { id: 'dead-battery', label: 'Dead/bad battery', icon: 'battery_std', time: '20-45 min', cost: '$40-100', urgency: 60, causes: ['Battery degradation', 'Extreme temperatures', 'Charging port issue'] },
        { id: 'no-charge', label: 'Won\'t charge', icon: 'charging', time: '30-60 min', cost: '$30-90', urgency: 70, causes: ['Dirty port', 'Bad cable/charger', 'Charging port damaged', 'Battery protector circuit'] },
        { id: 'water-damage', label: 'Water damage', icon: 'water_drop', time: '45-120 min', cost: '$50-150', urgency: 95, causes: ['Liquid exposure', 'Humidity in port', 'Corrosion', 'Short circuit'] },
        { id: 'slow-device', label: 'Slow/frozen', icon: 'slow_motion_video', time: '30-90 min', cost: '$30-80', urgency: 30, causes: ['iOS update issue', 'Storage full', 'Background processes', 'Hardware issue'] },
        { id: 'bad-camera', label: 'Camera not working', icon: 'photo_camera', time: '30-60 min', cost: '$60-120', urgency: 40, causes: ['Software glitch', 'Camera module damage', 'Loose connection'] },
        { id: 'no-speaker', label: 'Speaker/mic issue', icon: 'record_voice_over', time: '30-60 min', cost: '$40-100', urgency: 50, causes: ['Dirt blocking', 'Water damage', 'Speaker module'] },
        { id: 'face-id', label: 'Face ID not working', icon: 'face', time: '45-90 min', cost: '$80-150', urgency: 55, causes: ['Sensor damage', 'Software issue', 'Face ID-module loose'] }
      ]
    },
    android: {
      name: 'Android',
      symptoms: [
        { id: 'cracked-screen', label: 'Cracked screen', icon: 'phone_android', time: '45-120 min', cost: '$70-220', urgency: 85, causes: ['Impact damage', 'Drop', 'Pressure on glass'] },
        { id: 'dead-battery', label: 'Dead/bad battery', icon: 'battery_std', time: '25-50 min', cost: '$40-90', urgency: 60, causes: ['Battery wear', 'Charging issues', 'Temperature damage'] },
        { id: 'no-charge', label: 'Won\'t charge', icon: 'charging', time: '30-60 min', cost: '$30-80', urgency: 70, causes: ['Port lint/damage', 'Cable issue', 'PMIC problem'] },
        { id: 'water-damage', label: 'Water damage', icon: 'water_drop', time: '60-120 min', cost: '$50-130', urgency: 95, causes: ['Liquid exposure', 'Corrosion', 'Short'] },
        { id: 'slow-device', label: 'Slow or frozen', icon: 'memory', time: '30-90 min', cost: '$30-70', urgency: 25, causes: ['Storage full', 'Malware', 'Update problem', 'RAM issues'] },
        { id: 'bad-camera', label: 'Camera not working', icon: 'photo_camera', time: '30-60 min', cost: '$50-110', urgency: 40, causes: ['Module damage', 'Software', 'Connection'] },
        { id: 'no-speaker', label: 'Speaker/mic issues', icon: 'volume_up', time: '30-45 min', cost: '$35-80', urgency: 50, causes: ['Debris', 'Water', 'Speaker failure'] },
        { id: 'screen-flicker', label: 'Screen flickering', icon: 'tune', time: '45-90 min', cost: '$60-150', urgency: 65, causes: ['Loose connector', 'Display driver', 'Software', 'LCD damage'] }
      ]
    },
    laptop: {
      name: 'Laptop',
      symptoms: [
        { id: 'cracked-screen', label: 'Cracked/broken screen', icon: 'laptop', time: '45-90 min', cost: '$80-250', urgency: 90, causes: ['Drop impact', 'Pressure', 'Closed on object'] },
        { id: 'dead-battery', label: 'Battery not holding charge', icon: 'battery_charging_full', time: '30-60 min', cost: '$60-150', urgency: 55, causes: ['Battery wear', 'Charging circuit', 'BIOS issue'] },
        { id: 'no-power', label: 'Won\'t turn on', icon: 'power_off', time: '45-120 min', cost: '$40-120', urgency: 75, causes: ['Dead charger', 'DC jack', 'Motherboard', 'BIOS/Intel ME'] },
        { id: 'slow-device', label: 'Very slow', icon: 'speed', time: '60-180 min', cost: '$30-100', urgency: 20, causes: ['Virus/malware', 'Storage full', 'Too many programs', 'HDD failing'] },
        { id: 'overheating', label: 'Overheating/fan loud', icon: 'thermostat', time: '45-90 min', cost: '$40-90', urgency: 50, causes: ['Dust buildup', 'Thermal paste', 'Fan failure', 'Blocked vents'] },
        { id: 'keyboard-bad', label: 'Keyboard not working', icon: 'keyboard', time: '45-120 min', cost: '$50-150', urgency: 60, causes: ['Liquid spill', 'Key damage', 'Ribbon cable', 'Keyboard controller'] },
        { id: 'touchpad-bad', label: 'Touchpad unresponsive', icon: 'touch_app', time: '30-60 min', cost: '$40-100', urgency: 45, causes: ['Driver', 'Touchpad module', 'Liquid damage'] },
        { id: 'no-wifi', label: 'WiFi not working', icon: 'wifi', time: '30-60 min', cost: '$30-70', urgency: 35, causes: ['Driver', 'WiFi card', 'Antenna', 'BIOS'] },
        { id: 'noise', label: 'Strange noises', icon: 'speaker', time: '30-90 min', cost: '$40-100', urgency: 45, causes: ['Fan bearing', 'HDD failure', 'Loose part', 'Speaker blown'] },
        { id: 'virus', label: 'Virus/malware', icon: 'security', time: '60-180 min', cost: '$50-120', urgency: 80, causes: ['Ransomware', 'Keylogger', 'Adware', 'Trojan'] }
      ]
    },
    tablet: {
      name: 'Tablet/iPad',
      symptoms: [
        { id: 'cracked-screen', label: 'Cracked screen', icon: 'tablet', time: '45-120 min', cost: '$80-220', urgency: 85, causes: ['Drop', 'Impact', 'Bend pressure'] },
        { id: 'dead-battery', label: 'Battery issues', icon: 'battery_full', time: '30-60 min', cost: '$50-110', urgency: 60, causes: ['Age', 'Charging issues', 'Temperature'] },
        { id: 'no-charge', label: 'Won\'t charge', icon: 'cable', time: '30-60 min', cost: '$35-80', urgency: 70, causes: ['Port damage', 'Cable', 'Charge IC'] },
        { id: 'slow-device', label: 'Slow performance', icon: 'hourglass_empty', time: '40-90 min', cost: '$30-70', urgency: 25, causes: ['Storage full', 'iOS/update', 'Background', 'Hardware'] },
        { id: 'water-damage', label: 'Water damage', icon: 'water', time: '60-120 min', cost: '$60-140', urgency: 95, causes: ['Liquid', 'Corrosion', 'Short'] },
        { id: 'home-button', label: 'Home button stuck', icon: 'circle', time: '20-40 min', cost: '$30-60', urgency: 30, causes: ['Dirt', 'Wear', 'Cable'] }
      ]
    },
    console: {
      name: 'Game Console',
      symptoms: [
        { id: 'drift', label: 'Controller drift', icon: 'sports_esports', time: '30-60 min', cost: '$40-80', urgency: 65, causes: ['Joy-Con wear', 'Potentiometer dust', 'Analog drift'] },
        { id: 'no-hdmi', label: 'No HDMI output', icon: 'hdmi', time: '60-120 min', cost: '$80-180', urgency: 90, causes: ['HDMI port damage', 'GPU/console chip', 'Cable'] },
        { id: 'overheat', label: 'Overheating', icon: 'whatshot', time: '45-90 min', cost: '$50-120', urgency: 75, causes: ['Dust', 'Thermal paste', 'Fan', 'Block vents'] },
        { id: 'disc-error', label: 'Disc not reading', icon: 'album', time: '30-60 min', cost: '$40-90', urgency: 60, causes: ['Laser drift', 'Dirty lens', 'Drive motor'] },
        { id: 'no-power', label: 'Won\'t power on', icon: 'power', time: '45-90 min', cost: '$50-130', urgency: 80, causes: ['PSU', 'Power button', 'Mainboard'] },
        { id: 'freeze', label: 'Freezing/crashing', icon: 'block', time: '45-120 min', cost: '$50-110', urgency: 55, causes: ['Software', 'Overheat', 'Hardware', 'Firmware'] },
        { id: 'controller', label: 'Controller not pairing', icon: 'bluetooth', time: '20-40 min', cost: '$20-50', urgency: 40, causes: ['Bluetooth', 'Dead batteries', 'Controller chip'] }
      ]
    }
  };

  // ── DOM Elements ──
  var widget = document.getElementById('estimatorWidget');
  if (!widget) return;

  var step1 = document.getElementById('estimatorStep1');
  var step2 = document.getElementById('estimatorStep2');
  var step3 = document.getElementById('estimatorStep3');
  var deviceLabel = document.getElementById('estimatorDeviceLabel');
  var symptomContainer = document.getElementById('estimatorSymptoms');
  var nextBtn2 = document.getElementById('estimatorNext2');
  var gaugeFill = document.getElementById('gaugeFill');
  var gaugeNeedle = document.getElementById('gaugeNeedle');
  var gaugeLabel = document.getElementById('gaugeLabel');
  var gaugeSubLabel = document.getElementById('gaugeSubLabel');
  var estTime = document.getElementById('estTime');
  var estCost = document.getElementById('estCost');
  var estUrgency = document.getElementById('estUrgency');
  var breakdownList = document.getElementById('breakdownList');
  var stepIndicators = document.querySelectorAll('.estimator-step-indicator');
  var stepLines = document.querySelectorAll('.estimator-step-line');

  // ── State ──
  var selectedDevice = null;
  var selectedSymptoms = [];

  // ── Helper: Update step indicators ──
  function updateStepIndicator(stepNum) {
    stepIndicators.forEach(function(ind, i) {
      var step = i + 1;
      ind.classList.remove('active', 'completed');
      if (step < stepNum) {
        ind.classList.add('completed');
      } else if (step === stepNum) {
        ind.classList.add('active');
      }
    });
    stepLines.forEach(function(line, i) {
      line.classList.toggle('filled', i < stepNum - 1);
    });
  }

  // ── Step 1: Device Selection ──
  var deviceBtns = step1.querySelectorAll('.estimator-device-btn');
  deviceBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var device = this.dataset.device;
      if (selectedDevice === device) return;
      selectedDevice = device;
      // Update UI
      deviceBtns.forEach(function(b) { b.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');
      // Auto-advance after brief delay
      setTimeout(function() {
        goToStep2();
      }, 350);
    });
  });

  // Skip device selection
  document.getElementById('skipDevice').addEventListener('click', function(e) {
    e.preventDefault();
    // Use default/any device data
    selectedDevice = null;
    goToStep2();
  });

  // ── Step 2: Symptom Selection ──
  function goToStep2() {
    step1.classList.remove('estimator-panel--active');
    step2.classList.add('estimator-panel--active');
    updateStepIndicator(2);
    if (selectedDevice && estimatorData[selectedDevice]) {
      deviceLabel.textContent = 'for your ' + estimatorData[selectedDevice].name;
      renderSymptoms(selectedDevice);
    } else {
      deviceLabel.textContent = '';
      renderSymptoms('iphone'); // Default fallback
      selectedDevice = 'iphone';
    }
  }

  function renderSymptoms(deviceKey) {
    var data = estimatorData[deviceKey] || estimatorData.iphone;
    symptomContainer.innerHTML = '';
    data.symptoms.forEach(function(sym) {
      var chip = document.createElement('button');
      chip.className = 'estimator-symptom-chip';
      chip.setAttribute('type', 'button');
      chip.setAttribute('aria-pressed', 'false');
      chip.dataset.symptomId = sym.id;
      chip.innerHTML = '<span class="chip-icon material-symbols-outlined">' + sym.icon + '</span>' + sym.label;
      chip.addEventListener('click', function() {
        var isPressed = chip.getAttribute('aria-pressed') === 'true';
        chip.setAttribute('aria-pressed', !isPressed);
        updateSymptomSelection();
      });
      symptomContainer.appendChild(chip);
    });
    selectedSymptoms = [];
    updateNextButton();
  }

  function updateSymptomSelection() {
    var chips = symptomContainer.querySelectorAll('.estimator-symptom-chip[aria-pressed="true"]');
    selectedSymptoms = Array.from(chips).map(function(c) { return c.dataset.symptomId; });
    updateNextButton();
  }

  function updateNextButton() {
    nextBtn2.disabled = selectedSymptoms.length === 0;
  }

  // Back from step 2
  document.getElementById('estimatorBack1').addEventListener('click', function() {
    step2.classList.remove('estimator-panel--active');
    step1.classList.add('estimator-panel--active');
    updateStepIndicator(1);
    selectedDevice = null;
    selectedSymptoms = [];
    // Reset device selection UI
    deviceBtns.forEach(function(b) { b.setAttribute('aria-pressed', 'false'); });
  });

  // Proceed to results
  nextBtn2.addEventListener('click', function() {
    if (selectedSymptoms.length === 0) return;
    goToStep3();
  });

  // ── Step 3: Calculate & Show Results ──
  function goToStep3() {
    step2.classList.remove('estimator-panel--active');
    step3.classList.add('estimator-panel--active');
    updateStepIndicator(3);
    calculateResults();
  }

  function calculateResults() {
    var data = estimatorData[selectedDevice] || estimatorData.iphone;
    // Collect all selected symptoms data
    var selectedSyms = data.symptoms.filter(function(s) {
      return selectedSymptoms.indexOf(s.id) !== -1;
    });
    if (selectedSyms.length === 0) {
      // Fallback
      selectedSyms = [data.symptoms[0]];
    }

    // Aggregate: average urgency, max time, combined cost range
    var avgUrgency = selectedSyms.reduce(function(sum, s) { return sum + s.urgency; }, 0) / selectedSyms.length;
    var allCauses = [];
    selectedSyms.forEach(function(s) {
      allCauses = allCauses.concat(s.causes);
    });
    // Dedupe causes
    allCauses = allCauses.filter(function(v, i, a) { return a.indexOf(v) === i; });

    // Determine urgency category
    var urgencyCat = 'low';
    var urgencyLabel = 'Low — Can wait';
    if (avgUrgency >= 70) {
      urgencyCat = 'high';
      urgencyLabel = 'High — Fix soon!';
    } else if (avgUrgency >= 45) {
      urgencyCat = 'mid';
      urgencyLabel = 'Medium — Within a week';
    }

    // Cost range: take min and max from selected
    var costs = selectedSyms.map(function(s) {
      var m = s.cost.match(/\$(\d+)/);
      return m ? parseInt(m[1]) : 0;
    });
    var minCost = Math.min.apply(null, costs);
    var maxCost = Math.max.apply(null, costs);

    // Time: get the longest from selected
    var maxTime = selectedSyms.reduce(function(best, s) {
      var curr = parseInt(s.time.split('-')[0] || 0);
      var bestCurr = parseInt(best.split('-')[0] || 0);
      return curr > bestCurr ? s.time : best;
    }, '0 min');

    // ── Update UI ──
    // Gauge animation
    var dashOffset = 251 * (1 - avgUrgency / 100);
    gaugeFill.style.strokeDashoffset = dashOffset;
    gaugeFill.className = 'gauge-fill urgency-' + urgencyCat;

    // Needle: -90deg (low) to +90deg (high)
    var needleRot = -90 + (avgUrgency / 100 * 180);
    gaugeNeedle.style.transform = 'rotate(' + needleRot + 'deg)';

    // Labels
    gaugeLabel.textContent = Math.round(avgUrgency) + '/100';
    gaugeSubLabel.textContent = urgencyLabel + ' urgency';

    estTime.textContent = maxTime;
    estCost.textContent = '$' + minCost + '-' + maxCost;
    estUrgency.textContent = urgencyLabel;

    // Causes list
    breakdownList.innerHTML = '';
    allCauses.slice(0, 4).forEach(function(cause) {
      var li = document.createElement('li');
      li.innerHTML = '<span class="material-symbols-outlined">help_outline</span>' + cause;
      breakdownList.appendChild(li);
    });
  }

  // Back from step 3
  document.getElementById('estimatorBack2').addEventListener('click', function() {
    step3.classList.remove('estimator-panel--active');
    step2.classList.add('estimator-panel--active');
    updateStepIndicator(2);
  });

  // Reset
  document.getElementById('estimatorReset').addEventListener('click', function() {
    // Reset everything to step 1
    step3.classList.remove('estimator-panel--active');
    step2.classList.remove('estimator-panel--active');
    step1.classList.add('estimator-panel--active');
    updateStepIndicator(1);
    selectedDevice = null;
    selectedSymptoms = [];
    deviceBtns.forEach(function(b) { b.setAttribute('aria-pressed', 'false'); });
    symptomContainer.innerHTML = '';
    gaugeFill.style.strokeDashoffset = 251;
    gaugeNeedle.style.transform = 'rotate(-90deg)';
    gaugeLabel.textContent = '—';
    gaugeSubLabel.textContent = 'Select device & issue';
    estTime.textContent = '—';
    estCost.textContent = '—';
    estUrgency.textContent = '—';
    breakdownList.innerHTML = '';
  });

  // Initialize
  updateStepIndicator(1);

})();

/* ═══════════════════════════════════════════════════════════
   LIVE REPAIR JOURNEY - Scroll-triggered animated demo
   ═══════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  // Wait for DOM
  document.addEventListener('DOMContentLoaded', initLiveRepair);
  document.addEventListener('opensclaw:resumed', initLiveRepair);

  function initLiveRepair() {
    const stage = document.getElementById('liveRepairStage');
    if (!stage || stage.dataset.initialized) return;
    stage.dataset.initialized = 'true';

    // Elements
    const device = document.getElementById('lrDevice');
    const crack = document.getElementById('lrScreenCrack');
    const repaired = document.getElementById('lrScreenRepaired');
    const timelineProgress = document.getElementById('lrTimelineProgress');
    const statusLog = document.getElementById('lrStatusLog');
    const totalTime = document.getElementById('lrTotalTime');

    // Steps
    const steps = [
      document.getElementById('lrStep1'),
      document.getElementById('lrStep2'),
      document.getElementById('lrStep3'),
      document.getElementById('lrStep4'),
      document.getElementById('lrStep5')
    ];

    // Status messages for each step
    const statusMessages = [
      ['Text received — "iPhone 14 screen cracked"'],
      ['Diagnosis: cracked LCD, needs new screen assembly'],
      ['Quote approved: $189 — starting repair now'],
      ['Screen removed, installing new display...', 'Display connected, testing...'],
      ['All tests passed! Device ready for pickup.']
    ];

    let currentStep = -1;
    let animationRunning = false;

    // Intersection observer for scroll-triggered animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !animationRunning) {
            startRepairAnimation();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(stage);

    // Magnetic button effect
    const magneticBtn = document.getElementById('lrMagneticBtn');
    if (magneticBtn) {
      magneticBtn.addEventListener('mousemove', handleMagneticMove);
      magneticBtn.addEventListener('mouseleave', handleMagneticReset);
      magneticBtn.addEventListener('click', handleCtaClick);
    }

    function handleMagneticMove(e) {
      const rect = magneticBtn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const moveX = x * 0.3;
      const moveY = y * 0.3;
      
      magneticBtn.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }

    function handleMagneticReset() {
      magneticBtn.style.transform = '';
    }

    function handleCtaClick() {
      const phoneLink = document.querySelector('a[href^="sms:"]');
      if (phoneLink) {
        phoneLink.click();
      } else {
        window.location.href = 'sms:+12083666111';
      }
    }

    // Repair animation sequence
    function startRepairAnimation() {
      if (animationRunning) return;
      animationRunning = true;

      // Add active class to device
      device.classList.add('repairing');

      // Step timing (in ms)
      const stepDurations = [800, 1500, 1200, 2000, 1500];
      
      let elapsed = 0;

      function runStep(stepIndex) {
        if (stepIndex >= steps.length) {
          // Animation complete
          finishAnimation();
          return;
        }

        const step = steps[stepIndex];
        currentStep = stepIndex;

        // Activate step
        steps.forEach((s, i) => {
          s.classList.remove('active', 'done');
          if (i < stepIndex) s.classList.add('done');
        });
        step.classList.add('active');

        // Update timeline progress
        const progressPercent = ((stepIndex + 1) / steps.length) * 100;
        timelineProgress.style.width = progressPercent + '%';

        // Add status messages
        addStatusMessages(statusMessages[stepIndex]);

        // Stage-specific effects
        if (stepIndex === 3) {
          // In repair - crack fades out
          crack.classList.add('repaired');
          repaired.classList.add('show');
          device.classList.remove('repairing');
          device.classList.add('done');
        }

        // Schedule next step
        setTimeout(() => {
          runStep(stepIndex + 1);
        }, stepDurations[stepIndex]);
      }

      // Start first step after brief delay
      setTimeout(() => runStep(0), 500);
    }

    function addStatusMessages(messages) {
      messages.forEach((msg, index) => {
        setTimeout(() => {
          const item = document.createElement('div');
          item.className = 'lr-status-item';
          item.textContent = msg;
          statusLog.appendChild(item);
          
          // Auto-scroll to latest
          statusLog.scrollTop = statusLog.scrollHeight;
        }, index * 400);
      });
    }

    function finishAnimation() {
      // Final state
      steps.forEach(s => {
        s.classList.remove('active');
        s.classList.add('done');
      });
      
      timelineProgress.style.width = '100%';
      
      // Animate counter
      let count = 0;
      const target = 58;
      const counterInterval = setInterval(() => {
        count++;
        totalTime.textContent = count;
        if (count >= target) clearInterval(counterInterval);
      }, Math.floor(2000 / target));
    }
  }
})();

/* ═══════════════════════════════════════════════════════════
   LIVE REPAIR JOURNEY - Scroll-triggered animated demo
   ═══════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', initLiveRepair);
  document.addEventListener('opensclaw:resumed', initLiveRepair);

  function initLiveRepair() {
    const stage = document.getElementById('liveRepairStage');
    if (!stage || stage.dataset.initialized) return;
    stage.dataset.initialized = 'true';

    // Elements
    const device = document.getElementById('lrDevice');
    const crack = document.getElementById('lrScreenCrack');
    const repaired = document.getElementById('lrScreenRepaired');
    const timelineProgress = document.getElementById('lrTimelineProgress');
    const statusLog = document.getElementById('lrStatusLog');
    const totalTime = document.getElementById('lrTotalTime');

    // Steps
    const steps = [
      document.getElementById('lrStep1'),
      document.getElementById('lrStep2'),
      document.getElementById('lrStep3'),
      document.getElementById('lrStep4'),
      document.getElementById('lrStep5')
    ];

    // Status messages for each step
    const statusMessages = [
      ['Text received — "iPhone 14 screen cracked"'],
      ['Diagnosis: cracked LCD, needs new screen assembly'],
      ['Quote approved: $189 — starting repair now'],
      ['Screen removed, installing new display...', 'Display connected, testing...'],
      ['All tests passed! Device ready for pickup.']
    ];

    let currentStep = -1;
    let animationRunning = false;
    let counterInterval = null;

    // Intersection observer for scroll-triggered animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !animationRunning) {
            startRepairAnimation();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(stage);

    // Restart animation function
    function restartAnimation() {
      // Reset state
      animationRunning = false;
      currentStep = -1;
      
      // Reset visuals
      steps.forEach(s => s.classList.remove('active', 'done'));
      timelineProgress.style.width = '0%';
      statusLog.innerHTML = '';
      crack.classList.remove('repaired');
      repaired.classList.remove('show');
      device.classList.remove('done', 'repairing');
      totalTime.textContent = '58';
      
      if (counterInterval) clearInterval(counterInterval);
      
      // Restart
      setTimeout(startRepairAnimation, 300);
    }

    // Magnetic button effect
    const magneticBtn = document.getElementById('lrMagneticBtn');
    if (magneticBtn) {
      magneticBtn.addEventListener('mousemove', handleMagneticMove);
      magneticBtn.addEventListener('mouseleave', handleMagneticReset);
      magneticBtn.addEventListener('click', handleCtaClick);
    }

    // Replay button
    const replayBtn = document.getElementById('lrReplayBtn');
    if (replayBtn) {
      replayBtn.addEventListener('click', restartAnimation);
    }

    function handleMagneticMove(e) {
      const rect = magneticBtn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const moveX = x * 0.3;
      const moveY = y * 0.3;
      
      magneticBtn.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }

    function handleMagneticReset() {
      magneticBtn.style.transform = '';
    }

    function handleCtaClick() {
      const phoneLink = document.querySelector('a[href^="sms:"]');
      if (phoneLink) {
        phoneLink.click();
      } else {
        window.location.href = 'sms:+12083666111';
      }
    }

    // Repair animation sequence
    function startRepairAnimation() {
      if (animationRunning) return;
      animationRunning = true;

      // Add active class to device
      device.classList.add('repairing');

      // Step timing (in ms)
      const stepDurations = [800, 1500, 1200, 2000, 1500];
      
      function runStep(stepIndex) {
        if (stepIndex >= steps.length) {
          finishAnimation();
          return;
        }

        const step = steps[stepIndex];
        currentStep = stepIndex;

        // Activate step
        steps.forEach((s, i) => {
          s.classList.remove('active', 'done');
          if (i < stepIndex) s.classList.add('done');
        });
        step.classList.add('active');

        // Update timeline progress
        const progressPercent = ((stepIndex + 1) / steps.length) * 100;
        timelineProgress.style.width = progressPercent + '%';

        // Add status messages
        addStatusMessages(statusMessages[stepIndex]);

        // Stage-specific effects
        if (stepIndex === 3) {
          crack.classList.add('repaired');
          repaired.classList.add('show');
          device.classList.remove('repairing');
          device.classList.add('done');
        }

        // Schedule next step
        setTimeout(() => {
          runStep(stepIndex + 1);
        }, stepDurations[stepIndex]);
      }

      // Start first step after brief delay
      setTimeout(() => runStep(0), 500);
    }

    function addStatusMessages(messages) {
      messages.forEach((msg, index) => {
        setTimeout(() => {
          const item = document.createElement('div');
          item.className = 'lr-status-item';
          item.textContent = msg;
          statusLog.appendChild(item);
          statusLog.scrollTop = statusLog.scrollHeight;
        }, index * 400);
      });
    }

    function finishAnimation() {
      steps.forEach(s => {
        s.classList.remove('active');
        s.classList.add('done');
      });
      
      timelineProgress.style.width = '100%';
      
      // Animate counter
      let count = 0;
      const target = 58;
      counterInterval = setInterval(() => {
        count++;
        totalTime.textContent = count;
        if (count >= target) clearInterval(counterInterval);
      }, Math.floor(2000 / target));
    }
  }
})();

/* ═══════════════════════════════════════════════════════════
   LIVE REPAIR - Scroll-linked border gradient effect
   ═══════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', initLrScrollEffects);
  document.addEventListener('opensclaw:resumed', initLrScrollEffects);

  function initLrScrollEffects() {
    const stage = document.getElementById('liveRepairStage');
    if (!stage) return;

    let borderAngle = 0;
    let animating = false;

    // Update border angle based on scroll position within section
    function updateBorderAngle() {
      if (!stage.dataset.animated) return;
      
      const rect = stage.getBoundingClientRect();
      const sectionHeight = rect.height;
      const viewportHeight = window.innerHeight;
      
      // How far through the section (0 to 1)
      let progress = 1 - (rect.bottom / (sectionHeight + viewportHeight));
      progress = Math.max(0, Math.min(1, progress));
      
      // Update CSS custom property
      stage.style.setProperty('--border-angle', `${progress * 360}deg`);
    }

    const scrollHandler = () => {
      if (!animating) {
        animating = true;
        requestAnimationFrame(() => {
          updateBorderAngle();
          animating = false;
        });
      }
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });

    // Also add animated class when section comes into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            stage.dataset.animated = 'true';
            stage.classList.add('animated');
          } else {
            stage.dataset.animated = '';
            stage.classList.remove('animated');
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(stage);
  }
})();

/* ═══════════════════════════════════════════════════════════
   LIVE REPAIR JOURNEY - Scroll-triggered animated demo
   ═══════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', initLiveRepair);
  document.addEventListener('opensclaw:resumed', initLiveRepair);

  function initLiveRepair() {
    const stage = document.getElementById('liveRepairStage');
    if (!stage || stage.dataset.initialized) return;
    stage.dataset.initialized = 'true';

    const device = document.getElementById('lrDevice');
    const crack = document.getElementById('lrScreenCrack');
    const repaired = document.getElementById('lrScreenRepaired');
    const timelineProgress = document.getElementById('lrTimelineProgress');
    const statusLog = document.getElementById('lrStatusLog');
    const totalTime = document.getElementById('lrTotalTime');

    const steps = [
      document.getElementById('lrStep1'),
      document.getElementById('lrStep2'),
      document.getElementById('lrStep3'),
      document.getElementById('lrStep4'),
      document.getElementById('lrStep5')
    ];

    const statusMessages = [
      ['Text received — "iPhone 14 screen cracked"'],
      ['Diagnosis: cracked LCD, needs new screen assembly'],
      ['Quote approved: $189 — starting repair now'],
      ['Screen removed, installing new display...', 'Display connected, testing...'],
      ['All tests passed! Device ready for pickup.']
    ];

    let currentStep = -1;
    let animationRunning = false;
    let counterInterval = null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !animationRunning) {
            startRepairAnimation();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(stage);

    function restartAnimation() {
      animationRunning = false;
      currentStep = -1;
      steps.forEach(s => s.classList.remove('active', 'done'));
      timelineProgress.style.width = '0%';
      statusLog.innerHTML = '';
      crack.classList.remove('repaired');
      repaired.classList.remove('show');
      device.classList.remove('done', 'repairing', 'celebrating');
      totalTime.textContent = '58';
      if (counterInterval) clearInterval(counterInterval);
      setTimeout(startRepairAnimation, 300);
    }

    const magneticBtn = document.getElementById('lrMagneticBtn');
    if (magneticBtn) {
      magneticBtn.addEventListener('mousemove', handleMagneticMove);
      magneticBtn.addEventListener('mouseleave', handleMagneticReset);
      magneticBtn.addEventListener('click', handleCtaClick);
    }

    const replayBtn = document.getElementById('lrReplayBtn');
    if (replayBtn) {
      replayBtn.addEventListener('click', restartAnimation);
    }

    function handleMagneticMove(e) {
      const rect = magneticBtn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      magneticBtn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    }

    function handleMagneticReset() {
      magneticBtn.style.transform = '';
    }

    function handleCtaClick() {
      const phoneLink = document.querySelector('a[href^="sms:"]');
      if (phoneLink) phoneLink.click();
      else window.location.href = 'sms:+12083666111';
    }

    function startRepairAnimation() {
      if (animationRunning) return;
      animationRunning = true;
      device.classList.add('repairing');

      const stepDurations = [800, 1500, 1200, 2000, 1500];

      function runStep(stepIndex) {
        if (stepIndex >= steps.length) {
          finishAnimation();
          return;
        }

        const step = steps[stepIndex];
        currentStep = stepIndex;

        steps.forEach((s, i) => {
          s.classList.remove('active', 'done');
          if (i < stepIndex) s.classList.add('done');
        });
        step.classList.add('active');

        timelineProgress.style.width = ((stepIndex + 1) / steps.length) * 100 + '%';
        addStatusMessages(statusMessages[stepIndex]);

        if (stepIndex === 3) {
          crack.classList.add('repaired');
          repaired.classList.add('show');
          device.classList.remove('repairing');
          device.classList.add('done');
        }

        setTimeout(() => runStep(stepIndex + 1), stepDurations[stepIndex]);
      }

      setTimeout(() => runStep(0), 500);
    }

    function addStatusMessages(messages) {
      messages.forEach((msg, index) => {
        setTimeout(() => {
          const item = document.createElement('div');
          item.className = 'lr-status-item';
          item.textContent = msg;
          statusLog.appendChild(item);
          statusLog.scrollTop = statusLog.scrollHeight;
        }, index * 400);
      });
    }

    function finishAnimation() {
      steps.forEach(s => {
        s.classList.remove('active');
        s.classList.add('done');
      });
      timelineProgress.style.width = '100%';
      
      // Celebration animation
      setTimeout(() => device.classList.add('celebrating'), 200);

      let count = 0;
      const target = 58;
      counterInterval = setInterval(() => {
        count++;
        totalTime.textContent = count;
        if (count >= target) clearInterval(counterInterval);
      }, Math.floor(2000 / target));
    }
  }
})();

/* ═══════════════════════════════════════════════════════════
   LIVE REPAIR - Scroll-linked border gradient effect
   ═══════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', initLrScrollEffects);
  document.addEventListener('opensclaw:resumed', initLrScrollEffects);

  function initLrScrollEffects() {
    const stage = document.getElementById('liveRepairStage');
    if (!stage) return;

    let animating = false;

    function updateBorderAngle() {
      if (!stage.dataset.animated) return;
      const rect = stage.getBoundingClientRect();
      const sectionHeight = rect.height;
      const viewportHeight = window.innerHeight;
      let progress = 1 - (rect.bottom / (sectionHeight + viewportHeight));
      progress = Math.max(0, Math.min(1, progress));
      stage.style.setProperty('--border-angle', progress * 360 + 'deg');
    }

    const scrollHandler = () => {
      if (!animating) {
        animating = true;
        requestAnimationFrame(() => {
          updateBorderAngle();
          animating = false;
        });
      }
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            stage.dataset.animated = 'true';
            stage.classList.add('animated');
          } else {
            stage.dataset.animated = '';
            stage.classList.remove('animated');
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(stage);
  }
})();

/* ═══════════════════════════════════════════
   BEFORE YOU PANIC — Interactive Symptom Checker
   ═══════════════════════════════════════════ */
(() => {
  'use strict';

  // Panic data - honest, helpful guidance
  const panicData = {
    'cracked-screen': {
      title: 'Cracked Screen',
      icon: 'smartphone_screen_shot',
      urgency: { label: 'Common', class: 'panic-urgency--high' },
      verdictEmoji: '📱',
      verdictText: 'Usually saveable. Glass-only cracks keep working, but get worse fast.',
      what: "Either just the glass (cheaper fix) or the full display assembly. I'll diagnose and give you a firm price before working.",
      now: [
        'Stop touching the crack — broken glass can cut or damage internal components',
        'Get a temporary screen protector to keep it from spreading',
        'Backup your data NOW just in case'
      ],
      dont: [
        'Don\'t use tape on the screen (leaves residue)',
        'Don\'t ignore it — damage spreads and water gets in',
        'Don\'t assume you need a whole new phone'
      ],
      fix: 'Screen replacement on almost any device. Most iPhones and Galaxies done same day. I use quality parts that look and work like OEM.'
    },
    'water-damage': {
      title: 'Water Damage',
      icon: 'water_damage',
      urgency: { label: 'Act Fast', class: 'panic-urgency--critical' },
      verdictEmoji: '💧',
      verdictText: 'Not dead yet. Speed matters — don\'t wait.',
      what: 'Water gets inside and corrodes circuits. The sooner you get it to me, the better chance of saving it. Severity depends on water type and how long it sat.',
      now: [
        'Power it OFF immediately if it\'s still on',
        'Don\'t try to charge it or turn it on',
        'Text me NOW — timing is everything'
      ],
      dont: [
        'DON\'T PUT IT IN RICE — rice does nothing',
        'Don\'t use a hairdryer (pushes water deeper)',
        'Don\'t assume it\'s dead because it\'s off'
      ],
      fix: 'I open it up, clean the corrosion with isopropyl alcohol, and assess the damage. Success rate depends on how quickly you bring it in. Fee covers diagnosis either way.'
    },
    'dead-battery': {
      title: 'Battery Dying Fast',
      icon: 'battery_alert',
      urgency: { label: 'Annoying', class: 'panic-urgency--medium' },
      verdictEmoji: '🔋',
      verdictText: 'Probably just the battery. But could be software.',
      what: 'Batteries degrade over time (2-3 years typically). But excessive drain could also be an app, software issue, or a faulty charging port.',
      now: [
        'Check battery health in Settings > Battery',
        'Try a different charger/cable',
        'Note which apps drain the most power'
      ],
      dont: [
        'Don\'t cover the phone while charging',
        'Don\'t use off-brand chargers',
        'Don\'t ignore it — degraded batteries can swell'
      ],
      fix: 'Battery replacement on almost everything. I\'ll verify it\'s the battery first. If it\'s a software issue, I\'ll point you in the right direction at no cost.'
    },
    'wont-charge': {
      title: 'Won\'t Charge',
      icon: 'power_off',
      urgency: { label: 'Common', class: 'panic-urgency--high' },
      verdictEmoji: '🔌',
      verdictText: 'Often the port, not the phone. Or the cable.',
      what: 'Could be: charging port buildup, bad cable/adapter, battery failure, or a software glitch. The port is the most common culprit.',
      now: [
        'Try a DIFFERENT charger and cable',
        'Try a DIFFERENT outlet',
        'Check the port with a flashlight — any debris?'
      ],
      dont: [
        'Don\'t jam a toothpick in there aggressively',
        'Don\'t assume the phone is dead',
        'Don\'t keep forcing the charger'
      ],
      fix: 'Charging port cleaning or replacement. Most ports are modular and replaceable. I\'ll clean it first — sometimes that\'s all it takes.'
    },
    'black-screen': {
      title: 'Black Screen / Won\'t Turn On',
      icon: 'mobile_off',
      urgency: { label: 'Common', class: 'panic-urgency--high' },
      verdictEmoji: '🖥️',
      verdictText: 'Don\'t panic. It might just be a software crash.',
      what: 'Could be: software freeze, battery completely drained, display issue, or water damage. About 30% are fixable with just a forced restart.',
      now: [
        'Force restart: press and hold both buttons for 30 seconds',
        'Try charging for 30 minutes — try a different charger',
        'Check if you hear anything when you press buttons'
      ],
      dont: [
        'Don\'t assume it\'s completely dead',
        'Don\'t keep smashing buttons',
        'Don\'t open it up unless you\'ve tried the basics'
      ],
      fix: 'Depends on the cause. Sometimes a hard reset works. Sometimes the display needs replacing. I\'ll diagnose and give you options.'
    },
    'overheating': {
      title: 'Phone Overheating',
      icon: 'thermostat',
      urgency: { label: 'Annoying', class: 'panic-urgency--medium' },
      verdictEmoji: '♨️',
      verdictText: 'Usually fixable. Could be software or hardware.',
      what: 'Could be: too many background apps, a bad update, battery issues, or the device working too hard (games, navigation). Rarely the actual processor.',
      now: [
        'Close all apps and let it cool down',
        'Turn off background app refresh',
        'Check what\'s using the most battery in Settings'
      ],
      dont: [
        'Don\'t put it in the freezer (condensation = water damage)',
        'Don\'t use it while charging if it\'s hot',
        'Don\'t ignore repeated overheating'
      ],
      fix: 'Software troubleshooting first (free). If it\'s hardware, could be battery replacement or thermal management. I\'ll figure out what\'s causing it.'
    },
    'data-loss': {
      title: 'Lost Data / Photos',
      icon: 'cloud_off',
      urgency: { label: 'Act Fast', class: 'panic-urgency--critical' },
      verdictEmoji: '💾',
      verdictText: 'Often recoverable. Don\'t write anything new to the drive.',
      what: 'Whether it\'s a dead phone, deleted files, or a crashed drive — there\'s usually a way to recover data. The key is stopping ALL further writes to the device.',
      now: [
        'STOP using the device immediately',
        'Don\'t try to fix it yourself with apps',
        'Call or text me BEFORE doing anything'
      ],
      dont: [
        'Don\'t attempt recovery software yourself',
        'Don\'t restore from backup until data is recovered',
        'Don\'t let anyone connect to the device unless they\'re recovery Pros'
      ],
      fix: 'I work with recovery specialists when needed for physical damage. Even water-damaged phones often have recoverable data. I can guide you on options.'
    },
    'slow-device': {
      title: 'Running Slow',
      icon: 'hourglass_empty',
      urgency: { label: 'Fixable', class: 'panic-urgency--low' },
      verdictEmoji: '🐢',
      verdictText: 'You probably don\'t need a new phone.',
      what: 'Usually: too many apps running, not enough storage, outdated software, or a degraded battery. Rarely the actual processor.',
      now: [
        'Delete apps you don\'t use',
        'Clear cache and temporary files',
        'Check for software updates'
      ],
      dont: [
        'Don\'t fall for "you need a new phone" — you probably don\'t',
        'Don\'t install "speed up" apps (they\'re junk)',
        'Don\'t factory reset without trying the basics first'
      ],
      fix: 'Tune-up service: I clean out the junk, optimize settings, check the battery, and get it running like new again. Much cheaper than replacement.'
    }
  };

  // DOM elements
  const panicGrid = document.getElementById('panicGrid');
  const panicDetail = document.getElementById('panicDetail');
  const panicBackdrop = document.getElementById('panicBackdrop');
  const panicClose = document.getElementById('panicClose');

  // Detail element refs
  const detailEls = {
    icon: document.getElementById('panicDetailIcon'),
    urgency: document.getElementById('panicDetailUrgency'),
    title: document.getElementById('panicDetailTitle'),
    verdictEmoji: document.getElementById('panicVerdictEmoji'),
    verdictText: document.getElementById('panicVerdictText'),
    whatText: document.getElementById('panicDetailWhatText'),
    nowList: document.getElementById('panicDetailNowList'),
    dontList: document.getElementById('panicDetailDontList'),
    fixText: document.getElementById('panicDetailFixText')
  };

  // Open detail panel
  function openPanicDetail(key) {
    const data = panicData[key];
    if (!data) return;

    // Build icon
    detailEls.icon.innerHTML = `<span class="material-symbols-outlined">${data.icon}</span>`;

    // Build urgency badge
    detailEls.urgency.innerHTML = `<span class="panic-urgency-dot"></span>${data.urgency.label}`;
    detailEls.urgency.className = 'panic-detail-urgency ' + data.urgency.class;

    // Title & verdict
    detailEls.title.textContent = data.title;
    detailEls.verdictEmoji.textContent = data.verdictEmoji;
    detailEls.verdictText.textContent = data.verdictText;

    // What section
    detailEls.whatText.textContent = data.what;

    // Now list
    detailEls.nowList.innerHTML = data.now.map(item => `<li>${item}</li>`).join('');

    // Don't list
    detailEls.dontList.innerHTML = data.dont.map(item => `<li>${item}</li>`).join('');

    // Fix section
    detailEls.fixText.textContent = data.fix;

    // Open panel
    panicDetail.classList.add('open');
    document.body.classList.add('panic-open');
    panicClose.focus();
  }

  // Close detail panel
  function closePanicDetail() {
    panicDetail.classList.remove('open');
    document.body.classList.remove('panic-open');
  }

  // Event listeners
  if (panicGrid) {
    panicGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.panic-card');
      if (card) {
        const key = card.dataset.panic;
        openPanicDetail(key);
      }
    });

    panicGrid.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.panic-card');
        if (card) {
          e.preventDefault();
          const key = card.dataset.panic;
          openPanicDetail(key);
        }
      }
    });
  }

  if (panicClose) {
    panicClose.addEventListener('click', closePanicDetail);
  }

  if (panicBackdrop) {
    panicBackdrop.addEventListener('click', closePanicDetail);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panicDetail && panicDetail.classList.contains('open')) {
      closePanicDetail();
    }
  });

})();


/* ═══════════════════════════════════════════
   REPAIR SOS — Interactive First Aid Guide
═══════════════════════════════════════════ */
(function() {
  // SOS Data: Each crisis type has steps with title, description, and optional timer
  const SOS_DATA = {
    water: {
      title: 'Water Damage',
      urgency: 'CRITICAL — Every minute counts',
      icon: `<svg viewBox="0 0 48 48" fill="none" width="32" height="32">
        <path d="M24 6 C24 6 10 22 10 31 C10 38.7 16.3 45 24 45 C31.7 45 38 38.7 38 31 C38 22 24 6 24 6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M24 18 C24 18 16 28 16 33 C16 37 19.6 40 24 40 C28.4 40 32 37 32 33 C32 28 24 18 24 18Z" fill="currentColor" opacity="0.25"/>
      </svg>`,
      steps: [
        {
          title: 'Get it out of the water. Now.',
          desc: 'The longer it stays submerged, the worse the damage. Fish it out immediately — every second matters.',
          timer: 'Do this immediately'
        },
        {
          title: 'Do NOT press any buttons',
          desc: 'Pressing buttons while it\'s wet can short-circuit the board. Just pick it up and leave it off.',
          timer: 'Resist the urge to check if it works'
        },
        {
          title: 'Wipe it dry gently',
          desc: 'Use a soft cloth or paper towel to remove visible water from the outside. Don\'t shake it — that pushes water deeper.',
          timer: '30 seconds'
        },
        {
          title: 'Text me right away',
          desc: 'Water damage is time-sensitive. The sooner I can start the rescue process, the better your chances. Text me a photo and I\'ll walk you through what to do next.',
          timer: 'Text: (208) 366-6111'
        }
      ]
    },
    cracked: {
      title: 'Cracked Screen',
      urgency: 'Fixable same day — don\'t wait',
      icon: `<svg viewBox="0 0 48 48" fill="none" width="32" height="32">
        <rect x="10" y="6" width="28" height="36" rx="4" stroke="currentColor" stroke-width="2"/>
        <path d="M16 14 L22 22 L18 30 L26 36" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M30 12 L34 18 L28 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>`,
      steps: [
        {
          title: 'Stop touching the screen',
          desc: 'Cracked glass can cut fingers. If you must use it, apply a screen protector or clear tape over the crack to prevent injury.',
          timer: 'Before you do anything else'
        },
        {
          title: 'Back up if you can',
          desc: 'If your phone is still working, now\'s a smart time to back up your photos and data — just in case the screen gets worse.',
          timer: '2 minutes'
        },
        {
          title: 'Don\'t use fix-it kits',
          desc: 'Those "liquid glass" or "screen repair" kits rarely work on real cracks and can void your warranty or damage the display. Skip them.',
          timer: 'Save yourself the frustration'
        },
        {
          title: 'Text me a photo',
          desc: 'Send me a picture of the crack and your phone model. I\'ll tell you exactly what it\'ll cost to fix and how fast I can get it done. Most screen repairs are done same day.',
          timer: 'Text: (208) 366-6111'
        }
      ]
    },
    dead: {
      title: 'Dead / Won\'t Charge',
      urgency: 'Usually an easy fix — let\'s find out',
      icon: `<svg viewBox="0 0 48 48" fill="none" width="32" height="32">
        <rect x="8" y="12" width="28" height="24" rx="3" stroke="currentColor" stroke-width="2"/>
        <path d="M36 20 L36 28 L40 28 L40 20 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <rect x="10" y="14" width="8" height="20" rx="1" fill="currentColor" opacity="0.25"/>
        <path d="M20 22 L28 30 M28 22 L20 30" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`,
      steps: [
        {
          title: 'Try a different cable and brick',
          desc: 'Cables fail more often than phones. Try another cable and wall charger — ideally one you know works with another device.',
          timer: '30 seconds'
        },
        {
          title: 'Check the port',
          desc: 'Look into the charging port with a light. Lint, dust, and pocket debris are the #1 cause of "won\'t charge." If you see gunk, gently clear it with a dry toothpick or soft brush.',
          timer: '1 minute'
        },
        {
          title: 'Try a wireless charge',
          desc: 'If your phone supports wireless charging, place it on a wireless pad. If it charges this way, the port is the problem — not the battery.',
          timer: '2 minutes'
        },
        {
          title: 'Text me what you see',
          desc: 'Tell me what happened: what you tried, what you\'re seeing (charging icon? nothing? intermittent?). I\'ll diagnose it and give you a clear answer — no guesswork.',
          timer: 'Text: (208) 366-6111'
        }
      ]
    },
    overheat: {
      title: 'Overheating Device',
      urgency: 'Don\'t ignore this one',
      icon: `<svg viewBox="0 0 48 48" fill="none" width="32" height="32">
        <path d="M24 6 L24 12 M24 36 L24 42 M6 24 L12 24 M36 24 L42 24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M10.1 10.1 L14.5 14.5 M33.5 33.5 L37.9 37.9 M37.9 10.1 L33.5 14.5 M14.5 33.5 L10.1 37.9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="24" cy="24" r="8" stroke="currentColor" stroke-width="2"/>
        <path d="M24 20 L24 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="24" cy="28" r="2" fill="currentColor"/>
      </svg>`,
      steps: [
        {
          title: 'Stop using it immediately',
          desc: 'If it\'s hot to the touch and actively overheating during use, put it down and walk away. Continued use accelerates the damage.',
          timer: 'Right now'
        },
        {
          title: 'Remove the case',
          desc: 'Cases trap heat. Taking off the case helps it cool down faster. Don\'t put it in the fridge — rapid cooling causes condensation and more damage.',
          timer: '10 seconds'
        },
        {
          title: 'Move it to a cool spot',
          desc: 'Lay it on a cool, flat surface — a countertop, not a bed or couch (fabric insulates heat). Point a fan at it if you have one.',
          timer: '30 seconds'
        },
        {
          title: 'Text me if it doesn\'t cool down',
          desc: 'If it stays hot after 10–15 minutes of being idle and off the charger, there\'s likely a deeper issue. Text me what happened — overheating can often be fixed once we identify the cause.',
          timer: 'Text: (208) 366-6111'
        }
      ]
    },
    blackout: {
      title: 'Black Screen / Dead',
      urgency: 'Don\'t give up on it yet',
      icon: `<svg viewBox="0 0 48 48" fill="none" width="32" height="32">
        <rect x="10" y="6" width="28" height="36" rx="4" stroke="currentColor" stroke-width="2"/>
        <path d="M16 16 L32 32 M32 16 L16 32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`,
      steps: [
        {
          title: 'Force restart it',
          desc: 'Hold the power button + volume down (iPhone) or power button alone (most Android) for 15–20 seconds. This often wakes a "soft-dead" phone.',
          timer: '20 seconds'
        },
        {
          title: 'Try another charger',
          desc: 'Plug it into a different cable and charger. A fully dead battery sometimes needs a moment on a working charger before it shows signs of life.',
          timer: '1 minute'
        },
        {
          title: 'Check for damage indicators',
          desc: 'Look at the charging port — bent pins, lint buildup, or moisture corrosion can prevent charging entirely. Look at the screen — do you see any faint glow, cracks, or bleeding?',
          timer: '30 seconds'
        },
        {
          title: 'Text me what you see',
          desc: 'Tell me: What happened right before it died? What have you tried? Even "I have no idea, it just stopped working" is useful. I\'ll tell you whether this sounds fixable — most black screens are.',
          timer: 'Text: (208) 366-6111'
        }
      ]
    },
    data: {
      title: 'Lost Photos / Data',
      urgency: 'Time matters — act fast',
      icon: `<svg viewBox="0 0 48 48" fill="none" width="32" height="32">
        <path d="M12 16 C12 12 16 8 24 8 C32 8 36 12 36 16 L38 36 C38 40 34 44 24 44 C14 44 10 40 10 36 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="24" cy="26" r="6" stroke="currentColor" stroke-width="2"/>
        <path d="M24 22 L24 30 M20 26 L28 26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`,
      steps: [
        {
          title: 'Stop using the device',
          desc: 'Continuing to use a failing storage device can overwrite the data you\'re trying to recover. Power it off if you can — don\'t keep trying to access files.',
          timer: 'Immediately'
        },
        {
          title: 'Don\'t shake it or bang on it',
          desc: 'Physical manipulation can make a failing drive worse. If the drive is clicking, humming abnormally, or the device is very hot, just set it down gently.',
          timer: 'Handle with care'
        },
        {
          title: 'If it\'s a phone: check iCloud / Google backup',
          desc: 'Your photos may already be safe in the cloud. Check photos.google.com on a computer, or log into iCloud.com on a friend\'s device. This takes 2 minutes and might give you peace of mind.',
          timer: '2 minutes'
        },
        {
          title: 'Text me — data recovery is possible',
          desc: 'I can often recover data from phones, laptops, and USB drives. Even "dead" devices sometimes yield their data. Don\'t assume it\'s gone — text me what happened and I\'ll tell you your options.',
          timer: 'Text: (208) 366-6111'
        }
      ]
    }
  };

  const sosOverlay = document.getElementById('sosOverlay');
  const sosPanel = document.getElementById('sosPanel');
  const sosBackdrop = document.getElementById('sosBackdrop');
  const sosClose = document.getElementById('sosClose');
  const sosSteps = document.getElementById('sosSteps');
  const sosPrev = document.getElementById('sosPrev');
  const sosNext = document.getElementById('sosNext');
  const sosProgressFill = document.getElementById('sosProgressFill');
  const sosProgressLabel = document.getElementById('sosProgressLabel');
  const sosCtaBlock = document.getElementById('sosCtaBlock');

  let currentSosType = null;
  let currentStep = 0;
  let totalSteps = 0;
  let stepStates = []; // 'pending' | 'done'

  function openSos(type) {
    currentSosType = type;
    const data = SOS_DATA[type];
    if (!data) return;

    currentStep = 0;
    totalSteps = data.steps.length;
    stepStates = data.steps.map(() => 'pending');

    // Set header
    document.getElementById('sosOverlayIcon').innerHTML = data.icon;
    document.getElementById('sosOverlayUrgency').textContent = data.urgency;
    document.getElementById('sosOverlayTitle').textContent = data.title;

    // Render steps
    renderSosSteps();

    // Reset nav
    sosPrev.disabled = true;
    sosNext.textContent = 'Next Step';
    sosNext.innerHTML = 'Next Step <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>';
    sosNext.disabled = false;
    sosNext.className = 'sos-nav-btn sos-nav-btn--next btn btn-primary';

    // Show overlay
    sosOverlay.setAttribute('aria-hidden', 'false');
    sosOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';

    // Animate steps in
    requestAnimationFrame(() => {
      animateStepIn(0);
    });
  }

  function closeSos() {
    sosOverlay.setAttribute('aria-hidden', 'true');
    sosOverlay.classList.remove('visible');
    document.body.style.overflow = '';
    currentSosType = null;
    currentStep = 0;
    sosCtaBlock.classList.remove('visible');
    sosCtaBlock.setAttribute('aria-hidden', 'true');
  }

  function renderSosSteps() {
    const data = SOS_DATA[currentSosType];
    sosSteps.innerHTML = '';

    data.steps.forEach((step, i) => {
      const el = document.createElement('div');
      el.className = 'sos-step';
      el.setAttribute('role', 'listitem');
      el.dataset.index = i;

      const doneIcon = `<svg viewBox="0 0 16 16" width="14" height="14" fill="none"><circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.2"/><path d="M5 8 L7 10 L11 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

      el.innerHTML = `
        <div class="sos-step-number">${i + 1}</div>
        <div class="sos-step-content">
          <div class="sos-step-title">${step.title}</div>
          <div class="sos-step-desc">${step.desc}</div>
          <div class="sos-step-timer">
            <span class="material-symbols-outlined" aria-hidden="true">timer</span>
            ${step.timer}
          </div>
          <div class="sos-step-check">
            ${doneIcon}
            Done
          </div>
        </div>
      `;
      sosSteps.appendChild(el);
    });
  }

  function animateStepIn(index) {
    const steps = sosSteps.querySelectorAll('.sos-step');
    steps.forEach((s, i) => {
      s.classList.remove('active', 'done');
      if (i < index) s.classList.add('done');
      if (i === index) {
        // Trigger reflow for animation restart
        void s.offsetWidth;
        s.classList.add('active');
      }
    });

    // Update progress
    const pct = ((index) / totalSteps) * 100;
    sosProgressFill.style.width = pct + '%';
    sosProgressLabel.textContent = `Step ${index + 1} of ${totalSteps}`;

    // Update nav
    sosPrev.disabled = index === 0;
  }

  function markStepDone() {
    const steps = sosSteps.querySelectorAll('.sos-step');
    if (steps[currentStep]) {
      stepStates[currentStep] = 'done';
      steps[currentStep].classList.remove('active');
      steps[currentStep].classList.add('done');
    }
  }

  function nextStep() {
    if (currentStep < totalSteps - 1) {
      markStepDone();
      currentStep++;
      animateStepIn(currentStep);
    } else {
      // Last step — mark done and show CTA
      markStepDone();
      showSosCta();
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      currentStep--;
      animateStepIn(currentStep);
    }
  }

  function showSosCta() {
    sosProgressFill.style.width = '100%';
    sosProgressLabel.textContent = 'All done';
    sosPrev.style.display = 'none';
    sosNext.style.display = 'none';
    sosCtaBlock.classList.add('visible');
    sosCtaBlock.setAttribute('aria-hidden', 'false');
  }

  // Event listeners for SOS cards
  document.querySelectorAll('.sos-card').forEach(card => {
    card.addEventListener('click', () => {
      const type = card.dataset.sos;
      if (type) openSos(type);
    });
  });

  sosClose.addEventListener('click', closeSos);
  sosBackdrop.addEventListener('click', closeSos);
  sosPrev.addEventListener('click', prevStep);
  sosNext.addEventListener('click', nextStep);

  // Keyboard nav
  document.addEventListener('keydown', e => {
    if (!sosOverlay.classList.contains('visible')) return;
    if (e.key === 'Escape') closeSos();
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); nextStep(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prevStep(); }
  });

  // Escape key to close
  sosOverlay.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSos();
  });

})();


/* ═══════════════════════════════════════════
   TRIAGE SECTION — Device ER (Urgency Triage)
══════════════════════════════════════════ */
(function() {
  'use strict';

  // Data: symptoms by device
  const triageData = {
    iphone: {
      label: 'iPhone',
      symptoms: [
        { id: 'screen-cracked', label: 'Screen cracked/shattered', urgency: 7, danger: "Don't press on the glass or try to peel it off.", action: 'Text me a photo. If the screen is still working, we can usually fix same-day.', info: 'Cracked screens rarely get worse quickly, but the glass can cut.' },
        { id: 'water-damaged', label: 'Water/liquid damage', urgency: 9, danger: "Don't turn it on. Don't put it in rice — that doesn't work.", action: 'Power off immediately if its not already. Text me now. Time is critical.', info: 'The sooner I see it, the better the chances of saving it.' },
        { id: 'battery-swollen', label: 'Battery swollen', urgency: 10, danger: "STOP using it. Don't charge it. Swollen batteries are dangerous.", action: 'Text me NOW. This is urgent — swollen batteries can leak or worse.', info: 'Usually happens over time from age or charging damage.' },
        { id: 'not-turning-on', label: 'Won’t turn on', urgency: 6, danger: "Don't keep trying to charge a device that wont respond.", action: "Try a different cable/charger for 10 min. If still nothing, text me.", info: 'Could be the charging port, battery, or logic board.' },
        { id: 'overheating', label: 'Overheating', urgency: 5, danger: 'Stop using it. Don’t put it in a freezer or bag of ice.', action: 'Let it cool down for 15 min. If it happens again, text me.', info: 'Could be software, battery, or debris in the charging port.' },
        { id: 'no-sound', label: 'No sound/Audio issues', urgency: 2, danger: "Don't blow into the speaker holes — it will push debris deeper.", action: "Check Settings > Sound. Try a restart. Let me know if it persists.", info: "Often just software — rarely a hardware problem." },
        { id: 'camera-broken', label: 'Camera not working', urgency: 3, danger: "Don't keep using a cracked camera — shards can damage other parts.", action: "Try a restart. If still broken, text me for a quote.", info: 'Often just needs a software reset.' },
        { id: 'face-id-broken', label: 'Face ID broken', urgency: 4, danger: "Don't try to fix Face ID yourself — you could make it worse.", action: 'Try a restart first. If still failing, text for diagnosis.', info: 'Sometimes the flex cable just needs reseating.' }
      ]
    },
    android: {
      label: 'Android',
      symptoms: [
        { id: 'screen-cracked', label: 'Screen cracked/shattered', urgency: 7, danger: "Don't press on broken glass or try to peel off loose pieces.", action: 'Send a photo. Most screen repairs are done same-day.', info: 'Glass-only cracks (still works) vs LCD damage (lines/no picture).' },
        { id: 'water-damaged', label: 'Water/liquid damage', urgency: 9, danger: "Don't turn it on. Rice doesn't help — it's a myth.", action: 'Power off now. Text me ASAP. Every hour matters.', info: 'Idaho weather — snow, rain, rivers — causes a lot of this.' },
        { id: 'battery-swollen', label: 'Battery swollen', urgency: 10, danger: 'STOP. Don’t charge or use it. Swollen batteries are fire risk.', action: 'Get it to me today. This is serious — handle with care.', info: 'Usually from age or heat exposure.' },
        { id: 'not-turning-on', label: 'Won’t turn on', urgency: 6, danger: "Don't repeatedly try to turn on a dead phone.", action: 'Try a different charger for 10 min. Let me know what happens.', info: 'Could be port, battery, or mainboard.' },
        { id: 'overheating', label: 'Overheating', urgency: 5, danger: "Don't use it while charging. Don't submerge to cool it.", action: 'Let it rest 15 min. Close apps. If still hot, text me.', info: 'Often software-related. Can be charging port debris.' },
        { id: 'no-sound', label: 'No sound', urgency: 2, danger: "Don't blow into ports — you'll push dirt deeper.", action: 'Check Settings. Restart. Check if speaker is blocked.', info: "Usually software — rarely the speaker itself." },
        { id: 'charging-port', label: 'Charging issues', urgency: 4, danger: "Don't use a metal object to clean the port.", action: 'Try a different cable first. Let me know if it charges slowly.', info: 'Lint buildup is the #1 cause. I can clean it in 5 min.' },
        { id: 'battery-drain', label: 'Fast battery drain', urgency: 3, danger: "Don't install "battery saver" apps — they do more harm.", action: 'Try a restart. Check which app is using most battery.', info: 'Often software. Could also be a bad battery.' }
      ]
    },
    laptop: {
      label: 'Laptop',
      symptoms: [
        { id: 'screen-broken', label: 'Screen broken/cracked', urgency: 7, danger: "Don't keep using a cracked screen — it will worsen.", action: 'Send photo. I'll find a matching replacement panel.', info: 'Panel-only repairs usually $100-200 depending on model.' },
        { id: 'water-damaged', label: 'Liquid spilled on it', urgency: 10, danger: "DON'T turn it on. Don't take apart unless you know what you're doing.", action: 'Unplug immediately. If you can, remove the battery. Get to me today.', info: 'Time is critical. The sooner I see it, the better.' },
        { id: 'not-turning-on', label: 'Won’t turn on', urgency: 8, danger: 'Stop mashing the power button.', action: 'Unplug all peripherals. Try a hard reset (hold power 30 sec). Then text me.', info: 'Could be power IC, battery, or mainboard.' },
        { id: 'no-power', label: 'Charging issues', urgency: 4, danger: "Don't use cheap third-party chargers — they can damage laptops.", action: 'Try a different charger. Check the charging port for debris.', info: 'Usually the port or power jack — fixable.' },
        { id: 'overheating', label: 'Overheating/Fan loud', urgency: 5, danger: "Don't block the vents. Don't run laptops on pillows/blankets.", action: 'Clean vents if you can. Check my tips page for proper use.', info: 'Dust buildup is common — I can clean and repaste.' },
        { id: 'keyboard-broken', label: 'Keyboard not working', urgency: 3, danger: "Don't spill more liquid on it trying to clean it.", action: 'Try an external keyboard to test. Let me know which keys.', info: 'Could be the keyboard or the mainboard.' },
        { id: 'trackpad-broken', label: 'Trackpad not working', urgency: 2, danger: "Don't try to force the trackpad — you could break it more.", action: 'Try restarting. Connect a mouse temporarily.', info: 'Often just needs a driver reset or fix.' },
        { id: 'slow-performance', label: 'Slow/Freezing', urgency: 2, danger: "Don't install "PC cleaner" or "optimizer" software.", action: 'Try a restart first. Text me if it keeps happening.', info: 'Usually software — rarely hardware.' }
      ]
    },
    tablet: {
      label: 'Tablet',
      symptoms: [
        { id: 'screen-cracked', label: 'Screen cracked', urgency: 7, danger: "Don't press on broken glass.", action: 'Photo helps. Most tablets done in 1-2 hours.', info: 'iPad screens are layered — may need just glass or full display.' },
        { id: 'water-damaged', label: 'Water damage', urgency: 9, danger: "Don't turn on. Rice doesn't work.", action: 'Power off if you can. Text me immediately.', info: 'Same-day response critical.' },
        { id: 'not-charging', label: 'Won’t charge', urgency: 4, danger: 'Check the cable first. Try a different one.', action: 'Try different cable/charger. Check port for lint.', info: 'Lint in the port is the usual culprit.' },
        { id: 'slow', label: 'Running slow', urgency: 1, danger: "Don't load it with "cleanup" apps.", action: 'Restart it. Check storage. Text me if persists.', info: 'Usually needs a restore, not hardware.' },
        { id: 'speakers-noisy', label: 'Speaker issues', urgency: 2, danger: "Don't blow into the speakers.", action: 'Restart. Check volume settings. Let me know.', info: 'Usually software.' }
      ]
    },
    console: {
      label: 'Console',
      symptoms: [
        { id: 'not-turning-on', label: 'Won’t turn on', urgency: 6, danger: "Don't keep pressing the button. You could fry something.", action: 'Unplug 30 sec, then try again. Check power cable.', info: 'Many "dead" consoles just need a hard reset.' },
        { id: 'hdmi-no-signal', label: 'No HDMI signal', urgency: 5, danger: "Don't bang the console. HDMI ports are fragile.", action: 'Try a different cable. Try a different TV. Text me.', info: 'HDMI port or the connector on the board.' },
        { id: 'disc-issues', label: 'Disc not reading', urgency: 4, danger: "Don't use scratched discs. Clean discs gently.", action: 'Try cleaning the disc. If still failing, it probably needs a new drive.', info: 'Disc drive lasers do wear out.' },
        { id: 'overheating', label: 'Shutting down/Overheating', urgency: 7, danger: "Don't block vents. Don't use in a cabinet.", action: 'Let it cool. Ensure ventilation. Text me if it keeps happening.', info: 'Could need new thermal paste or a fan.' },
        { id: 'controller-drift', label: 'Controller drift', urgency: 3, drift: "Don't open it yourself — you will void whatever warranty remains.", action: 'Try resetting the controller first.', info: 'Joystick modules can be replaced.' },
        { id: 'laser-damage', label: 'Lens not reading discs', urgency: 4, danger: "Don't keep trying to force it.", action: 'Try different games. If all fail, the laser likely needs replacing.', info: 'Lasers weaken over time.' }
      ]
    }
  };

  // Urgency level mapping
  const urgencyLevels = [
    { max: 2, label: 'Can Wait', icon: '⏳', color: '#3fb950' },
    { max: 4, label: 'Schedule Soon', icon: '📅', color: '#39c5cf' },
    { max: 6, label: 'Get Seen This Week', icon: '⚡', color: '#f78166' },
    { max: 8, label: 'Urgent', icon: '🚨', color: '#f85149' },
    { max: 10, label: 'ER Now', icon: '🚑', color: '#f85149' }
  ];

  // DOM elements
  const triageWidget = document.getElementById('triageWidget');
  if (!triageWidget) return;

  const stage1 = document.getElementById('triageStage1');
  const stage2 = document.getElementById('triageStage2');
  const stage3 = document.getElementById('triageStage3');
  const deviceBtns = document.querySelectorAll('.triage-device-btn');
  const symptomsContainer = document.getElementById('triageSymptoms');
  const nextBtn2 = document.getElementById('triageNext2');
  const backBtn1 = document.getElementById('triageBack1');
  const backBtn2 = document.getElementById('triageBack2');
  const resetBtn = document.getElementById('triageReset');
  const deviceLabel = document.getElementById('triageDeviceLabel');

  // Gauges & result
  const gaugeFill = document.getElementById('triageGaugeFill');
  const urgencyIcon = document.getElementById('triageUrgencyIcon');
  const urgencyLabel = document.getElementById('triageUrgencyLabel');
  const urgencyScore = document.getElementById('triageUrgencyScore');

  // Result cards
  const dangerTitle = document.getElementById('triageDangerTitle');
  const dangerDesc = document.getElementById('triageDangerDesc');
  const actionTitle = document.getElementById('triageActionTitle');
  const actionDesc = document.getElementById('triageActionDesc');
  const infoTitle = document.getElementById('triageInfoTitle');
  const infoDesc = document.getElementById('triageInfoDesc');

  let selectedDevice = null;
  let selectedSymptom = null;

  // Device selection
  deviceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedDevice = btn.dataset.triageDevice;
      deviceBtns.forEach(b => b.setAttribute('data-triage-device-selected', 'false'));
      btn.setAttribute('data-triage-device-selected', 'true');

      // Populate symptoms
      const data = triageData[selectedDevice];
      deviceLabel.textContent = `(${data.label})`;

      symptomsContainer.innerHTML = '';
      data.symptoms.forEach(s => {
        const pill = document.createElement('button');
        pill.className = 'triage-symptom-btn';
        pill.setAttribute('data-triage-symptom', s.id);
        pill.textContent = s.label;
        pill.addEventListener('click', () => {
          symptomsContainer.querySelectorAll('.triage-symptom-btn').forEach(p => {
            p.setAttribute('data-triage-symptom-selected', 'false');
          });
          pill.setAttribute('data-triage-symptom-selected', 'true');
          selectedSymptom = s;
          nextBtn2.disabled = false;
        });
        symptomsContainer.appendChild(pill);
      });

      // Move to stage 2
      stage1.classList.remove('triage-stage--active');
      stage2.classList.add('triage-stage--active');
    });
  });

  // Navigation
  backBtn1.addEventListener('click', () => {
    selectedDevice = null;
    deviceBtns.forEach(b => b.setAttribute('data-triage-device-selected', 'false'));
    stage2.classList.remove('triage-stage--active');
    stage1.classList.add('triage-stage--active');
  });

  nextBtn2.addEventListener('click', () => {
    if (!selectedSymptom) return;
    showResult(selectedSymptom);
    stage2.classList.remove('triage-stage--active');
    stage3.classList.add('triage-stage--active');
  });

  backBtn2.addEventListener('click', () => {
    selectedSymptom = null;
    nextBtn2.disabled = true;
    symptomsContainer.querySelectorAll('.triage-symptom-btn').forEach(p => {
      p.setAttribute('data-triage-symptom-selected', 'false');
    });
    stage3.classList.remove('triage-stage--active');
    stage2.classList.add('triage-stage--active');
  });

  resetBtn.addEventListener('click', () => {
    selectedDevice = null;
    selectedSymptom = null;
    deviceBtns.forEach(b => b.setAttribute('data-triage-device-selected', 'false'));
    symptomsContainer.innerHTML = '';
    nextBtn2.disabled = true;
    stage3.classList.remove('triage-stage--active');
    stage1.classList.add('triage-stage--active');
  });

  // Show triage result
  function showResult(symptom) {
    const urgency = symptom.urgency;
    const maxUrgency = 10;
    const percent = urgency / maxUrgency;

    // Determine urgency level
    let level = urgencyLevels[0];
    for (const l of urgencyLevels) {
      if (urgency <= l.max) {
        level = l;
        break;
      }
    }

    // Animate gauge
    const dashOffset = 251 * (1 - percent);
    gaugeFill.style.strokeDashoffset = dashOffset;

    // Set urgency display
    urgencyIcon.textContent = level.icon;
    urgencyLabel.textContent = level.label;
    urgencyScore.textContent = `${urgency}/10`;

    // Cards
    dangerTitle.textContent = "Don't Do This";
    dangerDesc.textContent = symptom.danger;
    actionTitle.textContent = "Do This Now";
    actionDesc.textContent = symptom.action;
    infoTitle.textContent = 'Good to Know';
    infoDesc.textContent = symptom.info;
  }

})();
