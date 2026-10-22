# Conventions de bibweb

`bibweb` est la conversion complète en **Astro 7** du site des Bibliothèques de l'UdeM, à partir de `~/Documents/git/coquille-web` (Gatsby 5, React 18, MUI 6). Ce document est le contrat commun de tous ceux qui travaillent sur la conversion, humains ou agents.

- **La source fait foi pour le contenu et l'apparence.** Le site doit garder les mêmes URL, le même contenu et la même identité visuelle.
- **On corrige en convertissant.** Accessibilité, HTML invalide, liens cassés, couleurs en dur, code mort : on ne reporte pas les défauts relevés dans `docs/inventaire/`.
- `coquille-web` est en **lecture seule**. On n'y modifie rien.

## Références

| Document | Contenu |
|---|---|
| `docs/inventaire/01-coquille-et-plomberie.md` | Configuration, URL, fil d'Ariane, navigation secondaire, index de recherche, thème, coquille (en-tête, menus, recherche, pied de page, liens rapides), gabarits |
| `docs/inventaire/02-composants.md` | Catalogue des composants de contenu : props, usages, API externes, composants à abandonner, problèmes repérés, cible Astro |
| `docs/inventaire/03-contenu-mdx.md` | Analyse du MDX : URL, frontmatter, imports, usages de MUI et de `sx`, liens relatifs, images, pages à risque |
| `docs/REDACTION.md` | Guide des rédacteurs : pages de texte (Markdown, frontmatter, directives), vitrines (YAML, blocs), images, interdits |

## Arborescence

```
src/
  content.config.ts          Collections pages, vitrines, nouvelles, revueDePresse
  content/pages/**.md        Pages de texte en Markdown pur (l'arborescence donne l'URL)
  content/pages/**.yaml      Vitrines : accueil et pages de section en données
  content/pages/**.mdx       Pages pas encore converties en .md ou .yaml (transition)
  content/pages/**/images/   Images propres à une page, à côté de celle-ci
  content/pages/images/      Images partagées par plusieurs pages, et super-heroes/ (bannières)
  content/nouvelles/AAAA/    Nouvelles converties (+ images/)
  data/                      Données du site, lues par les composants
    navigation.ts            Menu principal, pied de page, liens rapides (+ images/navigation/)
    horaires/lieux.ts        Lieux du réseau (fait foi), horaires.ts (API), images/
    bibliotheques.ts         Dérivé de lieux.ts (recherche, répertoire du personnel)
  lib/                       Utilitaires partagés (sans rendu)
    contenu.ts               URL, niveaux, fil d'Ariane, navigation secondaire
    liens.ts                 Analyse des liens (interne, PDF, nouvel onglet), liens de cartes
    styles.ts                Fusion des styles, espacement et seuils MUI, classes
    couleurs.ts              Couleurs du thème et de la palette vers les jetons
    ids.ts                   Identifiants uniques au rendu
    decoupage.ts             Découpe du HTML d'un slot (onglets, carrousel)
    bannieres.ts             Images des bannières par nom
    extrait.ts, personnel.ts Index de recherche, tableur du personnel
    fonds.ts                 Fonds de couleur des bandes (Section, directives, vitrines)
    icones.ts                Composant d'icône d'après un nom de rédacteur (books, sofia…)
    markdown.ts              Markdown d'un champ de données vers HTML (vitrines)
  layouts/                   Base, GabaritPage, GabaritNouvelle, GabaritVitrine
  components/coquille/       En-tête, menus, recherche, fil d'Ariane, pied de page…
  components/icones/         Icônes et logos maison (SVG), partagés par la coquille et le MDX
  components/mdx/<famille>/  Composants utilisables dans le MDX + index.ts
  components/mdx/icones/     index.ts qui réexporte les icônes maison pour le MDX
  components/vitrines/       Blocs des vitrines (Bloc*.astro) et schema.ts (schéma zod des blocs)
  components/ilots/          Îlots React (seulement si l'interactivité l'exige)
  components/partage/        RenduJsx, RenduDirectives (pages .md)
  styles/tokens.css          Jetons de design (variables CSS)
  styles/global.css          Base, typographie, focus, utilitaires
  plugins/                   Plugins remark/rehype ; directives.mjs (directives des .md),
                             icones.mjs (noms d'icônes vérifiés au build)
scripts/verifier-pages.mjs   Contrôle de toutes les pages (npm run verifier)
public/                      Copié tel quel (PDF, ddia, radaria, consent/server…)
migration/                   Travail ponctuel de la conversion, ignoré par git (scripts/ : préconversion, génération de lieux.ts)
```

### Où mettre quoi

- **`src/lib/`** : un module utilisé par **plusieurs familles** de composants (ou par la coquille et le MDX). Un module propre à une seule famille reste dans sa famille (`primitives/tableau.ts`, `cartes/revelation.ts`, `accordeons/onglets.ts`, `dynamiques/chargement.ts`, `personnel/normaliser.ts`…). Pas de doublon : avant d'écrire un utilitaire, cherchez-le dans `src/lib/`.
- **`src/data/`** : les données (listes de liens, lieux, métadonnées), séparées des composants qui les rendent. Une donnée a **une seule source** : `bibliotheques.ts` est dérivé de `horaires/lieux.ts`, qu'on édite à la main.
- **`src/components/icones/`** : les icônes et logos maison, un composant `.astro` par icône sur le socle `IconeSvg.astro` (décorative par défaut, `aria-label` la rend porteuse de sens), et les logos en `.svg`. Les icônes disponibles dans le MDX sont réexportées sous leur nom d'origine par `src/components/mdx/icones/index.ts` ; une nouvelle icône pour le MDX s'ajoute dans ces deux dossiers. Les icônes Phosphor ne passent pas par ce dossier.
- **Imports** : par l'alias `@/` dès qu'on sort du dossier courant (`@/lib/styles`, `@/components/icones/SofiaIcon.astro`), jamais par `../`. Un fichier voisin s'importe en relatif (`./normaliser`). Dans le contenu, les images restent en relatif (`./images/…`, `../images/…`).

## Deux types de pages

Le contenu est séparé de la présentation. Chaque page est **soit** une page de texte, **soit** une vitrine. Guide des rédacteurs : `docs/REDACTION.md`.

| | Page de texte | Vitrine |
| :-- | :-- | :-- |
| Pages | La majorité : pages de niveau 2 et plus, pages de texte de niveau 1 | Accueil et pages de section de niveau 1 (recherche, enseignement, engagements, espaces, a-propos, obtenir, nous-soutenir, nous-joindre, etudes) |
| Fichier | `src/content/pages/<chemin>.md` | `src/content/pages/<chemin>/index.yaml` (ou `index.yaml` pour l'accueil) |
| Collection | `pages` (avec les `.mdx` de la transition) | `vitrines` |
| Contenu | Markdown pur + frontmatter + directives | Données : `banniere` et `sections` (un bloc par section), schéma zod strict |
| Rendu | `[...chemin].astro` → `GabaritPage` → `RenduDirectives` | `[...chemin].astro` → `GabaritVitrine` → `components/vitrines/Bloc*.astro` |

Règles :

- **Une URL, une source.** Deux fichiers qui donnent le même identifiant (`diplomes.md` et `diplomes.mdx`, `recherche/index.mdx` et `recherche/index.yaml`) font échouer le build : `generateId` de `content.config.ts` le vérifie pour les deux collections, et `toutesLesPages()` (`lib/contenu.ts`) le revérifie entre elles. Quand on convertit une page, on supprime l'ancien fichier dans le même changement.
- **Métadonnées communes.** Les vitrines gardent les noms du frontmatter (`title`, `crumbLabel`, `description`, `secondaryNav`, `noindex`, `lang`) : fil d'Ariane, navigation secondaire, recherche interne et sitemap les traitent comme les autres pages (`Page = PageTexte | Vitrine`, `estVitrine()`).
- **Pas de JSX ni de HTML de mise en page dans un `.md`.** Seuls le Markdown (GFM : tableaux, `<br>` dans une cellule) et les directives de `src/plugins/directives.mjs` sont permis. Un besoin récurrent devient une directive (vocabulaire court, en français, documenté dans `REDACTION.md` et montré dans `/dev/composants/directives/`), jamais un bout de HTML.
- **Directives.** `remarkDirectivesBib` vérifie nom, attributs, valeurs et icônes, et fait échouer le build avec le fichier et la ligne. Les directives deviennent des commentaires-marqueurs (`marqueurs-directives.mjs`) que `RenduDirectives.astro` remplace par **les composants du MDX** : même balisage et mêmes styles qu'en MDX, aucune copie de CSS. Le vocabulaire complet (`VOCABULAIRE` de `src/plugins/directives.mjs`, détaillé dans `REDACTION.md`, § 2.3) :

  | Directive | Rendu |
  | :-- | :-- |
  | `:::accordeon` (un `###` par volet) | AccordionGroup, Accordion, AccordionSummary, AccordionDetails |
  | `:::alerte{type titre}` | Alert, AlertTitle |
  | `:::cartes{couleur}` (cartes à icône, à icône et appel, ou à photo) | Grid de Card2 ou de CardWithIcon, ou CardWithImage |
  | `:::citation{source}` | Blockquote |
  | `:::encadres{fond}` (un `####` par encadré) | encadrés de couleur (RenduDirectives) |
  | `:::galerie` | figures et légendes (RenduDirectives) |
  | `:::icone-texte{icone fond}` | texte et IconInSquare |
  | `:::image-texte{position taille}` | HeroWithImage (compact) ; `taille=petite` : petite image à côté du texte |
  | `:::liens` | RichList, RichListItemWithLink |
  | `:::logos` | grille de logos (RenduDirectives) |
  | `:::modalites` | Modalites, Modalite |
  | `:::section{fond id}` | Section |
  | `:::tableau{titre}` (et tout tableau GFM) | TableContainer (Paper), Table et ses parties |
  | `::bouton[Texte]{lien type alignement}` | Button ; les boutons qui se suivent forment une rangée |
  | `:icone[nom]{taille couleur}` | icône en ligne (Phosphor ou maison) |
  | `---` (avec une ligne vide avant) | Divider |
  | `## Titre {#id}` | ancre fixe d'un titre (rehype-ancres-titres) | Tout tableau GFM est rendu par TableContainer (Paper) et Table, avec la largeur minimale de 650 px de la source. Une directive de texte inconnue (`voir:ici`) reste du texte. Le processeur Markdown (`processeurMarkdown` d'`astro.config.mjs`) n'est pas celui du MDX : les directives n'existent pas dans le MDX.
- **Vitrines.** Le schéma (`components/vitrines/schema.ts`) est strict (`.strict()` partout) : une clé inconnue, une couleur hors du thème (`lib/fonds.ts`), une icône (`plugins/icones.mjs`), une bannière ou une image introuvable font échouer le build. Les images sont des chemins relatifs résolus par `image()` (optimisation d'`astro:assets` conservée). Le gabarit décide de la mise en page : h1 dans la bannière, h2 au début de chaque bloc (`Titre.astro`, `id` = ancre publique), `marginTop` de la première bande colorée, variante des pastilles de RichList d'après le fond. Un nouveau besoin = un nouveau type de bloc (schéma + `Bloc*.astro` + `GabaritVitrine` + `REDACTION.md`), jamais une option de mise en page laissée au rédacteur.
- **Icônes nommées.** Rédacteurs et vitrines nomment les icônes comme phosphoricons.com (`calendar-dots`) ou par une icône maison (`sofia`, `burger`, `udem`, dans `ICONES_MAISON`). `lib/icones.ts` charge le module de l'icône par `import.meta.glob` paresseux.
- **Texte des vitrines.** Les champs `texte` sont du Markdown rendu au build (`lib/markdown.ts`, `TexteMarkdown.astro`) ; leurs paragraphes passent par Typography, comme les `<Typography>` du MDX d'origine.
- **Pas de CSS propre à une page** en `.md` ni en vitrine : un besoin de mise en forme devient une directive ou un bloc.
- **MDX restant.** Une page reste en `.mdx` seulement si elle ne se décrit ni en Markdown + directives ni en blocs (composant applicatif ou interactif propre à la page) ; la liste est dans `A-FAIRE.md`.

## Langue et code

- Tout est en **français** : noms de fichiers des composants maison, variables, commentaires, textes. Exception : les composants MDX gardent leur **nom d'origine** (`Section`, `CardWithIcon`, `Grid`…) pour que le contenu se convertisse avec un minimum de changements.
- Les commentaires expliquent le **pourquoi**, jamais le quoi.
- TypeScript dans le frontmatter des `.astro` quand c'est utile (interface `Props`) ; pas d'abstractions superflues.
- Le compilateur d'Astro 7 est strict : toutes les balises non vides sont fermées et l'imbrication HTML est valide (pas de `<div>` dans un `<p>`, pas de bouton dans un bouton, pas de lien dans un lien).

## Styles

- **Jetons uniquement** : couleurs, polices, rayons, durées et courbes viennent de `src/styles/tokens.css` (`var(--bleu-principal)`, `var(--rayon-petit)`, `var(--duree-moyenne-1)`…). **Aucune couleur en dur** dans les composants, sauf les couleurs système (`Canvas`, `SelectedItem`…) en `forced-colors`.
- **Texte orange** : `var(--rouge-orange-texte)`, jamais `var(--rouge-orange)`, qui ne fait que 3,45:1 sur le fond. `--rouge-orange` reste pour les icônes et les éléments graphiques.
- **Styles scopés** : un bloc `<style>` dans le composant. `:global()` seulement pour styler du contenu passé en slot.
- **CSS propre à une page** : un fichier `.css` à côté de la page, importé en tête du MDX, juste après le frontmatter (`import './science-ouverte.css'`). Préfixez ses classes pour ne rien heurter dans la coquille. Pas de bloc ``<style>{`…`}</style>`` dans le MDX.
- **Mobile d'abord** : requêtes `min-width` aux seuils du thème, soit 600, 900, 1200 et 1536 px. La racine fait 17 px, puis 18 px dès 900 px : les `rem` sont relatifs à cette valeur, comme dans la source.
- **Pas de rendu conditionnel selon la largeur en JavaScript** (l'équivalent de `useMediaQuery`). Les variantes sont rendues en HTML et basculées en CSS : pas de saut à l'hydratation.
- **Longueur de ligne** : le texte courant ne dépasse pas 75 caractères par ligne (optimum de 50 à 75 selon Baymard ; WCAG 1.4.8 fixe 80 au plus). Le jeton `--mesure-texte` (52ch, environ 73 caractères en Figtree) s'applique dans `global.css` aux paragraphes, citations, légendes et listes de contenu de `<main>`, avec une spécificité nulle (`:where`). Un composant qui a besoin d'une rangée pleine largeur (barre d'outils, message) remet `max-inline-size: none` ; un texte centré dans une boîte plus large ajoute `margin-inline: auto`.
- **Conteneur** : la classe globale `.conteneur` (1536 px maximum, gouttières de 20 px, puis 64 px dès 900 px).

## Espacements

Une seule échelle, définie par rôle dans `src/styles/tokens.css`, au-dessus de l'échelle numérique de MUI (`--espace-1` à `--espace-8`, 1 unité = 0,5rem). Les composants n'écrivent **aucune valeur d'espacement en dur** pour l'espace vertical, les écarts de grille ou les marges internes des cartes : ils emploient le rôle. Du plus petit au plus grand :

| Jeton | Valeur (racine 17 px, puis 18 px dès 900 px) | Rôle |
| :-- | :-- | :-- |
| `--espace-element` | 1rem (17 / 18 px) | Entre deux éléments d'un même groupe : paragraphes d'un texte de vitrine, boutons d'une rangée, ligne d'une liste |
| `--espace-titre` | 1,25rem, puis 1,75rem dès 900 px (21 / 31,5 px, la moitié du h2) | Sous le titre d'un bloc (h2 de vitrine, titre d'un héros) |
| `--espace-bloc` | 2,5rem (42,5 / 45 px) | Entre les groupes d'un bloc : texte → boutons, parties empilées sur mobile (image, texte, icône, pied), introduction → grille, grille → bouton « voir tout », rangées image-texte d'une page de texte |
| `--espace-blocs` | 4rem (68 / 72 px) | Entre deux blocs d'une même bande |
| `--espace-bande` | 48 px, 64 px dès 900 px, 96 px dès 1200 px | Marge verticale d'une bande (Section) |
| `--espace-grille` | 1,5rem (25,5 / 27 px) | Entre les cartes d'une grille ou d'un carrousel, entre les encadrés |
| `--espace-carte` | 1,6667rem (28 / 30 px) | Marge interne des cartes (CardWithIcon, Card2, cartes à révélation, encadrés, fiches du personnel) ; les cartes à photo (CardWithImage) gardent `--espace-element` sous la photo |

Dimensions de même rôle : `--rayon-carte` (12 px, toutes les cartes), `--taille-pastille` (3,125rem, pastille fléchée d'une carte), `--taille-pastille-petite` (2,5rem, pastille d'une ligne de liste : RichList, listes Quoi de neuf), `--taille-icone-pastille`, `--taille-cible` (44 px).

Règles d'usage :

- **La bande seule fait l'espace du haut et du bas.** Section annule la marge haute de son premier enfant et la marge basse du dernier ; un bloc ne met donc jamais de marge en **style en ligne** sur son premier ou son dernier élément (un style en ligne l'emporterait), il passe par une classe.
- **Deux blocs voisins de même fond** (vitrines) ne sont séparés que par une marge de bande : la seconde bande est une `suite` (pas de marge haute).
- **Titre de bloc** (`Titre.astro`) : aucune marge au-dessus, `--espace-titre` dessous, quel que soit le bloc.
- **Héros** (HeroWithImage, HeroWithText, HeroWithText2, donc les blocs image-texte, icone-texte, texte-icones et la directive image-texte) : mêmes écarts à toutes les largeurs : `--espace-titre` sous le titre, `--espace-bloc` entre le texte et les boutons et entre les parties empilées sur mobile, `--espace-element` entre les boutons. Les marges propres au contenu (titre, dernier paragraphe, `margin-top` de Button) y sont neutralisées. Exception voulue : la directive image-texte des pages de texte est `compact` sous 900 px (vignette carrée à côté du titre).
- **Colonne de texte** : les blocs à lire (héros, texte, liste-liens, accordéons, fiches des bibliothèques) sont décalés d'une demi-colonne de chaque côté (GridOffset 0.5), titre compris ; les carrousels et les grilles de cartes occupent toute la largeur de la bande.
- **Pas d'écart par addition de marges** (carte + diapositive + piste) : un conteneur flex ou grille porte un `gap` de l'échelle, ses enfants n'ont pas de marge.
- L'espace horizontal à l'intérieur d'un petit composant (icône et libellé d'un bouton, puce) peut rester en `--espace-1` ou en px : ce n'est pas une relation entre blocs.

## Composants MDX

- Un composant par fichier : `src/components/mdx/<famille>/<Nom>.astro`. La famille l'exporte dans `src/components/mdx/<famille>/index.ts` :
  ```ts
  export { default as Section } from './Section.astro'
  ```
  `composants.ts` réunit tous les `index.ts` automatiquement. **Ne modifiez jamais l'index d'une autre famille.**
- **Props** : on garde celles que le MDX utilise réellement (voir les tableaux de `03-contenu-mdx.md` et de `02-composants.md`), avec les mêmes noms et les mêmes valeurs, pour que le contenu se convertisse tel quel.
  - `sx` n'est **pas** pris en charge. La conversion du contenu le remplace par `class`, `style` ou une feuille CSS propre à la page.
  - Les composants acceptent tous `class` et `style`, et les transmettent à leur élément racine.
- **Icônes** : les icônes maison sont dans `src/components/icones/` (voir « Où mettre quoi »). Sinon, un composant React de `@phosphor-icons/react` reçu en prop (`Icon={XIcon}`), rendu en SVG statique : `<Icon size={32} weight="light" aria-hidden="true" />`. Dans les composants, on importe depuis `@phosphor-icons/react/dist/ssr/<Nom>` (export `<Nom>Icon`). Une icône décorative porte `aria-hidden="true"`. Une icône seule dans un bouton ou un lien demande un nom accessible.
- **Images du contenu** : une image qui ne sert qu'à une page va dans un dossier `images/` à côté de cette page (`content/pages/espaces/images/`) ; une image partagée par plusieurs pages va dans `content/pages/images/` ; les bannières restent dans `content/pages/images/super-heroes/` (résolues par nom). Supprimez une image dès qu'elle ne sert plus.
- **Images** : un import d'image donne un `ImageMetadata`, pas une chaîne. Les composants acceptent `ImageMetadata | string` et rendent avec `<Image>` ou `<Picture>` d'`astro:assets` : formats `avif` et `webp`, `widths` et `sizes` adaptés, `alt` obligatoire (`alt=""` si l'image est décorative), `loading="lazy"` sauf pour l'image au-dessus de la ligne de flottaison.
- **JSX passé en prop** (`title={<Typography…/>}`, `footer={…}`) : dans un `.astro`, rendez-le avec `src/components/partage/RenduJsx.astro`, sinon il s'affiche « [object Object] ». Acceptez aussi un slot nommé du même nom.
- **Surfaces claires dans une Section foncée** : `Section` redéfinit `--couleur-lien`, `--couleur-focus` et `--rouge-orange-texte` pour son fond. Tout composant à fond blanc ou clair (carte, papier) met la classe globale `surface-claire` sur son élément racine pour les rétablir.
- **Imports dans le contenu** : par l'alias `@/` (vers `src/`, déclaré dans `tsconfig.json` et dans `vite.resolve.alias` d'`astro.config.mjs`), jamais par un chemin relatif fragile : `import Paper from '@/components/mdx/primitives/Paper.astro'`. Les images propres au contenu (`../images/…`) restent en relatif.
- **Composant global utilisé comme valeur** : les composants de `composantsMdx` ne sont disponibles que comme balises (`<Paper>`). Utilisé comme valeur de prop (`component={Paper}`), un composant n'en est pas tiré : il faut l'**importer** dans la page (`import Paper from '@/components/…'`). Sinon, la page plante avec `ReferenceError` mais répond quand même 200, avec un HTML tronqué juste après `<main>`.
- **Liens** : un lien externe qui ouvre un nouvel onglet l'annonce (« (nouvel onglet) » en texte masqué). Un lien vers un PDF reçoit l'icône PDF du CSS global et l'annonce « (PDF) ».

## Titres du contenu

- `src/plugins/rehype-ancres-titres.mjs` donne aux titres markdown (`##` à `######`) l'identifiant de la source (sans accents) et un lien d'ancre accessible. Écrivez donc les titres de contenu en **markdown** plutôt qu'en `<Typography component="h2">`, qui n'a pas de lien d'ancre. Exceptions : un titre dans une prop (`title={…}`) ou dont l'id de la source ne se déduit pas de son texte.
- `src/plugins/rehype-titre-principal.mjs` (après le précédent) donne un `h1` aux pages de niveau 2 et plus : si le contenu n'a aucun `h1`, tous les titres markdown montent d'un niveau (`##` → `h1`…), avec une classe `apparence-hN` (`global.css`) qui garde leur apparence et sans changer leur id. On écrit donc le contenu **comme dans la source** : premier titre en `##`. Sur une page de niveau 1 avec SuperHero, des titres qui commencent à `###` remontent pour commencer à `h2`.
- Les pages `.md` passent par les mêmes plugins (`processeurMarkdown` d'`astro.config.mjs`) : mêmes ancres, même promotion des titres.
- Un titre en JSX (`<Typography component="h3">`, `niveauTitre`) ne bouge pas : choisissez son niveau d'après la hiérarchie **finale** de la page.
- Le serveur de dev ne recharge pas un plugin modifié, ni un fichier déplacé : `npm run dev:arreter`, puis `npm run dev:fond` (`npx astro dev stop`, `npx astro dev --background`).

## Interactivité

Par ordre de préférence :

1. **HTML natif** : `<details>`/`<summary>` (accordéons, `name` pour un groupe exclusif), `<dialog>` (modales), `<form>`, ancres.
2. **Un petit `<script>` dans le composant** : Astro le regroupe et le déduplique. On l'écrit comme une amélioration progressive : sans JS, le contenu reste accessible.
3. **Un îlot React** dans `src/components/ilots/`, seulement si l'état est complexe (carte Leaflet, répertoire filtrable, horaires). Directive `client:visible` ou `client:idle`, jamais `client:load` sans raison.

Motifs ARIA : suivre l'APG WAI-ARIA (Onglets, Accordéon, Carrousel, Dialogue, Menu de navigation). Pour les onglets : `tablist`, `tab` et `tabpanel`, tabindex itinérant, flèches, Début et Fin.

## Mouvement

Le mouvement sert à quelque chose (rétroaction, état, continuité) ou il n'existe pas. Tout passe par les jetons de `tokens.css` (`--duree-*`, `--courbe-*`) ; la règle globale `prefers-reduced-motion` de `global.css` coupe transitions et animations.

**Propriétés** : `transform` et `opacity` seulement (ou `translate` et `scale`, qui se composent avec le `transform` d'un composant). Exceptions voulues, et elles seules : l'élargissement de CardWithIcon en carrousel (`width` : il doit pousser les voisines) et la hauteur des accordéons (voir plus bas). Jamais `transition: all`, jamais `ease-in`, jamais de courbe ou de durée en dur.

**Durées et courbes** :

| Usage | Durée | Courbe |
| :-- | :-- | :-- |
| Survol, focus (flèche d'une carte, soulignement, couleur) | `--duree-courte-4` (200 ms) | `--courbe-standard` ou `--courbe-standard-deceleree` |
| Indicateur d'onglet, fondu du panneau d'onglet | `--duree-courte-4` | `--courbe-emphase-deceleree` (trait), `--courbe-standard-deceleree` (panneau) |
| Accordéon (hauteur et opacité) | `--duree-moyenne-1` (250 ms) | `--courbe-emphase` |
| Ouverture du menu et de la recherche | `--duree-moyenne-1` | `--courbe-emphase-deceleree` |
| Fermeture du menu et de la recherche | `--duree-courte-4` (plus brève, même chemin) | `--courbe-standard` |
| Apparition au défilement | `--duree-moyenne-4` (400 ms), décalage de `--duree-courte-1` (50 ms) par élément, plafonné à 5 | `--courbe-emphase-deceleree` |

**Interruption** : des transitions, pas des `@keyframes`, pour tout ce qu'on peut déclencher deux fois de suite (menu, recherche, accordéon, onglets) : elles repartent de l'état courant. Entrées par `@starting-style`, sorties par `display` / `overlay` en `allow-discrete`.

**Survol** : un mouvement au survol est enveloppé dans `@media (hover: hover) and (pointer: fine)` (au toucher, le survol resterait après le tapotement) ; le même effet vaut pour `:focus-visible` ou `:focus-within`, sans condition.

### Apparitions au défilement

Réservées aux **vitrines** : GabaritVitrine passe `revelation` à chaque Section. Les pages de texte et les nouvelles ne sont pas animées : on n'anime pas ce qu'on lit. Rien à écrire dans le contenu ni dans un bloc.

- `src/lib/animations.ts` (chargé par `Base.astro`) et `src/styles/animations.css`.
- `data-revelation="zone"` (l'intérieur d'une Section de vitrine) : chaque enfant est une unité qui apparaît en fondu, avec une montée de 0,75rem.
- `data-revelation="groupe"` : ses enfants sont des unités distinctes, en léger décalage (Carousel1, GrilleCartesImages, cartes-liens, GrilleElargissable, RichList, les deux colonnes de HeroWithImage et de ColonnesTexte). Un enfant de zone qui contient un groupe est parcouru jusqu'au groupe. Un nouveau composant de grille ou de liste pose ce seul attribut sur son conteneur ; il est sans effet hors d'une vitrine.
- `data-revelation-mouvement="echelle"` (piste du carrousel) : échelle 0,97 au lieu de la montée, qui ferait déborder une piste à défilement horizontal.

Garanties, à préserver :

- **L'état par défaut est l'état final.** Seule la classe `a-reveler`, posée par le script, masque un élément. Sans JS, en cas d'erreur, avec le mouvement réduit ou à l'impression, rien n'est masqué.
- **Rien d'animé au-dessus de la ligne de flottaison** : le script ne masque que ce qui est sous l'écran à son exécution (bannière, h1 et premier écran jamais animés). Ce qui est déjà visible au premier rappel de l'IntersectionObserver se montre sans animation, et un rechargement ou un retour arrière (défilement restauré) n'anime rien.
- **Ancres et focus** : avec un `#ancre` au chargement, tout ce qui précède la cible et l'écran qui la suit reste visible ; un clic sur un lien d'ancre, `hashchange` ou le focus clavier montrent leur cible sans transition. Les ouvertures d'accordéon et les changements d'onglet provoqués par une ancre ne sont pas animés non plus.
- **Une seule fois** : chaque unité est révélée puis oubliée ; l'observateur se déconnecte quand tout est révélé. Les classes sont retirées après la transition, pour que la carte retrouve ses propres transitions de survol.
- **Pas de CLS** : opacité et transformations seulement, aucune réservation ni changement de taille.

Vérification : `/private/tmp/…/scratchpad/animations/verifier.mjs` (Playwright, 390 et 1440 px : invisibles après défilement, mouvement réduit, sans JS, CLS, ancres profondes, impression, focus).

## Accessibilité (WCAG 2.2 AA, non négociable)

- **Contraste** : 4,5:1 pour le texte, 3:1 pour le gros texte, les icônes porteuses de sens, les bordures de contrôles et le focus. Calculez-le, ne le devinez pas.
- **Focus** : visible partout (`:focus-visible` global, ne jamais le retirer sans le remplacer) et jamais masqué par l'en-tête collant (`scroll-padding-top` est déjà réglé).
- **Titres** : hiérarchisés, un seul `h1` par page, aucun niveau sauté. L'apparence vient de la classe ou du style, pas du choix de la balise.
- **Repères** : `header`, `nav` nommés (`aria-label`), un `main#contenu-principal`, `footer`. Un lien d'évitement est déjà dans `Base.astro`.
- **Cibles** : 24 × 24 px au minimum, 44 × 44 px pour les commandes principales sur mobile.
- **Texte agrandi** à 200 % et espacement du texte (1.4.12) : rien ne déborde ni ne se chevauche. Pas de `white-space: nowrap` sur un libellé dans une largeur fixe.
- **Couleurs forcées** : un état (sélectionné, actif, ouvert) ne repose jamais sur la seule couleur de fond. Ajoutez une bordure ou un contour visible sous `@media (forced-colors: active)`.
- **Mouvement** : voir la section « Mouvement » ; `prefers-reduced-motion` respecté (la règle globale coupe déjà les transitions). Aucun contenu en mouvement automatique sans bouton pause.
- **Annonces** : un changement d'état dynamique (filtre, résultats) est annoncé dans une région `role="status"`, sans déplacer le focus.
- **Langue** : un texte dans une autre langue porte `lang="en"`.

## Vérification

- Un serveur de développement tourne en continu sur **http://localhost:4321** (`astro dev`). Vérifiez votre travail en lisant ses pages (`curl`, ou Playwright avec le Chrome installé : `executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'`). **Ne lancez ni `astro build` ni un second serveur** : plusieurs agents travaillent en même temps dans le même dossier.
- Pour comparer avec la source : le site Gatsby construit est servi sur **http://localhost:9000**.
- `npm run verifier` (`node scripts/verifier-pages.mjs`) parcourt toutes les pages (`.md`, `.mdx`, `.yaml`) et nouvelles du contenu (hors `dev/`) : statut 200, présence de `<footer` (**toute page doit le contenir** : son absence trahit un rendu interrompu), un seul `h1` sans niveau sauté, aucun « [object Object] », aucun débordement à 390 et 1440 px. Option `--ids=fichier.json` pour comparer les ancres entre deux exécutions.
- Chaque famille de composants a une page de démonstration, `src/content/pages/dev/composants/<famille>.mdx` (frontmatter `title`, `noindex: true`). Elle montre chaque composant et chaque variante de props utilisée dans le contenu réel. Les directives Markdown ont la leur : `dev/composants/directives.md`.
- **Aucun commit** : le responsable de la conversion commite lui-même, après revue.

## Cache du contenu

Après une modification d'un plugin remark ou rehype (`src/plugins/`) ou du schéma de contenu, le cache de contenu garde l'ancien rendu des pages qui n'ont pas changé, et un simple redémarrage ne suffit pas. Utilisez `npm run dev:propre` : il arrête le serveur, supprime `.astro/data-store.json` (régénéré au démarrage) et relance le serveur en arrière-plan.
