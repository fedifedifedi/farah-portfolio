// Ciel en dégradé (coucher de soleil → monde doré), soleil, nuages et paillettes
import * as THREE from 'three';
import { rng, getDotTexture } from './utils.js';

const CLOUD_COLORS = ['#fff5fa', '#f9d4e8', '#f4b3da', '#f1c4dd', '#ffe9f3'];

/** Monde des nuages : une mer de nuages sous le chemin + des nuages épars autour */
export function createClouds(path, { quality = 1 } = {}) {
  const group = new THREE.Group();
  const rand = rng(21);
  const puffs = [];

  // Nuage = grappe de 3 à 6 boules
  function cloud(x, y, z, size) {
    const n = 3 + Math.floor(rand() * 4);
    for (let i = 0; i < n; i++) {
      const r = size * (0.5 + rand() * 0.6);
      puffs.push({ x: x + (i - n / 2) * size * 0.7, y: y + rand() * size * 0.35, z: z + (rand() - 0.5) * size, r, sy: 0.7 });
    }
  }

  const tooClose = (x, y, z, r) => {
    const p = new THREE.Vector3(x, y, z);
    const near = path.samples.reduce((m, s) => Math.min(m, s.distanceTo(p)), Infinity);
    return near < r + 3.5;
  };

  // Mer de nuages, que l'on traverse pendant la montée
  const floorCount = Math.round(110 * quality);
  for (let i = 0; i < floorCount; i++) {
    const x = -110 + rand() * 220;
    const z = -150 - rand() * 460;
    const y = 30 + rand() * 6;
    const size = 4 + rand() * 6;
    if (!tooClose(x, y, z, size)) cloud(x, y, z, size);
  }
  // Nuages flottants autour du chemin des projets
  const skyCount = Math.round(70 * quality);
  for (let i = 0; i < skyCount; i++) {
    const x = (rand() < 0.5 ? -1 : 1) * (12 + rand() * 60);
    const z = -170 - rand() * 420;
    const y = 46 + rand() * 30;
    const size = 2 + rand() * 4;
    if (!tooClose(x, y, z, size)) cloud(x, y, z, size);
  }

  const mesh = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.MeshLambertMaterial({ flatShading: true, emissive: '#f7c6df', emissiveIntensity: 0.6 }),
    puffs.length
  );
  const dummy = new THREE.Object3D();
  const c = new THREE.Color();
  puffs.forEach((p, i) => {
    dummy.position.set(p.x, p.y, p.z);
    dummy.rotation.set(rand() * 3, rand() * 3, rand() * 3);
    dummy.scale.set(p.r, p.r * p.sy, p.r);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.setColorAt(i, c.set(CLOUD_COLORS[Math.floor(rand() * CLOUD_COLORS.length)]));
  });
  group.add(mesh);

  // Paillettes dorées qui scintillent dans l'air
  const count = Math.round(500 * quality);
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = -50 + rand() * 100;
    pos[i * 3 + 1] = 36 + rand() * 40;
    pos[i * 3 + 2] = -150 - rand() * 420;
  }
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const sparkles = new THREE.Points(
    sparkGeo,
    new THREE.PointsMaterial({ color: '#fff0f8', map: getDotTexture(), size: 0.45, transparent: true, opacity: 0.9, depthWrite: false })
  );
  group.add(sparkles);

  return {
    group,
    update(t, camera) {
      // Apparition en fondu quand on approche de la mer (évite de les voir surgir)
      const fade = THREE.MathUtils.smoothstep(-camera.position.z, 80, 120);
      group.visible = fade > 0;
      mesh.material.opacity = fade;
      mesh.material.transparent = fade < 1;
      sparkles.material.opacity = 0.55 + Math.sin(t * 2.2) * 0.35;
      sparkles.position.y = Math.sin(t * 0.4) * 0.6;
    },
  };
}

// Deux ambiances roses (#F4B3DA / #F1C4DD) : au sol (coucher de soleil) et dans les nuages
export const MOODS = {
  sunset: { top: '#a8509f', horizon: '#ffc4e3', bottom: '#f4a6d0', fog: '#f7c3df' },
  golden: { top: '#e57fbd', horizon: '#ffd3ea', bottom: '#ffe0ef', fog: '#f6c8e1' },
};

export function createSky() {
  const group = new THREE.Group();
  const c = (hex) => new THREE.Color(hex);

  const uniforms = {
    top1: { value: c(MOODS.sunset.top) }, horizon1: { value: c(MOODS.sunset.horizon) }, bottom1: { value: c(MOODS.sunset.bottom) },
    top2: { value: c(MOODS.golden.top) }, horizon2: { value: c(MOODS.golden.horizon) }, bottom2: { value: c(MOODS.golden.bottom) },
    mood: { value: 0 },
  };
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(420, 32, 16),
    new THREE.ShaderMaterial({
      uniforms,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 top1, horizon1, bottom1, top2, horizon2, bottom2;
        uniform float mood;
        varying vec3 vDir;
        vec3 grad(vec3 top, vec3 horizon, vec3 bottom, float h) {
          return h > 0.0 ? mix(horizon, top, pow(smoothstep(0.0, 0.75, h), 0.8))
                         : mix(horizon, bottom, smoothstep(0.0, -0.35, h));
        }
        void main() {
          float h = vDir.y;
          vec3 col = mix(grad(top1, horizon1, bottom1, h), grad(top2, horizon2, bottom2, h), mood);
          gl_FragColor = vec4(col, 1.0);
          #include <colorspace_fragment>
        }`,
    })
  );
  dome.renderOrder = -10;
  group.add(dome);

  // Soleil bas sur l'horizon, droit devant
  const sunDir = new THREE.Vector3(-0.22, 0.07, -1).normalize();
  const sun = new THREE.Mesh(
    new THREE.CircleGeometry(26, 40),
    new THREE.MeshBasicMaterial({ color: '#fff0f7', fog: false, depthWrite: false })
  );
  const glow = new THREE.Mesh(
    new THREE.CircleGeometry(60, 40),
    new THREE.MeshBasicMaterial({ color: '#ffd6ec', transparent: true, opacity: 0.6, fog: false, depthWrite: false })
  );
  for (const [m, d] of [[glow, 395], [sun, 390]]) {
    m.position.copy(sunDir).multiplyScalar(d);
    m.lookAt(0, 0, 0);
    m.renderOrder = -9;
    group.add(m);
  }

  return {
    group,
    sunDir,
    sun,
    /** Le ciel suit la caméra pour paraître infini */
    update(camera, mood) {
      group.position.copy(camera.position);
      uniforms.mood.value = mood;
    },
  };
}
