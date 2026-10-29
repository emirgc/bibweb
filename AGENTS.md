# AGENTS.md

Conversion en Astro 7 du site des Bibliothèques de l'UdeM (source : `~/Documents/git/coquille-web`, en lecture seule).

Avant tout travail, lisez **`docs/CONVENTIONS.md`** : arborescence, styles, composants MDX, interactivité, exigences d'accessibilité (WCAG 2.2 AA) et façon de vérifier. Les spécifications détaillées de la source sont dans `docs/inventaire/`.

## Commandes

| Commande | Effet |
| :-- | :-- |
| `npm run dev` | Serveur de développement sur http://localhost:4321 |
| `npm run dev:fond` | Le même, en arrière-plan (`astro dev --background`) |
| `npm run dev:arreter` | Arrête le serveur en arrière-plan ; à faire après un déplacement de fichiers ou la modification d'un plugin |
| `npm run verifier` | Contrôle toutes les pages sur le serveur de dev : statut, pied de page, titres, « [object Object] », débordements (option `-- --ids=fichier.json`) |
| `npm test` | Tests unitaires (`src/**/*.test.ts`, avec `node --test`) : logique des horaires |
| `npm run indexer:externes` | Relève les pages de Studio·bib et de la Boîte à outils (`src/data/recherche/`) pour les suggestions de la recherche du menu ; à relancer quand ces sites changent |
| `npm run build` | Build statique dans `dist/` |
| `npm run preview` | Sert `dist/` |

- Node 22.22 ou plus récent (exigé par Astro 7).
- La langue du projet est le **français** : contenu, commentaires, messages de commit.
- Aucun commit sans l'accord explicite du responsable.
