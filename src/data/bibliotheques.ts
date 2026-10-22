/*
 * Métadonnées des bibliothèques et points de service (src/utils/bibliotheques.js
 * dans coquille-web), pour la recherche interne et le répertoire du personnel.
 *
 * Dérivées de src/data/horaires/lieux.ts, qui fait foi : un lieu avec une
 * fiche dans /espaces/ et /nous-joindre/, dans l'ordre des fiches.
 * - `id` est l'ancre de la fiche (`fiche.id`), majuscule de « Hubert-reeves »
 *   comprise, pour ne pas casser les liens existants ;
 * - `autreTitre` est le nom complet du lieu, sans son sigle entre
 *   parenthèses (« (BLSH) »), ou le titre s'il ne fait que le répéter ;
 * - `alias` sert au répertoire du personnel, dont le tableur nomme parfois
 *   un lieu autrement.
 */
import { lieuxAvecFiche } from './horaires/lieux'

export type MetaBibliotheque = { id: string; titre: string; autreTitre: string; alias: string[] }

const comparable = (texte: string) => texte.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')

export const bibliotheques: MetaBibliotheque[] = lieuxAvecFiche.map(({ name, aliases, fiche }) => {
  const titre = fiche!.titre
  const nom = name.replace(/\s*\([^)]*\)$/, '')
  return { id: fiche!.id, titre, autreTitre: comparable(nom) === comparable(titre) ? titre : nom, alias: aliases ?? [] }
})
