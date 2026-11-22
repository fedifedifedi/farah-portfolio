# Portfolio — Farah Ben Ammar

Site statique (HTML/CSS/JS, Three.js 0.160.0 via CDN), prêt pour GitHub Pages.

## Modifier le contenu
| Quoi | Où |
|---|---|
| Textes (nom, accroche, à propos, compétences, contact, liens) | `js/content.js` |
| Projets (titre, image, contexte, objectif, outils) | `js/projects.js` |
| Images des projets | `images/projets/` |
| CV | `images/cv-farah.pdf` |
| Avatar en vidéo | `images/avatar-left.mp4`, `images/avatar-center.mp4`, `images/avatar-right.mp4`, `images/avatar.png` |
| Photo de l'accueil (les yeux suivent la souris) | `images/avatar.jpg` — position des yeux : `EYES` dans `js/avatar.js` |
| Personnage 3D (couleurs de la tenue) | `C` en haut de `js/three/character.js` |
| Effets (étoiles, traînée du curseur, cartes inclinables) | `js/fx.js` |

## Avatar de l'accueil
Tant que les trois vidéos ne sont pas dans `images/`, le site affiche la photo `images/avatar.jpg` : elle pivote vers la zone du curseur et ses yeux le suivent.
Dès que les trois fichiers existent (noms exacts, en minuscules), le mode vidéo s'active tout seul :
chaque vidéo est jouée une fois quand le curseur entre dans sa zone, puis reste sur sa dernière image.
`images/avatar.png` est l'image affichée pendant le chargement des vidéos.

Compresser une vidéo (H.264, sans son, 720 px de large, moins de 2 Mo) :

    ffmpeg -i source.mp4 -an -vf "scale=720:-2,fps=30" -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -movflags +faststart images/avatar-left.mp4

Si le fichier dépasse encore 2 Mo, augmenter `-crf` (30, 32) ou raccourcir la vidéo.

## Tester en local
Ouvrir `index.html` directement ne marche pas (modules JS). Lancer un serveur dans le dossier :

    python -m http.server 8000

(ou `npx serve .`), puis ouvrir http://localhost:8000. `?p=0.6` dans l'adresse démarre la 3D à 60 % du parcours ; `#classique` ouvre la version classique.
