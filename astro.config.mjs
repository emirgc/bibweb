// @ts-check
import { defineConfig } from 'astro/config'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { unified } from '@astrojs/markdown-remark'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import rehypeAncresTitres from './src/plugins/rehype-ancres-titres.mjs'
import rehypeTitrePrincipal from './src/plugins/rehype-titre-principal.mjs'
import remarkDirective from 'remark-directive'
import { remarkDirectivesBib, rehypeDirectivesBib } from './src/plugins/directives.mjs'
import baseSousDossier from './src/plugins/base-sous-dossier.mjs'

const SITE = 'https://bib.umontreal.ca'

// Environnement déduit de la branche git, comme dans coquille-web ;
// SITE_ENV peut le forcer. Sert au robots.txt (src/pages/robots.txt.ts).
function branche() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return null
  }
}
process.env.SITE_ENV ||= branche() === 'production' ? 'production' : 'preprod'

// Pages à garder hors du sitemap : démos, tests, pages utilitaires et noindex
const HORS_SITEMAP = [/^\/dev\//, /^\/tests\//, /^\/formulaire-consentement-inscription\//, /^\/engagements\/science-ouverte\//, /^\/horaires\/test\//, /^\/consent\//]

// L'ordre compte : les ancres sont posées sur les niveaux d'origine (h2 à
// h4, comme dans la source), puis les titres des pages sans h1 montent
// d'un niveau en gardant leur id et leur lien d'ancre.
const rehypeTitres = [rehypeAncresTitres, rehypeTitrePrincipal]

// MDX (pages et nouvelles encore en .mdx)
const processeur = unified({
  rehypePlugins: rehypeTitres,
  // Les guillemets et apostrophes du contenu sont déjà typographiques
  smartypants: false,
})

// Pages de texte en Markdown pur (.md) : mêmes titres, plus les directives
// (:::modalites, ::bouton…, voir docs/REDACTION.md). Les directives ne
// s'appliquent pas au MDX, où un « voir:ici » doit rester du texte.
const processeurMarkdown = unified({
  remarkPlugins: [remarkDirective, remarkDirectivesBib],
  // rehypeDirectivesBib en dernier : il change les directives en marqueurs
  // que RenduDirectives.astro remplace par les composants du MDX
  rehypePlugins: [...rehypeTitres, rehypeDirectivesBib],
  smartypants: false,
})

export default defineConfig({
  site: SITE,
  // Sous-dossier de publication : seulement pour GitHub Pages (/bibweb),
  // fourni par le workflow (.github/workflows/deployer-pages.yml). Les liens
  // écrits à la racine sont préfixés en fin de build (base-sous-dossier).
  base: process.env.BASE_PATH || '/',
  // Toutes les URL de coquille-web finissent par une barre oblique
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Garde les espaces entre éléments en ligne (liens, icônes), comme en v6
  compressHTML: true,
  markdown: { processor: processeurMarkdown },
  integrations: [
    mdx({ processor: processeur }),
    react(),
    sitemap({ filter: (page) => !HORS_SITEMAP.some((motif) => motif.test(new URL(page).pathname)) }),
    baseSousDossier(),
  ],
  // Page vide dans la source : on renvoie vers la page du site qui en tient lieu
  redirects: {
    '/nous-soutenir/accessibilite-web/': '/accessibilite-web/',
  },
  vite: {
    // Imports `@/components/...` dans le contenu, au lieu de chemins relatifs
    // fragiles (../../../../components/...) ; voir aussi tsconfig.json
    resolve: { alias: { '@/': fileURLToPath(new URL('./src/', import.meta.url)) } },
  },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  image: {
    // Mêmes largeurs que gatsby-plugin-sharp
    breakpoints: [600, 900, 1200, 1536],
  },
})
