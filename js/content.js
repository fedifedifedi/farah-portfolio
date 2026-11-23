// ============================================================
//  TEXTES DU SITE — modifiez librement ce fichier.
//  Ils sont utilisés à la fois par la version 3D et la version classique.
// ============================================================

import { isEn, CONTENT_EN, merge } from './i18n.js';

export const content = {
  nom: 'Farah Ben Ammar',
  titre: 'Designer graphique — Publicité',
  accroche: 'Des images qui racontent une marque, et des campagnes qui donnent envie de s’arrêter pour regarder.',

  // Panneau d'accueil 3D
  bienvenue: 'Bienvenue',

  apropos: {
    intro:
      'Étudiante en 3e année de licence Design Image, spécialité Publicité graphique, à l’ESSTED Manouba. ' +
      'J’aime construire une idée forte puis la décliner : affiche, campagne, identité visuelle ou édition.',
    // court : libellé affiché sur le panneau 3D (facultatif)
    parcours: [
      { annee: '2025 – 2027', titre: 'Licence Design Image, spécialité Publicité graphique', lieu: 'ESSTED Manouba · 2e et 3e année', court: 'Licence · ESSTED Manouba' },
      { annee: '2026', titre: 'Graphic Design Masterclass Intermediate', lieu: 'Certificat Udemy · Lindsay Marsh · 19,5 h · novembre', court: 'Certificat Udemy' },
      { annee: '2026', titre: 'Stage en montage', lieu: 'Télévision Tunisienne · 15 juillet – 15 août', court: 'Stage · Télévision Tunisienne' },
      { annee: '2026', titre: 'Workshop « Quelle sobriété numérique en 2050 ? »', lieu: 'RAID 2026 · ESSTED, avril', court: 'Workshop · RAID 2026' },
      { annee: '2026', titre: 'Hackathon Flexo Print (Rose Blanche Group)', lieu: 'Refonte du logo et de la charte graphique · février', court: 'Hackathon · Flexo Print' },
      { annee: '2024 – 2025', titre: 'Licence Design Image, 1re année', lieu: 'ISAM Mahdia', court: '1re année · ISAM Mahdia' },
      { annee: '2024', titre: 'Baccalauréat Lettres', lieu: '', court: 'Bac Lettres' },
    ],
    approche:
      'Je pars toujours du message : qui doit le voir, et que doit-il ressentir ? ' +
      'Ensuite viennent les esquisses, le choix des couleurs et des typographies, puis la déclinaison sur tous les supports. ' +
      'Les hackathons m’ont appris à travailler vite, en équipe, sans perdre l’exigence.',
  },

  // Mots qui apparaissent sur le mur des compétences (version 3D) et liste de la version classique
  competences: [
    'Publicité graphique',
    'Campagne publicitaire',
    'Identité visuelle',
    'Charte graphique',
    'Direction artistique',
    'Affiche publicitaire',
    'Édition & mise en page',
    'Montage vidéo',
    'Audiovisuel',
  ],
  logiciels: ['Photoshop', 'Illustrator', 'InDesign', 'Avid Media Composer'],
  atouts: ['Travail en équipe', 'Délais courts', 'Hackathons'],
  langues: ['Arabe (maternelle)', 'Français', 'Anglais'],

  contact: {
    email: 'farahbenammar26@gmail.com',
    // Collez l'adresse complète du profil. Un lien laissé vide ('') n'est pas affiché.
    instagram: '',
    behance: '',
    linkedin: '',
    ville: 'Tunis, Tunisie',
    message: 'Je recherche un stage de fin d’études (PFE) en design graphique et publicité. Écrivez-moi !',
  },

  cv: 'images/cv-farah.pdf',
  // Portfolio complet en PDF (régénéré avec scripts/portfolio-pdf.mjs)
  portfolio: 'images/portfolio-farah.pdf',

  // Attestations et certificats (section « Certificats » de la version classique).
  // Les données personnelles (n° de carte d'identité, date de naissance) sont masquées sur les images.
  // original : lien vers le document d'origine (PDF, page de vérification), facultatif.
  certificats: [
    { titre: 'Graphic Design Masterclass Intermediate', emetteur: 'Udemy · Lindsay Marsh', date: 'Novembre 2026', image: 'images/certificats/udemy-graphic-design.jpg', original: 'https://ude.my/UC-4716a8b5-b859-4ce4-ad64-db8d5354f829' },
    { titre: 'Stage en montage', emetteur: 'Télévision Tunisienne', date: '15 juillet – 15 août 2026', image: 'images/certificats/stage-television-tunisienne.jpg' },
    { titre: 'Workshop « Quelle sobriété numérique en 2050 ? »', emetteur: 'RAID 2026 · ESSTED', date: 'Avril 2026', image: 'images/certificats/raid-2026.jpg', original: 'images/certificats/raid-2026.pdf' },
    { titre: 'Hackathon : refonte du logo et de la charte graphique', emetteur: 'Flexo Print · Rose Blanche Group', date: 'Février 2026', image: 'images/certificats/hackathon-flexo-print.jpg' },
  ],
};

// Version anglaise : les textes de js/i18n.js remplacent les textes français
if (isEn) merge(content, CONTENT_EN);
