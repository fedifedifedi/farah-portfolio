// Avatar de l'accueil : il réagit à la zone où se trouve le curseur (gauche / centre / droite).
//
// Deux modes, choisis automatiquement :
//   A) VIDÉO : si images/avatar-left.mp4, avatar-center.mp4 et avatar-right.mp4 existent,
//      on joue la vidéo de la zone (image d'attente : images/avatar.png).
//   B) PHOTO : sinon, la photo images/avatar.jpg pivote doucement vers le curseur.
// Dans les deux cas, Farah en version dessin animé (js/cartoon.js) sort du cadre et réagit aussi.
import { CARTOON_W, CARTOON_H, cartoonState, drawFarah, blendExpression, loadIllustration, drawPortrait } from './cartoon.js';

// Ce que dit la bulle quand le curseur change de zone
const BUBBLES = { left: 'Par ici ?', center: 'Coucou !', right: 'Et par là ?' };

const PHOTO = 'images/avatar.jpg';
// Position des yeux sur la photo (en pixels de l'image, 765 × 1024) : les iris y suivent le curseur.
// Si tu changes de photo, mets à jour ces valeurs, ou laisse [] pour désactiver l'effet.
//   x, y : centre de l'œil ; rx, ry : demi-largeur et demi-hauteur de l'ouverture ; angle : inclinaison (radians)
const EYES = [
  { x: 362, y: 394, rx: 24, ry: 10, angle: 0.04 },
  { x: 457, y: 399, rx: 22, ry: 10, angle: -0.06 },
];
const EYE_SHIFT = { x: 7, y: 2.5 }; // déplacement maximal des iris (pixels de l'image)
const VIDEOS = {
  left: 'images/avatar-left.mp4',
  center: 'images/avatar-center.mp4',
  right: 'images/avatar-right.mp4',
};
const POSTER = 'images/avatar.png';

const IDLE_DELAY = 4000;                                  // ms sans mouvement avant le retour au centre
const AUTO_CYCLE = ['center', 'left', 'center', 'right']; // animation automatique sur mobile
const AUTO_STEP = 3200;                                   // durée de chaque pose (ms)
const FADE = 200;                                         // fondu entre deux vidéos (ms)
const LOOK_X = { left: -1, center: 0, right: 1 };

const clamp = (v, a = -1, b = 1) => Math.min(b, Math.max(a, v));
// Zones : gauche 0–35 %, centre 35–65 %, droite 65–100 % de la largeur de la page
const zoneFromX = (x) => { const r = x / innerWidth; return r < 0.35 ? 'left' : r < 0.65 ? 'center' : 'right'; };

// Ressort amorti : la valeur dépasse un peu sa cible puis s'y pose (rendu plus vivant qu'un glissement)
const spring = (stiffness, damping) => ({ x: 0, y: 0, vx: 0, vy: 0, stiffness, damping });
function step(s, tx, ty, dt) {
  // Petits pas de calcul (1/120 s) : le ressort reste stable même si une image prend du retard
  const n = Math.ceil(dt * 120);
  const h = dt / n;
  for (let i = 0; i < n; i++) {
    s.vx += ((tx - s.x) * s.stiffness - s.vx * s.damping) * h;
    s.vy += ((ty - s.y) * s.stiffness - s.vy * s.damping) * h;
    s.x += s.vx * h;
    s.y += s.vy * h;
  }
}

/** Farah en dessin animé, dans un canvas qui déborde du cadre de la photo */
function createCartoonAvatar(root, { reducedMotion = false } = {}) {
  const canvas = root.querySelector('.avatar__cartoon canvas');
  const bubble = root.querySelector('.avatar__bubble');
  const ctx = canvas.getContext('2d');
  const fit = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
  };
  new ResizeObserver(fit).observe(canvas);

  const s = cartoonState();
  const gaze = spring(180, 14);
  const tilt = spring(60, 8);
  let lastZone = null;
  let waveUntil = 0;
  let bubbleTimer = 0;
  let nextBlink = performance.now() + 1500;
  let blinkStart = -Infinity;
  // Illustration de Farah (images/farah-illustration-1.jpg) : remplace le dessin si elle existe
  let portrait = null;
  loadIllustration('accueil').then((p) => { portrait = p; });

  return {
    frame(now, dt, zone, look) {
      if (!canvas.width) return;
      if (zone !== lastZone) {
        if (lastZone !== null) {
          bubble.textContent = BUBBLES[zone];
          bubble.classList.add('is-on');
          clearTimeout(bubbleTimer);
          bubbleTimer = setTimeout(() => bubble.classList.remove('is-on'), 1600);
          if (zone === 'center') waveUntil = now + 1400;
        }
        lastZone = zone;
      }
      step(gaze, look.x, look.y, dt);
      step(tilt, ({ left: -1, center: 0, right: 1 })[zone] * 0.1 + look.x * 0.05, 0, dt);
      blendExpression(s.expr, zone, 1 - Math.exp(-dt * 8));

      if (!reducedMotion && now >= nextBlink) { blinkStart = now; nextBlink = now + 2500 + Math.random() * 3500; }
      const b = (now - blinkStart) / 160;
      s.blink = b < 1 ? 1 - Math.abs(1 - 2 * b) : 0;
      s.gx = Math.max(-1.1, Math.min(1.1, gaze.x));
      s.gy = Math.max(-1.1, Math.min(1.1, gaze.y));
      s.tilt = tilt.x;
      s.t = now / 1000;
      s.bob = reducedMotion ? 0 : Math.sin(now / 520) * 9 - 6; // elle vole comme une Super Nana
      s.wave += ((now < waveUntil ? 1 : 0) - s.wave) * (1 - Math.exp(-dt * 10));

      ctx.setTransform(canvas.width / CARTOON_W, 0, 0, canvas.height / CARTOON_H, 0, 0);
      ctx.clearRect(0, 0, CARTOON_W, CARTOON_H);
      if (portrait) drawPortrait(ctx, portrait, s);
      else drawFarah(ctx, s);
    },
  };
}

/** Les 3 vidéos existent-elles ? Si oui, on les télécharge et on renvoie leurs adresses en mémoire. */
async function loadVideos() {
  try {
    const heads = await Promise.all(Object.values(VIDEOS).map((url) => fetch(url, { method: 'HEAD' })));
    if (!heads.every((r) => r.ok)) return null;
    // Téléchargées en entier puis lues depuis la mémoire : lecture immédiate à chaque changement de zone
    const entries = await Promise.all(
      Object.entries(VIDEOS).map(async ([zone, url]) => {
        const r = await fetch(url);
        if (!r.ok) throw new Error(url);
        return [zone, URL.createObjectURL(await r.blob())];
      })
    );
    return Object.fromEntries(entries);
  } catch {
    return null; // fichier absent, ou page ouverte sans serveur
  }
}

function createPhotoAvatar(stage, { reducedMotion = false } = {}) {
  stage.replaceChildren();
  // La photo est dessinée sur un canvas pour pouvoir déplacer les iris
  const canvas = Object.assign(document.createElement('canvas'), { className: 'avatar__photo' });
  stage.append(canvas);
  const ctx = canvas.getContext('2d');
  const img = new Image();
  let loaded = false;
  img.onload = () => { canvas.width = img.naturalWidth; canvas.height = img.naturalHeight; loaded = true; drawn = null; };
  img.src = PHOTO;

  // Un petit canvas par œil : la photo décalée, découpée par un ovale aux bords adoucis
  const eyes = EYES.map((e) => {
    const c = document.createElement('canvas');
    c.width = c.height = Math.ceil(e.rx + 10) * 2;
    return { ...e, c, g: c.getContext('2d'), r: c.width / 2 };
  });

  const cur = spring(70, 9);     // inclinaison de la photo
  const gaze = spring(160, 15);  // regard
  let lastZone = 'center';
  let pulse = 0;
  let drawn = null;

  function draw() {
    ctx.drawImage(img, 0, 0);
    const lim = (v) => Math.max(-1.1, Math.min(1.1, v)); // le ressort peut dépasser un peu, pas trop
    const dx = lim(gaze.x) * EYE_SHIFT.x;
    const dy = lim(gaze.y) * EYE_SHIFT.y;
    for (const e of eyes) {
      const { g, r } = e;
      g.globalCompositeOperation = 'source-over';
      g.clearRect(0, 0, r * 2, r * 2);
      g.drawImage(img, r - e.x + dx, r - e.y + dy);
      g.globalCompositeOperation = 'destination-in';
      g.save();
      g.translate(r, r);
      g.rotate(e.angle);
      g.scale(1, e.ry / e.rx);
      const mask = g.createRadialGradient(0, 0, 0, 0, 0, e.rx);
      mask.addColorStop(0, 'rgba(0,0,0,1)');
      mask.addColorStop(0.6, 'rgba(0,0,0,1)');
      mask.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = mask;
      g.fillRect(-e.rx, -e.rx, e.rx * 2, e.rx * 2);
      g.restore();
      ctx.drawImage(e.c, e.x - r, e.y - r);
    }
  }

  return {
    mode: 'photo',
    setZone() {},
    frame(now, dt, zone, look) {
      // La photo se tourne vers la zone active, et suit aussi le curseur à l'intérieur de la zone
      step(cur, LOOK_X[zone] * 0.6 + look.x * 0.4, look.y, dt);
      if (zone !== lastZone) { pulse = 1; lastZone = zone; } // petit « rebond » à chaque changement de zone
      pulse = Math.max(0, pulse - dt * 2.5);

      const float = reducedMotion ? 0 : Math.sin(now / 900);         // flottement doux
      const sway = reducedMotion ? 0 : Math.sin(now / 1700) * 1.2;    // léger balancement
      const bump = Math.sin(pulse * Math.PI) * 0.04;
      stage.style.transform =
        `perspective(800px) translateY(${(float * 6).toFixed(1)}px) ` +
        `rotateY(${(cur.x * 20).toFixed(2)}deg) rotateX(${(-cur.y * 7).toFixed(2)}deg) rotateZ(${(cur.x * 3 + sway).toFixed(2)}deg) ` +
        `scale(${(1 + bump).toFixed(3)})`;
      canvas.style.transform = `scale(1.1) translate(${(cur.x * -3.5).toFixed(2)}%, ${(cur.y * -2.5).toFixed(2)}%)`;

      // Les iris suivent le curseur en continu
      step(gaze, look.x, look.y, dt);
      const key = `${gaze.x.toFixed(2)},${gaze.y.toFixed(2)}`;
      if (loaded && key !== drawn) { draw(); drawn = key; }
    },
  };
}

function createVideoAvatar(stage, urls) {
  stage.style.transform = '';
  stage.replaceChildren();
  const poster = Object.assign(new Image(), { src: POSTER, alt: '', className: 'avatar__poster' });
  poster.onerror = () => poster.remove();
  stage.append(poster);

  const videos = {};
  for (const [zone, src] of Object.entries(urls)) {
    const v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.disablePictureInPicture = true;
    v.tabIndex = -1;
    v.className = 'avatar__video';
    v.src = src;
    stage.append(v);
    videos[zone] = v;
  }

  let active = null;
  let timer = 0;
  return {
    mode: 'video',
    /** Joue la vidéo de la zone depuis le début, une fois ; elle reste ensuite sur sa dernière image */
    setZone(zone) {
      const next = videos[zone];
      const prev = active;
      clearTimeout(timer);
      for (const v of Object.values(videos)) v.classList.remove('is-prev');
      if (prev && prev !== next) {
        // L'ancienne reste visible dessous pendant que la nouvelle apparaît en fondu
        prev.classList.remove('is-active');
        prev.classList.add('is-prev');
        timer = setTimeout(() => { prev.classList.remove('is-prev'); prev.pause(); }, FADE);
      }
      next.currentTime = 0;
      next.classList.add('is-active');
      next.play().catch(() => {});
      active = next;
    },
    frame() {},
  };
}

export function initAvatar(root) {
  const stage = root.querySelector('.avatar__frame');
  const buttons = [...root.querySelectorAll('[data-zone]')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = matchMedia('(hover: none), (pointer: coarse)').matches;

  let renderer = null;
  let zone = 'center';
  const look = { x: 0, y: 0 };   // direction du regard, de -1 à 1
  let lastInput = performance.now() - IDLE_DELAY;
  let touching = false;
  let visible = false;
  let enabled = true;
  let raf = 0;
  let last = performance.now();

  function setZone(next, { replay = false } = {}) {
    if (next === zone && !replay) return;
    zone = next;
    for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.zone === zone));
    root.dataset.zone = zone;
    renderer?.setZone(zone);
  }

  function pointAt(x, y) {
    const r = stage.getBoundingClientRect();
    look.x = clamp((x - (r.left + r.width / 2)) / (innerWidth * 0.45));
    look.y = clamp((y - (r.top + r.height / 2)) / (innerHeight * 0.45));
    lastInput = performance.now();
    setZone(zoneFromX(x));
  }

  addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') pointAt(e.clientX, e.clientY); }, { passive: true });
  addEventListener('touchstart', (e) => { touching = true; pointAt(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  addEventListener('touchmove', (e) => pointAt(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  addEventListener('touchend', () => { touching = false; lastInput = performance.now(); }, { passive: true });

  for (const b of buttons) {
    b.addEventListener('click', () => {
      look.x = LOOK_X[b.dataset.zone];
      look.y = 0;
      lastInput = performance.now();
      setZone(b.dataset.zone, { replay: true });
    });
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;

    const idleFor = now - lastInput - IDLE_DELAY;
    if (!touching && idleFor > 0) {
      // Mobile sans interaction : centre → gauche → centre → droite, lentement. Ordinateur : retour au centre.
      const auto = isTouchDevice && !reducedMotion;
      const z = auto ? AUTO_CYCLE[Math.floor(idleFor / AUTO_STEP) % AUTO_CYCLE.length] : 'center';
      look.x = LOOK_X[z];
      look.y = 0;
      setZone(z);
    }
    renderer?.frame(now, dt, zone, look);
    cartoon.frame(now, dt, zone, look);
  }

  const update = () => {
    const run = visible && enabled && !document.hidden;
    if (run && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
  };
  // La boucle ne tourne que si l'avatar est à l'écran
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }).observe(root);
  document.addEventListener('visibilitychange', update);

  // Choix du mode : la photo s'affiche tout de suite, les vidéos la remplacent si elles existent
  const cartoon = createCartoonAvatar(root, { reducedMotion });
  renderer = createPhotoAvatar(stage, { reducedMotion });
  root.dataset.mode = renderer.mode;
  loadVideos().then((urls) => {
    if (!urls) return;
    renderer = createVideoAvatar(stage, urls);
    root.dataset.mode = renderer.mode;
    renderer.setZone(zone);
  });

  return {
    setEnabled(on) { enabled = on; update(); },
  };
}
