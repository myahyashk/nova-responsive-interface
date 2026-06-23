/* ============================================================
   NOVA – Landing Page Scripts
   ============================================================ */

'use strict';

/* ---- Utility ---- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ================================================================
   HEADER: scroll state + transparent → frosted glass
   ================================================================ */
const header = $('#header');

const onHeaderScroll = () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
};

window.addEventListener('scroll', onHeaderScroll, { passive: true });
onHeaderScroll();

/* ================================================================
   MOBILE MENU
   ================================================================ */
const hamburger = $('#hamburger');
const navMenu   = $('#nav-menu');

const closeMenu = () => {
  navMenu.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
};

const openMenu = () => {
  navMenu.classList.add('open');
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
};

hamburger.addEventListener('click', () => {
  const isOpen = navMenu.classList.contains('open');
  isOpen ? closeMenu() : openMenu();
});

$$('.nav__link').forEach(link => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('click', (e) => {
  if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
    closeMenu();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

/* ================================================================
   SMOOTH SCROLLING for anchor links
   ================================================================ */
$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = $(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ================================================================
   ACTIVE NAV LINK on scroll (IntersectionObserver)
   ================================================================ */
const sections   = $$('section[id]');
const navLinks   = $$('.nav__link');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle(
          'active',
          link.getAttribute('href') === `#${entry.target.id}`
        );
        link.removeAttribute('aria-current');
        if (link.getAttribute('href') === `#${entry.target.id}`) {
          link.setAttribute('aria-current', 'page');
        }
      });
    }
  });
}, {
  rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72}px 0px -55% 0px`,
  threshold: 0
});

sections.forEach(sec => navObserver.observe(sec));

/* ================================================================
   SCROLL REVEAL ANIMATIONS
   ================================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

$$('.reveal').forEach(el => revealObserver.observe(el));

/* ================================================================
   ANIMATED COUNTERS (About section stats)
   ================================================================ */
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const animateCounter = (el) => {
  const target = parseInt(el.dataset.target, 10);
  if (isNaN(target)) return;
  const duration = 1800;
  const start = performance.now();

  const tick = (now) => {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value    = Math.round(easeOutCubic(progress) * target);
    el.textContent = value.toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

$$('.stat-card__num[data-target]').forEach(el => counterObserver.observe(el));

/* ================================================================
   HERO BAR CHART: staggered grow animation on load
   ================================================================ */
const bars = $$('.hero__bar');
bars.forEach((bar, i) => {
  bar.style.animationDelay = `${i * 0.1}s`;
});

/* ================================================================
   CONTACT FORM VALIDATION
   ================================================================ */
const contactForm  = $('#contact-form');
const formSuccess  = $('#form-success');

const validators = {
  name: (v) => {
    if (!v.trim()) return 'Please enter your full name.';
    if (v.trim().length < 2) return 'Name must be at least 2 characters.';
    return '';
  },
  email: (v) => {
    if (!v.trim()) return 'Please enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Please enter a valid email address.';
    return '';
  },
  message: (v) => {
    if (!v.trim()) return 'Please enter a message.';
    if (v.trim().length < 10) return 'Message must be at least 10 characters.';
    return '';
  }
};

const setFieldState = (input, errorEl, message) => {
  if (message) {
    input.classList.add('error');
    input.classList.remove('success');
    errorEl.textContent = message;
    input.setAttribute('aria-invalid', 'true');
  } else {
    input.classList.remove('error');
    input.classList.add('success');
    errorEl.textContent = '';
    input.setAttribute('aria-invalid', 'false');
  }
};

const validateField = (input) => {
  const name = input.name;
  if (!validators[name]) return true;
  const errorEl = $(`#${name}-error`);
  const message = validators[name](input.value);
  setFieldState(input, errorEl, message);
  return !message;
};

if (contactForm) {
  ['name', 'email', 'message'].forEach(fieldName => {
    const input = contactForm.elements[fieldName];
    if (!input) return;
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let allValid = true;

    ['name', 'email', 'message'].forEach(fieldName => {
      const input = contactForm.elements[fieldName];
      if (input && !validateField(input)) allValid = false;
    });

    if (!allValid) {
      const firstError = contactForm.querySelector('.form__input.error');
      firstError?.focus();
      return;
    }

    const submitBtn = contactForm.querySelector('[type="submit"]');
    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Sending...';

    setTimeout(() => {
      contactForm.reset();
      ['name', 'email', 'message'].forEach(fieldName => {
        const input = contactForm.elements[fieldName];
        if (input) {
          input.classList.remove('success', 'error');
          input.removeAttribute('aria-invalid');
        }
      });

      formSuccess.hidden = false;
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;

      setTimeout(() => { formSuccess.hidden = true; }, 7000);
    }, 1200);
  });
}

/* ================================================================
   NEWSLETTER FORM (Footer)
   ================================================================ */
const newsletterForm = $('.footer__newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = newsletterForm.querySelector('input[type="email"]');
    const btn   = newsletterForm.querySelector('button');
    if (!input.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      input.style.borderColor = 'var(--error)';
      setTimeout(() => { input.style.borderColor = ''; }, 2000);
      return;
    }
    const orig = btn.textContent;
    btn.textContent = 'Subscribed!';
    btn.disabled = true;
    input.value = '';
    setTimeout(() => {
      btn.textContent = orig;
      btn.disabled = false;
    }, 4000);
  });
}

/* ================================================================
   BACK TO TOP BUTTON
   ================================================================ */
const backToTopBtn = $('#back-to-top');

const onBackToTopScroll = () => {
  const show = window.scrollY > 400;
  backToTopBtn.classList.toggle('visible', show);
  backToTopBtn.hidden = !show;
};

window.addEventListener('scroll', onBackToTopScroll, { passive: true });
onBackToTopScroll();

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ================================================================
   FOOTER: Dynamic year
   ================================================================ */
const yearEl = $('#footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ================================================================
   FEATURE CARDS: Keyboard navigation (Enter = follow link)
   ================================================================ */
$$('.feature-card').forEach(card => {
  card.setAttribute('tabindex', '0');
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const link = $('a', card);
      link?.click();
    }
  });
});

/* ================================================================
   HEADER LOGO & NAV: Subtle parallax on logo image
   ================================================================ */
const logoImg = $('.nav__logo-img');
if (logoImg && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  window.addEventListener('scroll', () => {
    const offset = window.scrollY * 0.04;
    logoImg.style.transform = `rotate(${-offset}deg)`;
  }, { passive: true });
}
