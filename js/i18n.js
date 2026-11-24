// ============================================================
//  TRADUCTION ANGLAISE — le site est en français par défaut.
//  La langue vient de l'adresse (?lang=en) ou du dernier choix du visiteur (bouton FR / EN).
//  Pour corriger une traduction : modifiez le texte anglais ci-dessous.
// ============================================================

const fromUrl = new URLSearchParams(location.search).get('lang');
let saved = null;
try { saved = localStorage.getItem('lang'); } catch {}
export const lang = fromUrl === 'en' || fromUrl === 'fr' ? fromUrl : saved === 'en' ? 'en' : 'fr';
export const isEn = lang === 'en';

/** Change de langue (la page se recharge dans la nouvelle langue) */
export function setLang(next) {
  try { localStorage.setItem('lang', next); } catch {}
  const url = new URL(location.href);
  url.searchParams.set('lang', next);
  location.href = url.toString();
}

// ---------- Textes de l'interface (français → anglais) ----------
const UI = {
  'Aller directement au contenu (version classique)': 'Skip to content (classic version)',
  'Version classique': 'Classic version',
  'Version 3D': '3D version',
  'Entrer dans mon univers': 'Enter my world',
  'Voir mes projets': 'See my projects',
  'Télécharger le CV': 'Download my CV',
  'Télécharger le CV (PDF)': 'Download my CV (PDF)',
  'Portfolio PDF': 'Portfolio PDF',
  'Télécharger le portfolio (PDF)': 'Download the portfolio (PDF)',
  'Salut, je suis': 'Hi, I’m',
  'Préparation du voyage…': 'Preparing the journey…',
  'Préparation du voyage 3D…': 'Preparing the 3D journey…',
  'Le voyage est prêt.': 'The journey is ready.',
  'Contexte': 'Context',
  'Objectif': 'Goal',
  'Outils': 'Tools',
  '← Précédent': '← Previous',
  'Suivant →': 'Next →',
  'Précédent': 'Previous',
  'Suivant': 'Next',
  'Choisir': 'Choose',
  'Fermer': 'Close',
  'Projets': 'Projects',
  'À propos': 'About',
  'Certificats': 'Certificates',
  'Contact': 'Contact',
  'Navigation principale': 'Main navigation',
  'Campagnes, affiches et identités visuelles. Faites glisser les affiches, puis ouvrez un projet pour le découvrir en détail.':
    'Campaigns, posters and visual identities. Drag the posters, then open a project to see it in detail.',
  'Projets de Farah': 'Farah’s projects',
  'Voir le projet': 'View project',
  'Approche créative': 'Creative approach',
  'Parcours': 'Background',
  'Logiciels': 'Software',
  'Compétences': 'Skills',
  'Atouts': 'Strengths',
  'Langues': 'Languages',
  'Attestations de stage, de workshop, de hackathon et de formation. Faites glisser les documents, puis ouvrez-en un pour l’agrandir.':
    'Internship, workshop, hackathon and training certificates. Drag the documents, then open one to enlarge it.',
  'Certificats de Farah': 'Farah’s certificates',
  'Voir le document': 'View document',
  'Attestation officielle. Cliquez sur « Voir le document » pour l’afficher en grand.':
    'Official certificate. Click “View document” to see it full size.',
  'Attestation officielle délivrée à Farah Ben Ammar.': 'Official certificate issued to Farah Ben Ammar.',
  'Mon': 'My',
  'Formation, expérience et compétences, en une page.': 'Education, experience and skills on one page.',
  'Tous mes projets réunis dans un document à télécharger.': 'All my projects in one downloadable document.',
  'Voir l’original': 'View original',
  'Attestation : ': 'Certificate: ',
  'Certificat': 'Certificate',
  'Cliquer pour ouvrir l’image seule': 'Click to open the image on its own',
  // Version 3D
  'Accueil': 'Home',
  'Vers le ciel': 'To the sky',
  'Faites défiler pour commencer le voyage': 'Scroll to start the journey',
  'Ma boîte à outils': 'My toolbox',
  'Cap sur les nuages, là où flottent mes projets…': 'Off to the clouds, where my projects float…',
  'Projets · cliquez sur un cadre ou choisissez :': 'Projects · click a frame or choose:',
  'Travaillons ensemble': 'Let’s work together',
  'Aller à : ': 'Go to: ',
  'Étapes du voyage': 'Journey steps',
  'À PROPOS': 'ABOUT',
  'spécialité Publicité graphique': 'majoring in advertising design',
  'CLIQUEZ SUR UN CADRE POUR L’OUVRIR': 'CLICK A FRAME TO OPEN IT',
  'MERCI POUR LA VISITE': 'THANKS FOR VISITING',
  'Stage PFE · design graphique & publicité': 'Final-year internship · graphic & advertising design',
  'CERTIFICAT · ': 'CERTIFICATE · ',
  'CONTEXTE': 'CONTEXT',
  'OBJECTIF': 'GOAL',
  '✕  Fermer': '✕  Close',
  'Voir l’original  ↗': 'View original  ↗',
  'Photographie': 'Photography',
  'Direction artistique': 'Art direction',
};

/** Traduit un texte de l'interface (il reste en français si aucune traduction n'existe) */
export const t = (fr) => (isEn ? UI[fr] ?? fr : fr);

// ---------- Textes de Farah en anglais (mêmes clés que js/content.js) ----------
export const CONTENT_EN = {
  portfolio: 'images/portfolio-farah-en.pdf',
  titre: 'Graphic Designer — Advertising',
  accroche: 'Images that tell a brand’s story, and campaigns that make you stop and look.',
  bienvenue: 'Welcome',
  apropos: {
    intro:
      'Third-year student in a Bachelor of Image Design, majoring in advertising design, at ESSTED Manouba. ' +
      'I love building one strong idea and rolling it out: posters, campaigns, visual identities and print.',
    parcours: [
      { annee: '2025 – 2027', titre: 'Bachelor of Image Design, majoring in advertising design', lieu: 'ESSTED Manouba · 2nd and 3rd year', court: 'Bachelor · ESSTED Manouba' },
      { annee: '2026', titre: 'Graphic Design Masterclass Intermediate', lieu: 'Udemy certificate · Lindsay Marsh · 19.5 h · November', court: 'Udemy certificate' },
      { annee: '2026', titre: 'Video editing internship', lieu: 'Télévision Tunisienne · July 15 – August 15', court: 'Internship · Tunisian TV' },
      { annee: '2026', titre: 'Workshop “What digital sobriety in 2050?”', lieu: 'RAID 2026 · ESSTED, April', court: 'Workshop · RAID 2026' },
      { annee: '2026', titre: 'Flexo Print hackathon (Rose Blanche Group)', lieu: 'Logo and brand guidelines redesign · February', court: 'Hackathon · Flexo Print' },
      { annee: '2026', titre: 'XIA hackathon', lieu: 'Hackathon · teamwork', court: 'Hackathon · XIA' },
      { annee: '2024 – 2025', titre: 'Bachelor of Image Design, 1st year', lieu: 'ISAM Mahdia', court: '1st year · ISAM Mahdia' },
      { annee: '2024', titre: 'Baccalaureate in Literature', lieu: '', court: 'Literature Baccalaureate' },
    ],
    approche:
      'I always start from the message: who needs to see it, and what should they feel? ' +
      'Then come the sketches, the choice of colours and typefaces, and the rollout across every medium. ' +
      'Hackathons taught me to work fast, as a team, without lowering my standards.',
  },
  competences: [
    'Advertising design', 'Advertising campaigns', 'Visual identity', 'Brand guidelines', 'Art direction',
    'Advertising posters', 'Editorial design & layout', 'Video editing', 'Audiovisual',
  ],
  atouts: ['Teamwork', 'Tight deadlines', 'Hackathons'],
  langues: ['Arabic (native)', 'French', 'English'],
  contact: {
    ville: 'Tunis, Tunisia',
    message: 'I’m looking for a final-year internship (PFE) in graphic and advertising design. Get in touch!',
  },
  certificats: [
    { titre: 'Graphic Design Masterclass Intermediate', emetteur: 'Udemy · Lindsay Marsh', date: 'November 2026' },
    { titre: 'Video editing internship', emetteur: 'Télévision Tunisienne', date: 'July 15 – August 15, 2026' },
    { titre: 'Workshop “What digital sobriety in 2050?”', emetteur: 'RAID 2026 · ESSTED', date: 'April 2026' },
    { titre: 'Hackathon: logo and brand guidelines redesign', emetteur: 'Flexo Print · Rose Blanche Group', date: 'February 2026' },
  ],
};

// ---------- Projets en anglais (clé = titre français dans js/projects.js) ----------
export const PROJECTS_EN = {
  'REAKTOR — Dualité': {
    titre: 'REAKTOR — Duality', categorie: 'Photography',
    contexte: 'Photo shoot for REAKTOR, an energy drink available in two products: Dark Power and Focus Power.',
    objectif: 'Embody the concept of duality, “Strength × Energy”: two sides of the same personality, expressed through the contrast of red and blue light, a bold gaze and the Dark Power bottle in the spotlight.',
    outils: ['Photography', 'Art direction', 'Photoshop'],
  },
  'Charte graphique — FARAH, cosmétiques': {
    titre: 'Brand guidelines — FARAH cosmetics', categorie: 'Visual identity',
    contexte: 'Computer graphics project: the complete identity of an organic, natural cosmetics brand inspired by Mediterranean craftsmanship, “FARAH” (joy, in Arabic).',
    objectif: 'Build the full guidelines: a Latin and Arabic calligraphic logo, clear space and minimum size, variations and misuse, a sand / olive / terracotta palette, typefaces, a monochrome version and product mockups.',
  },
  'Journées Théâtrales de Carthage': {
    titre: 'Carthage Theatre Days', categorie: 'Cultural poster',
    contexte: 'Poster for the Carthage Theatre Days (JTC), exhibited with the work of ESSTED students.',
    objectif: 'Evoke theatre with two facing profiles drawn in red and cream wavy lines.',
  },
  'بسيسة — Rapporte la bouteille': {
    titre: 'بسيسة — Bring the bottle back', categorie: 'Awareness poster',
    contexte: 'Awareness poster for the drink brand بسيسة (Bsisa).',
    objectif: 'Encourage people to return the glass bottle after drinking: “شربت ؟ رجع الدبوزة — الوعي يبدا منك!” (Finished your drink? Bring the bottle back — awareness starts with you!).',
  },
  'بسيسة — Affiche promotionnelle': {
    titre: 'بسيسة — Promotional poster', categorie: 'Advertising poster',
    contexte: 'Promotional poster for the drink brand بسيسة (Bsisa), set in a traditional Tunisian scene.',
    objectif: 'Root the product in tradition and emotion: “بسيسة ديما في البال” (Bsisa, always on our minds).',
  },
  'حياة ثانية — Titre de documentaire': {
    titre: 'حياة ثانية — Documentary title', categorie: 'TV graphics',
    contexte: 'Title for a documentary by Tunisian Television (Al Watania 1), created during the video editing internship.',
    objectif: '“Ḥayāt thāniya” (A second life): an embossed calligraphic title, lit through the shadow of prison bars, evoking confinement and hope.',
  },
  'Carte de visite BH Bank': {
    titre: 'BH Bank business card', categorie: 'Print',
    contexte: 'Printing techniques jury (2nd year, ESSTED): design and imposition of a business card, plus a colour separation exercise.',
    objectif: 'Finished size 85 × 55 mm, double-sided four-colour print on 350 g matte coated paper, imposed on a 200 × 275 mm sheet with crop marks and control strips.',
  },
  'Dépliant VISĀVI — Accordéon 6 volets': {
    titre: 'VISĀVI leaflet — 6-panel accordion fold', categorie: 'Editorial design & print',
    contexte: 'Printing techniques jury (2nd year, ESSTED): accordion leaflet for a wellness and preventive medicine centre.',
    objectif: 'Closed size 99 × 210 mm, open 596 × 210 mm, double-sided four-colour print on 200 g gloss coated paper, with a die-cut and spot UV varnish on both sides.',
  },
  'Dépliant « Danse : Plus qu’une Passion »': {
    titre: 'Leaflet “Dance: More than a Passion”', categorie: 'Editorial design & print',
    contexte: 'Printing techniques jury (2nd year, ESSTED): 3-panel roll-fold leaflet about dance (classical, oriental, hip-hop).',
    objectif: 'Closed size 100 × 210 mm, open 298 × 210 mm, double-sided four-colour print on 170 g gloss coated paper, with a simulated CMYK separation.',
  },
  'Couverture « The Trumpet of the Swan »': {
    titre: 'Book cover “The Trumpet of the Swan”', categorie: 'Editorial design & print',
    contexte: 'Printing techniques jury (2nd year, ESSTED): paperback cover for E.B. White’s novel.',
    objectif: 'Closed size 135 × 215 mm, 10 mm square spine, 350 g matte coated paper, with spot UV varnish on the title and the swan.',
  },
  'Tunisia Animation Cinema Days': {
    titre: 'Tunisia Animation Cinema Days', categorie: 'Event poster',
    contexte: 'Poster for an animated film festival held at ESSTED, June 24–27, 2027.',
    objectif: 'Announce the event with a clear image: film strip, cinema seats and bilingual typography.',
  },
  'Vita Boost — Interface web': {
    titre: 'Vita Boost — Web interface', categorie: 'Web design · Interface',
    contexte: 'Computer graphics project: website interface for a natural energy drink.',
    objectif: 'Design the home page: the “Lemon Mint” can in the centre, a clear menu, a call to action, a strong message (“Natural energy, guaranteed boost!”) and key selling points: 100% organic, no added sugar.',
  },
};

/** Fusionne la traduction dans l'objet français (seules les clés traduites sont remplacées) */
export function merge(target, source) {
  for (const [k, v] of Object.entries(source)) {
    if (Array.isArray(v)) target[k] = v.map((item, i) => (item && typeof item === 'object' && target[k]?.[i] ? merge({ ...target[k][i] }, item) : item));
    else if (v && typeof v === 'object') target[k] = merge({ ...(target[k] || {}) }, v);
    else target[k] = v;
  }
  return target;
}
