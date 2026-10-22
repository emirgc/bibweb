# Catalogue des composants de contenu, coquille-web (Gatsby 5 + MUI 6 vers Astro)

Rien n'a été modifié. Racine : `/Users/emir/Documents/git/coquille-web/`. Dans les tableaux, **C/** = `/Users/emir/Documents/git/coquille-web/src/components/` (hors `_layout`).

**Méthode de comptage.** Les usages viennent d'un grep `<NomComposant` (suivi d'un espace, `/` ou `>`) sur les 128 fichiers `content/**/*.mdx`. Le format est « total / hors pages démo ». Les pages démo sont `/dev/**` et `tests.mdx`, exclues du sitemap par `gatsby-config.mjs:177`.

**Légende.**
- **S** : statique, rendu possible en `.astro` pur.
- **S\*** : statique aujourd'hui, mais les styles sont calculés côté client (`useEffect` ou `useMediaQuery`). Le HTML du SSR diffère donc du rendu final, ce qui produit un flash.
- **I** : interactif, il faut un îlot ou un petit `<script>`.
- **Gl** : injecté globalement via `src/templates/commonComponents.js`.

---

## 1. Ce qu'exporte `src/templates/commonComponents.js` (36 clés)

Ce fichier est passé à `<MDXProvider components>` dans `PageTemplate.jsx:143`, `DocTemplate.jsx:52` et `NouvelleTemplate.jsx:62`.

| Origine | Clés |
|---|---|
| MUI direct (10) | `AlertTitle`, `Box`, `Divider`, `Grid` (= `@mui/material/Grid2`), `List`, `ListItem`, `ListItemButton`, `ListItemIcon`, `ListItemText`, `Typography` |
| Composants maison (23) | `Accordion`, `AccordionDetails`, `AccordionGroup`, `AccordionSummary`, `Alert`, `Button`, `Card2`, `CardWithIcon`, `CardWithImage`, `Carousel1`, `FlipCardWithBg`, `FlipCardWithImage`, `ImageHoverCard`, `HeroWithImage`, `HeroWithText`, `HeroWithText2`, `IconInSquare`, `Link`, `RichList`, `RichListItemWithLink`, `Section`, `Tabs1`, `SuperHero2` |
| Dummies (2) | `Hero`, `Bloc` (de `dummy-components.jsx`) |
| Ajout tardif (1) | `AccordionGroupScienceOuverte` |

Usages MDX des clés MUI globales :

| Clé | Usages | Pages principales |
|---|---|---|
| `Grid` | 228 / 155 | science-ouverte (31), mission-vision-valeur (23), enseignement (19), recherche (18) |
| `Typography` | 182 / 147 | recherche (21), engagements (18), nous-soutenir (14) |
| `Box` | 169 / 168 | science-ouverte (126) |
| `Divider` | 5 / 4 | — |
| `List` | 1 | — |
| `ListItem*`, `ListItemIcon` | 0 | — |

Points importants pour la migration :
- 183 imports `@phosphor-icons` et plusieurs imports MUI directs dans le MDX (`Table*` ×10, `Paper` ×11, `Card*`, `Alert` MUI dans `espaces/index.mdx` qui **masque** l'`Alert` maison). Ces imports devront aussi être convertis.
- Variantes `Typography` vues dans le contenu : `h2` (62), `h4`, `body1`, `subtitle1`, `h5`, `h3`, `body2`, `p` (invalide), `display2/3/4`.

---

## 2. Catalogue par famille

### 2.1 Primitives : lien, bouton, alerte, citation, tableau, liste

| Composant | Props (type = défaut) | Rendu | Nature, données | Gl | MDX (tot/hors démo), pages |
|---|---|---|---|---|---|
| **Link** `C/Link.jsx` (forwardRef) | `to`: string = `'#'` · `Icon`: bool \| Composant (true = ArrowRight) · `iconProps`: obj (défaut size 1.125rem, currentColor) · `sx` · `href` (**ignoré**) · …rest vers `<a>` | Lien bleu `bleuPrincipal` #0057ac, sans soulignement, souligné au survol. Avec `Icon`, il passe en inline-flex, gap .375em, icône après le texte. Chemin relatif : `MuiLink` + `GatsbyLink`. Sinon `<a>`. | S | oui | 204 / 201. horaires (79), fiches `bibliotheques/*` (8–9 chacune), pret-renouvellement-retour, service-accessibilite. Utilisé aussi par `_layout` (TopAppBar, Footer, QuickLinks, SideNav, SearchOverlay). |
| **Button** `C/Button.jsx` | `primary`: bool (implicite si ni primary ni secondary) · `secondary`: bool · `href`: string · `color` (défaut `bleuFonce` / `bleuPrincipal`) · `variant` (`contained` / `text`) · `endIcon` · `disableEndIcon`: bool · `disableElevation` · `className` · `target` · `sx` · …MUI Button | MUI Button. primary = plein `bleuFonce` #0b113a sans ombre. secondary = texte `bleuPrincipal`. Avec href : icône de fin ArrowRight (interne) ou ArrowUpRight (externe) 24 px. Lien externe : `rel="noopener"`. Lien interne : `GatsbyLink`. `.pdf` : `target=_blank` + classe `no-pdf-icon`. | S\* (le cas PDF est réglé dans un `useEffect`) | oui | 83 / 70 (21 fichiers). recherche/diffuser (21), espaces (8), recherche (7), enseignement (7), accueil (6). Valeurs vues : `size="small"` ×4, `variant="contained" color="bleuFonce"` ×4. |
| **Alert** `C/Alert.jsx` | `severity`: success \| info \| warning \| error = `info` · children · …MUI Alert (`icon`, `sx`) | MUI Alert. Variante **outlined par défaut via le thème** (styleOverrides de `tokens.js` : bordure #c3ccd5, coins arrondis, message #222930). Icônes Phosphor 24 px (CheckCircle, Info, Warning, WarningDiamond). Classe `bib-comp-alert`. | S | oui | 13 / 8. Fiches conservation, marcel-laurin, Brossard, place-Dupuis, jardinb ; horaires ; nous-joindre/clavarder ; a-propos/carriere. `AlertTitle` (MUI) 2 / 1 (carriere). |
| **Blockquote** `C/Blockquote.jsx` | `cite`: string (**inutilisé**) · `source`: string · `sx` · children | `<figure>` avec filet vertical bleu 3 px à gauche, `<blockquote>` entre guillemets « » (pseudo-éléments #607386), `<figcaption>` gris plus petit. | S | non (import) | 3 / 1. nous-soutenir/fonds-livres-rares. |
| **BibTable** `C/BibTable.jsx` | children (`thead`/`tbody`) · …props sur `<table>` | Tableau arrondi 12 px avec bordure. En-tête bleu200 #cce2f3, texte bleu600 #00407f, filet bas 2 px #0057ac. 1re colonne en gras primaire, nowrap. Survol #e7ebeeb7. Sous 599 px : `display:block` et défilement horizontal. | S | non (import relatif `../../../src/components/BibTable`) | 1. engagements/lecture-cadeau. |
| **Liste** `C/Liste.jsx` | `type`: ul \| ol = `ul` · `variant`: puce \| fleche = `puce` · `style`: obj (fusionné dans sx) · …props | `<ul>`/`<ol role="list">`. `puce` = disc, padding 40 px. `fleche` = sans puce, flèche SVG Phosphor en data-URI dans `li::before`. `ol` = decimal. | S\* (styles posés après le montage) | non | 8 / 4. pret-renouvellement-retour, recherche/diffuser, rapports-annuels, politiques-reglement. `fleche` ×5, `ol` ×1. |

### 2.2 Accordéons

| Composant | Props | Rendu | Nature | Gl | MDX |
|---|---|---|---|---|---|
| **AccordionGroup** `C/AccordionGroup.jsx` | `color`: bleuPrincipal \| rose = `bleuPrincipal` · children (…props **non transmis**) | `<div>` + Provider `AccordionsContext` {expanded, setExpanded, handleChange, currentColor}. Couleurs : bleuPrincipal → fond `bleu100` #e5f0f8, accent #0057ac ; rose → **en dur** #fcf3f1 / #b72600. | I : accordéon **exclusif** (un seul panneau ouvert) | oui | 8 / 4. engagements/index, obtenir/numerisation, nous-joindre/index, a-propos/mission-vision-valeur (`rose` ×2, `bleuPrincipal` ×1) |
| **AccordionGroupScienceOuverte** `C/AccordionGroupScienceOuverte.jsx` | `color` = **`vertPale`** (+ bleuPrincipal, rose) | Copie conforme du précédent. `vertPale` = fond **#fcf3f1 (le rose !)**, accent #52b782. | I | oui | 1. engagements/science-ouverte (noindex) |
| **Accordion** `C/Accordion.jsx` | `defaultExpanded`: bool · …MuiAccordion (`sx`, `id`) | MuiAccordion sans gouttière, elevation 0, carré, `::before` masqué. État piloté par le contexte du groupe (`useId`). | I | oui | 37 / 24 (6 fichiers, listes ci-dessus) |
| **AccordionSummary** `C/AccordionSummary.jsx` | `id`, `aria-controls` (auto `panel-<uid>-header` / `-content`) · `sx` · children | En-tête avec filet bas 1 px couleur d'accent. Texte coloré quand ouvert. Icône Plus/Minus 17,5 px dans une pastille ronde 35 px (fond d'accent qui s'efface à l'ouverture, 350 ms). Thème : padding 30px 0 20px, 1.2222rem/600. Titre en `h3` par défaut (slot heading MUI). | I | oui | 36 |
| **AccordionDetails** `C/AccordionDetails.jsx` | `sx` · …props | Fond = couleur de fond du groupe. Thème : padding 1.6667em 2em (md+), coins bas arrondis. | S | oui | 36 |
| **AccordionsContext** `C/AccordionsContext.jsx` | — | `createContext({})` | — | — | — |

Cible Astro : `<details name="groupe">` natif (exclusivité native) + CSS. Aucune hydratation nécessaire.

### 2.3 Cartes

| Composant | Props | Rendu | Nature | Gl | MDX |
|---|---|---|---|---|---|
| **Card2** `C/Card2.jsx` | `title`: node · `Icon`: Composant Phosphor (requis) · `href`: string (**requis, sinon throw**) · `sx` · …Card | Carte pleine `bleuPrincipal` (survol : `.dark`), 250–400 px de large (sans limite ≥ sm), padding 30 px, coins `corner.small`. Icône 55 px #ffffff88, titre 1.75rem/500, pastille fléchée ronde 50 px en bas à droite. Toute la carte est un `<a>`. | S\* | oui | 12 / 7. nous-joindre/index, a-propos/carriere (`Icon={IconeUdeM}`) |
| **CardWithIcon** `C/CardWithIcon.jsx` | `title` (requis) · `Icon` · `color`: primary \| bleuPrincipal \| vertFonce \| rose300 \| jaune = `bleuPrincipal` · `moreText`: string · `href`: string (requis) · `small`: bool = false · `fullWidth`: bool = false · `sx` | Carte pleine 353×400 (small 290×332) qui **s'élargit de 10 % au survol** (transition de width 250 ms). Avec `fullWidth` : largeur 100 %, textes plus petits. Icône 55 px, titre 1.7778rem, « moreText » + pastille fléchée 50 px en bas. `jaune` = #ffca40 / #ffdb81 en dur (« quick fix Emir »). Texte blanc ou foncé selon `getContrastColor`. | S\* (couleur posée dans un `useEffect`, largeur des textes figée en JS) | oui | 56 / 30. accueil, recherche, etudes (`vertFonce` ×16, `jaune` ×4, `rose300` ×3, `small` ×19, `fullWidth` ×4 : « Mille et une façons » de l'accueil) |
| **CardWithImage** `C/CardWithImage.jsx` | `title` (requis) · `Image`: URL (requis) · `href` (requis) · `moreText`: string = `'En savoir plus'` · `sx` | Carte 330×500. Image 220 px en object-fit cover (`alt={title}`), fond paper, titre `h4` limité à 3 lignes, « moreText » + pastille fléchée en bas. Survol : moreText en bleu. | S\* | oui | 24 / 20. nous-soutenir, enseignement, espaces |
| **FlipCardWithBg** `C/FlipCardWithBg.jsx` (export `ElegantHoverCard`) | `title` (requis) · `Icon` (requis) · `bg`: bleuPrincipal \| rose300 \| vertFonce = `bleuPrincipal` (sinon throw) · children · …Card | Carte 23×25rem (18×20.5 sous sm), fond uni. Icône 45 px à 50 % d'opacité en haut à droite, titre `h4Figtree` en bas. Survol/focus : le titre monte et la description apparaît (fondu, défilable). rose300 : texte noir, icône `rougeOrange`. | I (survol/focus via état React ; faisable en CSS `:hover`/`:focus-within`) | oui | 26 / 21. engagements/index (`rose300` ×8, `vertFonce` ×5) |
| **FlipCardWithImage** `C/FlipCardWithImage.jsx` | `title` · `subtitle` · `Image`: URL (requis) · children | Carte 23×25rem, image en fond + dégradé noir. Survol : voile rgba(7,31,56,.7), titre `h3` qui monte, sous-titre `h6` #e5f0f8 et description en `Fade` MUI 500 ms. `tabIndex=0`, `role=region`. | I (survol uniquement ; **le focus n'ouvre pas la description**) | oui | 34 / 29. nous-soutenir, espaces. Prop `small` passée ×9 dans espaces, **ignorée**. |
| **ImageHoverCard** `C/ImageHoverCard.jsx` | `title` · `subtitle` · `seats`, `details` (**inutilisés**) · `Image` (requis) · children | Carte 23×25rem, vignette 260 px. Au survol/focus, le panneau blanc d'infos glisse de 250 px vers le haut (titre `h4`, sous-titre #0057AC, description). | I | oui | **0** |
| **IconInSquare** `C/IconInSquare.jsx` | `icon`: élément (requis) · `color`: clé de palette ou couleur CSS = `'transparent'` · `sx` | Carré 10.875×11.875rem centré, coins small, fond = couleur. **L'icône est forcée** à 5.25rem, `fill = darken(fond, 0.8)`. Les `color` passés aux icônes dans le MDX n'ont donc aucun effet. | S | oui | 10 / 9. nous-soutenir, engagements, recherche, mission-vision-valeur (`vertPale`, `bleu600`, `rose500`, `vertFonce`, `rose300`, `#fff`, `bleu100`) |
| **ClickableFlipCard** `C/ClickableFlipCard.jsx` (+ exports `CompactInteractiveFlipCard`, `HorizontalCardList`) | `cardProps`, `tutuProps`, `customStyles`, `showAnimation` = true, `closeOnSecondClick` = true, `onOpen` / `onClose` / `onToggle` · `HorizontalCardList` : `items[]` {cardProps, leftColl, rightColl, leftFooter} | `FlipCardWithImage` cliquable qui déplie un `HeroWithText2` dessous (panneau #00407f). Défilement horizontal. Injecte des `<style>` de keyframes. | I | non | **0** |

### 2.4 Mise en page : héros, sections, listes riches, onglets, carrousel

| Composant | Props | Rendu | Nature | Gl | MDX |
|---|---|---|---|---|---|
| **Section** `C/Section.jsx` | `bg`: clé de `secondaryColors` (bleuPrincipal, bleuFonce, bleu100, bleu200, bleu600, jaune, jaunePale, orange, rose100/300/500, rougeOrange, vertFonce, vertPale, violetFonce) · `image`: URL (exclusif avec bg, sinon throw) · `marginTop`: bool (md : 3rem) · `fixedWidth`: bool = false · `minHeight` = `'auto'` · `textAlign` = `'left'` · `parallax`: bool = false · `overlay`: couleur · `overlayOpacity` = 0.4 · `sx` · `id`… | Bande pleine largeur, padding vertical 48/64/96 px (xs/md/lg), `Container` MUI interne (padding 16/20/40/64 px). `bg` → fond `main` + texte `contrastText`. `image` → fond cover + voile noir 40 %, texte blanc. `parallax` → écouteur de scroll + `background-attachment: fixed`. | S\* (**tous les styles passent par `useEffect` : au SSR, la section est transparente**) | oui | 110 / 69 (42 fichiers). recherche (12), engagements (8), accueil (7), enseignement (7)… `bg` vus : bleu100 ×7, rose300 ×4, vertFonce ×3, bleu600 ×2, bleu200 ×2, rose100, violetFonce, jaunePale, rose500, bleuPrincipal. `image` ×3. |
| **SuperHero** `C/SuperHero.jsx` (exporte aussi `inlineOffset = '3.75rem'`) | `title` (requis) · `subTitle`: node · `imageName` (requis) · `alt` = `''` · `lvl` (inutilisé) · children | Héros d'accueil **en position absolue** sous les bannières (`useBannersHeight(['udem-urgence','bib-avis'])`), 95vh (85vh mobile). `GatsbyImage` eager + voile 40 %. `h1` `display1` 3.75rem (2.5 mobile). Les children vont en bas (ex. recherche Sofia). Un espaceur `calc(95vh - 8rem)` réserve la place. Fournit `SuperHeroContext` {inlineOffset, bottomOffset}. | S\* (mesure des bannières par ResizeObserver) | non | 1. accueil (`imageName="accueil"`) |
| **SuperHero2** `C/SuperHero2.jsx` | `title` (requis) · `subTitle` (cloné avec sx mt) · `imageName` (requis, throw si introuvable) · `alt` = `''` · `size`: default \| small = `default` · `lvl` (inutilisé) · children · …rest sur la Box | Même principe. Hauteurs en rem selon mobile / tablette / desktop : default 26 / 30 / 34rem, small 15 / 16 / 18rem. Voile 50 %. `h1` `titreSuperHero` (ou `…Small`). | S\* | oui (et souvent réimporté) | 16 / 15. horaires, conditions-utilisation, accessibilite-web, service-accessibilite, nouvelles, nous-soutenir, engagements, nous-joindre, obtenir, enseignement, recherche, etudes, a-propos, espaces, horaires/test (`imageName="default"` ×6, `size="small"` ×7) |
| **HeroWithImage** `C/HeroWithImage.jsx` | `align`: left \| right = `left` (sinon throw) · `Image`: URL (requis) · `imageWidth`, `imageHeight`: number · `footer`: node · `sx` · children | Grille 2 colonnes dans `GridOffset 0.5` : contenu 5/12, espace 1/12, image 6/12 (coins small, `alt=""`). Le footer passe sous l'image sur mobile. | S\* (`useSmall`) | oui | 13 / 11. accueil, engagements, enseignement, recherche, etudes, espaces (`align="right"` ×6) |
| **HeroWithText** `C/HeroWithText.jsx` | `leftColl`, `rightColl`, `leftFooter`, `rightFooter`: node · `sx` | Colonnes 3/12 + 8/12 dans `GridOffset 0.5`. Les `h2`/`h3` reçoivent mb 2rem. Footers sous les colonnes sur mobile. | S\* | oui | 9 / 7. nous-soutenir, engagements, recherche (leftColl = `IconInSquare`) |
| **HeroWithText2** `C/HeroWithText2.jsx` | idem | Colonnes 6/12 + 6/12, spacing 5.625 / 8, centrées verticalement. | S\* | oui | 6 / 4. enseignement, recherche |
| **RichList** `C/RichList.jsx` | `offset` = 0.5 · children | `GridOffset` + `<List>` MUI sans padding (`bib-comp-rich-list`) | S | oui | 10 / 8. obtenir, enseignement, recherche, etudes, recherche/diffuser/kerko, a-propos. `bg="vertFonce"` passé (etudes) **ignoré**. |
| **RichListItemWithLink** `C/RichListItemWithLink.jsx` | `title` · `description` · `href` (requis, sinon throw de `isInternalLink`) · `linkText`: string = null · `color`: default \| vertFonce = `default` | Ligne cliquable (`<a>` ListItemButton) : `h3` (titre) + description 17 px, largeur max 83 % (md) / 66 % (lg). À droite, soit Button primary `linkText`, soit IconButton rond (`bleuFonce` ou `vertPale`) avec flèche. Divider sous la ligne (`bleuPrincipal` ou currentColor). Colonne sur mobile. | S\* | oui | 52 / 45. engagements, obtenir, enseignement, recherche, kerko, etudes, a-propos (`linkText` ×9, `color="vertFonce"` ×8) |
| **Tabs1** `C/Tabs1.jsx` | `tabs`: string[] = [] · `defaultTab`: number = 1 · `ariaLabel` = `''` · `bg` (transmis, inutilisé) · `sx` · children = panneaux (dans l'ordre) | Onglets MUI **verticaux** (horizontaux et scrollables < md), chaque Tab rendu **via le Button maison primary**. Panneaux `role=tabpanel` montés au premier affichage puis masqués en `display:none`. Chaque enfant reçoit `active`. | I : onglets | oui | 4 / 2. espaces (« Technologies créatives / Production multimédia »), science-ouverte (5 onglets) |
| **Carousel1** `C/Carousel1.jsx` → `C/Carousel1/Carousel1.jsx`, `useCarousel.jsx`, `Carousel1.module.css` | `title`: string \| node (string → `h2`) · `description`: string \| node · `moreText`, `moreLink` (bouton primary seulement si **les deux** sont fournis) · `sx` (inutilisé) · …props sur la racine embla · children = slides | En-tête (titre, description, boutons ◀ ▶ `ArrowLeft/RightCircleIcon`), piste **embla-carousel-react** (align start sous md, center au-delà ; slidesToScroll 1/1/2/3/3 selon xs→xl ; loop false), gap 10 px + marge 15 px. Pagination en barrettes (5 px, grises). **Molette / trackpad capturés** (deltaY > 24 → slide suivante, `preventDefault`). `reInit` au resize. | I : carrousel embla | oui | 20 / 16. nous-soutenir, science-ouverte, engagements, enseignement, recherche, etudes, espaces (slides : CardWithIcon, CardWithImage, FlipCard*). `bg="vertFonce"` (engagements) atterrit en **attribut DOM**. Dans espaces, `moreLink` sans `moreText` : pas de bouton. |

### 2.5 Horaires : trois générations coexistent

#### a) Nouvelle page `/horaires/test` (noindex), la cible recommandée

| Composant | Props | Rendu | Nature, données | Gl | MDX |
|---|---|---|---|---|---|
| **CarteHoraires** `C/CarteHoraires.jsx` → `C/CarteHoraires/CarteHoraires.jsx` | aucune | Barre de recherche (fond `bleu100`) : bouton « Me localiser » (géolocalisation), Autocomplete MUI freeSolo (8 suggestions max), messages `role=status`. Section « Les plus proches de vous » (3 fiches compactes + lieu ouvert le plus proche). Puces de filtre « Ouvert maintenant » + Tous / Bibliothèques / Centres de conservation / Studios et ateliers / Points de service (pastilles = légende de la carte). Carte Leaflet. Compteur. Grille 2 colonnes de `FicheLieu`. Section « Autre service » (PEB). JSON-LD. | **I lourd** : horloge Montréal toutes les 30 s, géolocalisation, filtres, recherche, ancres `#id` (focus + surlignage 1,6 s), `history.replaceState` | non | 1 / 1. horaires/test |
| ↳ **points-de-service.json** | — | **20 lieux** (14 `library`, 3 `points-service`, 2 `conservation`, 1 `service` PEB). Clés : `id`, `name`, `zone`, `addr`, `pavillon`, `lat`, `lng`, `codeBib`, `aliases`, `contact[{label,phone,email}]`, `staffFragment`, `spaces[{label,url}]`, `reservations[{label,url}]`, `note`, `noteLink{url,label}` | Données statiques. Aussi utilisé par `src/utils/api-horraire-bibliotheques.js` | — | — |
| ↳ **useHoraires.js** | `today` | SWR Infinite, tranches de 14 jours sur 8 semaines, à partir du lundi | **GET `https://api.bib.umontreal.ca/horaires?debut=AAAA-MM-JJ&fin=P14D&format=json`**, voir § 3 | | |
| ↳ **horaires.js** | fonctions pures | `montrealNow`, `addDays`, `mondayOf`, `formatTime` (« 9 h », « minuit »), `formatRanges`, `parseHoraires` (regroupe par bib puis service puis date), `statusFor` (open / closing-soon < 30 min / closed / unknown, suit les ouvertures 24 h sur plusieurs jours), `otherServicesToday`, `haversine`, `formatDistance`, `normalize`, `matchesQuery`, `matchesFilter`, `telHref`, `directionsUrl` (Apple Maps / `geo:` / Google) | **Portable tel quel** en TS | | |
| ↳ **CarteLeaflet.jsx** | `lieux`, `visibleIds`, `filter`, `userPos`, `focus`, `onSelect` | Carte 400 / 560 px. Leaflet importé dynamiquement **seulement quand la carte entre dans l'écran** après `window.load` (`react-intersection-observer`). CSS Leaflet depuis jsDelivr `leaflet@<version>`. Tuiles **Esri World_Light_Gray_Base + Reference** (`server.arcgisonline.com/.../tile/{z}/{y}/{x}`, maxZoom 16). `circleMarker` rayon 8, contour `bleuFonce`, remplissage par zone (bleuPrincipal / vertPale / violetFonce / jaune pour studios). Un marqueur par pavillon, popup en DOM avec boutons « Voir la fiche ». Position de l'utilisateur en `rougeOrange`. Cadrage limité à 30 km de la BLSH. `scrollWheelZoom: false`. | I : îlot `client:visible` | | |
| ↳ **FicheLieu.jsx** | `lieu`, `idPrefix` = `''`, `headingLevel` = 2, `compact` = false, `status`, `extra`, `distance`, `horaires`, `dates`, `today`, `hoursError`, `weekOffset` = 0, `onWeekChange`, `isWeekLoaded`, `platform`, `highlighted`, `onShowOnMap`, `onVoirFiche` | `<article tabIndex=-1>` blanc, coins medium. Nom en `h{n}`, adresse (ou pavillon en compact), pastille de statut colorée + texte, services secondaires, note sur fond `bleu100`, liens « Voir sur la carte / Itinéraire / Voir la fiche ». Vignette photo collée au coin (88 px mobile, 148–168 px ensuite) avec puce de distance. Volets MUI Accordion `h{n+1}` : Horaire de la semaine, Nous joindre (`dl`) + lien répertoire `/nous-joindre/notre-equipe/#<staffFragment>`, Espaces, Réserver une salle (boutons arrondis). Contexte sr-only « – Nom du lieu » sur chaque lien. | I | | |
| ↳ **HoraireSemaine.jsx** | `lieu`, `horaires`, `dates`, `today`, `offset`, `onOffsetChange`, `isWeekLoaded`, `error` | Navigation ◀ ▶ sur 8 semaines (partagée par toutes les fiches) + bouton « Revenir à cette semaine ». **Vrai `<table>`** (caption sr-only, `th scope`, ligne du jour `aria-current=date` sur `bleu200`), zone défilante focusable. | I | | |
| ↳ **useImagesLieux.js** | — | `useStaticQuery CarteHorairesImagesQuery` : `allFile(sourceInstanceName "bibliotheques", glob "images/*") { name, childImageSharp.gatsbyImageData(CONSTRAINED, 640, BLURRED, q75) }`. Images nommées par `codeBib` (ss.jpg…) | Équivalent Astro : `import.meta.glob` + `<Image>` | | |
| ↳ **DonneesStructurees.jsx** | `lieux` | `<script type=application/ld+json>` `@graph` de `Library` (adresse, geo, téléphone, courriel, `parentOrganization` UdeM). URL de base = `siteMetadata.siteUrl` + `/horaires/` | S (build) | | |
| ↳ **styles.js** | — | `srOnly` | | | |

#### b) Page actuelle `/horaires` : `content/pages/horaires.mdx`, 17 blocs répétés à la main

| Composant | Props | Rendu | Nature, données | Gl | MDX |
|---|---|---|---|---|---|
| **ListeHoraires** `C/ListeHoraires.jsx` → `C/ListeHoraires/ListeHoraires.jsx` | children (blocs par bib) | `HoraireBibProvider` > `HoraireBibHeader` (bandeau collant) > `SearchBox` > `ListeHorairesContainer` (filtre les enfants qui ont `props.codeBib` d'après `code-bib[codeBib].court`) | I | non | 1 (horaires) |
| ↳ **HoraireBibProvider.jsx** | children | Contexte : horaires, labels, `currentWeekTitle`, `daysOfWeekHeaders`, `prevBtnProps` / `nextBtnProps` (pas de retour avant la semaine courante), `sortedServices`, `getHorairesFor`, `isCurrentWeek`, `resetToToday`. Précharge la semaine suivante. | 3 fetch SWR : **`https:///api.bib.umontreal.ca/horaires?debut=<lundi>&fin=P7D`**, **`…/horaires/services`**, **`…/horaires/liste`** (3 barres obliques, voir § 5) | | |
| ↳ **HoraireBibHeader.jsx** (export `Banner`) | — | Bandeau `primary` collant (`top = appBarHeight` sur desktop, importé de `_layout/AppBar/TopAppBar`), bouton « Aujourd'hui » (un exemplaire mobile, un desktop), ◀ titre de semaine ▶. Sentinelle `useSticky`. | I | | |
| ↳ **SearchBox.jsx** | `value`, `onChange` | Champ arrondi (33 / 66 / 75 % de large) + bouton loupe `type=submit` (le formulaire n'a pas de `onSubmit` : soumettre recharge la page) | I | | |
| ↳ **ListeHorairesContainer.jsx** | `children`, `searchTerm` = `''` | Défile vers `location.hash` après 100 ms. Filtre par `code-bib`. | I | | |
| ↳ **BlocHoraire / BlocHoraireWide / BlocHoraireNarrow** | `codeBib` | Wide (≥ md) : **grille CSS de `<div>`** de 8 colonnes (service + 7 jours), jour courant sur `bleu200`. Narrow : une `<table>` par service (jour en petites capitales, `sommaire`). Messages « Horaire non disponible » / « Chargement en cours… ». | I (via contexte) | | |
| ↳ **HoraireNonDisponible.jsx**, **Week.js** (classe semaine date-fns fr-CA), **useSticky.jsx**, **HoraireBibContext.jsx** | — | utilitaires | | | |
| ↳ **Microformat.jsx** (`Hour`, `formatHour`) | — | microdonnées schema.org `OpeningHoursSpecification` | **jamais importé** | | |
| **HoraireBib** `C/HoraireBib.jsx` → `C/ListeHoraires/HoraireBib.jsx` | `codeBib` · `showTitle` = true · children | Titre `h2` (`code-bib.court`, id slugifié, permalien) + `BlocHoraire` + contenu divers | I | non | 1 (horaires, `pb`, `showTitle={false}`) |
| **HoraireBibNoTitle** `C/HoraireBibNoTitle.jsx` → `C/ListeHoraires/HoraireBibNoTitle.jsx` (exporte aussi `Title2`) | `codeBib` · children | Idem sans titre | I | non | 16 (horaires) |
| **TitleHoraireBib** `C/TitleHoraireBib.jsx` → `C/ListeHoraires/TitleHoraireBib.jsx` | `title` · `sticky` = false | `h2` 1.5 / 1.7778rem, id = slugify(title), permalien `#id` visible au survol | S | non | 17 (horaires) |
| **HorairesHorizontalTabs** `C/HorairesHorizontalTabs.jsx` | `defaultTab` = `'A'` · `codeBib` (inutilisé) · `onTabChange` · children (1er = A, 2e = B) · `componentA` / `componentB` + `componentAProps` / `componentBProps` · `tabALabel` = `'Component A'` · `tabBLabel` = `'Component B'` · `containerClassName`, `tabClassName`, `contentClassName` · `persistContent` = false · `animated` = true | 2 boutons-onglets (« Horaires » / « Emplacement ») au-dessus du contenu, bordure #e0e0e0, couleur active **#007bff (Bootstrap)**, polices système, `min-width: 350px`. `<style>` réinjecté à chaque instance. | I : onglets | non | 16 (horaires) |
| **FicheBibliothequeNoTitle** `C/FicheBibliothequeNoTitle.jsx` | mêmes props que FicheBibliotheque (`title`, `id`, `codeBib`, `blocHoraires`, `blocEspaces`, `blocAdresse`, `blocNousJoindre`, children) | Comme FicheBibliotheque mais **sans accordéon** (Box `bleu100`). Colonnes : HoraireAujourdhui + Espaces / Adresse + Nous joindre (6/10) / photo. | I (fetch) | non | 16 (horaires, onglet B) |

#### c) Fiches des bibliothèques, affichées sur `/espaces/` et `/nous-joindre/` via `content/bibliotheques/bibliotheques.mdx`

| Composant | Props | Rendu | Nature, données | Gl | MDX |
|---|---|---|---|---|---|
| **FichesBibliotheques** `C/FichesBibliotheques.jsx` | `title` (inutilisé) · children | `GridOffset` (1, ou 0.25 < md) + colonne flex. Provider `FichesBibliothequesContext` (valeur jamais consommée). | S\* | non | 1 (bibliotheques.mdx) |
| **FicheBibliotheque** `C/FicheBibliotheque.jsx` | `title` · `id` (ancre) · `codeBib` · `blocHoraires`: node \| false · `blocEspaces`: node \| false · `blocAdresse`: node · `blocNousJoindre`: node · children | Accordéon (fermé, ouvert si `location.hash === #id`). Titre 1.2222rem/700, icône `plus.svg`, filet `bleuPrincipal`. Détails `bleu100` en grille de 10 colonnes : Aujourd'hui + Espaces (3) / Adresse, Nous joindre, divers (4) / photo (3, masquée < md). | I : accordéon + fetch. Images : `useStaticQuery FicheBibliothequeImageQuery` → `allFile(bibliotheques, images/*) { name, relativePath, childrenImageSharp.gatsbyImageData(FULL_WIDTH, BLURRED, q80, breakpoints 400) }` | non | 19 (une par fiche `content/bibliotheques/*.mdx`) |
| ↳ **FicheBibliotheque/Bloc.jsx** (+ `BlocTitle`) | `title`, `Icon`, `flex` = false, children | Titre 1.3125rem `bleuPrincipal` + icône (masquée < md), contenu 16 px | S | | |
| ↳ **FicheBibliotheque/HoraireAujourdhui.jsx** | `codeBib`, children (`false` → rien) | Bloc « Aujourd'hui » : liste `dl` service → sommaire, lien « Tous les horaires » vers `/horaires/#<ancre>` (ancre tirée de points-de-service.json). Sur mobile : Button. | I. **GET `https://api.bib.umontreal.ca/horaires/services`** + **GET `https://api.bib.umontreal.ca/horaires/?fin=P1D`** (tout le réseau, filtré côté client) | | |
| ↳ **FichesBibliothequesContext.jsx**, **plus.svg** | — | — | contexte mort | | |

#### d) Démo isolée

| Composant | Props | Rendu | Nature | Gl | MDX |
|---|---|---|---|---|---|
| **HoraireAujourdHui** `C/horaire/HoraireAujourdHui.jsx` | `bib`: code (requis) · `service` = `'https://api.bib.umontreal.ca/horaires'` · `lienHoraires`: bool = false | Accordéon inline « Aujourd'hui : … » qui déplie un tableau dimanche → samedi + lien `/horaires` | I. **GET `${service}/${bib}?debut=…&fin=P7D`**, qui **répond 422 « Code de bibliothèque inconnu »** (vérifié) | non | 1 (widget-horaire.mdx, page démo indexée) |

### 2.6 Flux dynamiques : événements, formations, nouvelles

| Composant | Props | Rendu | Nature, données | Gl | MDX |
|---|---|---|---|---|---|
| **ListeEvenements** `C/ListeEvenements.jsx` | `title` = `'Événements'` · `id` · `service` = RSS du calendrier UdeM · `limit` = 3 · `moreText` = `'Tous nos événements'` · `moreLink` = `https://calendrier.umontreal.ca/activites?organisateurs=les-bibliotheques` | Colonne « Quoi de neuf » : `h3` 1.75rem, liste d'éléments de hauteur fixe 8.75rem (md+), vignette carrée 5.5rem (repli `/images/fallback.jpg`), ligne orange (calendrier + date), titre limité à 3 lignes, pastille fléchée. Bouton secondary `_blank`. Squelettes au chargement, message d'erreur + « Réessayer ». | I. **GET RSS** `https://calendrier.umontreal.ca/activites/export.rss?tx_solr[filter][0..11]=types:…&tx_solr[filter][12]=organisateurs:les-bibliotheques` (XML via DOMParser : `item > title`, `pubDate`, `link`, `enclosure@url`). Timeout 10 s, 2 tentatives, déduplication titre + heure. | non | 3 / 1 (accueil) |
| **ListeFormations** `C/ListeFormations.jsx` | `id` (inutilisé) · `service` = `https://api.bib.umontreal.ca/formations/` · `limit`: 1–50 = 4 (throw sinon) · `moreText` = `'Voir plus de formations'` · `moreLink` | Liste MUI : image 150 px, date orange, titre `h4`, horaire + lieu (« En ligne » ou lieu ; épingle **rouge en dur** pour le présentiel), flèche en cercle. Bouton primary `_blank`. | I. **GET `…/formations/?limit=N`**, timeout 2 s. Format § 3. Erreur → rien. | non | 3 / 1 (etudes) |
| **ListeFormationsAccueil** `C/ListeFormationsAccueil.jsx` | `title` = `'Formations'` · `id` · `limit` = 4 · `moreText` = `'Toutes nos formations'` · `moreLink` = `https://calendrier.bib.umontreal.ca/calendar?cid=7690&t=m&d=0000-00-00&cal=7690&inc=0` | Gabarit `ColonneQuoiDeNeuf`, éléments comme les événements (« date · début–fin »), lien étiré sur tout l'élément (`::after`), « (nouvel onglet) » sr-only | I. **GET `https://api.bib.umontreal.ca/formations/?limit=N`**, timeout 5 s | non | 1 (accueil) |
| **ListeNouvellesAccueil** `C/ListeNouvellesAccueil.jsx` | `title` = `'Nouvelles'` · `id` · `limit` = 4 · `moreLink` = `'/nouvelles/'` · `moreText` = `'Toutes nos nouvelles'` | Colonne Quoi de neuf, `ElementNouvelle compact` | **S au build** (données statiques) | non | 1 (accueil) |
| **ListeNouvelles** `C/ListeNouvelles.jsx` | `id` = `'liste-nouvelles'` | ToggleButtonGroup en pastilles « Tout / Nouvelles / Revue de presse » avec compteurs, synchronisé avec `?type=`. Annonce `aria-live`. Sections par année (`h2` variante `h3`), `ElementNouvelle`. | I (filtre) | non | 3 / 1 (nouvelles.mdx, qui passe un `moreLink` **ignoré**) |
| ↳ **Nouvelles/useNouvelles.js** | — | Fusionne et trie par date décroissante : MDX `type: interne` + `content/revue-de-presse/articles.json` (8 entrées `{title, date, source, url, lang?}`) | `useStaticQuery UseNouvellesQuery` : `fichiers: allFile(nouvelles, mdx){ id, childMdx.frontmatter{date,title,type} }` + `pages: allSitePage(path glob /nouvelles/**){ path, pageContext }` (URL réelle via `pageContext.id`). Export `TYPE_NOUVELLE`, `TYPE_PRESSE`. | | |
| ↳ **Nouvelles/ElementNouvelle.jsx** | `item` · `titleVariant` = `'body1'` · `component` = `'li'` · `compact` = false | Ligne : « Source / Les bibliothèques · date » orange, titre lien (`GatsbyLink` ou `_blank`, attribut `lang`), pastille → ou ↗ | S | | |
| ↳ **QuoiDeNeuf/ColonneQuoiDeNeuf.jsx** | `title`, `id`, `moreText`, `moreLink`, `externe` = false, children | `<section aria-labelledby={id}>` + `h3` + bouton secondary en bas | S | | |
| ↳ `src/utils/quoi-de-neuf.js` | — | `ITEM_HEIGHT` {xs auto, md 8.75rem}, `ITEM_GAP` 1rem, paddings, `clampLines(3)` | | | |
| **ListeNouvellesRich** `C/ListeNouvellesRich.jsx` | `title` = `'Nouvelles'` · `id` | Liste avec vignettes 120 px, date, titre, extrait | `ListeNouvellesRichQuery` (frontmatter complet + images) | non | **0** |

### 2.7 Recherche, formulaires, scripts tiers

| Composant | Props | Rendu | Nature, données | Gl | MDX |
|---|---|---|---|---|---|
| **RechercheSofiaAccueil** `C/RechercheSofiaAccueil.jsx` | aucune | Bande en dégradé rgba(34,41,48,…) en bas du SuperHero. Champ arrondi 80 px (56 mobile) « Rechercher des articles, des livres, des films... » + loupe. Accroche « L'outil de recherche Sofia : un monde de savoirs à explorer » (desktop). | I minimal. Soumission vers **`https://umontreal.on.worldcat.org/search?clusterResults=true&baseScope=wz:11098&lang=fr&stickyFacetsChecked=on&changedFacet=database&database=Xwc&overrideStickyFacetDefault=true&queryString=kw:<requête>`**. Faisable en `<form method=get>` + 3 lignes de JS. | non | 1 (accueil, dans SuperHero) |
| **RemountingScript** `C/RemountingScript.jsx` | `containerId`, `src` | `<div id>` + `<script async src>` ajouté au montage, retiré au démontage (contourne la déduplication de gatsby-script) | I. LibWizard `https://umontreal.libwizard.com/form_loader.php?id=…&noheader=0`, UneQuestion `https://unequestion.bib.umontreal.ca/1.0/widgets/7159` | non | 5 / 3. nous-joindre/nous-ecrire, nous-joindre/suggestion-achat, enseignement/formulaire-reserve |
| **FormulaireConsentement** `C/FormulaireConsentement.jsx` | aucune | Iframe (`@iframe-resizer/react` v5, `license GPLv3`, minHeight 160vh) vers **`https://api.bib.umontreal.ca/usagers/formulaire/?hostPageUrl=…&successUrl=<origin>/formulaire-consentement-inscription` + paramètres de la query** | I | non | 1 (formulaire-consentement-inscription, noindex) |
| **FormulaireConsentement_auth** `C/FormulaireConsentement_auth.jsx` | aucune | Idem + CAS : redirection vers `https://identification.umontreal.ca/cas/login.ashx?service=<origin>/pret-renouvellement-avis` si pas de `ticket` | I | non | **0** |
| **FormulaireSuggestionAchat** `C/FormulaireSuggestionAchat.jsx` | aucune | Iframe `https://jupiter.bib.umontreal.ca/formulaires/suggestions-achat-3.asp` + CAS | I | non | **0** (remplacé par LibWizard) |
| **FormulaireReserveCours** `C/FormulaireReserveCours.jsx` | `hostPageUrl` = `https://bib.umontreal.ca/enseignement/formulaire-reserve` · `successUrl` (= hostPageUrl + `/succes`) | Iframe `https://jupiter.bib.umontreal.ca/formulaires/reserve-cours-3.asp` | I | non | **0** (remplacé) |
| **LibChatWidget** `C/LibChatWidget.jsx` | aucune | `<div id=libchat_<hash>>` fixé en bas à droite, script `https://unequestion.bib.umontreal.ca/load_chat.php?hash=71ff3bc4…afdd3`, masque le bouton flottant, expose `window.openLibChatDirect()` | I | non (utilisé par `_layout/QuickLinks.jsx`, **2 instances** l. 102 et 214) | 0 |
| **RetroactionUsager** `C/RetroactionUsager.jsx` | aucune | MUI Alert info (fond **#EEF4F7 en dur**, 40 % de large ≥ sm) contenant le web component `<bib-retroaction-usager>` | S (web component externe) | non (templates Page / Doc / Nouvelle) | 0 |

### 2.8 Personnel (xlsx)

| Composant | Props | Rendu | Nature, données | Gl | MDX |
|---|---|---|---|---|---|
| **RepertoirePersonnel** `C/personnel/RepertoirePersonnel.jsx` | aucune | **ThemeProvider imbriqué** (`createTheme(tokens, frFR)` de `@mui/x-data-grid`). Champ de recherche (placeholder seulement, bordure #666), Select « Toutes les bibliothèques ou directions », Chip du filtre actif. Cartes #f9f9f9 : avatar 100 px, nom `h5`, fonction, direction, disciplines (séparées par `;` ou `\|`), téléphone et courriel (icônes #0057AC), bibliothèques. **Pagination 8 par page.** | I. Recherche multi-mots sans accents. Filtre bibliothèque synchronisé avec le `#hash` (correspondance via `src/utils/bibliotheques.js` : id / titre / autreTitre). `?q=` prérempli (moteur de recherche du site). Données : `useStaticQuery RepertoirePersonnelQuery` → `allFile(personnel, relativeDirectory "photos"){ name, childImageSharp.gatsbyImageData(400×400, WEBP) }` (119 fichiers, repli `_profile`) + **`allListePersonnelXlsxSheet1{ id nom prenom fonction direction disciplines courriel telephone teams photo bibliotheque }`** (`gatsby-transformer-excel` sur `content/personnel/liste-personnel.xlsx`) | non | 2. personnel.mdx, nous-joindre/notre-equipe.mdx |
| **FichePersonnel** `C/personnel/FichePersonnel.jsx` (export `ListePersonnel`) | aucune | Autocomplete par discipline (vignette 60 px) puis carte : photo 150, nom, fonction, disciplines, **texte lorem ipsum**, boutons « Action secondaire » et « Textez-moi! » (lien Teams) | I. `ListePersonnelQuery` (photos thumb 60 + 150 ; xlsx `nom photo prenom fonction direction disciplines courriel`) | non | 1. fiche-personnel.mdx (démo, **non exclue** du sitemap) |

### 2.9 Science ouverte (`engagements/science-ouverte`, noindex)

| Composant | Props | Rendu | Nature | MDX |
|---|---|---|---|---|
| **DialogueHorizontalTabs** `C/ScienceOuverte/DialogueHorizontalTabs.jsx` (export `DialogueOuverteHorizontalTabs`) | `tabs`: [{label, content}] = [] · `verticalSpacing` = `'1.5rem'` · `showDividers` = true · `maxHeight` = `'8000px'` | Bloc arrondi 12 px fond #00407f, rangée d'onglets #cce2f3 (actif blanc + filet). Contenu empilé avec séparateurs. `<style>` global inline. | I : onglets | 1 |
| **TimelineDefault** `C/ScienceOuverte/TimelineDefault.jsx` | `data`: [{date, title, subtitle, description, tags[], side: left \| right, color, gradient}] (défaut `{}`) · `title` · `subtitle` · `showFooter` = true · `compact` (inutilisé) · `customStyles.container` | Frise centrale : axe dégradé multicolore, badge de date au centre, cartes alternées gauche/droite (bordure gauche colorée, pastille initiale, tags), flèches SVG. **`h1` interne.** ~370 lignes de CSS inline, couleurs et police « Inter » en dur. PropTypes. | S (survols CSS seulement) | 1 (`showFooter={false}`) |
| **DisplayTimeline** `C/ScienceOuverte/DisplayTimeline.jsx` | `leftColl`, `rightColl`, `buttonText`, `buttonClassName`, `buttonStyle`, `timelineData`, `timelineTitle`, `timelineSubtitle`, `showFooter`, `autoScroll` = true, `onDisplay`, `onHide`, `toggleMode` = false, `initialVisible` = false, children | `HeroWithText` + bouton qui révèle `TimelineDefault`. Parcourt récursivement `rightColl` pour greffer des `onClick`. | I | **importé mais jamais rendu** |
| **Nombre** `C/ScienceOuverte/Nombre.jsx` | `number`, `label`, `sx` | Chiffre 1.5rem gras centré + libellé plus petit | S | 29 (beaucoup de `number="[Nombre]"` : contenu provisoire) |

### 2.10 Icônes

| Composant | Exports, signature | Usages |
|---|---|---|
| **CustomIcons** `C/CustomIcons.jsx` | `SofiaIcon(color, sx, ...props)`, `ArrowLeftCircleIcon(...)`, `ArrowRightCircleIcon(...)`, `ArrowUpRightCircleIcon(...)` : **signature cassée**, voir § 5. `BurgerIcon({color, size = 24, sx})` : correcte. `iconComponentFactory` : morte, avec un `console.log`. SVG sources dans `src/icons/` (`sofia.svg`, `burger.svg`, `arrow-*-circle.svg`). | MDX : accessibilite-web (`SofiaIcon size={45}`, `BurgerIcon size={40}`) + 2 autres imports. `_layout` : QuickLinks (Sofia), MenuBurger (Burger). `hooks/use-is-external.jsx`. Composants : Carousel1, CardWithImage, ListeEvenements, ListeFormations, ListeFormationsAccueil, ElementNouvelle. |
| **IconeUdeM** `C/IconeUdeM.jsx` | SVG 55×55 « UdeM », viewBox 1200, `fill=currentColor`, `aria-hidden` | 1 (`Icon={IconeUdeM}` dans a-propos/carriere) |
| **Close** `C/Close.jsx` | IconButton + `CloseRoundedIcon`, émet un `Event('close', {bubbles})` | **0** |

### 2.11 Utilitaires de mise en page (`C/utils/`)

| Composant | Props | Rendu | Usages |
|---|---|---|---|
| **GridOffset** | `offset`: number = 0 · …props sur la Grid interne | Grid2 container > Grid `size = 12 - 2·offset`, `offset = offset` : marges latérales symétriques en colonnes | 5 MDX (accessibilite-web, engagements, nous-joindre, fonds-livres-rares, dev) + Hero*, RichList, FichesBibliotheques |
| **LayoutContainer** | `sx` (sur le wrapper) · …props | max-width = dernier breakpoint (xl 1536 px), padding 20 / 64 px | 1 MDX + CarteHoraires, ListeHoraires, `_layout` |
| **LayoutGrid** | `outter`: bool = false · `sx` | Grid2 container spacing 64 px, padding latéral si `outter` | 2 MDX |
| **LayoutTable** (+ `.Tr/.Td/.Th`) | — | `table` border-collapse | BlocHoraireNarrow |
| **Div** | — | `styled('div')` (support de `sx`) | partout |
| **ConditionalWrapper** | `condition`, `wrapper`, children | — | HoraireAujourdhui + 3 fichiers `_layout` |
| **dummy-components** (`Hero`, `Bloc`) | children | `<div class="hero">` / `<div class="bloc">` | 0 (globaux) |

---

## 3. API externes : formats observés (requêtes du 2026-10-20)

- **`GET https://api.bib.umontreal.ca/horaires?debut=AAAA-MM-JJ&fin=PnD[&format=json]`**
  - Réponse : `{ total, evenements: [{ id, date: "2026-10-19T04:00:00.000Z", bibliotheque: "am", service: "regulier|reference|services|soutien-informatique|pret|mediatheque|sdaesh", periode, debut1, fin1, debut2, fin2, sommaire: "8h à 21h" }], labels: { bibs: {code: nom}, services: {...} } }`.
  - Une plage continue n'a que `debut1` et `fin2`. Une pause se décrit par `fin1 → debut2`. Fin `00:00` = minuit. `00:00 → 24:00` = 24 h sur 24.
  - Le filtre `bib` renvoie 422 (noté dans `horaires.js`). L'API ne compresse pas ses réponses (~95 Ko pour 2 semaines).
- **`GET …/horaires/services`** → `{ regulier: {label: "Heures d'ouverture", order: 1, key}, services, reference, soutien-informatique, pret, mediatheque, sdaesh }`.
- **`GET …/horaires/liste`** → `{ codeBib: "Nom complet" }`.
- **`GET …/horaires/<code>?…`** → **422 « Code de bibliothèque inconnu »**. C'est la route utilisée par `horaire/HoraireAujourdHui`.
- **`GET https://api.bib.umontreal.ca/formations/?limit=N`** → `[{ url, titre, date: "22 oct. 2026" (déjà formatée), debut: "14:30", fin: "15:30", disciplines: "a,b,c", typeLocalisation: "en-ligne|physique", lieu?, imageVedette }]`.
- **RSS du calendrier UdeM** (ListeEvenements) : RSS 2.0, `item{title, pubDate, link, enclosure@url}`. Réponse lente (2–3 s).
- **Tuiles Esri, CSS Leaflet jsDelivr, WorldCat, LibWizard, UneQuestion / LibChat, CAS UdeM, jupiter.bib** : voir les sections 2.5 et 2.7.

---

## 4. Composants jamais utilisés (candidats à l'abandon)

**Aucun usage nulle part :**
- `ImageHoverCard` (pourtant global)
- `ClickableFlipCard`, `CompactInteractiveFlipCard`, `HorizontalCardList`
- `Close`
- `ListeNouvellesRich`
- `FormulaireConsentement_auth`, `FormulaireSuggestionAchat`, `FormulaireReserveCours` (remplacés par `RemountingScript` + LibWizard)
- `DisplayTimeline` (importé, jamais rendu)
- `ListeHoraires/Microformat.jsx`
- `FicheBibliotheque/FichesBibliothequesContext.jsx` (fourni, jamais consommé)
- Dummies globaux `Hero`, `Bloc`
- `iconComponentFactory` (CustomIcons)
- `HoraireBibNoTitle.Title2` (export mort)
- Clés globales MUI `ListItem`, `ListItemButton`, `ListItemIcon`, `ListItemText` (0 balise MDX)

**Seulement sur des pages démo ou de test (abandonner avec la page) :**
- `FichePersonnel` (fiche-personnel.mdx, lorem ipsum)
- `horaire/HoraireAujourdHui` (widget-horaire.mdx, API cassée)
- Tous les `/dev/components/**` (dupliquent les usages réels)

**À fusionner ou remplacer :**
- `AccordionGroupScienceOuverte` → une variante de couleur d'`AccordionGroup`.
- `HeroWithText` / `HeroWithText2` → un seul composant avec un ratio en prop.
- `SuperHero` / `SuperHero2` → un seul.
- `FicheBibliotheque` / `FicheBibliothequeNoTitle` → un seul, avec `collapsible`.
- `HoraireBib` / `HoraireBibNoTitle` / `TitleHoraireBib` (code dupliqué, 3 copies du même `Title`).
- **Toute la famille ListeHoraires + HorairesHorizontalTabs + FicheBibliothequeNoTitle + FicheBibliotheque/HoraireAujourdhui** fait doublon avec **CarteHoraires**, plus récent et plus accessible, dont les données sont déjà centralisées dans `points-de-service.json`. Il vaut mieux ne porter que CarteHoraires, puis générer `/horaires` et les fiches de `/espaces/` à partir de ce JSON.

---

## 5. Problèmes repérés

### 5.1 Props cassées ou ignorées
- **`CustomIcons.jsx:26,45,49,53`** : `SofiaIcon(color, sx, ...props)` et les trois `Arrow*CircleIcon` sont déclarés avec des **paramètres positionnels** au lieu d'un objet déstructuré. React passe l'objet props en 1er argument, donc `color` = l'objet props entier, `sx` = undefined, `...props` = []. Conséquences :
  - **Aucune prop n'est appliquée** : `color`, `fontSize={50|36}`, `size={45}`, `aria-*`.
  - `sx={{color: <objet>}}` produit du CSS invalide.
  - Les icônes s'affichent à la taille SvgIcon par défaut (1.5rem) et en couleur héritée. C'est le cas dans Carousel1, CardWithImage, ListeEvenements, ListeFormations(Accueil), ElementNouvelle, `use-is-external` et accessibilite-web.

  Seul `BurgerIcon` est correct. `console.log('typeof size'…)` reste dans la factory.
- **`CardWithImage.jsx:20-21`** : icônes inversées (`external: ArrowRightCircle`, `internal: ArrowUpRightCircle`). De plus, `useIsExternal` (`hooks/use-is-external.jsx:16-21`) ne lit `icons` que dans un `useEffect([])` et calcule `isExternal` après le montage. Au SSR : icône interne, pas de `rel`.
- **`Blockquote`** : `cite` jamais posé sur `<blockquote>`. `typeof children === 'text'` n'est jamais vrai (l. 62).
- **`ImageHoverCard`** : `seats` et `details` ignorés. `Subtitle` reçoit `component` / `variant` (attributs DOM parasites).
- **`FlipCardWithImage`** : `small` passé ×9 dans espaces, ignoré.
- **`Carousel1`** : `sx` ignoré. `bg` (engagements) transmis tel quel en attribut DOM. Dans espaces, `moreLink` sans `moreText` : pas de bouton.
- **`RichList`** : `bg` ignoré. **`ListeNouvelles`** : `moreLink` ignoré. **`ListeFormations`** : `id` ignoré.
- **`FichesBibliotheques`** : `title` et `expanded` inutilisés. **`HorairesHorizontalTabs`** : `codeBib` inutilisé. **`SuperHero`/`SuperHero2`** : `lvl` inutilisé. **`Tabs1`** : `bg` inutilisé. **`TimelineDefault`** : `compact` inutilisé.
- **`HeroWithImage` / `HeroWithText` / `HeroWithText2`** : `{...rest}` est étalé **après** `sx`. Un `sx` passé écrase donc le `sx` fusionné (alignItems, marges des titres). `props` est calculé mais inutilisé.
- **`Button.jsx:64-66`** : `rel="noopener"` écrase le `rel` fourni (perte de `noreferrer` dans ColonneQuoiDeNeuf, ListeFormations, ListeEvenements). **Bug plus grave l. 68-70** : `isInternalLink` considère `https://*.bib.umontreal.ca` comme interne, et Button passe alors l'URL **absolue** à `GatsbyLink`. Exemple : `https://studio.bib.umontreal.ca/informatique/` (etudes). Le correctif existe dans `Link.jsx:36`, mais pas dans `Button`.
- **`Accordion.jsx`** : hors `AccordionGroup`, le contexte vaut `{}`, donc `handleChange` est undefined et le rendu plante. `defaultExpanded` est passé en même temps qu'`expanded` (mélange contrôlé / non contrôlé, avertissement MUI).
- **`AccordionGroup*.jsx:44`** : `colors.default` n'existe pas.
- **`IconInSquare`** : les `color` des icônes dans le MDX (`"vertFonce"`, `"rougeOrange"`, `"bleuPrincipal"` : clés de palette, pas des couleurs CSS) sont de toute façon écrasés par `fill`.

### 5.2 Bugs fonctionnels
- **`horaire/HoraireAujourdHui`** : endpoint `/horaires/<code>` → 422, donc toujours « failed to load ». De plus, `toISOString()` décale la date (UTC) et l'index du jour est fragile.
- **`HoraireBibProvider.jsx:35-37,132`** : URLs `https:///api…` (3 barres obliques ; tolérées par le parseur WHATWG, mais à corriger). Le `fetcher` (l. 8-21) attrape **sa propre** erreur et appelle `res.json()` quand même : les erreurs HTTP ne remontent jamais.
- **`ListeHoraires/Week.js:19`** : `toDate()` passe par `toISOString()`, ce qui décale le jour le soir (bogue de fuseau évité dans `horaires.js`). `console.log('isSmall:')` l. 35.
- **`BlocHoraireNarrow`/`Wide`** : supposent un événement par jour, dans l'ordre (`serviceHoraires[i]`). Un trou décale toute la semaine.
- **`ListeHorairesContainer.jsx:48`** : `React.Children` sans `import React`. Même chose pour `React.cloneElement` / `React.isValidElement` dans **`Tabs1.jsx:130`**, **`SuperHero2.jsx:245`** et **`DisplayTimeline.jsx:77,84`**. `jsxRuntime` n'est pas configuré dans `gatsby-config.mjs` (défaut classic) : à vérifier, sans objet en Astro.
- **`HoraireBib.jsx:76`** : le permalien pointe vers `/nous-joindre/#id` (une autre page) au lieu de `#id`.
- **`TitleHoraireBib.jsx:62`** : `width: 750` à partir de 1370 px, puis 300 à partir de 1536 px (incohérent).
- **`SearchBox`** : `<form>` sans `onSubmit`, donc Entrée recharge la page.
- **`FicheBibliotheque/HoraireAujourdhui.jsx:57-68`** : hooks (`useSWR`, `useMemo`) appelés **après** des `return` conditionnels (violation des règles des hooks).
- **`FicheBibliotheque.jsx` et `FicheBibliothequeNoTitle.jsx`** déclarent tous deux la requête **`FicheBibliothequeImageQuery`**. **`SuperHero.jsx` et `SuperHero2.jsx`** déclarent tous deux **`ImageQuery`**. Noms de requêtes dupliqués.
- **`SuperHero.jsx:70`** : plante si `imageName` est introuvable. **`ListeNouvellesRich.jsx:150`** : plante si `newsImage` est absent ; `newsImage.caption` n'existe pas.
- **`ListeEvenements`** : la date affichée est le **`pubDate`** du flux (pas forcément la date de l'événement). L'heure `debut` est passée à `<Lower>`, qui **ignore ses children** : l'heure n'est jamais affichée. `FALLBACK_IMAGE` codé en dur.
- **`ListeFormations`** : toute erreur fait disparaître le composant. Le composant `throw` sur des props invalides (ce qui fait planter la page).
- **`FormulaireConsentement(_auth)` / `FormulaireSuggestionAchat`** : avec `@iframe-resizer/react` v5, `onMessage` reçoit `{iframe, message}` et non `event.data`. `navigate` et `authenticate` ne sont donc jamais traités (`FormulaireReserveCours` lit bien `message`). `FormulaireSuggestionAchat` nettoie l'URL à chaque message.
- **`TimelineDefault`** : `data = {}` par défaut, donc `.map` plante. Pied de page de démo « ✦ Compact Timeline | Center axis | Colored cards ✦ ». `item.subtitle.charAt(0)` affiche l'initiale d'un émoji.
- **`DisplayTimeline`** : `console.log` l. 36. Libellé anglais « Hide ».
- **`HorairesHorizontalTabs.jsx:128,132`** : des commentaires JSX `{/*…*/}` sont **injectés dans la chaîne CSS**. Le bloc `{…}` invalide, selon toute vraisemblance, les déclarations `margin` et `font-family` qui suivent. Les `@keyframes fadeIn` globaux entrent en collision avec ceux de `ClickableFlipCard` et sont réinjectés 16 fois sur /horaires.
- **`DialogueHorizontalTabs.jsx:54`** : `color: #00407;` (hex invalide). `${showDividers && …}` injecte « false » dans le CSS.
- **`useCarousel.jsx:30`** : écouteurs embla jamais retirés (pas de cleanup).
- **`Carousel1`** : double espacement (gap 10 px + marginRight 15 px).
- **`GridOffset`** : `size` démarre à `offset` (ex. 0.5) au SSR puis passe à 11 après l'effet (saut de mise en page). Avec `offset = 0`, `size` reste à 0.
- **`Section`** : `marginTop` absent des dépendances de l'effet. Parallaxe = setState à chaque scroll. 3 `useMediaQuery` inutilisés.
- **`Liste`** : `styled(type)()` est recréé **à chaque rendu** (remontage). `throw` dans des `useEffect`. Constante `ArrowRight` morte.
- **`Card2`, `CardWithIcon`** : `styled()` créé dans le rendu (remontage à chaque rendu). Couleur ou type de lien réglés après hydratation.
- **`RepertoirePersonnel`** : `disciplineFilter` sans interface (mort). `LibraryBooks` importé pour rien. Champ `teams` récupéré pour rien. **`@mui/x-data-grid` importé uniquement pour `frFR`**. `window.scrollTo(0,0)` à chaque `hashchange`. `pushState` à chaque choix de filtre (pollue l'historique).
- **`FichePersonnel`** : `{process.env.JSDELIVR_SERVICE_URL}` affiché à l'écran, `console.log('rest:')`, lorem ipsum, Grid legacy `item`.
- **`HoraireBibNoTitle.jsx:28-29`** : `console.log`.
- **`LibChatWidget`** : 2 instances (même `id`), un `<style>` ajouté à chaque montage et jamais retiré, `alert()`.
- **`FlipCardWithBg`, `ImageHoverCard`, `FlipCardWithImage`** : `theme.breakpoints.down('xs')` ne correspond à aucune largeur (règles mortes).

### 5.3 Accessibilité
- **`RichListItemWithLink`** : `Button` ou `IconButton` `href` (un `<a>`) **imbriqué dans un ListItemButton `<a>`** (liens imbriqués, HTML invalide). IconButton sans `aria-label`. `h3` en dur, quel que soit le niveau de la page.
- **`FicheBibliotheque`** : `<a href="#id">` **à l'intérieur du bouton** d'AccordionSummary (élément interactif imbriqué). `id` d'ancre posé sur le bouton.
- **`FlipCardWithBg` / `FlipCardWithImage` / `ImageHoverCard`** : `div tabIndex=0` avec `role=region` / `article` et `aria-label` « Carte : … » / « Card: … » (anglais), sans action. FlipCardWithImage ne révèle pas son contenu au clavier. Le contenu caché par `opacity: 0` reste lu. `h3` / `h6` sautent des niveaux.
- **`CardWithImage`** : `alt={title}` redondant avec le titre visible. `h4` en dur.
- **`ListeFormations`** : `h4` dans un lien, `Title` crée une liste de titres. **`TimelineDefault`** : `h1` en plein contenu, tags 0.6rem, textes de 0.6 à 0.75rem.
- **`Tabs1`** : panneaux `id="tabpanel-<index>"` / `aria-labelledby="tab-<index>"` alors que les Tab n'ont pas ces `id` (liaison cassée ; ids dupliqués si deux Tabs1 sur la page). Tab rendu via `Button` (double ButtonBase).
- **`HorairesHorizontalTabs`, `DialogueHorizontalTabs`** : pas de `role=tablist/tab/tabpanel`, pas d'`aria-selected`, pas de navigation aux flèches.
- **`BlocHoraireWide`** : tableau en `<div>` en grille, sans sémantique de tableau. **`BlocHoraireNarrow`** : `th` sans `scope`. Note : CarteHoraires fait tout cela correctement.
- **`Carousel1`** : la **molette verticale est capturée** au-dessus du carrousel (`preventDefault` sur deltaY). Pas de région ni de `aria-roledescription`. Pastilles de 5 px de haut (cible trop petite) sans `aria-current`. Libellés « précédent » / « suivant » en minuscules.
- **`RechercheSofiaAccueil`**, **`SearchBox`**, **`RepertoirePersonnel`** : champs sans `<label>` (placeholder seulement, `aria-description` non standard). Le Select du répertoire n'a pas de nom accessible.
- **`ColonneQuoiDeNeuf`** : `aria-labelledby={id}` avec un `id` souvent undefined.
- **`AccordionGroupScienceOuverte`** : vert #52b782 sur #fcf3f1, contraste d'environ 2,4:1 (< 4.5). **`ListeFormations`** : épingle `color="red"`. **`HoraireBibHeader`** : boutons « Aujourd'hui » en `IconButton` avec un `aria-label` identique au texte.
- **`HeroWithImage`** : `aria-hidden` sur l'`img` en plus de `alt=""` (redondant, inoffensif). **`SuperHero*`** : `alt=""` par défaut.
- **`FichePersonnel`** : fragments sans `key` dans la liste des disciplines.

### 5.4 Couleurs, polices et valeurs en dur (à remplacer par des variables CSS issues de `plugins/gatsby-plugin-bib-theme/tokens/tokens.js`)

| Valeur en dur | Où |
|---|---|
| `#fcf3f1` / `#b72600` | AccordionGroup |
| `#fcf3f1` / `#52b782` | AccordionGroupScienceOuverte |
| `#ffca40`, `#ffdb81`, `#BC8800` (jaune « quick fix ») | CardWithIcon |
| `#ffffff88`, `#f04e2488` | Card2, CardWithIcon |
| `#607386` | Blockquote |
| `#e7ebeeb7`, `#c3ccd5` | BibTable |
| `#E5F0F8`, `#686a6d49`, `#0057AC`, `rgba(21,37,54,.8)` | ImageHoverCard |
| `rgba(7,31,56,.7)`, `#e5f0f8` | FlipCardWithImage |
| `rgb(240,78,36)` | FlipCardWithBg |
| `#007bff`, `#e0e0e0`, `#f8f9fa`, `#fff3cd`, police `-apple-system…` | HorairesHorizontalTabs |
| `#00407f`, `#cce2f3`, `#02090f` | DialogueHorizontalTabs |
| ~30 couleurs + police **« Inter »** | TimelineDefault |
| `#2c7da0` / `#1e5a77` | DisplayTimeline |
| `#00407f`, `#e2e8f0`, `rgba(0,0,0,.75)` | ClickableFlipCard |
| `#EEF4F7` | RetroactionUsager |
| `#f44336` | LibChatWidget |
| `#666666`, `#f9f9f9`, `#1976d2`, `#0d47a1` (bleu MUI par défaut), `#0057AC` | RepertoirePersonnel |
| dégradés `rgba(34,41,48,…)`, `#fff` | RechercheSofiaAccueil |
| `rgba(175,169,169,1)`, `rgba(250,242,242,1)` | HoraireBibHeader |
| `#fff` | BlocHoraireWide |
| `red` | ListeFormations |
| `var(--bib-palette-primary-main)` | FicheBibliotheque/HoraireAujourdhui |

Typographie en dur un peu partout : 1.7778rem, 1.2222rem, 0.8889rem (échelle 18 px), 17 px, 15 px, 13 px.

**À retenir pour la réécriture.**
- `violetFonce` vaut en réalité `#9374f6` (clair).
- `rose300` vaut `#fee1de` (très pâle). Les noms de tokens sont trompeurs.
- Le thème MUI applique aussi des `styleOverrides` (Accordion, AccordionSummary, AccordionDetails, Alert outlined) et des variantes typographiques (`display1–4`, `titreSuperHero(Small)`, `h4Figtree`, `carteProfilLink`) à reproduire en CSS.
- Les durées et easings MD3 (short4 200 ms, medium1–3 250–350 ms, `cubic-bezier(.2,0,0,1)`) et les coins (`shape.corner.extra-small/small/medium/full`) sont aussi définis dans `tokens.js`.

### 5.5 Pièges SSR / hydratation (le rendu `.astro` les éliminera)

Ces composants rendent au SSR un HTML différent du rendu final :
- Section : fond posé par effet.
- Card2 et CardWithIcon : couleur ou type de lien.
- Button : cas PDF.
- Liste : styles.
- GridOffset : `size`.
- Héros, FicheBibliotheque*, RichListItemWithLink, Carousel1, SuperHero* : `useSmall` / `useMediaQuery`.

En Astro, tout cela doit devenir du **CSS responsive** (media queries, `:hover`, `:focus-within`) calculé au build.

---

## 6. Synthèse de la cible Astro

| Cible | Composants |
|---|---|
| **`.astro` pur + CSS** | Link, Button, Alert, Blockquote, BibTable, Liste, Section, SuperHero(2) (un seul, mesure des bannières en CSS ou en petit script), HeroWithImage / HeroWithText(2), IconInSquare, Card2, CardWithIcon (survol en CSS), CardWithImage, FlipCardWithBg et FlipCardWithImage (`:hover`/`:focus-within`), RichList / RichListItemWithLink (corriger l'imbrication), Nombre, TimelineDefault, IconeUdeM / icônes SVG, ListeNouvellesAccueil / ElementNouvelle / ColonneQuoiDeNeuf (données au build), DonneesStructurees, utilitaires de grille, RetroactionUsager (web component) |
| **HTML natif + un peu de JS, sans framework** | Accordéons (`<details name>`), Tabs1 / DialogueHorizontalTabs (motif ARIA tabs), RechercheSofiaAccueil (`<form>`), RemountingScript (`<div>` + `<script>`), formulaires iframe, ListeNouvelles (filtre + `?type=`) |
| **Îlots React (ou Preact / vanilla)** | Carousel1 (embla, `client:visible`), CarteHoraires (+ Leaflet `client:visible`), ListeEvenements, ListeFormations(Accueil) (ou génération au build et revalidation), RepertoirePersonnel (xlsx lu au build en JSON, filtre côté client), LibChatWidget |
