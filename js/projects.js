// ============================================================
//  PROJETS — pour en ajouter un, copiez un bloc { ... } et modifiez-le.
//  L'ordre de la liste = l'ordre d'apparition dans les nuages et dans la grille.
//
//  titre      : nom du projet
//  categorie  : ex. « Affiche », « Campagne », « Identité visuelle », « Édition »
//  annee      : texte libre (laissez '' pour ne rien afficher)
//  image      : image principale (cadre 3D + vignette de la grille)
//  galerie    : images supplémentaires affichées dans la fenêtre détaillée (facultatif)
//  contexte   : d'où vient le projet (cours, hackathon, client…)
//  objectif   : ce que le visuel devait accomplir
//  outils     : logiciels utilisés
//  masque     : true = projet caché sur le site (ex. en attente de ses vrais visuels).
//               Mettez false (ou supprimez la ligne) pour l'afficher.
// ============================================================

const tous = [
  {
    titre: 'REAKTOR — Dualité',
    categorie: 'Campagne publicitaire',
    annee: '',
    image: 'images/projets/reaktor-moodboard.jpg',
    galerie: ['images/projets/reaktor-shooting.jpg', 'images/projets/reaktor-carte-mentale.jpg'],
    contexte: 'Concept de campagne pour une boisson énergisante, REAKTOR, déclinée en deux produits : Dark Power et Focus Power.',
    objectif: 'Traduire l’idée de dualité « Force × Énergie » : deux facettes d’une même personnalité, mises en scène par le contraste rouge / bleu, du moodboard et de la carte mentale jusqu’au shooting photo.',
    outils: ['Photoshop', 'Direction artistique', 'Photographie'],
  },
  {
    titre: 'بسيسة — Rapporte la bouteille',
    categorie: 'Affiche de sensibilisation',
    annee: '',
    image: 'images/projets/bsisa-affiche.jpg',
    galerie: [],
    contexte: 'Affiche de sensibilisation pour la marque de boisson بسيسة (Bsisa), mise en situation dans une supérette.',
    objectif: 'Inciter à rapporter la bouteille en verre après consommation : « شربت ؟ رجع الدبوزة — الوعي يبدا منك! » (Tu as bu ? Rapporte la bouteille, la prise de conscience commence par toi !).',
    outils: ['Photoshop', 'Illustrator'],
  },
  {
    titre: 'بسيسة — Affiche promotionnelle',
    categorie: 'Affiche publicitaire',
    annee: '',
    image: 'images/projets/bsisa-promo.jpg',
    galerie: [],
    contexte: 'Affiche promotionnelle pour la marque de boisson بسيسة (Bsisa), dans un décor traditionnel tunisien.',
    objectif: 'Ancrer le produit dans la tradition et l’émotion : « بسيسة ديما في البال » (Bsisa, toujours dans nos pensées).',
    outils: ['Photoshop'],
  },
  {
    titre: 'Tunisia Animation Cinema Days',
    categorie: 'Affiche événementielle',
    annee: '2027',
    image: 'images/projets/tunisia-animation-cinema-days.jpg',
    galerie: ['images/projets/tunisia-animation-exposition.jpg'],
    contexte: 'Affiche d’un festival de cinéma d’animation organisé à l’ESSTED, du 24 au 27 juin 2027.',
    objectif: 'Annoncer l’événement avec une image claire : pellicule, salle de cinéma et typographie bilingue.',
    outils: ['Photoshop', 'Illustrator'],
  },
  {
    titre: 'Journées Théâtrales de Carthage',
    categorie: 'Affiche culturelle',
    annee: '',
    image: 'images/projets/journees-theatrales-carthage.jpg',
    galerie: [],
    contexte: 'Affiche pour les Journées Théâtrales de Carthage (JTC).',
    objectif: 'Évoquer le théâtre par deux profils face à face, dessinés en lignes ondulantes rouges et crème.',
    outils: ['Illustrator'],
  },
  {
    titre: 'Campagne Chips Up',
    categorie: 'Campagne publicitaire',
    annee: '',
    masque: true, // visuel provisoire : à remplacer
    image: 'images/projets/chips-up-1.svg',
    galerie: ['images/projets/chips-up-2.svg'],
    contexte: 'Projet académique : concevoir une campagne complète pour une marque de chips.',
    objectif: 'Trouver un concept créatif fort, créer les visuels et décliner le message publicitaire sur plusieurs supports.',
    outils: ['Illustrator', 'Photoshop'],
  },
  {
    titre: 'Charte graphique — La Rose Blanche',
    categorie: 'Identité visuelle',
    annee: '',
    masque: true, // visuel provisoire : à remplacer
    image: 'images/projets/rose-blanche-1.svg',
    galerie: ['images/projets/rose-blanche-2.svg'],
    contexte: 'Hackathon La Rose Blanche, travail en équipe sur un temps très court.',
    objectif: 'Définir l’identité visuelle du projet : couleurs, typographies et règles d’utilisation.',
    outils: ['Illustrator', 'InDesign'],
  },
  {
    titre: 'Design de projet — Hackathon',
    categorie: 'Design',
    annee: '',
    masque: true, // visuel provisoire : à remplacer
    image: 'images/projets/hackathon-1.svg',
    galerie: [],
    contexte: 'Second hackathon : prise en charge de tout le design du projet au sein de l’équipe.',
    objectif: 'Rendre le projet clair et convaincant pour le jury, dans les délais propres au format.',
    outils: ['Photoshop', 'Illustrator'],
  },
  {
    titre: 'Dépliant « 3 mètres sur l’eau »',
    categorie: 'Édition',
    annee: '',
    masque: true, // visuel provisoire : à remplacer
    image: 'images/projets/depliant-1.svg',
    galerie: ['images/projets/depliant-2.svg'],
    contexte: 'Projet d’édition : conception et mise en page d’un dépliant.',
    objectif: 'Organiser les contenus, construire une hiérarchie visuelle lisible et composer les pages.',
    outils: ['InDesign', 'Photoshop'],
  },
];

// Projets affichés sur le site (version 3D et version classique)
export const projects = tous.filter((p) => !p.masque);
