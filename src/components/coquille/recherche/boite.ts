/*
 * Comportement de la boîte de recherche (Recherche.astro), repris de
 * SearchOverlay.jsx :
 * - l'état vit dans l'URL de la page visitée (?search=1&sq=…&sscope=…) pour
 *   qu'un lien profond ou un retour arrière rouvre la même recherche ;
 * - l'ouverture pousse une seule entrée d'historique, la frappe la remplace :
 *   un seul retour arrière referme la boîte ;
 * - la dernière recherche est gardée pour la session d'onglet, pour la
 *   retrouver en rouvrant la boîte sur une autre page (après un clic sur un
 *   résultat, par exemple) ;
 * - l'événement « recherche:ouvrir » (detail : { requete, portee }) l'ouvre
 *   avec une requête donnée : recherche dans le site depuis le menu.
 */
import type MiniSearch from 'minisearch'
import { PORTEES, consigne, type ClePortee, type Portee } from './portees'
import { chargerIndex, chercher } from './moteur'

// Préfixées « s » pour ne pas entrer en collision avec le ?q= d'une page
// (le répertoire du personnel, par exemple)
const PARAM_OUVERT = 'search'
const PARAM_REQUETE = 'sq'
const PARAM_PORTEE = 'sscope'

// Mêmes clés que coquille-web : une recherche en cours survit à la bascule
const MEMOIRE_REQUETE = 'searchOverlay:lastQuery'
const MEMOIRE_PORTEE = 'searchOverlay:lastScope'

// Attend une pause dans la frappe avant de chercher et de réécrire l'URL
const DELAI_FRAPPE = 200

type Etat = { requete: string; portee: ClePortee }

const estPortee = (valeur: unknown): valeur is ClePortee => PORTEES.some((p) => p.cle === valeur)
const portee = (cle: ClePortee) => PORTEES.find((p) => p.cle === cle) as Portee

// sessionStorage peut être bloqué (navigation privée, données refusées) : la
// boîte fonctionne alors sans mémoire.
function lireMemoire(cle: string) {
  try {
    return window.sessionStorage.getItem(cle)
  } catch {
    return null
  }
}

function ecrireMemoire(cle: string, valeur: string | null) {
  try {
    if (valeur) window.sessionStorage.setItem(cle, valeur)
    else window.sessionStorage.removeItem(cle)
  } catch {
    /* sans mémoire */
  }
}

function etatDeLUrl() {
  const params = new URLSearchParams(window.location.search)
  const cle = params.get(PARAM_PORTEE)
  return {
    ouvert: params.get(PARAM_OUVERT) === '1',
    requete: params.get(PARAM_REQUETE) ?? '',
    portee: estPortee(cle) ? cle : ('site' as ClePortee),
  }
}

/** URL de la page courante avec l'état de la boîte, ou sans (etat = null) */
function urlAvec(etat: Etat | null) {
  const params = new URLSearchParams(window.location.search)
  params.delete(PARAM_OUVERT)
  params.delete(PARAM_REQUETE)
  params.delete(PARAM_PORTEE)
  if (etat) {
    params.set(PARAM_OUVERT, '1')
    if (etat.requete) params.set(PARAM_REQUETE, etat.requete)
    if (etat.portee !== 'site') params.set(PARAM_PORTEE, etat.portee)
  }
  const chaine = params.toString()
  return `${window.location.pathname}${chaine ? `?${chaine}` : ''}${window.location.hash}`
}

export function initialiserRecherche(boite: HTMLDialogElement) {
  const $ = <T extends Element>(selecteur: string) => boite.querySelector<T>(selecteur)!
  const champ = $<HTMLInputElement>('[data-champ]')
  const formulaire = $<HTMLFormElement>('[data-formulaire]')
  const effacer = $<HTMLButtonElement>('[data-effacer]')
  const carte = $<HTMLElement>('[data-carte]')
  const description = $<HTMLElement>('[data-description]')
  const lireSuite = $<HTMLButtonElement>('[data-lire-suite]')
  const consigneChamp = $<HTMLElement>('[data-consigne]')
  const statut = $<HTMLElement>('[data-statut]')
  const zone = $<HTMLElement>('[data-resultats]')
  const conteneurGroupes = $<HTMLElement>('[data-groupes]')
  const modeleGroupe = $<HTMLTemplateElement>('[data-modele-groupe]')
  const modeleResultat = $<HTMLTemplateElement>('[data-modele-resultat]')
  const etats = boite.querySelectorAll<HTMLElement>('[data-etat]')
  const radios = boite.querySelectorAll<HTMLInputElement>('input[name="recherche-portee"]')

  let index: MiniSearch | null = null
  let echec = false
  // A-t-on poussé l'entrée d'historique à l'ouverture ? Après un lien
  // profond, fermer ne doit pas reculer vers une page peut-être hors du site.
  let pousse = false
  let declencheur: HTMLElement | null = null
  let minuterie: ReturnType<typeof setTimeout> | undefined
  let requeteAppliquee = ''

  const porteeCourante = () => {
    const cle = [...radios].find((r) => r.checked)?.value
    return estPortee(cle) ? cle : 'site'
  }

  function annoncer(message: string) {
    // On ne réécrit pas un message identique : il serait relu
    if (statut.textContent !== message) statut.textContent = message
  }

  function afficherEtat(nom: string | null) {
    etats.forEach((e) => (e.hidden = e.dataset.etat !== nom))
  }

  function rendre() {
    const cle = porteeCourante()
    zone.hidden = cle !== 'site'
    if (cle !== 'site') {
      conteneurGroupes.replaceChildren()
      annoncer('')
      return
    }

    const requete = requeteAppliquee.trim()
    conteneurGroupes.replaceChildren()
    if (!index) {
      afficherEtat(echec ? 'erreur' : 'chargement')
      annoncer(echec ? "L'index de recherche n'a pas pu être chargé." : "Chargement de l'index de recherche…")
      return
    }
    if (!requete) {
      afficherEtat('vide')
      annoncer('')
      return
    }

    const groupes = chercher(index, requete)
    if (!groupes.length) {
      afficherEtat('aucun')
      $<HTMLElement>('[data-requete]').textContent = requete
      annoncer(`Aucun résultat pour « ${requete} »`)
      return
    }

    afficherEtat(null)
    const fragment = document.createDocumentFragment()
    let total = 0
    for (const { section, items } of groupes) {
      const groupe = modeleGroupe.content.firstElementChild!.cloneNode(true) as HTMLElement
      groupe.querySelector('h3')!.textContent = section
      const liste = groupe.querySelector('ul')!
      for (const item of items) {
        const element = modeleResultat.content.firstElementChild!.cloneNode(true) as HTMLElement
        element.querySelector('a')!.href = item.url
        element.querySelector('.titre')!.textContent = item.title
        const extrait = element.querySelector('.extrait')!
        if (item.excerpt) extrait.textContent = item.excerpt
        else extrait.remove()
        liste.append(element)
      }
      total += items.length
      fragment.append(groupe)
    }
    conteneurGroupes.append(fragment)
    const s = total > 1 ? 's' : ''
    annoncer(`${total} résultat${s} trouvé${s} pour « ${requete} »`)
  }

  function majPortee() {
    const p = portee(porteeCourante())
    carte.style.setProperty('--accent', `var(${p.couleur})`)
    description.textContent = p.description
    champ.placeholder = consigne(p)
    consigneChamp.textContent = consigne(p)
  }

  function majEffacer() {
    effacer.toggleAttribute('data-masque', !champ.value)
  }

  /** Reflète la recherche dans l'URL (remplacement) et dans la mémoire de session */
  function synchroniser() {
    if (!boite.open) return
    const etat = { requete: requeteAppliquee, portee: porteeCourante() }
    window.history.replaceState(window.history.state, '', urlAvec(etat))
    ecrireMemoire(MEMOIRE_REQUETE, etat.requete || null)
    ecrireMemoire(MEMOIRE_PORTEE, etat.portee !== 'site' ? etat.portee : null)
  }

  function appliquer({ requete, portee: cle }: Etat) {
    champ.value = requete
    requeteAppliquee = requete
    radios.forEach((r) => (r.checked = r.value === cle))
    majPortee()
    majEffacer()
    rendre()
  }

  function charger() {
    if (index) return
    echec = false
    chargerIndex()
      .then((i) => {
        index = i
      })
      .catch(() => {
        echec = true
      })
      .finally(() => {
        if (boite.open) rendre()
      })
  }

  function majDeclencheurs(ouvert: boolean) {
    document.querySelectorAll('[data-ouvrir-recherche][aria-expanded]').forEach((d) => d.setAttribute('aria-expanded', String(ouvert)))
  }

  function ouvrir(demande?: Etat) {
    if (boite.open) return
    declencheur = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const url = etatDeLUrl()
    if (url.ouvert) {
      // Lien profond : l'URL reflète déjà l'ouverture
      pousse = false
      appliquer(url)
    } else {
      const memoire = lireMemoire(MEMOIRE_PORTEE)
      const etat = demande ?? { requete: lireMemoire(MEMOIRE_REQUETE) ?? '', portee: estPortee(memoire) ? memoire : ('site' as ClePortee) }
      appliquer(etat)
      window.history.pushState({ rechercheOuverte: true }, '', urlAvec(etat))
      pousse = true
    }
    boite.showModal()
    champ.focus()
    majDeclencheurs(true)
    charger()
  }

  // Échap, bouton Fermer et clic sur le fond passent tous par ici
  boite.addEventListener('close', () => {
    clearTimeout(minuterie)
    if (pousse) {
      pousse = false
      window.history.back()
    } else if (etatDeLUrl().ouvert) {
      window.history.replaceState(window.history.state, '', urlAvec(null))
    }
    majDeclencheurs(false)
    if (declencheur?.isConnected) declencheur.focus()
    declencheur = null
  })

  $<HTMLButtonElement>('[data-fermer]').addEventListener('click', () => boite.close())

  // Clic sur le fond : la cible est le <dialog> lui-même, hors de sa boîte.
  // On exige que le geste ait aussi commencé sur le fond, pour ne pas fermer
  // après une sélection de texte relâchée hors du cadre.
  let appuiSurLeFond = false
  const surLeFond = (e: MouseEvent) => {
    if (e.target !== boite) return false
    const r = boite.getBoundingClientRect()
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom
  }
  boite.addEventListener('pointerdown', (e) => (appuiSurLeFond = surLeFond(e)))
  boite.addEventListener('click', (e) => {
    if (appuiSurLeFond && surLeFond(e)) boite.close()
    appuiSurLeFond = false
  })

  champ.addEventListener('input', () => {
    majEffacer()
    clearTimeout(minuterie)
    minuterie = setTimeout(() => {
      requeteAppliquee = champ.value
      rendre()
      synchroniser()
    }, DELAI_FRAPPE)
  })

  effacer.addEventListener('click', () => {
    champ.value = ''
    clearTimeout(minuterie)
    requeteAppliquee = ''
    majEffacer()
    rendre()
    synchroniser()
    champ.focus()
  })

  radios.forEach((r) =>
    r.addEventListener('change', () => {
      majPortee()
      rendre()
      synchroniser()
    }),
  )

  formulaire.addEventListener('submit', (e) => {
    e.preventDefault()
    const p = portee(porteeCourante())
    const requete = champ.value.trim()
    if (p.recherche) {
      if (requete) window.location.href = `${p.recherche}${encodeURIComponent(requete)}`
      return
    }
    // Site principal : Entrée cherche tout de suite, sans attendre la pause
    clearTimeout(minuterie)
    requeteAppliquee = champ.value
    rendre()
    synchroniser()
  })

  lireSuite.addEventListener('click', () => {
    // Un seul état pour toutes les portées : dépliée, la carte le reste
    const deplie = !carte.hasAttribute('data-deplie')
    carte.toggleAttribute('data-deplie', deplie)
    lireSuite.setAttribute('aria-expanded', String(deplie))
    lireSuite.textContent = deplie ? 'Réduire' : 'Lire la suite…'
  })

  // Flèches haut et bas entre le champ et les résultats (Tab marche aussi)
  boite.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    const cible = e.target as HTMLElement
    const liens = [...conteneurGroupes.querySelectorAll<HTMLAnchorElement>('a')]
    if (!liens.length) return
    const position = cible === champ ? -1 : liens.indexOf(cible as HTMLAnchorElement)
    if (cible !== champ && position === -1) return
    e.preventDefault()
    const suivante = position + (e.key === 'ArrowDown' ? 1 : -1)
    if (suivante < 0) champ.focus()
    else liens[Math.min(suivante, liens.length - 1)].focus()
  })

  // Tout élément [data-ouvrir-recherche] de la page ouvre la boîte. Le survol
  // ou le focus d'un déclencheur lance déjà le chargement de l'index, pour
  // qu'il soit prêt au clic.
  document.addEventListener('click', (e) => {
    const cible = (e.target as Element | null)?.closest?.('[data-ouvrir-recherche]')
    if (!cible) return
    e.preventDefault()
    ouvrir()
  })
  document.addEventListener('recherche:ouvrir', (e) => {
    const { requete = '', portee: cle } = (e as CustomEvent<{ requete?: string; portee?: string }>).detail ?? {}
    ouvrir({ requete, portee: estPortee(cle) ? cle : 'site' })
    synchroniser()
  })
  const precharger = (e: Event) => {
    if ((e.target as Element | null)?.closest?.('[data-ouvrir-recherche]')) chargerIndex().catch(() => {})
  }
  document.addEventListener('pointerover', precharger, { passive: true })
  document.addEventListener('focusin', precharger)

  // Retour arrière ou avant : on suit l'état de l'URL
  window.addEventListener('popstate', () => {
    const url = etatDeLUrl()
    if (url.ouvert) {
      if (boite.open) appliquer(url)
      else ouvrir()
    } else if (boite.open) {
      pousse = false
      boite.close()
    }
  })

  if (etatDeLUrl().ouvert) ouvrir()
}
