# Changements de design par rapport à coquille-web

Ce qui a changé à l'écran entre le site Gatsby (`coquille-web`) et la conversion Astro (`bibweb`). État au 22 octobre 2026.

Ce document ne parle que de l'apparence et de l'usage. Les corrections techniques, d'accessibilité et de contenu sont dans `docs/GATSBY-VERS-ASTRO.md` ; les décisions en attente sont dans `docs/A-FAIRE.md`.

---

## 1. Coquille (sur toutes les pages)

### En-tête

- **Barre de bureau sur la bannière** : un voile bleu foncé uni, plus sombre que dans la source, pour que le texte blanc soit lisible (contraste AA). Le fondu en bas de la barre est retiré.
- **Pages sans grande photo** (nouvelles, répertoire, consentement) : la barre est blanche d'office. Le texte blanc sur le voile n'y atteignait que 3,43:1.
- **Barre mobile** : un seul bouton Menu (la source en imbriquait deux).

### Menu

Le tiroir latéral gris foncé de la source (`#222930`, `#2a3440`) devient un **rideau clair** qui descend sous l'en-tête, aux couleurs de la marque.

**Bureau (dès 1200 px)**

- **Recherche Sofia en tête**, sur toute la largeur, avec à droite du champ deux liens : « Mon dossier » et « Obtenir un document ».
- **Catalogue des services** (Studio·bib, Boîte à outils, Ressources) en onglets horizontaux soulignés à la couleur du service. Dessous, un aperçu de hauteur fixe : présentation, liens (sur deux colonnes quand la place le permet), un champ de recherche propre au service et le bouton « Aller plus loin ». Le menu ne change plus de hauteur d'un service à l'autre.
- **Recherche par service** : Studio·bib et Boîte à outils cherchent sur leur site ; Ressources cherche dans le site principal.
- **Accès rapide** : quatre tuiles carrées en 2 × 2, à droite de l'aperçu, alignées sur son haut, en bleu UdeM (`#0057ac`) avec texte et icônes blancs. Le titre « Accès rapide » n'est pas affiché (il reste lu par les lecteurs d'écran). Tuiles : Réserver une salle, Formations, Horaires, Nous joindre.
- Les pages principales et « Je donne » ne sont pas répétés : la barre de bureau les montre déjà.

**Mobile et tablette**

- Recherche Sofia en tête, avec « Mon dossier » et « Obtenir un document » sous le champ.
- Pages principales en grand (« Explorer »).
- Accès rapide en tuiles bleu UdeM, en grille de deux.
- Services en accordéons (un seul ouvert à la fois), chacun avec sa recherche.
- Pied collé au bas de l'écran : « Je donne » et une poignée qu'on peut glisser vers le haut pour fermer.

**Retirés de l'accès rapide** : « Mon dossier » et « Obtenir un document » (déplacés près de Sofia), « À propos » (dans « Explorer » et le pied de page).

### Bandeau « Horaires du jour » (nouveau)

Inspiré du site des bibliothèques de l'Université de l'Indiana. Sous l'en-tête, sur toutes les pages :

- une liste des 14 bibliothèques (noms courts, par ordre alphabétique ; la BLSH par défaut, et le dernier choix est retenu d'une page à l'autre) ;
- le statut seulement (« Ouvert jusqu'à 22 h », « Fermé, ouvre demain à 8 h »), avec une pastille de couleur ;
- un lien « Tous les horaires ».

La liste est une capsule à contour clair avec le chevron du site. Dès 1200 px, sur les pages à grande photo, le bandeau se pose sur le haut de la photo au lieu de pousser la page.

### Liens rapides

- **Bureau** : la languette bleue de droite est repliée dès le chargement (la source l'affichait dépliée pendant 3 s par-dessus le contenu) et plus étroite (40 px au lieu de 65), pour ne plus couvrir le bouton « Suivant » des carrousels.
- **Mobile** : la barre du bas glisse hors de l'écran quand on descend et revient quand on remonte ; elle ne couvre plus le texte pendant la lecture.

### Bannières

- **Accueil** : la photo remplit toute la fenêtre dès 1200 px. L'accroche « L'outil de recherche Sofia » reste visible, en petit, sur mobile et tablette (la source la masquait sous 600 px).
- **Cadrage des photos** : sur un écran large, les photos étaient coupées au centre et les têtes passaient sous l'en-tête. Chaque photo garde maintenant la partie où sont les visages (réglage `cadrage`, dans le YAML des vitrines ou par photo pour les sous-pages).

### Rétroaction « Cette page vous a été utile? »

- Plus de cadre d'alerte, d'icône ni de fond gris : une ligne discrète, centrée sous le contenu, sur le fond de la page, en texte secondaire, séparée du contenu par un filet.
- Elle n'apparaît plus que sur les pages de contenu (pages de texte et nouvelles), plus sur l'accueil ni sur les pages de section.

### Navigation de section sur mobile (nouveau)

Un volet « Dans cette section » sous le fil d'Ariane. Dans la source, la colonne de navigation disparaissait sous 1200 px et les pages sœurs n'étaient plus accessibles que par le menu.

---

## 2. Accueil

- **Grande bannière** plein écran (voir plus haut).
- **« Mille et une façons d'apprendre »** : les quatre grandes cartes de 400 px de haut, qui s'élargissaient au survol, deviennent des **cartes compactes** en rangée (icône, titre, flèche), sur une colonne puis deux dès 600 px. Même traitement pour les grilles semblables d'Études.
- **Espaces, Recherche, Enseignement** : les trois grandes bandes texte + image l'une sous l'autre deviennent **trois cartes côte à côte** dès 900 px (photo, titre, texte, bouton), chacune sur son fond.
- **Quoi de neuf** : à texte agrandi, la vignette passe au-dessus du titre au lieu de couper les titres.

---

## 3. Pages de section

- **Études — « Profiter de nos formations gratuites, c'est payant »** : au gabarit de la colonne Formations de l'accueil (vignette, date, titre), **8 formations au lieu de 4**, en deux colonnes côte à côte, et le bouton « Toutes nos formations » centré dessous.
- **Espaces — « L'art d'être à l'avant-garde » et « Production multimédia »** : présentés en **onglets** (un par atelier). Chaque onglet montre le titre et le texte côte à côte, puis les équipements en **galerie de tuiles photo**.
- **Espaces — Cabines insonorisées** : le mot « Disponibles » est retiré.
- **Recherche — « Faites rayonner vos connaissances scientifiques »** : le fond rose est remplacé par le bleu 100.
- **Recherche — Kerko** : les bibliographies sont triées par ordre alphabétique.
- **Engagements — Premiers Peuples** : les cartes à révélation deviennent des **cartes compactes qui se déplient** (le texte s'ouvre sous le titre).
- **Blocs texte et image** (toutes les vitrines) : plus de retrait d'une demi-colonne de chaque côté ; titre et texte s'alignent sur les carrousels et les grilles voisins (64 px du bord au lieu de 119 px à 1440 px).
- **Bandes de même couleur qui se suivent** (Nous joindre, Espaces, Études) : une seule marge entre elles, au lieu d'une double (96 px au lieu de 192 px à 1440 px).

---

## 4. Composants

- **Listes de liens** (« Prêt, renouvellement, retour » et toutes les listes semblables) : titres plus petits (1,33rem, 1,5rem dès 900 px). Ils prenaient la taille des grands titres de la page, jusqu'à 3,5rem.
- **Carrousels** : plus de pastilles de pagination ni de capture de la molette. Un fondu sur le bord droit signale qu'il reste des cartes.
- **Cartes-liens à icône** : sur mobile, en carrousel, elles sont plus petites et laissent voir la suivante.
- **Couleurs revues pour le contraste** : flèche des cartes roses, icônes sur bleu 600 et vert foncé, titre vert des accordéons (vert foncé), citations, liens sur les fonds foncés. Le détail des ratios est dans `GATSBY-VERS-ASTRO.md`, section 3.1.
- **Messages d'erreur** : quand les formations, les événements ou les horaires ne se chargent pas, une phrase claire et un bouton « Réessayer » à la place du vide.

---

## 5. Règles générales

- **Une seule échelle d'espacement**, par rôle (élément, bloc, bande), au lieu de marges ajoutées page par page.
- **Longueur de ligne limitée** à environ 73 caractères ; la source laissait le texte monter jusqu'à environ 160 caractères sur grand écran.
- **Taille du texte du navigateur respectée** : même rendu par défaut, mais un lecteur qui a choisi un texte plus grand l'obtient.
- **Apparitions au défilement** sur les pages de section : discrètes, sans décalage de mise en page, coupées si l'utilisateur préfère réduire les animations.
- **Jetons de design** : toutes les couleurs, durées et courbes viennent de `src/styles/tokens.css`.

---

## 6. À valider

- Les phrases de description des trois services dans l'aperçu du menu (`CARTES` de `src/data/navigation.ts`).
- Le comportement de la rétroaction après un clic sur un pouce (non vu en test, pour ne pas envoyer de vrai vote).
- Les bannières des sous-pages en très grand écran (2560 px) : la bande est si basse qu'on ne voit que les yeux. Une bannière plus haute à ces largeurs réglerait le problème.
