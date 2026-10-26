// Relevé des pages de Studio·bib et de la Boîte à outils pour la recherche
// bento (src/components/coquille/Recherche.astro). Ni l'un ni l'autre ne
// permet d'interroger sa recherche depuis un autre domaine (pas d'en-tête
// CORS) : on relève leurs pages ici, à la main, et le build les verse dans
// /search-index.json. Les fichiers produits (src/data/recherche/) sont
// versionnés : le build ne dépend pas du réseau.
//
// Usage : npm run indexer:externes (à relancer quand l'un des sites change
// beaucoup ; la date du relevé est écrite dans chaque fichier).
import { mkdirSync, writeFileSync } from 'node:fs'

const STUDIO = 'https://studio.bib.umontreal.ca'
const OUTILS = 'https://boite-outils.bib.umontreal.ca'
const DOSSIER = 'src/data/recherche'
// Requêtes simultanées vers la Boîte à outils : assez pour finir vite, assez
// peu pour ne pas charger le serveur de Springshare
const SIMULTANEES = 4
const LONGUEUR_EXTRAIT = 200

const aujourdhui = new Date().toISOString().slice(0, 10)

const ENTITES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', laquo: '«', raquo: '»', eacute: 'é', egrave: 'è', agrave: 'à', ccedil: 'ç' }
const decoder = (texte) =>
  texte
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (tout, nom) => ENTITES[nom.toLowerCase()] ?? tout)

const texteDe = (html) =>
  decoder(
    html
      .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim()

// Même règle que src/pages/search-index.json.ts : chaque mot une fois
function motsDistincts(texte) {
  const vus = new Map()
  for (const mot of texte.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []) {
    const cle = mot.toLowerCase()
    if (!vus.has(cle)) vus.set(cle, mot)
  }
  return [...vus.values()].join(' ')
}

function couper(texte, longueur = LONGUEUR_EXTRAIT) {
  if (texte.length <= longueur) return texte
  const coupe = texte.slice(0, longueur)
  return `${coupe.slice(0, coupe.lastIndexOf(' ')).replace(/[\s,;:.–-]+$/, '')}…`
}

async function lire(url, type = 'text') {
  const reponse = await fetch(url, { headers: { 'User-Agent': 'bibweb-indexer (bib.umontreal.ca)' } })
  if (!reponse.ok) throw new Error(`${url} : ${reponse.status}`)
  return reponse[type]()
}

/*
 * Studio·bib (Docusaurus et @easyops-cn/docusaurus-search-local) publie son
 * index : [titres de pages, titres de sections, descriptions, …, contenus],
 * chacun lié à sa page par `p` (ou `i` pour les pages elles-mêmes).
 */
async function studio() {
  const [pages, sections, descriptions, , contenus] = await lire(`${STUDIO}/search-index.json`, 'json')
  const parPage = new Map(pages.documents.map((d) => [d.i, { titre: d.t, url: d.u, description: '', textes: [] }]))
  for (const d of descriptions.documents) {
    const page = parPage.get(d.p)
    if (page && !page.description) page.description = d.t
  }
  for (const d of [...sections.documents, ...contenus.documents]) parPage.get(d.p)?.textes.push(d.t)
  return [...parPage.values()].map((page) => ({
    title: page.titre,
    excerpt: couper(page.description || page.textes.join(' ')),
    url: `${STUDIO}${page.url}`,
    words: motsDistincts(page.textes.join(' ')),
  }))
}

/*
 * Boîte à outils (LibGuides) : pas d'index public, mais un sitemap. On lit
 * chaque page : nom du guide et de la page (h1), description du guide,
 * texte du contenu principal.
 */
async function boiteOutils() {
  const sitemap = await lire(`${OUTILS}/sitemap.xml`)
  const urls = [...sitemap.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(([, url]) => decoder(url))
  const entrees = []
  const echecs = []
  let suivante = 0
  const ouvrier = async () => {
    while (suivante < urls.length) {
      const url = urls[suivante++]
      try {
        const html = await lire(url)
        const h1 = html.match(/<h1[^>]*id="s-lg-guide-name"[^>]*>([\s\S]*?)<\/h1>/)
        if (!h1) continue
        // « Guide: Accueil » : la page d'accueil d'un guide prend le nom du guide
        const titre = texteDe(h1[1]).replace(/:\s*Accueil$/i, '')
        const description = texteDe(html.match(/id="s-lg-guide-description"[^>]*>([\s\S]*?)<\/(?:span|div)>/)?.[1] ?? '')
        const debut = html.indexOf('id="s-lg-guide-main"')
        const fin = html.indexOf('id="s-lib-footer', debut)
        const contenu = debut === -1 ? '' : texteDe(html.slice(debut, fin === -1 ? undefined : fin).replace(/^[^>]*>/, ''))
        entrees.push({ title: titre, excerpt: couper(description || contenu), url, words: motsDistincts(contenu) })
      } catch (erreur) {
        echecs.push(String(erreur.message ?? erreur))
      }
    }
  }
  await Promise.all(Array.from({ length: SIMULTANEES }, ouvrier))
  if (echecs.length) console.warn(`Boîte à outils : ${echecs.length} page(s) illisible(s)\n  ${echecs.join('\n  ')}`)
  return entrees.sort((a, b) => a.url.localeCompare(b.url))
}

mkdirSync(DOSSIER, { recursive: true })
for (const [nom, relever] of [
  ['studio', studio],
  ['boite-outils', boiteOutils],
]) {
  const entrees = await relever()
  if (!entrees.length) throw new Error(`${nom} : aucune page relevée, fichier laissé tel quel`)
  const fichier = `${DOSSIER}/${nom}.json`
  writeFileSync(fichier, `${JSON.stringify({ releve: aujourdhui, entrees }, null, 1)}\n`)
  console.log(`${fichier} : ${entrees.length} pages`)
}
