/* ============================================================
   PLN NUSA DAYA LANDING PAGE — script.js
   ============================================================ */

'use strict';

/* ---- DOM ready ---- */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHamburger();
  initScrollAnimations();
  initStatsCounter();
  initServicesCarousel();
  initNewsCarousel();
  initPortfolioFilter();
  initScrollToTop();
  initSmoothScroll();
  initActiveNavOnScroll();
  initHeroVideoFallback();
});

/* ============================================================
   NAVBAR — scroll shadow + logo shrink
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }, { passive: true });
}

/* ============================================================
   HAMBURGER MENU
   ============================================================ */
function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('navMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      btn.classList.remove('open');
      menu.classList.remove('open');
    }
  });
}

/* ============================================================
   SCROLL ANIMATIONS (AOS-like, pure JS)
   ============================================================ */
function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-aos]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ============================================================
   STATS COUNTER (animates numbers on entry)
   ============================================================ */
function initStatsCounter() {
  const counters = document.querySelectorAll('.stat-number[data-target]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const stepTime = 16;
  const steps    = Math.floor(duration / stepTime);
  let current = 0;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const timer = setInterval(() => {
    current++;
    const progress = current / steps;
    const value = Math.round(easeOut(progress) * target);
    el.textContent = value.toLocaleString('id-ID');

    if (current >= steps) {
      clearInterval(timer);
      el.textContent = target.toLocaleString('id-ID');
    }
  }, stepTime);
}

/* ============================================================
   SERVICES CAROUSEL
   ============================================================ */
function initServicesCarousel() {
  const track = document.getElementById('servicesTrack');
  const prev  = document.getElementById('servicesPrev');
  const next  = document.getElementById('servicesNext');
  const dots  = document.getElementById('servicesDots');
  if (!track) return;

  let currentIndex = 0;
  const cards = track.querySelectorAll('.service-card');
  const VISIBLE = getVisibleCards();

  function getVisibleCards() {
    if (window.innerWidth < 600)  return 1;
    if (window.innerWidth < 900)  return 2;
    if (window.innerWidth < 1200) return 3;
    return 4;
  }

  function maxIndex() { return Math.max(0, cards.length - getVisibleCards()); }

  // Build dots
  const dotCount = maxIndex() + 1;
  for (let i = 0; i < dotCount; i++) {
    const d = document.createElement('span');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goTo(i));
    dots.appendChild(d);
  }

  function updateDots() {
    dots.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentIndex);
    });
  }

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(index, maxIndex()));
    const cardW = cards[0].offsetWidth + 24; // gap=24
    track.style.transform = `translateX(-${currentIndex * cardW}px)`;
    updateDots();
  }

  prev.addEventListener('click', () => goTo(currentIndex - 1));
  next.addEventListener('click', () => goTo(currentIndex + 1));

  // Touch/swipe
  addSwipeSupport(track, () => goTo(currentIndex + 1), () => goTo(currentIndex - 1));

  // Auto-play
  let autoPlay = setInterval(() => goTo(currentIndex + 1 > maxIndex() ? 0 : currentIndex + 1), 4500);
  const wrapper = track.closest('.services-carousel-wrapper');
  if (wrapper) {
    wrapper.addEventListener('mouseenter', () => clearInterval(autoPlay));
    wrapper.addEventListener('mouseleave', () => {
      autoPlay = setInterval(() => goTo(currentIndex + 1 > maxIndex() ? 0 : currentIndex + 1), 4500);
    });
  }

  window.addEventListener('resize', () => goTo(Math.min(currentIndex, maxIndex())));
}

/* ============================================================
   NEWS CAROUSEL
   ============================================================ */
function initNewsCarousel() {
  const track = document.getElementById('newsTrack');
  const prev  = document.getElementById('newsPrev');
  const next  = document.getElementById('newsNext');
  if (!track) return;

  let currentIndex = 0;
  const cards = track.querySelectorAll('.news-card');

  function getVisible() {
    if (window.innerWidth < 768)  return 1;
    if (window.innerWidth < 1100) return 2;
    return 3;
  }

  function maxIndex() { return Math.max(0, cards.length - getVisible()); }

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(index, maxIndex()));
    const cardW = cards[0].offsetWidth + 24;
    track.style.transform = `translateX(-${currentIndex * cardW}px)`;
  }

  prev.addEventListener('click', () => goTo(currentIndex - 1));
  next.addEventListener('click', () => goTo(currentIndex + 1));
  addSwipeSupport(track, () => goTo(currentIndex + 1), () => goTo(currentIndex - 1));

  // Auto play
  let autoPlay = setInterval(() => goTo(currentIndex + 1 > maxIndex() ? 0 : currentIndex + 1), 5000);
  const wrapper = track.closest('.news-carousel-wrapper');
  if (wrapper) {
    wrapper.addEventListener('mouseenter', () => clearInterval(autoPlay));
    wrapper.addEventListener('mouseleave', () => {
      autoPlay = setInterval(() => goTo(currentIndex + 1 > maxIndex() ? 0 : currentIndex + 1), 5000);
    });
  }

  window.addEventListener('resize', () => goTo(Math.min(currentIndex, maxIndex())));
}

/* ============================================================
   TOUCH SWIPE HELPER
   ============================================================ */
function addSwipeSupport(el, onSwipeLeft, onSwipeRight) {
  let startX = 0;
  el.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  el.addEventListener('touchend', (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) onSwipeLeft();
      else onSwipeRight();
    }
  }, { passive: true });
}

/* ============================================================
   PORTFOLIO FILTER
   ============================================================ */
function initPortfolioFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const items   = document.querySelectorAll('.portfolio-item');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active button
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter items with animation
      items.forEach(item => {
        const cat = item.dataset.category;
        const show = filter === 'all' || cat === filter;

        if (show) {
          item.classList.remove('hidden');
          item.style.animation = 'fadeInScale .4s ease forwards';
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
}

// Inject keyframe for portfolio filter animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInScale {
    from { opacity: 0; transform: scale(.92); }
    to   { opacity: 1; transform: scale(1); }
  }
`;
document.head.appendChild(style);

/* ============================================================
   SCROLL TO TOP
   ============================================================ */
function initScrollToTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   SMOOTH SCROLL (internal links)
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
        const top  = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top, behavior: 'smooth' });

        // Close mobile menu if open
        document.getElementById('hamburger')?.classList.remove('open');
        document.getElementById('navMenu')?.classList.remove('open');
      }
    });
  });
}

/* ============================================================
   ACTIVE NAV LINK ON SCROLL
   ============================================================ */
function initActiveNavOnScroll() {
  const sections = ['home','about','stats','services','news','portfolio','direksi','contact'];
  const navItems = document.querySelectorAll('.nav-item');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 100;
    let current = 'home';

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollY) current = id;
    });

    navItems.forEach(item => {
      const link = item.querySelector('.nav-link');
      if (!link) return;
      const href = link.getAttribute('href');
      item.classList.toggle('active', href === `#${current}`);
    });
  }, { passive: true });
}

/* ============================================================
   HERO VIDEO FALLBACK
   ============================================================ */
function initHeroVideoFallback() {
  const video = document.getElementById('heroVideo');
  if (!video) return;

  video.addEventListener('error', () => {
    // Fallback: light gradient background
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.style.background = 'linear-gradient(135deg, #e8f6fd 0%, #f0f9ff 50%, #e0f3fc 100%)';
    }
    if (video.parentElement) {
      video.parentElement.style.background = 'linear-gradient(135deg, #e8f6fd 0%, #f0f9ff 50%, #e0f3fc 100%)';
      video.style.display = 'none';
    }
  });
}

/* ============================================================
   CONTACT FORM
   ============================================================ */
function handleFormSubmit(event) {
  event.preventDefault();
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const btn     = document.getElementById('submitBtn');

  if (!form || !success || !btn) return;

  // Loading state
  btn.textContent = 'Sending...';
  btn.disabled    = true;

  // Simulate submission
  setTimeout(() => {
    form.style.display    = 'none';
    success.style.display = 'flex';
    success.style.flexDirection = 'column';
    success.style.alignItems    = 'center';
  }, 1200);
}

/* ============================================================
   PARALLAX EFFECT (subtle) on hero
   ============================================================ */
window.addEventListener('scroll', () => {
  const video   = document.querySelector('.hero-video');
  const content = document.querySelector('.hero-content');
  if (!video || !content) return;

  const scrollY = window.scrollY;
  video.style.transform   = `translateY(${scrollY * 0.3}px)`;
  content.style.transform = `translateY(${scrollY * 0.1}px)`;
  content.style.opacity   = Math.max(0, 1 - scrollY / 600);
}, { passive: true });
