/* ==============================================
   script.js – Portfolio interactions & 3D visuals
   Uses Three.js (loaded from CDN fallback below)
=============================================== */

// ============================================================
// UTILITIES
// ============================================================
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ============================================================
// CUSTOM CURSOR
// ============================================================
const cursor = $('#cursor');
const cursorTrail = $('#cursorTrail');
let mouseX = 0, mouseY = 0, trailX = 0, trailY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

function animateTrail() {
  trailX += (mouseX - trailX) * 0.12;
  trailY += (mouseY - trailY) * 0.12;
  cursorTrail.style.left = trailX + 'px';
  cursorTrail.style.top  = trailY + 'px';
  requestAnimationFrame(animateTrail);
}
animateTrail();

// Cursor hover effects
$$('a, button, .skill-orb, .project-card, .filter-btn, .contact-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.classList.add('hovering');
    cursorTrail.classList.add('hovering');
  });
  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('hovering');
    cursorTrail.classList.remove('hovering');
  });
});

// ============================================================
// NAVBAR SCROLL
// ============================================================
const navbar = $('#navbar');
const backToTop = $('#backToTop');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // Navbar glass effect
  if (scrollY > 50) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');

  // Back to top
  if (scrollY > 400) backToTop.classList.add('visible');
  else backToTop.classList.remove('visible');

  // Active nav link
  const sections = $$('section[id]');
  sections.forEach(sec => {
    const top = sec.offsetTop - 100;
    const bottom = top + sec.offsetHeight;
    if (scrollY >= top && scrollY < bottom) {
      $$('.nav-link').forEach(l => l.classList.remove('active'));
      const active = $(`.nav-link[data-section="${sec.id}"]`);
      if (active) active.classList.add('active');
    }
  });
});

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ============================================================
// MOBILE MENU
// ============================================================
const hamburger = $('#hamburger');
const mobileMenu = $('#mobileMenu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
}

// ============================================================
// TYPED ROLE ANIMATION
// ============================================================
const roles = [
  'IoT Engineer 📡',
  'Embedded Systems Dev 🔧',
  'Full-Stack Builder 🌐',
  'AI Integration Enthusiast 🤖',
];
let roleIdx = 0, charIdx = 0, deleting = false;
const typedEl = $('#typedRole');

function typeRole() {
  const current = roles[roleIdx];
  if (!deleting) {
    typedEl.textContent = current.slice(0, ++charIdx);
    if (charIdx === current.length) {
      deleting = true;
      setTimeout(typeRole, 1800);
      return;
    }
  } else {
    typedEl.textContent = current.slice(0, --charIdx);
    if (charIdx === 0) {
      deleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
    }
  }
  setTimeout(typeRole, deleting ? 50 : 80);
}
typeRole();

// ============================================================
// COUNTER ANIMATION (Stats)
// ============================================================
function animateCounters() {
  $$('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.target);
    let current = 0;
    const step = Math.ceil(target / 40);
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(interval);
    }, 50);
  });
}

// ============================================================
// HERO 3D CARD – tilt on mouse move
// ============================================================
const heroCard = $('#hero3DCard');
if (heroCard) {
  const cardInner = heroCard.querySelector('.card-inner');
  heroCard.addEventListener('mousemove', e => {
    const rect = heroCard.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rx = ((e.clientY - cy) / (rect.height / 2)) * -12;
    const ry = ((e.clientX - cx) / (rect.width / 2)) * 12;
    cardInner.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  heroCard.addEventListener('mouseleave', () => {
    cardInner.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
  });
}

// ============================================================
// THREE.JS – HERO CANVAS (Particle Field)
// ============================================================
function initHeroCanvas() {
  const canvas = $('#heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#7c3aed', '#4f46e5', '#a78bfa', '#818cf8', '#6366f1'];

  class Particle {
    constructor() { this.reset(); }

    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.size = Math.random() * 2 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = Math.random() * 0.6 + 0.1;
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      this.pulseOffset = Math.random() * Math.PI * 2;
    }

    update(t) {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
      this.currentAlpha = this.alpha * (0.5 + 0.5 * Math.sin(t * this.pulseSpeed + this.pulseOffset));
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.currentAlpha;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < 180; i++) particles.push(new Particle());

  let mousePos = { x: -9999, y: -9999 };
  document.addEventListener('mousemove', e => { mousePos.x = e.clientX; mousePos.y = e.clientY; });

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.save();
          ctx.globalAlpha = (1 - dist / 100) * 0.15;
          ctx.strokeStyle = '#7c3aed';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    particles.forEach(p => { p.update(t); p.draw(); });

    // Mouse repulsion glow
    ctx.save();
    const grd = ctx.createRadialGradient(mousePos.x, mousePos.y, 0, mousePos.x, mousePos.y, 120);
    grd.addColorStop(0, 'rgba(124, 58, 237, 0.06)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    t++;
  }

  animate();
}

initHeroCanvas();

// ============================================================
// CONTACT CANVAS (Waving Grid)
// ============================================================
function initContactCanvas() {
  const canvas = $('#contactCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  let t = 0;
  const COLS = 20, ROWS = 10;

  function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, W, H);

    const cw = W / COLS;
    const ch = H / ROWS;

    for (let r = 0; r <= ROWS; r++) {
      for (let c = 0; c <= COLS; c++) {
        const x = c * cw;
        const y = r * ch + Math.sin((c * 0.5 + t * 0.02)) * 20;

        ctx.save();
        const alpha = 0.08 + 0.06 * Math.sin(c * 0.4 + t * 0.03);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#7c3aed';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#7c3aed';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (c < COLS) {
          const nx = (c + 1) * cw;
          const ny = r * ch + Math.sin(((c + 1) * 0.5 + t * 0.02)) * 20;
          ctx.save();
          ctx.globalAlpha = 0.05;
          ctx.strokeStyle = '#4f46e5';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(nx, ny);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    t++;
  }

  draw();
}

initContactCanvas();

// ============================================================
// INTERSECTION OBSERVER – Scroll Reveal
// ============================================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

// Reveal general elements
$$('.reveal').forEach(el => revealObserver.observe(el));

// Timeline items
$$('.timeline-item').forEach(el => revealObserver.observe(el));

// Skill bars – animate fill on scroll
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      const fill = entry.target.querySelector('.bar-fill');
      if (fill) {
        setTimeout(() => {
          fill.style.width = fill.dataset.width + '%';
        }, 200);
      }
    }
  });
}, { threshold: 0.3 });

$$('.skill-bar-item').forEach(el => barObserver.observe(el));

// Stats counter trigger
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.5 });

const heroStats = $('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// ============================================================
// PROJECT FILTER
// ============================================================
$$('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    $$('.project-card').forEach(card => {
      const cats = card.dataset.category || '';
      if (filter === 'all' || cats.includes(filter)) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// ============================================================
// ABOUT 3D SCENE TILT
// ============================================================
const about3DScene = $('#about3DScene');
if (about3DScene) {
  about3DScene.addEventListener('mousemove', e => {
    const rect = about3DScene.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rx = ((e.clientY - cy) / (rect.height / 2)) * -8;
    const ry = ((e.clientX - cx) / (rect.width / 2)) * 8;
    about3DScene.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  about3DScene.addEventListener('mouseleave', () => {
    about3DScene.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
  });
}

// ============================================================
// CONTACT FORM SUBMIT
// ============================================================
const contactForm = $('#contactForm');
const formSuccess = $('#formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = $('#formSubmitBtn');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sending...';

    setTimeout(() => {
      contactForm.reset();
      formSuccess.style.display = 'block';
      btn.disabled = false;
      btn.querySelector('span').textContent = 'Send Message';
      setTimeout(() => { formSuccess.style.display = 'none'; }, 5000);
    }, 1500);
  });
}

// ============================================================
// SMOOTH ANCHOR SCROLLING
// ============================================================
$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = $(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ============================================================
// GLOWING CURSOR TRAIL (extra flair)
// ============================================================
const trailDots = [];
const DOT_COUNT = 8;
for (let i = 0; i < DOT_COUNT; i++) {
  const dot = document.createElement('div');
  dot.style.cssText = `
    position: fixed;
    width: ${6 - i * 0.5}px;
    height: ${6 - i * 0.5}px;
    background: rgba(124, 58, 237, ${0.4 - i * 0.04});
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    transform: translate(-50%, -50%);
    transition: left ${0.06 + i * 0.015}s ease, top ${0.06 + i * 0.015}s ease;
  `;
  document.body.appendChild(dot);
  trailDots.push(dot);
}

document.addEventListener('mousemove', e => {
  trailDots.forEach(dot => {
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
  });
});

// ============================================================
// PAGE LOAD COMPLETE
// ============================================================
window.addEventListener('load', () => {
  document.body.style.opacity = '1';
  console.log('%c⚡ Portfolio Loaded – Sifan Ajmal', 'color: #a78bfa; font-size: 16px; font-weight: bold;');
});
