// Farah dans le monde 3D : le même dessin façon « Super Nanas » que sur l'accueil (js/cartoon.js),
// affiché sur un sprite toujours tourné vers la caméra. On voit donc son visage pendant tout le voyage.
// Elle marche au sol, vole dans le ciel avec une traînée rose, suit la souris du regard
// et fait coucou quand le visiteur arrête de défiler.
import * as THREE from 'three';
import { getDotTexture } from './utils.js';
import { CARTOON_W, CARTOON_H, cartoonState, drawFarah, blendExpression, loadIllustration, drawPortrait } from '../cartoon.js';

const HEIGHT = 2.1;       // taille du personnage (unités 3D)
const REDRAW_FPS = 24;    // le dessin est mis à jour 24 fois par seconde (suffisant, et léger)

export function createCharacter() {
  const root = new THREE.Group(); // position + orientation sur le chemin (sert à la traînée)

  // ---------- Le dessin, rendu dans un canvas utilisé comme texture ----------
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = Math.round((300 * CARTOON_H) / CARTOON_W);
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.scale.set((HEIGHT * CARTOON_W) / CARTOON_H, HEIGHT, 1);
  sprite.center.set(0.5, 0.03); // les pieds au niveau du sol

  const state = cartoonState();
  state.shadow = false; // l'ombre est un disque 3D posé au sol
  // Illustration de Farah (images/farah-illustration-2.jpg) : remplace le dessin si elle existe
  let portrait = null;
  loadIllustration('voyage').then((p) => { portrait = p; });

  // Le regard suit la souris
  const mouse = { x: 0, y: 0, zone: 'center' };
  addEventListener('pointermove', (e) => {
    const r = e.clientX / innerWidth;
    mouse.x = r * 2 - 1;
    mouse.y = (e.clientY / innerHeight) * 2 - 1;
    mouse.zone = r < 0.35 ? 'left' : r < 0.65 ? 'center' : 'right';
  }, { passive: true });

  // ---------- Ombre douce au sol ----------
  // Ombre floue (dégradé radial) plutôt qu'un disque net
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 1.6).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: '#5a2c4f', map: getDotTexture(), transparent: true, opacity: 0.32, depthWrite: false })
  );

  // ---------- Traînée rose quand elle vole (comme les Super Nanas) ----------
  const TRAIL = 70;
  const trailPos = new Float32Array(TRAIL * 3);
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
  const trail = new THREE.Points(trailGeo, new THREE.PointsMaterial({ color: '#ee5fa7', map: getDotTexture(), size: 0.45, transparent: true, opacity: 0.9, depthWrite: false }));
  trail.frustumCulled = false;
  let trailInit = false;

  const tangent = new THREE.Vector3();
  const tail = new THREE.Vector3();
  let phase = 0;
  let idle = 0;
  let redraw = 0;
  let nextBlink = 2;
  let blinkStart = -10;

  return {
    root,
    extras: [sprite, shadow, trail],
    /**
     * @param path  chemin
     * @param s     distance sur le chemin
     * @param speed vitesse (unités/s)
     */
    update(path, s, speed, t, dt) {
      path.pointAt(s, root.position);
      path.tangentAt(s, tangent);

      const airborne = THREE.MathUtils.smoothstep(root.position.y, 0.5, 3);
      const walking = Math.min(1, speed / 3) * (1 - airborne);

      // Animation du dessin
      phase += Math.min(speed, 12) * dt * 2.2;
      idle = speed < 0.4 ? idle + dt : 0;
      state.walk = Math.sin(phase) * walking;
      state.bob = -Math.abs(Math.sin(phase)) * 8 * walking - airborne * (10 + Math.sin(t * 3) * 8);
      state.wave += ((idle > 1.2 ? 1 : 0) - state.wave) * Math.min(1, dt * 6); // coucou à l'arrêt
      state.t = t;
      state.gx += (mouse.x - state.gx) * Math.min(1, dt * 8);
      state.gy += (mouse.y * 0.6 - state.gy) * Math.min(1, dt * 8);
      blendExpression(state.expr, idle > 1.2 ? 'center' : mouse.zone, Math.min(1, dt * 6));
      if (t > nextBlink) { blinkStart = t; nextBlink = t + 2.5 + Math.random() * 3.5; }
      const b = (t - blinkStart) / 0.16;
      state.blink = b < 1 ? 1 - Math.abs(1 - 2 * b) : 0;

      // Penchée en vol, légèrement balancée en marchant
      sprite.material.rotation = airborne * Math.sin(t * 1.5) * 0.12 + Math.sin(phase) * 0.04 * walking;
      sprite.position.copy(root.position);
      sprite.position.y += airborne * 0.3;

      redraw += dt;
      if (redraw >= 1 / REDRAW_FPS) {
        redraw = 0;
        ctx.setTransform(canvas.width / CARTOON_W, 0, 0, canvas.height / CARTOON_H, 0, 0);
        ctx.clearRect(0, 0, CARTOON_W, CARTOON_H);
        if (portrait) drawPortrait(ctx, portrait, state);
        else drawFarah(ctx, state);
        texture.needsUpdate = true;
      }

      // Ombre (seulement au sol)
      shadow.position.set(root.position.x, 0.05, root.position.z);
      shadow.visible = root.position.y < 1.5;

      // Traînée : on décale les points et on ajoute la position actuelle, un peu derrière elle
      tail.copy(root.position).addScaledVector(tangent, -0.4);
      tail.y += 0.9;
      if (!trailInit) { for (let i = 0; i < TRAIL; i++) trailPos.set([tail.x, tail.y, tail.z], i * 3); trailInit = true; }
      trailPos.copyWithin(3, 0, (TRAIL - 1) * 3);
      trailPos[0] = tail.x + (Math.random() - 0.5) * 0.3;
      trailPos[1] = tail.y + (Math.random() - 0.5) * 0.3;
      trailPos[2] = tail.z + (Math.random() - 0.5) * 0.3;
      trailGeo.attributes.position.needsUpdate = true;
      trail.material.opacity = 0.9 * airborne;
      trail.visible = airborne > 0.01;
    },
  };
}
