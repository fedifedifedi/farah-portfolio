// Farah en personnage humain 3D, avec le visage de son avatar (images/farah-visage.jpg).
// Silhouette générée en code (articulations : hanches, genoux, chevilles, épaules, coudes),
// démarche féminine : balancement des hanches, pas légèrement croisés, bras souples, épaules en contrepoids.
// Elle marche dans la médina, s'envole dans les nuages avec une traînée rose,
// toujours tournée vers le visiteur, et fait coucou quand il arrête de défiler.
// Le modèle regarde vers +Z ; il est orienté le long du chemin à chaque image.
import * as THREE from 'three';
import { getDotTexture } from './utils.js';

const FACE_URL = 'images/farah-visage.jpg';

// Couleurs : change-les ici (tenue chic : blazer rose, chemisier crème, pantalon large clair, escarpins nude, bijoux dorés)
const C = {
  skin: '#f8d7bd', hair: '#7a5640', hairLight: '#9c7354', jacket: '#f1aecb', jacketDark: '#e596bb',
  top: '#fff6f0', jeans: '#f8e1ea', shoes: '#e9bfa8', sole: '#c98f78', gold: '#e2bc6e',
};

const mat = (color, roughness = 0.75) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });
const M = {
  skin: new THREE.MeshBasicMaterial({ color: C.skin }), hair: mat(C.hair, 0.55), hairLight: mat(C.hairLight, 0.55),
  jacket: mat(C.jacket, 0.5), jacketDark: mat(C.jacketDark, 0.45), top: mat(C.top, 0.4),
  jeans: mat(C.jeans, 0.7), shoes: mat(C.shoes, 0.35), sole: mat(C.sole, 0.5),
  gold: new THREE.MeshStandardMaterial({ color: C.gold, metalness: 0.8, roughness: 0.28 }),
};

/** Segment de membre : capsule qui pend sous son articulation (le pivot est l'articulation) */
function segment(length, rTop, rBottom, material) {
  const pivot = new THREE.Group();
  const geo = new THREE.CapsuleGeometry((rTop + rBottom) / 2, length, 4, 12);
  // Effilé : on rétrécit le bas de la capsule
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const k = THREE.MathUtils.clamp(0.5 - y / (length + rTop + rBottom), 0, 1); // 0 en haut, 1 en bas
    const r = THREE.MathUtils.lerp(rTop, rBottom, k) / ((rTop + rBottom) / 2);
    pos.setX(i, pos.getX(i) * r);
    pos.setZ(i, pos.getZ(i) * r);
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.y = -length / 2;
  pivot.add(mesh);
  return pivot;
}

/** Visage : la photo découpée en ovale aux bords fondus, posée sur l'avant de la tête */
function faceTexture(img) {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const g = c.getContext('2d');
  g.fillStyle = C.skin;
  g.fillRect(0, 0, c.width, c.height);
  g.drawImage(img, 0, 0);
  // Ovale du visage seulement (sans les cheveux de l'image) : les cheveux 3D l'encadrent
  g.globalCompositeOperation = 'destination-in';
  g.translate(c.width * 0.5, c.height * 0.52);
  g.scale(1, (c.height * 0.52) / (c.width * 0.5));
  const r = c.width * 0.5;
  const mask = g.createRadialGradient(0, 0, 0, 0, 0, r);
  mask.addColorStop(0, 'rgba(0,0,0,1)');
  mask.addColorStop(0.9, 'rgba(0,0,0,1)');
  mask.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = mask;
  g.fillRect(-r, -r, r * 2, r * 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function createCharacter() {
  const root = new THREE.Group();   // position + orientation sur le chemin
  const turn = new THREE.Group();   // demi-tour pour faire coucou
  const hips = new THREE.Group();   // centre du corps (hauteur des hanches) : pivot de la pose
  root.add(turn);
  turn.add(hips);
  const HIP_Y = 0.95;
  hips.position.y = HIP_Y;
  root.scale.setScalar(1.15);

  // ---------- Bassin ----------
  const pelvis = new THREE.Group();
  hips.add(pelvis);
  const pelvisMesh = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 14), M.jeans);
  pelvisMesh.scale.set(1.12, 0.78, 0.82);
  pelvisMesh.position.y = 0.02;
  pelvis.add(pelvisMesh);

  // ---------- Jambes ----------
  const legs = [1, -1].map((side) => { // side 1 = gauche (+X), -1 = droite
    // Pantalon large taille haute : la jambe s'évase vers le bas
    const thigh = segment(0.42, 0.078, 0.062, M.jeans);
    thigh.position.set(side * 0.085, -0.02, 0);
    const shin = segment(0.41, 0.062, 0.072, M.jeans);
    shin.position.y = -0.44;
    const ankle = new THREE.Group();
    ankle.position.y = -0.43;
    // Escarpin pointu nude avec talon fin
    const shoe = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.2, 10).rotateX(Math.PI / 2), M.shoes);
    shoe.position.set(0, -0.045, 0.07);
    shoe.scale.set(1, 0.55, 1);
    const heel = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.07, 6), M.sole);
    heel.position.set(0, -0.06, -0.03);
    ankle.add(shoe, heel);
    shin.add(ankle);
    thigh.add(shin);
    pelvis.add(thigh);
    return { thigh, shin, ankle, side };
  });

  // ---------- Buste (tourne en contrepoids des hanches) ----------
  const spine = new THREE.Group();
  spine.position.y = 0.06;
  hips.add(spine);
  // Silhouette du buste par révolution : taille fine, poitrine, épaules
  const torsoProfile = [
    [0.135, 0], [0.128, 0.08], [0.112, 0.18], [0.125, 0.28], [0.15, 0.37], [0.158, 0.44], [0.13, 0.5], [0.06, 0.54],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const torso = new THREE.Mesh(new THREE.LatheGeometry(torsoProfile, 24), M.jacket);
  torso.scale.set(1.18, 1, 0.78);
  spine.add(torso);
  // Haut blanc visible dans l'ouverture en V de la veste (comme sur son avatar)
  const vShape = new THREE.Shape();
  vShape.moveTo(-0.07, 0.53).lineTo(0.07, 0.53).lineTo(0, 0.36).lineTo(-0.07, 0.53);
  const top = new THREE.Mesh(new THREE.ShapeGeometry(vShape), new THREE.MeshBasicMaterial({ color: C.top, side: THREE.DoubleSide }));
  top.position.z = 0.128;
  spine.add(top);
  // Revers du blazer : deux bandes de satin le long du décolleté
  for (const side of [1, -1]) {
    const lapel = new THREE.Shape();
    lapel.moveTo(side * 0.07, 0.53).lineTo(side * 0.1, 0.5).lineTo(side * 0.022, 0.33).lineTo(0, 0.36).lineTo(side * 0.07, 0.53);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(lapel), new THREE.MeshStandardMaterial({ color: C.jacketDark, roughness: 0.3, side: THREE.DoubleSide }));
    m.position.z = 0.13;
    spine.add(m);
  }
  // Ceinture fine dorée à la taille, et petit collier doré
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.009, 6, 32).rotateX(Math.PI / 2), M.gold);
  belt.scale.set(1.18, 1, 0.8);
  belt.position.y = 0.16;
  spine.add(belt);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.022, 0.008), M.gold);
  buckle.position.set(0, 0.16, 0.093);
  spine.add(buckle);
  const pendant = new THREE.Mesh(new THREE.SphereGeometry(0.011, 10, 8), M.gold);
  pendant.position.set(0, 0.47, 0.132);
  spine.add(pendant);

  // ---------- Bras ----------
  const arms = [1, -1].map((side) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.19, 0.46, -0.01);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.058, 14, 10), M.jacket);
    shoulder.add(cap);
    const upper = segment(0.27, 0.05, 0.042, M.jacket);
    shoulder.add(upper);
    const elbow = new THREE.Group();
    elbow.position.y = -0.29;
    upper.add(elbow);
    const fore = segment(0.23, 0.04, 0.034, M.jacket);
    elbow.add(fore);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 10), M.skin);
    hand.scale.set(0.75, 1.25, 0.95);
    hand.position.y = -0.27;
    fore.add(hand);
    spine.add(shoulder);
    return { shoulder: upper, elbow, side };
  });

  // ---------- Cou et tête ----------
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.045, 0.1, 12), M.skin);
  neck.position.y = 0.57;
  spine.add(neck);
  const head = new THREE.Group();
  head.position.y = 0.6;
  head.scale.setScalar(1.15); // proportions proches du réel, tête juste un peu agrandie pour bien voir le visage
  spine.add(head);
  const HEAD_R = 0.112;
  const skull = new THREE.Mesh(new THREE.SphereGeometry(HEAD_R, 28, 20), new THREE.MeshBasicMaterial({ color: C.skin }));
  skull.scale.set(0.9, 1.16, 1);
  skull.position.y = 0.11;
  head.add(skull);
  // Visage de l'avatar : calotte de sphère juste devant le crâne
  const faceImg = new Image();
  faceImg.onload = () => {
    const face = new THREE.Mesh(
      // couvre toute la face, du front au menton
      new THREE.SphereGeometry(HEAD_R * 1.01, 32, 24, Math.PI / 2 - 0.95, 1.9, 0.5, 2.15),
      new THREE.MeshBasicMaterial({ map: faceTexture(faceImg), transparent: true })
    );
    face.scale.copy(skull.scale);
    face.position.copy(skull.position);
    head.add(face);
  };
  faceImg.src = FACE_URL;

  // Cheveux longs et lisses, raie au milieu, qui encadrent le visage (comme sur son avatar)
  const hairGroup = new THREE.Group();
  hairGroup.position.y = 0.11;
  head.add(hairGroup);
  // Dessus de la tête : couvre le front jusqu'à la naissance des cheveux
  const crown = new THREE.Mesh(new THREE.SphereGeometry(HEAD_R * 1.07, 32, 18, 0, Math.PI * 2, 0, 1.05), M.hair);
  crown.scale.set(0.95, 1.16, 1.05);
  crown.rotation.x = -0.12;
  hairGroup.add(crown);
  // Raie au milieu : léger sillon plus clair
  const part = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.004, 0.11), M.hairLight);
  part.position.set(0, HEAD_R * 1.22, 0.04);
  part.rotation.x = 0.5;
  hairGroup.add(part);
  const back = new THREE.Mesh(new THREE.SphereGeometry(HEAD_R * 1.1, 28, 18, Math.PI, Math.PI), M.hair);
  back.scale.set(0.98, 1.18, 1.06);
  hairGroup.add(back);
  // Longueur dans le dos (balance en marchant)
  const hairFall = new THREE.Group();
  hairFall.position.set(0, -0.02, -0.06);
  hairGroup.add(hairFall);
  const fall = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.48, 6, 16), M.hair);
  fall.scale.set(1.2, 1, 0.42);
  fall.position.y = -0.27;
  hairFall.add(fall);
  for (const x of [-0.07, 0.0, 0.07]) {
    const streak = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.4, 3, 6), M.hairLight);
    streak.position.set(x, -0.29, -0.045);
    hairFall.add(streak);
  }
  // Deux grands rideaux de cheveux de chaque côté du visage, qui tombent sur les épaules
  const locks = [1, -1].map((side) => {
    const lock = new THREE.Group();
    lock.position.set(side * 0.092, 0.06, 0.01);
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.46, 6, 12), M.hair);
    m.scale.set(1, 1, 0.8);
    m.position.y = -0.25;
    lock.add(m);
    // Reflet caramel sur la mèche
    const hl = new THREE.Mesh(new THREE.CapsuleGeometry(0.01, 0.34, 3, 6), M.hairLight);
    hl.position.set(side * 0.012, -0.27, 0.03);
    lock.add(hl);
    lock.rotation.z = side * 0.09;
    hairGroup.add(lock);
    return lock;
  });

  // ---------- Ombre floue au sol ----------
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 1.1).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: '#5a2c4f', map: getDotTexture(), transparent: true, opacity: 0.35, depthWrite: false })
  );

  // ---------- Traînée rose quand elle vole ----------
  const TRAIL = 70;
  const trailPos = new Float32Array(TRAIL * 3);
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
  const trail = new THREE.Points(trailGeo, new THREE.PointsMaterial({ color: '#ee5fa7', map: getDotTexture(), size: 0.42, transparent: true, opacity: 0.9, depthWrite: false }));
  trail.frustumCulled = false;
  let trailInit = false;

  // La tête suit la souris quand elle fait face au visiteur
  const mouse = { x: 0, y: 0 };
  addEventListener('pointermove', (e) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  const tangent = new THREE.Vector3();
  const ahead = new THREE.Vector3();
  const tail = new THREE.Vector3();
  let phase = 0;
  let idle = 0;
  let face = 0;
  let walk = 0;
  let roll = 0;
  let hairLag = 0;
  const damp = (cur, target, rate, dt) => cur + (target - cur) * (1 - Math.exp(-rate * dt));

  return {
    root,
    extras: [shadow, trail],
    /**
     * @param path  chemin
     * @param s     distance sur le chemin
     * @param speed vitesse (unités/s)
     */
    update(path, s, speed, t, dt) {
      path.pointAt(s, root.position);
      path.tangentAt(s, tangent);
      root.lookAt(ahead.copy(root.position).add(tangent));

      const airborne = THREE.MathUtils.smoothstep(root.position.y, 0.5, 3);
      // Elle reste toujours tournée vers le visiteur (comme une guide qui fait visiter) :
      // on voit son visage pendant tout le voyage, et elle avance à reculons.
      turn.rotation.y = Math.PI;
      idle = speed < 0.4 ? idle + dt : 0;
      face = damp(face, THREE.MathUtils.smoothstep(idle, 1.2, 2.2) * (1 - airborne), 4, dt); // coucou à l'arrêt

      // Intensité de la marche (0 = immobile), lissée pour démarrer et s'arrêter en douceur
      walk = damp(walk, Math.min(1, speed / 1.2) * (1 - airborne), 6, dt);
      // Cadence : environ 1,4 m par cycle de deux pas ; cycle inversé car elle marche à reculons
      phase -= Math.min(speed, 4.2) / 1.4 * Math.PI * 2 * dt;
      const sp = Math.sin(phase);
      const cp = Math.cos(phase);
      const fly = airborne;

      // --- Jambes : hanche, genou (plié surtout pendant le passage de la jambe), cheville ---
      for (const leg of legs) {
        const ph = leg.side === 1 ? phase : phase + Math.PI;
        const s1 = Math.sin(ph);
        const c1 = Math.cos(ph);
        const swing = -s1 * 0.42 * walk;                                  // négatif = jambe vers l'avant
        const knee = (0.06 + Math.pow(Math.max(0, c1), 1.6) * 0.95) * walk; // pli du genou
        leg.thigh.rotation.x = swing - fly * 0.15;
        leg.thigh.rotation.z = leg.side * -0.035 * walk;                   // pas légèrement croisés
        leg.shin.rotation.x = knee + fly * (leg.side === 1 ? 0.25 : 0.6);
        leg.ankle.rotation.x = -(swing + knee) * 0.35 + fly * 0.5;
      }

      // --- Bassin : rebond, balancement latéral et rotation des hanches (démarche féminine) ---
      hips.position.y = HIP_Y + Math.cos(phase * 2) * 0.022 * walk + fly * 0.2;
      pelvis.position.x = sp * 0.025 * walk;
      pelvis.rotation.z = sp * 0.07 * walk;
      pelvis.rotation.y = -sp * 0.14 * walk;
      // Buste en contrepoids : les épaules tournent dans l'autre sens, le corps reste droit
      spine.rotation.y = sp * 0.2 * walk;
      spine.rotation.z = -sp * 0.04 * walk;
      spine.rotation.x = 0.03 * walk;

      // --- Bras : balancier opposé aux jambes, coudes souples ---
      const wave = face;
      for (const arm of arms) {
        const ph = arm.side === 1 ? phase + Math.PI : phase;
        const s1 = Math.sin(ph);
        let ax = s1 * 0.38 * walk;                       // avant / arrière
        let az = arm.side * 0.12;                        // bras légèrement écartés du corps
        let el = 0.22 + Math.max(0, -s1) * 0.35 * walk;  // coude plus plié quand le bras passe devant
        // En vol : elle flotte face au visiteur, bras ouverts, mouvement lent comme dans l'eau
        const flap = Math.sin(t * 1.6 + arm.side) * 0.15;
        ax = THREE.MathUtils.lerp(ax, -0.15 + flap * 0.5, fly);
        az = THREE.MathUtils.lerp(az, arm.side * (0.9 + flap), fly);
        el = THREE.MathUtils.lerp(el, 0.35, fly);
        if (arm.side === -1) {
          // Coucou : bras levé, l'avant-bras s'agite
          az = THREE.MathUtils.lerp(az, -2.5, wave);
          ax = THREE.MathUtils.lerp(ax, -0.2, wave);
          el = THREE.MathUtils.lerp(el, 0.5 + Math.sin(t * 9) * 0.35, wave);
        }
        arm.shoulder.rotation.set(ax, 0, az);
        arm.elbow.rotation.x = -el;
      }

      // --- Vol : légèrement penchée vers le visiteur, elle ondule doucement ---
      hips.rotation.x = fly * (0.18 + Math.sin(t * 1.2) * 0.05);
      hips.position.z = 0;

      // --- Tête : stable pendant la marche, suit la souris (elle regarde le visiteur) ---
      head.rotation.y = -(spine.rotation.y + pelvis.rotation.y) + mouse.x * 0.4;
      head.rotation.x = mouse.y * 0.18 - fly * 0.1 + Math.sin(phase * 2) * 0.015 * walk;
      head.rotation.z = -spine.rotation.z;

      // Cheveux : suivent le mouvement avec un léger retard, et flottent en vol
      hairLag = damp(hairLag, sp * walk, 5, dt);
      hairFall.rotation.x = 0.08 + Math.abs(hairLag) * 0.05 + walk * 0.06 + fly * (0.25 + Math.sin(t * 1.4) * 0.08);
      hairFall.rotation.z = -hairLag * 0.08 + fly * Math.sin(t * 1.1) * 0.06;
      for (const lock of locks) lock.rotation.x = -0.05 - fly * 0.1;

      // Légère inclinaison dans les virages
      const h1 = Math.atan2(tangent.x, tangent.z);
      path.tangentAt(s + 2, ahead);
      let dh = Math.atan2(ahead.x, ahead.z) - h1;
      dh = Math.atan2(Math.sin(dh), Math.cos(dh));
      roll = damp(roll, THREE.MathUtils.clamp(-dh * 1.2, -0.15, 0.15) * walk, 5, dt);
      hips.rotation.z = roll;

      // Ombre (seulement au sol)
      shadow.position.set(root.position.x, 0.04, root.position.z);
      shadow.visible = root.position.y < 1.5;

      // Traînée : un peu derrière elle, à hauteur du corps
      // (elle fait face au visiteur : la traînée part de ses pieds, côté opposé à la caméra)
      tail.copy(root.position).addScaledVector(tangent, 0.35);
      tail.y += 0.25 + fly * 0.2;
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
