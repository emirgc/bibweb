/*
 * Images des bannières (SuperHero, SuperHero2, BanniereSection), désignées
 * par leur nom de fichier sans extension (`imageName="recherche"`), comme la
 * source GraphQL `super-heroes` de coquille-web.
 *
 * import.meta.glob les résout au build : un nom inconnu fait échouer le build
 * avec un message clair, au lieu du plantage au rendu de la source.
 */
import type { ImageMetadata } from 'astro'

const IMAGES = import.meta.glob<{ default: ImageMetadata }>('/src/content/pages/images/super-heroes/*.{jpg,jpeg,png,webp,avif}', { eager: true })

const PAR_NOM = new Map(Object.entries(IMAGES).map(([chemin, module]) => [chemin.split('/').pop()!.replace(/\.[^.]+$/, ''), module.default]))

export function imageBanniere(nom: string): ImageMetadata {
  const image = PAR_NOM.get(nom)
  if (!image) {
    throw new Error(`Image de bannière introuvable : « ${nom} ». Noms disponibles (src/content/pages/images/super-heroes/) : ${[...PAR_NOM.keys()].join(', ')}`)
  }
  return image
}

// Les bannières couvrent toute la largeur de la fenêtre. On ne demande pas de
// variante plus large que l'original : Astro l'agrandirait pour rien.
const LARGEURS = [640, 960, 1280, 1600, 1920, 2400]

export function largeursPour(image: ImageMetadata, largeurs: number[] = LARGEURS) {
  const utiles = largeurs.filter((l) => l < image.width)
  return [...utiles, Math.min(image.width, largeurs[largeurs.length - 1])]
}
