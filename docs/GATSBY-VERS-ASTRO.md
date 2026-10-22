# De Gatsby à Astro : ce qu'on a trouvé, ce qu'on a réglé, et pourquoi Astro

Bilan de la conversion du site des Bibliothèques de l'UdeM, de `coquille-web` (Gatsby 5, React 18, MUI 6) vers `bibweb` (Astro 7). État au 21 octobre 2026.

Public : le responsable de la conversion et l'équipe web (développeurs et rédacteurs). Le document se lit seul ; les détails techniques sont dans `docs/inventaire/` (constats sur la source), `docs/A-FAIRE.md` (suivi), `docs/CONVENTIONS.md` (règles du code) et `docs/REDACTION.md` (guide des rédacteurs).

---

## 1. En bref

- **Même site, mêmes adresses.** Les 73 pages communes aux deux sites répondent toutes (statut 200), avec le même texte, les mêmes liens et les mêmes descriptions, hors écarts voulus. Les 344 redirections de la source sont reprises.
- **Le site Gatsby fonctionnait, mais avec beaucoup de défauts invisibles** : HTML invalide (liens et boutons imbriqués), pages sans `h1`, version mobile qui n'apparaissait qu'après le chargement du JavaScript (d'où des sauts de mise en page), contenu mêlé de code de présentation (plus de 550 `sx` et `style` dans le contenu), données recopiées à plusieurs endroits, code mort, un bogue qui ignorait le champ `slug` des pages, une collision d'URL entre deux nouvelles.
- **On a corrigé en convertissant**, plutôt que de reporter ces défauts : accessibilité (visée WCAG 2.2 AA), sauts de mise en page ramenés à 0 sur les pages mesurées, une seule source pour chaque donnée, des dizaines de coquilles et de liens cassés réparés.
- **Les rédacteurs écrivent maintenant en Markdown ou en YAML**, sans JSX ni couleurs en code : 37 pages de texte en `.md`, 10 vitrines (accueil et pages de section) en `.yaml`. Il ne reste en MDX que 9 pages applicatives (horaires, répertoire, formulaires…) et la page science ouverte, en chantier.
- **Astro envoie du HTML, pas une application React.** Une page de texte n'envoie plus React ni MUI ; une seule page charge un îlot React (`/horaires/`, la carte interactive).
- **Points d'attention** : Astro 7 exige Node 22.22 ou plus récent, alors que le serveur des Bibliothèques est en Node 20.11 ; un composant s'appuie sur une API interne d'Astro (`renderJSX`) ; le build complet et l'audit d'accessibilité final restent à faire (section 5).

---

## 2. Ce qu'on a trouvé dans Gatsby

Les constats ci-dessous viennent des trois inventaires (`docs/inventaire/01` à `03`) et des commentaires des composants convertis. Les chemins sont relatifs à `~/Documents/git/coquille-web`.

### 2.1 Architecture et dépendances

| Élément | Dans la source |
| :-- | :-- |
| Cadre | Gatsby 5 : React 18 côté navigateur, GraphQL au build, webpack |
| Interface | MUI 6 (Material UI) et Emotion (CSS en JavaScript) |
| Dépendances | 52 paquets, dont 21 extensions `gatsby-*` |
| Extensions locales | 3, dont une **copie locale de `gatsby-plugin-mdx` en préversion** (`5.14.0-next.2`, `plugins/gatsby-plugin-mdx`) |
| Contenu | 128 fichiers MDX 2 (11 574 lignes, environ 1 920 balises de composants) |
| Données | un tableur Excel (personnel), un JSON (revue de presse) non suivi par git, des fiches de bibliothèques en MDX |
| Node | `^20.11.1` (`engines` du `package.json`), build lancé avec 8 Go de mémoire (`--max-old-space-size=8192`) |

Quelques choix de plomberie surprenants :

- **Le thème est étendu deux fois** (`tokens.js` exporte déjà `extendTheme(tokens)`, puis `tokens/index.js` le refait).
- **Des fichiers de typographie par niveau** (`typography-lvl-1.js`, `typography-lvl-n.js`) ne sont importés nulle part.
- **Un mode sombre câblé mais inopérant** : un contexte `LightDarkContext` lu par aucun composant, une prop `darkMode` ignorée.
- **Le menu de section est construit deux fois** : l'extension `gatsby-plugin-bib-secondary-nav` crée des nœuds GraphQL, les interroge… puis ignore le résultat et relit le disque (`lib/getMenu.js`).
- **La racine du texte est à 17 px (18 px dès 900 px) en pixels fixes**, alors que MUI suppose 16 px : toutes les tailles en `rem` du thème en dépendent, et le réglage « taille du texte » du navigateur n'avait aucun effet.
- **Les requêtes GraphQL des gabarits sont exécutées, mais leur résultat n'est jamais utilisé** : les gabarits lisent le frontmatter brut injecté dans `pageContext`.

### 2.2 Performance : du JavaScript partout, et une version mobile tardive

**Tout le site est une application React.** Même une page de texte sans aucune interaction charge React, MUI, le routeur et les données de la page. Mesure faite le 21 octobre 2026 sur la source construite (serveur local, sans compression ni cache) :

| Page de la source | JavaScript du site | JavaScript externe (web components, Corvée) |
| :-- | :-- | :-- |
| `/` (accueil) | 12 fichiers, 293 Ko | 389 Ko |
| `/obtenir/pret-renouvellement-retour/diplomes/` | 9 fichiers, 265 Ko | 419 Ko |
| `/conditions-utilisation/` | 8 fichiers, 262 Ko | 420 Ko |

Le JavaScript externe (bandeaux d'urgence et d'avis, consentement, rétroaction, analytique) est le même dans les deux sites ; il ne dépend pas de la conversion.

**La version mobile n'existait qu'après l'hydratation.** Les variantes mobile et bureau étaient choisies en JavaScript (`useMediaQuery`, via le crochet `useSmall`). Au rendu serveur, ce crochet vaut toujours « faux » : le HTML livré est **toujours celui du bureau**. Sur un téléphone, la page s'affiche d'abord en version bureau, puis React la remplace par la version mobile. C'est le cas de l'en-tête, du fil d'Ariane, des héros, des cartes, des carrousels, des fiches de bibliothèques. Le fil d'Ariane mobile (`BreadcrumbSm`) n'était même pas dans le HTML : il était calculé dans le navigateur.

D'autres composants posaient leurs styles **après** le chargement, dans un `useEffect` : `Section` (la bande était transparente au premier affichage), `Card2` et `CardWithIcon` (carte bleue avant de prendre sa couleur), `GridOffset` (largeur fausse puis corrigée), `Liste`, le cas des PDF de `Button`.

Résultat mesurable : des **sauts de mise en page** (CLS, « Cumulative Layout Shift » ; Google considère 0,1 comme la limite d'un bon score). Mesure du 21 octobre 2026, une fois par page, cache désactivé (source construite sur le port 9000, conversion sur le serveur de développement) :

| Page | Source, 390 px | Conversion, 390 px | Source, 1440 px | Conversion, 1440 px |
| :-- | --: | --: | --: | --: |
| `/` | **0,160** | 0,000 | 0,000 | 0,000 |
| `/espaces/` | **0,197** | 0,000 | 0,000 | 0,000 |
| `/obtenir/pret-renouvellement-retour/diplomes/` | 0,060 | 0,000 | — | — |
| `/nous-joindre/` | 0,051 | 0,000 | 0,026 | 0,000 |
| `/obtenir/` | 0,008 | 0,000 | — | — |

Le contraste entre mobile et bureau confirme la cause : à 1440 px, la version livrée est déjà la bonne ; à 390 px, elle est remplacée après coup.

**Autres coûts relevés :**

- `@mui/x-data-grid` (une grille de données complète) était importé dans le répertoire du personnel **uniquement pour ses traductions françaises** (`frFR`).
- Le carrousel chargeait la bibliothèque embla, et **capturait la molette verticale** : au-dessus d'un carrousel, on ne pouvait plus faire défiler la page.
- Les images : 299 images, dont une photo de **21 Mo** (`nouvelles/2026/images/bourses-blrcs.jpg`, 6016 × 4016 px), 16 images de plus de 2400 px de côté, plusieurs PNG de 1,3 à 2,9 Mo.
- `@iframe-resizer/react`, `material-ui-popup-state`, `react-intersection-observer`, `swr`, `date-fns`, `embla-carousel-react`, `color`, `contrast-color`… autant de dépendances pour des besoins que le navigateur couvre aujourd'hui en natif ou en quelques lignes.

### 2.3 Accessibilité

- **Pas de `h1`** sur les pages de niveau 2 et plus : le premier titre du contenu était un `##`, et le titre de la bannière (le nom de la section) était un `h2` placé **avant**. Ailleurs, des `h1` promus à la main en `<Typography component="h1">`, sans lien d'ancre. Les 14 nouvelles répétaient leur titre dans le corps en `<Typography component='h1'>`.
- **HTML invalide, signalé par tous les validateurs :**
  - **boutons imbriqués** dans l'en-tête mobile (`TopAppBarSm` : un `IconButton` qui en contient un autre) ;
  - **liens imbriqués** dans chaque ligne de liste de liens (`RichListItemWithLink` : un bouton-lien dans un lien), soit 45 occurrences dans les pages réelles ;
  - **un lien dans un bouton** dans les fiches de bibliothèques (`FicheBibliotheque` : l'ancre `#id` dans le bouton de l'accordéon) ;
  - attributs `xmlns:cc` et `xmlns:dct` (non valides en HTML) sur la mention de licence.
- **Onglets cassés** : `Tabs1` reliait ses panneaux à des `id` qui n'existaient pas (et en double si deux groupes d'onglets étaient sur la page) ; `HorairesHorizontalTabs` et `DialogueHorizontalTabs` n'avaient ni rôles, ni état, ni flèches.
- **Cartes à révélation réservées à la souris** : `FlipCardWithImage` ne révélait sa description qu'au survol, pas au clavier ; le fondu de MUI posait `visibility: hidden`, ce qui rendait la description **inaccessible aux lecteurs d'écran** ; des `div` focalisables sans action, avec un `aria-label` en anglais (« Card: … »).
- **Champs sans étiquette** : la recherche Sofia de l'accueil, la recherche des horaires et celle du répertoire n'avaient qu'un texte indicatif (placeholder), parfois avec un `aria-description` non standard.
- **`role="alert"` sur des encadrés statiques** (MUI) : les lecteurs d'écran les annonçaient au chargement comme une urgence.
- **18 annonces simultanées** sur `/horaires/` : chaque fiche avait sa propre région `role="status"` (« Chargement de l'horaire de la semaine… »).
- **Contrastes insuffisants**, par exemple : titre vert pâle sur rose dans `AccordionGroupScienceOuverte` (environ 2,4:1, contre 4,5:1 exigés) ; icônes de `IconInSquare` à 1,9:1 sur bleu 600 et 1,75:1 sur vert foncé ; liens bleus sur bandes foncées (1,6:1 sur vert foncé) ; le séparateur MUI de la recherche (moins de 1,3:1).
- **Cibles minuscules** : pastilles de pagination du carrousel de 5 px de haut, sans état annoncé.
- **La barre de liens rapides se dépliait toute seule** (environ 300 px pendant 3 s au chargement), par-dessus le contenu.
- Icônes YouTube et Instagram du pied de page **sans aucun texte** ; titre du pied de page en `h4` (niveaux sautés) ; page 404 sans `h1`.

### 2.4 Contenu : code et contenu mêlés

Le MDX de la source est autant du code que du texte :

| Dans les 128 fichiers MDX | Nombre |
| :-- | --: |
| Lignes d'`import` en tête de page | 540 (dans 88 fichiers) |
| Imports jamais utilisés | 79 |
| Props `sx` (styles MUI en JavaScript) | 298 (dans 43 fichiers) |
| Attributs `style={{…}}` | 260 (dans 39 fichiers) |
| Couleurs hexadécimales en dur dans les `sx` | 70 |
| Balises `<Grid>` | 231 |
| `<Typography>` | 182 |
| Tableaux en composants MUI (`Table`, `TableRow`, `TableCell`…) | 10 fichiers |
| Tableaux Markdown | 0 |

Exemple : une même liste à icônes est écrite à la main, avec ses styles, dans 7 pages de prêt :

```jsx
<ul style={{ listStyleType: "none", paddingLeft: 0 }}>
<li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><BooksIcon size={32} color="BleuFonce"/> Nombre maximum de documents: 100 documents</li>
```

`color="BleuFonce"` n'est pas une couleur CSS valide (28 occurrences) : l'icône prenait simplement la couleur du texte. La même page `diplomes.mdx` importe 7 composants de tableau MUI et 4 icônes avant la première phrase.

Autres signes :

- **Ancienne API MUI** : 3 pages passaient à `Grid` (v2) des props de l'ancienne version (`item xs={12} md={8}`), silencieusement ignorées.
- **Composants déclarés dans le contenu** : `export const CollectionsDisplay = () => { useTheme(); useMediaQuery(…) }` dans `nos-collections-speciales.mdx`, un `useEffect` qui crée un `<script>` dans `clavarder.mdx`.
- **La page science ouverte** fait 2 307 lignes, 159 `sx`, 78 `style`, des requêtes média écrites à la main et 29 nombres provisoires (`[Nombre]`).
- **Liens relatifs ambigus** : selon que le lien passe par le composant `Link` (qui traite la page comme un dossier) ou par Markdown (résolu par le navigateur), un même `../` mène à deux endroits. Cinq pages de prêt avaient un lien `../pret-renouvellement-retour/#…` qui ne marche que sans la barre oblique finale.

### 2.5 Données en double

- **Les bibliothèques étaient décrites trois fois** : 19 fiches MDX (`content/bibliotheques/`), 17 entrées dans `src/utils/bibliotheques.js` (recherche, répertoire), et `horaires.mdx` (674 lignes) qui **recopiait à la main** les adresses et contacts de 16 fiches. S'y ajoute `points-de-service.json` (20 lieux) pour la nouvelle carte des horaires.
- **Trois générations de composants d'horaires** coexistaient : `ListeHoraires` (page `/horaires/` en ligne), `CarteHoraires` (page de test `/horaires/test/`, plus récente et plus accessible), et `horaire/HoraireAujourdHui` (page démo, dont l'API répond 422).
- **Les liens du menu, du pied de page et des liens rapides** étaient écrits en dur dans les composants (`SideNavContent.jsx`, `LocalFooter.jsx`, `QuickLinks.jsx`).

### 2.6 Bizarreries et bogues

| Constat | Où |
| :-- | :-- |
| **Le champ `slug` des pages était toujours ignoré** : le code lit `node.frontmatter?.slug` sur un nœud de fichier, où ce champ n'existe pas. Heureusement : appliqué, il aurait déplacé `a-propos/carriere/` vers `/a-propos/carriere/carriere/`. | `gatsby-node.mjs` |
| **Pour les nouvelles, le slug est appliqué, et deux nouvelles ont le même** : `heures-ouverture-blsh` et `bourse-Bazin` donnent la même URL. La dernière générée gagne : l'URL de la bourse affichait l'ouverture de la BLSH, et l'autre nouvelle n'avait pas de page. | `content/nouvelles/2025/` |
| Une nouvelle de travaux de février 2026 datée du **21 février 2024**, et dont le titre contient encore « à partir du **XX** février 2026 ». | `nouvelles/2026/travaux-bibliotheque-LSH.mdx` |
| Le sitemap excluait `/formulaire-consentement` (le slug ignoré), alors que la vraie URL est `/formulaire-consentement-inscription/` ; il ne tenait pas compte de `noindex` (science ouverte, fiche-personnel, widget-horaire y figuraient). | `gatsby-config.mjs` |
| Une page vide de 0 octet générait quand même une page. | `nous-soutenir/accessibilite-web.mdx` |
| Les icônes maison (`SofiaIcon`, flèches en cercle) étaient déclarées `(color, sx, ...props)` au lieu de `({ color, sx, ...props })` : **aucune prop n'était appliquée** (taille, couleur, `aria-*`). | `CustomIcons.jsx` |
| Les flèches « lien interne » et « lien externe » étaient **inversées** dans les cartes à photo. | `CardWithImage.jsx` |
| `Button` considérait `https://studio.bib.umontreal.ca/…` comme un lien interne et le passait au routeur Gatsby ; il écrasait aussi le `rel` fourni (perte de `noreferrer`). | `Button.jsx` |
| `Accordion` **plantait** hors d'un groupe d'accordéons. | `Accordion.jsx` |
| Le groupe d'accordéons « vert pâle » avait le fond… rose (copie fautive). | `AccordionGroupScienceOuverte.jsx` |
| `#00407` (couleur hexadécimale invalide) et la chaîne « false » injectée dans le CSS. | `DialogueHorizontalTabs.jsx` |
| Des commentaires JSX `{/* … */}` collés **dans une chaîne CSS**, des `@keyframes` réinjectés 16 fois sur `/horaires/`, un bleu Bootstrap `#007bff` et des polices système. | `HorairesHorizontalTabs.jsx` |
| Des URL `https:///api.bib…` (trois barres obliques) et un `fetch` qui avale ses propres erreurs. | `HoraireBibProvider.jsx` |
| Les crochets React appelés après des `return` conditionnels (règle des hooks enfreinte). | `FicheBibliotheque/HoraireAujourdhui.jsx` |
| La date des événements affichée était la date de publication du flux, et l'heure, passée à un composant qui ignore son contenu, ne s'affichait jamais. | `ListeEvenements.jsx` |
| Image de repli des événements introuvable (`/images/fallback.jpg`). | `ListeEvenements.jsx` |
| Un formulaire de recherche sans `onSubmit` : la touche Entrée rechargeait la page. | `ListeHoraires/SearchBox.jsx` |
| Le formulaire de consentement ne traitait jamais la redirection de l'iframe (format des messages d'`iframe-resizer` v5 mal lu). | `FormulaireConsentement.jsx` |
| Deux instances du widget LibChat avec le même `id`, et `alert()` en cas d'échec. | `QuickLinks.jsx` |
| Une frise chronologique avec un `h1` en plein contenu, une police « Inter » et une trentaine de couleurs en dur, et un pied de page de démo (« ✦ Compact Timeline \| Center axis \| Colored cards ✦ »). | `ScienceOuverte/TimelineDefault.jsx` |
| `console.log` laissés en production, du lorem ipsum et `{process.env.JSDELIVR_SERVICE_URL}` affiché à l'écran sur une page démo… présente dans le sitemap. | `FichePersonnel.jsx`, `fiche-personnel.mdx` |
| Une virgule dans `color: inherit,` annule la déclaration. | `global-styles/header-anchors.css` |
| L'iframe de consentement n'autorisait pas le domaine de préproduction `bib-pp.umontreal.ca`. | `static/consent/server/index.html` |
| Paramètres de suivi Google Analytics (`_gl=…`) collés dans des liens du pied de page ; « Géolndex » (l minuscule au lieu d'un I). | `LocalFooter.jsx` |
| Liens courriel cassés : `mailto7077duParc@…`, `mailto=pret-kinesiologie@…`, `sante@…` sans `mailto:`, `href="#"` en production. | fiches de bibliothèques, `horaires.mdx` |
| Composants jamais utilisés : `ImageHoverCard` (pourtant global), `ClickableFlipCard`, `Close`, `ListeNouvellesRich`, trois anciens formulaires, `DisplayTimeline` (importé, jamais rendu), `Microformat`, les composants factices `Hero` et `Bloc`. | `src/components/` |
| Coquilles dans le contenu : « 1 477 335Livres », « parmis », « bibliopthèques », « Prennez », « oportunités », « Papyprus », « Négotiation », « cherchers », « Gratuir »… | `content/pages/` |

---

## 3. Ce qu'on a corrigé ou amélioré

### 3.1 Accessibilité (visée : WCAG 2.2 AA)

**Structure et HTML valide**

- **Un `h1` sur chaque page.** Un plugin (`src/plugins/rehype-titre-principal.mjs`) monte d'un niveau les titres des pages de niveau 2 et plus qui n'ont pas de `h1`, en gardant leur apparence et leurs ancres. 158 titres écrits en `<Typography>` sont redevenus des titres Markdown, avec leur lien d'ancre. Le titre de la bannière de section n'est plus un titre (il précédait le `h1`). Les ancres sont identiques avant et après (comparaison automatique).
- **Plus d'imbrication invalide** : un seul bouton Menu dans l'en-tête mobile ; un seul lien par ligne de liste de liens et par carte (le lien est sur le titre et couvre toute la carte) ; les fiches de bibliothèques sont des `<details>` natifs. Le compilateur d'Astro 7 refuse d'ailleurs un lien dans un lien ou un bouton dans un bouton.
- **Titres bien hiérarchisés** dans les composants : le niveau des titres de cartes, de listes et de fiches se règle (`niveauTitre`) au lieu d'être un `h3` ou un `h4` en dur ; les sous-titres en `h6` sont devenus des paragraphes ; titre du pied de page en `h2` ; page 404 avec un `h1`.

**Clavier et lecteurs d'écran**

- **Onglets, accordéons, carrousel et menu selon les motifs de l'APG** (le guide des pratiques de création ARIA du W3C) : rôles, état, flèches, Début et Fin ; liaison onglet-panneau réelle ; pas de défilement automatique ; carrousel nommé par son titre, « n sur N » pour chaque carte.
- **Cartes à révélation au clavier et au toucher**, et leur description reste lue par les lecteurs d'écran.
- **Étiquettes visibles** sur les champs (recherche Sofia de l'accueil, répertoire du personnel, recherche des horaires) ; formulaire Sofia en repère `role="search"`.
- **Une seule annonce** au chargement de `/horaires/` au lieu de 18 ; nombre de résultats annoncé dans le répertoire et dans la recherche du site.
- **Encadrés sans `role="alert"`** ; la sévérité (information, avertissement…), que seules l'icône et la couleur portaient, est dite en texte masqué.
- **Liens qui ouvrent un nouvel onglet annoncés** (« nouvel onglet ») ; liens vers des PDF annoncés (« PDF ») ; icônes sociales nommées.
- **Clavarder** est un vrai bouton (c'était un lien vers « # ») ; un échec de chargement est dit dans la page au lieu d'un `alert()`.
- **Le focus n'est jamais caché** sous l'en-tête collant ni sous la barre mobile des liens rapides (WCAG 2.4.11).
- **L'ordre du focus suit l'ordre visuel** (menu, pied de page), sans réordonnancement CSS.

**Couleurs et lecture**

- **Contrastes calculés, pas devinés** : par exemple, icônes de `IconInSquare` portées de 1,9:1 à 3,75:1 sur bleu 600 et de 1,75:1 à 4,02:1 sur vert foncé ; liens, focus et texte orange redéfinis pour chaque fond de bande (un lien sur vert foncé était à 1,6:1) ; texte orange du thème à 5,5:1 sur rose 100 à la place d'un `#b72600` en dur ; titre vert des accordéons passé au vert foncé ; flèche des cartes rose de 2,2:1 à 3,74:1 ; citations de 4,3:1 au texte secondaire du thème ; texte indicatif de la recherche Sofia à 4,5:1.
- **La taille du texte du navigateur est respectée** : la racine passe de `17px` fixes à `106.25 %` (puis `112.5 %` dès 900 px). Le rendu par défaut est identique au pixel près ; un lecteur qui a choisi un texte plus grand l'obtient enfin.
- **Texte agrandi à 200 %** : bannières, cartes et titres des listes Quoi de neuf ne sont plus rognés ni coupés (11 titres coupés à 0 sur l'accueil).
- **Longueur de ligne limitée** à environ 73 caractères (jeton `--mesure-texte`, 52ch ; WCAG 1.4.8 recommande 80 au plus, Baymard 50 à 75), alors que la source laissait le texte monter jusqu'à environ 160 caractères par ligne sur grand écran.
- **Couleurs forcées** (mode contraste élevé de Windows) : un état ne repose jamais sur la seule couleur de fond.
- **Mouvement réduit respecté** partout ; la barre de liens rapides ne se déplie plus toute seule par-dessus le contenu.

### 3.2 Performance

- **HTML complet au premier affichage**, mobile et bureau : les deux variantes sont dans le HTML et la bascule se fait en CSS. Plus de `useMediaQuery`, plus de styles posés après le chargement.
- **CLS à 0,000** sur toutes les pages mesurées (tableau de la section 2.2), contre 0,16 à 0,20 sur l'accueil et `/espaces/` de la source à 390 px. Sur les pages à contenu tiers, une hauteur est réservée : formulaire de consentement de 0,47–0,56 à 0 / 0,044 / 0 (390 / 900 / 1440 px), « Nous écrire » de 0,24–0,38 à 0,005 au plus, LibChat de 0,12 à 0,001 au plus, répertoire du personnel de 0,20 à 0. Les polices sont préchargées : le saut dû à l'échange de police (0,19 sur `/conditions-utilisation/` à 900 px) est à 0.
- **Pas de React sur les pages de texte ni sur les vitrines.** L'interactivité passe par le HTML natif (`<details name>` pour les accordéons exclusifs, `<dialog>` pour la recherche) et de petits scripts. Un seul îlot React dans tout le site : la carte des horaires (`/horaires/`), chargée quand elle devient visible.
- **Carrousel sans bibliothèque** : défilement natif avec `scroll-snap`, utilisable sans JavaScript ; la molette n'est plus capturée.
- **Images optimisées au build** (`astro:assets`) : formats AVIF et WebP, plusieurs largeurs, chargement différé hors du premier écran ; photos du personnel recadrées au build. Les fichiers sources eux-mêmes sont en WebP : les 202 JPEG et PNG convertis (82,8 Mo → 16,9 Mo), ramenés à 2400 px au plus ; la photo de 21 Mo pèse maintenant 666 Ko ; les photos du personnel sont ramenées à 200 × 200 px (affichées à 100 px) : 23 Mo → 668 Ko.
- **Index de recherche** : chargé seulement à l'ouverture de la recherche (138 Ko, environ 41 Ko compressé).

### 3.3 Contenu et rédaction

- **Deux formats simples à la place du MDX** :
  - **pages de texte en Markdown** (`.md`), avec un petit vocabulaire de *directives* en français pour les besoins récurrents (`:::modalites`, `:::alerte`, `:::tableau`, `::bouton`, `:::accordeon`, `:::cartes`, `:icone[nom]`…) ;
  - **vitrines en YAML** (`.yaml`) : l'accueil et les pages de section sont des données (bannière, puis un bloc par section, 17 types de blocs).
- **Le build vérifie le contenu** et nomme le fichier et la ligne fautifs : directive ou attribut inconnu, icône inexistante, couleur hors du thème, image ou bannière introuvable, deux fichiers pour la même URL.
- Exemple : la page `diplomes` passe de 71 lignes de MDX (11 imports, styles en ligne, 7 composants de tableau) à 38 lignes de Markdown. La liste à icônes de la section 2.4 s'écrit maintenant :

  ```markdown
  :::modalites
  - :icone[books] Nombre maximum de documents: 100 documents
  - :icone[calendar-dots] Durée du prêt: 30 jours
  :::
  ```

  et le tableau est un tableau Markdown ordinaire.
- **Liens relatifs réécrits en chemins absolus** : plus d'ambiguïté selon la barre oblique finale.
- **Liens cassés réparés** (courriels mal formés, `href="#"`, itinéraire de Hubert-Reeves qui menait au répertoire du personnel, paramètres de suivi retirés).
- **Coquilles corrigées** : une vingtaine dans les pages (liste dans `A-FAIRE.md`), plus « GéoIndex ».
- **Nouvelles** : chaque nouvelle a sa propre page (collision de la source levée : `/nouvelles/2025/heures-ouverture-blsh/` existe, et l'URL de la bourse montre la bourse) ; le titre est dans le gabarit (plus de titre répété en `<Typography>` dans le corps) ; un champ `titreAffiche` reprend le titre affiché de la source quand il différait du `title` (3 nouvelles) ; la nouvelle des travaux de la LSH est datée de 2026.
- **Recherche interne vérifiée et améliorée** : « Sofia » et « citer » ne trouvaient rien, déjà dans la source ; l'index contient maintenant les mots des pages et des nouvelles (champ `words`) ; 213 URL de l'index vérifiées (toutes à 200).
- **Page en anglais** (`ill-external-libraries`) : `lang: en` dans le frontmatter met le titre, la bannière et le fil d'Ariane en anglais pour les lecteurs d'écran.

### 3.4 Design et expérience

Le bilan complet et à jour des changements de design est dans `docs/CHANGEMENTS-DESIGN.md` (le menu, notamment, a changé depuis).

Travail fait le 21 octobre 2026 :

- **Nouveau menu** : un rideau qui descend sous l'en-tête, au lieu du tiroir latéral de MUI ; **une seule `<nav>`** commandée par les boutons Menu des deux barres. Thème clair aux couleurs de la marque, au lieu des gris foncés codés en dur du menu source (`#222930`, `#2a3440`, `#c8cbcf`).
  - Mobile et tablette : recherche Sofia en tête, pages principales, accès rapide en tuiles, services (Studio·bib, Boîte à outils, Ressources) en accordéons ; pied collé avec « Je donne » et une poignée qu'on peut glisser vers le haut pour fermer.
  - Bureau : catalogue des services avec aperçu (onglets verticaux de l'APG ; le survol attend un court délai pour qu'un trajet en diagonale ne change pas d'onglet), accès rapide en colonne à droite, sous le bouton Menu.
- **Accueil** : bannière plein écran dès 1200 px ; l'accroche « L'outil de recherche Sofia » reste visible, en petit, sur mobile et tablette (la source la masquait sous 600 px).
- **Barre du haut** : voile bleu foncé uni sur la bannière, sans le fondu en bas.
- **Titres des listes de liens** à taille fixe (1,3333rem, puis 1,5rem dès 900 px) : ils prenaient la taille des `h2` du thème, jusqu'à 3,5rem.
- **Ancre de `/service-accessibilite/`** (« Accès à des versions accessibles… ») rétablie avec l'identifiant de la source.

Avant :

- **Une seule échelle d'espacement**, par rôle (`--espace-element`, `--espace-bloc`, `--espace-bande`…), au lieu de marges ajoutées à la main page par page. Deux bandes voisines de même fond ne sont plus séparées par une double marge (96 px au lieu de 192 px à 1440 px).
- **Navigation de section sur mobile** : un volet « Dans cette section » sous le fil d'Ariane ; dans la source, la colonne disparaissait sous 1200 px et les pages sœurs n'étaient plus accessibles que par le menu principal.
- **Erreurs d'API dites en clair** : « Les … ne sont pas disponibles pour le moment » avec un bouton « Réessayer », pour les événements, les formations et les horaires (la liste des formations disparaissait sans un mot).
- **Apparitions au défilement** sur les vitrines seulement, sans contenu caché sans JavaScript, sans décalage de mise en page et coupées si l'utilisateur préfère un mouvement réduit.
- **Partage** : balises Open Graph ajoutées (la source n'avait que Twitter).

### 3.5 Maintenabilité

- **Une donnée, une source** : les lieux sont décrits une fois (`src/data/horaires/lieux.ts`) ; la liste des bibliothèques de la recherche et du répertoire en est dérivée ; menu, pied de page et liens rapides sont dans `src/data/navigation.ts`. Brossard, Place Dupuis et le Jardin botanique sont maintenant trouvés par la recherche.
- **Jetons de design** (`src/styles/tokens.css`) : aucune couleur, durée ou courbe en dur dans les composants.
- **Code mort abandonné** : composants jamais utilisés, pages de démo (`fiche-personnel`, `widget-horaire`, `tests`, `horaires/test`), mode sombre inopérant, double construction du menu, extensions Gatsby commentées.
- **Les composants gardent leur nom d'origine** (`Section`, `CardWithIcon`…) et leurs props réelles : le lien avec la source reste lisible, et chaque correction est expliquée en tête du fichier (« Corrigé : … »).
- **Une page de démonstration par famille de composants** (`/dev/composants/…`) et un contrôle automatique de toutes les pages (`npm run verifier` : statut, pied de page présent, un seul `h1`, niveaux de titres, « [object Object] », débordements à 390 et 1440 px).
- **Configuration réparée** : sitemap qui exclut bien les pages `noindex` et utilitaires ; iframe de consentement ouverte à `bib-pp.umontreal.ca` ; page vide remplacée par une redirection.
- **24 dépendances au lieu de 52.**

---

## 4. Pourquoi Astro plutôt que Gatsby

### 4.1 Ce qu'Astro apporte

| | Gatsby 5 (source) | Astro 7 (conversion) |
| :-- | :-- | :-- |
| Ce que reçoit le navigateur | HTML, puis toute l'application React qui le « réhydrate » | HTML et CSS ; du JavaScript seulement là où il sert |
| Interactivité | Tout est composant React | HTML natif, petits scripts, et des *îlots* React seulement si l'état est complexe (un seul sur tout le site) |
| Mobile et bureau | Choisis en JavaScript après le chargement | Choisis en CSS, dès le premier affichage |
| Styles | CSS en JavaScript (Emotion, `sx`) | CSS ordinaire, limité au composant, et jetons |
| Contenu | MDX avec imports, JSX et styles ; requêtes GraphQL | Collections de contenu typées (schéma zod), Markdown + directives, YAML |
| Erreurs de contenu | Souvent silencieuses (props ignorées, slug ignoré) ou plantage au rendu | Arrêt du build avec le fichier et la ligne |
| Données | Couche GraphQL obligatoire | Import direct de fichiers (TypeScript, JSON, tableur lu au build) |
| HTML invalide | Accepté | Refusé par le compilateur (imbrication, balises non fermées) |
| Dépendances | 52 (dont 21 extensions Gatsby, une en préversion recopiée localement) | 24 |

**Le principe d'Astro correspond à ce site.** Le site des Bibliothèques est surtout du contenu à lire : pages de services, règlements, horaires, nouvelles. Gatsby traite chaque page comme une application ; Astro la traite comme un document, et n'ajoute du JavaScript qu'aux quelques endroits interactifs (recherche, carte des horaires, répertoire, carrousels). C'est la raison principale des gains de la section 3.2.

**Les collections de contenu typées protègent les rédacteurs.** Chaque page et chaque vitrine est validée par un schéma : une clé mal écrite, une couleur hors du thème, une image manquante arrêtent le build avec un message clair, au lieu d'un rendu silencieusement faux. Dans la source, le champ `slug` des pages était ignoré depuis le début sans que personne ne le voie.

**Rédiger sans être développeur.** Un rédacteur écrit du Markdown ou remplit des champs YAML ; il ne choisit ni couleur, ni marge, ni balise. Le guide `docs/REDACTION.md` couvre tout ce dont il a besoin. Dans la source, modifier une page de prêt voulait dire toucher à des imports, du JSX et des styles en ligne.

**Moins de pièces à maintenir.** Plus de GraphQL, de webpack, d'Emotion, de MUI ni d'extensions Gatsby. Les mises à jour portent sur une vingtaine de paquets.

### 4.2 L'état de Gatsby

Faits vérifiables :

- La source dépend d'une **copie locale de `gatsby-plugin-mdx` en préversion** (`5.14.0-next.2`) : un signe qu'il a fallu contourner l'extension publiée.
- Sur npm, la dernière version de Gatsby est la **5.16.1, publiée le 10 février 2026** ; Astro a publié la 7.4.2 le 21 octobre 2026. (Consulté le 21 octobre 2026.)
- Gatsby a été racheté par Netlify en 2023 ; le rythme de développement a nettement ralenti depuis.

Nuance : Gatsby 5 fonctionne encore et accepte React 19. Le problème n'est pas qu'il soit cassé, mais que le site porte un coût (JavaScript, complexité, maintenance des extensions) sans en tirer de bénéfice, puisqu'il n'a presque pas d'interactivité.

### 4.3 Limites et points d'attention

- **Node 22.22 ou plus récent est exigé par Astro 7**, alors que le serveur des Bibliothèques est en Node 20.11. Deux solutions : mettre Node à jour sur le serveur, ou construire ailleurs (poste de travail, intégration continue) et ne déployer que le dossier `dist/`, qui est du HTML statique. À noter : Astro 7.4.2 (publiée le 21 octobre 2026) exige déjà Node 22.23.4 ; le projet est sur 7.4.1.
- **API interne d'Astro** : `RenduJsx.astro` utilise `renderJSX` (`astro/runtime/server/jsx.js`) pour afficher le JSX passé en prop dans les pages encore en MDX. Ce n'est pas une API publique : à vérifier à chaque mise à jour d'Astro. Le besoin disparaîtra avec les dernières pages MDX.
- **Les directives et les blocs sont un vocabulaire à nous** : il faut le documenter (c'est fait dans `REDACTION.md`) et le faire évoluer avec soin. Un besoin nouveau demande un développeur (une directive ou un bloc), là où le MDX permettait de bricoler dans la page. C'est voulu, mais c'est une contrainte.
- **Le serveur de développement ne recharge pas tout** : après un changement de plugin ou de schéma, il faut le relancer et vider le cache de contenu (`npm run dev:propre`).
- **Hébergement** : en dev, une URL sans barre oblique finale répond 404 (301 dans la source) ; le comportement réel dépend du serveur. Le fichier `_redirects` (format Netlify) est repris tel quel ; il faut savoir quel serveur l'interprète aux Bibliothèques.
- **Web components externes inchangés** : le bandeau de consentement `bib-consent` couvre environ la moitié de l'écran d'un téléphone, et le site ne peut pas le régler. Une demande est à faire à l'équipe de `@bibudem/ui`.

---

## 5. Ce qui reste à faire ou à valider

Le détail est dans `docs/A-FAIRE.md`. Les principaux points :

**À faire**

- `astro build` complet : temps de build, poids des pages, effet du chargement paresseux des icônes Phosphor.
- Mesurer le JavaScript envoyé par le site construit (les mesures de ce document viennent du serveur de développement pour la conversion, et du site construit pour la source).
- Audit d'accessibilité groupé sur toutes les pages (clavier, lecteur d'écran, contrastes, texte à 200 %, couleurs forcées).
- Déploiement : Node 22 sur le serveur, ou build ailleurs.
- Défauts mineurs restants : petits débordements horizontaux à 200 % de texte (`/recherche/diffuser/kerko/`, `/espaces/`), barre des liens rapides qui recouvre en partie le bouton « Suivant » des carrousels dès 900 px, quelques cibles tactiles sous 44 px (pagination du répertoire, filtres des horaires, formulaires tiers).
- Page science ouverte (noindex, en chantier) à reprendre en vitrine quand son contenu sera arrêté.

**À valider par le responsable ou l'équipe**

- Vocabulaire des directives, noms et champs des blocs de vitrine.
- Séparateur du titre d'onglet : « Titre - Les bibliothèques / UdeM » dans la source, « Titre | … » dans la conversion.
- Collision de slug levée (une page par nouvelle) ; titre des nouvelles tiré du frontmatter ; date affichée sur chaque nouvelle.
- Refonte de `/horaires/` (carte, filtres, semaine du lundi au dimanche).
- Textes de description des trois services dans l'aperçu du menu.

**À corriger par l'équipe de contenu**

- Le titre de la nouvelle des travaux de la LSH contient encore « à partir du XX février 2026 ».
- Deux cartes d'Enseignement (« Salle Perrault » et « Espace d'innovation et de créativité ») mènent au même lien.
- Les valeurs provisoires de la page science ouverte (`[Nombre]`, `[Montant]`, « entre 2024 et 2024 »).
- L'extrait de recherche de `/obtenir/peb/peb-institutions-externes/` commence par « See English version ».

**À demander à d'autres équipes**

- `bib-consent` : hauteur réglable, boutons côte à côte, nom accessible du dialogue.
- API des événements : un cache côté serveur (le flux RSS met 2 à 3 s à répondre).
