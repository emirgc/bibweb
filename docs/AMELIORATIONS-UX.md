# Améliorations de l'expérience visiteur

Dernière série de changements sur les pages principales du site (Recherche, Espaces, Études, Enseignement, Engagements) et sur le site entier. État au 23 octobre 2026.

**En une phrase** : les visiteurs trouvent plus vite ce qu'ils cherchent, les pages se ressemblent davantage, et tout reste utilisable au clavier et avec un lecteur d'écran.

---

## Pourquoi ces changements

Nos pages principales sont longues : la page Recherche compte 12 sections, Engagements et Enseignement 7 chacune. Un étudiant, un professeur ou un chercheur arrive avec un besoin précis (« le droit d'auteur », « réserver une salle »). Avant, il devait faire défiler toute la page pour savoir si l'information existait. Ces changements visent trois choses :

1. **Gagner du temps** : aller directement à la bonne section.
2. **Une image cohérente** : les mêmes types de blocs se présentent de la même manière d'une page à l'autre.
3. **Accueillir tout le monde** : chaque nouveauté respecte les exigences d'accessibilité du projet (WCAG 2.2 AA).

---

## 1. Un sommaire « Aller à une section » dans chaque page principale

**Ce que voit le visiteur** : sous le titre de la bannière, un bouton « Aller à une section ». Un clic ouvre la liste de toutes les sections de la page. Un second clic sur un nom l'amène directement à cet endroit.

**Pourquoi c'est un gain**

- **Vue d'ensemble immédiate** : en un coup d'œil, on sait ce que la page offre (12 sections sur Recherche, 7 sur Enseignement et Engagements, 5 sur Études, 4 sur Espaces).
- **Presque aucun espace pris** : une seule pastille dans la bannière. Le panneau s'ouvre par-dessus le contenu sans rien déplacer, et se referme tout seul (touche Échap, clic ailleurs, choix d'une section).
- **Pensé pour le mobile** : le même bouton, avec une liste en une colonne.
- **Facile à maintenir** : le sommaire se construit tout seul. Les rédacteurs écrivent simplement un nom court pour chaque section dans le fichier de la page.

---

## 2. Un bouton « Retour en haut de la page »

**Ce que voit le visiteur** : quand il descend dans une longue page, un petit bouton rond apparaît en bas à droite. Un clic le ramène en haut.

**Pourquoi c'est un gain**

- Il évite de remonter à la main des pages de plusieurs écrans, surtout sur mobile.
- **Discret** : il n'apparaît qu'après un écran et demi de défilement, et disparaît en haut de page. Il ne gêne ni la barre de liens rapides ni les horaires.
- **Accessible** : il est utilisable au clavier et avec un lecteur d'écran, et son contour est visible sur tous les fonds. Il respecte les réglages de mouvement réduit des visiteurs sensibles aux animations.

---

## 3. Des blocs « image et texte » plus clairs et plus harmonieux

Sur les pages principales, les blocs qui associent une photo et un texte (« Premier arrêt, votre bibliothécaire disciplinaire », « Mesurez votre impact », « Ajoutez une touche techno », « Vers une empreinte écologique réduite », etc.) suivent maintenant **la même règle partout** :

- l'image d'un côté ;
- de l'autre, le titre, le texte et le bouton, **centrés ensemble** à côté de l'image ;
- une image un peu plus compacte, pour laisser respirer la page.

**Pourquoi c'est un gain**

- **Lecture plus naturelle** : le titre est directement lié à son texte et à son bouton d'action. Avant, le titre flottait au-dessus de l'ensemble, loin du bouton.
- **Moins de vide** : on a corrigé des blocs où une grande photo laissait des espaces vides autour d'un texte court.
- **Cohérence** : un visiteur reconnaît le même modèle d'une page à l'autre, ce qui renforce l'identité visuelle des Bibliothèques.
- **Image mieux maîtrisée** : une photo en portrait (comme dans « Mesurez votre impact ») est recadrée en carré. Elle n'allonge plus le bloc inutilement.

---

## 4. Des liens plus faciles à repérer et à utiliser

- **Listes de services** (par exemple « Consultation » et « Collaboration » dans « Produisez des synthèses de connaissances ») : au survol ou au clavier, la ligne se teinte, la flèche avance et la pastille change de couleur. Le visiteur voit clairement ce qui est cliquable, et toute la ligne est cliquable.
- **Boutons secondaires** (le guide « Découvrabilité de la recherche », dans le bloc ORCID) : un bouton blanc à bordure, qui se détache nettement du fond, au lieu d'un lien de texte qui se fondait dans la page.

---

## 5. Un détail typographique : cohérence des titres

Dans la page Enseignement, les titres des cartes de salles (« Salle didactique », « Atelier de zines »…) sont maintenant dans la même police que le reste de la page. Le bloc est plus uniforme.

---

## Accessibilité et qualité

Ces changements ont été construits pour que le site reste accessible à toutes et à tous :

- tout est utilisable **au clavier** ;
- les éléments sont annoncés correctement aux **lecteurs d'écran** ;
- les **contrastes** et le **mouvement réduit** sont respectés ;
- les nouveautés s'adaptent à **l'ordinateur, à la tablette et au téléphone**.

Vérifié visuellement à 1280 px sur les cinq pages principales (et à 390 px, largeur d'un téléphone, pour le sommaire). Le bandeau « Horaires du jour » et la barre de liens rapides restent en place.

---

## Ce qu'il reste à faire

- **Valider les noms courts du sommaire** (par exemple « Réussite étudiante », « Premiers Peuples », « IA éthique ») avec les équipes de contenu. Ce sont des propositions.
- **Décider** si on étend le sommaire à d'autres pages (Obtenir, Nous joindre…) : il suffit d'ajouter les noms courts.
- **Passer le contrôle automatique de tout le site** avant la mise en ligne (`npm run verifier`), puis un dernier tour sur téléphone réel.

---

## Ce que ça apporte en résumé

| Pour le visiteur | Pour l'équipe |
| :-- | :-- |
| Trouve la bonne section en deux clics | Un sommaire généré automatiquement, rien à maintenir à la main |
| Pages plus claires et plus régulières | Un même modèle de bloc partout : moins de cas particuliers |
| Retour en haut sans effort | Une seule place où modifier chaque composant |
| Fonctionne au clavier, au lecteur d'écran et sur mobile | Conforme à nos exigences d'accessibilité |
