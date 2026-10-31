# bibweb : le site des Bibliothèques de l'UdeM

`bibweb` est le site Web des Bibliothèques de l'Université de Montréal (https://bib.umontreal.ca), converti en **Astro 7** à partir de l'ancien site Gatsby (`~/Documents/git/coquille-web`, en lecture seule). Les adresses, le contenu et l'apparence sont ceux de l'ancien site. Les défauts relevés (accessibilité, HTML invalide, liens cassés) ont été corrigés au passage.

Ce document a deux parties :

- **Partie 1, pour les rédacteurs et le personnel** : où se trouve chaque information que vous pourriez vouloir changer.
- **Partie 2, pour les développeurs** : comment le site fonctionne.

## Table des matières

**Partie 1 : modifier le contenu**

1. [Avant de commencer](#avant-de-commencer)
2. [Je veux changer… : le tableau](#je-veux-changer--le-tableau)
3. [Les pages de texte](#les-pages-de-texte)
4. [Les pages d'accueil de section (vitrines)](#les-pages-daccueil-de-section-vitrines)
5. [Les nouvelles et la revue de presse](#les-nouvelles-et-la-revue-de-presse)
6. [Le menu, le pied de page et les liens rapides](#le-menu-le-pied-de-page-et-les-liens-rapides)
7. [Les bibliothèques et leurs horaires](#les-bibliothèques-et-leurs-horaires)
8. [Le répertoire du personnel](#le-répertoire-du-personnel)
9. [Images, bannières et PDF](#images-bannières-et-pdf)
10. [Ce qui ne se change pas ici](#ce-qui-ne-se-change-pas-ici)
11. [Voir le résultat](#voir-le-résultat)

**Partie 2 : fonctionnement du site**

12. [Vue d'ensemble](#vue-densemble)
13. [Commandes](#commandes)
14. [Contenu : les collections](#contenu--les-collections)
15. [Des fichiers aux pages : routage et gabarits](#des-fichiers-aux-pages--routage-et-gabarits)
16. [Le traitement du Markdown : plugins et directives](#le-traitement-du-markdown--plugins-et-directives)
17. [Les composants](#les-composants)
18. [Styles, jetons et mouvement](#styles-jetons-et-mouvement)
19. [Interactivité](#interactivité)
20. [Données et contenus dynamiques](#données-et-contenus-dynamiques)
21. [Recherche interne](#recherche-interne)
22. [Images](#images)
23. [Redirections, sitemap et robots.txt](#redirections-sitemap-et-robotstxt)
24. [Accessibilité](#accessibilité)
25. [Vérifier son travail](#vérifier-son-travail)
26. [Le cache de contenu](#le-cache-de-contenu)
27. [Construire et déployer](#construire-et-déployer)
28. [Interface de rédaction (Decap CMS)](#interface-de-rédaction-decap-cms)
29. [Documentation](#documentation)

---

# Partie 1 : modifier le contenu

## Avant de commencer

- **Le guide complet des rédacteurs est `docs/REDACTION.md`.** Ce README vous dit *où* aller ; le guide vous dit *comment* écrire (en-têtes, directives, blocs, images).
- Presque tout le contenu est dans le dossier `src/content/`. Les listes de liens du menu et du pied de page, ainsi que les fiches des bibliothèques, sont dans `src/data/`.
- Le chemin d'un fichier de page donne son adresse : `src/content/pages/obtenir/peb/index.md` est la page `/obtenir/peb/`.
- Une adresse = un seul fichier. Changer le nom d'un fichier change l'adresse de la page et casse les liens qui y mènent : demandez d'abord à l'équipe Web.
- Les fichiers `.mdx` (forme technique, pendant la transition) et tout ce qui est hors de `src/content/` et `public/` se modifient **avec un développeur**. Les fichiers de `src/data/` sont du code TypeScript : on peut y changer un texte ou une adresse entre guillemets, mais faites relire la modification.
- Une erreur (champ mal nommé, icône ou image introuvable) empêche le site de se construire et donne le fichier fautif. Rien de faux ne peut être mis en ligne.
- **Sans outils de développement** : les nouvelles et les pages de texte (`.md`) se modifient aussi dans l'interface de rédaction, `/admin/` (voir [Interface de rédaction (Decap CMS)](#interface-de-rédaction-decap-cms)).
- En cas de doute : **l'équipe Web**.

## Je veux changer… : le tableau

| Je veux changer… | Où | Quoi |
| :-- | :-- | :-- |
| Le texte d'une page ordinaire | `src/content/pages/<chemin>.md` (ou `<chemin>/index.md`) | Le texte en Markdown sous l'en-tête. Voir [Les pages de texte](#les-pages-de-texte). |
| Une page d'accueil de section (Recherche, Études, Espaces…) ou l'accueil du site | `src/content/pages/<section>/index.yaml` ; l'accueil : `src/content/pages/index.yaml` | Les cases des blocs (`titre`, `texte`, `lien`, `image`…). Voir [Les vitrines](#les-pages-daccueil-de-section-vitrines). |
| Le titre d'une page dans l'onglet et les moteurs de recherche | En-tête de la page : `title` | Le texte. Le site ajoute « \| Les bibliothèques / UdeM ». |
| La description d'une page pour les moteurs de recherche | En-tête de la page : `description` | Une ou deux phrases. Sans `description`, le site utilise « Site Web des Bibliothèques de l'Université de Montréal ». |
| Le libellé d'une page dans le fil d'Ariane | En-tête : `crumbLabel` | Un libellé court. |
| La place ou le libellé d'une page dans le menu de gauche de sa section | En-tête : `secondaryNav` (`title`, `order`, `hidden`) | Voir `docs/REDACTION.md`, § 2.1. |
| Cacher une page des moteurs et de la recherche du site | En-tête : `noindex: true` | Demandez aussi à un développeur de l'exclure du plan du site (voir [Redirections, sitemap et robots.txt](#redirections-sitemap-et-robotstxt)). |
| Une alerte, un encadré, un bouton, un tableau, des cartes, un accordéon dans une page | Dans le texte de la page `.md` | Une **directive** (`:::alerte`, `::bouton`, `:::cartes`…). Voir `docs/REDACTION.md`, § 2.3. |
| Une nouvelle | `src/content/nouvelles/<année>/<nom>.md` | Voir [Les nouvelles](#les-nouvelles-et-la-revue-de-presse). |
| Un article de la revue de presse | `src/content/revue-de-presse/articles.json` | Ajouter `title`, `date`, `source`, `url`. |
| Une image dans une page | Dossier `images/` à côté de la page | Voir [Images, bannières et PDF](#images-bannières-et-pdf). |
| La photo d'une bannière | En-tête `superHero.imageName` (page de texte) ou `banniere.image` (vitrine) ; les photos sont dans `src/content/pages/images/super-heroes/` | Le nom de la photo, sans extension (`recherche`, `obtenir`…). |
| Un PDF | `public/<section>/<fichier>.pdf` | Le lien s'écrit sans `public` : `/nous-soutenir/politique-dons.pdf`. |
| Les cinq pages principales de la barre du haut (Espaces, Études…) | `src/data/navigation.ts`, `PAGES_PRINCIPALES` | Libellé et adresse. |
| L'« Accès rapide » du menu (Obtenir un document, Horaires…) | `src/data/navigation.ts`, `LIENS_MENU` | Libellé, adresse, icône. |
| Les services du menu (Studio·bib, Boîte à outils, Ressources), leurs liens, leur description et où cherche leur champ de recherche | `src/data/navigation.ts`, `CARTES` ; photos dans `src/data/images/navigation/` | `description`, `liens`, `appel`, `portee` (`studio`, `outils` ou `site`). |
| Les liens du pied de page | `src/data/navigation.ts` : `COLONNES_PIED`, `RESEAUX_PIED`, `URGENCE`, `LIENS_QUEUE_PIED` | Libellé et adresse. |
| La bibliothèque proposée par défaut dans le bandeau « Horaires du jour » | `src/components/coquille/BandeauHoraires.astro`, `PAR_DEFAUT` (code de la bibliothèque, `ss` pour la BLSH) | La liste vient de `src/data/horaires/lieux.ts`. |
| Les liens rapides (barre bleue à droite, ou en bas sur téléphone) | `src/data/navigation.ts`, `LIENS_RAPIDES` | Libellé, libellé court (`court`, affiché sous l'icône sur téléphone) et adresse. |
| La fiche d'une bibliothèque (adresse, téléphone, courriel, services) | `src/data/horaires/lieux.ts` | Voir [Les bibliothèques](#les-bibliothèques-et-leurs-horaires). |
| Les heures d'ouverture | **Pas dans ce dépôt** : elles viennent de l'API `https://api.bib.umontreal.ca/horaires` | Voir l'équipe responsable de l'API. |
| La photo d'une bibliothèque | `src/data/horaires/images/<code>.webp` | Le fichier est nommé d'après le code de la bibliothèque (`am`, `mu`…). |
| Une personne du répertoire du personnel | `src/content/personnel/liste-personnel.xlsx` ; photos dans `src/content/personnel/photos/` | Voir [Le répertoire du personnel](#le-répertoire-du-personnel). |
| La recherche Sofia (adresse, paramètres) | `src/lib/sofia.ts` | Code : avec un développeur. |
| Une redirection (ancienne adresse → nouvelle) | `public/_redirects` ou `redirects` dans `astro.config.mjs` | Voir [Redirections](#redirections-sitemap-et-robotstxt). Avec un développeur. |
| Le bandeau d'avis ou d'urgence en haut des pages | **Pas dans ce dépôt** : composants `<bib-avis>` et `<udem-urgence>` de la bibliothèque commune `bibudem/ui` | Voir l'équipe Web. |

## Les pages de texte

La plupart des pages sont des **pages de texte** : un fichier `.md` dans `src/content/pages/`. Il commence par un **en-tête** entre deux lignes `---`, puis le texte en Markdown :

```md
---
title: 'Diplômées et diplômés UdeM, HEC Montréal, Polytechnique Montréal'
crumbLabel: Diplômées et diplômés
description: Conditions de prêt pour les diplômées et diplômés.
secondaryNav:
  title: Diplômées et diplômés
  order: 2
superHero:
  imageName: obtenir
  title: Obtenir un document
---

## Titre de la page

Un paragraphe, un [lien](/horaires/).

:::alerte{type=attention titre="Fermeture exceptionnelle"}
La bibliothèque ferme à 17 h le vendredi 12 décembre.
:::
```

À retenir :

- Le premier titre s'écrit `##`, puis `###`, `####`, sans sauter de niveau. Le site ajuste lui-même les niveaux pour l'accessibilité.
- Changer le texte d'un titre change son ancre (`#modalites-generales`) : les liens qui y menaient ne trouvent plus la section. Pour garder l'ancre, écrivez-la à la fin du titre : `## Nouveau titre {#ancien-titre}`.
- Pas de HTML ni de couleurs écrites à la main. Pour une mise en forme spéciale (alerte, bouton, cartes, section de couleur, accordéon, image et texte, citation…), utilisez une **directive**. La liste complète et des exemples sont dans `docs/REDACTION.md`, § 2.3, et sur la page de démonstration http://localhost:4321/dev/composants/directives/.

Détail : `docs/REDACTION.md`, § 1 et 2.

## Les pages d'accueil de section (vitrines)

L'accueil et les pages de section (À propos, Engagements, Enseignement, Espaces, Études, Nous joindre, Nous soutenir, Obtenir, Recherche) sont des **vitrines** : un fichier `index.yaml` de données, et non du texte. Vous remplissez des cases ; la mise en page est fixée par le code.

```yaml
title: Recherche
banniere:
  titre: Amplifier l’impact de vos recherches
  image: recherche
sections:
  - type: texte
    fond: rose300
    titre: Un titre de bloc
    texte: Le texte du bloc, en Markdown.
    boutons:
      - texte: Contacter mon bibliothécaire disciplinaire
        lien: /nous-joindre/notre-equipe/
```

- Chaque élément de `sections` est une bande pleine largeur, d'un `type` donné (`texte`, `image-texte`, `cartes-sections`, `grille-elargissable`, `accordeons`, `onglets`…). Il y en a 18 ; le tableau « Quel bloc choisir ? » est dans `docs/REDACTION.md`, § 3.3.
- L'indentation compte (deux espaces, jamais de tabulation).
- **Ne changez jamais un `id` existant** : d'autres pages y mènent.
- Certains blocs ont une option de présentation : `couleurCartes` (`grille-elargissable`), `disposition: compacte` (`cartes-revelation` : cartes qui se déplient, deux par rangée), `disposition: onglets` ou `colonnes` (`onglets`), `nombre` (`formations`, 8 par défaut, en deux colonnes).

Détail : `docs/REDACTION.md`, § 3.

## Les nouvelles et la revue de presse

**Une nouvelle** est un fichier `.md` dans `src/content/nouvelles/<année>/`, avec ses images dans `src/content/nouvelles/<année>/images/` :

```md
---
title: 'Travaux à la Bibliothèque de la santé à partir du 3 novembre'
slug: travaux-bibliotheque-sante
date: '2025-10-21'
newsImage:
  src: ./images/IMG_9749.webp
  alt: Description de la photo
source: Bibliothèques
---
Le texte de la nouvelle, en Markdown, avec les mêmes directives que les pages (`::bouton`, `:::alerte`…).
```

- L'adresse est `/nouvelles/<année>/<slug>/`. Sans `slug`, c'est le nom du fichier.
- `date` est obligatoire ; elle est affichée et sert à l'ordre des listes.
- `titreAffiche` (facultatif) donne un titre affiché différent du `title`.
- La nouvelle apparaît d'elle-même dans la page `/nouvelles/`, dans le « Quoi de neuf » de l'accueil et dans la recherche du site.

**La revue de presse** (articles parus dans les médias) est un seul fichier, `src/content/revue-de-presse/articles.json`. Chaque article a un `title`, une `date` (`AAAA-MM-JJ`), une `source` et une `url` ; `lang` est facultatif (français par défaut). Ces articles sont mêlés aux nouvelles dans les listes, avec un lien vers le média.

## Le menu, le pied de page et les liens rapides

Tous ces liens sont dans **un seul fichier** : `src/data/navigation.ts`. Chaque lien est une ligne comme celle-ci :

```ts
{ libelle: 'Horaires', href: '/horaires/', Icone: ClockCountdownIcon },
```

On change le texte entre apostrophes de `libelle` ou de `href`. Une apostrophe dans le texte s'écrit entre guillemets doubles : `"Droit d'auteur"`.

| Liste | Où elle s'affiche |
| :-- | :-- |
| `PAGES_PRINCIPALES` | Les cinq pages de la barre du haut sur grand écran, et « Explorer » dans le menu sur téléphone |
| `LIENS_MENU` | « Accès rapide » dans le menu (tuiles sur téléphone, colonne de droite sur grand écran) |
| `CARTES` | Les trois services du menu : Studio·bib, Boîte à outils, Ressources. `description` est la phrase de l'aperçu sur grand écran, `liens` les liens du service, `appel` le lien « Aller plus loin », `portee` l'endroit où cherche le champ de recherche du service (`studio` : Studio·bib, `outils` : Boîte à outils, `site` : le site des bibliothèques). Les photos sont dans `src/data/images/navigation/`. |
| `COLONNES_PIED` | Les trois colonnes de liens du pied de page |
| `RESEAUX_PIED` | Les icônes YouTube et Instagram du pied de page |
| `URGENCE` | Le numéro d'urgence du pied de page |
| `LIENS_QUEUE_PIED` | Confidentialité, Conditions d'utilisation, Accessibilité, au bas du pied de page |
| `LIENS_RAPIDES` | La barre de liens rapides (Sofia, Horaires, Réserver une salle, Ressources informatiques). `court` est le petit libellé sous l'icône sur téléphone ; il doit être contenu dans `libelle` (le nom lu par les lecteurs d'écran). |

- Une adresse interne commence et finit par `/` (`/horaires/`). Une adresse complète (`https://…`) est traitée comme un site externe.
- Les icônes (`Icone: …Icon`) sont du code : pour en changer une, demandez à un développeur.
- Le menu contient aussi deux recherches, sans rien à écrire : Sofia tout en haut, et, pour chaque service, un champ qui cherche selon sa `portee`.
- Le lien « Je donne » de l'en-tête et du menu mène à `/nous-soutenir/` ; il est écrit dans `src/components/coquille/Entete.astro` et `src/components/coquille/entete/PanneauMenu.astro` (développeur).

## Les bibliothèques et leurs horaires

**Les fiches des bibliothèques** (adresse, téléphones, courriels, services, espaces) sont dans `src/data/horaires/lieux.ts`. C'est la **seule source** : elle alimente la page `/horaires/`, les fiches de `/espaces/` et de `/nous-joindre/`, la recherche du site et le répertoire du personnel. Il n'y a rien à recopier ailleurs.

Chaque lieu a des champs comme `name`, `addr`, `contact` (libellé, téléphone, courriel), `reservations` et une `fiche` (le texte des fiches de `/espaces/` et `/nous-joindre/`). On peut y corriger un texte, un numéro ou un courriel entre guillemets.

- **Ne changez pas `id` ni `fiche.id`** : ce sont les ancres de `/horaires/#…` et de `/espaces/#…`, visées par d'autres pages.
- `codeBib` relie le lieu à l'API des horaires ; ne le changez pas sans l'équipe Web.
- **Les heures d'ouverture ne sont pas dans ce dépôt.** Elles sont lues en direct, dans le navigateur, depuis l'API `https://api.bib.umontreal.ca/horaires`. Pour changer un horaire, voyez l'équipe responsable de l'API.
- Les photos des lieux sont dans `src/data/horaires/images/`, nommées d'après `codeBib` (`am.webp`, `mu.webp`…).

## Le répertoire du personnel

Le répertoire (`/nous-joindre/notre-equipe/` et `/personnel/`) est lu dans le tableur `src/content/personnel/liste-personnel.xlsx` (première feuille). Les colonnes lues sont : `prenom`, `nom`, `fonction`, `direction`, `disciplines`, `bibliotheque`, `telephone`, `courriel`, `teams` et `photo`.

- Plusieurs disciplines ou bibliothèques se séparent par `;` (ou `|`).
- La photo va dans `src/content/personnel/photos/`. Dans la colonne `photo`, écrivez le nom du fichier, avec ou sans extension (`myriam-boyer` trouve `myriam-boyer.webp`). Format : carrée, 200 × 200 px, en WebP.
- Le nom d'une bibliothèque doit correspondre à un lieu de `src/data/horaires/lieux.ts` (son nom ou un de ses `aliases`).
- Chaque personne est aussi trouvée par la recherche du site.

## Images, bannières et PDF

- **Image d'une seule page** : dans un dossier `images/` à côté de la page (`src/content/pages/engagements/images/`), appelée par un chemin relatif (`./images/photo.webp`).
- **Image partagée par plusieurs pages** : `src/content/pages/images/`.
- **Bannières** : `src/content/pages/images/super-heroes/`, appelées par leur nom sans extension (`accueil`, `default`, `engagements`, `enseignement`, `espaces`, `etudes`, `horaire`, `horaires-bib`, `nous-joindre`, `noussoutenir`, `obtenir`, `recherche`). Une nouvelle bannière : demandez à l'équipe Web.
- **Format** : WebP, 2400 px au plus sur le grand côté, nom en minuscules sans accents ni espaces. Le site produit lui-même les tailles et formats légers.
- **Texte de remplacement** : décrivez l'image entre crochets (`![Salle de lecture](./images/salle.webp)`), ou laissez les crochets vides si elle est décorative.
- **PDF** : dans `public/`, rangés par section ; le lien s'écrit sans `public`.

Détail : `docs/REDACTION.md`, § 2.4 et 4.

## Ce qui ne se change pas ici

| Information | Où elle vit |
| :-- | :-- |
| Heures d'ouverture | API `https://api.bib.umontreal.ca/horaires` |
| Formations à venir (accueil, `/etudes/`) | API `https://api.bib.umontreal.ca/formations/` |
| Événements du « Quoi de neuf » | Flux RSS du calendrier de l'UdeM (`calendrier.umontreal.ca`), organisateur « Les bibliothèques » |
| Bandeau d'avis, alerte d'urgence, bandeau des témoins, « Cette page vous a-t-elle été utile? » | Composants de la bibliothèque commune `bibudem/ui`, chargés depuis un CDN |
| Formulaires « Nous écrire », suggestion d'achat, réserve de cours ; clavardage | Outils LibWizard et LibChat de Springshare |

## Voir le résultat

1. Dans un terminal, à la racine du projet : `npm run dev` (ou `npm run dev:fond` pour le garder en arrière-plan).
2. Ouvrez http://localhost:4321 et allez à l'adresse de la page.
3. La page se met à jour dès que vous enregistrez le fichier. En cas d'erreur, le terminal donne le fichier (et la ligne, pour une page de texte) ; la page garde alors sa version précédente.
4. Regardez la page sur un écran étroit (téléphone) et sur un grand écran.

Pour installer le projet la première fois : Node 22.22 ou plus récent, puis `npm install`. Si une page ne se met pas à jour après un déplacement de fichier, demandez à un développeur (voir [Le cache de contenu](#le-cache-de-contenu)).

Personne à contacter : **l'équipe Web**. Aucune modification n'est publiée sans la revue du responsable du site.

---

# Partie 2 : fonctionnement du site

## Vue d'ensemble

- **Astro 7**, rendu **statique** : `astro build` produit des fichiers HTML dans `dist/`. Il n'y a pas de serveur d'application.
- **Mêmes URL que la source** : `trailingSlash: 'always'` et `build.format: 'directory'` (`astro.config.mjs`) ; chaque page est un `index.html` dans son dossier.
- **Contenu séparé de la présentation** : pages de texte en Markdown pur, vitrines en YAML, données dans `src/data/`. Les rédacteurs n'écrivent ni HTML ni CSS.
- **Peu de JavaScript** : HTML natif d'abord, petits scripts ensuite, un îlot React seulement pour `/horaires/`.
- **Jetons de design** pour toutes les couleurs, polices, espacements, durées et courbes.
- **WCAG 2.2 AA** comme exigence.
- Langue du projet : **français** (code, commentaires, contenu). Seuls les composants MDX gardent leur nom d'origine (`Section`, `CardWithIcon`…) pour que le contenu se convertisse tel quel.

Les règles détaillées sont dans **`docs/CONVENTIONS.md`**, à lire avant tout travail.

## Commandes

| Commande | Effet |
| :-- | :-- |
| `npm install` | Installe les dépendances |
| `npm run dev` | Serveur de développement sur http://localhost:4321 |
| `npm run dev:fond` | Le même, en arrière-plan (`astro dev --background`) |
| `npm run dev:arreter` | Arrête le serveur en arrière-plan (`astro dev stop`). Nécessaire après un déplacement de fichiers ou la modification d'un plugin. |
| `npm run dev:propre` | Arrête le serveur, supprime le cache de contenu (`.astro/data-store.json`) et relance en arrière-plan |
| `npm run verifier` | Contrôle toutes les pages sur le serveur de dev (voir [Vérifier son travail](#vérifier-son-travail)) |
| `npm test` | Tests unitaires (`src/**/*.test.ts`, avec `node --test`) : logique des horaires |
| `npm run cms:local` | Serveur local de Decap CMS (port 8081), pour essayer `/admin/` sans GitHub (voir [Interface de rédaction](#interface-de-rédaction-decap-cms)) |
| `npm run build` | Build statique dans `dist/` |
| `npm run preview` | Sert `dist/` |
| `npm run astro -- …` | Toute autre commande de la CLI d'Astro |

Node **22.22 ou plus récent** est exigé (`engines` de `package.json`, exigence d'Astro 7).

Plusieurs personnes ou agents peuvent travailler dans le même dossier avec un seul serveur de dev : ne lancez pas un second serveur ni un build pendant ce temps.

## Contenu : les collections

`src/content.config.ts` déclare quatre collections, validées par des schémas **zod** :

| Collection | Source | Chargeur | Rendu par |
| :-- | :-- | :-- | :-- |
| `pages` | `src/content/pages/**/*.{md,mdx}` | `glob` | `GabaritPage` |
| `vitrines` | `src/content/pages/**/*.yaml` | `glob` | `GabaritVitrine` |
| `nouvelles` | `src/content/nouvelles/**/*.{md,mdx}` | `glob` | `GabaritNouvelle` |
| `revueDePresse` | `src/content/revue-de-presse/articles.json` | `file` | listes d'actualités seulement (pas de page) |

**Identifiants = URL de la source.**

- Pages et vitrines : `<dossiers>/<slugify(nom de fichier)>` ; `index` donne le dossier. Les dossiers ne passent pas dans `slugify`, comme dans `gatsby-node.mjs`. Le `slug:` du frontmatter des pages est ignoré, comme il l'était (de fait) dans Gatsby.
- Nouvelles : `<année>/<slug du frontmatter>`, casse conservée, ou le nom de fichier passé dans `slugify`.

**Une URL, une source.** Pages et vitrines partagent l'arborescence `src/content/pages/`. `generateId` (`idUnique`) fait échouer le build si deux fichiers donnent le même identifiant (`x.md` et `x.mdx`, `index.mdx` et `index.yaml`), et `toutesLesPages()` (`src/lib/contenu.ts`) le revérifie entre les deux collections.

**Schémas.**

- `pages` : `title`, `description`, `crumbLabel`, `template` (`doc` ou `blank`), `secondaryNav`, `superHero` (`imageName`, `title`, `size`), `noindex`, `lvl`, `lang` (BCP 47).
- `vitrines` : `schemaVitrine()` de `src/components/vitrines/schema.ts`, **strict** (`.strict()` partout). Une clé inconnue, une couleur hors du thème, une icône inconnue, une bannière ou une image introuvable font échouer le build avec le chemin du champ (`sections.3.cartes.0.icone`). Les vitrines reprennent les champs communs (`title`, `crumbLabel`, `description`, `secondaryNav`, `noindex`, `lang`) : fil d'Ariane, navigation secondaire, recherche et sitemap les traitent comme les autres pages (`Page = PageTexte | Vitrine`, `estVitrine()`).
- `nouvelles` : `title`, `titreAffiche`, `slug`, `date`, `source`, `newsUrl`, `authors`, `crumbLabel`, `newsImage` (avec `image()` d'`astro:assets`).
- `revueDePresse` : `title`, `date`, `source`, `url`, `lang` (défaut `fr`) ; l'identifiant est l'URL de l'article.

`src/lib/contenu.ts` regroupe l'accès au contenu partagé par les gabarits et la coquille : `toutesLesPages()`, `toutesLesNouvelles()` (triées par date décroissante), URL, niveau d'une page, fil d'Ariane (`crumbLabel` sinon `title`), arbre de la navigation secondaire (`secondaryNav`), exclusions de la recherche.

## Des fichiers aux pages : routage et gabarits

Une seule route dynamique, **`src/pages/[...chemin].astro`**, génère toutes les pages de contenu dans `getStaticPaths()` : chaque entrée de `toutesLesPages()` à son identifiant (`index` → `/`), chaque nouvelle à `/nouvelles/<id>/`. Le choix du gabarit :

| Entrée | Gabarit |
| :-- | :-- |
| Vitrine (`.yaml`) | `GabaritVitrine` |
| Nouvelle | `GabaritNouvelle` |
| Page avec `template: blank` | `Base` en mode `vierge` (sans en-tête ni pied de page, `noindex`) |
| Page `.md` | `GabaritPage`, contenu enveloppé dans `RenduDirectives` |
| Page `.mdx` | `GabaritPage`, contenu rendu avec `components={composantsMdx}` |

Les autres routes de `src/pages/` : `404.astro`, `search-index.json.ts` (index de la recherche interne) et `robots.txt.ts`.

Les gabarits, dans `src/layouts/` :

- **`Base.astro`** : squelette HTML commun. `<head>` (titre « Titre \| Les bibliothèques / UdeM », description, canonique, partage, `noindex`), préchargement des polices Figtree et Lora (sous-ensemble latin, pour éviter le décalage de mise en page), lien d'évitement, en-tête, pied de page, liens rapides, boîte de recherche, web components institutionnels (`ServicesInstitutionnels.astro`) et script des apparitions au défilement. Une page dont le `lang` n'est pas le français met cette langue sur `<html>` ; les pièces de la coquille restent en français.
- **`GabaritPage.astro`** : pages de texte. Niveau 0 et 1 : contenu pleine largeur ; une page `.md` de niveau 1 déclare sa bannière dans `superHero` et le gabarit la rend en petit format, avec le titre en `h1`. Niveau 2 et plus : bannière de section, fil d'Ariane, navigation secondaire (colonne à gauche dès 1200 px, bloc repliable « Dans cette section » en dessous ; les deux sont rendus en HTML et basculés en CSS).
- **`GabaritVitrine.astro`** : la bannière porte le `h1`, chaque élément de `sections` devient une bande (`Section`) et un bloc `Bloc*.astro`, chaque bloc commence par un `h2`. Le gabarit règle seul la mise en page : décalage de la première bande colorée, bandes voisines de même fond fusionnées (`suite`), apparitions au défilement.
- **`GabaritNouvelle.astro`** : fil d'Ariane sans le maillon de l'année, titre (`titreAffiche` ou `title`), date, image, contenu, données structurées `NewsArticle`.

## Le traitement du Markdown : plugins et directives

`astro.config.mjs` définit **deux processeurs** (`unified` de `@astrojs/markdown-remark`, `smartypants` désactivé car le contenu est déjà typographique) :

- **MDX** (pages `.mdx`) : `rehype-ancres-titres`, puis `rehype-titre-principal`.
- **Markdown** (pages et nouvelles `.md`) : `remark-directive` et `remarkDirectivesBib`, puis les deux mêmes plugins rehype, puis `rehypeDirectivesBib` en dernier. Les directives n'existent pas dans le MDX, où un « voir:ici » reste du texte.

Les plugins, dans `src/plugins/` :

- **`rehype-ancres-titres.mjs`** : identifiants des titres h2 à h6, calculés comme `gatsby-remark-autolink-headers` (sans accents, minuscules) pour garder les ancres publiques, et lien d'ancre accessible placé après le texte. `{#id}` en fin de titre fixe l'ancre. Logique partagée avec les titres de vitrine dans `src/lib/ancres.ts`.
- **`rehype-titre-principal.mjs`** : un seul `h1` par page de niveau 2 et plus. S'il n'y en a aucun, tous les titres Markdown montent d'un niveau ; la classe `apparence-hN` (`global.css`) garde leur apparence et leur `id` ne change pas. Exclus : l'accueil et les nouvelles. On écrit donc le contenu comme dans la source, premier titre en `##`.
- **`directives.mjs`** : `remarkDirectivesBib` vérifie chaque directive (nom, attributs, valeurs, icônes, images) d'après le `VOCABULAIRE` et fait échouer le build avec le fichier et la ligne. `rehypeDirectivesBib` change ensuite directives, tableaux, images et liens en **commentaires-marqueurs** (`marqueurs-directives.mjs`, attributs en JSON base64), que `src/components/partage/RenduDirectives.astro` remplace par **les composants du MDX**. Une page `.md` a donc exactement le balisage et les styles d'une page MDX, sans copie de CSS.
- **`icones.mjs`** : vérifie au build les noms d'icônes écrits par les rédacteurs (nom de phosphoricons.com comme `calendar-dots`, nom de composant, ou icône maison : `sofia`, `burger`, `udem`…). Il sert au plugin remark et au schéma des vitrines. Le rendu à partir du nom est dans `src/lib/icones.ts` (`import.meta.glob` paresseux).

Le vocabulaire des directives (`:::accordeon`, `:::alerte`, `:::cartes`, `:::citation`, `:::encadres`, `:::galerie`, `:::icone-texte`, `:::image-texte`, `:::liens`, `:::logos`, `:::modalites`, `:::section`, `:::tableau`, `::bouton`, `:icone`) et le composant qui rend chacune sont dans `docs/CONVENTIONS.md` ; leur usage, dans `docs/REDACTION.md`, § 2.3. Un besoin de mise en forme récurrent devient une nouvelle directive, jamais du HTML dans le contenu.

Le serveur de dev ne recharge pas un plugin modifié : voir [Le cache de contenu](#le-cache-de-contenu).

## Les composants

Tous dans `src/components/`, en `.astro` sauf les îlots :

- **`coquille/`** : en-tête (`Entete.astro`) et menu (`entete/PanneauMenu.astro`, rideau en motif « disclosure navigation » de l'APG : recherche Sofia en haut ; sur bureau, catalogue des services en onglets horizontaux de l'APG avec un aperçu de hauteur fixe et l'accès rapide à droite ; sur téléphone, accordéons et pied collé avec poignée à glisser ; champ de recherche commun `entete/ChampRecherche.astro`), boîte de recherche interne (`Recherche.astro` et `recherche/`), fil d'Ariane, navigation secondaire, bannière de section, pied de page, liens rapides (avec le clavardage LibChat), rétroaction, web components institutionnels. Ils ne font que rendre les données de `src/data/navigation.ts`.
- **`mdx/<famille>/`** : les composants utilisables dans le contenu, par famille (`accordeons`, `cartes`, `dynamiques`, `horaires`, `icones`, `integrations`, `mise-en-page`, `modalites`, `personnel`, `primitives`). Chaque famille exporte ses composants dans son `index.ts` ; `mdx/composants.ts` les réunit par `import.meta.glob` en `composantsMdx`, disponibles sans import dans tout le MDX. Ils gardent les noms et les props de la source ; `sx` n'est pas pris en charge ; tous acceptent `class` et `style`.
- **`vitrines/`** : un `Bloc*.astro` par type de bloc (18), plus `schema.ts` (schéma zod des blocs) et quelques pièces communes (`Titre.astro`, `TexteMarkdown.astro`, `Volets.astro`, `ListeVignettes.astro`, `GalerieTuiles.astro`). Un nouveau besoin de vitrine = un nouveau type de bloc (schéma + `Bloc*.astro` + `GabaritVitrine` + `REDACTION.md`), jamais une option de mise en page laissée au rédacteur.
- **`ilots/`** : îlots React, seulement si l'état est complexe. Aujourd'hui : la carte des horaires (`ilots/horaires/`, Leaflet), montée par `mdx/horaires/CarteHoraires.astro` en `client:visible`.
- **`icones/`** : icônes et logos maison (SVG), réexportés pour le MDX par `mdx/icones/index.ts`. Les autres icônes viennent de `@phosphor-icons/react`, rendues en SVG statique.
- **`partage/`** : `RenduDirectives.astro` (directives des pages `.md`) et `RenduJsx.astro` (JSX passé en prop, sans quoi il s'afficherait « [object Object] »).

Les utilitaires sans rendu partagés par plusieurs familles sont dans `src/lib/` (URL et navigation, analyse des liens, couleurs et fonds du thème, bannières, icônes, Markdown des vitrines, extraits pour la recherche, personnel, Sofia, animations). Imports par l'alias `@/` (vers `src/`, déclaré dans `tsconfig.json` et `vite.resolve.alias`), y compris dans le contenu.

Chaque famille a une page de démonstration : `src/content/pages/dev/composants/<famille>.mdx` (et `directives.md`), visible à l'adresse `/dev/composants/<famille>/` (par exemple http://localhost:4321/dev/composants/directives/).

## Styles, jetons et mouvement

- **`src/styles/tokens.css`** : les jetons de design repris du thème MUI de la source : couleurs de marque, polices, rayons, durées et courbes, et une **échelle d'espacement par rôle** (`--espace-element`, `--espace-titre`, `--espace-bloc`, `--espace-blocs`, `--espace-bande`, `--espace-grille`, `--espace-carte`). Aucune couleur ni valeur d'espacement en dur dans les composants. Pour du texte orange : `--rouge-orange-texte` (le `--rouge-orange` n'a que 3,45:1).
- **`src/styles/global.css`** : base, typographie, focus visible, classes utilitaires (`.conteneur`, `.surface-claire`, `apparence-hN`, `visuellement-masque`…) et la règle globale `prefers-reduced-motion`. La racine vaut 106,25 % puis 112,5 % dès 900 px (17 / 18 px par défaut), ce qui respecte la taille de texte choisie dans le navigateur.
- **Mesure du texte** : `--mesure-texte` (52ch, environ 73 caractères) limite la longueur de ligne des paragraphes, citations et listes de `<main>` (règle à spécificité nulle de `global.css`).
- **Hauteurs mesurées en direct** : `--hauteur-entete` (en-tête, pour la marge de défilement et le focus) et `--hauteur-liens-rapides` (barre mobile, pour la marge du bas) sont posées par script d'après la hauteur réelle, qui change avec le texte agrandi.
- Styles **scopés** dans chaque composant ; `:global()` seulement pour du contenu passé en slot. Mobile d'abord, seuils 600, 900, 1200 et 1536 px. Pas de rendu conditionnel selon la largeur en JavaScript : les variantes sont en HTML et basculées en CSS.
- **Mouvement** : `transform` et `opacity` seulement (sauf exceptions documentées), durées et courbes des jetons, transitions plutôt que `@keyframes` pour tout ce qui peut s'interrompre. Les **apparitions au défilement** sont réservées aux vitrines (`src/lib/animations.ts`, `src/styles/animations.css`, attributs `data-revelation`) : l'état par défaut est l'état final, rien n'est masqué sans JS ni avec le mouvement réduit, rien n'est animé au-dessus de la ligne de flottaison, pas de décalage de mise en page.

Détail : `docs/CONVENTIONS.md`, « Styles », « Espacements » et « Mouvement ».

## Interactivité

Par ordre de préférence :

1. **HTML natif** : `<details>`/`<summary>` (accordéons, `name` pour un groupe exclusif), `<dialog>` (recherche interne), `<form>` (recherche Sofia), ancres.
2. **Un petit `<script>` dans le composant**, en amélioration progressive : sans JS, le contenu reste accessible. Astro le regroupe et le déduplique.
3. **Un îlot React** dans `src/components/ilots/`, en `client:visible` ou `client:idle`.

Les motifs ARIA suivent l'APG WAI-ARIA (onglets, accordéon, carrousel, dialogue, navigation).

`prefetch` est réglé sur `hover` sans préchargement global.

## Données et contenus dynamiques

Lus **au build** :

- `src/data/navigation.ts` : liens de la coquille.
- `src/data/horaires/lieux.ts` : lieux du réseau, **source unique** de `/horaires/`, des fiches de `/espaces/` et `/nous-joindre/`. `src/data/bibliotheques.ts` en est dérivé (recherche interne, répertoire du personnel) ; ne l'éditez pas à la main.
- `src/content/personnel/liste-personnel.xlsx` : lu par `src/lib/personnel.ts` (paquet `xlsx`), nettoyé et trié ; les photos sont associées par nom de fichier sans extension.
- Les nouvelles et la revue de presse, réunies par `src/components/mdx/dynamiques/actualites.ts` : les listes s'affichent sans JavaScript.

Lus **dans le navigateur**, parce qu'ils changent plus souvent que le site n'est reconstruit :

- Heures d'ouverture : `https://api.bib.umontreal.ca/horaires` (`src/data/horaires/horaires.ts`, logique pure en heure de Montréal).
- Formations : `https://api.bib.umontreal.ca/formations/` (colonne de l'accueil, et deux colonnes de 4 sur `/etudes/`, toutes deux par `ListeFormationsAccueil.astro`). Depuis `localhost`, le navigateur bloque cette API (règle d'accès entre origines) : la colonne affiche alors son état d'erreur, ce qui est normal en développement.
- Événements : flux RSS de `calendrier.umontreal.ca`.

Ces chargements passent par `src/components/mdx/dynamiques/chargement.ts` (délai, nouvel essai) et affichent un état d'erreur avec « Réessayer » (`EtatErreur.astro`).

Recherche **Sofia** (WorldCat Discovery) : `src/lib/sofia.ts`, partagé par l'accueil et le menu. C'est un vrai formulaire GET vers `https://umontreal.on.worldcat.org/search` ; le script ajoute seulement le préfixe `kw:`.

Composants tiers chargés depuis `https://cdn.jsdelivr.net/gh/bibudem/ui@1/dist` : `<udem-urgence>`, `<bib-avis>`, `<bib-retroaction-usager>`.

Consentement et statistiques : `src/components/coquille/Consentement.astro` et `src/lib/consentement.ts`. Le choix est gardé dans le témoin `bib-consentement` sur `bib.umontreal.ca`, au même format que `studio.bib.umontreal.ca`. Google Tag Manager et Clarity ne se chargent qu'après un consentement valide.

## Recherche interne

- **`src/pages/search-index.json.ts`** génère au build `/search-index.json` : pages et vitrines (sauf `noindex`, dossiers de démo et quelques pages utilitaires), nouvelles, bibliothèques (`/espaces/#…`) et personnel (vers le répertoire avec `?q=`). Format de la source (`title`, `excerpt`, `url`, `section`) plus `words`, les mots distincts du texte entier, pour que « Sofia » ou « citer » trouvent quelque chose.
- **`src/components/coquille/Recherche.astro`** : boîte de dialogue en `<dialog>` natif. L'index et MiniSearch ne se chargent qu'à l'ouverture (`recherche/moteur.ts`). Elle s'ouvre par le bouton loupe, par `?search=1` dans l'URL, ou par l'événement `recherche:ouvrir` (`detail : { requete, portee }`), qu'utilise le champ « Ressources » du menu.
- **`recherche/portees.ts`** : les portées (site, Sofia, Boîte à outils, Studio·bib) et leurs adresses de résultats, source unique pour la boîte et pour les champs du menu (`formulairePortee()` en donne le formulaire GET équivalent, utilisé sans JavaScript).

## Images

- `astro:assets` partout : `<Image>` ou `<Picture>`, formats `avif` et `webp`, largeurs de l'option `image.breakpoints` (600, 900, 1200, 1536, les mêmes que `gatsby-plugin-sharp`), `alt` obligatoire, `loading="lazy"` sauf au-dessus de la ligne de flottaison.
- Toutes les images de `src/` sont en **WebP** (2400 px au plus) ; les photos du personnel font 200 × 200 px (affichées à 100 px, 2× compris).
- Les images du contenu sont des chemins relatifs ; dans les vitrines, `image()` du schéma les résout et vérifie qu'elles existent.
- Les bannières sont résolues par nom (`src/lib/bannieres.ts`, `import.meta.glob` sur `src/content/pages/images/super-heroes/`) ; un nom inconnu fait échouer le build en listant les noms possibles.
- `public/` est copié tel quel : PDF, `favicon`, `manifest.webmanifest`, fichiers de validation Google, applications autonomes `ddia/` et `radaria/`, `consent/server/` (gardé parce que boite-outils et son `<bib-consent>` l'utilisent encore).

## Redirections, sitemap et robots.txt

- **`public/_redirects`** : environ 344 redirections reprises de la source, au format Netlify (`ancienne<TAB>nouvelle`, `*` en fin de source), surtout d'anciens guides vers `boite-outils.bib.umontreal.ca` et `studio.bib.umontreal.ca`. Le fichier est copié dans `dist/` ; **c'est le serveur d'hébergement qui doit l'appliquer**, et le dépôt ne dit pas lequel le fait (à vérifier côté serveur des Bibliothèques).
- **`redirects` d'`astro.config.mjs`** : redirections gérées par Astro (aujourd'hui : `/nous-soutenir/accessibilite-web/` → `/accessibilite-web/`).
- **Sitemap** : `@astrojs/sitemap`. Les pages à exclure sont listées par motif dans `HORS_SITEMAP` d'`astro.config.mjs`. Le `noindex` d'une page ne l'en retire **pas** automatiquement : une page passée en `noindex` doit aussi y être ajoutée.
- **`robots.txt`** (`src/pages/robots.txt.ts`) dépend de `SITE_ENV`, déduit de la branche git dans `astro.config.mjs` : branche `production` → tout permis sauf `/consent/`, avec le sitemap ; toute autre branche (préproduction) → rien n'est indexé. `SITE_ENV` peut être forcé au build.

## Accessibilité

WCAG 2.2 AA, non négociable. En bref : contrastes calculés (4,5:1 texte, 3:1 gros texte, icônes porteuses de sens, focus), focus toujours visible et jamais caché sous l'en-tête collant, un seul `h1` et aucun niveau sauté, repères nommés et lien d'évitement, cibles de 24 px au moins (44 px pour les commandes principales sur mobile), texte agrandi à 200 % sans débordement, couleurs forcées, mouvement réduit respecté, changements d'état annoncés dans une région `role="status"`, `lang` sur tout passage dans une autre langue. Les liens vers un PDF ou qui ouvrent un nouvel onglet l'annoncent.

Détail : `docs/CONVENTIONS.md`, « Accessibilité ».

## Vérifier son travail

- Le serveur de dev (http://localhost:4321) est l'outil de vérification ; on lit ses pages (`curl`, ou un navigateur automatisé).
- **`npm run verifier`** (`scripts/verifier-pages.mjs`) parcourt toutes les pages de `src/content/pages/` (hors `dev/`) et toutes les nouvelles sur le serveur de dev, et contrôle : statut 200, présence de `<footer` (son absence trahit un rendu MDX interrompu qui répond quand même 200), un seul `h1` sans niveau sauté, aucun « [object Object] », aucun débordement horizontal à 390 et 1440 px. Options : `--base=URL`, `--seulement=motif`, `--ids=fichier.json` (enregistre les ancres des titres, pour comparer deux exécutions et s'assurer qu'aucune ancre publique n'a changé).
- Le script utilise `playwright-core` (dépendance de développement), qui pilote le Google Chrome installé (`/Applications/Google Chrome.app`, chemin en tête de `scripts/verifier-pages.mjs`) : aucun navigateur à télécharger. Sur un autre système, adaptez ce chemin.
- Pour comparer avec l'ancien site : `docs/CONVENTIONS.md` indique que le site Gatsby construit est servi sur http://localhost:9000.

## Le cache de contenu

Astro garde le rendu des entrées de contenu dans `.astro/data-store.json`. Après la modification d'un plugin remark ou rehype (`src/plugins/`) ou d'un schéma de contenu, les pages qui n'ont pas changé gardent leur ancien rendu, et un redémarrage ne suffit pas : lancez **`npm run dev:propre`** (arrêt, suppression du cache, relance en arrière-plan). Après un simple déplacement de fichiers : `npm run dev:arreter` puis `npm run dev:fond`.

## Construire et déployer

1. `npm install`, puis `npm run build` : le site complet est dans `dist/`.
2. `npm run preview` pour le parcourir localement.
3. Déployer **le contenu de `dist/`** sur un serveur de fichiers statiques. Le serveur doit servir `…/page/index.html` pour `/page/`, et appliquer `_redirects` (voir plus haut).

Points d'attention :

- **Node 22.22 ou plus récent** est exigé par Astro 7. Le serveur des Bibliothèques est en Node 20.11 : construisez ailleurs (poste ou intégration continue en Node 22.22+) et ne déployez que `dist/`, qui n'a pas besoin de Node.
- Construisez depuis la branche `production` (ou avec `SITE_ENV=production`) pour obtenir le `robots.txt` de production ; sinon le site est marqué non indexable.
- Build complet validé le 2026-10-22 : 86 pages, environ 105 Mo (les images de repli de `<Picture>` sont en WebP, `fallbackFormat="webp"`, au lieu de PNG de plusieurs Mo).
- Les chemins de fichiers lus au build se résolvent depuis la racine du projet (`process.cwd()`), jamais depuis le module : le code est regroupé dans `dist/.prerender/` pendant le build.

### Aperçu sur GitHub Pages

`.github/workflows/deployer-pages.yml` construit et publie le site à chaque poussée sur `main` (ou à la demande, onglet Actions) : https://emirgc.github.io/bibweb/. Prérequis, une seule fois : Settings > Pages > Source : « GitHub Actions ».

- Le site y est dans un **sous-dossier** (`/bibweb/`). Le workflow passe `BASE_PATH` (option `base` d'Astro) ; l'intégration `src/plugins/base-sous-dossier.mjs` préfixe en fin de build les liens écrits à la racine (`href`, `src`, `srcset`, `action`, redirections, `search-index.json`). Le code qui fabrique une adresse dans le navigateur passe par `avecBase()`, et celui qui lit l'adresse de la page par `sansBase()` (`src/lib/chemin.ts`). Sans `BASE_PATH`, rien ne change.
- Construit avec `SITE_ENV=preprod` : non indexable, adresses canoniques vers `bib.umontreal.ca`.
- GitHub Pages n'applique pas `_redirects` ; les redirections d'`astro.config.mjs` (pages de redirection générées) fonctionnent.
- Les API (horaires, formations) peuvent refuser l'origine `emirgc.github.io` : les blocs dynamiques affichent alors leur état d'erreur.

## Interface de rédaction (Decap CMS)

[Decap CMS](https://decapcms.org/) donne aux rédacteurs des formulaires dans le navigateur, à l'adresse `/admin/`. Il n'a ni serveur ni base de données : il lit et écrit les fichiers du dépôt par l'API GitHub, avec le compte GitHub de la personne.

- **`public/admin/index.html`** charge Decap (version fixée, depuis unpkg).
- **`src/pages/admin/config.yml.ts`** génère la configuration à partir du contenu : une fiche par page `.md` (regroupées par section), la collection des nouvelles, les sujets (`src/data/sujets.ts`) et les bannières (`src/content/pages/images/super-heroes/`). Une nouvelle page `.md` y apparaît d'elle-même. Les pages `.mdx` ne sont pas encore modifiables.
- **Vitrines** (`.yaml`) : leurs champs sont dans `src/pages/admin/_vitrines.ts`, repris de `src/components/vitrines/schema.ts` (à tenir ensemble : un champ ajouté au schéma s'ajoute aussi là). Chaque section choisit son bloc parmi les 20 types. Elles s'écrivent avec le format de `public/admin/format-vitrine.js` : textes sur une ligne, lignes vides entre les sections, en-tête vers le guide ; seuls les autres commentaires du fichier se perdent à l'enregistrement.
- **Corps en Markdown brut** : un éditeur visuel réécrirait les directives. L'en-tête est réécrit à l'enregistrement (ordre des champs de la configuration, dates sans guillemets, listes à la ligne), sans effet sur le site.
- **Publication** : en ligne, chaque enregistrement ouvre une branche et une pull request (`editorial_workflow`) ; `.github/workflows/verifier-pr.yml` construit le site sur chaque PR, et le responsable fusionne. Rien n'est publié sans cette fusion.
- **Connexion** : Decap passe par une application OAuth GitHub et un relais (n8n) qui garde son secret. Decap ouvre `/admin/connexion.html` (`src/pages/admin/connexion.html.ts`), qui envoie au relais ; le relais revient sur cette page avec le jeton, qu'elle remet à Decap. Deux variables au build : `DECAP_ORIGINE` (origine du site, ex. `https://emirgc.github.io`) et `DECAP_AUTH_URL` (adresse complète du relais). Sans elles, la connexion en ligne ne fonctionne pas.
- **Accès** : chaque rédacteur a un compte GitHub avec le rôle *Write* sur le dépôt ; la branche `main` est protégée (PR et approbation obligatoires).

Essai local, sans GitHub ni relais : `npm run dev:fond`, puis `npm run cms:local`, puis http://localhost:4321/admin/index.html et « Se connecter ». En développement, Decap écrit directement dans les fichiers (pas de branche ni de PR) : `git diff` montre ce qu'il a changé.

## Documentation

| Document | Pour qui | Contenu |
| :-- | :-- | :-- |
| `docs/REDACTION.md` | Rédacteurs | Pages de texte, directives, vitrines et leurs blocs, images, interdits |
| `docs/CONVENTIONS.md` | Développeurs (à lire en premier) | Arborescence, deux types de pages, styles, espacements, composants MDX, titres, interactivité, mouvement, accessibilité, vérification, cache |
| `docs/A-FAIRE.md` | Équipe | Suivi de la conversion : fait, à valider, reste à faire |
| `docs/inventaire/` | Développeurs | Spécifications détaillées de la source : coquille et plomberie, catalogue des composants, analyse du contenu MDX |
| `docs/GATSBY-VERS-ASTRO.md` | Responsable, équipe Web | Bilan du passage de Gatsby à Astro : ce qu'on a trouvé, ce qu'on a corrigé, pourquoi Astro |
| `AGENTS.md` | Agents | Consignes de travail et commandes |

Aucun commit sans l'accord explicite du responsable de la conversion.
