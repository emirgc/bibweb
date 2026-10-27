import type { APIRoute } from 'astro'
import { readdirSync } from 'node:fs'
import { toutesLesPages, estVitrine, type PageTexte } from '@/lib/contenu'
import { SUJETS } from '@/data/sujets'
import { champsVitrine } from './_vitrines'

/*
 * Configuration de Decap CMS (/admin/config.yml), lue par public/admin/index.html.
 *
 * Générée à partir du contenu et des listes du code, pour qu'il n'y ait pas
 * de second schéma à tenir à la main : chaque page .md devient une fiche
 * (regroupées par section), les sujets et les bannières viennent de
 * src/data/sujets.ts et du dossier des bannières. Le build reste le juge :
 * Decap ne valide que la forme des champs, le schéma Zod de
 * content.config.ts refuse le reste.
 *
 * Choix :
 * - Le corps des pages et des nouvelles s'édite en Markdown brut : un éditeur
 *   visuel réécrirait les directives (:::tableau, ::bouton…) à l'enregistrement.
 * - Les vitrines (.yaml) ont leurs champs dans _vitrines.ts. Les pages .mdx ne
 *   sont pas encore modifiables.
 * - Decap réécrit l'en-tête (frontmatter) à l'enregistrement : ordre des champs
 *   de ce fichier, dates sans guillemets, listes à la ligne. Le corps n'est
 *   pas touché.
 * - En ligne, chaque enregistrement ouvre une pull request (editorial_workflow).
 *   En développement (npm run cms:local), Decap écrit directement dans les
 *   fichiers, sans branche : on voit le résultat dans le serveur de dev.
 * - Connexion : Decap ouvre admin/connexion.html sur le site même
 *   (DECAP_ORIGINE, ex. https://emirgc.github.io), qui passe au relais OAuth
 *   GitHub (DECAP_AUTH_URL, n8n). Voir connexion.html.ts.
 *
 * JSON.stringify suffit : un document JSON est un document YAML valide.
 */

export const prerender = true

const DEPOT = 'emirgc/bibweb'
const DOSSIER_BANNIERES = 'src/content/pages/images/super-heroes'

// Bannières de page (superHero.imageName) : noms de fichier sans extension
const bannieres = readdirSync(DOSSIER_BANNIERES)
  .filter((fichier) => /\.(webp|jpe?g|png|avif)$/i.test(fichier))
  .map((fichier) => fichier.replace(/\.[^.]+$/, ''))
  .sort((a, b) => a.localeCompare(b, 'fr'))

// Fenêtre de connexion (connexion.html.ts), chemin sans barre initiale
// sous le sous-dossier de publication : « bibweb/admin/connexion.html »
const pageConnexion = [process.env.BASE_PATH, 'admin/connexion.html']
  .map((partie) => partie?.replace(/^\/+|\/+$/g, ''))
  .filter(Boolean)
  .join('/')

// Images d'une page ou d'une nouvelle : dossier images/ à côté du fichier
const imagesACote = { media_folder: 'images', public_folder: './images' }

const corps = {
  label: 'Contenu',
  name: 'body',
  widget: 'markdown',
  modes: ['raw'],
  hint: 'Markdown et directives du site (:::tableau, ::bouton, :::alerte…) : voir le guide de rédaction.',
}

const champsPage = [
  { label: 'Titre', name: 'title', widget: 'string', required: false, hint: 'Titre de l’onglet et des listes.' },
  { label: 'Libellé du fil d’Ariane', name: 'crumbLabel', widget: 'string', required: false },
  { label: 'Description', name: 'description', widget: 'text', required: false, hint: 'Résumé pour les moteurs de recherche et le partage.' },
  {
    label: 'Menu de la section',
    name: 'secondaryNav',
    widget: 'object',
    required: false,
    collapsed: true,
    fields: [
      { label: 'Libellé dans le menu', name: 'title', widget: 'string', required: false },
      { label: 'Ordre', name: 'order', widget: 'number', value_type: 'int', required: false },
      { label: 'Masquer du menu', name: 'hidden', widget: 'boolean', required: false },
    ],
  },
  {
    label: 'Bannière',
    name: 'superHero',
    widget: 'object',
    required: false,
    collapsed: true,
    fields: [
      { label: 'Image', name: 'imageName', widget: 'select', options: bannieres },
      { label: 'Titre de la bannière', name: 'title', widget: 'string', required: false },
      { label: 'Cadrage', name: 'cadrage', widget: 'string', required: false, pattern: ['^(100|[1-9]?\\d)%$', 'Un pourcentage, par exemple 20%'] },
    ],
  },
  { label: 'Exclure des moteurs de recherche', name: 'noindex', widget: 'boolean', required: false },
  { label: 'Langue', name: 'lang', widget: 'string', required: false, hint: 'Seulement si la page n’est pas en français (ex. en).' },
  corps,
]

const champsNouvelle = [
  { label: 'Titre', name: 'title', widget: 'string' },
  { label: 'Titre affiché', name: 'titreAffiche', widget: 'string', required: false, hint: 'Seulement s’il diffère du titre.' },
  { label: 'Date', name: 'date', widget: 'datetime', format: 'YYYY-MM-DD', date_format: 'YYYY-MM-DD', time_format: false },
  { label: 'Type', name: 'type', widget: 'hidden', default: 'interne' },
  { label: 'Adresse (slug)', name: 'slug', widget: 'string', required: false, hint: 'Fin de l’adresse de la nouvelle. Ne pas changer après publication.' },
  { label: 'Source', name: 'source', widget: 'string', required: false, hint: 'Ex. Bibliothèques, Quoi de neuf.' },
  { label: 'Lien de la nouvelle d’origine', name: 'newsUrl', widget: 'string', required: false, pattern: ['^https?://', 'Une adresse complète (https://…)'] },
  { label: 'Auteurs', name: 'authors', widget: 'list', required: false },
  {
    label: 'Image',
    name: 'newsImage',
    widget: 'object',
    required: false,
    fields: [
      { label: 'Fichier', name: 'src', widget: 'image', required: false },
      { label: 'Texte de remplacement', name: 'alt', widget: 'string', required: false, hint: 'Ce que montre l’image, pour les personnes qui ne la voient pas.' },
      { label: 'Légende', name: 'legend', widget: 'string', required: false },
      { label: 'Crédit', name: 'caption', widget: 'string', required: false },
      { label: 'Source', name: 'source', widget: 'string', required: false },
    ],
  },
  {
    label: 'Sujets',
    name: 'sujets',
    widget: 'select',
    multiple: true,
    required: false,
    options: SUJETS.map(({ id, libelle }) => ({ label: libelle, value: id })),
  },
  corps,
]

// Libellé d'une section : titre de sa page d'accueil, sinon son nom de dossier
function libelleSection(section: string, titres: Map<string, string>) {
  return titres.get(section) ?? section.charAt(0).toUpperCase() + section.slice(1)
}

export const GET: APIRoute = async () => {
  const pages = await toutesLesPages()
  const titres = new Map(pages.filter((page) => !page.id.includes('/')).map((page) => [page.id, page.data.title ?? page.id]))

  // Pages .md hors démonstrations, regroupées par section (premier segment)
  const parSection = new Map<string, PageTexte[]>()
  for (const page of pages) {
    if (estVitrine(page) || !page.filePath?.endsWith('.md') || page.id.startsWith('dev/')) continue
    const section = page.id.includes('/') ? page.id.split('/')[0] : 'general'
    parSection.set(section, [...(parSection.get(section) ?? []), page])
  }

  const collectionsPages = [...parSection.entries()]
    .sort(([a], [b]) => (a === 'general' ? 1 : b === 'general' ? -1 : a.localeCompare(b, 'fr')))
    .map(([section, liste]) => ({
      name: `pages-${section}`,
      label: section === 'general' ? 'Pages générales' : `Pages : ${libelleSection(section, titres)}`,
      label_singular: 'Page',
      files: liste.map((page) => ({
        name: page.id.replaceAll('/', '--'),
        label: page.data.crumbLabel ?? page.data.title ?? page.id,
        file: page.filePath,
        ...imagesACote,
        fields: champsPage,
      })),
    }))

  // Vitrines (.yaml), l'accueil d'abord puis par titre
  const vitrines = pages
    .filter(estVitrine)
    .sort((a, b) => (a.id === 'index' ? -1 : b.id === 'index' ? 1 : (a.data.title ?? '').localeCompare(b.data.title ?? '', 'fr')))
  const collectionVitrines = {
    name: 'vitrines',
    label: 'Vitrines (accueil et sections)',
    label_singular: 'Vitrine',
    // Format de public/admin/format-vitrine.js : celui de Decap réécrirait
    // tout le fichier (commentaires, lignes vides, textes coupés à 80 colonnes)
    format: 'yaml-vitrine',
    extension: 'yaml',
    files: vitrines.map((vitrine) => ({
      name: vitrine.id.replaceAll('/', '--'),
      label: vitrine.id === 'index' ? 'Accueil' : (vitrine.data.crumbLabel ?? vitrine.data.title ?? vitrine.id),
      file: vitrine.filePath,
      media_folder: 'images',
      public_folder: 'images',
      fields: champsVitrine(bannieres),
    })),
  }

  const developpement = import.meta.env.DEV
  const config = {
    locale: 'fr',
    // Page de connexion et en-tête ; chemin relatif à /admin/, pour
    // fonctionner aussi dans un sous-dossier (/bibweb/admin/)
    logo: { src: '../images/logo-udem-bib.png', show_in_header: true },
    backend: {
      name: 'github',
      repo: DEPOT,
      branch: 'main',
      // Decap n'accepte le jeton que d'une fenêtre de l'origine base_url
      ...(process.env.DECAP_ORIGINE ? { base_url: process.env.DECAP_ORIGINE, auth_endpoint: pageConnexion } : {}),
      commit_messages: {
        create: 'Création de {{collection}} « {{slug}} »',
        update: 'Modification de {{collection}} « {{slug}} »',
        delete: 'Suppression de {{collection}} « {{slug}} »',
        uploadMedia: 'Ajout de l’image « {{path}} »',
        deleteMedia: 'Suppression de l’image « {{path}} »',
      },
    },
    ...(developpement ? { local_backend: true } : { publish_mode: 'editorial_workflow' }),
    // Un champ facultatif laissé vide n'est pas écrit dans le fichier
    omit_empty_optional_fields: true,
    // Images envoyées hors d'une page (rare) ; sinon, dossier images/ de la page
    media_folder: 'public/televersements',
    public_folder: '/televersements',
    slug: { encoding: 'ascii', clean_accents: true, sanitize_replacement: '-' },
    // L'aperçu de Decap ne connaît ni les directives ni les tableaux : il
    // montrerait une page qui n'a rien à voir avec le site
    editor: { preview: false },
    collections: [
      {
        name: 'nouvelles',
        label: 'Nouvelles',
        label_singular: 'Nouvelle',
        folder: 'src/content/nouvelles',
        path: '{{year}}/{{slug}}',
        extension: 'md',
        format: 'frontmatter',
        create: true,
        slug: '{{slug}}',
        summary: '{{date}} · {{title}}',
        // Liste simple : la forme { fields, default } (tri par défaut) n'existe
        // pas dans cette version de Decap, qui refuse alors toute la configuration
        sortable_fields: ['date', 'title'],
        ...imagesACote,
        fields: champsNouvelle,
      },
      collectionVitrines,
      ...collectionsPages,
    ],
  }

  return new Response(JSON.stringify(config, null, 2) + '\n', {
    headers: { 'Content-Type': 'text/yaml; charset=utf-8' },
  })
}
