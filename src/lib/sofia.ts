/*
 * Formulaires de recherche Sofia (WorldCat Discovery) : celui de l'accueil
 * (RechercheSofiaAccueil) et celui du menu (PanneauMenu).
 *
 * Un vrai formulaire GET : sans JavaScript, la recherche part quand même
 * (sans le préfixe « kw: », que WorldCat n'exige pas). brancherRechercheSofia
 * ajoute le préfixe, comme la source.
 */

export const ACTION_SOFIA = 'https://umontreal.on.worldcat.org/search'

/** Champs cachés du formulaire ; la saisie s'appelle `queryString` */
export const PARAMETRES_SOFIA = {
  clusterResults: 'true',
  baseScope: 'wz:11098',
  lang: 'fr',
  stickyFacetsChecked: 'on',
  changedFacet: 'database',
  database: 'Xwc',
  overrideStickyFacetDefault: 'true',
}

/** Branche les formulaires [data-recherche-sofia] (côté client) */
export function brancherRechercheSofia() {
  // Appelée par chaque composant qui a un formulaire : un seul branchement
  for (const formulaire of document.querySelectorAll<HTMLFormElement>('[data-recherche-sofia]:not([data-branche])')) {
    formulaire.setAttribute('data-branche', '')
    formulaire.addEventListener('submit', (e) => {
      const saisie = formulaire.elements.namedItem('queryString') as HTMLInputElement
      e.preventDefault()
      const url = new URL(formulaire.action)
      for (const [nom, valeur] of new FormData(formulaire)) if (nom !== 'queryString') url.searchParams.set(nom, String(valeur))
      // URLSearchParams encoderait « : » ; on garde l'URL de la source
      window.location.href = `${url}&queryString=kw:${encodeURIComponent(saisie.value)}`
    })
  }
}
