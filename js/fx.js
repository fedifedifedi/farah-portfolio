// Petits effets qui rendent le site plus vivant :
//  - étoiles qui scintillent en fond d'accueil
//  - traînée d'étoiles roses derrière le curseur (ordinateur uniquement)
//  - cartes de projets qui s'inclinent vers la souris
// Tout est désactivé si le visiteur a demandé de réduire les animations.

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const COLORS = ['#f4b3da', '#f1c4dd', '#ee5fa7', '#ffffff', '#c94f92'];

function sparkles(container, count = 18) {
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'sparkle';
    s.setAttribute('aria-hidden', 'true');
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.setProperty('--s', 8 + Math.random() * 18 + 'px');
    s.style.setProperty('--c', COLORS[i % COLORS.length]);
    s.style.setProperty('--d', 2.4 + Math.random() * 3 + 's');
    s.style.setProperty('--delay', -Math.random() * 5 + 's');
    container.prepend(s);
  }
}

function cursorTrail() {
  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-trail';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(2, devicePixelRatio || 1);
  const fit = () => { canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; };
  fit();
  addEventListener('resize', fit);

  const parts = [];
  let raf = 0;
  let lx = 0;
  let ly = 0;

  const star = (x, y, r, rot) => {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = rot + (i * Math.PI) / 4;
      const rr = i % 2 ? r * 0.38 : r;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
  };

  function tick() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= 0.022;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.rot += 0.08;
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.c;
      star(p.x, p.y, p.r * (0.5 + p.life * 0.5), p.rot);
    }
    ctx.globalAlpha = 1;
    raf = parts.length ? requestAnimationFrame(tick) : 0; // la boucle s'arrête quand tout a disparu
  }

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const d = Math.hypot(e.clientX - lx, e.clientY - ly);
    if (d < 14) return;
    lx = e.clientX;
    ly = e.clientY;
    parts.push({
      x: lx, y: ly, vx: (Math.random() - 0.5) * 1.2, vy: -Math.random() * 1.2,
      r: 4 + Math.random() * 5, rot: Math.random() * 3, life: 1,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
    });
    if (parts.length > 60) parts.shift();
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
}

function cardTilt() {
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest?.('.c-card');
    document.querySelectorAll('.c-card.is-tilt').forEach((c) => {
      if (c !== card) { c.classList.remove('is-tilt'); c.style.removeProperty('--rx'); c.style.removeProperty('--ry'); }
    });
    if (!card) return;
    const r = card.querySelector('.c-card__img').getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.classList.add('is-tilt');
    card.style.setProperty('--ry', (x * 14).toFixed(1) + 'deg');
    card.style.setProperty('--rx', (-y * 14).toFixed(1) + 'deg');
  }, { passive: true });
}

export function initFx() {
  if (reducedMotion) return;
  const intro = document.getElementById('intro');
  if (intro) sparkles(intro);
  if (finePointer) {
    cursorTrail();
    cardTilt();
  }
}
