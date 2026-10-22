# Analyse du contenu de `content/` pour la migration Gatsby vers Astro

Rien n'a été modifié. Les chiffres viennent de scripts `node -e` (gray-matter, xlsx) et de `sips`, lancés sur l'arbre de travail actuel.

**Ce qui pèse le plus sur le script :**
- **Le `slug` du frontmatter est ignoré pour les pages, mais appliqué pour les nouvelles.** Deux nouvelles ont donc la même URL.
- **Les liens relatifs sont ambigus** : certains ne marchent qu'avec la barre oblique finale, d'autres seulement sans.
- **Le MDX est en version 2**, compilé par une copie locale de `gatsby-plugin-mdx`.
- **L'arbre de travail n'est pas propre** : 7 nouvelles et leurs images sont supprimées, et `content/revue-de-presse/` n'est pas suivi par git.

## 1. Arborescence et URL

**Nombre de fichiers par dossier :**

| Dossier | .mdx | Autres fichiers |
|---|---|---|
| `content/pages` | 91 | 156 images |
| `content/nouvelles` | 17 (9 en 2025, 8 en 2026) | 11 images |
| `content/bibliotheques` | 20 | 14 images |
| `content/personnel` | 0 | 1 .xlsx + 119 .jpg |
| `content/revue-de-presse` | 0 | `articles.json` |

Détail de `content/pages` : 10 fichiers à la racine, `a-propos` 10, `dev` 29 (22 sous `dev/components/*/index.mdx`), `engagements` 5, `enseignement` 4, `espaces` 1, `etudes` 1, `formulaire-consentement-inscription` 1, `horaires` 1, `nous-joindre` 5, `nous-soutenir` 3, `obtenir` 17, `recherche` 4. Il y a 43 `index.mdx`.

Au total : 11 574 lignes et environ 1 920 balises de composants.

**Calcul de l'URL (`gatsby-node.mjs`, `doCreatePages`)**
- Formule : `/${relativeDirectory}/${slugify(name)}` ; `index` devient vide, et la barre oblique finale est toujours présente.
- Le dossier n'est pas passé dans `slugify`, d'où `/dev/components/cardWithIcon/` en camelCase.
- Le code lit `node.frontmatter?.slug` sur le nœud File, où ce champ n'existe jamais. **Les 71 `slug` du frontmatter des pages sont donc ignorés.**
- C'est heureux : sinon `a-propos/carriere/index.mdx` (`slug: carriere`) donnerait `/a-propos/carriere/carriere/`, et `formulaire-consentement-inscription` (`slug: /formulaire-consentement`) changerait d'URL.
- Conséquence : le sitemap exclut `/formulaire-consentement`, alors que la vraie URL est `/formulaire-consentement-inscription/`.
- Le script de conversion doit **ignorer `slug` pour les pages** et le garder pour les nouvelles.

**URL des pages** (91, confirmées par `public/`). Chaque fichier donne son chemin + `/`, et `index.mdx` donne le dossier.
- `/`, `/accessibilite-web/`, `/conditions-utilisation/`, `/fiche-personnel/`, `/horaires/`, `/horaires/test/`, `/nouvelles/`, `/personnel/`, `/service-accessibilite/`, `/tests/`, `/widget-horaire/`, `/formulaire-consentement-inscription/`
- `/a-propos/` + `carriere/`, `carriere/affichage-premiers-peuples/`, `mission-vision-valeur/`, `nos-collections/`, `nos-collections/nos-collections-speciales/`, `notre-organisation/`, `notre-organisation/stephanie-gagnon/`, `politiques-reglement/`, `rapports-annuels/`
- `/engagements/` + `ateliers-wiki/`, `bibliotheques-vivantes/`, `lecture-cadeau/`, `science-ouverte/`
- `/enseignement/` + `formations-cours/`, `formulaire-reserve/`, `reserve/`
- `/espaces/`, `/etudes/`
- `/nous-joindre/` + `clavarder/`, `notre-equipe/`, `nous-ecrire/`, `suggestion-achat/`
- `/nous-soutenir/` + `accessibilite-web/` (fichier vide de 0 octet, mais une page est générée), `fonds-livres-rares/`
- `/obtenir/` + `frais-avis/`, `numerisation/`, `reproduction-theses-memoires/`, `peb/`, `peb/ill-external-libraries/`, `peb/peb-institutions-externes/`
- `/obtenir/pret-renouvellement-retour/` + `banq-universites-canadiennes/`, `cegeps/`, `diplomes/`, `droit-accorde/`, `grand-public/`, `pbuq/`, `communaute-udem/`, `communaute-udem/carte-pbuq/`, `communaute-udem/ententes-cegeps/`
- `/recherche/` + `diffuser/`, `diffuser/financement-monographie/` (le slug `financement-monographies-savantes-udem` est ignoré), `diffuser/kerko/`
- `/dev/` : `clarity/`, `consent/`, `consent-server/`, `navigation/secondaire/`, `nouvelles/nouvelle-externe/`, `nouvelles/nouvelle-interne/`, `typography/`, et `components/{accordion, alert, blockquote, button, card2, cardWithIcon, cardWithImage, carousel1, flipCardWithBg, flipCardWithImage, formulaireReserveCours, formulaireSuggestionAchat, heroWithImage, heroWithText, heroWithText2, liste, listeEvenements, listeFormations, listeNouvelles, richListItemWithLink, section, tabs1}/`

`/ddia/`, `/radaria/` et `/consent/server/` viennent de `static/`, pas de `content/`.

**URL des nouvelles** : `/nouvelles/${relativeDirectory}/${slug ?? slugify(name)}/`. Le slug est appliqué tel quel, sans `slugify`, donc avec ses majuscules. 17 fichiers donnent 16 URL.

| Fichier | URL |
|---|---|
| `2025/a-vos-micros` | `/nouvelles/2025/a-vos-micros/` |
| `2025/bourse-Bazin` **et** `2025/heures-ouverture-blsh` | `/nouvelles/2025/remise-bourse-genevieve-bazin-bibliotheque-des-livres-rares-et-collections-speciales/`. **Même slug pour les deux : collision**, et `heures-ouverture-blsh` n'a pas de page propre. |
| `2025/concours-bourses-blrcs` | `/nouvelles/2025/ouverture-concours-bourses-blrcs/` |
| `2025/dans-univers-Claude-Gingras` | `/nouvelles/2025/univers-Claude-Gingras/` (majuscules) |
| `2025/decouvrir-univers-Claude-Gingras` | `/nouvelles/2025/decouvrir-univers-claude-gingras/` |
| `2025/magie-sorcellerie` | `/nouvelles/2025/magie-sorcellerie/` |
| `2025/papyrus-rejoint-service-de-depot-institutionnel-canadien-scholaris` | même nom en URL |
| `2025/travaux-bibliotheque-sante` | même nom en URL |
| `2026/annonce-travaux-bibliotheque-LSH` et `…-LSH-suite` | majuscules conservées |
| `2026/bourses-GBazin-CSN` | majuscules conservées |
| `2026/bourses_blrcs` | `/nouvelles/2026/bourses-blrcs/` |
| `2026/changement-proxy`, `2026/orcid-accompagnement`, `2026/recherche-doc-augmentee` | même nom en URL |
| `2026/travaux-bibliotheque-LSH` | même nom en URL, mais la date est `2024-02-21` alors que le fichier est dans 2026 |

- `ListeNouvellesRich.jsx` construit encore l'URL à partir du nom de fichier (`/nouvelles/2025/bourse-Bazin`), ce qui donne un lien mort. `useNouvelles.js`, lui, prend le vrai chemin de la page.
- Le fil d'Ariane des nouvelles retire le maillon de l'année (`NouvelleTemplate`, `crumbs.splice(2,1)`).

**Bibliothèques et personnel n'ont pas d'URL propre.** Les fiches sont rendues dans `/espaces/` et `/nous-joindre/`, avec une ancre `#id`. Le personnel est rendu dans `/nous-joindre/notre-equipe/?q=` et `/personnel/`.

## 2. Frontmatter

Comptage sur 128 fichiers :

| Champ | Fichiers | Forme exacte / valeurs |
|---|---|---|
| `title` | 106 | `title: Carrière`. Absent de `conditions-utilisation.mdx`, du fichier vide et des 20 fiches de bibliothèques (qui n'ont pas de frontmatter). Entre guillemets s'il contient `:` (5 fichiers). Écrit `title :` avec une espace dans 7 fichiers. Espace finale dans 3 fichiers (`formations-cours`, `reserve`, `decouvrir-univers…`). En dev, titres du type `title: <Accordion>`. |
| `slug` | 71 | Appliqué seulement aux nouvelles (17). Écrit `slug :` dans 9 fichiers. Exemple : `slug: /formulaire-consentement`. |
| `crumbLabel` | 47 | `crumbLabel: Stéphanie Gagnon - directrice générale`. Écrit dans `public/crumb-labels.json`. |
| `secondaryNav` | 34 | `.order` 32 (entier de 1 à 7), `.title` 6, `.hidden` 3 (`false` ×2, `true` ×1). Lu par `plugins/gatsby-plugin-bib-secondary-nav` (gray-matter) ; titre affiché = `secondaryNav.title` ou, à défaut, `title`. |
| `superHero` | 40 | Toujours `{imageName, title}`. `imageName` : obtenir 16, espaces 9, engagements 4, nous-joindre 4, enseignement 3, recherche 3, noussoutenir 1. Renvoie à `content/pages/images/super-heroes/<nom>.*`. Affiché seulement si `lvl > 1`. |
| `template` | 27 | `doc` 22 (dev/components) ; `blank` 5 (dev/clarity, consent, consent-server, nouvelle-externe, nouvelle-interne). Résolu en `src/templates/XyzTemplate.jsx`. |
| `noindex` | 8 | Toujours `true` : 5 en dev, `science-ouverte`, `formulaire-consentement-inscription`, `horaires/test`. |
| `type` | 17 | Toujours `interne` (nouvelles). |
| `date` | 17 | `date: 2025-10-27` sans guillemets, lu comme un `Date` YAML. |
| `source` | 17 | Bibliothèques 12, Quoi de neuf 1, La Presse 1, Radio-Canada 1, 24 heures 1, « Bibliothèques de l'UdeM » 1. |
| `newsImage` | 16 | Voir ci-dessous. |
| `newsUrl` | 4 | URL externe (a-vos-micros, les deux Claude-Gingras, magie-sorcellerie). |
| `authors` | 1 | Liste YAML (`- Nom, fonction…`) dans `papyrus…`. Le JSON-LD garde la partie avant la virgule. |
| `description` | 1 | `horaires/test.mdx` (meta description). |
| `lvl` | 1 | `horaires/test.mdx` (`lvl: 1` force la mise en page de premier niveau). Il y a aussi des commentaires YAML `#` dans ce fichier. |

**Détail de `newsImage`** (16 fichiers) : `.name` 16, `.alt` 12, `.source` 10, `.caption` 9, `.legend` 1.
- Ces clés sont souvent présentes mais vides (`alt: ` devient `null`) ; `name` est vide dans 4 fichiers.
- `name` est un nom de fichier sans extension. L'image est cherchée dans toutes les années de `nouvelles/*/images`.
- Exemple :
  ```yaml
  newsImage:
    name: bourse-Bazin-2025
    alt: Bourse Geneviève-Bazin
    legend: Bourse Geneviève-Bazin
    source: Tom Le Photographe
  ```

**Particularités de format :**
- 5 nouvelles de 2026 sont en **CRLF** (`annonce-…-LSH-suite`, `bourses-GBazin-CSN`, `bourses_blrcs`, `changement-proxy`, `recherche-doc-augmentee`). Aucun BOM.
- 14 nouvelles répètent leur titre dans le corps (`<Typography component='h1' variant='h2'>…`, ou `component='h2' variant='h3'` dans a-vos-micros) ; 3 le font avec `## …`.

## 3. Imports en tête des MDX

540 lignes d'import dans 88 fichiers. Aucun import n'apparaît après du contenu.

| Catégorie | Imports | Fichiers | Détail |
|---|---|---|---|
| Phosphor | 183 | 44 | 91 icônes distinctes, toujours `import { XIcon } from '@phosphor-icons/react/dist/csr/X'`. Environ 21 imports utilisent encore l'ancien nom sans suffixe (`Heart`, `Video`, `Users`, `FlowerTulip`, `GraduationCap`, `Megaphone`…). Les plus fréquentes : ArrowSquareOut 21, PersonSimpleCircle 20 (dont 18 non utilisées dans les fiches de bibliothèques), Repeat 8, IdentificationCard 7, CalendarDots 7, Books 7, MagnifyingGlass 4. Quelques imports ont des guillemets doubles ou un `;` final. |
| Images locales | 132 | 22 | Voir section 7. |
| MUI (`@mui/material/*`) | 108 | 21 | Table, TableBody, TableCell, TableContainer, TableHead, TableRow ×10 chacun ; Paper 11 ; Box 7 ; Typography 6 ; Card 4 ; CardContent 4 ; CardMedia 3 ; CardActions 2 ; CardActionArea 2 ; Container 2 ; Alert 2 ; Button 2 ; `Grid` (v1) 1 ; `useMediaQuery` 1 ; `styles/useTheme` 1. |
| `@mui/icons-material` | 3 | 3 | Comment ×2 (non utilisé), ExpandMore ×1 (non utilisé). |
| `@/components/*` | 83 | 59 | FicheBibliotheque 19, SuperHero2 11, Liste 7, RemountingScript 5, GridOffset 5, LayoutGrid 3, SuperHero 2, ListeNouvelles 2, ListeFormations 2, ListeEvenements 2, Blockquote 2, RepertoirePersonnel 2. Une seule fois : TitleHoraireBib, HorairesHorizontalTabs, HoraireBibNoTitle, HoraireBib, horaire/HoraireAujourdHui, FicheBibliothequeNoTitle, FichesBibliotheques, ListeHoraires, CarteHoraires, FichePersonnel, FormulaireConsentement, RechercheSofiaAccueil, ListeNouvellesAccueil, ListeFormationsAccueil, QuoiDeNeuf/QuoiDeNeuf, LayoutContainer, IconeUdeM, Section, ScienceOuverte/{TimelineDefault, Nombre, DisplayTimeline, DialogueHorizontalTabs}. |
| `@/components/CustomIcons` | 3 | 3 | `{ SofiaIcon, BurgerIcon, ArrowRightCircleIcon, ArrowUpRightCircleIcon }` |
| `@/icons/*.svg` | 2 | 1 | `accessibilite-web` (svg importé comme composant React via `gatsby-plugin-react-svg`). |
| `.mdx` | 21 | 3 | `bibliotheques.mdx` importe les 19 fiches ; `espaces/index.mdx` et `nous-joindre/index.mdx` importent `../../bibliotheques/bibliotheques.mdx`. |
| `gatsby` | 3 | 3 | `{ Script }` (dev). |
| `react` | 1 | 1 | `{ useEffect }` (`clavarder`). |
| Chemin relatif vers `src` | 1 | 1 | `../../../src/components/BibTable` (`lecture-cadeau`). |

- **79 bindings importés ne sont jamais utilisés** : notamment les 9 portraits de `bibliotheques-vivantes`, Table* dans `conditions-utilisation`, et 8 icônes dans `recherche/index`. Le script peut les supprimer.
- **Composants disponibles sans import** (`src/templates/commonComponents.js`) :
  - MUI : AlertTitle, Box, Divider, **Grid = `@mui/material/Grid2`**, List, ListItem, ListItemText, ListItemButton, ListItemIcon, Typography.
  - Maison : Accordion, AccordionDetails, AccordionGroup, AccordionSummary, Alert, Button, Card2, CardWithIcon, CardWithImage, Carousel1, FlipCardWithBg, FlipCardWithImage, ImageHoverCard, HeroWithImage, HeroWithText, HeroWithText2, IconInSquare, Link, RichList, RichListItemWithLink, Section, SuperHero2, Tabs1, Hero, Bloc, AccordionGroupScienceOuverte.
  - Utilisés sans import, en nombre de fichiers : Section 41, Typography 38, Link 30, Grid 29, Button 20, Alert 9, Carousel1 9, Box 8, RichListItemWithLink 8, RichList 7, HeroWithImage 7.
- **Imports locaux qui remplacent un composant commun :**
  - Box : 5 fichiers.
  - Typography : 4 fichiers.
  - SuperHero2 : 11 fichiers.
  - `fiche-personnel.mdx` remplace le Button maison par **le Button MUI**.
  - `formulaire-consentement-inscription` importe Section.

## 4. MUI dans le MDX

**Nombre de balises :** Grid 231 (29 fichiers), Typography 182 (42), Box 169 (13), TableCell 124 / TableRow 55 / Table, TableHead, TableBody, TableContainer 13 chacun (10 fichiers), Divider 5, Card/CardMedia/CardContent 3, CardActions 2, CardActionArea 1, Container 1, List 1.

**Grid**
- Props : `size` 90, `container` 60, `sx` 51, `spacing` 41, `gap` 7, `direction` 6, `style` 6, `alignItems` 5, `offset` 4, `justifyContent` 4, `columnSpacing` 1.
- Valeurs de `size` : `{{xs:12,md:6}}` 27, `"auto"` 22, `{4}` 6, `{8}` 5, `"grow"`/`'grow'` 6, `{{xs:12,sm:6,md:4,lg:3}}` 4, `{{xs:12,sm:6,md:4,lg:4}}` 3, `{{xs:12}}` 3, `{{sm:12,lg:9}}`/`{{sm:12,lg:3}}`. Valeur fautive : `{{xs:6,md:14}}`.
- `spacing` : `".62rem"` 15, `{2}` 14, `{1.25}` 3, `{1}` 3, `".40rem"` 2, `'1.5rem'` 1, `{4}` 1.
- `offset` : `{{md:6}}` 3, `{8}` 1.
- **Ancienne API Grid v1 passée à Grid2, donc ignorée :**
  - `nous-joindre/clavarder.mdx` : `<Grid item xs={12} md={8} lg={8} xl={9}>`
  - `a-propos/carriere/index.mdx` : `item xs sm md lg xl` dans un `.map`
  - `fiche-personnel.mdx` : `<Grid md={6} display="flex">`

**Typography**
- Props : `variant` 138, `component` 122, `sx` 25, `gutterBottom` 14, `id` 11, `color` 3.
- Couples `variant`/`component` : h2/h2 68, sans props 43, **h2/h1 18**, h3/h2 11, body1 8, h4/h4 5, subtitle1/div 4, subtitle1/p 3, h3 3, h3/h3 2, h5/div 2, body2 2, p 2, display1 à display4 /div (1 chacun), h1/h1, h5/h5, h6/h6, body2/figcaption.

**Box** : `sx` 141 ; props système occasionnelles `display`, `alignItems`, `justifyContent`, `flex`, `p`, `my`, `px` ; `component="img"`/`"figure"` 3.

**Prop `sx` : 298 occurrences dans 43 fichiers**
- Répartition par fichier : `science-ouverte` 159, `recherche/index` 12, `mission-vision-valeur` 10, `enseignement/index` 9, `index` 8, `nos-collections-speciales` 7. Puis 5 chacun : `diplomes`, `pbuq`, `fonds-livres-rares`, `dev/alert`, `dev/tabs1`.
- Répartition par composant : Box 141, Grid 51, Typography 25, TableRow 23, Table 13, Section 12, Accordion 6, Alert 6, Button 6, AccordionDetails 5, Card 3, CardActions 2, CardMedia 1, GridOffset 1, LayoutGrid 1, AccordionGroup 1, `<p>` 1.
- Longueur : médiane 106 caractères, maximum 447.

| Motif | Nombre de `sx` concernés |
|---|---|
| Valeur avec unité (rem, px, %) | 188 |
| Couleur hex en dur | 70 |
| borderRadius | 65 |
| Espacement numérique (`p:2`) | 52 |
| `display:'flex'` | 34 |
| Sélecteurs imbriqués `'&…'` | 24 |
| fontSize / fontWeight | 17 |
| Callback `theme =>` | 12 |
| `theme.*` (shape.corner, palette.rougeOrange, transitions.md3, breakpoints) | 7 |
| Objets responsives `{xs,md…}` | **5 seulement** |
| `!important` | 4 |
| Jeton de couleur en chaîne | environ 0 à 3 |

- Couleurs hex : `#c1c1fd` ×27, `#e5f0f8` ×17, `#766ec8` ×17, `#ccc` ×9, `#fee1de` ×4, `#ffcba4` ×4, `#fbe870` ×2, `#ff8833`, `#ffdb00`.
- Clés les plus fréquentes : padding 112, display 66, borderRadius 65, margin 61, border 52, backgroundColor 45, lineHeight 42, textAlign 42, width 38, alignItems 37, height 36, justifyContent 32, p 29, gap 28, marginTop 24, flexDirection 24, paddingTop 22, gridTemplateColumns 22, minWidth 19, gridArea 11, bgcolor 4.
- `science-ouverte` contient aussi des requêtes média brutes (`"@media (min-width: 900px)"`).

**Exemples représentatifs**
- Tableaux (23 fois) :
  ```jsx
  <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
  ```
  et `<TableContainer component={Paper}><Table sx={{ minWidth: 650 }} aria-label="simple table">`.
- Responsive :
  ```jsx
  <Section sx={{ paddingRight: {lg: '5rem !important', xl: '4rem !important'} }}>
  ```
  (×3 : `accessibilite-web`, `conditions-utilisation`, `service-accessibilite`) ; `index.mdx:63` : `sx={{ pt: { xs: '40px', md: '48px', lg: '64px' } }}`.
- Callback complexe (`index.mdx:72`) :
  ```js
  sx={(theme) => ({ display:'grid', gridTemplateColumns:{xs:'1fr',sm:'1fr 1fr'}, '& > *':{ transition:`flex-grow ${theme.transitions.duration.md3.medium1}ms ${theme.transitions.easing.md3.emphasized}` }, [theme.breakpoints.up('lg')]:{ display:'flex', '& > *:hover, & > *:focus-within':{ flexGrow:1.15 } } })}
  ```
- Callback avec thème (`nos-collections-speciales:177`) :
  ```js
  sx={theme=>({ borderRadius: theme.shape.corner.medium, border: `3px solid ${theme.palette.rougeOrange.main}` })}
  ```
- Valeurs MUI (`mission-vision-valeur`, ×4) : `sx={{ p:2, bgcolor:'#FEE1DE', borderRadius:'1rem', height:'100%' }}`.

**`style={{…}}` en plus : 260 occurrences dans 39 fichiers.**
- `<p style={{marginTop:"1em"}}>` et `<ul style={{ marginLeft: "1em" }}>` dans toutes les fiches de bibliothèques.
- Listes d'icônes : `<ul style={{listStyleType:"none",paddingLeft:0}}><li style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>` dans 7 pages « prêt ».
- `<Button style={{backgroundColor:'#fff', color:'var(--bib-palette-text-primary)'}}>` dans `espaces`.

**Props des composants maison** (base de la correspondance vers les composants Astro) :

| Composant | Occurrences | Props |
|---|---|---|
| Section | 110 | `bg`×50, `sx`×12, `marginTop`×5, `image={}`×3, `fixedWidth`, `id` |
| Button | 83 | `href`×78, `primary`×49, `secondary`×17, `variant`/`color`/`size`/`className`×4, `light`, `foncé` (attribut accentué, `reserve.mdx`) |
| CardWithIcon | 56 | `title`, `Icon={}`×55, `href`, `moreText`×41, `color`×23, `small`×19, `fullWidth`×4 |
| RichListItemWithLink | 52 | `title`, `description`, `href`, `color`×17, `linkText`×9 |
| Accordion / AccordionSummary / AccordionDetails | 37 / 36 / 36 | `defaultExpanded`×3, `sx` ; AccordionGroup ×8 (`color`) |
| FlipCardWithImage | 34 | `title`, `Image={}`, `small`×9, `subtitle`×9 |
| Nombre | 29 | `number`, `label` |
| FlipCardWithBg | 26 | `title`, `Icon={}`, `bg`×13 |
| CardWithImage | 24 | `title`, `Image={}`, `href`, `moreText` |
| Carousel1 | 20 | `title={<Typography…>}`×17, `description` (chaîne ×9, JSX ×9), `moreLink`×6, `moreText`×5 |
| SuperHero2 | 16 | `title`, `imageName`, `size="small"`×7, `subTitle` |
| HeroWithImage | 13 | `Image={}`, `imageWidth`, `imageHeight`, `footer={<Button…>}`×12, `align`×8 |
| Card2 | 12 | `title`, `Icon={}`, `href` |
| IconInSquare | 10 | `color`, `icon={<XIcon color='bleuPrincipal'/>}` |
| HeroWithText / HeroWithText2 | 9 / 6 | `leftColl={}`, `rightColl={}`, `rightFooter`/`leftFooter` |
| Liste | 8 | `variant`×5 |
| Tabs1 | 4 | `tabs={[...]}` |

- Valeurs de `Section bg` : bleu100 15, vertFonce 13, rose300 7, bleu200 4, bleu600 3, bleuPrincipal 2, violetFonce, jaunePale, rose500, jaune, rose100, vertPale.
- Icônes passées en composant :
  - `Prop={XIcon}` : CardWithIcon 55, Link 36, FlipCardWithBg 25, Card2 10. En Astro, ce sera probablement un nom d'icône en chaîne.
  - `Link` reçoit aussi `Icon` booléen ×29, qui affiche une flèche ArrowRight.
- 53 icônes Phosphor sont écrites directement en JSX, avec `size={32|50|24}` et `color="BleuFonce"` ×28 (**couleur CSS invalide**), `'#f04e24'`, `'#0057AC'` ou `"var(--bleuPrincipal)"`.

## 5. Syntaxe MDX particulière

**Version :** MDX 2 (`plugins/gatsby-plugin-mdx` 5.14.0-next.2 avec `@mdx-js/mdx ^2.3.0`). Remarques actives : `gatsby-remark-autolink-headers` (h2 à h4, `removeAccents`, ancres générées automatiquement) et `gatsby-remark-images` (maxWidth 1200).

**`export` : 6 dans 5 fichiers**
- `accessibilite-web.mdx` : `export const IconLabel = ({icon,label,ariaLabel}) => (<div …>{React.cloneElement(icon,{…})}</div>)`. `React` est global (`gatsby-plugin-provide-react`).
- `nous-joindre/clavarder.mdx` : `export function WidgetClavardage(){ useEffect(()=>{ document.createElement('script')… }) }` (LibChat).
- `a-propos/carriere/index.mdx` : `export const logos = [{src: Meilleur, alt}]`, puis `{logos.map(...)}` avec Grid v1.
- `nous-soutenir/fonds-livres-rares.mdx` : `export const images = [{src, alt, caption}]`, puis `.map` vers `<Box component="figure">`.
- `nos-collections-speciales.mdx` : `export const collections = [{title, description, Image}]` (12 entrées) et `export const CollectionsDisplay = () => { useTheme(); useMediaQuery(theme.breakpoints.up('md')) … }`.

**Expressions et JSX imbriqué**
- `.map(` : 3 fichiers.
- JSX passé en prop (`prop={<X/>}`) : 57 occurrences dans 13 fichiers, par exemple `footer={<Button…/>}` et `title={<Typography…/>}`.
- Fragments `<>` : 103 dans 33 fichiers.
- Commentaires JSX `{/* */}` : 68 dans 6 fichiers, dont la plupart dans `science-ouverte`.
- `{' '}` : 6 occurrences.
- Gabarits avec backticks : 78, surtout dans les `sx`.
- Aucun commentaire HTML `<!--` (interdit en MDX 2).
- Les fiches de bibliothèques sont des props JSX de plusieurs lignes : `blocAdresse={<><p>…</p></>}`.
- Du markdown indenté dans du JSX (`  ## Quoi de neuf`) : 19 titres dans 6 fichiers, dont `index.mdx`. Les blocs de code indentés étant désactivés en MDX, ces titres restent des titres.

**HTML brut**
- Nombre de balises : `p` 337, `li` 327, `ul` 106, `img` 39 (9 fichiers), `a` 24, `br` 19 (toujours `<br/>`), `div` 10, `h4` 6, un tableau `<table><thead><tbody><tr><th><td>` dans un seul fichier, `svg/rect/path` 1. `className` 4, aucun `class=`.
- Éléments personnalisés : `<bib-consent>`, `<bib-clarity>`, `<bib-consent-server>` (dev seulement).
- Scripts : `<Script type="module" src=…>` (gatsby) ×4 en dev ; `<RemountingScript containerId src>` ×5 (formulaires LibWizard et widget UneQuestion de `nous-ecrire`, `suggestion-achat`, `formulaire-reserve`, plus 2 en dev).

**Markdown**
- Titres : 262 (`##` 63, `###` 108, `####` 60), y compris dans le JSX.
- Listes à puces : 354 ; listes numérotées : 37 ; gras `**` : 49.
- **Aucun tableau markdown.** Les tableaux passent par MUI Table (10 fichiers) ou un `<table>` brut (1 fichier).
- **Une seule image markdown** : `service-accessibilite.mdx:175`, `![Salle multisensotielle](../../src/images/service-accessibilite/salle-multisensorielle-BLSH.jpg)`, qui pointe vers `src/`.
- 161 liens markdown, plus 204 `<Link to>` et 227 `href=`. Répartition des `Link to` : http 69, mailto 60, `../` 28, `/` 21, tel 9, `#` 8, `./` 2, nus 5.

**Liens internes relatifs (134 cibles internes distinctes) — point sensible**
- `<Link>` utilise `resolve()` de `@reach/router` : **la page courante est toujours traitée comme un dossier**.
- Un lien markdown devient un `<a>` simple (intercepté par `gatsby-plugin-catch-links`), résolu par le navigateur. Le résultat dépend donc de la barre oblique finale (`trailingSlash: 'ignore'`).

*Liens corrects quand la page est traitée comme un dossier :*
- Depuis les fiches de bibliothèques (rendues dans `/espaces/` et `/nous-joindre/`) et `horaires.mdx` : `../nous-joindre/notre-equipe/#<id>`.
- `enseignement/index` et `etudes/index` : `../recherche`, `../etudes`, `../espaces/`, `../nous-joindre/...`.
- `obtenir/peb/index` : `../frais-avis`, `../../nous-joindre/#services`.
- `pret-renouvellement-retour/index` : `./diplomes`, `../../enseignement/reserve`, `../grille-tarifs.pdf`, et les liens nus `pbuq`, `cegeps`, `banq-universites-canadiennes`, `grand-public`, `communaute-udem/`.
- Autres liens nus : `formations-cours`, `reserve`, `kerko`, `financement-monographie`, `science-ouverte`, `service-accessibilite` (`index.mdx:110`, qui donne `/service-accessibilite`), `](stephanie-gagnon)`.

*Liens écrits pour une page traitée comme un fichier (cassés avec la barre oblique finale) :*
- `../pret-renouvellement-retour/#exceptions-au-renouvellement-automatique`, dans diplomes, droit-accorde, grand-public, pbuq et banq-universites-canadiennes. Avec la barre finale, on obtient `/obtenir/pret-renouvellement-retour/pret-renouvellement-retour/`.
- `communaute-udem/ententes-cegeps` → `../cegeps`.

*Recommandation :* le script devrait **réécrire tous les liens relatifs en chemins absolus**, avec une table de résolution vérifiée à la main pour ces quelques cas.

*PDF dans `static/` :* 28 liens dans 17 fichiers, par exemple `./Aff_bibliothecaire_0127_0210.pdf` depuis `/a-propos/carriere/`. Tous ceux vérifiés existent.

**Ancres**
- Aucun `{#id}` ; 56 `id=` explicites dans 29 fichiers.
- Ancres générées : `#soutien-aux-revues--diamant-` (double tiret), `#soutien-aux-ressources-educatives-libres-rel`, `#salle-adaptee-a-la-bibliotheque-hubert-reeves`. L'algorithme de slug de rehype-slug ou github-slugger devra produire exactement les mêmes, accents retirés.

**Coquilles de liens repérées**
- `to="mailto7077duParc@…"` (`antenne-paramedicale`).
- `to="mailto=pret-kinesiologie@…"` et `to="sante@bib…"` (`ki.mdx`, `horaires.mdx`).
- `href="#"` en production dans `science-ouverte` et `ss.mdx`.

## 6. `content/bibliotheques` et `content/personnel`

**Bibliothèques**
- 19 fiches, sans frontmatter. Chacune contient 3 imports (FicheBibliotheque, ArrowSquareOutIcon, PersonSimpleCircleIcon inutilisé) et un seul `<FicheBibliotheque … ></FicheBibliotheque>` vide.
- Props : `title`, `id` (ancre), `codeBib` (optionnel), `blocEspaces` (`{false}` dans 7 fiches, `<ul><li><Link/>`, ou `<Alert>`), `blocAdresse` (fragment de `<p>`), `blocNousJoindre` (absent pour jardinb, Brossard et Place-Dupuis). Des enfants libres existent dans conservation et marcel-laurin (`<Alert>`, `<p>`).
- Codes et ids : am/amenagement, antenne-paramedicale/parc, conservation, cs/lrcs, dr/droit, ed/tgd, ki/kinesiologie, laval, marcel-laurin, mi/math-info, mu/musique, mv/medecine-veterinaire, pa/marguerite-d-youville, sa/sante, sciences/**Hubert-reeves** (majuscule), ss/lsh. Sans `codeBib` : jardin-botanique, brossard, place-dupuis.
- `bibliotheques.mdx` assemble les fiches dans `<FichesBibliotheques>` (un GridOffset et un Box en colonne).
- Rendu de chaque fiche : un accordéon MUI.
  - Il s'ouvre si `location.hash === #id`.
  - L'horaire du jour s'affiche via `HoraireAujourdhui codeBib` (SWR sur l'API horaires, correspondance dans `src/components/CarteHoraires/points-de-service.json`).
  - Les blocs Espaces, Adresse et Nous joindre sont rendus avec les icônes Door, MapTrifold et Users.
  - L'image est `content/bibliotheques/images/<codeBib>.*` (GatsbyImage), masquée sur petit écran. Il y a 14 images ; il en manque pour mv, marcel-laurin et les 3 points de service.
- Les métadonnées sont dupliquées dans `src/utils/bibliotheques.js` (17 entrées `{id, titre, autreTitre}`), qui sert à la recherche et au répertoire du personnel.
- **`horaires.mdx` (674 lignes) recopie à la main les adresses et contacts de 16 fiches**, via `TitleHoraireBib` + `HorairesHorizontalTabs codeBib` + `HoraireBibNoTitle` + `FicheBibliothequeNoTitle`.
- C'est un bon candidat pour une collection de données JSON ou YAML, à la place du MDX.

**Personnel (`liste-personnel.xlsx`, feuille `Sheet1`, 141 lignes)**

| Colonne | Remplie | Distincte | Remarque |
|---|---|---|---|
| `nom` | 141 | | |
| `prenom` | 141 | | |
| `photo` | 112 | | Nom de fichier, mis en correspondance **sans extension** (`myriam-boyer` n'en a pas et fonctionne quand même). |
| `fonction` | 141 | 22 | Valeurs sales : espaces finales (`'Bibliothécaire '`), `'BIbliothécaire'`. |
| `direction` | 68 | 13 | Doubles espaces qui créent des doublons. |
| `disciplines` | 70 | | Texte libre. |
| `bibliotheque` | 130 | 38 | **Multivaleur séparée par `;` ou `|`** ; le séparateur et les espaces varient. |
| `telephone` | 129 | | Chaîne, par exemple `514 343-6111, poste 3585`. |
| `courriel` | 140 | | |
| `teams` | 140 | | URL. |

- Photos : `content/personnel/photos/` contient 119 jpg (23 Mo). 59 font 500×500 ; environ 50 font 2400×1600 ou 1600×2400.
- `_profile.jpg` sert d'image par défaut. 7 photos ne sont référencées par personne (christiane-melancon, eve-baribeau-marchand, eve-paquette-bigras, julia-genereux-randall, marie-helene-vezina, noemie-charest-bourbon, plus `_profile`).
- Affichage :
  - `RepertoirePersonnel.jsx` (463 lignes) : recherche normalisée, filtres discipline et bibliothèque, hash `#<id bib>` mis en correspondance avec `bibliotheques.js`, préremplissage par `?q=`.
  - `FichePersonnel.jsx` : autocomplete par discipline et bouton Teams.
  - Pages : `/nous-joindre/notre-equipe/`, `/personnel/` et `/fiche-personnel/`.

**Revue de presse (`articles.json`)**
- Tableau de 8 objets `{title, date: "AAAA-MM-JJ", source, url}`, plus un `lang` optionnel (défaut `fr`).
- Importé directement par `src/components/Nouvelles/useNouvelles.js`, puis fusionné et trié avec les nouvelles `type: interne`.
- Non suivi par git.

## 7. Images

**Inventaire :** 299 images matricielles et 1 SVG, soit 150 jpg, 108 webp, 39 png, 1 JPEG, 1 avif et 1 svg.
- Volumes : pages 36 Mo, nouvelles 23 Mo, bibliothèques 8,1 Mo, personnel 23 Mo.
- Plus grand côté : 16 images au-delà de 2400 px, 114 entre 1601 et 2400, 42 entre 801 et 1600, 127 à 800 ou moins.

**Images de plus de 1 Mo**

| Taille | Fichier |
|---|---|
| **21 Mo** | `nouvelles/2026/images/bourses-blrcs.jpg` (6016×4016) |
| 2,9 Mo | `pages/images/collspec/Incunable-Koberger.png` |
| 2,4 Mo | `collspec/ArtAmenagement-Viollet-le-Duc.png` |
| 2,3 Mo | `collspec/Fac-Similes-Nuremberg.png` |
| 2,0 Mo | `collspec/collection-speciale-lettres-sciences-humaines.png` |
| 1,7 Mo | `pages/images/salle-travail-equipe_MY.png` |
| 1,7 Mo | `collspec/education-Villeneuve.png` |
| 1,3 Mo | `collspec/CarteGeo_Sanson.png` |

**Images de plus de 2400 px** (hors bourses-blrcs) :
- `engagements/images/github.png` et `creative-commons.png` : 3840×2160.
- `images/espace-innovation-creativite.webp` et `decoupeuse-vinyle.webp` : 3024×2016.
- `super-heroes/etudes.webp`, `super-heroes/engagements.webp`, `images/art-textile.webp`, `dev/components/section/engagement-accueil.webp` : 3000×2002.
- `images/jeux-societe.webp` : 2002×3000.
- `super-heroes/horaire.webp` : 2997×1703.
- `engagements/images/open-library-of-humanities-journal.png` : 2950×900.
- `images/math-info-*.webp` (3 fichiers) : 2862×1908.
- `images/lrcs-perrault.webp` : 2469×1646.

**Emplacements**
- `content/pages/images/` (+ `collspec/`, `a-propos/nos-collections/`, `campus-st-hyacinthe/`, `super-heroes/` : 12 images pour `imageName`, dont accueil.jpg et default.jpg).
- `content/pages/engagements/images/` : 17 logos png.
- Images à côté des pages de dev (`img1.webp`, `image1.jpg`…).
- `content/nouvelles/{2025,2026}/images/`, `content/bibliotheques/images/`, `content/personnel/photos/`.

**Manières de référencer une image**
1. **Import ES dans le MDX** (132 imports dans 22 fichiers). La variable sert de chaîne d'URL : `img.src` ×38, `FlipCardWithImage.Image` ×33, `CardWithImage.Image` ×23, `HeroWithImage.Image` ×12, `Section.image` ×3, `CardMedia.image` ×1, plus des tableaux exportés (`{src: X}`, `Image: X`) avec `<Box component="img" src>`. **En Astro, un import d'image donne un `ImageMetadata`, pas une chaîne** : il faudra `.src` ou `<Image>`.
2. **Chemins d'import**
   - Relatifs : `../images/x.webp` (le plus courant), `./images/…`, `../../images/collspec/…`.
   - Absolus depuis la racine du projet : `'/content/pages/images/2025-meilleur-employeur.png'` dans `carriere`. Webpack les résout depuis la racine, comme Vite.
   - Erreurs de nom : `placheEquilibre` pour `planche-equilibre.webp`, et `tapis-anti-fatique` pour « fatigue ».
3. **Par nom, via GraphQL**
   - `imageName` de `superHero` et de `SuperHero2` : default 6, accueil, horaire, horaires-bib, espaces 2, engagements, enseignement, etudes, noussoutenir, obtenir, recherche.
   - `newsImage.name` : cherché dans toutes les années de `nouvelles/*/images`.
   - `codeBib` : `bibliotheques/images`.
   - `photo` : personnel.
4. **Une image markdown** pointant vers `src/images/…`.

**Problèmes à gérer**
- Fichier `UdeM-Bibliothèques-38.jpg` avec un accent, non référencé.
- Extension `antenne-paramedicale.JPEG` en majuscules.
- Image en avif (`2025-11-12-magie-sorcellerie.avif`).
- Une quinzaine d'images ne semblent référencées nulle part (estimation par nom) : techno-montage, echecs, mobilier-actif, cabines, travail-actif, terre-hommes, lsh-atelier-zines, livre-d-heure, bib-vivantes-logo(-texte).png, `images/education-Villeneuve.webp`, `campus-st-hyacinthe/salle-multifonctionnelle-2.jpg`, `engagements/bib-vivantes-carre-1000.svg`.

## 8. Pages à risque (top 15)

| # | Fichier (`content/pages/…`) | Lignes | Balises de composants | sx | style | Ce qui complique la conversion |
|---|---|---|---|---|---|---|
| 1 | `engagements/science-ouverte.mdx` | 2307 (68 ko) | 230 | **159** | 78 | CSS grid complexe (`gridTemplateColumns`, `gridArea`), `@media` bruts, hex violets/lilas, `theme =>`, 24 imports png, 29 `<Nombre>` à valeurs factices (`[Nombre]`), `href="#"`, composants ScienceOuverte (Timeline, DialogueHorizontalTabs), 39 `<img>`. **`noindex: true`, page en chantier** : à porter à la main ou à reporter. |
| 2 | `horaires.mdx` | 674 | 148 | 0 | 60 | 16 blocs `HorairesHorizontalTabs` + `FicheBibliothequeNoTitle` qui dupliquent les données des fiches, 221 balises HTML, liens relatifs `../nous-joindre/…`, liens mailto cassés. À convertir en données. |
| 3 | `recherche/index.mdx` | 512 | 119 (23 types) | 12 | 0 | 34 imports (31 icônes, dont 8 inutilisées), Carousel1 avec `title={<Typography/>}`, CardWithIcon `Icon={}`, HeroWithImage `footer={}`, ancres vers `/recherche/diffuser/#…`. |
| 4 | `enseignement/index.mdx` | 370 | 84 (20) | 9 | 0 | 23 imports, Carousels, FlipCardWithBg, HeroWithText (`leftColl`/`rightColl`), liens nus (`formations-cours`, `reserve`). |
| 5 | `engagements/index.mdx` | 365 | 92 (19) | 3 | 0 | 20 imports, Carousel1 avec description en fragment de plusieurs Typography, FlipCardWithBg, GridOffset, `href="science-ouverte"`. |
| 6 | `espaces/index.mdx` | 467 | 76 | 2 | 6 | 38 imports (environ 30 webp), plus de 33 FlipCardWithImage avec `Image={}` et `small`, Button avec `style` en dur, import de `bibliotheques.mdx` (fiches en accordéon). |
| 7 | `a-propos/mission-vision-valeur.mdx` | 290 | 59 | 10 | 0 | Grid2 imbriqués sur 3 niveaux (`size="grow"`/`"auto"`), Box `bgcolor:'#FEE1DE'`, IconInSquare `icon={<X color='bleuPrincipal'/>}`, 47 balises HTML. |
| 8 | `a-propos/nos-collections/nos-collections-speciales.mdx` | 218 | 17 | 7 | 0 | **2 exports** (tableau de 12 collections + composant avec hooks `useTheme`/`useMediaQuery`), Card/CardMedia/CardActions MUI, `sx` avec `theme =>`, 15 images (png lourds). |
| 9 | `index.mdx` (accueil) | 216 | 43 | 7 | 0 | SuperHero avec `subTitle={<>…</>}` et enfant `RechercheSofiaAccueil`, `QuoiDeNeuf onglets={[…]}` (composant tout juste ajouté, non suivi par git), Box en grid avec `theme.transitions` et sélecteurs `:hover`/`:focus-within`, `href="service-accessibilite"`. |
| 10 | `obtenir/pret-renouvellement-retour/communaute-udem/index.mdx` | 111 | 45 | 2 | 5 | MUI Table (41 balises MUI), listes d'icônes avec `color="BleuFonce"`. |
| 11 | `nous-soutenir/index.mdx` | 170 | 49 (14) | 1 | 0 | 11 imports, liens `./politique-dons…pdf` et `./fonds-livres-rares`. |
| 12 | `nous-joindre/index.mdx` | 118 | 36 (15) | 4 | 5 | Import de `bibliotheques.mdx`, liens `../nous-joindre/…` (auto-référents). |
| 13 | `nous-soutenir/fonds-livres-rares.mdx` | 133 | 11 | 5 | 2 | Export `images` + `.map`, `<Box component="figure">` avec `@media`, `sx` avec `theme.breakpoints`, `paddingRight:'4rem!important'`. |
| 14 | `obtenir/peb/peb-institutions-externes.mdx` et `ill-external-libraries.mdx` | 151 / 137 | 36 | 2 | 0 | Grosses MUI Table (36 balises MUI). Import `Liste` inutilisé. Page en anglais (`ill-external-libraries`). |
| 15 | Pages « prêt » : `diplomes`, `pbuq`, `banq-universites-canadiennes`, `droit-accorde`, `grand-public`, `cegeps` | 70 à 88 | environ 20 | 4 ou 5 | 5 | Même gabarit répété 6 fois : 7 imports Table/Paper + 4 icônes, listes stylées, `TableRow sx='&:last-child'`, **lien relatif `../pret-renouvellement-retour/#…` ambigu**, `pbuq` avec une indentation de 25 espaces. Facile à automatiser par motif. |

**À porter à part (hors top 15)**
- `accessibilite-web.mdx` : export `IconLabel` avec `React.cloneElement` et svg importés comme composants.
- `nous-joindre/clavarder.mdx` : export avec `useEffect`/`document` et Grid v1.
- `a-propos/carriere/index.mdx` : export, `.map` et Grid v1.
- `fiche-personnel.mdx` : Button MUI et Grid `md=`.
- Les 5 pages avec `RemountingScript` (scripts tiers à réexécuter à chaque montage).

**Pages simples (aucune balise JSX, 14 fichiers)** : convertibles telles quelles. Ce sont notamment `bourse-Bazin`, `heures-ouverture-blsh`, `affichage-premiers-peuples`, `nos-collections/index`, `ateliers-wiki`, `formations-cours`, `frais-avis`, `peb/index`, `carte-pbuq`, `ententes-cegeps` et `reproduction-theses-memoires`.
