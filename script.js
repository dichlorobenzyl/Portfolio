// ============================================
// NAV: scroll state + mobile toggle
// ============================================
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 10);
});

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ============================================
// HERO: coordinate / keypoint skeleton
// A sparse set of nodes connected by lines,
// echoing pose-estimation keypoint graphs.
// ============================================
const svg = document.getElementById('heroPlot');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const NODES = [
  { x: 300, y: 90 },   // head
  { x: 300, y: 190 },  // neck
  { x: 210, y: 250 },  // L shoulder/elbow
  { x: 160, y: 340 },  // L wrist
  { x: 390, y: 250 },  // R shoulder/elbow
  { x: 440, y: 340 },  // R wrist
  { x: 300, y: 340 },  // hip center
  { x: 250, y: 460 },  // L knee
  { x: 230, y: 560 },  // L ankle
  { x: 350, y: 460 },  // R knee
  { x: 370, y: 560 },  // R ankle
];

const EDGES = [
  [0,1],[1,2],[2,3],[1,4],[4,5],[1,6],
  [6,7],[7,8],[6,9],[9,10]
];

const svgns = 'http://www.w3.org/2000/svg';

EDGES.forEach(([a, b], i) => {
  const n1 = NODES[a], n2 = NODES[b];
  const line = document.createElementNS(svgns, 'line');
  line.setAttribute('x1', n1.x);
  line.setAttribute('y1', n1.y);
  line.setAttribute('x2', n2.x);
  line.setAttribute('y2', n2.y);
  line.setAttribute('stroke', '#DCEBE7');
  line.setAttribute('stroke-width', '1.5');
  line.style.strokeDasharray = '400';
  line.style.strokeDashoffset = reduceMotion ? '0' : '400';
  line.style.transition = `stroke-dashoffset 0.9s ease ${0.15 + i * 0.08}s`;
  svg.appendChild(line);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    line.style.strokeDashoffset = '0';
  }));
});

NODES.forEach((n, i) => {
  const dot = document.createElementNS(svgns, 'circle');
  dot.setAttribute('cx', n.x);
  dot.setAttribute('cy', n.y);
  dot.setAttribute('r', i === 0 ? 7 : 5);
  dot.setAttribute('fill', i === 0 ? '#2F6F63' : '#FAFAF8');
  dot.setAttribute('stroke', '#2F6F63');
  dot.setAttribute('stroke-width', '2');
  dot.style.opacity = reduceMotion ? '1' : '0';
  dot.style.transition = `opacity 0.5s ease ${0.4 + i * 0.08}s`;
  svg.appendChild(dot);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    dot.style.opacity = '1';
  }));
});

// gentle ambient drift, paused if reduced motion is preferred
if (!reduceMotion) {
  let t = 0;
  function drift() {
    t += 0.004;
    svg.style.transform = `translateY(${Math.sin(t) * 6}px)`;
    requestAnimationFrame(drift);
  }
  requestAnimationFrame(drift);
}

// ============================================
// SCROLL REVEAL for sections
// ============================================
const revealTargets = document.querySelectorAll(
  '.section-title, .about-body, .skill-card, .timeline-item, .project-card, .contact-links'
);

revealTargets.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

if (reduceMotion) {
  revealTargets.forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
} else {
  revealTargets.forEach(el => observer.observe(el));
}
