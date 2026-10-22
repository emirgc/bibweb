/*
 * Moteur de la recherche interne : charge l'index statique et MiniSearch à
 * la demande (première ouverture ou survol du bouton), puis cherche et
 * regroupe les résultats par section. Rien n'est téléchargé tant que
 * personne ne cherche : l'index et MiniSearch pèsent plus que la coquille.
 */
import type MiniSearch from 'minisearch'
import { avecBase } from '@/lib/chemin'

export type Resultat = { title: string; excerpt: string; url: string }
export type Groupe = { section: string; items: Resultat[] }

// `words` (mots de tout le texte d'une page) sert à chercher, pas à afficher
type Document = Resultat & { id: number; section: string; words?: string }

// Les accents sont ignorés (« pret » trouve « Prêt ») : en français, on tape
// souvent sans accent, et la tolérance aux fautes ne suffisait pas à combler
// l'écart sur les mots courts.
const sansAccents = (terme: string) => terme.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

let chargement: Promise<MiniSearch<Document>> | undefined

export function chargerIndex() {
  chargement ??= Promise.all([import('minisearch'), fetch(avecBase('/search-index.json')).then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))])
    .then(([{ default: MiniSearchClasse }, donnees]: [{ default: typeof MiniSearch }, Omit<Document, 'id'>[]]) => {
      const index = new MiniSearchClasse<Document>({
        fields: ['title', 'excerpt', 'words'],
        storeFields: ['title', 'excerpt', 'url', 'section'],
        processTerm: sansAccents,
        searchOptions: {
          prefix: true, // des résultats dès les premières lettres
          fuzzy: 0.2, // tolère les petites fautes de frappe
          // Un mot du titre compte plus que l'extrait, qui compte plus que le
          // reste de la page : la page qui porte le sujet passe en tête
          boost: { title: 2, words: 0.5 },
        },
      })
      index.addAll(donnees.map((entree, id) => ({ id, ...entree })))
      return index
    })
    .catch((erreur) => {
      // On permet une nouvelle tentative à la prochaine ouverture
      chargement = undefined
      throw erreur
    })
  return chargement
}

/** Résultats groupés par section, dans l'ordre de leur premier résultat (score) */
export function chercher(index: MiniSearch<Document>, requete: string): Groupe[] {
  if (!requete.trim()) return []
  const groupes = new Map<string, Resultat[]>()
  for (const { title, excerpt, url, section } of index.search(requete)) {
    if (!groupes.has(section)) groupes.set(section, [])
    groupes.get(section)!.push({ title, excerpt, url })
  }
  return Array.from(groupes, ([section, items]) => ({ section, items }))
}
