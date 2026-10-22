/*
 * Comportement des onglets (Tabs1, DialogueHorizontalTabs), selon le motif
 * Onglets de l'APG WAI-ARIA : tabindex itinérant, flèches, Début et Fin,
 * activation automatique au déplacement du focus.
 *
 * Amélioration progressive : le HTML du serveur montre tous les panneaux,
 * chacun précédé de son titre. La CSS (`@media (scripting: enabled)`) donne
 * dès le premier affichage l'apparence finale pour éviter un saut ; ce script
 * pose ensuite les rôles ARIA (absents du HTML : sans script, ce ne sont que
 * des sections titrées), l'état et les écouteurs. Le marqueur
 * `data-onglets-pret` sert aux navigateurs qui ignorent cette requête média.
 *
 * Balisage attendu : racine [data-onglets], liste [data-onglets-liste]
 * (aria-label dans data-aria-label), onglets [data-onglet] avec
 * aria-controls, panneaux désignés par ces ids, titres [data-titre-panneau].
 */

const FOCALISABLES = 'a[href], button, input, select, textarea, iframe, summary, [tabindex]:not([tabindex="-1"]), [contenteditable]'

type JeuOnglets = {
  racine: HTMLElement
  onglets: HTMLElement[]
  panneaux: HTMLElement[]
  selectionner: (index: number, focus?: boolean) => void
}

const jeux: JeuOnglets[] = []

function initialiser(racine: HTMLElement) {
  if (racine.hasAttribute('data-onglets-pret')) return
  const liste = racine.querySelector<HTMLElement>(':scope > [data-onglets-liste]')
  if (!liste) return
  const onglets = Array.from(liste.querySelectorAll<HTMLElement>(':scope > [data-onglet]'))
  const panneaux = onglets.map((onglet) => document.getElementById(onglet.getAttribute('aria-controls') ?? ''))
  if (!onglets.length || panneaux.some((p) => !p)) return
  const panneauxSurs = panneaux as HTMLElement[]

  liste.setAttribute('role', 'tablist')
  if (liste.dataset.ariaLabel) liste.setAttribute('aria-label', liste.dataset.ariaLabel)
  onglets.forEach((onglet) => onglet.setAttribute('role', 'tab'))

  panneauxSurs.forEach((panneau, i) => {
    panneau.setAttribute('role', 'tabpanel')
    panneau.setAttribute('aria-labelledby', onglets[i].id)
    // L'APG rend le panneau focalisable seulement s'il n'a rien à focaliser,
    // pour que Tab mène du jeu d'onglets au contenu sans arrêt superflu.
    if (!panneau.querySelector(FOCALISABLES)) panneau.tabIndex = 0
    // Le titre ne sert qu'au rendu sans JS : l'onglet le remplace
    panneau.querySelectorAll<HTMLElement>(':scope > [data-titre-panneau]').forEach((titre) => (titre.hidden = true))
  })

  function selectionner(index: number, focus = false) {
    onglets.forEach((onglet, i) => {
      const actif = i === index
      onglet.setAttribute('aria-selected', String(actif))
      onglet.dataset.selectionne = String(actif)
      onglet.tabIndex = actif ? 0 : -1
      panneauxSurs[i].hidden = !actif
      panneauxSurs[i].dataset.selectionne = String(actif)
    })
    if (focus) onglets[index].focus()
  }

  liste.addEventListener('click', (evenement) => {
    const onglet = (evenement.target as Element).closest<HTMLElement>('[data-onglet]')
    const index = onglet ? onglets.indexOf(onglet) : -1
    if (index >= 0) selectionner(index)
  })

  liste.addEventListener('keydown', (evenement) => {
    const index = onglets.indexOf(document.activeElement as HTMLElement)
    if (index < 0) return
    const dernier = onglets.length - 1
    let suivant: number
    // Les quatre flèches sont acceptées : la liste est verticale sur grand
    // écran et horizontale (en plusieurs rangées) sur petit écran.
    switch (evenement.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        suivant = index === dernier ? 0 : index + 1
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        suivant = index === 0 ? dernier : index - 1
        break
      case 'Home':
        suivant = 0
        break
      case 'End':
        suivant = dernier
        break
      default:
        return
    }
    evenement.preventDefault()
    selectionner(suivant, true)
  })

  // Orientation annoncée selon la mise en page réelle (CSS), sans changer le
  // rendu : seul l'attribut ARIA suit la largeur.
  const orientationLarge = racine.dataset.orientationLarge
  if (orientationLarge) {
    const large = window.matchMedia('(min-width: 900px)')
    const appliquer = () => liste.setAttribute('aria-orientation', large.matches ? orientationLarge : 'horizontal')
    appliquer()
    large.addEventListener('change', appliquer)
  }

  const initial = Math.max(
    0,
    onglets.findIndex((o) => o.dataset.selectionne === 'true'),
  )
  selectionner(initial)
  racine.setAttribute('data-onglets-pret', '')
  // Le fondu des panneaux (animations.css) ne vaut qu'après le premier
  // affichage : le panneau initial n'est pas animé au chargement.
  requestAnimationFrame(() => racine.setAttribute('data-onglets-anime', ''))
  jeux.push({ racine, onglets, panneaux: panneauxSurs, selectionner })
}

/** Une ancre qui vise un onglet, un panneau ou un élément d'un panneau l'affiche */
function suivreAncre() {
  const id = decodeURIComponent(location.hash.slice(1))
  const cible = id ? document.getElementById(id) : null
  if (!cible) return
  let change = false
  for (const jeu of jeux) {
    let index = jeu.onglets.indexOf(cible)
    if (index < 0) index = jeu.panneaux.findIndex((panneau) => panneau.contains(cible))
    if (index >= 0 && jeu.panneaux[index].hidden) {
      // Cible d'une ancre : visible tout de suite, sans le fondu du panneau
      jeu.racine.removeAttribute('data-onglets-anime')
      jeu.selectionner(index)
      requestAnimationFrame(() => jeu.racine.setAttribute('data-onglets-anime', ''))
      change = true
    }
  }
  // Saut immédiat : le défilement doux de html ferait traverser la page
  if (change) cible.scrollIntoView({ behavior: 'instant' })
}

document.querySelectorAll<HTMLElement>('[data-onglets]').forEach(initialiser)
suivreAncre()
window.addEventListener('hashchange', suivreAncre)
