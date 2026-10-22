# Guide de rédaction

Ce guide s'adresse à l'équipe de contenu. Il explique comment créer ou modifier une page du site des Bibliothèques sans toucher au code.

Le site a deux sortes de pages :

| Sorte | Pour quoi | Fichier | Exemple |
| :-- | :-- | :-- | :-- |
| **Page de texte** | La plupart des pages : titres, paragraphes, listes, liens, tableaux | `.md` (Markdown) | `obtenir/pret-renouvellement-retour/diplomes.md` |
| **Vitrine** | L'accueil et les pages de section (Recherche, Enseignement, Espaces…) : grandes bandes de couleur, carrousels, cartes | `.yaml` (données) | `recherche/index.yaml` |

Dans une page de texte, vous écrivez le texte et le code s'occupe de la mise en forme. Dans une vitrine, vous remplissez des cases (titre, texte, lien, image) et le code s'occupe de la mise en page. Dans les deux cas, vous n'écrivez **ni couleurs en code, ni tailles, ni balises HTML de mise en page**.

Quelques pages restent en `.mdx` (une forme plus technique) pendant la transition. Ne les modifiez pas sans un développeur.

---

## 1. Où sont les pages

Toutes les pages sont dans le dossier `src/content/pages/`. Le chemin du fichier donne l'adresse de la page :

| Fichier | Adresse |
| :-- | :-- |
| `obtenir/pret-renouvellement-retour/diplomes.md` | `/obtenir/pret-renouvellement-retour/diplomes/` |
| `obtenir/peb/index.md` | `/obtenir/peb/` |
| `recherche/index.yaml` | `/recherche/` |

- Un fichier `index` donne l'adresse du dossier.
- Le nom du fichier s'écrit en minuscules, sans accents ni espaces, avec des tirets : `frais-avis.md`.
- **Une adresse, un seul fichier.** On ne peut pas avoir à la fois `diplomes.md` et `diplomes.mdx`, ni `recherche/index.mdx` et `recherche/index.yaml`. Le site refuse alors de se construire et nomme les deux fichiers : supprimez l'ancien.
- Changer le nom d'un fichier change l'adresse de la page, et casse les liens qui y mènent. Demandez d'abord à l'équipe Web.

---

## 2. Pages de texte (`.md`)

### 2.1 L'en-tête (frontmatter)

Chaque page commence par un en-tête entre deux lignes `---` :

```yaml
---
title: 'Diplômées et diplômés UdeM, HEC Montréal, Polytechnique Montréal'
crumbLabel: Diplômées et diplômés
secondaryNav:
  title: Diplômées et diplômés
  order: 2
superHero:
  imageName: obtenir
  title: Obtenir un document
---
```

| Champ | Rôle | Obligatoire |
| :-- | :-- | :-- |
| `title` | Titre de la page (onglet du navigateur, recherche) | Oui |
| `crumbLabel` | Libellé court dans le fil d'Ariane (« Accueil › Obtenir › … ») | Non |
| `secondaryNav.title` | Libellé dans le menu de la section, à gauche | Non |
| `secondaryNav.order` | Place dans ce menu : 1, 2, 3… | Non |
| `secondaryNav.hidden` | `true` pour cacher la page de ce menu | Non |
| `superHero.imageName` | Image de la bannière de section (voir 4.2) | Non |
| `superHero.title` | Texte de la bannière (souvent le nom de la section) | Non |
| `description` | Résumé pour les moteurs de recherche | Non |
| `noindex` | `true` pour cacher la page des moteurs et de la recherche du site | Non |
| `lang` | `en` si toute la page est en anglais | Non |

**Page à la racine du site** (`accessibilite-web.md`, `conditions-utilisation.md`) : la bannière `superHero` y devient le **grand titre de la page**, sur la photo, en petit format. Écrivez alors le titre de la page dans `superHero.title` et commencez le texte par des titres `###` :

```yaml
---
title: Accessibilité web
superHero:
  imageName: default
  title: Accessibilité web
---
```

Si une valeur contient un deux-points suivi d'une espace (`: `), un `#` ou commence par un guillemet, mettez-la entre apostrophes droites : `title: 'Prêt : modalités'`.

### 2.2 Le texte

Le texte s'écrit en **Markdown** :

```md
## Titre de la page

Un paragraphe. Une ligne vide sépare deux paragraphes.

Du texte en **gras**, en *italique*, un [lien vers une page du site](/horaires/)
et un [lien externe](https://www.umontreal.ca).

### Sous-titre

- Une liste à puces
- Deuxième élément

1. Une liste numérotée
2. Deuxième étape
```

Règles pour les titres :

- Le **premier titre** de la page s'écrit avec `##`, les sous-titres avec `###`, puis `####`. Ne sautez pas de niveau (pas de `####` directement sous un `##`). Le site ajuste lui-même les niveaux pour l'accessibilité.
- Chaque titre reçoit une **ancre** : `### Modalités générales` donne l'adresse `…/diplomes/#modalites-generales` (minuscules, sans accents, tirets). Si vous changez le texte d'un titre, son ancre change aussi, et les liens qui y menaient ne trouvent plus la section.

Règles pour les liens :

- Lien vers une page du site : l'adresse commence par `/` et finit par `/` : `[Horaires](/horaires/)`.
- Lien vers une section d'une page : `[voir les exceptions](/obtenir/pret-renouvellement-retour/#exceptions-au-renouvellement-automatique)`.
- Lien vers un PDF : le site ajoute lui-même l'icône et l'annonce « PDF ».
- Lien vers une adresse courriel : `[bibliotheques@umontreal.ca](mailto:bibliotheques@umontreal.ca)` ; vers un téléphone : `[514 343-6111](tel:514-343-6111)`.
- Écrivez un texte de lien qui a du sens seul (« Consulter la politique de prêt »), jamais « cliquez ici ».

### 2.3 Les directives (mises en forme spéciales)

Pour les quelques besoins qui dépassent le Markdown, on utilise des **directives**. Il y en a de deux formes :

- un **bloc**, ouvert par `:::nom` et fermé par `:::`, chacun sur sa propre ligne, avec une ligne vide avant et après ;
- une **ligne**, qui commence par `::nom[Texte]{…}`.

Les réglages vont entre accolades : `{type=attention}`. Une valeur qui contient des espaces se met entre guillemets : `{titre="Durée du prêt"}`.

Pour mettre un bloc **dans** un autre bloc (des cartes dans une section de couleur), le bloc extérieur prend un deux-points de plus, à l'ouverture et à la fermeture :

```md
::::section{fond=bleu100}
:::cartes
- :icone[books] [Emprunter](/obtenir/)
:::
::::
```

#### Modalités (liste à icônes)

Une liste où chaque ligne commence par une icône. Sert aux conditions de prêt.

```md
:::modalites
- :icone[identification-card] Emprunt avec : carte Bibliothèques UdeM
- :icone[books] Nombre maximum de documents : 100 documents
- :icone[calendar-dots] Durée du prêt : 30 jours
- :icone[repeat] Renouvellement : automatique ([voir les exceptions](/obtenir/pret-renouvellement-retour/#exceptions-au-renouvellement-automatique))
:::
```

- Le bloc contient **seulement** une liste à puces.
- Chaque élément commence par `:icone[nom]`. Le nom vient de [phosphoricons.com](https://phosphoricons.com) : cherchez l'icône, puis recopiez son nom tel qu'affiché (`calendar-dots`, `identification-card`). Des icônes maison existent aussi : `sofia`, `burger`, `udem`, `lien-interne` (flèche dans un cercle), `lien-externe` (flèche oblique dans un cercle) et `accordeon` (« plus » dans une pastille, qui ouvre un volet).
- L'icône est décorative : le texte doit se suffire à lui-même.
- Taille et couleur, facultatives, entre accolades juste après l'icône :

  ```md
  :::modalites
  - :icone[burger]{taille=40 couleur=neutre700} Ouvrir le menu du site
  - :icone[lien-interne]{taille=50} Suivre le lien à l'intérieur du site
  :::
  ```

  | Réglage | Valeurs | Par défaut |
  | :-- | :-- | :-- |
  | `taille` | Nombre de pixels, de 16 à 64 | 32 |
  | `couleur` | `texte`, `neutre700`, `bleuPrincipal`, `bleuFonce`, `vertFonce`, `rougeOrange` | celle du texte |

#### Alerte (encadré)

Un encadré pour une information importante.

```md
:::alerte{type=attention titre="Fermeture exceptionnelle"}
La bibliothèque ferme à 17 h le vendredi 12 décembre.
:::
```

| Réglage | Valeurs | Par défaut |
| :-- | :-- | :-- |
| `type` | `info`, `succes`, `attention`, `erreur` | `info` |
| `titre` | Texte en gras au début de l'encadré | aucun |

Gardez les alertes pour ce qui est vraiment important : trop d'alertes, et on ne les lit plus.

#### Bouton

Un lien présenté comme un bouton, pour l'action principale d'une page.

```md
::bouton[Réserver une salle]{lien=/espaces/reserver/}

::bouton[Consulter le guide]{lien=https://boite-outils.bib.umontreal.ca/ type=secondaire}
```

| Réglage | Valeurs | Par défaut |
| :-- | :-- | :-- |
| `lien` | Adresse (obligatoire) | |
| `type` | `principal` (plein, bleu foncé) ou `secondaire` (texte bleu) | `principal` |
| `alignement` | `gauche` ou `centre` | `gauche` |

La flèche (page du site ou site externe) et l'annonce des PDF sont ajoutées automatiquement. Deux boutons écrits l'un sous l'autre s'affichent côte à côte, avec un espace avant le paragraphe suivant. Pour centrer un bouton :

```md
::bouton[Mettre à la réserve]{lien=/enseignement/formulaire-reserve/ alignement=centre}
```

#### Tableau

Un tableau Markdown est automatiquement mis en forme (fond blanc, filets, défilement horizontal sur téléphone) :

```md
| Type de document | Durée du prêt |
| --- | ---: |
| Livres, partitions | 30 jours |
| Réserve de cours | Livres : 3 heures<br>Audiovisuel : 6 heures |
```

- La première ligne contient les en-têtes de colonnes.
- La deuxième ligne règle l'alignement : `---` à gauche, `---:` à droite, `:---:` au centre.
- Pour passer à la ligne dans une cellule, écrivez `<br>` (c'est la seule balise permise).

Pour donner un **nom** au tableau (annoncé aux personnes qui utilisent un lecteur d'écran), entourez-le d'un bloc `tableau` :

```md
:::tableau{titre="Durée du prêt par type de document"}
| Type de document | Durée du prêt |
| --- | ---: |
| Livres, partitions | 30 jours |
:::
```

#### Section de couleur

Une bande de couleur, pour détacher une partie de la page.

```md
:::section{fond=bleu100}
### Besoin d'aide?

Écrivez-nous à [bibliotheques@umontreal.ca](mailto:bibliotheques@umontreal.ca).
:::
```

| Réglage | Valeurs |
| :-- | :-- |
| `fond` | Couleur du thème (obligatoire) : `bleu100`, `bleu200`, `jaunePale`, `rose100`, `rose300` (clairs) ; `vertPale`, `jaune`, `rose500`, `rougeOrange`, `violetFonce` (moyens) ; `bleuPrincipal`, `bleuFonce`, `bleu600`, `vertFonce` (foncés) |
| `#ancre` | Ancre de la section, pour y faire un lien : `:::section{fond=bleu100 #aide}` |

La couleur du texte et des liens s'adapte au fond. Préférez les fonds clairs dans les pages de texte, et pas plus d'une ou deux sections par page.

#### Cartes (grille de cartes-liens)

Des cartes cliquables, trois par rangée sur un grand écran. Une carte par ligne de la liste : une **icône** ou une **image**, puis le **lien** (son texte est le titre de la carte), puis, si on veut, un court **texte d'appel**.

Cartes bleues à icône :

```md
:::cartes
- :icone[users-three] [Notre organisation](/a-propos/notre-organisation/)
- :icone[udem] [Faire carrière à l'UdeM](https://www.umontreal.ca/carrieres/)
:::
```

Avec un texte d'appel et une couleur :

```md
:::cartes{couleur=vertFonce}
- :icone[pencil-simple] [Rédiger un plan de gestion de données](https://boite-outils.bib.umontreal.ca/) Voir le guide
:::
```

Cartes à photo (le texte d'appel vaut « En savoir plus » si on n'en écrit pas) :

```md
:::cartes
- ![](./images/atelier.webp) [Atelier de zines](/engagements/) Découvrir l'atelier
:::
```

| Réglage | Valeurs | Par défaut |
| :-- | :-- | :-- |
| `couleur` | `bleuPrincipal`, `vertFonce`, `rose300`, `jaune` (cartes à icône seulement) | `bleuPrincipal` |

- Dans un même bloc, toutes les cartes ont une icône, ou toutes ont une photo.
- La photo d'une carte est décorative : laissez les crochets vides. Le texte d'appel est du texte simple.
- Gardez des titres courts (une dizaine de mots au plus).

#### Liens (liste de liens avec description)

Une liste de liens, chacun avec un titre et une phrase de description ; toute la ligne est cliquable.

```md
:::liens
- [Sources primaires pour la recherche en histoire](https://kerko.bib.umontreal.ca/sources-primaires-histoire/)
  Base de données pour repérer des sources primaires utiles pour les travaux étudiants.
- [Parutions du Département d’histoire](https://bibliographies.bib.umontreal.ca/histoire_udem/)
  Une sélection des récentes parutions du Département.
:::
```

- La description va à la ligne suivante, décalée de deux espaces, **sans ligne vide** entre le lien et elle. Elle est facultative.
- La description est du texte simple (pas de lien ni de gras) : la ligne entière est déjà un lien.
- Les titres se placent d'eux-mêmes sous le titre qui précède le bloc.

#### Image et texte côte à côte

Une image d'un côté, du texte de l'autre (l'un sous l'autre sur un téléphone). Le bloc commence par l'image, seule sur sa ligne, puis une ligne vide et le texte :

```md
:::image-texte{position=gauche}
![](./images/stephanie-gagnon.webp)

Stéphanie Gagnon est directrice générale des bibliothèques…

::bouton[Je donne]{lien=/nous-soutenir/}
:::
```

| Réglage | Valeurs | Par défaut |
| :-- | :-- | :-- |
| `position` | Côté de l'image : `gauche` ou `droite` | `droite` |
| `taille` | `normale` (texte et image à parts presque égales) ou `petite` (l'image garde une petite taille, le texte prend le reste) | `normale` |

- En taille normale, l'image est décorative : laissez les crochets vides, et dites l'essentiel dans le texte.
- Le texte peut contenir des titres, des listes, des liens, une citation. Les boutons placés à la fin passent sous l'image sur un téléphone.

**Petite image** (portrait, logo, capture d'écran) : l'image s'affiche sur environ 200 px de haut, à côté du texte sur un grand écran, sous le texte (ou au-dessus, à gauche) sur un téléphone. Elle peut avoir une description si elle apporte une information :

```md
:::image-texte{taille=petite}
![Stéphanie Gagnon](./images/stephanie-gagnon.webp)

Stéphanie Gagnon est directrice générale des bibliothèques…
:::
```

#### Galerie (photos et légendes)

Des photos côte à côte, chacune avec sa légende dessous (l'une sous l'autre sur un téléphone). Une photo par ligne de la liste, suivie de sa légende :

```md
:::galerie
- ![](./images/cartons-invitation.webp) Cartons d'invitation à des vernissages d'expositions
- ![](./images/corrections-manuscrites.webp) Corrections manuscrites d’un ancien propriétaire
:::
```

- La légende est obligatoire. Si elle décrit déjà la photo, laissez les crochets vides : sinon, la même phrase serait lue deux fois.
- Les photos sont recadrées à la même hauteur (200 px).

#### Logos

Une rangée de logos ou de petites images, liés ou non (un par ligne sur un téléphone, deux sur une tablette, quatre sur un grand écran) :

```md
:::logos
- ![L'UdeM parmi le Palmarès 2025 des 100 meilleurs employeurs au Canada](./images/2025-meilleur-employeur.webp)
- [![Érudit](./images/erudit.webp)](https://www.erudit.org/)
:::
```

- La description entre crochets est **obligatoire** : elle dit ce que montre le logo, ou, pour un logo lié, où mène le lien.
- Les logos s'affichent sur 200 px de haut au plus, sans être déformés.

#### Icône et texte

Du texte à gauche, une grande icône dans un carré de couleur à droite (mission et vision) :

```md
:::icone-texte{icone=target fond=vertPale}
### Notre mission

Les bibliothèques assurent à la communauté de l’UdeM :

- des services évolutifs pour exploiter l’information;
:::
```

| Réglage | Valeurs | Par défaut |
| :-- | :-- | :-- |
| `icone` | Nom d'une icône (voir Modalités), obligatoire | |
| `fond` | `vertPale`, `bleu100`, `bleu200`, `jaunePale`, `jaune`, `rose100`, `rose300` | `bleu100` |

L'icône est décorative et prend une teinte foncée du fond.

#### Encadrés (cartes de texte)

Des encadrés de couleur, deux par rangée sur un grand écran, de même hauteur. Comme pour l'accordéon, chaque **titre** ouvre un encadré ; une icône écrite à la fin du titre s'affiche à sa droite :

```md
:::encadres{fond=rose300}
#### Passion :icone[heart]

C’est la passion d’apprendre, d’explorer, d’innover…

#### Courage :icone[mountains]

C’est en acceptant les risques…
:::
```

| Réglage | Valeurs | Par défaut |
| :-- | :-- | :-- |
| `fond` | `rose300`, `rose100`, `bleu100`, `bleu200`, `jaunePale`, `vertPale` | `rose300` |

- L'icône est facultative ; elle fait 50 px, en rouge orangé, sauf réglage (`:icone[heart]{taille=40 couleur=bleuFonce}`).
- Chaque titre garde son ancre.

#### Séparateur

Un filet horizontal entre deux parties : `---` seul sur sa ligne, **avec une ligne vide avant** (sans elle, le texte au-dessus deviendrait un titre).

#### Ancre fixe d'un titre

Pour garder une ancre que le texte du titre ne donne plus (un lien existant y mène), écrivez-la entre accolades à la fin du titre :

```md
#### Accès à des formats de substitution (service d’adaptation documentaire) {#acces-formats-substitution}
```

L'ancre s'écrit en minuscules, sans accents ni espaces, avec des tirets. N'en mettez qu'au besoin : sinon, le site la déduit du titre.

#### Citation

Une citation entre guillemets, avec un filet bleu et sa source dessous :

```md
:::citation{source="Dr Gilles Théorêt, diplômé de l’Université de Montréal"}
L’histoire peut se perdre ou être déformée par le temps.
:::
```

| Réglage | Valeurs | Par défaut |
| :-- | :-- | :-- |
| `source` | Qui parle (nom, fonction) | aucune |

N'écrivez pas les guillemets : le site les ajoute.

#### Accordéon (volets à ouvrir)

Des volets qui s'ouvrent un à la fois, pour une liste de questions ou de sujets. Chaque **titre** ouvre un volet ; tout ce qui suit, jusqu'au titre suivant de même niveau, est dans le volet :

```md
:::accordeon
### Document des Bibliothèques UdeM

1. Repérer le document dans Sofia.
2. Cliquer sur le bouton **Obtenir**.

### Document d'une autre bibliothèque

Texte du deuxième volet.

#### Un sous-titre dans le volet

Les titres plus petits (`####`) restent dans le volet.
:::
```

- Le bloc commence par un titre. Choisissez son niveau comme pour un titre ordinaire (`###` sous un `##`).
- Chaque titre de volet garde son ancre : un lien vers `#document-des-bibliotheques-udem` ouvre le volet.
- Un volet peut contenir une image et du texte côte à côte : `::::accordeon` (quatre deux-points) autour, `:::image-texte` dedans.

#### Le deux-points ordinaire

Un deux-points dans le texte (« Emprunt avec : carte », « 10:30 ») reste du texte. Seuls les noms ci-dessus sont des directives.

### 2.4 Images

```md
![Salle de lecture de la Bibliothèque des lettres et sciences humaines](./images/salle-lecture-lsh.webp)
```

- Le texte entre crochets décrit l'image pour les personnes qui ne la voient pas. Si l'image est purement décorative, laissez les crochets vides : `![](./images/motif.webp)`.
- L'image s'affiche au plus à sa taille réelle ; le site en produit lui-même plusieurs tailles et formats légers, pour chaque écran.
- Une image introuvable (faute dans le nom ou le dossier) empêche la page de se construire, avec le nom du fichier et la ligne.
- Voir la section 4 pour savoir où ranger le fichier.

---

## 3. Vitrines (`.yaml`)

Une vitrine est une page de section : une bannière, puis une suite de **sections** (bandes pleine largeur). Chaque section contient un **bloc** d'un type donné. Vous choisissez les blocs et leur contenu ; leur apparence est fixée par le code.

### 3.1 Structure

```yaml
title: Recherche
crumbLabel: Recherche

banniere:
  titre: Amplifier l’impact de vos recherches
  image: recherche

sections:
  - type: image-texte
    fond: vertFonce
    titre: Premier arrêt, votre bibliothécaire disciplinaire
    texte: De l’idéation à la communication de vos résultats…
    image: ../images/bibliothecaire-montage.webp
    positionImage: gauche
    bouton:
      texte: Contacter votre bibliothécaire disciplinaire
      lien: /nous-joindre/notre-equipe/

  - type: carrousel
    titre: Vers une science ouverte et libre
    cartes:
      - titre: Déposer facilement son article en libre accès
        icone: download-simple
        lien: https://depot-libre-acces.bib.umontreal.ca/connexion
```

Règles du YAML :

- **L'indentation compte.** Utilisez des espaces (jamais de tabulations), deux par niveau. Un élément de liste commence par `- ` ; ses autres champs s'alignent sous le premier.
- Si un texte contient `: ` (deux-points suivi d'une espace) ou commence par un caractère spécial (`'`, `"`, `#`, `-`, `*`), mettez-le entre guillemets droits : `description: "Salles réservables : consultez le répertoire!"`.
- Pour un texte de plusieurs paragraphes, écrivez `texte: |` puis le texte en dessous, décalé de deux espaces de plus. Dans ce texte, le Markdown fonctionne (gras, liens, listes) :

  ```yaml
  texte: |
    Premier paragraphe.

    - Analyse de données
    - Fouille de textes

    Écrire à [Hugo Bernier](mailto:hugo.bernier@umontreal.ca).
  ```

- Un champ mal nommé (`titr` au lieu de `titre`), une couleur, une icône ou une image introuvable : le site refuse de se construire et indique le fichier et le champ fautif (par exemple `sections.3.cartes.0.icone`, soit la 1re carte de la 4e section ; la numérotation commence à 0).

### 3.2 En-tête de la vitrine

| Champ | Rôle | Obligatoire |
| :-- | :-- | :-- |
| `title`, `crumbLabel`, `description`, `noindex`, `lang`, `secondaryNav` | Comme pour une page de texte (2.1) | `title` |
| `banniere` | La photo du haut de la page, avec le titre principal (voir ci-dessous) | Non |
| `sections` | Liste des blocs, dans l'ordre de la page | Oui |

Champs de la bannière :

| Champ | Rôle | Obligatoire |
| :-- | :-- | :-- |
| `titre` | Grand titre sur la photo (titre principal de la page) | Oui |
| `image` | Nom de l'image de bannière (voir 4.2) | Oui |
| `taille` | `normale` ou `petite` (bannière moins haute, comme Nous soutenir) | Non (`normale`) |
| `sousTitre` | Courtes lignes sous le titre (sur l'accueil : le nom et le titre de la personne en photo) | Non |
| `rechercheSofia` | `true` : la grande bannière de l'accueil, avec la boîte de recherche Sofia. **Accueil seulement.** | Non |

```yaml
banniere:
  titre: Curiosité illimitée
  image: accueil
  rechercheSofia: true
  sousTitre:
    - Emir Chouchane
    - Conseiller en médiation technologique
```

### 3.3 Champs communs à tous les blocs

| Champ | Rôle |
| :-- | :-- |
| `type` | Type du bloc (voir plus bas) ; obligatoire |
| `fond` | Couleur de la bande (mêmes couleurs qu'en 2.3, « Section de couleur ») ; sans `fond`, la bande est blanche |
| `id` | Ancre du titre du bloc, pour y faire un lien (`/recherche/#orcid`) : minuscules, sans accents, tirets. **Ne changez jamais une ancre existante** : d'autres pages y mènent. |

La première bande sous la bannière, si elle a un fond, est décalée automatiquement pour ne pas coller à la photo.

Deux petits groupes de champs reviennent dans plusieurs blocs :

- **Un bouton** : `texte` et `lien`. Ajoutez `secondaire: true` pour un bouton plus discret (texte bleu, sans fond), à réserver à l'action la moins importante quand il y en a deux.

  ```yaml
  boutons:
    - texte: Voir des sujets de formation
      lien: /enseignement/formations-cours/
      secondaire: true
    - texte: Contactez votre bibliothécaire disciplinaire
      lien: /nous-joindre/notre-equipe/
  ```

- **Un lien « tout voir »** (`lienTout`) : `texte` et `lien` d'un bouton placé sous un carrousel ou une liste, vers la liste complète. Le bouton est toujours aligné à gauche, sous les cartes. Ajoutez `nouvelOnglet: true` seulement pour une application externe qu'on garde ouverte à côté du site (réservation de salles) : le bouton l'annonce.

Quel bloc choisir ?

| Vous voulez… | Bloc |
| :-- | :-- |
| Un titre, du texte et quelques boutons | `texte` |
| Un texte à côté d'une photo | `image-texte` |
| Deux à quatre sections courtes côte à côte (photo, titre, texte, bouton), chacune sur son fond | `cartes-sections` |
| Un texte sur une grande photo de fond | `image-fond` |
| Un texte avec une grande icône | `icone-texte` |
| Un texte avec une grille de petites icônes | `texte-icones` |
| Une liste de liens décrits | `liste-liens` |
| Des cartes-liens à icône qui défilent | `carrousel` |
| Des cartes-liens à icône compactes, deux par rangée (recommandé) | `grille-elargissable` |
| Des cartes-liens bleues, sans défilement | `cartes-liens` |
| Des cartes-liens à photo qui défilent | `carrousel-images` |
| Des cartes-liens à photo, sans défilement | `cartes-images` |
| Des cartes qui se retournent pour montrer un texte | `cartes-revelation` |
| Des contenus rangés sous des onglets | `onglets` |
| Des questions ou des services qui se déplient | `accordeons` |
| Le Quoi de neuf de l'accueil | `quoi-de-neuf` |
| La liste des prochaines formations | `formations` |
| Les fiches de toutes les bibliothèques | `fiches-bibliotheques` |

### 3.4 Les blocs

#### `texte` : titre, texte et boutons

```yaml
  - type: texte
    fond: rose300
    titre: Faites rayonner vos REL avec nos services en soutien à la création et la diffusion
    texte: Des manuels de cours aux capsules interactives…
    boutons:
      - texte: Contacter mon bibliothécaire disciplinaire
        lien: /nous-joindre/notre-equipe/
      - texte: Voir le guide associé
        lien: https://boite-outils.bib.umontreal.ca/trouver-evaluer/rel
        secondaire: true
```

| Champ | Rôle | Obligatoire |
| :-- | :-- | :-- |
| `titre` | Titre | Oui |
| `texte` | Texte (Markdown) | Non |
| `boutons` | Boutons côte à côte sous le texte (voir 3.3) | Non |

#### `image-texte` : texte et image côte à côte

```yaml
  - type: image-texte
    fond: vertPale
    titre: Mesurez votre impact
    texte: Nous pouvons vous conseiller…
    image: ../images/portee-scientifique.webp
    positionImage: droite
    bouton:
      texte: Explorer les guides sur l'impact de la recherche
      lien: https://boite-outils.bib.umontreal.ca/recherche
```

| Champ | Rôle | Obligatoire |
| :-- | :-- | :-- |
| `titre`, `texte` | Titre et texte (Markdown : paragraphes, listes) | Oui |
| `image` | Chemin de l'image (voir 4.1) ; l'image est décorative | Oui |
| `positionImage` | `gauche` ou `droite` | Non (`droite`) |
| `bouton` | Bouton sous le texte (voir 3.3) | Non |

#### `image-fond` : texte sur une grande photo

La photo couvre toute la bande, assombrie pour que le texte blanc reste lisible ; le texte occupe la moitié droite. Ce bloc n'a pas de `fond` : la photo en tient lieu.

```yaml
  - type: image-fond
    image: images/engagement-accueil.webp
    titre: S’engager pour une science ouverte
    texte: Notre équipe est résolument engagée dans le développement d’un accès universel aux savoirs…
    bouton:
      texte: Découvrir nos engagements
      lien: /engagements/
```

| Champ | Rôle | Obligatoire |
| :-- | :-- | :-- |
| `titre`, `texte` | Titre et texte (Markdown) | Oui |
| `image` | Chemin de la photo (voir 4.1) ; décorative. Choisissez une photo dont la moitié droite est calme. | Oui |
| `bouton` | Bouton sous le texte | Non |

#### `icone-texte` : grande icône dans un carré, texte à droite

```yaml
  - type: icone-texte
    fond: bleu200
    id: orcid
    icone: user-focus
    couleurIcone: vertPale
    titre: Gagnez en visibilité avec ORCID
    texte: Améliorez la découvrabilité de vos travaux…
    boutons:
      - texte: Écrivez à notre équipe ORCID
        lien: mailto:orcid@bib.umontreal.ca
      - texte: Consultez le guide
        lien: https://boite-outils.bib.umontreal.ca/recherche/profils-chercheurs
```

| Champ | Rôle | Obligatoire |
| :-- | :-- | :-- |
| `icone` | Icône du carré | Oui |
| `couleurIcone` | Couleur du carré : une couleur du thème, ou `blanc` | Oui |
| `titre`, `texte` | Titre et texte (Markdown : paragraphes, listes, liens) | Oui |
| `boutons` | Boutons alignés sous le texte (voir 3.3) | Non |
| `accordeons` | Volets dépliables sous le bloc, dans la même bande (mêmes champs que les `volets` du bloc `accordeons`) | Non |
| `couleurAccordeons` | Couleur de ces volets : `bleuPrincipal`, `rose` ou `vertPale` | Non (`bleuPrincipal`) |

Quand le texte a plusieurs paragraphes à la suite, ils sont espacés automatiquement.

#### `texte-icones` : texte à gauche, grille d'icônes à droite

```yaml
  - type: texte-icones
    fond: rose300
    id: droit-auteur
    titre: Comprenez le droit d’auteur
    texte: Protégez vos droits d’auteur…
    bouton:
      texte: Consulter le guide sur le droit d'auteur
      lien: https://boite-outils.bib.umontreal.ca/recherche/droit-auteur
    couleurIcones: rougeOrange
    icones:
      - icone: check-square-offset
        texte: Choix des différentes licences disponibles
      - icone: share-network
        texte: Diffusion et partage
```

| Champ | Rôle | Obligatoire |
| :-- | :-- | :-- |
| `titre` | Titre | Oui |
| `texte` | Texte (Markdown) sous le titre | Non |
| `bouton` ou `boutons` | Un bouton, ou plusieurs (voir 3.3), sous le texte | Non |
| `couleurIcones` | Couleur des icônes (une couleur du thème, voir 2.3) | Oui |
| `icones` | Liste d'`icone` et de `texte` court, affichés deux par rangée | Oui |

Les icônes sont décoratives : le texte doit se comprendre seul.

#### `liste-liens` : liste de services avec description

```yaml
  - type: liste-liens
    fond: vertFonce
    id: services-cycles-superieurs
    titre: Nos services pour les cycles supérieurs
    liens:
      - titre: Matinées de rédaction
        description: Séances de rédaction en groupe…
        lien: https://www.facebook.com/groups/655999033385375/
      - titre: Réserve de cours
        description: Assurez un accès aux documents importants…
        lien: /enseignement/reserve/
        appel: Mettre un livre à la réserve
```

| Champ | Rôle | Obligatoire |
| :-- | :-- | :-- |
| `titre` | Titre de la liste. Sans titre (pages À propos, Obtenir), le titre de chaque lien devient un titre de la page. | Non |
| `texte` | Phrase d'introduction (Markdown) | Non |
| `liens` | Liste de `titre`, `description` (facultative), `lien` et `appel` (facultatif : texte d'un bouton à droite, sinon une simple flèche) ; toute la ligne est cliquable | Oui |

#### `carrousel` : cartes à icône qui défilent

```yaml
  - type: carrousel
    titre: Problème informatique? Pas de panique!
    texte: Nos comptoirs, nos services et nos spécialistes vous sont accessibles à l’année!…
    couleurCartes: jaune
    petitesCartes: true
    lienTout:
      texte: Voir les ressources informatiques
      lien: https://studio.bib.umontreal.ca/informatique/
    cartes:
      - titre: Accès hors campus
        icone: network
        appel: Configuration Proxy et VPN
        lien: https://studio.bib.umontreal.ca/informatique/proxy/
```

| Champ | Rôle | Obligatoire |
| :-- | :-- | :-- |
| `titre` | Titre du carrousel | Oui |
| `texte` | Phrase d'introduction (Markdown) | Non |
| `couleurCartes` | `bleuPrincipal`, `vertFonce`, `rose300` ou `jaune` (toutes les cartes du carrousel) | Non (`bleuPrincipal`) |
| `petitesCartes` | `true` : cartes plus petites | Non |
| `cartes` | Liste de cartes : `titre`, `icone`, `lien` (obligatoires) et `appel` (court texte d'appel, facultatif) | Oui, au moins une |
| `lienTout` | Bouton sous le carrousel (voir 3.3) | Non |

Gardez des titres de carte courts (une dizaine de mots au plus).

#### `cartes-sections` : sections côte à côte

De deux à quatre cartes de même hauteur, côte à côte sur grand écran, l'une sous l'autre sur téléphone. Chaque carte est une petite section : photo en haut, titre, texte et bouton, sur son propre fond (accueil : « Tout le monde s'y retrouve », « Soutenir votre recherche… », « Partenaire en matière d'enseignement »).

```yaml
  - type: cartes-sections
    cartes:
      - fond: vertFonce
        titre: Tout le monde s’y retrouve
        texte: Choisissez votre espace selon vos besoins du moment…
        image: ./images/image-arret-bibliothecaire.webp
        bouton:
          texte: Découvrir nos espaces
          lien: /espaces/
```

| Champ d'une carte | Rôle | Obligatoire |
| :-- | :-- | :-- |
| `titre` | Titre de la carte (avec son ancre) | Oui |
| `id` | Ancre du titre, si elle doit différer du titre | Non |
| `texte` | Texte (Markdown : paragraphes, listes) | Oui |
| `image` | Photo du haut de la carte | Oui |
| `fond` | Couleur de la carte (mêmes noms que `fond`) ; le texte s'y adapte | Non (blanc, avec un filet) |
| `bouton` | Bouton en bas de la carte | Non |

#### `grille-elargissable` : cartes à icône compactes

Les cartes sont compactes (icône, titre, appel et flèche sur une rangée) : une par ligne sur téléphone, deux par rangée dès la tablette. Prévoyez un nombre pair de cartes. C'est la présentation à préférer au `carrousel` : tout est visible d'un coup d'œil, sans défilement, et elle prend peu de place sur téléphone (Études et Recherche l'utilisent).

```yaml
  - type: grille-elargissable
    fond: bleu100
    titre: Mille et une façons d’apprendre
    texte: Quels que soient vos besoins, vous découvrirez ici de multiples méthodes d’apprentissage…
    cartes:
      - titre: Capsules vidéos et webinaires
        icone: video
        appel: Accéder à YouTube
        lien: https://www.youtube.com/user/BibliothequesUdeM
    bouton:
      texte: Découvrir les services pour la communauté étudiante
      lien: /etudes/
```

| Champ | Rôle | Obligatoire |
| :-- | :-- | :-- |
| `titre` | Titre | Oui |
| `texte` | Phrase d'introduction (Markdown) | Non |
| `couleurCartes` | `bleuPrincipal`, `vertFonce`, `rose300` ou `jaune` | Non (`bleuPrincipal`) |
| `cartes` | Mêmes champs que les cartes du `carrousel` | Oui |
| `bouton` | Bouton centré sous les cartes | Non |

#### `cartes-liens` : cartes-liens bleues

Une grille de grandes cartes bleues (une à quatre par rangée selon l'écran), chacune avec une icône et un titre qui mène à une page. Pas de titre de bloc.

```yaml
  - type: cartes-liens
    fond: bleu100
    cartes:
      - titre: Nous écrire
        icone: pencil-simple
        lien: /nous-joindre/nous-ecrire/
      - titre: Clavarder
        icone: chat
        lien: /nous-joindre/clavarder/
```

| Champ | Rôle | Obligatoire |
| :-- | :-- | :-- |
| `cartes` | Liste de `titre`, `icone` et `lien` | Oui |

#### `carrousel-images` : cartes à photo qui défilent

```yaml
  - type: carrousel-images
    fond: vertFonce
    titre: Changez de décor!
    texte: Nous offrons plusieurs salles de formation à réserver…
    cartes:
      - titre: Salle didactique
        image: ../images/didactheque.webp
        lien: https://calendrier.bib.umontreal.ca/space/19189
        appel: Bibliothèque Thérèse-Gouin-Décarie
```

| Champ | Rôle | Obligatoire |
| :-- | :-- | :-- |
| `titre` | Titre du carrousel | Oui |
| `texte` | Phrase d'introduction (Markdown) | Non |
| `cartes` | Liste de `titre`, `image` (voir 4.1, décorative), `lien` et `appel` (facultatif ; « En savoir plus » par défaut) | Oui |

#### `cartes-images` : cartes à photo, sans défilement

Mêmes cartes que `carrousel-images`, en grille. Sans `titre`, le titre de chaque carte devient un titre de la page (Nous soutenir : « Fonds des livres rares de l'UdeM »).

```yaml
  - type: cartes-images
    fond: vertFonce
    cartes:
      - titre: Fonds des livres rares de l'UdeM
        image: images/fonds-livres-rares.webp
        lien: /nous-soutenir/fonds-livres-rares/
        appel: Découvrir la campagne
```

| Champ | Rôle | Obligatoire |
| :-- | :-- | :-- |
| `titre`, `texte` | Titre et texte au-dessus des cartes | Non |
| `cartes` | Comme pour `carrousel-images` | Oui |

#### `cartes-revelation` : cartes qui se retournent

Un carrousel de cartes qui montrent leur texte quand on les survole, qu'on y arrive au clavier ou qu'on les touche. Chaque carte a **soit** une photo (`image`), **soit** une icône (`icone`) sur un fond de couleur ; ne mélangez pas les deux dans un bloc.

```yaml
  - type: cartes-revelation
    fond: rose100
    titre: Aperçu des réalisations
    cartes:
      - titre: Cabines insonorisées
        sousTitre: "Disponibles :"
        image: ../images/cabine.webp
        texte: |
          - Bibliothèque d'aménagement
          - Bibliothèque de droit
        bouton:
          texte: Réservez votre cabine
          lien: https://calendrier.bib.umontreal.ca/r

  - type: cartes-revelation
    fond: bleu100
    titre: L’équité, la diversité, l’inclusion et l’accessibilité au cœur de nos actions
    texte: L’accès aux savoirs dans leur diversité est au cœur de notre mission…
    couleurCartes: rose300
    cartes:
      - titre: La lecture en cadeau
        icone: gift
        texte: Coordination avec la Librairie de l’UdeM… [Pour en savoir plus](/engagements/lecture-cadeau/)
```

| Champ | Rôle | Obligatoire |
| :-- | :-- | :-- |
| `titre` | Titre du carrousel | Oui |
| `texte` | Introduction (Markdown, plusieurs paragraphes possibles) | Non |
| `couleurCartes` | Fond des cartes à icône : `bleuPrincipal`, `rose300` ou `vertFonce` | Non (`bleuPrincipal`) |
| `disposition` | `carrousel` ou `compacte` : cartes qui se déplient, deux par rangée, au lieu du carrousel (cartes à `icone` sans `bouton` seulement ; voir Engagements, « Premiers Peuples ») | Non (`carrousel`) |
| `cartes` | Liste de cartes (voir ci-dessous) | Oui |
| `lienTout` | Bouton sous le carrousel (voir 3.3) | Non |

Champs d'une carte : `titre` (obligatoire) ; `image` **ou** `icone` (l'un des deux) ; `sousTitre` (cartes à photo : une ligne au-dessus du texte) ; `texte` (Markdown : paragraphes, listes, liens) ; `bouton`. Gardez le texte court : il doit tenir dans la carte (en disposition `compacte`, il se déplie et peut être plus long).

#### `onglets` : contenus sous des onglets

Chaque onglet ouvre un panneau avec un titre, un texte et des cartes à photo. Sur grand écran, les onglets sont à gauche ; sur téléphone, au-dessus.

```yaml
  - type: onglets
    fond: jaune
    onglets:
      - etiquette: Technologies créatives
        titre: L’art d’être à l’avant-garde
        id: lart-detre-a-lavant-garde
        texte: La création vous passionne? Bienvenue aux avant-gardistes!…
        cartes:
          - titre: Impression 3D
            image: images/impression-3d.webp
            lien: https://studio.bib.umontreal.ca/creatives/impression3d/
            appel: En savoir plus
      - etiquette: Production multimédia
        titre: Entrez dans le monde du multimédia
        cartes:
          - titre: Studios vidéo
            image: images/studio-video.webp
            lien: https://studio.bib.umontreal.ca/espaces/studiovideo/
```

| Champ | Rôle | Obligatoire |
| :-- | :-- | :-- |
| `onglets` | Au moins deux panneaux : `etiquette` (texte court de l'onglet), `titre`, `id` (ancre du titre, facultative), `texte` (facultatif) et `cartes` (comme pour `carrousel-images`) | Oui |
| `disposition` | `onglets` : un onglet par panneau, en rangée au-dessus du contenu, titre et texte à gauche, cartes en liste compacte à vignette photo à droite (Espaces, « L'art d'être à l'avant-garde ») ; ou `colonnes` : les panneaux côte à côte, sans onglets (tout est visible ; `etiquette` ne sert plus) | Non (`onglets`) |

#### `accordeons` : volets qui se déplient

Un seul volet est ouvert à la fois. Un lien vers l'ancre d'un volet (`/nous-joindre/#mon-accordeon`) l'ouvre.

```yaml
  - type: accordeons
    id: services
    titre: Services
    volets:
      - titre: Service Accessibilité
        id: mon-accordeon
        coordonnees:
          courriel: accessibilite@bib.umontreal.ca
          telephone: 514 343-2135
          adresse:
            - Pavillon Samuel-Bronfman
            - 3000, rue Jean-Brillant
            - 1er étage, salle 1085
          itineraire: https://www.google.com/maps/place/…
      - titre: Respecter le principe de transparence
        texte: Utiliser l’IA dans nos outils de manière transparente…
```

| Champ | Rôle | Obligatoire |
| :-- | :-- | :-- |
| `titre` | Titre au-dessus des volets | Oui |
| `texte` | Introduction (Markdown) | Non |
| `couleur` | `bleuPrincipal`, `rose` ou `vertPale` | Non (`bleuPrincipal`) |
| `volets` | Liste de volets (voir ci-dessous) | Oui |

Champs d'un volet : `titre` (obligatoire, texte simple), `id` (ancre), `texte` (Markdown) et `coordonnees`, des lignes à icônes : `courriel`, `telephone` (écrit comme on l'affiche, `514 343-2135`), `adresse` (une ligne par élément) et `itineraire` (lien « Voir l'itinéraire »). Tous facultatifs.

#### `quoi-de-neuf` : les actualités de l'accueil

Trois colonnes mises à jour automatiquement : Événements, Nouvelles et Formations (des onglets sur téléphone). **Accueil seulement.**

```yaml
  - type: quoi-de-neuf
    id: quoi-de-neuf
    titre: Quoi de neuf
    nombre: 4
```

| Champ | Rôle | Obligatoire |
| :-- | :-- | :-- |
| `titre` | Titre | Oui |
| `nombre` | Nombre d'éléments par colonne, de 1 à 10 | Non (4) |

#### `formations` : prochaines formations

Les prochaines formations, tirées du calendrier des Bibliothèques, au même gabarit que la colonne Formations de l'accueil (photo, date et heure, titre), en deux colonnes côte à côte sur grand écran.

```yaml
  - type: formations
    fond: bleu100
    titre: Profiter de nos formations gratuites, c'est payant
    texte: Consultez notre calendrier de formations - il y en a pour tous les goûts, tous les niveaux!
    lienTout:
      texte: Toutes nos formations
      lien: https://calendrier.bib.umontreal.ca/calendar?cid=7690&t=m&d=0000-00-00&cal=7690&inc=0
```

| Champ | Rôle | Obligatoire |
| :-- | :-- | :-- |
| `titre` | Titre | Oui |
| `texte` | Introduction (Markdown) | Non |
| `nombre` | Nombre de formations, réparties en deux colonnes (un nombre pair) | Non (8, soit 4 par colonne) |
| `lienTout` | Bouton principal centré sous la liste | Non (« Toutes nos formations », vers le calendrier) |

#### `fiches-bibliotheques` : toutes les bibliothèques

Les fiches de toutes les bibliothèques et points de service (adresse, horaire, services). Leur contenu se met à jour ailleurs (données des horaires) : vous ne choisissez que le titre et l'introduction. La bande reçoit l'ancre `#liste-bibliotheques`, et chaque fiche la sienne (`/espaces/#droit`).

```yaml
  - type: fiches-bibliotheques
    id: on-aime-la-visite
    titre: On aime la visite!
    texte: Découvrez ici les différents points de service du réseau des bibliothèques de l’UdeM…
```

| Champ | Rôle | Obligatoire |
| :-- | :-- | :-- |
| `titre` | Titre | Oui |
| `texte` | Introduction (Markdown) | Non |

---

## 4. Images

### 4.1 Images du contenu

- Une image qui ne sert qu'à **une page** va dans un dossier `images/` **à côté de cette page** : pour `engagements/lecture-cadeau.md`, dans `engagements/images/`.
- Une image partagée par **plusieurs pages** va dans `src/content/pages/images/`.
- On y fait référence par un chemin **relatif** au fichier de la page : `./images/photo.webp` (même dossier) ou `../images/photo.webp` (dossier parent). Le site produit lui-même les formats et les tailles adaptés à chaque écran.
- Format : **WebP**, comme toutes les images du site. Taille de l'original : **2400 px au plus** sur le plus grand côté (quelques centaines de Ko). Pas de PNG ni de JPEG non convertis. Pour convertir : l'export WebP de votre logiciel d'images, ou https://squoosh.app (qualité 80 à 85).
- Photo du personnel : carrée, **200 × 200 px**, en WebP (elle s'affiche à 100 px).
- Nom du fichier : minuscules, sans accents ni espaces, avec des tirets : `salle-lecture-lsh.webp`.
- Supprimez une image dès qu'elle ne sert plus.

### 4.2 Bannières

Les photos des bannières sont dans `src/content/pages/images/super-heroes/`. On les désigne par leur **nom sans extension** : `recherche`, `obtenir`, `espaces`, `default`… Pour une nouvelle bannière, demandez à l'équipe Web (l'image doit garder un texte blanc lisible sur toute sa largeur).

### 4.3 Documents PDF

Les PDF vont dans `public/`, rangés selon la section (`public/nous-soutenir/politique-dons.pdf`), et le lien s'écrit sans `public` : `[Politique de dons](/nous-soutenir/politique-dons.pdf)`.

---

## 5. Ce qu'on ne fait pas

- **Pas de HTML ni de style** dans une page de texte : pas de `<div>`, `<span style=…>`, `<font>`, `<center>`, ni de couleurs écrites à la main. Seule exception : `<br>` dans une cellule de tableau. Si un besoin de mise en forme revient souvent, demandez une nouvelle directive à l'équipe Web.
- **Pas de titre pour mettre en gras.** Un titre (`##`) sert à structurer la page, pas à grossir du texte : utilisez `**gras**`.
- **Pas de niveau de titre sauté**, et un seul titre `##` de premier niveau par page.
- **Pas de texte dans une image** (affiche, tableau en capture d'écran) : il est illisible pour un lecteur d'écran et ne s'agrandit pas.
- **Pas de lien « cliquez ici »** ni d'adresse brute comme texte de lien.
- **Pas de copie d'une page** pour en changer l'adresse, et pas deux fichiers pour une même adresse (`.md` et `.mdx`, ou `.mdx` et `.yaml`).
- **Ne changez pas une ancre** (`id` d'un bloc, texte d'un titre vers lequel d'autres pages pointent) sans vérifier les liens.
- **Ne modifiez pas un fichier `.mdx`, ni rien hors de `src/content/` et `public/`** sans un développeur.

## 6. Vérifier son travail

Le serveur de développement montre la page à l'adresse `http://localhost:4321/…`. Une erreur (directive inconnue, champ manquant, icône introuvable) est écrite dans le journal du serveur avec le nom du fichier et, pour une page de texte, le numéro de ligne ; en attendant la correction, la page garde sa version précédente (ou n'existe pas encore, si elle est nouvelle). La même erreur empêche la publication du site : rien de faux ne peut être mis en ligne.

Avant de proposer une modification, regardez la page sur un écran étroit (téléphone) et sur un grand écran.
