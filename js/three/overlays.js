// Textes HTML superposés à la 3D (plus lisibles et accessibles que du texte 3D)
// + menu des étapes à droite de l'écran.
import { content } from '../content.js';
import { projects } from '../projects.js';
import { openProject } from '../modal.js';
import { socialLinks, timeline } from '../classic.js';

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const HTML = {
  accueil: () => `
    <div class="overlay overlay--hero" data-stage="accueil">
      <p>${esc(content.accroche)}</p>
      <span class="scroll-cue">Faites défiler pour commencer le voyage</span>
    </div>`,
  apropos: () => `
    <section class="overlay" data-stage="apropos" aria-labelledby="ov-apropos">
      <span class="eyebrow">À propos</span>
      <h2 id="ov-apropos">Parcours</h2>
      <p>${esc(content.apropos.intro)}</p>
      ${timeline()}
    </section>`,
  competences: () => `
    <section class="overlay overlay--right" data-stage="competences" aria-labelledby="ov-comp">
      <span class="eyebrow">Compétences</span>
      <h2 id="ov-comp">Ma boîte à outils</h2>
      <p>${esc(content.apropos.approche)}</p>
      <ul class="tags">${content.logiciels.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
    </section>`,
  ciel: () => `
    <div class="overlay overlay--caption" data-stage="ciel">
      <p>Cap sur les nuages, là où flottent mes projets…</p>
    </div>`,
  projets: () => `
    <section class="overlay overlay--bar" data-stage="projets" aria-labelledby="ov-proj">
      <h2 id="ov-proj" class="eyebrow">Projets · cliquez sur un cadre ou choisissez :</h2>
      <ul class="project-chips">${projects.map((p, i) => `<li><button type="button" data-project="${i}">${esc(p.titre)}</button></li>`).join('')}</ul>
    </section>`,
  contact: () => `
    <section class="overlay overlay--contact" data-stage="contact" aria-labelledby="ov-contact">
      <span class="eyebrow">Contact</span>
      <h2 id="ov-contact">Travaillons ensemble</h2>
      <p>${esc(content.contact.message)}</p>
      <div class="contact-links">
        <a class="btn" href="mailto:${esc(content.contact.email)}">${esc(content.contact.email)}</a>
        <a class="btn btn--ghost" href="${esc(content.cv)}" download>Télécharger le CV</a>
        ${socialLinks()}
      </div>
    </section>`,
};

/**
 * stages : [{ id, label, from, to, jump }] — from/to : plage (distance caméra) où le texte est visible,
 * jump : distance où le menu emmène le visiteur
 */
export function createOverlays(stages, { jumpTo }) {
  const root = document.getElementById('overlays');
  const nav = document.getElementById('stages');
  root.innerHTML = stages.map((s) => HTML[s.id]()).join('');
  nav.innerHTML = stages
    .map((s) => `<button type="button" data-jump="${s.id}" aria-label="Aller à : ${esc(s.label)}"><span>${esc(s.label)}</span></button>`)
    .join('');

  nav.querySelectorAll('[data-jump]').forEach((b) =>
    b.addEventListener('click', () => jumpTo(stages.find((s) => s.id === b.dataset.jump).jump))
  );
  root.querySelectorAll('[data-project]').forEach((b) =>
    b.addEventListener('click', () => openProject(Number(b.dataset.project)))
  );

  const panels = stages.map((s) => ({ ...s, el: root.querySelector(`[data-stage="${s.id}"]`), btn: nav.querySelector(`[data-jump="${s.id}"]`), on: null }));
  const fill = document.getElementById('progress-fill');

  return {
    update(camS, progress) {
      let active = panels[0];
      for (const p of panels) {
        const on = camS >= p.from && camS <= p.to;
        if (on !== p.on) {
          p.el.classList.toggle('is-visible', on);
          p.el.inert = !on; // pas de focus clavier sur un texte caché
          p.on = on;
        }
        if (camS >= p.jump - 1) active = p;
      }
      for (const p of panels) p.btn.classList.toggle('is-active', p === active);
      fill.style.width = (progress * 100).toFixed(2) + '%';
    },
  };
}
