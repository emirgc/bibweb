/*
 * Petits outils de style partagés par les composants MDX.
 *
 * Le contenu converti passe `style` en chaîne ou en objet JSX ; les
 * composants y ajoutent leurs propres variables (largeurs de Grid, props
 * système de Box). On fusionne tout en une seule chaîne pour l'attribut.
 */

export type ValeurStyle = string | number | undefined | null | false
export type Style = string | Record<string, ValeurStyle> | undefined | null

/** Seuils du thème (MUI) : xs, sm, md, lg, xl */
export const POINTS = ['xs', 'sm', 'md', 'lg', 'xl'] as const
export type Point = (typeof POINTS)[number]
export type Responsive<T> = T | Partial<Record<Point, T>>

// Propriétés numériques qui restent sans unité, comme en React
const SANS_UNITE = new Set(['flex', 'flex-grow', 'flex-shrink', 'opacity', 'order', 'z-index', 'font-weight', 'line-height', 'zoom'])

function enKebab(cle: string) {
  return cle.startsWith('--') ? cle : cle.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
}

function versCss(style: Style): string {
  if (!style) return ''
  if (typeof style === 'string') return style.trim().replace(/;?$/, style.trim() ? ';' : '')
  return Object.entries(style)
    .filter(([, v]) => v !== undefined && v !== null && v !== false && v !== '')
    .map(([cle, v]) => {
      const prop = enKebab(cle)
      const valeur = typeof v === 'number' && !prop.startsWith('--') && !SANS_UNITE.has(prop) ? `${v}px` : String(v)
      return `${prop}:${valeur};`
    })
    .join('')
}

/** Fusionne plusieurs styles ; le dernier l'emporte (le `style` de l'auteur) */
export function fusionnerStyles(...styles: Style[]): string | undefined {
  const css = styles.map(versCss).join('')
  return css || undefined
}

/** Espacement MUI : un nombre vaut n × 8 px, une chaîne passe telle quelle */
export function espacement(valeur: ValeurStyle): string | undefined {
  if (valeur === undefined || valeur === null || valeur === false || valeur === '') return undefined
  if (typeof valeur === 'number') return `${valeur * 8}px`
  return /^-?\d*\.?\d+$/.test(valeur) ? `${Number(valeur) * 8}px` : valeur
}

/** Ramène une valeur responsive à un objet { point: valeur } */
export function parPoint<T>(valeur: Responsive<T> | undefined): Partial<Record<Point, T>> {
  if (valeur === undefined || valeur === null) return {}
  if (typeof valeur === 'object' && !Array.isArray(valeur)) {
    const resultat: Partial<Record<Point, T>> = {}
    for (const p of POINTS) if (p in (valeur as object)) resultat[p] = (valeur as Record<Point, T>)[p]
    return resultat
  }
  return { xs: valeur as T }
}

/** Accepte `class` (Astro) et `className` (contenu repris de React) */
export function classes(...valeurs: unknown[]): string | undefined {
  const liste = valeurs.filter((v): v is string => typeof v === 'string' && v.trim() !== '')
  return liste.length ? liste.join(' ') : undefined
}
