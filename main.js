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
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      nav.classList.toggle('scrolled', scrollY > 10);
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

  if (contactForm) {
    // Bind blur/input validation
    ['name', 'contact', 'issue'].forEach(id => {
      const input = contactForm.querySelector('#' + id);
      if (input) {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
          if (input.classList.contains('invalid')) validateField(input);
        });
      }
    });
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
  const countEls = document.querySelectorAll('[data-countup]');

  if ('IntersectionObserver' in window && countEls.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        countObserver.unobserve(el);

        const end = parseInt(el.getAttribute('data-countup'), 10);
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1200;
        const start = performance.now();

        function tick(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(eased * end);
          el.textContent = prefix + current + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });

    countEls.forEach(el => countObserver.observe(el));
  }

  // ─── Scroll progress bar ──────────────────────────────────
  const progressBar = document.getElementById('scrollProgress');
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
          // Done typing — pause, then delete
          pauseTimer = setTimeout(() => {
            isDeleting = true;
            typeLoop();
          }, PAUSE_AFTER);
          return;
        }
        setTimeout(typeLoop, TYPE_SPEED + Math.random() * 30);
      } else {
        // Deleting
        charIndex--;
        typerEl.textContent = current.slice(0, charIndex);

        if (charIndex === 0) {
          // Done deleting — move to next phrase
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(typeLoop, PAUSE_BEFORE);
          return;
        }
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
