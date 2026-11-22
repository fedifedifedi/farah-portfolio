// Paillettes roses qui flottent dans l'air autour de la caméra pendant tout le voyage.
// Elles restent fixes dans le monde (on avance au milieu d'elles) et « bouclent » autour de la caméra,
// si bien qu'il y en a toujours sans en créer des milliers.
import * as THREE from 'three';
import { getDotTexture } from './utils.js';

const BOX = new THREE.Vector3(36, 16, 50); // volume autour de la caméra
const COLORS = ['#ffffff', '#ffd1ea', '#ff9fd2', '#ffe9f6'];

export function createGlitter({ quality = 1 } = {}) {
  const count = Math.round(420 * quality);
  const base = new Float32Array(count * 3);
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    base[i * 3] = Math.random() * BOX.x;
    base[i * 3 + 1] = Math.random() * BOX.y;
    base[i * 3 + 2] = Math.random() * BOX.z;
    c.set(COLORS[i % COLORS.length]);
    col.set([c.r, c.g, c.b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.16, map: getDotTexture(), vertexColors: true, transparent: true, opacity: 0.85,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;

  const wrap = (v, size) => ((v % size) + size) % size;

  return {
    points,
    update(t, camera) {
      const cx = camera.position.x - BOX.x / 2;
      const cy = camera.position.y - 4;
      const cz = camera.position.z - BOX.z / 2;
      for (let i = 0; i < count; i++) {
        const bx = base[i * 3] + Math.sin(t * 0.3 + i) * 0.4;   // dérive lente
        const by = base[i * 3 + 1] + t * 0.25;                    // montée douce
        const bz = base[i * 3 + 2];
        pos[i * 3] = cx + wrap(bx - cx, BOX.x);
        pos[i * 3 + 1] = cy + wrap(by - cy, BOX.y);
        pos[i * 3 + 2] = cz + wrap(bz - cz, BOX.z);
      }
      geo.attributes.position.needsUpdate = true;
      mat.opacity = 0.65 + Math.sin(t * 1.7) * 0.2; // scintillement
    },
  };
}
