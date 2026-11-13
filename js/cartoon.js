// Farah dessinée façon « Super Nanas » (pose de Blossom : mains sur les hanches),
// avec ses traits : longs cheveux brun foncé à reflets caramel, mèche sur le côté,
// yeux bruns, lèvres corail, peau claire, petit collier.
// Dessin en Canvas 2D : le même code sert pour l'accueil (js/avatar.js) et le monde 3D (js/three/character.js).

export const CARTOON_W = 400;
export const CARTOON_H = 533;

// Couleurs : change-les ici
export const CARTOON_COLORS = {
  skin: '#fde2d2', hair: '#3a2117', highlight: '#a5703e', bow: '#ee5fa7',
  dress: '#f4b3da', stripe: '#1a0f14', tights: '#ffffff', shoes: '#1a0f14',
  iris: '#7a4a24', irisRing: '#a8703c', pupil: '#120a08', lips: '#e8695f', mouth: '#9b2b37',
  blush: 'rgba(244, 120, 170, .35)', ink: '#1a0f14',
};

// Expression de chaque zone (le curseur à gauche / au centre / à droite).
// lid : paupière (0 ouvert, 1 fermé) ; brow : sourcils (-1 froncé malin, 1 levés curieux) ;
// w / top / bottom / yl / yr : forme de la bouche
export const CARTOON_EXPRESSIONS = {
  center: { lid: 0, brow: 0, w: 30, top: 2, bottom: 32, yl: -5, yr: -5 },  // grand sourire
  left: { lid: 0.4, brow: -1, w: 22, top: 2, bottom: 12, yl: -12, yr: 3 }, // regard en coin, sourire malin
  right: { lid: 0, brow: 1, w: 11, top: -6, bottom: 16, yl: 0, yr: 0 },    // curieuse, petite bouche ronde
};

const P = (d) => new Path2D(d);
const PATHS = {
  // Longueur des cheveux, derrière la tête
  hairBack: P('M86 200C70 300 80 400 112 466Q200 486 288 466C320 400 330 300 314 200Z'),
  // Dessus de la tête avec la grande mèche qui retombe sur le côté
  fringe: P('M70 220C60 120 140 84 205 88C282 86 344 128 332 226C318 186 298 160 268 146C252 170 214 186 176 178C150 174 120 170 104 186C88 196 76 206 70 220Z'),
  // Mèches qui tombent de chaque côté du visage (sans le recouvrir)
  lockL: P('M70 214C52 280 58 340 78 384L100 374C86 330 84 280 92 250Z'),
  lockR: P('M330 214C348 280 342 340 322 384L300 374C314 330 316 280 308 250Z'),
  dress: P('M170 326L230 326L266 446Q200 462 134 446Z'),
};

const mix = (a, b, t) => a + (b - a) * t;

/** État par défaut (tout peut être omis) */
export function cartoonState() {
  return { gx: 0, gy: 0, blink: 0, expr: { ...CARTOON_EXPRESSIONS.center }, tilt: 0, walk: 0, wave: 0, bob: 0, t: 0, shadow: true };
}

/**
 * Dessine Farah dans un contexte 2D (repère CARTOON_W × CARTOON_H).
 * s.gx / s.gy : direction du regard (-1 à 1) ; s.tilt : inclinaison de la tête (radians) ;
 * s.walk : pas (-1 à 1) ; s.wave : bras levé pour faire coucou (0 à 1) ; s.bob : flottement (px)
 */
export function drawFarah(ctx, s) {
  const C = CARTOON_COLORS;
  const e = s.expr;
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Ombre au sol (elle rétrécit quand Farah s'élève)
  if (s.shadow) {
    const k = 1 - Math.min(1, Math.abs(s.bob) / 40);
    ctx.fillStyle = 'rgba(120, 40, 90, .18)';
    ctx.beginPath();
    ctx.ellipse(200, 512, 70 * (0.7 + 0.3 * k), 10 * (0.7 + 0.3 * k), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.translate(0, s.bob);
  ctx.strokeStyle = C.ink;

  // ---------- Cheveux derrière ----------
  ctx.lineWidth = 6;
  ctx.fillStyle = C.hair;
  ctx.save();
  ctx.translate(200, 300);
  ctx.rotate(s.tilt * 0.5);
  ctx.translate(-200, -300);
  ctx.fill(PATHS.hairBack);
  ctx.stroke(PATHS.hairBack);
  ctx.strokeStyle = C.highlight;
  ctx.lineWidth = 4;
  for (const [x, w] of [[118, -6], [150, -2], [252, 2], [284, 6]]) {
    ctx.beginPath();
    ctx.moveTo(x, 300);
    ctx.quadraticCurveTo(x + w, 380, x + w * 2, 450);
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = C.ink;

  // ---------- Jambes (collants blancs) et chaussures ----------
  const lift = (v) => Math.max(0, v) * 12;
  for (const [x, up] of [[186, lift(s.walk)], [214, lift(-s.walk)]]) {
    ctx.lineWidth = 5;
    ctx.fillStyle = C.tights;
    ctx.beginPath();
    ctx.roundRect(x - 10, 440 - up, 20, 48, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = C.shoes;
    ctx.beginPath();
    ctx.ellipse(x + (x < 200 ? -5 : 5), 492 - up, 17, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---------- Robe rose à bande noire ----------
  ctx.lineWidth = 6;
  ctx.fillStyle = C.dress;
  ctx.fill(PATHS.dress);
  ctx.save();
  ctx.clip(PATHS.dress);
  ctx.fillStyle = C.stripe;
  ctx.fillRect(120, 360, 160, 22);
  ctx.restore();
  ctx.stroke(PATHS.dress);

  // ---------- Bras : mains sur les hanches, coudes écartés (le droit se lève pour faire coucou) ----------
  // Chaque bras : épaule → coude → main
  const wave = s.wave;
  const wig = Math.sin(s.t * 14) * 12 * wave;
  const arms = [
    [170, 336, 116, 370, 154, 400],
    [230, 336, mix(284, 282, wave), mix(370, 310, wave), mix(246, 300 + wig, wave), mix(400, 262, wave)],
  ];
  for (const [w, color] of [[26, C.ink], [16, C.skin]]) {
    ctx.lineWidth = w;
    ctx.strokeStyle = color;
    for (const [x0, y0, ex, ey, x1, y1] of arms) {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(ex, ey);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
  }
  ctx.strokeStyle = C.ink;

  // Petit collier à pendentif
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#d9cfe0';
  ctx.beginPath();
  ctx.moveTo(184, 326);
  ctx.quadraticCurveTo(200, 352, 216, 326);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(200, 344, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = C.ink;

  // ---------- Tête (pivote autour du cou) ----------
  ctx.save();
  ctx.translate(200, 330);
  ctx.rotate(s.tilt);
  ctx.translate(-200, -330);

  // Nœud rose (clin d'œil à Blossom)
  ctx.lineWidth = 5;
  ctx.fillStyle = C.bow;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(200 + side * 52, 74, 50, 30, side * -0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(200, 90, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Visage : grand ovale plus large que haut
  ctx.lineWidth = 6;
  ctx.fillStyle = C.skin;
  ctx.beginPath();
  ctx.ellipse(200, 222, 132, 112, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Mèches qui encadrent le visage + dessus de la tête
  ctx.fillStyle = C.hair;
  for (const p of [PATHS.lockL, PATHS.lockR, PATHS.fringe]) {
    ctx.fill(p);
    ctx.stroke(p);
  }
  ctx.strokeStyle = C.highlight;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(150, 110);
  ctx.quadraticCurveTo(200, 104, 250, 122);
  ctx.stroke();
  ctx.strokeStyle = C.ink;

  // Joues
  ctx.fillStyle = C.blush;
  for (const x of [108, 292]) {
    ctx.beginPath();
    ctx.ellipse(x, 278, 22, 13, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---------- Yeux géants ----------
  const lid = Math.max(e.lid, s.blink);
  for (const side of [-1, 1]) {
    const cx = 200 + side * 54;
    const cy = 236;
    const rx = 50;
    const ry = 58;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(side * 0.1);
    const eye = new Path2D();
    eye.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill(eye);

    ctx.save();
    ctx.clip(eye);
    const ix = s.gx * 16 - side * 6;
    const iy = s.gy * 12 + 4;
    ctx.fillStyle = C.irisRing;
    ctx.beginPath();
    ctx.arc(ix, iy, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.iris;
    ctx.beginPath();
    ctx.arc(ix, iy, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.pupil;
    ctx.beginPath();
    ctx.arc(ix, iy, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ix + 12, iy - 14, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ix - 12, iy + 13, 5, 0, Math.PI * 2);
    ctx.fill();
    // Paupière (expression + clignement)
    if (lid > 0.01) {
      const edge = -ry + lid * ry * 2.05;
      ctx.fillStyle = C.skin;
      ctx.fillRect(-rx - 4, -ry - 4, rx * 2 + 8, edge + ry + 4);
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-rx, edge);
      ctx.quadraticCurveTo(0, edge + 6, rx, edge);
      ctx.stroke();
    }
    ctx.restore();

    ctx.lineWidth = 6;
    ctx.stroke(eye);
    // Cils : virgule épaisse au coin extérieur
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(side * (rx - 6), -ry * 0.45 + lid * ry);
    ctx.quadraticCurveTo(side * (rx + 8), -ry * 0.6 + lid * ry, side * (rx + 16), -ry * 0.85 + lid * ry);
    ctx.stroke();
    ctx.restore();

    // Sourcils fins
    ctx.lineWidth = 5;
    const by = 162 - e.brow * 10;
    ctx.beginPath();
    ctx.moveTo(cx - side * 28, by + (e.brow < 0 ? side * 5 : 0) + 4);
    ctx.quadraticCurveTo(cx, by - 8, cx + side * 28, by + (e.brow < 0 ? -side * 5 : 0) + 4);
    ctx.stroke();
  }

  // ---------- Bouche corail (pas de nez, comme dans le dessin animé) ----------
  ctx.save();
  ctx.translate(200, 306);
  const m = new Path2D(`M${-e.w} ${e.yl}Q0 ${e.top} ${e.w} ${e.yr}Q0 ${e.bottom} ${-e.w} ${e.yl}Z`);
  ctx.fillStyle = C.mouth;
  ctx.fill(m);
  ctx.lineWidth = 5;
  ctx.strokeStyle = C.lips;
  ctx.stroke(m);
  ctx.restore();

  ctx.restore(); // tête
  ctx.restore();
}

/** Interpole l'expression courante vers celle d'une zone */
export function blendExpression(cur, zone, k) {
  const target = CARTOON_EXPRESSIONS[zone] || CARTOON_EXPRESSIONS.center;
  for (const key in cur) cur[key] += (target[key] - cur[key]) * k;
}
