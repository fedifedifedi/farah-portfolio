// Le chemin du voyage : une courbe CatmullRom que suivent le scooter et la caméra.
// Les coordonnées sont celles du sol (y = 0) ; la caméra est placée au-dessus et derrière.
import * as THREE from 'three';

const v = (x, y, z) => new THREE.Vector3(x, y, z);

// Points de contrôle. Les commentaires indiquent l'étape qui se trouve à proximité.
const POINTS = [
  v(0, 0, 26),     // départ
  v(0, 0, 8),
  v(0, 0, -12),    // porte « Bienvenue »
  v(-4, 0, -32),
  v(-10, 0, -50),  // à propos
  v(-8, 0, -70),
  v(0, 0, -88),    // mur des compétences
  v(6, 0, -106),
  v(6, 0, -122),   // bord de mer, phare
  v(4, 4, -138),   // décollage
  v(0, 16, -152),
  v(-2, 32, -166),
  v(0, 46, -182),  // monde des nuages
  v(6, 52, -202),
  v(0, 54, -224),  // projets
  v(-6, 54, -246),
  v(0, 54, -270),
  v(5, 54, -294),
  v(0, 54, -318),
  v(-5, 54, -342),
  v(0, 54, -366),
  v(6, 54, -390),
  v(0, 54, -414),
  v(-6, 54, -438),
  v(0, 54, -462),
  v(5, 54, -486),
  v(0, 54, -510),
  v(-4, 54, -534),
  v(0, 54, -558),
  v(0, 54, -582),  // contact (la galerie des projets est longue : un projet tous les ~30 m)
];

// Repères des étapes (positions dans le monde) : servent au menu et aux textes HTML
export const STAGE_MARKERS = {
  accueil: v(0, 0, 2),
  apropos: v(-10, 0, -50),
  competences: v(0, 0, -88),
  ciel: v(-2, 32, -166),
  projets: v(0, 54, -224),
  contact: v(0, 54, -582),
};

export const GROUND_END_Z = -128; // au-delà : la mer

export function createPath() {
  const curve = new THREE.CatmullRomCurve3(POINTS, false, 'centripetal');
  curve.arcLengthDivisions = 3000;
  const length = curve.getLength();
  const clamp01 = (t) => Math.min(1, Math.max(0, t));

  // Échantillons réguliers (tous les ~0,5 unité) pour les recherches de proximité
  const samples = curve.getSpacedPoints(Math.ceil(length * 2));

  const path = {
    curve,
    length,
    samples,
    /** Point à une distance s (en unités) depuis le départ */
    pointAt: (s, target = new THREE.Vector3()) => curve.getPointAt(clamp01(s / length), target),
    tangentAt: (s, target = new THREE.Vector3()) => curve.getTangentAt(clamp01(s / length), target),
    /** Vecteur horizontal perpendiculaire au chemin (vers la droite du voyageur) */
    sideAt(s, target = new THREE.Vector3()) {
      const t = path.tangentAt(s);
      return target.set(-t.z, 0, t.x).normalize();
    },
    /** Distance s du point du chemin le plus proche d'une position */
    nearestS(pos) {
      let best = Infinity;
      let bestI = 0;
      for (let i = 0; i < samples.length; i++) {
        const d = samples[i].distanceToSquared(pos);
        if (d < best) { best = d; bestI = i; }
      }
      return (bestI / (samples.length - 1)) * length;
    },
    /** Distance minimale (au carré, sur le plan horizontal) entre une position et le chemin au sol */
    groundDistance(x, z) {
      let best = Infinity;
      for (const p of samples) {
        if (p.y > 1) continue;
        const d = (p.x - x) ** 2 + (p.z - z) ** 2;
        if (d < best) best = d;
      }
      return Math.sqrt(best);
    },
  };
  return path;
}
