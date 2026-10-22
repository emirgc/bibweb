import type { APIRoute } from 'astro'
import { toutesLesPages, toutesLesNouvelles, estExclueDeLaRecherche, estVitrine, urlDePage, urlDeNouvelle } from '@/lib/contenu'
import { bibliotheques } from '@/data/bibliotheques'
import { personnel } from '@/lib/personnel'
import { extrait, extraitVitrine } from '@/lib/extrait'

/*
 * Index de la recherche interne, généré au build en fichier statique
 * (/search-index.json), au format de coquille-web :
 * [{ title, excerpt, url, section }]. La boîte de dialogue de recherche
 * (components/coquille/Recherche.astro) ne le charge qu'à l'ouverture.
 *
 * Écart voulu : les pages et les nouvelles portent en plus `words`, les mots
 * de tout leur texte. La source ne cherchait que dans le titre et les 200
 * premiers caractères : « Sofia » ou « citer » ne trouvaient rien. Chaque mot
 * n'y figure qu'une fois (l'ordre et la fréquence ne servent pas au
 * classement, qui privilégie le titre) : l'index reste léger.
 */

export const prerender = true

type Entree = { title: string; excerpt: string; url: string; section: 'Pages' | 'Nouvelles' | 'Bibliothèques' | 'Personnel'; words?: string }

// Pages utilitaires publiées mais sans intérêt pour la recherche, exclues par
// leur nom dans coquille-web (SEARCH_EXCLUDED_NAMES) en plus des dossiers de
// démo et des pages noindex que couvre estExclueDeLaRecherche.
const NOMS_EXCLUS = new Set(['tests', 'fiche-personnel', 'widget-horaire'])

// Mots distincts d'un texte (lettres et chiffres, apostrophes et traits
// d'union compris), sans tenir compte de la casse
function motsDistincts(texte: string) {
  const vus = new Map<string, string>()
  for (const mot of texte.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []) {
    const cle = mot.toLowerCase()
    if (!vus.has(cle)) vus.set(cle, mot)
  }
  return [...vus.values()].join(' ')
}

export const GET: APIRoute = async () => {
  const entrees: Entree[] = []

  for (const page of await toutesLesPages()) {
    const title = page.data.title
    if (!title || estExclueDeLaRecherche(page) || NOMS_EXCLUS.has(page.id.split('/').pop() ?? '')) continue
    const texte = (longueur?: number) =>
      estVitrine(page) ? extraitVitrine([page.data.banniere, ...page.data.sections], title, longueur) : extrait(page.body, title, longueur, page.filePath?.endsWith('.md'))
    entrees.push({ title, excerpt: texte(), url: urlDePage(page), section: 'Pages', words: motsDistincts(texte(Infinity)) })
  }

  for (const nouvelle of await toutesLesNouvelles()) {
    const { title } = nouvelle.data
    entrees.push({ title, excerpt: extrait(nouvelle.body, title), url: urlDeNouvelle(nouvelle), section: 'Nouvelles', words: motsDistincts(extrait(nouvelle.body, title, Infinity)) })
  }

  for (const { id, titre, autreTitre } of bibliotheques) {
    entrees.push({ title: titre, excerpt: autreTitre !== titre ? autreTitre : '', url: `/espaces/#${id}`, section: 'Bibliothèques' })
  }

  // Il n'y a pas de fiche par personne : l'entrée mène au répertoire, qui
  // préremplit sa recherche avec ?q=
  for (const personne of personnel()) {
    entrees.push({
      title: personne.nomComplet,
      excerpt: [personne.fonction, personne.direction].filter(Boolean).join(' — '),
      url: `/nous-joindre/notre-equipe/?q=${encodeURIComponent(personne.nomComplet)}`,
      section: 'Personnel',
    })
  }

  return new Response(JSON.stringify(entrees), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
