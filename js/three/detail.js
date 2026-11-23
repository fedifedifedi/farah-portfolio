// Vue détaillée d'un projet, directement dans la scène 3D :
// grande image, autres photos cliquables, description, bouton fermer.
// Elle apparaît devant la caméra et se ferme au clic sur « Fermer », sur le fond, avec Échap ou en faisant défiler.
import * as THREE from 'three';
import { projects } from '../projects.js';

const INK = '#2b1b3d';
const CORAL = '#c94f92';
const DISPLAY = 'Fraunces, Georgia, serif';
const SANS = '"DM Sans", system-ui, sans-serif';
const DIM = '#ece4e8'; // teinte légère : les images blanches ne déclenchent pas l'effet de lueur

function wrap(ctx, str, maxWidth) {
  const lines = [];
  let line = '';
  for (const word of String(str || '').split(/\s+/)) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/** Panneau de texte : catégorie, titre, contexte, objectif, outils */
function textTexture(p) {
  const W = 1000, H = 1100;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = '#fbf1f6';
  g.beginPath(); g.roundRect(0, 0, W, H, 48); g.fill();
  const pad = 70;
  let y = 110;
  g.direction = 'inherit';
  g.fillStyle = CORAL; g.font = `700 30px ${SANS}`;
  g.fillText([p.categorie, p.annee].filter(Boolean).join(' · ').toUpperCase(), pad, y);
  y += 80;
  g.fillStyle = INK; g.font = `400 64px ${DISPLAY}`;
  for (const l of wrap(g, p.titre, W - pad * 2)) { g.fillText(l, pad, y); y += 74; }
  const block = (title, body) => {
    if (!body) return;
    y += 36;
    g.fillStyle = '#7a6a86'; g.font = `700 26px ${SANS}`;
    g.fillText(title, pad, y);
    y += 50;
    g.fillStyle = '#4a3a5a'; g.font = `400 33px ${SANS}`;
    for (const l of wrap(g, body, W - pad * 2)) { g.fillText(l, pad, y); y += 46; }
  };
  block('CONTEXTE', p.contexte);
  block('OBJECTIF', p.objectif);
  y += 40;
  g.font = `600 28px ${SANS}`;
  let x = pad;
  for (const tool of p.outils || []) {
    const w = g.measureText(tool).width + 44;
    if (x + w > W - pad) { x = pad; y += 64; }
    g.fillStyle = '#f4c6dd'; g.beginPath(); g.roundRect(x, y - 38, w, 54, 27); g.fill();
    g.fillStyle = '#8a2e62'; g.fillText(tool, x + 22, y - 2);
    x += w + 14;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function arrowTexture(label) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(43, 27, 61, .85)'; g.beginPath(); g.arc(64, 64, 62, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#f3e3ec'; g.font = `600 70px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(label, 64, 60);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function linkTexture() {
  const c = document.createElement('canvas');
  c.width = 520; c.height = 120;
  const g = c.getContext('2d');
  g.fillStyle = CORAL; g.beginPath(); g.roundRect(0, 0, 520, 120, 60); g.fill();
  g.fillStyle = '#fbeef5'; g.font = `600 44px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('Voir l’original  ↗', 260, 62);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function closeTexture() {
  const c = document.createElement('canvas');
  c.width = 320; c.height = 120;
  const g = c.getContext('2d');
  g.fillStyle = INK; g.beginPath(); g.roundRect(0, 0, 320, 120, 60); g.fill();
  g.fillStyle = '#f3e3ec'; g.font = `600 46px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('✕  Fermer', 160, 62);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createDetail(scene) {
  const loader = new THREE.TextureLoader();
  const group = new THREE.Group();
  group.visible = false;
  scene.add(group);

  // Tout s'affiche au premier plan, sans être caché par les nuages ou les bâtiments
  const overlay = (mat, order) => { mat.depthTest = false; mat.depthWrite = false; mat.transparent = true; return order; };
  const mesh = (geo, mat, order) => { const m = new THREE.Mesh(geo, mat); overlay(mat); m.renderOrder = order; return m; };

  const backdrop = mesh(new THREE.PlaneGeometry(40, 30), new THREE.MeshBasicMaterial({ color: '#2b1b3d', opacity: 0 }), 1000);
  backdrop.userData.close = true;
  const mainMat = new THREE.MeshBasicMaterial({ color: DIM });
  const main = mesh(new THREE.PlaneGeometry(1, 1), mainMat, 1002);
  const mainFrame = mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: '#f4b3da' }), 1001);
  const info = mesh(new THREE.PlaneGeometry(2.6, 2.86), new THREE.MeshBasicMaterial({ color: DIM }), 1001);
  info.position.set(1.75, 0.15, 0);
  const close = mesh(new THREE.PlaneGeometry(0.8, 0.3), new THREE.MeshBasicMaterial({ map: closeTexture() }), 1003);
  close.position.set(2.65, 1.85, 0.01);
  close.userData.close = true;
  const prev = mesh(new THREE.PlaneGeometry(0.42, 0.42), new THREE.MeshBasicMaterial({ map: arrowTexture('‹') }), 1004);
  const next = mesh(new THREE.PlaneGeometry(0.42, 0.42), new THREE.MeshBasicMaterial({ map: arrowTexture('›') }), 1004);
  prev.userData.step = -1;
  next.userData.step = 1;
  main.userData.step = 1; // un clic sur la grande image passe à la photo suivante
  const link = mesh(new THREE.PlaneGeometry(1.3, 0.3), new THREE.MeshBasicMaterial({ map: linkTexture() }), 1003);
  link.position.set(1.75, -1.55, 0.01);
  const thumbs = new THREE.Group();
  group.add(backdrop, mainFrame, main, info, close, thumbs, prev, next, link);
  backdrop.position.z = -0.05;

  let current = -1;
  const dir = new THREE.Vector3();
  let images = [];
  let t0 = 0;
  let shown = 0;
  const clickables = [backdrop, close, main, prev, next, link];

  function setMain(src) {
    loader.load(src, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      mainMat.map?.dispose?.();
      mainMat.map = tex; mainMat.needsUpdate = true;
      const a = tex.image.width / tex.image.height;
      // L'image tient dans un cadre de 3,2 × 2,9
      let h = 2.9, w = h * a;
      if (w > 3.2) { w = 3.2; h = w / a; }
      main.scale.set(w, h, 1);
      main.position.set(-1.55, 0.35, 0.01);
      prev.position.set(-1.55 - w / 2 - 0.3, 0.35, 0.02);
      next.position.set(-1.55 + w / 2 + 0.3, 0.35, 0.02);
      mainFrame.scale.set(w + 0.08, h + 0.08, 1);
      mainFrame.position.set(-1.55, 0.35, 0);
    });
    shown = Math.max(0, images.indexOf(src));
    thumbs.children.forEach((t) => (t.material.opacity = t.userData.src === src ? 1 : 0.55));
  }

  /** item : numéro de projet, ou objet { titre, categorie, annee, contexte, objectif, outils, image, galerie, original } */
  function open(item, camera) {
    const p = typeof item === 'number' ? projects[item] : item;
    if (!p) return;
    current = item;
    link.visible = !!p.original;
    link.userData.url = p.original;
    images = [p.image, ...(p.galerie || [])];
    info.material.map?.dispose?.();
    info.material.map = textTexture(p);
    info.material.needsUpdate = true;

    // Vignettes des autres photos, sous la grande image
    thumbs.clear();
    clickables.length = 6;
    images.forEach((src, i) => {
      const m = mesh(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshBasicMaterial({ color: DIM, opacity: 0.55 }), 1003);
      m.position.set(-1.55 - (images.length - 1) * 0.36 + i * 0.72, -1.55, 0.01);
      m.userData.src = src;
      loader.load(src, (tex) => { tex.colorSpace = THREE.SRGBColorSpace; m.material.map = tex; m.material.needsUpdate = true; });
      thumbs.add(m);
      clickables.push(m);
    });
    thumbs.visible = prev.visible = next.visible = images.length > 1;
    setMain(images[0]);

    // Réduit si l'écran est étroit (téléphone)
    const visibleW = 2 * 4.5 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
    group.userData.scale = Math.min(1, visibleW / 7.4);
    group.visible = true;
    document.body.classList.add('detail-open');
    t0 = performance.now();
  }

  function close_() { group.visible = false; current = -1; document.body.classList.remove('detail-open'); }

  /** Photo précédente / suivante (boucle) */
  function go(step) {
    if (images.length > 1) setMain(images[(shown + step + images.length) % images.length]);
  }

  addEventListener('keydown', (e) => {
    if (!group.visible) return;
    if (e.key === 'Escape') close_();
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
  });

  return {
    isOpen: () => group.visible,
    open,
    close: close_,
    clickables,
    /** Clic sur un élément de la vue : vignette → change l'image, fond ou « Fermer » → ferme */
    handle(obj) {
      if (!obj || obj.userData.close) close_();
      else if (obj.userData.src) setMain(obj.userData.src);
      else if (obj.userData.step) go(obj.userData.step);
      else if (obj.userData.url) window.open(obj.userData.url, '_blank', 'noopener');
    },
    update(camera) {
      if (!group.visible) return;
      // Toujours à 4,5 m devant la caméra, face à elle (même si elle bouge encore un peu)
      camera.getWorldDirection(dir);
      group.position.copy(camera.position).addScaledVector(dir, 4.5);
      group.quaternion.copy(camera.quaternion);
      // Apparition douce
      const k = Math.min(1, (performance.now() - t0) / 450);
      const e = 1 - Math.pow(1 - k, 3);
      group.scale.setScalar(group.userData.scale * (0.92 + 0.08 * e));
      backdrop.material.opacity = 0.82 * e; // fond sombre : la fiche ressort bien
      for (const m of [main, mainFrame, info, close, prev, next, link]) m.material.opacity = e;
    },
  };
}
