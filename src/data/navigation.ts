/*
 * Liens de navigation de la coquille : en-tête et menu (AppBar/menu.js et
 * SideNav/SideNavContent.jsx de coquille-web), pied de page (Footer,
 * LocalFooter, FooterTail) et liens rapides (QuickLinks.jsx). Ils sont
 * définis ici, en dur comme dans la source ; les composants de
 * src/components/coquille/ ne font que les rendre. Les chemins internes
 * reçoivent leur barre oblique finale (trailingSlash: 'always').
 */
import { AddressBookIcon } from '@phosphor-icons/react/dist/ssr/AddressBook'
import { BooksIcon } from '@phosphor-icons/react/dist/ssr/Books'
import { CalendarDotsIcon } from '@phosphor-icons/react/dist/ssr/CalendarDots'
import { ClockCountdownIcon } from '@phosphor-icons/react/dist/ssr/ClockCountdown'
import { DoorOpenIcon } from '@phosphor-icons/react/dist/ssr/DoorOpen'
import { InfoIcon } from '@phosphor-icons/react/dist/ssr/Info'
import { CalendarBlankIcon } from '@phosphor-icons/react/dist/ssr/CalendarBlank'
import { InstagramLogoIcon } from '@phosphor-icons/react/dist/ssr/InstagramLogo'
import { PaperPlaneTiltIcon } from '@phosphor-icons/react/dist/ssr/PaperPlaneTilt'
import { UserIcon } from '@phosphor-icons/react/dist/ssr/User'
import { WrenchIcon } from '@phosphor-icons/react/dist/ssr/Wrench'
import { YoutubeLogoIcon } from '@phosphor-icons/react/dist/ssr/YoutubeLogo'
import studioBib from './images/navigation/studio-bib.webp'
import boiteOutils from './images/navigation/boite-outils.webp'
import autresRessources from './images/navigation/autres-ressources.webp'

/* ---------- En-tête et menu ---------- */

export const PAGES_PRINCIPALES = [
  { url: '/espaces/', libelle: 'Espaces' },
  { url: '/etudes/', libelle: 'Études' },
  { url: '/recherche/', libelle: 'Recherche' },
  { url: '/enseignement/', libelle: 'Enseignement' },
  { url: '/engagements/', libelle: 'Engagements' },
]

/**
 * Liens du parcours Sofia, à côté de son champ de recherche dans le menu :
 * gérer ses prêts, obtenir un document absent des collections.
 */
export const LIENS_SOFIA = [
  { libelle: 'Mon dossier', href: 'https://umontreal.account.worldcat.org/account', Icone: UserIcon },
  { libelle: 'Obtenir un document', href: '/obtenir/', Icone: BooksIcon },
]

/**
 * Accès rapide du menu. Les adresses absolues s'ouvrent dans un nouvel
 * onglet, comme dans la source. À propos est dans « Explorer » et le pied de
 * page.
 */
export const LIENS_MENU = [
  { libelle: 'Réserver une salle', href: 'https://calendrier.bib.umontreal.ca/r', Icone: DoorOpenIcon },
  {
    libelle: 'Formations',
    href: 'https://calendrier.bib.umontreal.ca/calendar?cid=7690&t=m&d=0000-00-00&cal=7690&inc=0',
    Icone: CalendarDotsIcon,
  },
  { libelle: 'Horaires', href: '/horaires/', Icone: ClockCountdownIcon },
  { libelle: 'Nous joindre', href: '/nous-joindre/', Icone: AddressBookIcon },
]

export type Carte = {
  cle: string
  image: ImageMetadata
  titre: string
  /** Une phrase sur le service, dans l'aperçu du menu de bureau */
  description: string
  /** Où cherche le champ de recherche du service, dans le menu (portées de la boîte de recherche) */
  portee: 'site' | 'outils' | 'studio'
  liens: { libelle: string; href: string }[]
  appel?: { libelle: string; href: string }
  /** Couleur du liseré (jeton) */
  couleur: string
}

export const CARTES: Carte[] = [
  {
    cle: 'studio',
    image: studioBib,
    titre: 'Studio·bib',
    portee: 'studio',
    description: 'Le soutien informatique au quotidien et les technologies de création numérique : impression 3D, réalité virtuelle, production médias.',
    liens: [
      { libelle: 'Accès hors campus', href: 'https://studio.bib.umontreal.ca/informatique/hors-campus/' },
      { libelle: 'Soutien informatique', href: 'https://studio.bib.umontreal.ca/informatique/' },
      { libelle: 'Technologies créatives', href: 'https://studio.bib.umontreal.ca/creatives/' },
      { libelle: 'Productions médias', href: 'https://studio.bib.umontreal.ca/medias/' },
    ],
    appel: { libelle: 'Aller plus loin', href: 'https://studio.bib.umontreal.ca/' },
    couleur: 'var(--jaune)',
  },
  {
    cle: 'outils',
    image: boiteOutils,
    titre: 'Boîte à outils',
    portee: 'outils',
    description: "Des guides et des ressources pour trouver, évaluer et citer l'information, dans chaque discipline.",
    liens: [
      { libelle: 'Bases de données A-Z', href: 'https://boite-outils.bib.umontreal.ca/az.php' },
      { libelle: 'Ressources par discipline', href: 'https://boite-outils.bib.umontreal.ca/disciplines' },
      { libelle: 'Comment citer', href: 'https://boite-outils.bib.umontreal.ca/citer' },
      { libelle: "Droit d'auteur", href: 'https://boite-outils.bib.umontreal.ca/recherche/droit-auteur' },
    ],
    appel: { libelle: 'Découvrir tous les outils', href: 'https://boite-outils.bib.umontreal.ca/' },
    couleur: 'var(--rouge-orange)',
  },
  {
    cle: 'ressources',
    image: autresRessources,
    titre: 'Ressources',
    portee: 'site',
    description: "Sofia, le dépôt Papyrus, les données géospatiales et les collections numériques des bibliothèques.",
    liens: [
      { libelle: 'Outil de recherche Sofia', href: 'https://umontreal.on.worldcat.org/discovery?lang=fr' },
      { libelle: 'Papyrus – dépôt institutionnel', href: 'https://umontreal.scholaris.ca/' },
      { libelle: 'GéoIndex – Données géospatiales', href: 'https://geoapp.bibl.ulaval.ca/' },
      { libelle: 'Calypso – Objets numériques', href: 'https://calypso.bib.umontreal.ca/' },
      { libelle: 'Service Accessibilité', href: '/service-accessibilite/' },
    ],
    couleur: 'var(--vert-pale)',
  },
]

/* ---------- Pied de page ---------- */

type LienPied = { libelle: string; href: string; rel?: string; Icone?: typeof InfoIcon }

/**
 * Trois colonnes de liens. Corrections par rapport à la source : paramètres
 * de suivi Google Analytics (_gl=…) retirés des liens A-Z et Calypso.
 */
export const COLONNES_PIED: LienPied[][] = [
  [
    { libelle: 'Nous joindre', href: '/nous-joindre/', Icone: PaperPlaneTiltIcon },
    { libelle: 'Votre dossier', href: 'https://umontreal.account.worldcat.org/account', rel: 'noopener noreferrer', Icone: UserIcon },
    { libelle: 'À propos', href: '/a-propos/', Icone: InfoIcon },
  ],
  [
    { libelle: 'Site des bibliothèques', href: '/' },
    { libelle: 'Catalogue Sofia', href: 'https://umontreal.on.worldcat.org/discovery?lang=fr', rel: 'noopener noreferrer' },
    { libelle: 'Base de données A-Z', href: 'https://boite-outils.bib.umontreal.ca/az.php' },
  ],
  [
    { libelle: 'Boite à outils', href: 'https://boite-outils.bib.umontreal.ca/' },
    { libelle: 'Studio-bib', href: 'https://studio.bib.umontreal.ca/' },
    { libelle: 'Papyrus', href: 'https://umontreal.scholaris.ca/' },
    { libelle: 'GéoIndex', href: 'https://geoapp.bibl.ulaval.ca/', rel: 'noopener noreferrer' },
    { libelle: 'Calypso', href: 'https://calypso.bib.umontreal.ca/' },
  ],
]

/** Icônes seules : le libellé devient leur nom accessible (la source n'en avait pas) */
export const RESEAUX_PIED = [
  { libelle: 'YouTube des Bibliothèques', href: 'https://www.youtube.com/user/BibliothequesUdeM', Icone: YoutubeLogoIcon },
  { libelle: "Instagram de l'Université de Montréal", href: 'https://www.instagram.com/umontreal/', Icone: InstagramLogoIcon },
]

export const URGENCE = { libelle: 'Urgence UdeM 514 343-7771', href: 'tel:+15143437771' }

/** Bas du pied de page, avant le bouton « Paramètres des témoins » */
export const LIENS_QUEUE_PIED = [
  { libelle: 'Confidentialité', href: 'https://vie-privee.umontreal.ca/confidentialite/' },
  { libelle: "Conditions d'utilisation", href: '/conditions-utilisation/' },
  { libelle: 'Accessibilité', href: '/accessibilite-web/' },
]

/* ---------- Liens rapides ---------- */

/**
 * Sans `Icone` : l'icône de Sofia (icône maison, pas une icône Phosphor).
 * `court` : libellé visible sous l'icône de la barre mobile ; le nom
 * accessible reste `libelle`, qui doit contenir `court` (WCAG 2.5.3).
 */
export const LIENS_RAPIDES = [
  { libelle: 'Sofia', court: 'Sofia', href: 'https://umontreal.on.worldcat.org/discovery?lang=fr', Icone: null, nouvelOngletBureau: true },
  { libelle: 'Horaires', court: 'Horaires', href: '/horaires/', Icone: ClockCountdownIcon },
  { libelle: 'Réserver une salle', court: 'Réserver', href: 'https://calendrier.bib.umontreal.ca/r', Icone: CalendarBlankIcon },
  { libelle: 'Ressources informatiques', court: 'Informatique', href: 'https://studio.bib.umontreal.ca/informatique/', Icone: WrenchIcon },
]

/* ---------- Outils ---------- */

export const estExterne = (href: string) => /^https?:/.test(href)

/** Section courante : le chemin commence par l'URL de la page principale */
export const estCourante = (chemin: string, url: string) => chemin.startsWith(url)
