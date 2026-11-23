// Point d'entrée : accueil avec avatar, puis version 3D ou version classique.
// La 3D (et Three.js) n'est chargée que si on en a besoin : la version classique reste légère.
import { content } from './content.js';
import { renderClassic } from './classic.js';
import { initAvatar } from './avatar.js';
import { initFx } from './fx.js';
import { lang, isEn, t, setLang } from './i18n.js';

const body = document.body;
const $ = (id) => document.getElementById(id);
const toggle = $('mode-toggle');
const experienceEl = $('experience');
const classicEl = $('classic');
const loader = $('loader');
const introStatus = $('intro-status');

const params = new URLSearchParams(location.search);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let webgl = (() => {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
})();

// ---------- Langue : textes fixes de la page traduits, bouton FR / EN ----------
document.documentElement.lang = lang;
if (isEn) {
  document.title = 'Farah Ben Ammar — Graphic Designer, Advertising';
  const tr = (sel, attr) => document.querySelectorAll(sel).forEach((el) => {
    if (attr) el.setAttribute(attr, t(el.getAttribute(attr)));
    else el.textContent = t(el.textContent.trim());
  });
  tr('.skip-link');
  tr('.loader__sub');
  tr('.modal__text h3');
  tr('[data-prev]'); tr('[data-next]');
  tr('.modal__close', 'aria-label');
  tr('#stages', 'aria-label');
  $('intro-title').firstChild.textContent = t('Salut, je suis') + ' ';
}
const langToggle = $('lang-toggle');
langToggle.textContent = isEn ? 'FR' : 'EN';
langToggle.setAttribute('aria-label', isEn ? 'Voir le site en français' : 'View the site in English');
langToggle.addEventListener('click', () => setLang(isEn ? 'fr' : 'en'));

// ---------- Accueil ----------
$('intro-name').textContent = content.nom.split(' ')[0];
$('intro-sub').textContent = content.titre;
$('intro-tagline').textContent = content.accroche;
$('intro-cv').href = content.cv;
$('intro-cv').textContent = t('Télécharger le CV');
$('intro-portfolio').href = content.portfolio;
$('intro-portfolio').textContent = t('Portfolio PDF');
const avatar = initAvatar($('avatar'));
initFx();

let mode = null;
let experience = null;
let loading = null;
let introOpen = false;
const scrollMemory = { '3d': 0, classic: 0 };

function setProgress(v) {
  const pct = Math.round(Math.min(1, Math.max(0, v)) * 100);
  $('loader-fill').style.width = pct + '%';
  $('loader-pct').textContent = pct + ' %';
  introStatus.textContent = pct < 100 ? `${t('Préparation du voyage 3D…')} ${pct} %` : t('Le voyage est prêt.');
}

function load3D() {
  if (loading) return loading;
  setProgress(0.05);
  loading = (async () => {
    try {
      const { createExperience } = await import('./three/experience.js');
      setProgress(0.2);
      experience = await createExperience({
        onProgress: (v) => setProgress(0.2 + v * 0.8),
        // ?p=0.5 dans l'adresse = démarrer à mi-parcours (pratique pour tester une étape)
        startAt: params.has('p') ? Number(params.get('p')) : null,
      });
      setProgress(1);
      if (mode !== '3d' || introOpen) experience.pause();
      setTimeout(() => loader.classList.add('is-done'), 350);
    } catch (err) {
      console.error('La version 3D n’a pas pu démarrer :', err);
      webgl = false;
      loader.classList.add('is-done');
      introStatus.textContent = '';
      setMode('classic');
    }
  })();
  return loading;
}

function showIntro() {
  introOpen = true;
  body.classList.add('intro-open');
  body.classList.remove('intro-done');
  avatar.setEnabled(true);
  scrollTo(0, 0);
}

/** « Entrer dans mon univers » : on quitte l'accueil et on lance le parcours 3D */
function enterUniverse() {
  if (mode !== '3d') { setMode('3d', { skipIntro: true }); return; }
  introOpen = false;
  body.classList.remove('intro-open');
  body.classList.add('intro-done');
  avatar.setEnabled(false);
  if (experience) experience.resume();
  else { loader.hidden = false; loader.classList.remove('is-done'); }
  experienceEl.querySelector('#stages button')?.focus({ preventScroll: true });
}

async function setMode(next, { skipIntro = false } = {}) {
  if (next === mode) return;
  if (mode) scrollMemory[mode] = scrollY;
  mode = next;
  const is3d = next === '3d';

  body.classList.toggle('is-classic', !is3d);
  experienceEl.hidden = !is3d;
  classicEl.hidden = is3d;
  toggle.textContent = is3d ? t('Version classique') : t('Version 3D');
  toggle.hidden = !is3d && !webgl;
  $('intro-enter').textContent = !is3d && !webgl ? t('Voir mes projets') : t('Entrer dans mon univers');

  if (!is3d) {
    renderClassic();
    experience?.pause();
    introOpen = false;
    body.classList.remove('intro-open');
    avatar.setEnabled(true); // l'accueil est en haut de la version classique
    loader.classList.add('is-done');
    history.replaceState(null, '', location.pathname + location.search); // version par défaut : adresse sans suffixe
    scrollTo(0, scrollMemory.classic);
    return;
  }

  history.replaceState(null, '', location.pathname + location.search + '#3d'); // un rechargement reste en 3D
  if (skipIntro) {
    introOpen = true; // enterUniverse le referme
    loader.hidden = false;
    loader.classList.remove('is-done');
    scrollTo(0, scrollMemory['3d']);
    enterUniverse();
  } else {
    showIntro();
  }
  load3D();
}

toggle.addEventListener('click', () => setMode(mode === '3d' ? 'classic' : '3d', { skipIntro: true }));
$('intro-enter').addEventListener('click', () => {
  if (!webgl) { document.getElementById('c-projets')?.scrollIntoView({ behavior: 'smooth' }); return; }
  enterUniverse();
});
document.querySelector('[data-go-classic]').addEventListener('click', (e) => {
  e.preventDefault();
  setMode('classic');
  classicEl.focus();
});

// Le portfolio s'ouvre sur la version classique.
// La 3D s'ouvre avec le bouton « Version 3D », ou directement avec l'adresse …/#3d (ou ?p=0.5 pour tester une étape).
const wants3d = location.hash === '#3d' || params.get('mode') === '3d' || params.has('p');
if (webgl && wants3d) setMode('3d', { skipIntro: true });
else setMode('classic');
