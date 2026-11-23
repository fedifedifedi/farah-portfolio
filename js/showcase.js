// Vitrine 3D des projets (version classique) : carrousel en profondeur, en CSS 3D.
// L'affiche du centre est mise en avant, les autres s'inclinent sur les côtés.
// Navigation : glisser (souris / doigt), molette horizontale, flèches, clavier, vignettes.
// Un clic sur l'affiche du centre ouvre la fenêtre détaillée du projet.

const SPRING = 9;        // vitesse de l'animation vers le projet choisi
const VISIBLE = 3;       // nombre d'affiches visibles de chaque côté

// onItem : clic sur l'affiche du centre (par défaut : comme le bouton, ouvre la fiche)
// direct : un clic sur n'importe quel élément l'ouvre aussitôt (sans le ramener d'abord au centre)
export function initShowcase(root, projects, openProject, onItem = openProject, { direct = false } = {}) {
  if (!root || !projects.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = [...root.querySelectorAll('.showcase__item')];
  const thumbs = [...root.querySelectorAll('[data-thumb]')];
  const $ = (k) => root.querySelector(`[data-sc="${k}"]`);
  const info = root.querySelector('.showcase__info');
  const n = projects.length;

  let target = 0;      // projet visé (entier)
  let pos = 0;         // position affichée (décimale, suit la cible en douceur)
  let shown = -1;      // projet dont la fiche est affichée
  let raf = 0;
  let last = 0;
  let tiltX = 0, tiltY = 0, tx = 0, ty = 0;
  const clamp = (v) => Math.max(0, Math.min(n - 1, v));

  // Dimensions qui s'adaptent à l'écran (relues au redimensionnement)
  let gap = 0, depth = 0, angle = 0;
  const measure = () => {
    const w = root.clientWidth;
    gap = w < 640 ? w * 0.36 : Math.min(300, w * 0.2);
    depth = w < 640 ? 180 : 260;
    angle = w < 640 ? 38 : 46;
  };
  measure();
  addEventListener('resize', () => { measure(); kick(); });

  function render() {
    for (let i = 0; i < n; i++) {
      const d = i - pos;
      const a = Math.abs(d);
      const s = Math.sign(d);
      const near = Math.min(a, 1);
      const x = s * (near * gap + Math.max(0, a - 1) * gap * 0.55);
      const z = -near * depth - Math.max(0, a - 1) * depth * 0.35;
      const ry = -s * near * angle;
      const item = items[i];
      const center = a < 0.5;
      // L'affiche du centre s'incline légèrement vers la souris
      const extra = center ? ` rotateX(${(-tiltY * 6 * (1 - a * 2)).toFixed(2)}deg) rotateY(${(tiltX * 8 * (1 - a * 2)).toFixed(2)}deg)` : '';
      item.style.transform = `translate3d(${x.toFixed(1)}px, 0, ${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg)${extra}`;
      item.style.opacity = a > VISIBLE + 0.5 ? 0 : (1 - Math.max(0, a - 1) * 0.22).toFixed(3);
      item.style.zIndex = String(100 - Math.round(a * 10));
      item.style.setProperty('--shade', Math.min(1, a * 0.55).toFixed(3));
      item.classList.toggle('is-active', center);
      item.tabIndex = center ? 0 : -1;
      item.setAttribute('aria-hidden', a > VISIBLE + 0.5 ? 'true' : 'false');
    }
    const current = Math.round(pos);
    if (current !== shown) updateInfo(current);
  }

  function updateInfo(i) {
    shown = i;
    const p = projects[i];
    info.classList.remove('is-in');
    void info.offsetWidth; // relance l'animation d'apparition
    $('num').textContent = String(i + 1).padStart(2, '0');
    $('cat').textContent = [p.categorie, p.annee].filter(Boolean).join(' · ');
    $('title').textContent = p.titre;
    $('text').textContent = p.objectif || p.contexte || '';
    $('tools').replaceChildren(...(p.outils || []).map((o) => Object.assign(document.createElement('li'), { textContent: o })));
    info.classList.add('is-in');
    thumbs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.classList.toggle('is-active', k === i); });
    // On fait défiler uniquement la rangée de vignettes (scrollIntoView ferait aussi défiler la page)
    const strip = thumbs[i]?.parentElement;
    if (strip && strip.scrollWidth > strip.clientWidth) {
      const left = thumbs[i].offsetLeft - strip.offsetLeft - (strip.clientWidth - thumbs[i].clientWidth) / 2;
      strip.scrollTo({ left, behavior: reduce ? 'auto' : 'smooth' });
    }
    $('prev').disabled = i === 0;
    $('next').disabled = i === n - 1;
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    const k = reduce ? 1 : 1 - Math.exp(-dt * SPRING);
    if (!dragging) pos += (target - pos) * k;
    tiltX += (tx - tiltX) * (1 - Math.exp(-dt * 8));
    tiltY += (ty - tiltY) * (1 - Math.exp(-dt * 8));
    render();
    const moving = Math.abs(target - pos) > 0.0005 || Math.abs(tx - tiltX) + Math.abs(ty - tiltY) > 0.002 || dragging;
    if (moving) raf = requestAnimationFrame(frame);
    else { pos = dragging ? pos : target; render(); raf = 0; }
  }
  function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  const go = (i) => { target = clamp(i); kick(); };

  // ---------- Glisser ----------
  const stage = root.querySelector('.showcase__stage');
  let dragging = false, startX = 0, startPos = 0, moved = 0, lastX = 0, velocity = 0, lastT = 0;
  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true; moved = 0; startX = lastX = e.clientX; startPos = pos; velocity = 0; lastT = performance.now();
    stage.setPointerCapture(e.pointerId);
    root.classList.add('is-dragging');
    kick();
  });
  stage.addEventListener('pointermove', (e) => {
    if (dragging) {
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      pos = Math.max(-0.4, Math.min(n - 0.6, startPos - dx / gap));
      const now = performance.now();
      velocity = (e.clientX - lastX) / Math.max(1, now - lastT);
      lastX = e.clientX; lastT = now;
    } else if (e.pointerType === 'mouse') {
      const r = stage.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width * 2 - 1;
      ty = (e.clientY - r.top) / r.height * 2 - 1;
      kick();
    }
  });
  const end = (e) => {
    if (!dragging) return;
    dragging = false;
    root.classList.remove('is-dragging');
    // Lancer : un geste rapide fait avancer d'un ou deux projets
    go(Math.round(pos - velocity * 6));
    if (moved < 6) {
      const item = e.target.closest?.('.showcase__item');
      if (item) {
        const i = Number(item.dataset.index);
        if (direct || (i === Math.round(target) && Math.abs(i - pos) < 0.5)) { go(i); onItem(i); }
        else go(i);
      }
    }
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  stage.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  // Le clic est géré par le geste ci-dessus ; au clavier, Entrée ouvre le projet du centre
  items.forEach((item) => item.addEventListener('click', (e) => {
    if (e.detail === 0) onItem(Number(item.dataset.index));
  }));

  // ---------- Molette horizontale (pavé tactile) ----------
  let wheelAcc = 0, wheelTimer = 0;
  stage.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // le défilement vertical reste celui de la page
    e.preventDefault();
    wheelAcc += e.deltaX;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { wheelAcc = 0; }, 160);
    if (Math.abs(wheelAcc) > 60) { go(target + Math.sign(wheelAcc)); wheelAcc = 0; }
  }, { passive: false });

  // ---------- Boutons, vignettes, clavier ----------
  $('prev').addEventListener('click', () => go(target - 1));
  $('next').addEventListener('click', () => go(target + 1));
  $('open').addEventListener('click', () => openProject(Math.round(target)));
  thumbs.forEach((t) => t.addEventListener('click', () => go(Number(t.dataset.thumb))));
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(target - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(target + 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(n - 1); }
  });

  render();
}
