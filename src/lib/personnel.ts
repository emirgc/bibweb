import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import * as XLSX from 'xlsx'

/*
 * Répertoire du personnel, lu au build depuis
 * src/content/personnel/liste-personnel.xlsx (tenu à jour par l'équipe).
 *
 * Les valeurs du tableur sont nettoyées ici une fois pour toutes (relevé de
 * docs/inventaire/03-contenu-mdx.md §6) : espaces en trop, « BIbliothécaire »,
 * bibliothèques multiples séparées par « ; » ou « | ».
 */

export type Personne = {
  id: string
  prenom: string
  nom: string
  nomComplet: string
  fonction: string
  direction?: string
  disciplines: string[]
  bibliotheques: string[]
  telephone?: string
  courriel?: string
  teams?: string
  /** Nom du fichier de la photo dans src/content/personnel/photos, ou undefined */
  photo?: string
}

// Depuis la racine du projet, comme DOSSIER_BANNIERES (vitrines/schema.ts) :
// un chemin relatif à ce module ne tient plus une fois le code regroupé par
// le build (dist/.prerender/…)
const DOSSIER = join(process.cwd(), 'src/content/personnel/') + '/'

const propre = (v: unknown) => (typeof v === 'string' || typeof v === 'number' ? String(v).replace(/\s+/g, ' ').trim() : '')
const corrigerFonction = (f: string) => f.replace(/^BIbliothécaire/, 'Bibliothécaire')
const liste = (v: string, separateur: RegExp) =>
  v
    .split(separateur)
    .map((x) => x.trim())
    .filter(Boolean)

const versId = (texte: string) =>
  texte
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

let cache: Personne[] | undefined

export function personnel(): Personne[] {
  if (cache) return cache
  const classeur = XLSX.read(readFileSync(`${DOSSIER}liste-personnel.xlsx`))
  const lignes = XLSX.utils.sheet_to_json<Record<string, unknown>>(classeur.Sheets[classeur.SheetNames[0]])
  // La photo est associée sans extension, comme dans coquille-web
  // (« myriam-boyer » trouve « myriam-boyer.webp »).
  const photos = new Map(readdirSync(`${DOSSIER}photos`).map((f) => [f.replace(/\.[^.]+$/, '').toLowerCase(), f]))

  cache = lignes
    .map((l) => {
      const prenom = propre(l.prenom)
      const nom = propre(l.nom)
      const nomComplet = `${prenom} ${nom}`.trim()
      const cle = propre(l.photo).replace(/\.[^.]+$/, '').toLowerCase()
      return {
        id: versId(nomComplet),
        prenom,
        nom,
        nomComplet,
        fonction: corrigerFonction(propre(l.fonction)),
        direction: propre(l.direction) || undefined,
        disciplines: liste(propre(l.disciplines), /[;,|]/),
        bibliotheques: liste(propre(l.bibliotheque), /[;|]/),
        telephone: propre(l.telephone) || undefined,
        courriel: propre(l.courriel) || undefined,
        teams: propre(l.teams) || undefined,
        photo: cle ? photos.get(cle) : undefined,
      }
    })
    .filter((p) => p.nomComplet)
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr') || a.prenom.localeCompare(b.prenom, 'fr'))
  return cache
}

/**
 * Fiche d'une personne : le répertoire filtré sur son nom (?q=), comme les
 * résultats « Personnel » de la recherche du site.
 */
export function urlFichePersonne(personne: Pick<Personne, 'nomComplet'>) {
  return `/nous-joindre/notre-equipe/?q=${encodeURIComponent(personne.nomComplet)}`
}
