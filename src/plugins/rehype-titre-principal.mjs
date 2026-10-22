/*
 * Un seul h1 par page de niveau 2 et plus (WCAG 1.3.1, 2.4.6).
 *
 * Dans coquille-web, ces pages n'ont pas de h1 : leur premier titre est un
 * `##` et la bannière de section n'est pas un titre. Plutôt que de réécrire
 * chaque page, on monte tous les titres markdown d'un niveau (h2 → h1,
 * h3 → h2…) quand le document n'a aucun h1. La classe `apparence-hN` garde
 * l'apparence d'origine (voir global.css) : seule la structure change.
 *
 * Ce plugin passe APRÈS rehype-ancres-titres : les identifiants et les liens
 * d'ancre sont posés sur les niveaux d'origine, donc les URL /page/#section
 * de la source restent valides.
 *
 * Exclus : l'accueil (niveau 0) et les nouvelles, dont le gabarit pose le
 * h1. Les pages de niveau 1 ont en général leur h1 dans SuperHero ou
 * SuperHero2 (dans le corps en MDX, ou `superHero` du frontmatter d'un .md,
 * rendu par GabaritPage) : on n'y touche que si leurs titres commencent plus bas que h2
 * (`###` dans la source de accessibilite-web, conditions-utilisation,
 * service-accessibilite), pour qu'ils commencent à h2 sans saut de niveau.
 * Une page de niveau 1 sans SuperHero (personnel) est traitée comme une page
 * de niveau 2. Le frontmatter `lvl` prime sur le niveau déduit du chemin.
 */

const DOSSIER_PAGES = '/src/content/pages/'
const TITRE = /^h([1-6])$/

/** Niveau d'après le chemin : a/b.mdx = 2, a/index.mdx = 1, index.mdx = 0 */
function niveauDuChemin(chemin) {
  const relatif = chemin.slice(chemin.indexOf(DOSSIER_PAGES) + DOSSIER_PAGES.length).replace(/\.mdx?$/, '')
  const segments = relatif.split('/').filter(Boolean)
  if (segments.at(-1) === 'index') segments.pop()
  return segments.length
}

function parcourir(noeud, visite) {
  visite(noeud)
  for (const enfant of noeud.children ?? []) parcourir(enfant, visite)
}

// Niveau d'un titre en JSX : `<h2>`, `<Typography component="h2">` ou
// `component={'h2'}` ; ces titres ne bougent pas, mais comptent.
function niveauJsx(noeud) {
  if (noeud.type !== 'mdxJsxFlowElement' && noeud.type !== 'mdxJsxTextElement') return null
  if (TITRE.test(noeud.name ?? '')) return Number(noeud.name[1])
  for (const attribut of noeud.attributes ?? []) {
    if (attribut.type !== 'mdxJsxAttribute' || attribut.name !== 'component') continue
    const valeur = typeof attribut.value === 'string' ? attribut.value : attribut.value?.value
    const balise = typeof valeur === 'string' ? valeur.replace(/['"\s]/g, '') : ''
    if (TITRE.test(balise)) return Number(balise[1])
  }
  return null
}

export default function rehypeTitrePrincipal() {
  return (arbre, fichier) => {
    const chemin = (fichier.path ?? fichier.history?.[0] ?? '').split('?')[0]
    if (!chemin.includes(DOSSIER_PAGES)) return

    const lvl = Number(fichier.data?.astro?.frontmatter?.lvl)
    const niveau = Number.isFinite(lvl) ? lvl : niveauDuChemin(chemin)
    if (niveau < 1) return

    const titres = []
    let plusHaut = 7
    // Au niveau 1, le superHero du frontmatter (pages .md) est rendu par
    // GabaritPage avec SuperHero2, qui porte le h1
    let banniere = niveau === 1 && Boolean(fichier.data?.astro?.frontmatter?.superHero)
    parcourir(arbre, (noeud) => {
      if (noeud.type === 'mdxJsxFlowElement' && /^SuperHero2?$/.test(noeud.name ?? '')) banniere = true
      if (noeud.type === 'element' && TITRE.test(noeud.tagName)) {
        titres.push(noeud)
        plusHaut = Math.min(plusHaut, Number(noeud.tagName[1]))
      } else {
        const rang = niveauJsx(noeud)
        if (rang) plusHaut = Math.min(plusHaut, rang)
      }
    })
    // Un h1 dans le contenu : la page gère elle-même sa hiérarchie
    if (plusHaut === 1 || !titres.length) return

    // Premier niveau attendu : h2 sous le h1 de SuperHero ou SuperHero2 (pages
    // de niveau 1), sinon h1. Aux niveaux 2 et plus, la bannière de section
    // n'est pas un titre (coquille/BanniereSection.astro).
    const decalage = plusHaut - (niveau === 1 && banniere ? 2 : 1)
    if (decalage <= 0) return

    for (const titre of titres) {
      const rang = Number(titre.tagName[1])
      titre.properties ??= {}
      titre.properties.className = [...(titre.properties.className ?? []), `apparence-h${rang}`]
      titre.tagName = `h${rang - decalage}`
    }
  }
}
