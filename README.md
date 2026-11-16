# Project Hub

Tableau de bord de suivi de mes projets (activité, état, liens, conversations avec les agents) et vue « Village » en pixel-art.

## Principe de sécurité (dépôt public)
Ce dépôt ne contient **que du code**. Aucune donnée de projet n'y est stockée :
- la liste réelle des dépôts suivis est dans le secret `HUB_PROJECTS` (JSON, même format que `projects.example.json`) ;
- les données sont lues à chaque exécution avec des tokens en lecture seule (secrets `HUB_TOKEN`, `HUB_TOKEN_<PROPRIÉTAIRE>`) ;
- la page publiée est **chiffrée** (AES-256-GCM) avec le secret `HUB_PASSWORD` (16 caractères minimum) ;
- les logs du workflow n'affichent aucun nom de dépôt.

## Ajouter un projet
En local : `node scripts/add.mjs owner/repo [--project id]` modifie `projects.json` (ignoré par git).
Puis recopier le contenu de `projects.json` dans le secret `HUB_PROJECTS`.

## Utilisation locale
`node scripts/sync.mjs --gh` (utilise la CLI gh) puis ouvrir `dist/index.html`. Sans `HUB_PASSWORD`, la page n'est pas chiffrée : ne jamais la publier.
