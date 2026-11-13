// Décor low-poly inspiré de la médina de Mahdia : maisons blanches aux portes bleues,
// porte fortifiée (Skifa el Kahla), palmiers, lanternes, phare et mer au coucher du soleil.
import * as THREE from 'three';
import { STAGE_MARKERS, GROUND_END_Z } from './path.js';
import { rng, mergeColored, flatMat } from './utils.js';

const WALL_COLORS = ['#fff4ea', '#fbe9dc', '#f7dccd', '#fff0e0', '#f3d2c0'];
const BLUE = '#2f6fb3';
const STONE = '#e2b48e';

export function createWorld(path, { quality = 1 } = {}) {
  const group = new THREE.Group();
  const rand = rng(7);
  const updaters = [];

  // Distance sur le chemin des différentes étapes
  const sOf = (name) => path.nearestS(STAGE_MARKERS[name]);
  const sWelcome = sOf('accueil');
  const sAbout = sOf('apropos');
  const sSkills = sOf('competences');

  // Fin de la partie « au sol » du chemin
  let sGroundEnd = 0;
  for (let s = 0; s < path.length; s += 1) {
    if (path.pointAt(s).y > 0.4) { sGroundEnd = s; break; }
  }

  // Zones à garder libres (portes, panneaux, mur des compétences). side : 1 droite, -1 gauche, 0 les deux
  const exclusions = [
    { from: sWelcome - 3, to: sWelcome + 3, side: 0 },
    { from: sAbout - 7, to: sAbout + 9, side: 1 },
    { from: sSkills - 20, to: sSkills + 22, side: -1 },
    { from: sGroundEnd - 22, to: Infinity, side: 0 },
  ];
  const isExcluded = (s, side) => exclusions.some((e) => s > e.from && s < e.to && (e.side === 0 || e.side === side));

  // ---------- Sol ----------
  const groundDepth = 60 - GROUND_END_Z;
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(180, groundDepth).rotateX(-Math.PI / 2),
    flatMat({ color: '#f1c4c8' })
  );
  ground.position.set(0, 0, 60 - groundDepth / 2);
  group.add(ground);

  // Rue pavée qui suit le chemin
  {
    const pts = [];
    const side = new THREE.Vector3();
    const p = new THREE.Vector3();
    for (let s = -4; s <= sGroundEnd + 2; s += 1) {
      path.pointAt(Math.max(0, s), p);
      if (s < 0) p.addScaledVector(path.tangentAt(0), s);
      path.sideAt(Math.max(0, s), side);
      pts.push(p.clone().addScaledVector(side, -1.9), p.clone().addScaledVector(side, 1.9));
    }
    const pos = [];
    for (let i = 0; i < pts.length - 2; i += 2) {
      const [a, b, c, d] = [pts[i], pts[i + 1], pts[i + 2], pts[i + 3]];
      pos.push(a.x, 0.03, a.z, c.x, 0.03, c.z, b.x, 0.03, b.z, b.x, 0.03, b.z, c.x, 0.03, c.z, d.x, 0.03, d.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    group.add(new THREE.Mesh(g, flatMat({ color: '#e0a3b8', side: THREE.DoubleSide })));
  }

  // ---------- Maisons de la médina (instanciées : très peu d'appels de dessin) ----------
  const houses = [];
  const dummy = new THREE.Object3D();
  const tan = new THREE.Vector3();
  const sideV = new THREE.Vector3();
  const base = new THREE.Vector3();

  const rows = quality < 1 ? [6.2] : [6.2, 13];
  for (const rowOffset of rows) {
    for (let s = 2; s < sGroundEnd; s += 4.2 + rand() * 1.5) {
      for (const side of [-1, 1]) {
        if (rowOffset < 10 && isExcluded(s, side)) continue;
        const w = 3.4 + rand() * 2;
        const d = 4 + rand() * 2;
        const h = rowOffset > 10 ? 5 + rand() * 6 : 3 + rand() * 3.6;
        path.pointAt(s, base);
        path.tangentAt(s, tan);
        path.sideAt(s, sideV);
        const center = base.clone().addScaledVector(sideV, side * (rowOffset + d / 2 + rand() * 0.8));
        if (path.groundDistance(center.x, center.z) < d / 2 + 3.4) continue;
        houses.push({ center, w, d, h, yaw: Math.atan2(tan.x, tan.z), side, dome: rand() < 0.22, front: rowOffset < 10 });
      }
    }
  }
  // Quelques maisons derrière le point de départ, pour ne pas voir le vide
  for (let i = 0; i < 6; i++) {
    for (const side of [-1, 1]) {
      houses.push({ center: new THREE.Vector3(side * (8 + rand() * 3), 0, 30 + i * 5), w: 4, d: 5, h: 3 + rand() * 4, yaw: 0, side, dome: false, front: false });
    }
  }

  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const walls = new THREE.InstancedMesh(boxGeo, flatMat(), houses.length);
  const domes = houses.filter((h) => h.dome);
  const domeMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), flatMat({ color: '#fff8f0' }), domes.length);
  const fronts = houses.filter((h) => h.front);
  const doors = new THREE.InstancedMesh(boxGeo, flatMat({ color: BLUE }), fronts.length);
  const windows = new THREE.InstancedMesh(boxGeo, flatMat({ color: '#3d7fc4' }), fronts.length * 2);
  const c = new THREE.Color();

  houses.forEach((h, i) => {
    dummy.position.set(h.center.x, h.h / 2, h.center.z);
    dummy.rotation.set(0, h.yaw, 0);
    dummy.scale.set(h.d, h.h, h.w); // la largeur suit le chemin
    dummy.updateMatrix();
    walls.setMatrixAt(i, dummy.matrix);
    walls.setColorAt(i, c.set(WALL_COLORS[Math.floor(rand() * WALL_COLORS.length)]));
  });
  domes.forEach((h, i) => {
    const r = Math.min(h.w, h.d) * 0.36;
    dummy.position.set(h.center.x, h.h, h.center.z);
    dummy.rotation.set(0, h.yaw, 0);
    dummy.scale.set(r, r * 0.9, r);
    dummy.updateMatrix();
    domeMesh.setMatrixAt(i, dummy.matrix);
  });
  // Portes et fenêtres bleues sur la façade côté rue
  const local = new THREE.Vector3();
  fronts.forEach((h, i) => {
    const toStreet = h.side; // axe X local = côté gauche du chemin : la façade regarde la rue
    const place = (mesh, idx, along, y, sx, sy) => {
      local.set(toStreet * (h.d / 2 + 0.05), 0, along).applyAxisAngle(THREE.Object3D.DEFAULT_UP, h.yaw);
      dummy.position.set(h.center.x + local.x, y, h.center.z + local.z);
      dummy.rotation.set(0, h.yaw, 0);
      dummy.scale.set(0.16, sy, sx);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx, dummy.matrix);
    };
    place(doors, i, (rand() - 0.5) * (h.w - 1.6), 1.05, 1.1, 2.1);
    const hasWin = h.h > 4.2;
    place(windows, i * 2, -h.w * 0.25, hasWin ? h.h - 1.3 : -5, 0.7, 0.9);
    place(windows, i * 2 + 1, h.w * 0.25, hasWin ? h.h - 1.3 : -5, 0.7, 0.9);
  });
  group.add(walls, domeMesh, doors, windows);

  // ---------- Portes fortifiées (arches) ----------
  function makeGate(width, height, holeW, holeH) {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0).lineTo(width / 2, 0).lineTo(width / 2, height).lineTo(-width / 2, height).lineTo(-width / 2, 0);
    const hole = new THREE.Path();
    const r = holeW / 2;
    hole.moveTo(-r, 0).lineTo(-r, holeH - r).absarc(0, holeH - r, r, Math.PI, 0, true).lineTo(r, 0).lineTo(-r, 0);
    shape.holes.push(hole);
    const wall = new THREE.ExtrudeGeometry(shape, { depth: 2.4, bevelEnabled: false, curveSegments: 8 }).translate(0, 0, -1.2);
    const parts = [{ geo: wall, color: STONE }];
    for (let x = -width / 2 + 0.5; x <= width / 2 - 0.4; x += 1.4) {
      parts.push({ geo: new THREE.BoxGeometry(0.8, 0.8, 2.4), color: STONE, position: new THREE.Vector3(x, height + 0.4, 0) });
    }
    // Encadrement bleu de l'arche
    for (const z of [-1.25, 1.25]) {
      parts.push({ geo: new THREE.TorusGeometry(r + 0.15, 0.18, 4, 12, Math.PI), color: BLUE, position: new THREE.Vector3(0, holeH - r, z) });
    }
    return mergeColored(parts);
  }
  const gateMat = flatMat({ vertexColors: true });
  const gateGeo = makeGate(13, 7.5, 4.8, 5.6);
  const smallGateGeo = makeGate(11, 5.4, 4.6, 4.6);
  const gates = [
    { s: sWelcome, geo: gateGeo },
    { s: (sAbout + sSkills) / 2 + 2, geo: smallGateGeo },
  ];
  for (const g of gates) {
    const m = new THREE.Mesh(g.geo, gateMat);
    path.pointAt(g.s, m.position);
    path.tangentAt(g.s, tan);
    m.rotation.y = Math.atan2(tan.x, tan.z);
    group.add(m);
    g.mesh = m;
  }

  // ---------- Palmiers ----------
  const palmGeo = (() => {
    const parts = [];
    let y = 0;
    let x = 0;
    for (let i = 0; i < 5; i++) {
      const seg = new THREE.CylinderGeometry(0.17 - i * 0.015, 0.22 - i * 0.015, 1.25, 6);
      parts.push({ geo: seg, color: i % 2 ? '#8a5a3c' : '#9c6845', position: new THREE.Vector3(x, y + 0.62, 0), rotation: new THREE.Euler(0, 0, -0.06 * i) });
      y += 1.2;
      x += 0.08 * i;
    }
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const leaf = new THREE.ConeGeometry(0.42, 3, 4).rotateX(Math.PI / 2).translate(0, 0, 1.5);
      leaf.scale(1, 0.25, 1);
      parts.push({ geo: leaf, color: i % 2 ? '#7cbf6a' : '#94cf72', position: new THREE.Vector3(x, y, 0), rotation: new THREE.Euler(0.45, a, 0, 'YXZ') });
    }
    return mergeColored(parts);
  })();
  const palms = [];
  for (let s = 8; s < sGroundEnd + 6; s += 9 + rand() * 6) {
    const side = rand() < 0.5 ? -1 : 1;
    if (isExcluded(s, side) && s < sGroundEnd - 22) continue;
    path.pointAt(s, base);
    path.sideAt(s, sideV);
    const p = base.clone().addScaledVector(sideV, side * (3.6 + rand() * 1.2));
    if (path.groundDistance(p.x, p.z) < 2.8) continue;
    palms.push(p);
  }
  // Palmeraie en bord de mer
  for (let i = 0; i < 14 * quality; i++) {
    const p = new THREE.Vector3(-40 + rand() * 80, 0, GROUND_END_Z + 3 + rand() * 14);
    if (path.groundDistance(p.x, p.z) > 4) palms.push(p);
  }
  const palmMesh = new THREE.InstancedMesh(palmGeo, flatMat({ vertexColors: true }), palms.length);
  palms.forEach((p, i) => {
    const sc = 0.85 + rand() * 0.5;
    dummy.position.copy(p);
    dummy.rotation.set(0, rand() * Math.PI * 2, 0);
    dummy.scale.setScalar(sc);
    dummy.updateMatrix();
    palmMesh.setMatrixAt(i, dummy.matrix);
  });
  group.add(palmMesh);

  // ---------- Lanternes le long de la rue ----------
  const lamps = [];
  for (let s = 10, k = 0; s < sGroundEnd - 4; s += 11, k++) {
    const side = k % 2 ? 1 : -1;
    path.pointAt(s, base);
    path.sideAt(s, sideV);
    lamps.push(base.clone().addScaledVector(sideV, side * 2.5));
  }
  const posts = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.08, 2.8, 5), flatMat({ color: '#3b2a4a' }), lamps.length);
  const bulbs = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.26, 0), new THREE.MeshBasicMaterial({ color: '#ffd98a' }), lamps.length);
  lamps.forEach((p, i) => {
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.position.set(p.x, 1.4, p.z);
    dummy.updateMatrix();
    posts.setMatrixAt(i, dummy.matrix);
    dummy.position.set(p.x, 2.95, p.z);
    dummy.updateMatrix();
    bulbs.setMatrixAt(i, dummy.matrix);
  });
  group.add(posts, bulbs);

  // ---------- Muret du bord de mer + phare (Cap Africa) ----------
  const gapX = path.pointAt(sGroundEnd).x;
  for (const [x0, x1] of [[-90, gapX - 3], [gapX + 3, 90]]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.7, 0.8), flatMat({ color: STONE }));
    wall.position.set((x0 + x1) / 2, 0.35, GROUND_END_Z + 0.4);
    group.add(wall);
  }
  const lighthouse = new THREE.Mesh(
    mergeColored([
      { geo: new THREE.BoxGeometry(3.4, 1.2, 3.4), color: STONE, position: new THREE.Vector3(0, 0.6, 0) },
      { geo: new THREE.CylinderGeometry(1.1, 1.5, 11, 8), color: '#fff6ee', position: new THREE.Vector3(0, 6.5, 0) },
      { geo: new THREE.CylinderGeometry(1.25, 1.25, 0.5, 8), color: BLUE, position: new THREE.Vector3(0, 12.2, 0) },
      { geo: new THREE.ConeGeometry(1.1, 1.3, 8), color: BLUE, position: new THREE.Vector3(0, 14.2, 0) },
    ]),
    flatMat({ vertexColors: true })
  );
  lighthouse.position.set(-16, 0, GROUND_END_Z + 6);
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.2, 8), new THREE.MeshBasicMaterial({ color: '#ffe08a' }));
  beacon.position.set(-16, 13.05, GROUND_END_Z + 6);
  group.add(lighthouse, beacon);

  // ---------- Mer (vagues low-poly animées) ----------
  const seaGeo = new THREE.PlaneGeometry(1000, 1000, quality < 1 ? 36 : 56, quality < 1 ? 36 : 56).rotateX(-Math.PI / 2);
  const seaBase = seaGeo.attributes.position.array.slice();
  const sea = new THREE.Mesh(seaGeo, flatMat({ color: '#c97aa9' }));
  sea.position.set(0, -1.3, -300); // passe aussi sous la presqu'île (les vagues restent sous le sol)
  group.add(sea);
  updaters.push((t, camY) => {
    if (camY > 45) return; // invisible depuis les nuages : on économise
    const a = seaGeo.attributes.position.array;
    for (let i = 0; i < a.length; i += 3) {
      const x = seaBase[i];
      const z = seaBase[i + 2];
      a[i + 1] = Math.sin(x * 0.08 + t * 0.9) * 0.35 + Math.cos(z * 0.07 + t * 0.7) * 0.35;
    }
    seaGeo.attributes.position.needsUpdate = true;
    seaGeo.computeVertexNormals();
  });

  return {
    group,
    sGroundEnd,
    sSkills,
    sAbout,
    sWelcome,
    welcomeGate: gates[0].mesh,
    update(t, camera) {
      group.visible = camera.position.y < 70;
      for (const u of updaters) u(t, camera.position.y);
    },
  };
}
