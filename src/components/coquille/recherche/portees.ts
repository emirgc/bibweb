/*
 * Portées de la boîte de recherche (SEARCH_SCOPES de SearchOverlay.jsx).
 * « site » cherche en direct dans l'index du site ; les trois autres
 * renvoient, à la soumission, vers la page de résultats du site externe
 * (adresses relevées dans leurs formulaires).
 *
 * Partagé par le balisage (Recherche.astro) et le script (boite.ts), pour que
 * les libellés et les adresses ne vivent qu'à un seul endroit.
 */

export type ClePortee = 'site' | 'sofia' | 'outils' | 'studio'

export type Portee = {
  cle: ClePortee
  libelle: string
  /** Jeton de couleur de l'accent (bordure et fond de la carte, pastille) */
  couleur: string
  description: string
  /** Adresse de la page de résultats externe ; la requête encodée est ajoutée à la fin */
  recherche?: string
}

export const PORTEES: Portee[] = [
  {
    cle: 'site',
    libelle: 'Site principal',
    couleur: '--bleu-fonce',
    description:
      "Le site principal des bibliothèques : point de départ pour découvrir nos services et réserver les espaces de travail. Il regroupe l'information en volets pratiques, selon votre occupation à l'Université : études, enseignement, recherche.",
  },
  {
    cle: 'sofia',
    libelle: 'Sofia',
    couleur: '--bleu-principal',
    description:
      "L'outil de recherche des bibliothèques universitaires québécoises, Sofia, permet de rechercher des livres, articles, partitions et autres médias, physiques ou numériques, dans toutes les collections et bases de données de l'Université de Montréal. Une fonction permet d'étendre la recherche à toutes les bibliothèques universitaires québécoises, voire aux bibliothèques dans le monde.",
    recherche:
      'https://umontreal.on.worldcat.org/search?clusterResults=true&baseScope=wz:11098&lang=fr&stickyFacetsChecked=on&changedFacet=database&database=Xwc&overrideStickyFacetDefault=true&queryString=kw:',
  },
  {
    cle: 'outils',
    libelle: 'Boîte à outils',
    couleur: '--rouge-orange',
    description:
      "Un ensemble de guides et ressources pour trouver et évaluer l'information pertinente pour les études et la recherche, dont notre guide sur l'intelligence artificielle générative et les guides de citation.",
    recherche: 'https://boite-outils.bib.umontreal.ca/srch.php?q=',
  },
  {
    cle: 'studio',
    libelle: 'Studio-bib',
    couleur: '--jaune',
    description:
      'Le site pour obtenir du soutien informatique de base (accès au courriel, au wifi, au proxy/VPN) comme des procédures pour utiliser les technologies de création numérique, comme les imprimantes 3D ou la réalité virtuelle.',
    recherche: 'https://studio.bib.umontreal.ca/search/?q=',
  },
]

/** Consigne du champ, reprise par le placeholder et par la description du champ */
export function consigne(portee: Portee) {
  return portee.recherche ? `Rechercher dans ${portee.libelle}, puis appuyez sur Entrée` : 'Rechercher dans le site des bibliothèques'
}
