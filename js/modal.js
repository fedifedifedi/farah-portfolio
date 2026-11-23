// Fenêtre détaillée d'un projet (élément <dialog> natif : Échap, focus et accessibilité gérés par le navigateur)
import { projects } from './projects.js';

const dialog = document.getElementById('project-modal');
const $ = (id) => document.getElementById(id);
let current = 0;
let onCloseCallback = null;

function render(index) {
  current = (index + projects.length) % projects.length;
  const p = projects[current];

  const media = $('modal-media');
  media.replaceChildren(
    ...(/(mockup|reel)-/.test(p.image) ? [...(p.galerie || []), p.image] : [p.image, ...(p.galerie || [])]).map((src, i) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = i === 0 ? p.titre : `${p.titre} — visuel ${i + 1}`;
      img.decoding = 'async';
      return img;
    })
  );

  $('modal-cat').textContent = [p.categorie, p.annee].filter(Boolean).join(' · ');
  $('modal-title').textContent = p.titre;
  $('modal-context').textContent = p.contexte;
  $('modal-goal').textContent = p.objectif;
  $('modal-tools').replaceChildren(
    ...p.outils.map((tool) => Object.assign(document.createElement('li'), { textContent: tool }))
  );
  dialog.querySelector('.modal__inner').scrollTop = 0;
  media.scrollTop = 0;
}

export function openProject(index, { onClose } = {}) {
  onCloseCallback = onClose || null;
  render(index);
  if (!dialog.open) dialog.showModal();
}

dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
dialog.querySelector('[data-prev]').addEventListener('click', () => render(current - 1));
dialog.querySelector('[data-next]').addEventListener('click', () => render(current + 1));
// Clic sur le fond sombre = fermeture
dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => { if (onCloseCallback) onCloseCallback(); });
