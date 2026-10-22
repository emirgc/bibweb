# Inventaire technique : coquille et plomberie de coquille-web (Gatsby 5 + MUI 6)

Racine : `/Users/emir/Documents/git/coquille-web`. Je n'ai rien modifié. Tes changements non commités sur la branche `feature/quoi-de-neuf-revue-de-presse` sont intacts.

**Trois constats à connaître avant de lire la suite :**
- **Le thème ne varie pas selon le niveau de page.** Un seul thème MUI est appliqué partout. Le niveau ne change que la mise en page des templates.
- **Le `slug:` du frontmatter est ignoré pour `content/pages`** (bogue, détaillé en 2.1). Il est respecté pour les nouvelles.
- **Le rendu serveur produit toujours la variante desktop.** Les `useMediaQuery` sont à `false` au SSR, et la version mobile n'apparaît qu'après hydratation (détails en 5.0).

---

## 1. `gatsby-config.mjs`

### Environnement et robots
- `siteUrl = 'https://bib.umontreal.ca'`.
- La branche git est lue avec `execSync('git rev-parse --abbrev-ref HEAD')` (`null` en cas d'erreur).
- Calcul de l'environnement : `robotsEnv = SITE_ENV || (branch==='production' ? 'production' : branch ? 'preprod' : NODE_ENV)`.
  - Sans git ni `SITE_ENV`, la valeur est `NODE_ENV`, soit `production` au build.
- `dotenv/config` est chargé.
- Les ID suivants sont **commentés, donc inactifs** :
  - `GOOGLE_ANALYTICS_ID = 'G-V8J6YFFD4F'`, plugin `gatsby-plugin-google-gtag` avec `{ head: true, respectDNT: true }` ;
  - `CLARITY_PROJECT_ID = 't10hsivmt0'`, plugin `gatsby-plugin-clarity` avec `enable_on_dev_env: false`.
  - En pratique, l'analytique passe par les web components `<bib-gtm>` et `<bib-clarity>` (voir 5.9).

### Réglages généraux
- **siteMetadata** :
  - `title: 'Les bibliothèques / UdeM'`
  - `description: "Site Web des Bibliothèques de l'Université de Montréal"`
  - `twitterUsername: '@bibUdeM'`
  - `image: '/images/logo-udem-bib.png'` (fichier dans `static/images`)
  - `siteUrl`
- `trailingSlash: 'ignore'`.
- `flags: {}` (`DEV_SSR` commenté).
- Export `shouldUpdateScroll` : renvoie `false` s'il y a `location.hash`, sinon `[0,0]`.
- `gatsby-browser.mjs` contient la même fonction `shouldUpdateScroll`.

### Plugins, dans l'ordre
1. **`gatsby-plugin-provide-react`** : JSX sans `import React`.
2. **`gatsby-plugin-mdx`** : fork local (`plugins/gatsby-plugin-mdx`, v5.14.0-next.2), `extensions: ['.mdx']`.
   - `gatsby-remark-autolink-headers` : `elements ['h2','h3','h4']`, icône SVG Phosphor « link » (viewBox 0 0 256 256, `fill=currentColor`, `aria-hidden`), `maintainCase:false`, `removeAccents:true`. Il injecte aussi un script inline qui fait défiler vers le hash au `DOMContentLoaded`.
   - `gatsby-remark-images` : `maxWidth 1200`, `linkImagesToOriginal false`, `withWebp true`.
   - Le fork applique `remark-unwrap-images` par défaut.
   - Son `onCreatePage` injecte le **frontmatter brut** (gray-matter) dans `pageContext.frontmatter`. Les dates y deviennent des chaînes ISO `…T00:00:00.000Z`.
3. **`gatsby-plugin-catch-links`** : navigation client sur les `<a href>` internes.
4. **`gatsby-plugin-alias-imports`** : `@/components`, `@/hooks`, `@/icons`, `@/images`, `@/utils` → `src/*`.
5. **`gatsby-source-filesystem`** (six instances) :

   | nom | chemin | ignore |
   |---|---|---|
   | `pages` | `content/pages` | `**/super-heroes` |
   | `images` | `src/images` | `**/super-heroes` (`__key: 'images'`) |
   | `super-heroes` | `content/pages/images/super-heroes` | — |
   | `nouvelles` | `content/nouvelles` | — |
   | `personnel` | `content/personnel` | `**/~$*` |
   | `bibliotheques` | `content/bibliotheques` | — |

   - `content/revue-de-presse/articles.json` n'est **pas** une source : il est importé directement par `src/components/Nouvelles/useNouvelles.js`.
6. **`gatsby-plugin-sharp`**, défauts : `formats ['webp','jpg']`, `placeholder 'blurred'`, `quality 80`, `breakpoints [600,900,1200,1536]`, `backgroundColor 'transparent'`.
7. **Plugins sans options** : `gatsby-transformer-sharp`, `gatsby-plugin-image`, `gatsby-transformer-excel` (le xlsx du personnel donne `allListePersonnelXlsxSheet1`), `gatsby-plugin-react-svg` (un `import X from '*.svg'` donne un composant React), `gatsby-plugin-postcss`.
   - `.postcssrc.cjs` : `postcss-preset-env({ stage: 0 })`, qui active le nesting utilisé dans `links.css`.
   - `.browserslistrc` : `>0.25%, not dead`.
8. **`gatsby-plugin-sitemap`** :
   - `excludes: ['/dev','/dev/**','/tests','/tests/**','/formulaire-consentement','/formulaire-consentement/**','/horaires/test','/horaires/test/**']`.
   - Le sitemap ne respecte **pas** `noindex`. Exemple : `/formulaire-consentement-inscription/` y figure, car le motif ne le couvre pas. `/engagements/science-ouverte/` y figure aussi, de même que `/fiche-personnel/` et `/widget-horaire/`.
   - Sortie : `sitemap-index.xml` + `sitemap-0.xml` (76 URL).
9. **`gatsby-plugin-manifest`** : seulement `icon: 'src/images/logo-bib/logo-bib-icon.svg'`.
   - Il génère `/favicon.svg`, `/favicon-32x32.png`, `icons/icon-{48,72,96,144,192,256,384,512}.png`, les `apple-touch-icon` et `manifest.webmanifest`.
   - Le manifeste ne contient que les icônes (ni nom, ni couleurs).
10. **`gatsby-plugin-bib-secondary-nav`** (local, voir section 4).
11. **`gatsby-plugin-webfonts`** :
    - `google2` : `Figtree` (`axes 'wght@300..700'`) et `Lora` (`axes 'wght@400..700'`) ; `formats: ['woff2']`.
    - Polices auto-hébergées sous `/static/webfonts/s/figtree/v9/…` et `/static/webfonts/s/lora/v37/…`.
    - `<link rel=preload as=font>` pour chaque fichier, `@font-face` inline avec `font-display: swap`, style `normal` seulement (pas d'italique).
12. **`gatsby-plugin-breadcrumb`** :
    - `useAutoGen: true`, `autoGenHomeLabel: 'Accueil'`.
    - `exclude: ['**/dev-404-page/**','**/404/**','**/404.html','**/offline-plugin-app-shell-fallback/**']`, `excludeOptions: { separator: '.' }`.
    - `crumbLabelUpdates: [{ pathname: '/book', crumbLabel: 'Books' }]` (vestige).
    - `trailingSlashes` non activé.
    - Algorithme :
      - pour chaque segment non vide du `page.path`, `acc += '/'+segment` ;
      - un maillon `{ pathname: acc (sans slash final), crumbLabel: segment brut }` ;
      - le premier maillon vaut `{ pathname:'/', crumbLabel:'Accueil' }`.
    - Résultat injecté dans `pageContext.breadcrumb = { location, crumbs }`.
13. **`gatsby-plugin-bib-theme`** (local, voir section 3).
14. **`gatsby-plugin-robots-txt`** avec `resolveEnv: () => robotsEnv` :
    - `production` : `policy [{ userAgent:'*', allow:'/', disallow:['/consent/'] }]`. Le plugin ajoute par défaut `Host` et `Sitemap` (`siteUrl/sitemap-index.xml`).
    - `preprod` : `policy [{ userAgent:'*', disallow:['/'] }]`, `sitemap: null`, `host: null`.
    - Le `public/robots.txt` actuel contient `Disallow: /`, puisque tu es sur une branche feature.

---

## 2. `gatsby-node.mjs`

### 2.0 Hooks exportés
- `createSchemaCustomization` : `type MdxFrontmatter { crumbLabel: String }`.
- `onCreateWebpackConfig` :
  - `build-javascript` : `devtool: false`, sauf si `BUILD_SOURCEMAPS` est défini.
  - `develop` et `develop-html` : ajoute `splitChunks.cacheGroups.devShared = { chunks:'async', minChunks:2, name:'dev-shared', priority:20, reuseExistingChunk:true, enforce:true, test: m => m.type !== 'css/mini-extract' }`, puis `replaceWebpackConfig`. Ce réglage est sans objet pour Astro.
- `createPages` exécute, dans l'ordre :
  1. `doCreatePages` ;
  2. `doCreateNouvelles` ;
  3. `indexBibliotheques()` ;
  4. `doIndexPersonnel` ;
  5. `writeSearchIndex` ;
  6. `writeCrumbLabels`.
- Pas d'`onPostBuild`. Les fichiers sont écrits directement dans `public/`, ce qui les rend aussi disponibles en dev.

### 2.1 Pages de `content/pages`
- Requête : `allFile(sourceInstanceName "pages", extension "mdx")`.
  - Champs lus : `id`, `name`, `relativeDirectory`, `absolutePath` et `childMdx{ frontmatter{ slug title template noindex crumbLabel secondaryNav{hidden title order} } body }`.
- Choix du template :
  - si `relativeDirectory.startsWith('nouvelles/')`, template `'nouvelle'` (branche morte : aucun dossier `content/pages/nouvelles/` n'existe) ;
  - sinon `frontmatter.template` ;
  - avec une valeur, résolution vers `src/templates/${Majuscule initiale}${reste}Template.jsx` (`doc` → `DocTemplate.jsx`, `blank` → `BlankTemplate.jsx`) ;
  - sans valeur, `PageTemplate.jsx`.
- Calcul de l'URL :
  ```js
  basePath = relativeDirectory ? `/${relativeDirectory}` : ''
  slugPart = (node.frontmatter?.slug ?? slugify(node.name)).replace(/index$/i, '')
  path = `${basePath}/${slugPart}`.replace(/\/+$/, '') + '/'
  ```
  - **Bogue à reproduire ou corriger sciemment** : `node.frontmatter` n'existe pas (le nœud est un `File`). Le `slug:` du frontmatter est donc toujours ignoré : l'URL vient de `slugify(nom de fichier)` (`@sindresorhus/slugify`, minuscules, sans accents).
  - Exemple : `recherche/diffuser/financement-monographie.mdx` a `slug: financement-monographies-savantes-udem`, mais l'URL réelle est `/recherche/diffuser/financement-monographie/`.
  - `relativeDirectory` n'est **pas** slugifié.
  - `index.mdx` donne le dossier avec slash, `/` pour la racine.
- `createPage({ path, component: `${template}?__contentFilePath=${absolutePath}`, context: { id, lvl: getPageLevel(path) } })`.
- `getPageLevel(path) = path.split('/').filter(Boolean).length` : `/` = 0, `/obtenir/` = 1, `/obtenir/peb/` = 2, etc.

### 2.2 Nouvelles de `content/nouvelles/AAAA/*.mdx`
- Mêmes champs, plus : `authors`, `date(formatString:"LL", locale:"fr")`, `newsImage{name alt legend source}`, `newsUrl`, `source`, `type`.
- Template : `frontmatter.template` s'il existe (même résolution), sinon `NouvelleTemplate.jsx`.
- URL :
  ```js
  basePath = relativeDirectory ? `/nouvelles/${relativeDirectory}` : '/nouvelles'
  rawSlug = (childMdx.frontmatter.slug ?? slugify(name)).replace(/index$/i, '')
  path = `${basePath}/${rawSlug}`.replace(/\/+$/, '') + '/'
  ```
  - Ici le slug du frontmatter **est** utilisé, **casse conservée** : `/nouvelles/2026/travaux-bibliotheque-LSH/`.
  - **Collision actuelle** : `2025/heures-ouverture-blsh.mdx` et `2025/bourse-Bazin.mdx` ont le même slug (`remise-bourse-genevieve-bazin-…`). La dernière créée gagne.
- `context: { id, lvl }`, avec `lvl = 3` pour une nouvelle.

### 2.3 `crumbLabel`, écrit dans `public/crumb-labels.json`
- Pour chaque page et nouvelle qui a `frontmatter.crumbLabel` : `crumbLabelOverrides[stripTrailingSlash(path)] = crumbLabel`.
  - `stripTrailingSlash = p.replace(/\/+$/,'') || '/'`.
- Format : objet plat `{ "/obtenir": "Obtenir", "/obtenir/peb": "Prêt entre bibliothèques", … }` (49 entrées actuellement).
- Il est lu au rendu, client et SSR, par `Breadcrumbs.jsx` via un `import` du JSON depuis `public/`.

### 2.4 Index de recherche interne, écrit dans `public/search-index.json`
- Format : tableau JSON plat d'objets `{ title, excerpt, url, section }`.
- Volume actuel : 229 entrées (Pages 54, Nouvelles 17, Bibliothèques 17, Personnel 141), 51 Ko.
- **Section « Pages » et « Nouvelles »** : alimentée pendant `createPage`, avec le même `path`.
  - Condition : `title` présent et `!isSearchExcluded(node)`.
  - `isSearchExcluded` est vrai si l'une de ces conditions est remplie :
    - `relativeDirectory` vaut `dev` ou `consent`, ou commence par `dev/` ou `consent/` ;
    - `name` est dans `['tests','fiche-personnel','widget-horaire']` ;
    - `frontmatter.noindex` est vrai.
  - `excerpt = makeExcerpt(childMdx.body, 200)`, calculé sur le MDX brut, sans le frontmatter.
- **Algorithme `makeExcerpt`** :
  1. découper par ligne ;
  2. rejeter les lignes « code » (vides, ou correspondant à l'un de ces motifs sur la ligne réduite) :
     - `^(import|export)\b`
     - `^(const|let|var|return)\b`
     - `=>|function\s*\(|useEffect\(|useState\(|require\(`
     - `^(document|window|script)\.`
     - `^[\w-]+=("[^"]*"|'[^']*'|\{[^{}]*\})\s*$`
     - `^("[\w-]+"|'[\w-]+'|[\w-]+):\s+\S`
     - `^["'][\w-]+["'],?$`
  3. dans chaque ligne restante, remplacer `<[^>]*>` puis `\{[^{}]*\}` par une espace ;
  4. rejeter les lignes qui contiennent encore `[<>{}]` ;
  5. ne garder que les lignes qui contiennent `\p{L}{3,}` ;
  6. joindre avec une espace, puis appliquer :
     - `!\[..\](..)` → espace ;
     - `\[(txt)\](..)` → `txt` ;
     - `[#*_>`~-]` → espace ;
     - espaces multiples réduits, puis `trim` ;
  7. tronquer à 200 caractères : `slice(0,200).trim()+'…'`.
- **Section « Bibliothèques »** : vient de `src/utils/bibliotheques.js` (CommonJS, 17 entrées `{ id, titre, autreTitre }`).
  - Entrée : `{ title: titre, excerpt: autreTitre !== titre ? autreTitre : '', url: '/espaces/#'+id }`.
- **Section « Personnel »** : `allListePersonnelXlsxSheet1 { nom prenom fonction direction }`.
  - `title = "prenom nom".trim()` (ignoré si vide).
  - `excerpt = [fonction, direction].filter(Boolean).join(' — ')`.
  - `url = '/nous-joindre/notre-equipe/?q=' + encodeURIComponent(fullName)`.
- **Côté client** (`src/hooks/use-search-index.jsx`) :
  - chargement avec SWR de `/search-index.json`, seulement quand la modale est ouverte ;
  - MiniSearch : `id` = index dans le tableau, `fields ['title','excerpt']`, `storeFields ['title','excerpt','url','section']`, `searchOptions { prefix:true, fuzzy:0.2, boost:{ title:2 } }` ;
  - `search(q)` regroupe les résultats par section, dans l'ordre de première apparition (score), et renvoie `[{ section, items:[{ title, excerpt, url }] }]`.

---

## 3. `plugins/gatsby-plugin-bib-theme`

### 3.1 Comment le thème est monté
- `gatsby-browser.js` et `gatsby-ssr.js` exposent `wrapRootElement`, qui enveloppe le site dans `<ThemeTopLevelProvider initTheme>`.
  - Côté navigateur, `initTheme` vient de `localStorage.theme` (`light`/`dark`, sinon `light`). Côté SSR, `light`.
  - Le fichier navigateur contient aussi un `getCurrentPageLevel` jamais appelé.
- `ThemeTopLevelProvider` :
  - état `mode` ;
  - `LightDarkContext` `{ theme, changeTheme(isDark) }`, qui écrit `localStorage` ;
  - le contexte n'est consommé par aucun composant.
- `BibThemeLvl1` :
  - `<ThemeProvider theme={themeLvl1}><CssBaseline enableColorScheme/><GlobalStyles/>` ;
  - le prop `darkMode` est **ignoré** : pas de mode sombre ;
  - un `useEffect` fait `document.body.className = ''`.
- `tokens/index.js` : `themeLvl1 = extendTheme({ ...tokens, typography: typography-bib })`.
  - `tokens.js` exporte déjà `extendTheme(tokens)` : le thème est étendu deux fois.
  - Ce sont des variables CSS MUI avec `cssVarPrefix: 'bib'` : `--bib-palette-primary-main`, `--bib-palette-bleuPrincipal-main`, etc.
- **Le thème ne change pas selon le niveau de page.** `typography-lvl-1.js` et `typography-lvl-n.js` ne sont importés nulle part. Le niveau ne joue que dans la mise en page des templates (section 6).

### 3.2 Couleurs (`tokens/tokens.js`)
- Palette du schéma `light` :
  - `primary.main #0057ac` ;
  - `text.primary #0b113a` ;
  - `background.default` et `background.paper` : `#f8fafb` ;
  - plus toutes les couleurs secondaires ci-dessous.
- Un `palette.text.default: 'red'` traîne au premier niveau (vestige).
- Les gris et le diviseur restent ceux de MUI : `grey[700] #616161`, `grey[50] #fafafa`, `grey[100] #f5f5f5`, `divider rgba(0,0,0,.12)`, `text.secondary rgba(0,0,0,.6)`.
- Règle de dérivation pour les palettes calculées :
  - `light = lighten(c, .4)` ;
  - `dark = darken(c, .3)` ;
  - `contrastText = getContrastRatio(c,'#fff') > 4.5 ? '#fff' : '#111'` (fonction exportée `getContrastColor`).
- Valeurs calculées :

| clé | main | light | dark | contrastText |
|---|---|---|---|---|
| bleuPrincipal (fixe) | #0057ac | rgb(51,120,188) | rgb(0,60,120) | #fff |
| bleuFonce (fixe) | #0b113a | rgb(59,64,97) | rgb(7,11,40) | #fff |
| bleu100 | #e5f0f8 | rgb(239,246,250) | rgb(160,168,173) | #111 |
| bleu200 | #cce2f3 | rgb(224,237,247) | rgb(142,158,170) | #111 |
| bleu600 | #00407f | rgb(102,140,178) | rgb(0,44,88) | #fff |
| jaune | #ffca40 | rgb(255,223,140) | rgb(178,141,44) | #111 |
| jaunePale | #ffe8ac | rgb(255,241,205) | rgb(178,162,120) | #111 |
| orange (en réalité rose) | #ffc0cb | rgb(255,217,223) | rgb(178,134,142) | #111 |
| rose100 | #fcf3f1 | rgb(253,247,246) | rgb(176,170,168) | #111 |
| rose300 | #fee1de | rgb(254,237,235) | rgb(177,157,155) | #111 |
| rose500 | #f4bdb7 | rgb(248,215,211) | rgb(170,132,128) | #111 |
| rougeOrange | #f04e24 | rgb(246,148,123) | rgb(168,54,25) | #111 |
| vertFonce | #024244 | rgb(103,141,142) | rgb(1,46,47) | #fff |
| vertPale | #52b782 | rgb(151,211,180) | rgb(57,128,91) | #111 |
| violetFonce | #9374f6 | rgb(190,171,249) | rgb(102,81,172) | #111 |

- Couleurs en dur fréquentes dans la coquille : `#222930` (neutre 700), `#c3ccd5` (bordures et diviseurs), `#eef4f7` (fond d'alerte), `#2a3440` (cartes du menu), `#c8cbcf` (liens du menu), `#cce2f3` (texte du bas de pied de page).

### 3.3 Autres jetons
- **Breakpoints** : `xs 0`, `sm 600`, `md 900`, `lg 1200`, `xl 1536`. MUI `down(k)` = `max-width: (k − 0.05)px`.
- **Espacement** : `spacing: 8`, donc 1 unité = 8 px.
- **Coins** (`shape.corner`) : `full 9999px`, `large 24px`, `medium 16px`, `small 12px`, `extra-small 8px`, `extra-extra-small 4px`, `none 0`. Le `borderRadius` MUI standard (4 px) est inchangé.
- **Durées** (`transitions.duration.md3`, en ms) :
  - short1-4 : 50, 100, 150, 200 ;
  - medium1-4 : 250, 300, 350, 400 ;
  - long1-4 : 450, 500, 550, 600 ;
  - extraLong1-4 : 700, 800, 900, 1000.
- **Courbes** (`transitions.easing.md3`) :
  - `emphasized cubic-bezier(.2,0,0,1)` ;
  - `emphasizedAccelerate (.3,0,.8,.15)` ;
  - `emphasizedDecelerate (.05,.7,.1,1)` ;
  - `standard (.2,0,0,1)` ;
  - `standardAccelerate (.3,0,1,1)` ;
  - `standardDecelerate (0,0,0,1)`.
- z-index MUI par défaut : `appBar 1100`, `drawer 1200`, `modal 1300`.

### 3.4 Surcharges de composants MUI (`components`)
- **AccordionDetails** : `padding 1.5em` (`1.6667em 2em` à partir de md), rayon `0 0 12px 12px`.
- **AccordionSummary** :
  - racine : `border unset`, `padding 30px 0 20px`, transition `color 350ms emphasized` ;
  - contenu : `1.2222rem`, graisse 600, `line-height 1.2`, `margin 0`.
- **Alert** (`variant: 'outlined'` par défaut) :
  - racine : `my 1rem`, rayon `0 0 12px 12px`, bordure `1px #c3ccd5`, `padding 0` ;
  - message : `flex-grow 1`, couleur `#222930`, fond `#eef4f7`, rayon `0 0 12px 0`, `padding 16px` ;
  - icône : fond `#eef4f7`, rayon `0 0 0 12px`, `padding 16px 4px`, `width 35px`, centrée ;
  - couleurs d'icône par sévérité :

    | sévérité | fond | couleur |
    |---|---|---|
    | success | #52B782 | #EDF9F3 |
    | info | #CCE2F3 | #0057ac |
    | warning | jaunePale | #976D00 |
    | error | #FEE1DE | #B10000 |
- **Button** :
  - racine : rayon 9999 px, `line-height 1`, pas de majuscules, `0.875rem`, graisse 400, `min-height 3.125rem`, `padding 6px 20px 6px 25px`, `margin-top 1rem` ;
  - variantes :
    - `contained` : couleur `#fafdfe`, sans ombre ;
    - `contained` + `color='blue'` : fond `#0057AC`, survol `#033669` ;
    - classe `.blueOutlineNoIcon` : texte `#0057AC`, bordure 1 px, fond transparent, survol fond bleu et texte blanc, icônes masquées ;
    - classe `.whiteOutlineNoIcon` : blanc, survol fond `#fff` et texte `#0B113A` ;
  - classes utilitaires : `.mt1` (8 px), `.mt4` (32 px), `.right`, `.center`, `.left` (flex, `fit-content`, marges auto) ;
  - `.MuiButton-icon svg { fill: currentColor }` et `p { margin: 0 }`.
- **Container** : `maxWidth 'xl'` par défaut, soit 1536 px.
- **CssBaseline** :
  - `:root { --bib-comp-retroaction-usager-size: 0.875rem; scroll-behavior: smooth; scroll-padding-top: 100px (90px à partir de md) }` ;
  - `[id] { scroll-margin-top: 100px (90px à partir de md) }` ;
  - repli `@supports not (scroll-padding-top: 0)` avec un `[id]::before` de 100 / 90 px ;
  - `h1`–`h6` reçoivent la typographie du thème.
- **Divider** : `color #c3ccd5`, `margin 1rem 0`.
- **Autres valeurs par défaut** : Drawer `anchor: 'right'`, Link `underline: 'hover'`, Stack `useFlexGap: true`, `BibFooter` vide.

### 3.5 Typographie utilisée (`tokens/typography-bib.js`)
- Piles de polices :
  - Figtree : `"Figtree","Figtree Fallback","Segoe UI","Roboto","Helvetica Neue",Arial,sans-serif` ;
  - Lora : `"Lora","Lora Fallback",Georgia,serif`.
- Base commune : `font-feature-settings 'liga' off,'clig' off`, `font-variant-numeric lining-nums tabular-nums`, `font-style normal`, `margin 0`.
- Réglages MUI : `fontSize 16`, `htmlFontSize 16`, graisses light 300, regular 400, medium 500, bold 600.
- **Attention : la racine réelle n'est pas à 16 px.** `GlobalStyles` impose `html, body { font-size: 17px }`, puis `18px` à partir de 900 px. Toutes les valeurs en rem ci-dessous sont donc relatives à 17 ou 18 px.
- Variantes de texte (toutes en Figtree) :

| variante | desktop | mobile (≤ 899 px) | graisse / interligne |
|---|---|---|---|
| h1 | 6.875rem | 3rem | 600 / 1.1, marge .5em 0 |
| h2 | 3.5rem | 2.5rem | 600 / 1.1 |
| h3 | 2.25rem | 1.5rem (700) | 600 / 1.2 |
| h4 (**Lora**) | 1.875rem | 1.25rem | 500 / 1.2 |
| h4Figtree | 1.875rem | 1.25rem | 500 / 1.2 |
| h5 | 1.125rem | 1.125rem | 700 / 1.1 |
| h6 | 1.125rem | 1rem | 400 / 1.2 |
| body1 | 1rem | — | 500 / 1.5 |
| body2 | .875rem | — | 500 / 1.5 |
| subtitle1 | 1rem | — | 500 / 1.5 |
| subtitle2 | .875rem | — | 500 / 1.5 |
| button | .875rem | — | 500 / 1.5, sans majuscules |
| caption | .75rem | — | 400 / 1.5 |
| overline | .75rem | — | 500 / 1.5, majuscules |
| legal | .857rem | — | 500 / 1.2 |

- Variantes à paliers montants (`min-width`) :

| variante | < 600 px | ≥ 600 px | ≥ 900 px | ≥ 1200 px | graisse / interligne |
|---|---|---|---|---|---|
| titreSuperHero (pb 1rem) | 2.5rem | 3.75rem | 4.5rem | 4.5rem | 600 / 1.1 |
| titreSuperHeroSmall (pb 2.5rem) | 2.1rem | 3rem | 3.5rem | 4rem | 600 / 1.1 |
| display1 | 2.5rem | 4rem | 6.5rem | — | 600 / 1 |
| display2 (`!important`) | 2rem | 3rem | 3.5rem | — | — / 1.2 |
| display3 | 1.65rem | — | 2.125rem | — | — / 1.2 |
| display4 | 1.5rem | — | 1.625rem | — | — / 1.2 |
| display5 | 1.375rem | — | 1.5rem | — | — / 1.2 |

- Variantes spéciales :
  - `carteProfilLink` : .875rem, 400, `#0057AC`, souligné, flex, `mt 10px`, ellipse ;
  - `textWhite` : `color #FFF !important`.
- **Fichiers non utilisés**, donnés pour référence :
  - `typography-lvl-1.js` (base 16) :
    - h1 3.125rem / 3rem / 2.25rem ;
    - h2 en Lora 2.125rem / 1.65rem / 1.6rem ;
    - h3 1.65rem / 1.56rem ;
    - h4 1.31rem / 1.16rem ;
    - h5 1.19rem / 1.06rem ;
    - h6 1rem / .94rem ;
    - h2Carousel 3.125rem / 3rem / 2.5rem ;
    - body1 et body2 en 400.
  - `typography-lvl-n.js` (base 18) :
    - h1 3.125rem / 3rem / 2.25rem ;
    - h2 en Lora 500, 1.889rem / 1.65rem / 1.4rem ;
    - h3 1.556rem / 1.4rem / 1.25rem ;
    - h4 1.1667rem / 1.05rem / .95rem ;
    - h5 1.056rem / .95rem / .85rem.

### 3.6 Styles globaux (`global-styles/`)
- **`GlobalStyles.jsx`** :
  - importe `modern-normalize/modern-normalize.css` et les quatre fichiers CSS ci-dessous ;
  - `html, body { font-size: 17px }`, `18px` à partir de md ;
  - `h1`–`h6` en HTML brut reçoivent `typography-bib[hN]` (doublon de CssBaseline).
- **`font-fallbacks.css`** :
  - `'Figtree Fallback'` : `local('Arial')`, `size-adjust 100.72%`, `ascent 94.32%`, `descent 24.82%`, `line-gap 0%` ;
  - `'Lora Fallback'` : `local('Georgia')`, `104.98%`, `95.83%`, `26.1%`, `0%`.
- **`header-anchors.css`** : `hN > .anchor { color: inherit, }`. La virgule est une erreur de syntaxe, la déclaration est ignorée. Aussi `hN > .anchor svg { height: .85em }`.
- **`links.css`** : `main { :link:not(.MuiButtonBase-root) { color: var(--bib-palette-primary-main) } }` (nesting CSS).
- **`pdf-links.css`** :
  - sélecteur : `main a:not(.no-pdf-icon)[href$=".pdf"]`, `[href*=".pdf#"]`, `[href*=".pdf?"]`, et leurs `:hover` ;
  - effet : `::after` avec un SVG PDF rouge `#ea4c3a` en data-URI, `.9em × .9em`, `margin-left .35em`, `vertical-align text-bottom`, `margin-bottom .2em`.

---

## 4. `plugins/gatsby-plugin-bib-secondary-nav`

### 4.1 Construction réelle du menu
Le flux réel est `createPages` → `lib/getMenu.js` → `writeFileSync('public/site-navigation.json')`.

1. `directoryTree('content/pages', { extensions: /\.mdx?$/, normalizePath: true, exclude: [/^content\/pages\/consent/i] })`.
2. `getMenuData` parcourt l'arbre. Pour chaque fichier, il lit le frontmatter avec gray-matter (`getPageAttrs`) :
   - `title = secondaryNav.title || title` ; un fichier sans titre est exclu ;
   - `order = secondaryNav.order ?? null` ;
   - `hidden = secondaryNav.hidden ?? false` ;
   - `path = getNormalPath(file)` : extension retirée, préfixe `content/pages` et `/index` retirés, slash final **seulement pour `index`**. Exemples : `/a-propos/`, `/a-propos/mission-vision-valeur`. Le chemin n'est **pas** slugifié, contrairement aux URL de page ;
   - `isRoot = fichier ∈ content/pages/<dossier>/index.mdx`, soit exactement deux segments relatifs. Il écrase un éventuel `secondaryNav.isRoot`.
3. Racines = tous les nœuds `isRoot`, dans l'ordre de `directoryTree` (alphabétique). Le filtre `hidden` ne s'applique **pas** aux racines.
4. Construction récursive :
   - enfants d'un nœud = nœuds dont `path` correspond à ``new RegExp(`${escape(node.path)}[^/]+(/)?$`)`` ;
   - la regex n'est pas ancrée au début, et pour un nœud non-index sans slash final elle attrape aussi les « frères » qui ont le même préfixe ;
   - enfants filtrés par `!hidden`, puis triés par `order` (`null` = Infinity, tri stable) ;
   - `isRoot` et `hidden` sont retirés de chaque nœud ;
   - `children` n'est ajouté que s'il n'est pas vide.

### 4.2 Format de `site-navigation.json`
```json
[{ "title":"À propos", "order":1, "path":"/a-propos/", "children":[
   { "title":"Notre organisation", "order":1, "path":"/a-propos/notre-organisation/",
     "children":[{ "title":"Stéphanie Gagnon - directrice générale", "order":2,
                   "path":"/a-propos/notre-organisation/stephanie-gagnon" }]}, … ]}, … ]
```
- Racines actuelles :
  - `/a-propos/`, `/engagements/`, `/enseignement/`, `/espaces/`, `/etudes/` ;
  - `/formulaire-consentement-inscription/` (une page noindex devient une racine) ;
  - `/nous-joindre/`, `/nous-soutenir/`, `/obtenir/`, `/recherche/`.

### 4.3 Code mort ou inutile dans le plugin
- `onCreateNode` : teste `node.internal.fileAbsolutePath`, absent en MDX v2, donc ne s'exécute jamais.
- `sourceNodes` crée des nœuds GraphQL `SiteNavigation` (`getTree` + `createNodes`), et `markRoots` pose `fields.isRoot = true` sur **tous** les nœuds Mdx.
- `createPages` interroge `allSiteNavigation`, puis **ignore** le résultat : `getMenu()` relit le disque.
- Fichiers et exports inutilisés : `createSchemaCustomization` (`SiteNavigation`, `SecondaryNav`), `components/MdxRoutes.js` (export de `index.js`), `source-nodes.js`, `lib/loadNavigation.js`, `utils/recursiveMenu.js`, et `src/components/_layout/SecondaryNav/fetchNavigation.js`.

### 4.4 Champs `secondaryNav` du frontmatter
- `title` : libellé dans le menu.
- `order` : tri.
- `hidden` : exclu du menu (sauf pour une racine).
- `isRoot` : ignoré.
- Exemple : `horaires/test.mdx` utilise `secondaryNav.hidden: true`.

### 4.5 Consommation côté client
- `SecondaryNav.jsx` et `SecondaryNavSm.jsx` importent le JSON depuis `public/`.
- La racine choisie est celle dont `path === '/' + premier segment de pathname + '/'` (voir 5.6).

---

## 5. `src/components/_layout/*`

### 5.0 Comportement responsive (important)
- Seuils utilisés par les templates :
  - `isSmall = useSmall('md')`, soit < 900 px ;
  - `isMedium = useSmall('lg')`, soit < 1200 px.
- Effets :
  - en dessous de 1200 px : `TopAppBarSm` et `BreadcrumbSm` ; la colonne de navigation secondaire disparaît ;
  - en dessous de 900 px : `QuickLinksSm` (barre du bas).
- Le SSR rend la variante desktop, la bascule mobile se fait après hydratation. En Astro, il faudra rendre les deux variantes et basculer en CSS.

### 5.1 `AppBar/menu.js` : liens principaux
`[{'/espaces/','Espaces'}, {'/etudes/','Études'}, {'/recherche/','Recherche'}, {'/enseignement/','Enseignement'}, {'/engagements/','Engagements'}]`.

Il sert à la fois à TopAppBar et à la section « Liens rapides » du menu mobile.

### 5.2 `TopAppBar.jsx` (desktop, ≥ 1200 px)
- **Conteneur** : AppBar `position: sticky`, `z-index: 5` (et non 1100).
- **Changement d'état au défilement** (`trigger = useScrollTrigger({ disableHysteresis: true, threshold: 50 })`) :

  | | haut de page | après 50 px de défilement |
  |---|---|---|
  | fond | transparent + `linear-gradient(180deg, rgba(0,0,0,.5) 90%, rgba(0,0,0,0) 100%)` | `#fff` |
  | ombre | `elevation 0` | `elevation 2` |
  | texte | `grey[50]` | `#222930` |

  - Transitions : background-color, box-shadow et background-image en 400 ms `emphasizedDecelerate`.
- **Toolbar** : `height: appBarHeight = '5rem'` (exporté), `max-width 1536`, `px 1.25rem`, centrée.
- **Gauche, `LogoLink`** :
  - logo UdeM `AppBar/logo-udem.svg`, `height 59px`, lien vers `https://www.umontreal.ca` ;
  - `filter: brightness(0) invert(1)` (blanc) tant qu'on n'a pas défilé ; opacité .8 au survol ;
  - séparateur vertical de 32 px en `currentColor` ;
  - lien `/` « Les bibliothèques » : 1.1875rem, 400, `lh 1.5`, `letter-spacing 0.01188rem`, souligné au survol ;
  - le logo est masqué sous `sm`.
- **Droite** :
  - **boutons du menu** : `<a href>`, 1rem, 400 ; soulignement animé par `::after` de 1 px (`scaleX 0→1`, 0.3 s) ; graisse 700 si `pathname.startsWith(url)` ;
  - **bouton « Je donne »** :
    - Button outlined `large`, `href="/nous-soutenir/"`, 0.875rem, `endIcon` ArrowRight ;
    - bordure et texte `#fff` au repos, `bleuFonce` une fois défilé ; icône blanche, ou `rougeOrange` une fois défilé ;
    - survol : fond `bleuFonce`, texte blanc ;
  - **groupe recherche et burger** : `ml 1`, espacement 8 px.
- **Tiroir** : état `open`. Un écouteur sur l'événement custom `close` de `document.documentElement` le referme.
- Rend aussi `<SideNav><SideNavContent/></SideNav>` et `<LazySearchOverlay/>`.
- Bogue : `location: propLocation = {}` puis `propLocation || gatsbyLocation`. L'objet `{}` est truthy, donc sans prop (page 404) aucun lien n'est actif.

### 5.3 `TopAppBarSm.jsx` (< 1200 px)
- **Conteneur** : AppBar sticky, `elevation 0`, fond `background.paper` (`#f8fafb`), bordure basse 1 px `divider`, `transform: translateZ(0)` (correctif iOS).
- **Container** : `maxWidth xl` forcé à 1500 px, `py 1`, `px 2`.
- **Logo** (masqué quand le menu est ouvert) : `@/images/logo-udem/logo_udem-noir.svg`, largeur 120 px (< 900) ou 140 px, avec « Les bibliothèques » en 16 px / 600 dessous, lien `/`.
- **Droite** :
  - SearchButton `dark`, masqué quand le menu est ouvert ;
  - burger : un IconButton « Ouvrir le menu de navigation » qui **contient** `MenuBurger`, lui-même un IconButton. Ce sont des boutons imbriqués, invalides en HTML.
- La touche Échap ferme le tiroir.
- Rend `<SideNavSm><SideNavContent/></SideNavSm>` et `<LazySearchOverlay/>`.

### 5.4 Boutons du header
- **`MenuBurger.jsx`** :
  - IconButton, `z-index 1400`, couleur `text.primary` si `dark`, sinon `#fff` ;
  - icône `BurgerIcon` (`src/icons/burger.svg`, 34 px) ou X Phosphor gras 34 px ;
  - libellé visible seulement à partir de lg : « Menu » ou « Fermer », 0.65rem, positionné au-dessus de l'icône, `aria-hidden` ;
  - `aria-label` : « Ouvrir le menu » ou « Fermer le menu ».
- **`SearchButton.jsx`** :
  - IconButton, `aria-label="Rechercher dans le site"`, `aria-haspopup="dialog"`, `aria-expanded` ;
  - MagnifyingGlass 24 px gras ;
  - précharge l'overlay au `pointerenter` et au `focus` (`preloadSearchOverlay`).
- **`LazySearchOverlay.jsx`** : `lazy(() => import('./SearchOverlay'))`. Rien n'est monté avant la première ouverture, puis la modale reste montée.
- **`search-overlay-url.js`** : `PARAM_OPEN='search'` et `isSearchOverlayOpenInUrl()` (`?search=1`), qui initialise `searchOpen` au premier rendu.

### 5.5 `SearchOverlay.jsx` (modale de recherche)
- **Paramètres d'URL** : `?search=1`, `sq=<requête>`, `sscope=<portée>` (omis pour `site`).
- **Mémoire de session** (`sessionStorage`) : `searchOverlay:lastQuery`, `searchOverlay:lastScope`.
- **Portées** :

  | clé | libellé | icône | couleur | à la soumission |
  |---|---|---|---|---|
  | `site` | Site principal | House | bleuFonce | recherche MiniSearch en direct |
  | `sofia` | Sofia | SVG `src/icons/sofia.svg` | bleuPrincipal | `https://umontreal.on.worldcat.org/search?clusterResults=true&baseScope=wz:11098&lang=fr&stickyFacetsChecked=on&changedFacet=database&database=Xwc&overrideStickyFacetDefault=true&queryString=kw:<q>` |
  | `outils` | Boîte à outils | pastille `rougeOrange.main` | rougeOrange | `https://boite-outils.bib.umontreal.ca/srch.php?q=<q>` |
  | `studio` | Studio-bib | pastille `jaune.main` | jaune | `https://studio.bib.umontreal.ca/search/?q=<q>` |

  - Chaque portée a une description longue (textes dans le fichier, lignes 214-246).
  - Pour les portées externes, la soumission fait `window.location.href = …`, seulement si `q.trim()` n'est pas vide.
- **Historique** :
  - ouverture normale : restaure la dernière recherche de session, puis `pushState({ searchOverlay: true }, '', pathname + '?' + params)` ;
  - lien profond (`?search=1` déjà dans l'URL au montage) : restaure l'état sans `push` ;
  - pendant la frappe : `replaceState` après un debounce de 200 ms, et mise à jour de `sessionStorage` ;
  - fermeture (Échap, bouton X, clic sur le fond) : `history.back()` si l'entrée a été poussée par la modale ; sinon les paramètres sont retirés avec `replaceState`, puis `onClose` ;
  - `popstate` : resynchronise l'état, ou ferme la modale.
- **Mise en forme** :
  - **Dialog** :
    - `maxWidth lg`, `fullWidth`, `scroll paper` ;
    - fond flouté : `backdrop-filter blur(6px)`, `rgba(15,17,20,.8)` ;
    - Paper : `radius 24px` (3 × 8), `m 16`, `p 24`, `min-height 75vh`, `max-height 90vh`, `overflow-y hidden` ;
    - le focus va au champ sur `onEntered`.
  - **Contenu, de haut en bas** :
    1. h2 caché « Recherche dans le site » ;
    2. overline « Rechercher dans » et bouton X ;
    3. **sélecteur de portée** (ToggleButtonGroup) :
       - fond `grey[100]`, rayon 16 px, `padding 6`, `gap 6` ;
       - boutons en pilule, 600, 0.9375rem, `padding .75rem 1.375rem` ; sous `sm`, grille de deux colonnes en 0.75rem ;
       - sélection : fond `bleuFonce`, texte blanc ;
    4. **carte de description** : fond `alpha(couleur, .08)`, bordure gauche 4 px, rayon 12 px. Sous `sm`, le texte est coupé à une ligne avec un bouton « Lire la suite… » / « Réduire » ;
    5. **formulaire** : Paper en pilule, bordure `divider` (`primary` au focus) ; bouton loupe en `type=submit` ; InputBase ; bouton « Effacer » en fondu (`tabIndex -1` quand le champ est vide) ;
       - placeholder : « Rechercher dans le site des bibliothèques », ou « Rechercher dans {label}, puis appuyez sur Entrée » ;
       - le même texte est repris dans `#search-input-hint` (`aria-describedby`) ;
    6. région `role=status aria-live=polite` (cachée) : « Chargement… », « N résultat(s) trouvé(s) pour « q » », « Aucun résultat pour « q » » ;
    7. **zone de résultats** (portée `site` seulement) : seule zone défilante, `overscroll-behavior contain`.
  - **Contenu de la zone de résultats** :
    - spinner pendant le chargement de l'index ;
    - « Commencez à taper… » quand le champ est vide ;
    - sinon des groupes par section : `h3` en overline, puis `role=list`, éléments séparés par une bordure.
  - **Un résultat** : Link titre (subtitle1, 600) + extrait (body2, `noWrap`) + flèche `arrow-right-circle.svg` (viewBox 0 0 50 51, 28 ou 32 px, `bleuPrincipal`, `translateX(3px)` au survol).

### 5.6 Tiroirs et menu burger
- **`SideNav/SideNav.jsx`** (desktop) :
  - MUI Drawer à droite, `temporary`, 350 ms ;
  - Paper : `bg #222930`, texte `#fff`, `padding 2rem`, `top 5rem`, `height auto`, `max-height calc(100% - 5rem)`.
- **`SideNavSm.jsx`** : SwipeableDrawer à droite, 350 ms, Paper `width 100%`, `padding 1rem`, `bg #222930`, `top 5rem`.
- **`SideNavContent.jsx`** : contenu du burger, **défini en dur dans le fichier**.
  - **7 liens rapides** :
    - « Obtenir un document » `/obtenir/` (Books) ;
    - « Réserver une salle » `https://calendrier.bib.umontreal.ca/r` (DoorOpen) ;
    - « Mon dossier » `https://umontreal.account.worldcat.org/account` (FolderOpen) ;
    - « Calendrier des formations » `https://calendrier.bib.umontreal.ca/calendar?cid=7690&t=m&d=0000-00-00&cal=7690&inc=0` (CalendarDots) ;
    - « Horaires » `/horaires` (ClockCountdown) ;
    - « Nous joindre » `/nous-joindre/` (AddressBook) ;
    - « À propos » `/a-propos/` (Info) ;
    - les liens `http…` ont `target=_blank`.
  - **3 cartes** (`bg #2a3440`, rayon 8 px, `padding 2rem`, `height 30rem`) :
    - largeurs : 25rem (xs), 20rem (sm), 15rem (md), 16rem (lg), 18rem (xl) ;
    - liseré bas de 5 px couleur `footerColor`, ombre `0 5px 0 0 footerColor` au survol ;
    - icône ronde de 80 px et titre h6 ;
    - liens « → label » en `#c8cbcf`, 1rem, 300, blancs au survol ;
    - lien d'appel à l'action dans la couleur `footerColor`.
  - Contenu des cartes :

    | carte | icône | couleur | liens | appel à l'action |
    |---|---|---|---|---|
    | Studio·bib | `logo-studio-bib-noir-petit.webp` | #FFCA40 | Accès hors campus `…/informatique/hors-campus/`, Soutien informatique `…/informatique/`, Technologies créatives `…/creatives/`, Productions médias `…/medias/` | « Aller plus loin » `https://studio.bib.umontreal.ca/` |
    | Boîte à outils | `icone-boite-outils-orange2.webp` | #F04E24 | Bases de données A-Z `…/az.php`, Ressources par discipline `…/disciplines`, Comment citer `…/citer`, Droit d'auteur `…/recherche/droit-auteur` | « Découvrir tous les outils » `https://boite-outils.bib.umontreal.ca/` |
    | Ressources | `autres-resources.webp` | #52B782 | Sofia `https://umontreal.on.worldcat.org/discovery?lang=fr`, Papyrus `https://umontreal.scholaris.ca/`, GéoIndex `https://geoapp.bibl.ulaval.ca/`, Calypso `https://calypso.bib.umontreal.ca/`, Service Accessibilité `/service-accessibilite/` | aucun |

  - **Desktop** (≥ 1200 px) : les liens rapides sont des Buttons outlined (`justify flex-start`, `#c8cbcf`, bordure `rgba(255,255,255,.2)`, rayon 8 px, `padding .75rem 1rem`, survol `rgba(255,255,255,.1)`).
    - Ordre visuel : les cartes d'abord (`order 1`), les boutons ensuite (`order 2`).
    - Les props `item xs={12} lg={2|10}` ne sont pas reconnues par le Grid2 de MUI 6 : les largeurs réelles sont automatiques.
  - **Mobile** (< 1200 px), `MobileQuickLinks` :
    - lien « Accueil », puis un bouton repliable « Liens rapides » (icône ExpandMore qui pivote de 90°) ;
    - le Collapse (`bg #2a3440`) contient les 5 liens de `menu.js` puis les 7 liens rapides ;
    - les cartes s'affichent ensuite dans l'ordre inverse : Ressources, Boîte à outils, Studio·bib.

### 5.7 Barre bleue verticale à droite et barre mobile (`QuickLinks.jsx`)
- **Desktop, `QuickLinks`** (≥ 900 px) :
  - **conteneur** : `div` fixe `top 0`, `right 0`, `bottom 0`, colonne centrée verticalement, `z-index 1200`, `pointer-events none` ;
  - **panneau** : Paper `component="nav"`, `elevation 3`, `bg bleuPrincipal #0057ac`, rayon `12px 0 0 12px`, `pointer-events auto` ;
  - **repli** : `collapsed = scrollY > 50 OR 3 s écoulées sans défilement depuis le chargement`.
    - Le minuteur de 3 s est annulé au premier défilement.
    - Une fois l'auto-repli survenu, il est définitif.
    - Replié : `transform: translateX(calc(100% - 65px))`, seules les icônes restent visibles.
  - **transitions** :
    - repli en 400 ms `emphasizedDecelerate`, dépliage en 200 ms `emphasizedAccelerate` ;
    - au survol, et seulement à partir de lg et à l'état replié : `translateX(0)` en 400 ms `emphasizedDecelerate`.
  - **éléments** (MenuItem) :
    - style : `padding 8px 16px`, `margin 0 8px`, rayon 6 px, `min-height 48px`, survol `rgba(255,255,255,.1)` ;
    - libellé : 1rem, 400, `lh 1.6`, `ml 5px` ; icônes blanches de 24 px ;
    - **liens** :
      1. Sofia → `https://umontreal.on.worldcat.org/discovery?lang=fr` (`_blank`) ;
      2. Horaires → `/horaires` ;
      3. Réserver une salle → `https://calendrier.bib.umontreal.ca/r` ;
      4. Ressources informatiques → `https://studio.bib.umontreal.ca/informatique/` ;
      5. Clavarder → `#`, qui appelle `window.openLibChatDirect()`.
- **Mobile, `QuickLinksSm`** (< 900 px) :
  - barre fixe en bas, `left 0`, `right 0`, `bg bleuPrincipal`, `padding 15px 30px`, `shadow[3]`, `z-index 1200` ;
  - nav de 500 px maximum, `space-between` ;
  - les cinq mêmes liens en IconButton de 40 px, avec `aria-label`.
- **`LibChatWidget.jsx`** (monté dans les deux variantes) :
  - **CSS** : injecte un style qui masque `.s-lch-widget-float-btn` ;
  - **chargement** : ajoute `<script id="libchat-script" src="https://unequestion.bib.umontreal.ca/load_chat.php?hash=71ff3bc4ca990e9e993a02e35e2f804aa581c52535e870359e707314a83afdd3">` ;
  - **conteneur** : `div#libchat_<hash>` fixe, `bottom 80`, `right 20`, `z 99999` ;
  - **ouverture** : `window.openLibChatDirect` clique sur le bouton flottant caché et passe `.s-lch-widget-float` en `z-index 99999`. Si le script n'est pas chargé : `alert("Le service de clavardage est temporairement indisponible.")` ;
  - **erreur de chargement** : une bulle rouge `#f44336` s'affiche avec le même message.

### 5.8 Fil d'Ariane (`Breadcrumbs/`)
- **`Breadcrumbs.jsx`** :
  - applique `crumb-labels.json` : si `override[stripTrailingSlash(pathname)]` existe, il remplace `crumbLabel`, sinon le slug brut reste ;
  - choix du composant : `BreadcrumbSm` sous 1200 px, `BreadcrumbLg` au-delà.
- **`BreadcrumbLg`** :
  - MUI Breadcrumbs, classe `bib-comp-breadcrumbs`, `aria-label="Fil d'ariane"`, `padding-bottom 24px` ;
  - premier maillon : icône HouseLine 1.125rem ;
  - maillons intermédiaires : liens `href`, soulignés, sans soulignement au survol ;
  - dernier maillon : `<span aria-current="page">`.
- **`BreadcrumbSm`** :
  - rendu **client seulement** (calcul dans un `useEffect`), donc rien dans le HTML SSR ;
  - recoupe chaque maillon avec `site-navigation.json` en descendant l'arbre (la clé `crumbLabel` est renommée `label`). **Un maillon absent de la navigation est supprimé** ;
  - `maxItems` : 2 sous 600 px, 3 sous 900 px, 8 au-delà ;
  - à droite, un bouton DotsThreeCircle (`aria-label="Menu de cette section"`) ouvre un menu MUI (`material-ui-popup-state`) qui contient `SecondaryNavSm`, la navigation de la section.

### 5.9 Navigation secondaire (`SecondaryNav/`)
- **`SecondaryNav.jsx`** (colonne desktop) :
  - racine = l'entrée du JSON dont `path` vaut `/<premier segment>/` (`null` si absente) ;
  - `padding-top 28px` ;
  - `<nav aria-label="Navigation dans cette section du site">` contenant `<header role="banner">` (rôle discutable) ;
  - titre de section : Lora, 27 px, 500, `lh 1.2`, `#222930`, `pb 24px` ;
  - puis `NavList` : `ul role=list`, sans puces, colonne, `gap 0`.
- **`SecondaryNavSm.jsx`** : identique, avec `padding .75em`.
- **`NavItem.jsx`** :
  - `isActive = pathname.startsWith(item.path)` ;
  - niveau 0 : 18 px, 600, `padding 8px 0`, `lh 1.7`, `border-top 1px #c3ccd5` ;
  - niveaux suivants : 16 px, 400, `padding 4px 0`, `lh 1.6`, `padding-left .8125rem` ;
  - couleur `#222930` ; actif ou survol : `var(--bib-palette-bleuPrincipal-main)` ;
  - les éléments avec enfants ont une icône CaretRight de 24 px (pivotée de 90° si actif) ; sans enfants, `padding-right 1.5rem` ;
  - les enfants ne s'affichent **que si le parent est actif** (accordéon piloté par l'URL), dans une `NavList` avec `py 8px` et `margin-left lvl × 16px` ;
  - classes : `bib-comp-nav2-item lvl-N is-active`.

### 5.10 Tête de page (`HtmlHead.jsx`, `SEO.jsx`)
- **`HtmlHead.jsx`** est l'export `Head` de PageTemplate et DocTemplate, et il est réutilisé par NouvelleTemplate. Il rend :
  - `<html lang="fr">` ;
  - `<SEO title description pathname>`, à partir du `frontmatter` de `pageContext` ;
  - 8 scripts `type="module"` :
    - `https://cdn.jsdelivr.net/gh/bibudem/ui@1/dist/` + `bib-gtm.min.js`, `bib-avis.min.js`, `bib-retroaction-usager.js`, `udem-urgence.min.js`, `bib-consent.min.js`, `bib-consent-preferences-btn.min.js`, `bib-clarity.min.js` ;
    - `https://corvee.bib.umontreal.ca/loader.js` (avec `defer`) ;
  - si `noindex` : `<meta name="robots" content="noindex, nofollow">` ;
  - les `children` (le JSON-LD des nouvelles).
- **`SEO.jsx`** :
  - **valeurs calculées** :
    - titre : `"{title} - Les bibliothèques / UdeM"` (ou le titre du site seul) ;
    - description : celle du frontmatter, sinon celle du site ;
    - image : `siteUrl + '/images/logo-udem-bib.png'` ;
    - URL : `siteUrl + pathname` ;
  - **balises émises** :
    - `<title>` ;
    - `meta description` et `meta name="image"` ;
    - `twitter:card` (`summary_large_image`), `twitter:title`, `twitter:url`, `twitter:description`, `twitter:image`, `twitter:creator` ;
    - `link rel="canonical"` ;
    - `link rel="icon" href="/favicon.svg"` ;
  - aucune balise Open Graph.
  - `useSiteMetadata` passe par un `useStaticQuery` de `siteMetadata`.

### 5.11 Pied de page (`Footer/`) : liens définis en dur dans `LocalFooter.jsx` et `FooterTail.jsx`
- **`Footer.jsx`** : `<footer role="contentinfo">` stylé `BibFooter` en 1rem, qui contient LocalFooter et FooterTail.
- **`FooterContainer`** : fond pleine largeur, conteneur intérieur à 1536 px maximum, centré.
- **`FooterLink`** : Link sans soulignement (souligné au survol), `color inherit`.
- **`LocalFooter`** :
  - **cadre** : fond `bleuFonce #0b113a`, texte `#fff`, `pt 32px` ;
  - **titre** (desktop, ≥ 900 px) : h4, donc Lora, « Les bibliothèques de l'Université de Montréal », 1.5rem, `px 64px`, `mb 32px` ;
  - **rangée principale** : `px 24px` (mobile) ou 64 px (desktop), `pb 32px` ; colonne sous md, ligne à partir de md ;
  - colonnes à `flex 1`, séparateurs verticaux de 1 px `rgba(255,255,255,.2)` avec `margin 0 32px` (masqués sous md) ;
  - **colonne 1** :
    - Nous joindre `/nous-joindre/` (PaperPlaneTilt 18) ;
    - Votre dossier `https://umontreal.account.worldcat.org/account` (User) ;
    - À propos `/a-propos/` (Info) ;
    - icônes sociales de 24 px centrées (`mt 30px`, `gap 24px`) : YouTube `https://www.youtube.com/user/BibliothequesUdeM`, Instagram `https://www.instagram.com/umontreal/`.
  - **colonne 2** :
    - Site des bibliothèques `/` ;
    - Catalogue Sofia `https://umontreal.on.worldcat.org/discovery?lang=fr` ;
    - Base de données A-Z `https://boite-outils.bib.umontreal.ca/az.php?_gl=…` (paramètre de suivi GA à nettoyer).
  - **colonne 3** :
    - Boite à outils `https://boite-outils.bib.umontreal.ca/` ;
    - Studio-bib `https://studio.bib.umontreal.ca/` ;
    - Papyrus `https://umontreal.scholaris.ca/` ;
    - « Géolndex » (coquille l/I) `https://geoapp.bibl.ulaval.ca/` ;
    - Calypso `https://calypso.bib.umontreal.ca/?_gl=…`.
  - **colonne 4** (desktop) : `/images/logo-bib/logo-bib-sceau-bleu.svg` en `<img>` lazy, 200 px, aligné à droite, lien `/`.
  - **mobile** : `/images/logo-bib/logo-bib-U-blanc.svg` en tête, 250 px maximum.
  - **ligne du bas** : `tel:+15143437771` « Urgence UdeM 514 343-7771 » avec une icône Siren `#f04e24` de 24 px.
- **`FooterTail`** :
  - **fond** : `bleuFonce` sous 900 px, `bleuPrincipal` au-delà ;
  - **texte** : `#cce2f3`, 14 px, `lh 1.2`, `letter-spacing .14px`, `padding 8px 24px`, `gap 20px` ;
  - **desktop** : une ligne de 50 px de haut, séparateurs verticaux de 1 px de hauteur `1lh` ;
  - **mobile** : une colonne, avec `padding-bottom calc(100px + 1em)` pour dégager la barre QuickLinksSm.
  - **éléments, dans l'ordre** :
    1. Copyright CC (`cc.svg` et `by.svg` en 1ex) « Sauf indications contraires, ce site est sous licence CC BY 4.0 », lien `/conditions-utilisation` en `_blank`, `rel="license"`, attributs RDFa `xmlns:cc` et `dct` (placé en dernier sur mobile) ;
    2. Confidentialité `https://vie-privee.umontreal.ca/confidentialite/` ;
    3. Conditions d'utilisation `/conditions-utilisation` ;
    4. Accessibilité `/accessibilite-web` ;
    5. bouton « Paramètres des témoins » (`.parametres-temoins`) qui appelle `document.querySelector('bib-consent')?.showPreferences()`.

### 5.12 Autres pièces de la coquille
- **Web components** (tous chargés depuis `bibudem/ui@1`) :
  - `<udem-urgence>` : bannière d'urgence de l'UdeM ;
  - `<bib-avis bouton-fermer>` : avis, CSS var `--bib-avis-spacing-inline` ;
  - `<bib-consent>` : il charge en iframe `/consent/server/` (`static/consent/server/index.html`) ;
  - `<bib-gtm>`, `<bib-clarity>` : analytique conditionnée au consentement ;
  - `<bib-retroaction-usager>` : rétroaction de l'usager.
- **`SkipTo.jsx`** : `<a href="#main-content">Aller au contenu</a>`, hors écran (`left -9999px`, opacité 0). Au focus : `left 50%`, `translateX(-50%)`, opacité 1, fond blanc, `padding .75rem 1rem`, `z 1101`.
- **`Debug.jsx`** (hors production) : pastille fixe en haut à gauche avec le breakpoint courant, le DPR et la plage. Utilise `color` et `contrast-color`.
- **`SuperHero/SuperHeroLvl2.jsx`** : hero des pages de niveau 2 et plus, à partir de `frontmatter.superHero { imageName, title }`.
  - **cadre** : `position absolute`, `top = useBannersHeight(['udem-urgence'])`, `height 230px`, pleine largeur ;
  - **image** : GatsbyImage `FULL_WIDTH` de la source `super-heroes`, recherchée par `name === imageName`, `loading eager` ;
  - **voile** : `rgba(0,0,0,.40)` ;
  - **titre** : `<h2>` variante `textWhite` (taille h2 globale), aligné en bas à droite dans un LayoutContainer (`padding 0 0 .5rem`, `0 215px 48px 0` à partir de md) ;
  - **espaceur** : `calc(230px - 5rem)`, car l'AppBar sticky chevauche le hero.
  - Les images disponibles sont listées en section 7.
  - `SuperHeroContext` transmet `{ inlineOffset, bottomOffset }`.
- **`RetroactionUsager.jsx`** (`src/components`) : MUI Alert info, `my 32px`, largeur 100 % (40 % à partir de sm), `bg #EEF4F7`, variables CSS `--bib-comp-retroaction-usager-title-weight: 600` et `--md-sys-typescale-label-large-size: .875em`. Il contient `<bib-retroaction-usager/>`.
- **Utilitaires de mise en page** (`src/components/utils`) :
  - `LayoutContainer` : `max-width 1536px`, `margin 0 auto`, `px 20px` (64 px à partir de md) ;
  - `LayoutGrid` : Grid2 container, `spacing 64px`, `outter` ajoute le même padding ;
  - `ConditionalWrapper` ;
  - `Div` : `styled('div')` ;
  - `GridOffset`, `LayoutTable` (`Tr`, `Td`, `Th` sans padding).
- **`Link.jsx`** :
  - une URL absolue ou `//…` donne un `<a>` simple ;
  - un chemin relatif interne (`isInternalLink`) donne un MUI Link sur GatsbyLink ;
  - style : `bleuPrincipal`, sans soulignement, souligné au survol ;
  - prop `Icon` (`true` = ArrowRight 1.125rem), en `inline-flex` avec `gap .375em`.
- **`CustomIcons.jsx`** : `SofiaIcon` et les `Arrow*CircleIcon` ont une signature boguée, `(color, sx, ...props)` au lieu de `({...})` : leurs props sont ignorées. `BurgerIcon` est correct.
- **Contexte autour du contenu** : les icônes Phosphor reçoivent `IconContext` (taille 2rem, couleur `grey[700]`), et les templates exposent `window.bib.theme`.

---

## 6. `src/templates/*`

Les templates reçoivent `pageContext = { id, lvl, frontmatter (brut), breadcrumb: { location, crumbs } }`. Les requêtes GraphQL `query($id)` sont exécutées, mais `data` n'est jamais utilisé.

### PageTemplate.jsx (par défaut)
- **Niveau** : `lvl = frontmatter.lvl ?? pageContext.lvl`. Seul ce template accepte la surcharge, utilisée par `horaires/test.mdx` (`lvl: 1`).
- **Drapeaux** :
  - `hasSecondaryNav = lvl > 1` ;
  - `isHomePage = pathname === '/'`.
- **Composants MDX** : `MDXProvider components={commonComponents}`, liste en fin de section.
- **Défilement vers l'ancre** (`location.hash`) :
  1. après 50 ms, `scrollIntoView({ block: 'start', behavior: smooth, ou auto si prefers-reduced-motion })` ;
  2. un ResizeObserver sur `body` refait le défilement (debounce de 100 ms) ;
  3. arrêt après 3 s d'inactivité, au maximum après 15 s, ou au premier wheel, touchstart ou keydown.
- **Ordre de rendu** :
  1. `<Debug>` (hors production) ;
  2. `<SkipTo>` ;
  3. `<udem-urgence style="position:relative; z-index:1101">` ;
  4. si `lvl < 2` : `<bib-avis bouton-fermer>` avec `--bib-avis-spacing-inline: 0`, `position relative`, `z-index 1101`, `translateZ(0)` ;
  5. `TopAppBarSm` sous 1200 px, sinon `TopAppBar` ;
  6. `QuickLinksSm` sous 900 px, sinon `QuickLinks` ;
  7. si `lvl > 1` et `superHero` : `<SuperHeroLvl2>` ;
  8. si `lvl ≥ 2` : `<bib-avis bouton-fermer>` avec `--bib-avis-spacing-inline` à 20 px sous 900 px (64 px au-delà) et `margin-top` à 1rem sous 1200 px (0 au-delà) ;
  9. le contenu, selon le niveau :
     - `lvl ≥ 2` et < 1200 px : Box `px 20px`, `pt 60px`, contenu principal sans colonne de navigation ;
     - `lvl ≥ 2` et ≥ 1200 px : Box `pt 60px` > LayoutContainer > LayoutGrid > Grid container (largeur 100 %, `spacing` xs 1, sm 3, lg 4) > Grid `size 3` (`.bib-secondary-nav-col`, SecondaryNav) + Grid `size 9` (`.bib-main-content-col`, contenu principal) ;
     - `lvl < 2` : contenu principal seul, pleine largeur. Le MDX gère sa propre mise en page avec `SuperHero2`, `Section`, etc. ;
  10. `<Footer>` ;
  11. `<bib-consent>`, `<bib-gtm>`, `<bib-clarity>`.
- **Contenu principal** :
  - Breadcrumbs, si `lvl > 1` ;
  - `<main id="main-content" role="main">`, dont le premier enfant a `margin-top` et `padding-top` à 0 ;
  - le contenu MDX ;
  - RetroactionUsager, **sauf sur l'accueil**, enveloppé dans un LayoutContainer si `lvl < 2`.
- **Head** : HtmlHead.

### DocTemplate.jsx (`template: doc`, utilisé par `dev/components/*`)
- Comme PageTemplate, avec ces différences :
  - **jamais** de SecondaryNav ni de SuperHero ;
  - pas de défilement vers l'ancre ni de surcharge de `lvl` ;
  - `<bib-avis>` unique, après les QuickLinks, `spacing-inline` à 20 ou 64 px ;
  - la RetroactionUsager est toujours affichée ;
  - `console.log` du thème.
- Head : HtmlHead.

### BlankTemplate.jsx (`template: blank`, utilisé par `dev/consent*`, `dev/clarity`, `dev/nouvelles/*`)
- `MDXProvider` **sans** composants : `commonComponents` n'est pas disponible.
- `<Debug>` hors production, puis `<Container component="main" role="main">{children}</Container>`.
- Pas de header, de footer, de bannières ni de web components.
- Head :
  - `<html lang="fr">` ;
  - SEO (titre) ;
  - **toujours** `<meta name="robots" content="noindex">` ;
  - aucun script : les pages chargent les leurs avec `<Script>`.

### NouvelleTemplate.jsx
- `lvl = pageContext.lvl`, soit 3.
- Fil d'Ariane : `crumbs.splice(2, 1)` retire le maillon de l'année. Exemple : Accueil › nouvelles › slug.
- **Ordre de rendu** :
  1. SkipTo ;
  2. `<udem-urgence>` puis `<bib-avis bouton-fermer>`, sans style, **avant** l'AppBar ;
  3. AppBar ;
  4. QuickLinks ;
  5. SuperHeroLvl2, si `frontmatter.superHero` ;
  6. `<Container>` (MUI, 1536 px) qui contient le fil d'Ariane, `main`, le contenu et la RetroactionUsager ;
  7. Footer et web components.
- Pas de navigation secondaire.
- Le reste du frontmatter (`type`, `newsImage`, `newsUrl`, `source`, `authors`) n'est **pas rendu** par le template ; il sert aux listes de nouvelles.
- **Head** : HtmlHead, plus un JSON-LD :
  ```json
  { "@context":"https://schema.org", "@type":"NewsArticle", "headline": title,
    "datePublished": d, "dateModified": d,
    "author": authors?.map(a => ({ "name": a.split(',')[0] })) }
  ```
  - `d = date.replace(/\.000Z$/i, '-05:00')`.

### `commonComponents.js` (composants MDX disponibles sans import)
- MUI : AlertTitle, Box, Divider, Grid (Grid2), List, ListItem, ListItemText, ListItemButton, ListItemIcon, Typography.
- Locaux : Accordion, AccordionDetails, AccordionGroup, AccordionSummary, Alert, Button, Card2, CardWithIcon, CardWithImage, Carousel1, FlipCardWithBg, FlipCardWithImage, ImageHoverCard, HeroWithImage, HeroWithText, HeroWithText2, IconInSquare, Link, RichList, RichListItemWithLink, Section, SuperHero2, Tabs1, AccordionGroupScienceOuverte.
- Factices : Hero, Bloc.

### Frontmatter réellement utilisé (99 fichiers)

| clé | occurrences |
|---|---|
| title | 99 |
| slug | 62 |
| crumbLabel | 47 |
| superHero | 40 |
| secondaryNav | 34 |
| template | 27 |
| type, source, date | 17 |
| newsImage | 16 |
| noindex | 8 |
| newsUrl | 4 |
| lvl, description, authors | 1 |

- Champs de forme objet :
  - `superHero: { imageName, title }` ;
  - `secondaryNav: { title?, order?, hidden? }`.

---

## 7. `static/` et `src/pages/`

### `static/` (copié tel quel dans `public/`, 48 fichiers)
- **`_redirects`** (347 lignes) :
  - format Netlify, `source<TAB ou espace>destination`, sans code de statut ;
  - des caractères `*` en fin de source (« splat » ou préfixe) ;
  - commentaires `#` ;
  - environ 344 règles : anciennes URL de guides (`/amenagement*`, `/citer/…`, `/droit*`, …) vers `https://boite-outils.bib.umontreal.ca/…`, et `/travailler/…` vers `https://studio.bib.umontreal.ca/…` ;
  - section « Adresses simplifiées » : `/matinees https://www.facebook.com/groups/655999033385375/` ;
  - le site n'est pas hébergé sur Netlify. Le dépôt ne montre pas quel serveur interprète ce fichier : à vérifier côté serveur des Bibliothèques.
- **`consent/server/index.html`** :
  - page autonome `noindex` qui charge `bib-consent-server.js` (`bibudem/ui@1`) ;
  - `<bib-consent-server allowed-origins="https://bib.umontreal.ca https://*.bib.umontreal.ca https?://localhost https?://localhost:*">` ;
  - **`bib-pp.umontreal.ca` n'y figure pas**, alors que la version de dev (`content/pages/dev/consent-server.mdx`) l'inclut ;
  - `robots.txt` en production interdit `/consent/`.
- **`ddia/`** (`index.html`, `app.js`, `styles.css`, `logo-ets.svg`, `logobib.svg`) : application autonome « DDIA – Déclaration détaillée de l'utilisation de l'IA générative ». Elle tourne avec React 18 UMD, Babel standalone (unpkg) et Figtree via Google Fonts.
- **`radaria/`** (`index.html`, `app.js`, `engine.js`, `styles.css`, `logobib.svg`, `data/{eligibility,questions,scoring,tools}.json`) : application autonome « Radar IA », un questionnaire en JS natif.
  - Ces deux dossiers sont synchronisés par `.github/workflows/sync-depots.yml` depuis `bibudem/ddia` et `bibudem/radar-ia` (rsync vers `static/<dossier>/`, puis PR vers `main`).
  - Aucun lien vers eux dans `content/` ni `src/`.
- **`images/`** : `logo-udem-bib.png` (image SEO et Twitter), `carre-UdeM_monde-RGB.svg`, `logo-bib/logo-bib-U-blanc.svg` et `logo-bib/logo-bib-sceau-bleu.svg` (pied de page).
- **PDF servis à des URL fixes** :
  - `a-propos/` : rapports annuels 2022-23 et 2023-24, organigramme, planification stratégique, rapport de 2e consultation, programme Premiers Peuples ;
  - `a-propos/carriere/*.pdf` (3) ;
  - `a-propos/politiques-reglement/*.pdf` (2) ;
  - `engagements/` (2) ;
  - `nous-soutenir/politique-dons-2025-adoptee.pdf` ;
  - `nouvelles/2025-10-17-concours-bourses-blrcs/*.pdf` (3) ;
  - `obtenir/` (4 formulaires et grilles) ;
  - `recherche/` (1) et `recherche/diffuser/` (2).
- **Autres fichiers** :
  - `pret-renouvellement-avis/formConsetement.JPG` ;
  - `google10fbb0b5a79d8815.html` et `google7a8631aef33be042.html` (vérification Search Console) ;
  - un `.DS_Store`.

### `src/pages/`
- Un seul fichier, **`404.jsx`** :
  - TopAppBarSm ou TopAppBar, avec un seuil à 900 px (et non 1200 px comme les templates), sans `lvl` ni `location` ;
  - QuickLinks ;
  - `<main>` centré :
    - image `@/images/404/im_um_404.png` (80vw sur mobile, 50vw à partir de md) ;
    - h2 `bleuFonce` « Désolés... nous n'avons pas trouvé ce que vous demandez. » ;
    - texte « Cette page n'existe plus ou a été déplacée » ;
    - Button contained vers `/` « Retour à la page d'accueil » (icône ArrowForward) ;
  - Footer ;
  - Head : seulement `<title>Page non trouvée</title>` (ni `lang`, ni scripts de web components).

### Images liées à la coquille
- **Hero** (`content/pages/images/super-heroes`) : accueil.jpg, default.jpg, engagements, enseignement, espaces, etudes, horaire, horaires-bib, nous-joindre, noussoutenir, obtenir, recherche (`.webp`).
- **Composants** : `src/images/burger/*.webp`, `src/images/logo-udem/*.svg`, `src/images/logo-bib/*.svg`.
- **Icônes** : `src/icons/*.svg` (sofia, burger, arrow-*-circle, cc, by, icone-fleche-verte).
- Le dossier racine `images/` (fichiers sources) n'est pas utilisé par le build.

---

## 8. `src/hooks/` et `src/utils/`

### Hooks
| fichier | rôle |
|---|---|
| `use-small.jsx` | `useSmall(bp = 'sm')` = `useMediaQuery(theme.breakpoints.down(bp))` (sans `noSsr`, donc `false` au SSR) |
| `use-search-index.jsx` | chargement SWR et index MiniSearch (section 2.4) |
| `use-site-metadata.jsx` | `useStaticQuery` de `siteMetadata` |
| `use-banners-height.jsx` | `useBannersHeight(selectors)` : somme des `getBoundingClientRect().height` des bannières (`udem-urgence`, `bib-avis`), suivie par un ResizeObserver ; sert à positionner les hero en absolu |
| `use-breakpoint.jsx` | renvoie `{ i, key, match }` du breakpoint courant (hooks appelés dans une boucle) |
| `use-is-external.jsx` | `useIsExternal(href, { icons })` : `{ isExternal, linkProps: { rel: 'noopener' } si externe, linkIcon }`, l'icône étant ArrowRightCircle (interne) ou ArrowUpRightCircle (externe) en `bleuPrincipal` |

### Utils
| fichier | rôle |
|---|---|
| `link.js` | `internalHostnames` = `bib.umontreal.ca`, `*.bib.umontreal.ca`, `bib-pp.umontreal.ca`, `*.bib-pp…`, `bib-prod.umontreal.ca`, `*.bib-prod…` ; `isInternalLink(href)` : `new URL(href, 'https://bib.umontreal.ca')`, origine `null` (mailto, tel) = externe, sinon test du hostname |
| `bibliotheques.js` | CommonJS `{ bibliotheques }` : 17 entrées `{ id, titre, autreTitre }`, utilisées par l'index de recherche et `RepertoirePersonnel` |
| `api-horraire-bibliotheques.js` | `biblioMap` construit depuis `CarteHoraires/points-de-service.json` (`codeBib` → `{ titre, ancre }`) ; `getBiblioByCode`, `getBiblioAncre`, `getBiblioTitre` |
| `dateTimeUtils.js` | date-fns, locale fr-CA : `toDate`, `getFirstDayOfWeekDate` (semaine commençant le dimanche), `getLastSundayISODate`, `formatDaysOfWeekHeader`, `formatWeekHeader`, `addWeekISODate`, `getDay` (pour les horaires) |
| `quoi-de-neuf.js` | constantes de la section « Quoi de neuf » de l'accueil : `ITEM_HEIGHT { xs: auto, md: 8.75rem }`, `ITEM_GAP 1rem`, `ITEM_PADDING_TOP 1.25rem`, `ITEM_PADDING_BOTTOM { xs: 1.25rem, md: 0 }`, `TITLE_LINES 3`, `clampLines()` |
| `noop.js` | fonction vide |

---

## Points à trancher pour la réimplémentation Astro
1. **Slug des pages** : le `slug:` du frontmatter de `content/pages` est ignoré aujourd'hui. Il faut décider si on garde l'URL actuelle (`slugify(nom de fichier)`) ou si on applique le slug. Une seule divergence aujourd'hui : `financement-monographie`.
2. **Slugs des nouvelles** :
   - ils gardent la casse (`…-LSH`) et ne sont pas slugifiés ;
   - le cas de deux fichiers qui partagent le même slug n'est pas géré ;
   - le maillon de l'année est retiré du fil d'Ariane.
3. **Chemins de navigation et URL** : `site-navigation.json` utilise des chemins non slugifiés, sans slash pour les fichiers et avec slash pour les index. La correspondance avec les URL de page fonctionne seulement parce que les noms de fichiers sont déjà des slugs.
4. **Correspondances par préfixe** : la regex des enfants n'est pas ancrée, et `isActive` est un simple `startsWith`. Il faut vérifier les effets de bord avec des préfixes communs.
5. **Rendu responsive** : tout passe par `useMediaQuery`. En Astro, il faut rendre les deux variantes (desktop et mobile) et basculer en CSS pur avec les seuils 900 et 1200 px. Il faut aussi rendre le fil d'Ariane mobile au serveur.
6. **Taille de la racine** : la racine fait 17 px (18 px à partir de 900 px), alors que MUI suppose 16 px. Toutes les valeurs en rem du thème en dépendent.
7. **Sitemap** : ses exclusions ne couvrent ni les pages `noindex` ni `/fiche-personnel/`, `/widget-horaire/` ou `/formulaire-consentement-inscription/`.
8. **Iframe de consentement** : l'`allowed-origins` du serveur statique n'inclut pas `bib-pp.umontreal.ca`.
9. **HTML invalide** : dans `TopAppBarSm`, un IconButton en contient un autre (boutons imbriqués).
10. **Code mort, à ne pas porter** :
    - `typography-lvl-1/n.js` ;
    - le mode sombre et `LightDarkContext` ;
    - le gtag et Clarity des plugins Gatsby (commentés) ;
    - les nœuds `SiteNavigation`, `MdxRoutes`, `recursiveMenu`, `fetchNavigation` ;
    - les `console.log` du thème.
