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
// ============================================================

export const projects = [
  {
    titre: 'Campagne Chips Up',
    categorie: 'Campagne publicitaire',
    annee: '',
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
    image: 'images/projets/depliant-1.svg',
    galerie: ['images/projets/depliant-2.svg'],
    contexte: 'Projet d’édition : conception et mise en page d’un dépliant.',
    objectif: 'Organiser les contenus, construire une hiérarchie visuelle lisible et composer les pages.',
    outils: ['InDesign', 'Photoshop'],
  },
];
