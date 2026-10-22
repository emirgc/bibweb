/*
 * Extrait texte d'un corps MDX brut, pour l'index de recherche interne.
 *
 * La source (makeExcerpt de coquille-web) traitait le MDX ligne par ligne
 * avec des expressions régulières : des restes de props passaient dans
 * l'index (« Image= imageWidth= imageHeight= », « small small small »), et les
 * pages faites seulement de composants (À propos) n'avaient aucun extrait.
 * On analyse plutôt le MDX en arbre (sans le compiler, ce qui reste rapide) :
 * on garde le texte des nœuds et les props textuelles des composants qui
 * portent du contenu lisible (title, description…), et on écarte imports,
 * exports, expressions JS et autres attributs.
 */
import { fromMarkdown } from 'mdast-util-from-markdown'
import { mdxFromMarkdown } from 'mdast-util-mdx'
import { mdxjs } from 'micromark-extension-mdxjs'

// Props dont la valeur est du texte destiné au lecteur
const PROPS_TEXTE = new Set(['title', 'subtitle', 'description', 'texte', 'text', 'label', 'question', 'reponse'])

// Nœuds sans texte lisible
const NOEUDS_IGNORES = new Set(['mdxjsEsm', 'mdxFlowExpression', 'mdxTextExpression', 'code', 'html', 'image', 'imageReference', 'definition'])

// Nœuds de bloc : on les sépare d'une espace (un titre puis un paragraphe)
const BLOCS = new Set(['paragraph', 'heading', 'listItem', 'tableCell', 'mdxJsxFlowElement', 'blockquote'])

type Noeud = {
  type: string
  value?: string
  children?: Noeud[]
  attributes?: { type: string; name?: string; value?: unknown }[]
}

// Texte brut d'un nœud, pour le comparer au titre de la page
const texteBrut = (noeud: Noeud): string => noeud.value ?? (noeud.children ?? []).map(texteBrut).join('')

// Le titre de la page, souvent répété par SuperHero ou un premier titre
// (markdown ou Typography),
// gaspillerait le début de l'extrait : on l'écarte quand il forme un bloc
// entier (et seulement alors, pour ne pas couper « Obtenir un document »).
function collecter(noeud: Noeud, morceaux: string[], titre: string) {
  if (NOEUDS_IGNORES.has(noeud.type)) return
  if (BLOCS.has(noeud.type) && titre && texteBrut(noeud).trim() === titre) return
  if (noeud.type === 'text' || noeud.type === 'inlineCode') {
    morceaux.push(noeud.value ?? '')
    return
  }
  if (noeud.type === 'mdxJsxFlowElement' || noeud.type === 'mdxJsxTextElement') {
    for (const attribut of noeud.attributes ?? []) {
      if (attribut.type === 'mdxJsxAttribute' && PROPS_TEXTE.has(attribut.name ?? '') && typeof attribut.value === 'string' && attribut.value.trim() !== titre) {
        morceaux.push(` ${attribut.value} `)
      }
    }
  }
  for (const enfant of noeud.children ?? []) collecter(enfant, morceaux, titre)
  if (BLOCS.has(noeud.type)) morceaux.push(' ')
}

/*
 * Markdown pur (.md) : on ne l'analyse pas en MDX (un <br> ou des accolades
 * y seraient des erreurs). Ses directives sont ramenées à leur texte : les
 * lignes :::nom et ::: disparaissent, ::bouton[Texte]{…} donne « Texte » et
 * les icônes :icone[nom] sont retirées.
 */
function sansDirectives(corps: string) {
  return corps
    .replace(/^\s*:{3,}.*$/gm, '')
    .replace(/:icone\[[^\]]*\](\{[^}]*\})?/g, '')
    .replace(/:{1,2}[a-z][\w-]*\[([^\]]*)\](\{[^}]*\})?/g, '$1')
}

function texteDu(corps: string, titre: string, markdown: boolean) {
  try {
    const arbre = (
      markdown ? fromMarkdown(sansDirectives(corps)) : fromMarkdown(corps, { extensions: [mdxjs()], mdastExtensions: [mdxFromMarkdown()] })
    ) as unknown as Noeud
    const morceaux: string[] = []
    collecter(arbre, morceaux, titre)
    return morceaux.join('')
  } catch {
    // MDX que l'analyseur refuse (ne devrait pas arriver : Astro l'a compilé) :
    // on se rabat sur le texte débarrassé des balises et des expressions.
    return corps.replace(/<[^>]*>|\{[^{}]*\}/g, ' ')
  }
}

/** `markdown` : corps d'une page .md (sinon, du MDX) */
export function extrait(corps: string | undefined, titre?: string, longueur = 200, markdown = false) {
  if (!corps) return ''

  const texte = texteDu(corps, titre?.trim() ?? '', markdown).replace(/\s+/g, ' ').trim()

  if (texte.length <= longueur) return texte
  // Coupe à la fin d'un mot
  const coupe = texte.slice(0, longueur + 1)
  const fin = coupe.lastIndexOf(' ')
  return `${(fin > longueur * 0.6 ? coupe.slice(0, fin) : texte.slice(0, longueur)).trim()}…`
}

// Champs des vitrines qui portent du texte destiné au lecteur
const CHAMPS_TEXTE = new Set(['titre', 'texte', 'appel', 'description'])

function textesDe(valeur: unknown, morceaux: string[]) {
  if (Array.isArray(valeur)) valeur.forEach((v) => textesDe(v, morceaux))
  else if (valeur && typeof valeur === 'object') {
    for (const [cle, v] of Object.entries(valeur)) {
      if (typeof v === 'string' && CHAMPS_TEXTE.has(cle)) morceaux.push(v)
      else if (typeof v === 'object') textesDe(v, morceaux)
    }
  }
}

/** Extrait d'une vitrine : textes de sa bannière et de ses sections, dans l'ordre de la page */
export function extraitVitrine(sections: unknown[], titre?: string, longueur = 200) {
  const morceaux: string[] = []
  textesDe(sections, morceaux)
  return extrait(morceaux.join('\n\n'), titre, longueur, true)
}
