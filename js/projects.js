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
    image: 'images/projets/reel-reaktor-billboard.jpg',
    galerie: ['images/projets/reaktor-moodboard.jpg', 'images/projets/reaktor-photo.jpg', 'images/projets/reaktor-packshot.jpg', 'images/projets/reaktor-carte-mentale.jpg'],
    contexte: 'Concept de campagne pour une boisson énergisante, REAKTOR, déclinée en deux produits : Dark Power et Focus Power.',
    objectif: 'Traduire l’idée de dualité « Force × Énergie » : deux facettes d’une même personnalité, mises en scène par le contraste rouge / bleu, du moodboard et de la carte mentale jusqu’au shooting photo.',
    outils: ['Photoshop', 'Direction artistique', 'Photographie'],
  },
  {
    titre: 'Journées Théâtrales de Carthage',
    categorie: 'Affiche culturelle',
    annee: '',
    image: 'images/projets/reel-jtc.jpg',
    galerie: ['images/projets/journees-theatrales-carthage.jpg', 'images/projets/jtc-exposition.jpg'],
    contexte: 'Affiche pour les Journées Théâtrales de Carthage (JTC), exposée avec les travaux des étudiants de l’ESSTED.',
    objectif: 'Évoquer le théâtre par deux profils face à face, dessinés en lignes ondulantes rouges et crème.',
    outils: ['Illustrator'],
  },
  {
    titre: 'بسيسة — Rapporte la bouteille',
    categorie: 'Affiche de sensibilisation',
    annee: '',
    image: 'images/projets/reel-sucette-1.jpg',
    galerie: ['images/projets/bsisa-affiche.jpg'],
    contexte: 'Affiche de sensibilisation pour la marque de boisson بسيسة (Bsisa), mise en situation dans une supérette.',
    objectif: 'Inciter à rapporter la bouteille en verre après consommation : « شربت ؟ رجع الدبوزة — الوعي يبدا منك! » (Tu as bu ? Rapporte la bouteille, la prise de conscience commence par toi !).',
    outils: ['Photoshop', 'Illustrator'],
  },
  {
    titre: 'بسيسة — Affiche promotionnelle',
    categorie: 'Affiche publicitaire',
    annee: '',
    image: 'images/projets/reel-sucette-2.jpg',
    galerie: ['images/projets/bsisa-promo.jpg'],
    contexte: 'Affiche promotionnelle pour la marque de boisson بسيسة (Bsisa), dans un décor traditionnel tunisien.',
    objectif: 'Ancrer le produit dans la tradition et l’émotion : « بسيسة ديما في البال » (Bsisa, toujours dans nos pensées).',
    outils: ['Photoshop'],
  },
  {
    titre: 'حياة ثانية — Titre de documentaire',
    categorie: 'Habillage audiovisuel',
    annee: '2026',
    image: 'images/projets/reel-watania.jpg',
    galerie: ['images/projets/hayat-thania.jpg'],
    contexte: 'Titre pour un documentaire de la Télévision Tunisienne (Al Watania), réalisé pendant le stage en montage.',
    objectif: '« Ḥayāt thāniya » (Une seconde vie) : un titre calligraphié en relief, éclairé par l’ombre des barreaux, qui évoque l’enfermement et l’espoir.',
    outils: ['Photoshop'],
  },
  {
    titre: 'Carte de visite BH Bank',
    categorie: 'Impression',
    annee: '2025',
    image: 'images/projets/reel-cartes-piles.jpg',
    galerie: ['images/projets/carte-visite-bh-bank.jpg', 'images/projets/cmjn-separation-nbc.jpg'],
    contexte: 'Jury Techniques d’impression (PG2, ESSTED) : conception et imposition d’une carte de visite, et exercice de séparation des couleurs.',
    objectif: 'Format fini 85 × 55 mm, recto verso quadrichromie sur couché mat 350 g, imposée sur une feuille 200 × 275 mm avec repères et gammes de contrôle.',
    outils: ['Illustrator', 'InDesign'],
  },
  {
    titre: 'Dépliant VISĀVI — Accordéon 6 volets',
    categorie: 'Édition & impression',
    annee: '2025',
    image: 'images/projets/reel-depliants.jpg',
    galerie: ['images/projets/depliant-visavi.jpg', 'images/projets/depliant-visavi-decoupe.jpg', 'images/projets/depliant-visavi-vernis.jpg'],
    contexte: 'Jury Techniques d’impression (PG2, ESSTED) : dépliant accordéon pour un centre de bien-être et de médecine préventive.',
    objectif: 'Format fini fermé 99 × 210 mm, ouvert 596 × 210 mm, recto verso quadrichromie sur couché brillant 200 g, avec forme de découpe et vernis sélectif recto et verso.',
    outils: ['InDesign', 'Illustrator'],
  },
  {
    titre: 'Dépliant « Danse : Plus qu’une Passion »',
    categorie: 'Édition & impression',
    annee: '2025',
    image: 'images/projets/mockup-depliant-danse.jpg',
    galerie: ['images/projets/depliant-danse.jpg', 'images/projets/depliant-danse-cmjn.jpg'],
    contexte: 'Jury Techniques d’impression (PG2, ESSTED) : dépliant roulé 3 volets sur la danse (classique, orientale, hip-hop).',
    objectif: 'Format fini fermé 100 × 210 mm, ouvert 298 × 210 mm, recto verso quadrichromie sur couché brillant 170 g, avec simulation de la séparation des couches CMJN.',
    outils: ['InDesign', 'Illustrator'],
  },
  {
    titre: 'Couverture « The Trumpet of the Swan »',
    categorie: 'Édition & impression',
    annee: '2025',
    image: 'images/projets/reel-livre-main.jpg',
    galerie: ['images/projets/couverture-trumpet-swan.jpg', 'images/projets/couverture-trumpet-swan-vernis.jpg'],
    contexte: 'Jury Techniques d’impression (PG2, ESSTED) : couverture souple du roman de E.B. White.',
    objectif: 'Format fini fermé 135 × 215 mm, dos carré de 10 mm, couché mat 350 g, avec la pose du vernis sélectif sur le titre et le cygne.',
    outils: ['InDesign', 'Illustrator'],
  },
  {
    titre: 'Tunisia Animation Cinema Days',
    categorie: 'Affiche événementielle',
    annee: '2027',
    image: 'images/projets/reel-theatre.jpg',
    galerie: ['images/projets/tunisia-animation-cinema-days.jpg', 'images/projets/tunisia-animation-logo.jpg', 'images/projets/tunisia-animation-recherche.jpg'],
    contexte: 'Affiche d’un festival de cinéma d’animation organisé à l’ESSTED, du 24 au 27 juin 2027.',
    objectif: 'Annoncer l’événement avec une image claire : pellicule, salle de cinéma et typographie bilingue.',
    outils: ['Photoshop', 'Illustrator'],
  },
  {
    titre: 'Vita Boost — Interface web',
    categorie: 'Web design · Interface',
    annee: '',
    image: 'images/projets/reel-vita-laptop.jpg',
    galerie: ['images/projets/vita-boost.jpg'],
    contexte: 'Projet d’infographie (DS2) : interface d’un site web pour une boisson énergisante naturelle.',
    objectif: 'Concevoir la page d’accueil du site : la canette « Lemon Mint » au centre, un menu clair, un appel à l’action et un message fort (« Énergie naturelle, boost garanti ! ») et des arguments forts : 100 % bio, 0 sucre ajouté.',
    outils: ['Photoshop', 'Illustrator'],
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
    contexte: 'Hackathon organisé le 11 février 2026 par Flexo Print (Rose Blanche Group) avec l’ESSTED : refonte du logo et de la charte graphique de Flexo Print, en équipe (groupe 3).',
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
