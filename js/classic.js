// Version classique (2D) du portfolio : générée à partir de content.js et projects.js
import { content } from './content.js';
import { projects } from './projects.js';
import { openProject } from './modal.js';

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function socialLinks(c = content.contact, cls = 'btn btn--ghost') {
  return [
    ['Instagram', c.instagram],
    ['Behance', c.behance],
    ['LinkedIn', c.linkedin],
  ]
    .filter(([, url]) => url)
    .map(([label, url]) => `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener">${label} ↗</a>`)
    .join('');
}

export function timeline() {
  return `<ul class="timeline">${content.apropos.parcours
    .map((e) => `<li><span class="when">${esc(e.annee)}</span><div><strong>${esc(e.titre)}</strong>${e.lieu ? `<small>${esc(e.lieu)}</small>` : ''}</div></li>`)
    .join('')}</ul>`;
}

let rendered = false;

export function renderClassic() {
  if (rendered) return;
  rendered = true;
  const c = content;
  const root = document.getElementById('classic');

  root.innerHTML = `
  <header class="c-header">
    <div class="c-wrap">
      <a class="c-logo" href="#intro">${esc(c.nom)}</a>
      <nav class="c-nav" aria-label="Navigation principale">
        <a href="#c-projets">Projets</a><a href="#c-apropos">À propos</a><a href="#c-cv">CV</a><a href="#c-contact">Contact</a>
      </nav>
    </div>
  </header>

  <div class="c-marquee" aria-hidden="true">
    <div class="c-marquee__track">
      ${[0, 1].map(() => [...c.logiciels, ...c.competences].map((s) => `<span>${esc(s)}</span>`).join('')).join('')}
    </div>
  </div>

  <section class="c-section" id="c-projets" aria-labelledby="c-projets-title">
    <div class="c-wrap">
      <div class="c-section__head reveal">
        <h2 id="c-projets-title">Projets</h2>
        <p>Campagnes, identités visuelles et édition. Cliquez sur un projet pour le découvrir en détail.</p>
      </div>
      <div class="c-grid">
        ${projects
          .map(
            (p, i) => `
        <button class="c-card reveal" type="button" data-project="${i}">
          <div class="c-card__img"><img src="${esc(p.image)}" alt="" loading="lazy" decoding="async"></div>
          <p class="c-card__meta">${esc([p.categorie, p.annee].filter(Boolean).join(' · '))}</p>
          <h3 class="c-card__title">${esc(p.titre)}</h3>
        </button>`
          )
          .join('')}
      </div>
    </div>
  </section>

  <section class="c-section" id="c-apropos" aria-labelledby="c-apropos-title">
    <div class="c-wrap">
      <div class="c-section__head reveal"><h2 id="c-apropos-title">À propos</h2></div>
      <div class="c-about">
        <div class="reveal">
          <p class="c-about__intro">${esc(c.apropos.intro)}</p>
          <h3>Approche créative</h3>
          <p>${esc(c.apropos.approche)}</p>
          <h3>Parcours</h3>
          ${timeline()}
        </div>
        <div class="reveal">
          <h3>Logiciels</h3>
          <ul class="c-skills">${c.logiciels.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
          <h3>Compétences</h3>
          <ul class="c-skills c-skills--soft">${c.competences.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
          <h3>Atouts</h3>
          <ul class="c-skills c-skills--soft">${c.atouts.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
          <h3>Langues</h3>
          <ul class="c-skills c-skills--soft">${c.langues.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
        </div>
      </div>
    </div>
  </section>

  <section class="c-section c-cv" id="c-cv" aria-labelledby="c-cv-title">
    <div class="c-wrap reveal">
      <div>
        <h2 id="c-cv-title">Mon <em>CV</em></h2>
        <p>Formation, expérience et compétences, en une page.</p>
      </div>
      <a class="btn btn--light" href="${esc(c.cv)}" download>Télécharger le CV (PDF)</a>
    </div>
  </section>

  <section class="c-section" id="c-contact" aria-labelledby="c-contact-title">
    <div class="c-wrap">
      <div class="c-section__head reveal">
        <h2 id="c-contact-title">Contact</h2>
        <p>${esc(c.contact.message)}</p>
      </div>
      <a class="c-contact__mail reveal" href="mailto:${esc(c.contact.email)}">${esc(c.contact.email)}</a>
      <div class="c-contact__links reveal">${socialLinks()}</div>
    </div>
  </section>

  <footer class="c-footer"><div class="c-wrap">© ${new Date().getFullYear()} ${esc(c.nom)} · ${esc(c.contact.ville)}</div></footer>`;

  root.querySelectorAll('[data-project]').forEach((btn) =>
    btn.addEventListener('click', () => openProject(Number(btn.dataset.project)))
  );

  // Animations légères à l'apparition
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }),
    { rootMargin: '0px 0px -8% 0px' }
  );
  root.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}
