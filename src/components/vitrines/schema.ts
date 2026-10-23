/*
 * Schéma des vitrines (pages d'accueil et de section en YAML).
 *
 * Une vitrine décrit le contenu (textes, liens, images, icônes) ; la mise en
 * page vient du code (GabaritVitrine.astro et les blocs de ce dossier). Le
 * schéma est volontairement strict : une clé inconnue (faute de frappe), une
 * couleur hors du thème, une icône ou une bannière introuvable font échouer
 * le build avec le nom du fichier et le chemin de la valeur fautive.
 *
 * Chaque élément de `sections` est une bande pleine largeur qui contient un
 * bloc ; `type` choisit le bloc. Documentation pour les rédacteurs :
 * docs/REDACTION.md.
 */
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'astro/zod'
import { NOMS_FONDS } from '@/lib/fonds'
import { messageIconeInconnue, trouverIcone } from '@/plugins/icones.mjs'

// ---- Valeurs communes ----

const texteCourt = z.string().trim().min(1)

/** Texte en Markdown (paragraphes, gras, liens, listes) */
const markdown = z.string().trim().min(1)

const lien = z
  .string()
  .trim()
  .regex(/^(\/|#|https?:\/\/|mailto:|tel:)/, 'Un lien commence par / (page du site), # (ancre), https://, mailto: ou tel:')

const icone = z
  .string()
  .trim()
  .superRefine((nom, ctx) => {
    if (!trouverIcone(nom)) ctx.addIssue({ code: 'custom', message: messageIconeInconnue(nom) })
  })

const couleur = z.enum(NOMS_FONDS)

// Ancre d'un titre (/recherche/#orcid) : lettres minuscules, chiffres, tirets
const ancre = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Une ancre s’écrit en minuscules, sans accents ni espaces (ex. droit-auteur)')

// `secondaire` : bouton texte (bleu, sans fond), pour une action moins
// importante que sa voisine (enseignement : « Voir des sujets de formation »).
// `contour` : bouton à contour (pilule bordée, sans fond), entre le plein et
// le texte (espaces : engagements en équité, diversité, inclusion)
const bouton = z.object({ texte: texteCourt, lien, secondaire: z.boolean().optional(), contour: z.boolean().optional() }).strict()
const boutons = z.array(bouton).min(1)

// Lien « tout voir » sous un carrousel ou une liste
// `nouvelOnglet` : pour une application externe qu'on garde ouverte à côté
// du site (réservation de salles d'/espaces/, comme dans la source)
const lienTout = z.object({ texte: texteCourt, lien, nouvelOnglet: z.boolean().optional() }).strict()

// Lignes courtes (sous-titre de bannière)
const lignes = z.array(texteCourt).min(1)

// Bannières : fichiers de src/content/pages/images/super-heroes/, par nom
const DOSSIER_BANNIERES = join(process.cwd(), 'src/content/pages/images/super-heroes')
const BANNIERES = readdirSync(DOSSIER_BANNIERES)
  .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
  .map((f) => f.replace(/\.[^.]+$/, ''))

// `rechercheSofia` : la grande bannière de l'accueil (SuperHero), avec la
// boîte de recherche Sofia en bas ; sinon, la bannière des sections
// (SuperHero2), en deux hauteurs
const banniere = z
  .object({
    titre: texteCourt,
    image: z.string().refine((nom) => BANNIERES.includes(nom), { message: `Bannière introuvable. Noms possibles : ${BANNIERES.join(', ')}` }),
    sousTitre: lignes.optional(),
    /** Bouton sous le titre (bannière des sections seulement) */
    bouton: bouton.optional(),
    taille: z.enum(['normale', 'petite']).default('normale'),
    /** Hauteur de la photo à garder au recadrage : 0 % le haut, 50 % le centre */
    cadrage: z
      .string()
      .regex(/^(100|[1-9]?\d)%$/, { message: 'Le cadrage est un pourcentage de 0% à 100% (0% : le haut de la photo, 50% : le centre).' })
      .optional(),
    rechercheSofia: z.boolean().optional(),
  })
  .strict()

// ---- Blocs ----

/** Champs de toute section : fond de la bande et ancre du titre */
const communs = {
  fond: couleur.optional(),
  id: ancre.optional(),
  /** Nom court du bloc dans le sommaire « Sur cette page » (Sommaire.astro) ; sans libellé, le bloc n'y figure pas */
  libelle: texteCourt.optional(),
}

// Génériques : les types générés par Astro (CollectionEntry<'vitrines'>)
// gardent ainsi ceux de image(), de secondaryNav et de lang
export function schemaVitrine<I extends z.ZodType, N extends z.ZodType, L extends z.ZodType>(
  image: () => I,
  { secondaryNav, lang }: { secondaryNav: N; lang: L },
) {
  /** Texte et image côte à côte (HeroWithImage) */
  const imageTexte = z
    .object({
      type: z.literal('image-texte'),
      ...communs,
      titre: texteCourt,
      texte: markdown,
      image: image(),
      positionImage: z.enum(['gauche', 'droite']).default('droite'),
      /** `encart` : carte bleu foncé ramassée, image fondue au bord (BlocImageTexte) */
      disposition: z.enum(['colonnes', 'encart']).default('colonnes'),
      bouton: bouton.optional(),
      boutons: boutons.optional(),
    })
    .strict()

  /** Cartes-sections côte à côte : photo, titre, texte et bouton sur leur fond (BlocCartesSections) */
  const cartesSections = z
    .object({
      type: z.literal('cartes-sections'),
      ...communs,
      cartes: z
        .array(
          z
            .object({
              titre: texteCourt,
              id: ancre.optional(),
              texte: markdown,
              image: image(),
              fond: couleur.optional(),
              bouton: bouton.optional(),
            })
            .strict(),
        )
        .min(2)
        .max(4),
    })
    .strict()

  /** Carte-lien à icône (CardWithIcon) */
  const carteIcone = z.object({ titre: texteCourt, icone, lien, appel: texteCourt.optional() }).strict()

  /** Carte-lien à photo (CardWithImage) */
  const carteImage = z.object({ titre: texteCourt, image: image(), lien, appel: texteCourt.optional() }).strict()

  /** Volet d'accordéon : titre, texte et, au besoin, coordonnées à icônes */
  const volet = z
    .object({
      titre: texteCourt,
      id: ancre.optional(),
      texte: markdown.optional(),
      coordonnees: z
        .object({
          courriel: z.string().trim().email().optional(),
          /** Écrit comme on l'affiche : 514 343-2135 */
          telephone: z.string().trim().regex(/^[0-9 -]+$/, 'Un numéro de téléphone s’écrit avec des chiffres, des espaces et des tirets').optional(),
          adresse: lignes.optional(),
          itineraire: lien.optional(),
        })
        .strict()
        .optional(),
    })
    .strict()
  const couleurAccordeons = z.enum(['bleuPrincipal', 'rose', 'vertPale']).default('bleuPrincipal')

  /** Carrousel de cartes à icône (Carousel1 et CardWithIcon) */
  const carrousel = z
    .object({
      type: z.literal('carrousel'),
      ...communs,
      titre: texteCourt,
      texte: markdown.optional(),
      couleurCartes: z.enum(['bleuPrincipal', 'vertFonce', 'rose300', 'jaune']).default('bleuPrincipal'),
      /** Cartes de 290 × 332 px au lieu de 353 × 400 (etudes, informatique) */
      petitesCartes: z.boolean().optional(),
      cartes: z.array(carteIcone).min(1),
      lienTout: lienTout.optional(),
    })
    .strict()

  /** Titre et texte à gauche, grille d'icônes à droite (HeroWithText2) */
  const texteIcones = z
    .object({
      type: z.literal('texte-icones'),
      ...communs,
      titre: texteCourt,
      texte: markdown.optional(),
      bouton: bouton.optional(),
      boutons: boutons.optional(),
      couleurIcones: couleur,
      icones: z.array(z.object({ icone, texte: texteCourt }).strict()).min(1),
    })
    .strict()

  /** Grande icône dans un carré à gauche, titre et texte à droite (HeroWithText et IconInSquare) */
  const iconeTexte = z
    .object({
      type: z.literal('icone-texte'),
      ...communs,
      icone,
      couleurIcone: z.union([couleur, z.literal('blanc')]),
      titre: texteCourt,
      texte: markdown,
      boutons: boutons.optional(),
      /** Accordéons sous le bloc (engagements : principes de l'IA) */
      accordeons: z.array(volet).min(1).optional(),
      couleurAccordeons: couleurAccordeons,
    })
    .strict()

  /** Titre, texte et liste de liens décrits (RichList). Sans `titre`, les
   *  titres des liens deviennent les h2 de la page (a-propos, obtenir). */
  const listeLiens = z
    .object({
      type: z.literal('liste-liens'),
      ...communs,
      titre: texteCourt.optional(),
      texte: markdown.optional(),
      liens: z
        .array(z.object({ titre: texteCourt, description: texteCourt.optional(), lien, appel: texteCourt.optional() }).strict())
        .min(1),
    })
    .strict()

  /** Titre, texte et rangée de boutons */
  const texte = z
    .object({
      type: z.literal('texte'),
      ...communs,
      titre: texteCourt,
      texte: markdown.optional(),
      boutons: boutons.optional(),
    })
    .strict()

  /** Quoi de neuf de l'accueil : événements, nouvelles et formations (QuoiDeNeuf) */
  const quoiDeNeuf = z
    .object({
      type: z.literal('quoi-de-neuf'),
      ...communs,
      titre: texteCourt,
      nombre: z.number().int().min(1).max(10).default(4),
    })
    .strict()

  /** Cartes à icône compactes, en rangées de deux dès 600 px (GrilleElargissable) */
  const grilleElargissable = z
    .object({
      type: z.literal('grille-elargissable'),
      ...communs,
      titre: texteCourt,
      texte: markdown.optional(),
      couleurCartes: z.enum(['bleuPrincipal', 'vertFonce', 'rose300', 'jaune']).default('bleuPrincipal'),
      cartes: z.array(carteIcone).min(1),
      bouton: bouton.optional(),
    })
    .strict()

  /** Photo en fond de bande, texte dans la moitié droite (Section image) */
  const imageFond = z
    .object({
      type: z.literal('image-fond'),
      ...communs,
      fond: z.never().optional(),
      titre: texteCourt,
      texte: markdown,
      image: image(),
      /** Hauteur de la photo gardée au recadrage, comme la bannière */
      cadrage: z
        .string()
        .regex(/^(100|[1-9]?\d)%$/, { message: 'Le cadrage est un pourcentage de 0% à 100% (0% : le haut de la photo, 50% : le centre).' })
        .optional(),
      bouton: bouton.optional(),
    })
    .strict()

  /** Carte qui se retourne : photo (FlipCardWithImage) ou icône sur fond uni (FlipCardWithBg) */
  const carteRevelation = z
    .object({
      titre: texteCourt,
      sousTitre: texteCourt.optional(),
      image: image().optional(),
      icone: icone.optional(),
      texte: markdown.optional(),
      bouton: bouton.optional(),
    })
    .strict()
    .refine((carte) => Boolean(carte.image) !== Boolean(carte.icone), { message: 'Une carte à révélation a soit une `image`, soit une `icone` (une seule des deux)' })

  /** Carrousel de cartes à révélation (Carousel1) */
  const cartesRevelation = z
    .object({
      type: z.literal('cartes-revelation'),
      ...communs,
      titre: texteCourt,
      texte: markdown.optional(),
      /** Fond des cartes à icône */
      couleurCartes: z.enum(['bleuPrincipal', 'rose300', 'vertFonce']).default('bleuPrincipal'),
      /** `compacte` : cartes dépliables en rangées de deux (CarteDepliable) au lieu du carrousel ; cartes à icône seulement */
      disposition: z.enum(['carrousel', 'compacte']).default('carrousel'),
      cartes: z.array(carteRevelation).min(1),
      lienTout: lienTout.optional(),
    })
    .strict()
    .refine((bloc) => bloc.disposition !== 'compacte' || bloc.cartes.every((carte) => carte.icone && !carte.bouton), {
      message: 'La disposition `compacte` demande des cartes à `icone`, sans `bouton`',
    })

  /** Carrousel de cartes à photo (Carousel1 et CardWithImage) */
  const carrouselImages = z
    .object({
      type: z.literal('carrousel-images'),
      ...communs,
      titre: texteCourt,
      texte: markdown.optional(),
      cartes: z.array(carteImage).min(1),
    })
    .strict()

  /** Grille de cartes à photo (CardWithImage). Sans `titre`, les titres des
   *  cartes deviennent les h2 de la page (nous-soutenir). */
  const cartesImages = z
    .object({
      type: z.literal('cartes-images'),
      ...communs,
      titre: texteCourt.optional(),
      texte: markdown.optional(),
      cartes: z.array(carteImage).min(1),
    })
    .strict()

  /** Grille de cartes-liens bleues à icône (Card2) ; leurs titres sont des liens */
  const cartesLiens = z
    .object({
      type: z.literal('cartes-liens'),
      ...communs,
      cartes: z.array(z.object({ titre: texteCourt, icone, lien }).strict()).min(1),
    })
    .strict()

  /** Onglets verticaux (Tabs1), un panneau = titre, texte et cartes à photo */
  const onglets = z
    .object({
      type: z.literal('onglets'),
      ...communs,
      /** `colonnes` : panneaux côte à côte, cartes en liste à vignettes (ListeVignettes), sans onglets */
      disposition: z.enum(['onglets', 'colonnes']).default('onglets'),
      onglets: z
        .array(
          z
            .object({
              etiquette: texteCourt,
              titre: texteCourt,
              id: ancre.optional(),
              texte: markdown.optional(),
              cartes: z.array(carteImage).min(1),
            })
            .strict(),
        )
        .min(2),
    })
    .strict()

  /** Accordéons (AccordionGroup) sous un titre */
  const accordeons = z
    .object({
      type: z.literal('accordeons'),
      ...communs,
      titre: texteCourt,
      texte: markdown.optional(),
      couleur: couleurAccordeons,
      volets: z.array(volet).min(1),
    })
    .strict()

  /** Fiches de toutes les bibliothèques (FichesBibliotheques) */
  const fichesBibliotheques = z
    .object({
      type: z.literal('fiches-bibliotheques'),
      ...communs,
      titre: texteCourt,
      texte: markdown.optional(),
    })
    .strict()

  /** Prochaines formations, en deux colonnes côte à côte (ListeFormationsAccueil) */
  const formations = z
    .object({
      type: z.literal('formations'),
      ...communs,
      titre: texteCourt,
      texte: markdown.optional(),
      /** Nombre de formations, réparties en deux colonnes (pair de préférence) */
      nombre: z.number().int().min(2).max(20).default(8),
      lienTout: lienTout.optional(),
    })
    .strict()

  const bloc = z.discriminatedUnion('type', [
    imageTexte,
    cartesSections,
    carrousel,
    texteIcones,
    iconeTexte,
    listeLiens,
    texte,
    quoiDeNeuf,
    grilleElargissable,
    imageFond,
    cartesRevelation,
    carrouselImages,
    cartesImages,
    cartesLiens,
    onglets,
    accordeons,
    fichesBibliotheques,
    formations,
  ])

  return z
    .object({
      // Mêmes noms que le frontmatter des pages de texte : fil d'Ariane,
      // navigation secondaire et recherche les lisent de la même façon
      title: texteCourt,
      crumbLabel: texteCourt.optional(),
      description: z.string().optional(),
      secondaryNav,
      noindex: z.boolean().optional(),
      lang,
      banniere: banniere.optional(),
      sections: z.array(bloc).min(1),
    })
    .strict()
}
