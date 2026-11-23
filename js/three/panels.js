// Panneaux 3D (titres dessinés sur des textures canvas), mur des compétences et cadres des projets.
// Les textes viennent de js/content.js et les projets de js/projects.js.
import * as THREE from 'three';
import { content } from '../content.js';
import { projects } from '../projects.js';
import { STAGE_MARKERS } from './path.js';
import { flatMat, getDotTexture } from './utils.js';

const INK = '#2b1b3d';
const CREAM = '#fff6fb';
const CORAL = '#c94f92'; // rose soutenu (accents)
const VIOLET = '#6c4a9e';
const PINK = '#f4b3da';
const DISPLAY = 'Fraunces, Georgia, serif';
const SANS = '"DM Sans", system-ui, sans-serif';
const PX_PER_UNIT = 200;

// ---------- Aides au dessin ----------
function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, { font, color, align = 'center', spacing = 0, maxWidth }) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  if ('letterSpacing' in ctx) ctx.letterSpacing = spacing + 'px';
  ctx.fillText(str, x, y, maxWidth);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
}

/** Panneau plat de taille (largeur × hauteur) en unités 3D */
function sign(width, height, draw, { transparent = true } = {}) {
  const w = Math.min(2048, Math.round(width * PX_PER_UNIT));
  const h = Math.round((w * height) / width);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: canvasTexture(w, h, draw), color: '#e8e0e5', transparent, side: THREE.DoubleSide }) // teinte légère : le blanc ne déclenche pas la lueur
  );
  return mesh;
}

/** Oriente un objet vers un point du chemin situé plus tôt (là d'où arrive la caméra) */
function faceBack(obj, path, s, back = 14, height = 2.4) {
  const target = path.pointAt(Math.max(0, s - back));
  target.y += height;
  obj.lookAt(target);
}

const postMat = flatMat({ color: '#3b2a4a' });
function posts(width, height) {
  const g = new THREE.Group();
  for (const x of [-width * 0.38, width * 0.38]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, height, 6), postMat);
    p.position.set(x, height / 2, -0.05);
    g.add(p);
  }
  return g;
}

export function createPanels(path, world, { manager } = {}) {
  const group = new THREE.Group();
  const skyGroup = new THREE.Group(); // objets du monde des nuages, masqués quand on est encore dans la médina
  group.add(skyGroup);
  const animated = [];
  const sOf = (name) => path.nearestS(STAGE_MARKERS[name]);

  // ============ 1. Accueil : enseigne au-dessus de la porte ============
  {
    const welcome = sign(10, 3.6, (ctx, w, h) => {
      roundRect(ctx, 8, 8, w - 16, h - 16, 48);
      ctx.fillStyle = CREAM;
      ctx.fill();
      ctx.lineWidth = 10;
      ctx.strokeStyle = CORAL;
      roundRect(ctx, 34, 34, w - 68, h - 68, 30);
      ctx.stroke();
      text(ctx, content.bienvenue, w / 2, h * 0.27, { font: `italic 400 ${h * 0.16}px ${DISPLAY}`, color: CORAL });
      text(ctx, content.nom, w / 2, h * 0.6, { font: `900 ${h * 0.24}px ${DISPLAY}`, color: INK, maxWidth: w * 0.84 });
      text(ctx, content.titre.toUpperCase(), w / 2, h * 0.8, { font: `700 ${h * 0.085}px ${SANS}`, color: VIOLET, spacing: 10, maxWidth: w * 0.85 });
    });
    // Accrochée sur la face de la porte tournée vers le visiteur
    welcome.position.set(0, 10.1, -1.4);
    welcome.rotation.y = Math.PI;
    const holder = posts(10, 2.4);
    holder.position.set(0, 7.4, -0.9); // derrière le panneau, plantés dans le haut de la porte
    world.welcomeGate.add(welcome, holder);
  }

  // ============ 2. À propos : panneau sur pied au bord de la rue ============
  {
    const s = sOf('apropos');
    const LIGHT = '#efe0e9'; // texte clair, juste sous le seuil de lueur : reste net
    const about = sign(5.4, 4.6, (ctx, w, h) => {
      roundRect(ctx, 0, 0, w, h, 40);
      ctx.fillStyle = INK;
      ctx.fill();
      const pad = w * 0.08;
      text(ctx, 'À PROPOS', pad, h * 0.12, { font: `700 ${h * 0.045}px ${SANS}`, color: PINK, align: 'left', spacing: 8 });
      text(ctx, 'Design Image', pad, h * 0.25, { font: `900 ${h * 0.1}px ${DISPLAY}`, color: LIGHT, align: 'left' });
      text(ctx, 'spécialité Publicité graphique', pad, h * 0.33, { font: `italic 400 ${h * 0.058}px ${DISPLAY}`, color: LIGHT, align: 'left' });
      // Les lignes du parcours se répartissent dans l'espace disponible, quel que soit leur nombre
      const list = content.apropos.parcours;
      const top = 0.44, bottom = 0.93;
      const step = (bottom - top) / Math.max(1, list.length - 1);
      const size = Math.min(0.05, step * 0.62);
      list.forEach((e, i) => {
        const y = h * (top + i * step);
        const label = e.court || (e.lieu ? e.lieu.split(' · ')[0] : e.titre);
        text(ctx, e.annee, pad, y, { font: `700 ${h * size * 0.9}px ${SANS}`, color: CORAL, align: 'left', maxWidth: w * 0.26 });
        text(ctx, label, pad + w * 0.3, y, { font: `500 ${h * size}px ${SANS}`, color: LIGHT, align: 'left', maxWidth: w * 0.62 });
      });
    });
    const holder = new THREE.Group();
    about.position.y = 3.7;
    holder.add(about, posts(5.4, 1.5));
    path.pointAt(s + 2, holder.position);
    holder.position.add(path.sideAt(s + 2).multiplyScalar(5.6));
    faceBack(holder, path, s + 2, 16, 0);
    group.add(holder);
  }

  // ============ 3. Mur des compétences ============
  {
    const s0 = world.sSkills - 18;
    const s1 = world.sSkills + 20;
    const OFFSET = -5.4; // côté gauche
    const segs = [];
    for (let s = s0; s < s1; s += 2) segs.push(s);
    const wall = new THREE.InstancedMesh(new THREE.BoxGeometry(0.7, 4.6, 2.15), flatMat({ color: '#f9ddd2' }), segs.length);
    const cap = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.35, 2.2), flatMat({ color: '#e2b48e' }), segs.length);
    const d = new THREE.Object3D();
    segs.forEach((s, i) => {
      const p = path.pointAt(s).addScaledVector(path.sideAt(s), OFFSET);
      const t = path.tangentAt(s);
      d.rotation.set(0, Math.atan2(t.x, t.z), 0);
      d.position.set(p.x, 2.3, p.z);
      d.updateMatrix();
      wall.setMatrixAt(i, d.matrix);
      d.position.y = 4.7;
      d.updateMatrix();
      cap.setMatrixAt(i, d.matrix);
    });
    group.add(wall, cap);

    // Les mots : un titre puis les compétences et logiciels, en alternant les styles
    const words = [
      { str: 'Compétences', font: (h) => `900 ${h * 0.78}px ${DISPLAY}`, color: INK, size: 1.5 },
      ...[...content.logiciels, ...content.competences].map((str, i) => ({
        str,
        font: (h) => (i % 2 ? `italic 400 ${h * 0.72}px ${DISPLAY}` : `700 ${h * 0.62}px ${SANS}`),
        color: [CORAL, VIOLET, INK, '#a8467e'][i % 4],
        size: i % 3 === 0 ? 0.95 : 0.75,
      })),
    ];
    const measure = document.createElement('canvas').getContext('2d');
    const span = s1 - s0 - 6;
    words.forEach((wd, i) => {
      const H = 160;
      measure.font = wd.font(H);
      const W = Math.ceil(measure.measureText(wd.str).width + H * 0.4);
      const tex = canvasTexture(W, H, (ctx, w, h) => text(ctx, wd.str, w / 2, h * 0.76, { font: wd.font(h), color: wd.color }));
      const height = wd.size;
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry((height * W) / H, height),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false })
      );
      const s = i === 0 ? s0 + 2 : s0 + 4 + (span * (i - 1)) / (words.length - 1);
      const p = path.pointAt(s).addScaledVector(path.sideAt(s), OFFSET + 0.4);
      const baseY = i === 0 ? 3.2 : i % 2 ? 3.3 : 1.7;
      mesh.position.set(p.x, baseY, p.z);
      // Parallèle au mur, légèrement tourné vers le visiteur pour rester lisible
      const t = path.tangentAt(s);
      mesh.rotation.y = Math.atan2(t.x, t.z) - Math.PI / 2 - 0.55;
      group.add(mesh);
      animated.push({ kind: 'word', mesh, s, baseY });
    });
  }

  // ============ 3 bis. Certificats : chevalets dorés en face du mur des compétences ============
  const certs = [];
  {
    const list = content.certificats || [];
    const certLoader = new THREE.TextureLoader(manager);
    const gold = new THREE.MeshStandardMaterial({ color: '#e7c27a', metalness: 0.75, roughness: 0.3, emissive: '#7a5520', emissiveIntensity: 0.15 });
    const H = 1.8; // hauteur du document
    list.forEach((cert, i) => {
      const s = world.sSkills - 4 + i * 8; // après la porte de la médina, un tous les 8 m
      const holder = new THREE.Group();
      // Chevalet : deux pieds dorés
      for (const x of [-0.45, 0.45]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 2.2, 6), gold);
        leg.position.set(x, 1.05, -0.12);
        leg.rotation.x = -0.12;
        holder.add(leg);
      }
      const board = new THREE.Group();
      board.position.y = 2.05;
      board.rotation.x = -0.1;
      holder.add(board);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.06), gold);
      frame.position.z = -0.04;
      const imgMat = new THREE.MeshBasicMaterial({ color: '#e3dade' }); // papier blanc adouci : pas d'éblouissement
      const img = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), imgMat);
      board.add(frame, img);
      const label = sign(2.2, 0.5, (ctx, w, h) => {
        roundRect(ctx, 0, 0, w, h, 18);
        ctx.fillStyle = '#eddbe5'; // un peu moins clair que la crème : pas d'effet de lueur
        ctx.fill();
        text(ctx, 'CERTIFICAT · ' + cert.date.toUpperCase(), w / 2, h * 0.36, { font: `700 ${h * 0.17}px ${SANS}`, color: CORAL, spacing: 3, maxWidth: w * 0.9 });
        text(ctx, cert.titre, w / 2, h * 0.76, { font: `700 ${h * 0.25}px ${DISPLAY}`, color: INK, maxWidth: w * 0.92 });
      });
      board.add(label);
      const setAspect = (a) => {
        const W = H * a;
        img.scale.set(W, H, 1);
        frame.scale.set(W + 0.12, H + 0.12, 1);
        label.position.y = -H / 2 - 0.35;
      };
      setAspect(4 / 3);
      certLoader.load(cert.image, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        imgMat.map = tex;
        imgMat.needsUpdate = true;
        const im = tex.image;
        if (im?.width) setAspect(THREE.MathUtils.clamp(im.width / im.height, 0.6, 1.6));
      });
      path.pointAt(s, holder.position);
      holder.position.addScaledVector(path.sideAt(s), 4.2); // côté droit, face au mur des compétences
      faceBack(holder, path, s, 10, 0);
      [frame, img, label].forEach((m) => (m.userData.certUrl = cert.image));
      group.add(holder);
      certs.push(frame, img, label);
    });
  }

  // ============ 4. Projets : titre flottant + cadres dans les nuages ============
  const frames = [];
  const sProj0 = sOf('projets') - 6;
  const sProj1 = sOf('contact') - 22;
  {
    const title = sign(7, 2.6, (ctx, w, h) => {
      roundRect(ctx, 0, 0, w, h, 50);
      ctx.fillStyle = 'rgba(43, 27, 61, 0.82)';
      ctx.fill();
      text(ctx, 'Projets', w / 2, h * 0.58, { font: `900 ${h * 0.42}px ${DISPLAY}`, color: CREAM });
      text(ctx, 'CLIQUEZ SUR UN CADRE POUR L’OUVRIR', w / 2, h * 0.82, { font: `700 ${h * 0.075}px ${SANS}`, color: PINK, spacing: 6 });
    });
    const s = sProj0 - 17; // bien avant la première affiche : un vrai espace entre le titre et les projets
    path.pointAt(s, title.position);
    title.position.y += 4.8;
    faceBack(title, path, s, 16, 2);
    skyGroup.add(title);
    animated.push({ kind: 'float', obj: title, baseY: title.position.y, phase: 0 });
  }

  // Chaque projet est exposé comme une œuvre : affiche épaisse sur un socle flottant,
  // contour néon rose, halo lumineux, paillettes qui tournent autour, légère oscillation.
  const loader = new THREE.TextureLoader(manager);
  const glowTex = getDotTexture();
  const pearl = new THREE.MeshStandardMaterial({ color: '#fbd3e6', roughness: 0.28, metalness: 0.35, emissive: '#f39bc8', emissiveIntensity: 0.18 });
  const neonMat = new THREE.MeshBasicMaterial({ color: '#ff8fd0' });
  const glowMat = (color, opacity) => new THREE.MeshBasicMaterial({ color, map: glowTex, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending });
  projects.forEach((proj, i) => {
    // Un projet tous les 24 m environ (resserré si la liste est longue)
    const gap = projects.length > 1 ? Math.min(24, (sProj1 - sProj0) / (projects.length - 1)) : 0;
    const s = sProj0 + gap * i;
    const side = i % 2 ? -1 : 1;
    const H = 4.6; // grandes affiches : ce sont les vraies stars du portfolio
    const D = 0.14; // épaisseur de l'affiche

    const frame = new THREE.Group();   // position dans le monde (flotte)
    const poster = new THREE.Group();  // affiche + néon (oscille doucement)
    frame.add(poster);

    // Halo rose derrière l'affiche
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glowMat('#ff7fc4', 0.55));
    halo.position.z = -0.25;
    poster.add(halo);
    // Affiche épaisse : tranches nacrées, image sur la face avant
    const body = new THREE.Mesh(new THREE.BoxGeometry(1, 1, D), pearl);
    body.position.z = -D / 2;
    const imgMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    const img = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), imgMat);
    img.position.z = 0.002;
    poster.add(body, img);
    // Contour néon (4 baguettes lumineuses)
    const neon = [0, 1, 2, 3].map(() => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.05), neonMat);
      poster.add(m);
      return m;
    });

    // Socle flottant sous l'affiche, avec anneau lumineux et lueur au sol
    const base = new THREE.Group();
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.55, 0.28, 40), pearl);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.035, 8, 64).rotateX(Math.PI / 2), neonMat);
    ring.position.y = -0.14;
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 5.5).rotateX(-Math.PI / 2), glowMat('#ff8cc8', 0.6));
    pool.position.y = -0.2;
    base.add(plinth, ring, pool);
    frame.add(base);

    // Paillettes qui tournent autour de l'œuvre
    const N = 26;
    const sp = new Float32Array(N * 3);
    for (let k = 0; k < N; k++) {
      const a = (k / N) * Math.PI * 2;
      const r = 2.6 + Math.random() * 0.9;
      sp.set([Math.cos(a) * r, (Math.random() - 0.5) * H * 1.1, Math.sin(a) * r * 0.5], k * 3);
    }
    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    const sparkles = new THREE.Points(sparkGeo, new THREE.PointsMaterial({
      color: '#fff0fa', map: glowTex, size: 0.32, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    frame.add(sparkles);

    // Étiquette : numéro, catégorie, titre
    const label = sign(3.8, 0.95, (ctx, w, h) => {
      roundRect(ctx, 0, 0, w, h, 30);
      ctx.fillStyle = CREAM;
      ctx.fill();
      text(ctx, String(i + 1).padStart(2, '0'), w * 0.1, h * 0.66, { font: `400 ${h * 0.42}px ${DISPLAY}`, color: CORAL, align: 'left' });
      text(ctx, (proj.categorie || '').toUpperCase(), w * 0.27, h * 0.38, { font: `700 ${h * 0.13}px ${SANS}`, color: CORAL, align: 'left', spacing: 4, maxWidth: w * 0.68 });
      text(ctx, proj.titre, w * 0.27, h * 0.72, { font: `700 ${h * 0.24}px ${DISPLAY}`, color: INK, align: 'left', maxWidth: w * 0.68 });
    });
    label.position.z = 0.3;
    frame.add(label);

    const setAspect = (aspect) => {
      const W = H * aspect;
      img.scale.set(W, H, 1);
      body.scale.set(W + 0.12, H + 0.12, 1);
      halo.scale.set(W * 2.1, H * 1.7, 1);
      const t = 0.05;
      neon[0].scale.set(W + 0.3, t, 1); neon[0].position.set(0, H / 2 + 0.13, 0.01);
      neon[1].scale.set(W + 0.3, t, 1); neon[1].position.set(0, -H / 2 - 0.13, 0.01);
      neon[2].scale.set(t, H + 0.3, 1); neon[2].position.set(-W / 2 - 0.13, 0, 0.01);
      neon[3].scale.set(t, H + 0.3, 1); neon[3].position.set(W / 2 + 0.13, 0, 0.01);
      base.position.y = -H / 2 - 1.9; // sous l'étiquette, sans la couper
      base.scale.setScalar(Math.max(0.85, W / 3.4));
      label.position.y = -H / 2 - 0.72;
    };
    setAspect(0.75);

    loader.load(
      proj.image,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        imgMat.map = tex;
        imgMat.needsUpdate = true;
        const im = tex.image;
        if (im && im.width && im.height) setAspect(THREE.MathUtils.clamp(im.width / im.height, 0.5, 1.8));
      },
      undefined,
      () => { imgMat.color.set(PINK); console.warn('Image introuvable :', proj.image); }
    );

    path.pointAt(s, frame.position);
    frame.position.addScaledVector(path.sideAt(s), side * 5.2);
    frame.position.y += 2.8;
    faceBack(frame, path, s, 8, 2.6); // tourné vers l'endroit où la caméra marque une pause
    skyGroup.add(frame);

    [body, img, label, halo].forEach((m) => (m.userData.projectIndex = i));
    frames.push({ frame, poster, sparkles, index: i, hover: 0, s, side });
    animated.push({ kind: 'float', obj: frame, baseY: frame.position.y, phase: i * 1.7 });
  });

  // ============ 5. Contact : dernier panneau ============
  {
    const contact = sign(8, 4.2, (ctx, w, h) => {
      roundRect(ctx, 0, 0, w, h, 50);
      ctx.fillStyle = INK;
      ctx.fill();
      text(ctx, 'MERCI POUR LA VISITE', w / 2, h * 0.18, { font: `700 ${h * 0.055}px ${SANS}`, color: PINK, spacing: 10 });
      text(ctx, 'Contact', w / 2, h * 0.45, { font: `900 ${h * 0.25}px ${DISPLAY}`, color: CREAM });
      text(ctx, content.contact.email, w / 2, h * 0.65, { font: `italic 400 ${h * 0.085}px ${DISPLAY}`, color: PINK, maxWidth: w * 0.9 });
      text(ctx, 'Stage PFE · design graphique & publicité', w / 2, h * 0.82, { font: `500 ${h * 0.055}px ${SANS}`, color: CREAM, maxWidth: w * 0.9 });
    });
    const end = path.length;
    path.pointAt(end, contact.position).addScaledVector(path.tangentAt(end), 5);
    contact.position.y += 3;
    contact.lookAt(path.pointAt(end - 16).add(new THREE.Vector3(0, 2.6, 0)));
    skyGroup.add(contact);
    animated.push({ kind: 'float', obj: contact, baseY: contact.position.y, phase: 2 });
  }

  // ---------- Animation ----------
  const clickables = [...frames.flatMap((f) => f.frame.children), ...certs];
  return {
    group,
    clickables,
    sProjects: [sProj0, sProj1],
    frameS: frames.map((f) => f.s), // position de chaque projet sur le chemin
    update(t, dt, camS, hoveredIndex, camera) {
      skyGroup.visible = camera.position.y > 6;
      for (const a of animated) {
        if (a.kind === 'float') {
          a.obj.position.y = a.baseY + Math.sin(t * 0.9 + a.phase) * 0.18;
        } else if (a.kind === 'word') {
          // Le mot apparaît quand la caméra s'en approche
          const d = a.s - camS;
          const k = THREE.MathUtils.smoothstep(26 - d, 0, 12);
          a.mesh.material.opacity = k;
          a.mesh.position.y = a.baseY - (1 - k) * 0.8;
          a.mesh.visible = k > 0.001;
        }
      }
      for (const f of frames) {
        const target = f.index === hoveredIndex ? 1 : 0;
        f.hover += (target - f.hover) * Math.min(1, dt * 10);
        f.frame.scale.setScalar(1 + f.hover * 0.08);
        // L'affiche oscille lentement pour montrer son épaisseur (et se stabilise au survol)
        const sway = Math.sin(t * 0.6 + f.index * 1.3) * 0.16 * (1 - f.hover);
        f.poster.rotation.y = sway - f.side * 0.06;
        f.poster.rotation.x = Math.sin(t * 0.45 + f.index) * 0.03 * (1 - f.hover);
        f.sparkles.rotation.y = t * 0.25 + f.index;
        f.sparkles.material.opacity = 0.65 + Math.sin(t * 2.4 + f.index) * 0.3;
      }
    },
  };
}
