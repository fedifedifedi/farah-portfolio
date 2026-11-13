// Petits outils partagés par les modules 3D
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** Générateur aléatoire déterministe : le décor est identique à chaque visite */
export function rng(seed = 1) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fusionne plusieurs géométries colorées en une seule (= un seul appel de dessin).
 * parts : [{ geo, color, position?, rotation?, scale? }]
 */
export function mergeColored(parts) {
  const geos = parts.map(({ geo, color, position, rotation, scale }) => {
    let g = geo.index ? geo.toNonIndexed() : geo.clone();
    const m = new THREE.Matrix4().compose(
      position || new THREE.Vector3(),
      new THREE.Quaternion().setFromEuler(rotation || new THREE.Euler()),
      scale || new THREE.Vector3(1, 1, 1)
    );
    g.applyMatrix4(m);
    g.deleteAttribute('uv');
    const c = new THREE.Color(color);
    const colors = new Float32Array(g.attributes.position.count * 3);
    for (let i = 0; i < colors.length; i += 3) { colors[i] = c.r; colors[i + 1] = c.g; colors[i + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  });
  const merged = mergeGeometries(geos);
  merged.computeVertexNormals();
  return merged;
}

/** Petite texture ronde et douce pour les paillettes (au lieu de carrés) */
let dotTexture = null;
export function getDotTexture() {
  if (dotTexture) return dotTexture;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.8)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  dotTexture = new THREE.CanvasTexture(c);
  return dotTexture;
}

/** Matériau low-poly mat, facettes visibles */
export const flatMat = (opts = {}) => new THREE.MeshLambertMaterial({ flatShading: true, ...opts });
