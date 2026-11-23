// Version classique (2D) du portfolio : générée à partir de content.js et projects.js
import { content } from './content.js';
import { projects } from './projects.js';
import { openProject } from './modal.js';
import { initShowcase } from './showcase.js';

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
  <div class="c-glitter" aria-hidden="true"></div>
  <header class="c-header">
    <div class="c-wrap">
      <a class="c-logo" href="#intro">${esc(c.nom)}</a>
      <nav class="c-nav" aria-label="Navigation principale">
        <a href="#c-projets">Projets</a><a href="#c-apropos">À propos</a><a href="#c-certificats">Certificats</a><a href="#c-cv">CV</a><a href="#c-contact">Contact</a>
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
        <p>Campagnes, affiches et identités visuelles. Faites glisser les affiches, puis ouvrez un projet pour le découvrir en détail.</p>
      </div>
    </div>
    <!-- Vitrine 3D des projets (js/showcase.js) -->
    <div class="showcase reveal" id="showcase" role="region" aria-roledescription="carrousel" aria-label="Projets de Farah" tabindex="0">
      <div class="showcase__stage">
        ${projects
          .map(
            (p, i) => `
        <button class="showcase__item" type="button" data-index="${i}" aria-label="${esc(p.titre)}">
          <span class="showcase__poster"><img src="${esc(p.image)}" alt="" decoding="async" ${i > 2 ? 'loading="lazy"' : ''}></span>
          <span class="showcase__reflect" aria-hidden="true"><img src="${esc(p.image)}" alt="" decoding="async" loading="lazy"></span>
        </button>`
          )
          .join('')}
      </div>
      <div class="c-wrap showcase__bottom">
        <div class="showcase__info" aria-live="polite">
          <p class="showcase__count"><span data-sc="num">01</span> <span>/ ${String(projects.length).padStart(2, '0')}</span></p>
          <p class="showcase__cat" data-sc="cat"></p>
          <h3 class="showcase__title" data-sc="title"></h3>
          <p class="showcase__text" data-sc="text"></p>
          <ul class="tags" data-sc="tools"></ul>
          <button class="btn btn--arrow" type="button" data-sc="open">Voir le projet</button>
        </div>
        <div class="showcase__nav">
          <button class="showcase__arrow" type="button" data-sc="prev" aria-label="Projet précédent">←</button>
          <div class="showcase__thumbs" role="tablist" aria-label="Choisir un projet">
            ${projects.map((p, i) => `<button type="button" role="tab" data-thumb="${i}" aria-label="${esc(p.titre)}"><img src="${esc(p.image)}" alt="" loading="lazy" decoding="async"></button>`).join('')}
          </div>
          <button class="showcase__arrow" type="button" data-sc="next" aria-label="Projet suivant">→</button>
        </div>
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

  <section class="c-section" id="c-certificats" aria-labelledby="c-certificats-title">
    <div class="c-wrap">
      <div class="c-section__head reveal">
        <h2 id="c-certificats-title">Certificats</h2>
        <p>Attestations de stage, de workshop, de hackathon et de formation. Cliquez sur un document pour l’agrandir.</p>
      </div>
      <div class="c-certs">
        ${(c.certificats || [])
          .map(
            (cert) => `
        <a class="c-cert reveal" href="${esc(cert.image)}" target="_blank" rel="noopener">
          <span class="c-cert__img"><img src="${esc(cert.image)}" alt="Attestation : ${esc(cert.titre)}" loading="lazy" decoding="async"></span>
          <span class="c-cert__meta">${esc(cert.emetteur)} · ${esc(cert.date)}</span>
          <span class="c-cert__title">${esc(cert.titre)}</span>
        </a>`
          )
          .join('')}
      </div>
    </div>
  </section>

  <section class="c-section c-cv" id="c-cv" aria-labelledby="c-cv-title">
    <div class="c-wrap reveal">
      <div>
        <h2 id="c-cv-title">Mon <em>CV</em></h2>
        <p>Formation, expérience et compétences, en une page.</p>
      </div>
      <a class="btn btn--light btn--download" href="${esc(c.cv)}" download>Télécharger le CV (PDF)</a>
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

  initShowcase(root.querySelector('#showcase'), projects, openProject);
  root.querySelectorAll('[data-project]').forEach((btn) =>
    btn.addEventListener('click', () => openProject(Number(btn.dataset.project)))
  );

  // Animations légères à l'apparition
  // Les éléments qui entrent à l'écran en même temps apparaissent l'un après l'autre (90 ms d'écart)
  const io = new IntersectionObserver(
    (entries) => entries
      .filter((e) => e.isIntersecting)
      .forEach((e, i) => {
        e.target.style.setProperty('--reveal-delay', `${Math.min(i, 6) * 90}ms`);
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }),
    { rootMargin: '0px 0px -10% 0px' }
  );
  root.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}
