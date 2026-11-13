// Expérience 3D : rendu, caméra pilotée par le scroll, boucle d'animation
import * as THREE from 'three';
import { createPath, STAGE_MARKERS } from './path.js';
import { createSky, createClouds, MOODS } from './sky.js';
import { createWorld } from './world.js';
import { createCharacter } from './character.js';
import { createPanels } from './panels.js';
import { createOverlays } from './overlays.js';
import { openProject } from '../modal.js';

const CHAR_AHEAD = 6;   // distance caméra → scooter (le long du chemin)
const LOOK_AHEAD = 9;   // la caméra regarde un peu plus loin que le scooter
const CAM_HEIGHT = 2.6;

export async function createExperience({ onProgress = () => {}, startAt = null } = {}) {
  const canvas = document.getElementById('scene');
  const isMobile = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  const quality = isMobile ? 0.6 : 1;

  // Les panneaux sont dessinés avec les polices du site : on attend qu'elles soient prêtes
  await Promise.race([
    Promise.all(['900 40px Fraunces', 'italic 400 40px Fraunces', '700 40px "DM Sans"', '500 40px "DM Sans"'].map((f) => document.fonts.load(f))),
    new Promise((r) => setTimeout(r, 3000)),
  ]).catch(() => {});
  onProgress(0.15);

  // ---------- Rendu ----------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight, false);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(MOODS.sunset.fog, 20, 120);
  const fogSunset = new THREE.Color(MOODS.sunset.fog);
  const fogGolden = new THREE.Color(MOODS.golden.fog);

  const camera = new THREE.PerspectiveCamera(isMobile ? 68 : 58, innerWidth / innerHeight, 0.1, 900);

  // ---------- Lumières chaudes ----------
  const hemi = new THREE.HemisphereLight('#ffe0ee', '#9a6aa6', 1.9);
  const sunLight = new THREE.DirectionalLight('#ffb3d6', 2.4);
  scene.add(hemi, sunLight, sunLight.target);

  // ---------- Chemin, ciel, décor ----------
  const path = createPath();
  const sky = createSky();
  scene.add(sky.group);
  sunLight.position.set(sky.sunDir.x * 100, 60, sky.sunDir.z * 100); // le soleil éclaire depuis l'horizon, devant

  const world = createWorld(path, { quality });
  scene.add(world.group);
  onProgress(0.35);
  const clouds = createClouds(path, { quality });
  scene.add(clouds.group);
  onProgress(0.5);

  // ---------- Personnage ----------
  const rider = createCharacter();
  scene.add(rider.root, ...rider.extras);

  // ---------- Panneaux et projets (images suivies par le LoadingManager) ----------
  const manager = new THREE.LoadingManager();
  let loadingStarted = false;
  let imagesLoaded;
  const imagesReady = new Promise((resolve) => {
    imagesLoaded = resolve;
    manager.onStart = () => { loadingStarted = true; };
    manager.onLoad = resolve;
    manager.onProgress = (_, loaded, total) => onProgress(0.5 + (loaded / total) * 0.45);
    setTimeout(resolve, 10000); // on ne bloque jamais le visiteur plus de 10 s
  });
  const panels = createPanels(path, world, { manager });
  scene.add(panels.group);
  if (!loadingStarted) imagesLoaded(); // aucun projet avec image

  // ---------- Scroll → progression ----------
  const travel = path.length - CHAR_AHEAD - LOOK_AHEAD;
  const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);
  let target = 0;
  let progress = 0;
  const readScroll = () => { target = Math.min(1, Math.max(0, scrollY / maxScroll())); };
  addEventListener('scroll', readScroll, { passive: true });

  // ---------- Étapes : textes HTML + menu ----------
  const sAbout = path.nearestS(STAGE_MARKERS.apropos);
  const sSkills = path.nearestS(STAGE_MARKERS.competences);
  const sSky = path.nearestS(STAGE_MARKERS.ciel);
  const [sProj0, sProj1] = panels.sProjects;
  const overlays = createOverlays(
    [
      { id: 'accueil', label: 'Accueil', from: -1, to: 5, jump: 0 },
      { id: 'apropos', label: 'À propos', from: sAbout - 24, to: sAbout + 1, jump: sAbout - 15 },
      { id: 'competences', label: 'Compétences', from: sSkills - 24, to: sSkills + 12, jump: sSkills - 22 },
      { id: 'ciel', label: 'Vers le ciel', from: sSky - 26, to: sSky + 2, jump: sSky - 24 },
      { id: 'projets', label: 'Projets', from: sProj0 - 18, to: sProj1 - 6, jump: sProj0 - 18 },
      { id: 'contact', label: 'Contact', from: travel - 10, to: Infinity, jump: travel },
    ],
    {
      jumpTo: (camS) => {
        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        scrollTo({ top: (Math.max(0, camS) / travel) * maxScroll(), behavior: reduce ? 'auto' : 'smooth' });
      },
    }
  );

  if (startAt !== null && !Number.isNaN(startAt)) {
    scrollTo(0, startAt * maxScroll());
    readScroll();
    progress = target;
  } else readScroll();

  // ---------- Clic / survol des cadres ----------
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered = -1;
  let pointerActive = false;
  function pick(clientX, clientY) {
    pointer.set((clientX / innerWidth) * 2 - 1, -(clientY / innerHeight) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(panels.clickables, false)[0];
    return hit && hit.distance < 60 ? hit.object.userData.projectIndex : -1;
  }
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    pointerActive = true;
    pointer.cx = e.clientX;
    pointer.cy = e.clientY;
  });
  canvas.addEventListener('click', (e) => {
    const i = pick(e.clientX, e.clientY);
    if (i >= 0) openProject(i);
  });

  // ---------- Caméra ----------
  const camPos = new THREE.Vector3();
  const lookPos = new THREE.Vector3();
  const smoothLook = new THREE.Vector3();
  let firstFrame = true;

  function placeCamera(camS) {
    path.pointAt(camS, camPos);
    camPos.y += CAM_HEIGHT;
    path.pointAt(camS + CHAR_AHEAD + LOOK_AHEAD, lookPos);
    lookPos.y += 1.6;
    camera.position.copy(camPos);
    if (firstFrame) { smoothLook.copy(lookPos); firstFrame = false; }
    smoothLook.lerp(lookPos, 0.2);
    camera.lookAt(smoothLook);
  }

  // ---------- Boucle ----------
  const clock = new THREE.Clock();
  let prevCharS = null;
  let frame = 0;

  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    progress += (target - progress) * Math.min(1, dt * 4);
    if (Math.abs(target - progress) < 1e-5) progress = target;

    const camS = progress * travel;
    placeCamera(camS);

    // Ambiance : on passe du coucher de soleil au monde doré en prenant de l'altitude
    const mood = THREE.MathUtils.smoothstep(camera.position.y, 8, 40);
    sky.update(camera, mood);
    scene.fog.color.copy(fogSunset).lerp(fogGolden, mood);
    scene.fog.far = 120 + mood * 60;

    world.update(t, camera);
    clouds.update(t, camera);

    const charS = camS + CHAR_AHEAD;
    const speed = prevCharS === null ? 0 : Math.abs(charS - prevCharS) / Math.max(dt, 1e-4);
    prevCharS = charS;
    rider.update(path, charS, speed, t, dt);

    // Survol des cadres (souris uniquement, une image sur deux pour économiser)
    if (pointerActive && frame++ % 2 === 0 && camera.position.y > 30) {
      hovered = pick(pointer.cx, pointer.cy);
      canvas.classList.toggle('is-pointer', hovered >= 0);
    }
    panels.update(t, dt, camS, hovered, camera);
    overlays.update(camS, progress);

    renderer.render(scene, camera);
  }

  function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
  }
  addEventListener('resize', resize);

  // Premier rendu pendant l'écran de chargement (compile les shaders), puis on attend les images
  tick();
  await imagesReady;
  onProgress(1);
  renderer.setAnimationLoop(tick);

  return {
    pause: () => renderer.setAnimationLoop(null),
    resume: () => { clock.getDelta(); readScroll(); renderer.setAnimationLoop(tick); },
  };
}
