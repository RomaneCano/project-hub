# Romy's Projects Hub

Un village en pixel-art qui suit tous mes projets : une maison par projet, un petit personnage par dépôt de code.
Activité, niveau, liens, conversations avec Claude, statistiques, recherche, notes et tutoriel intégré.

## Utiliser la page
- **Village** (page d'accueil) : clic sur une maison ou un personnage pour ouvrir sa fiche. Les liens s'ouvrent dans un nouvel onglet.
- **Reprendre** : ouvre la conversation Claude la plus récente.
- **Recherche** : `Ctrl+K` (projets, dépôts, conversations). Flèches `←` `→` : projet suivant ou précédent.
- **Stats** : calendrier d'activité, classement des dépôts, langages, fiches détaillées.
- **?** : visite guidée et explication de chaque symbole du village.
- **Connexion** : la case « Garder cet appareil connecté » mémorise une clé non exportable dans le navigateur. Le bouton de sortie l'efface.

## Ajouter un projet
1. Bouton **+ Projet** dans la page : nom, dépôts (`proprietaire/nom`), couleur. La page prépare la configuration complète et pose un chantier dans le village.
2. Collez la configuration dans le secret `HUB_PROJECTS` (le bouton ouvre la bonne page GitHub).
3. Lancez le workflow « Sync & deploy » (Run workflow). Le projet apparaît en 1 à 2 minutes.

En local : `node scripts/add.mjs owner/repo [--project id] [--name ...] [--emoji ...]` modifie `projects.json` (ignoré par git).
Si le propriétaire du dépôt est nouveau (autre organisation), créez un token en lecture seule, ajoutez-le comme secret `HUB_TOKEN_<PROPRIÉTAIRE>` et déclarez-le dans `.github/workflows/sync.yml`.

## Logos
Les projets dont le nom contient `care`/`santé`, `mariage` ou `ciné` ont un logo dédié. Les autres reçoivent une pastille avec leur initiale et leur couleur.
Pour ajouter un logo : une grille 12×12 dans `EMB` (`app.js`) et une règle dans `embKey`.

## Principe de sécurité (dépôt public)
Ce dépôt ne contient **que du code**. Aucune donnée de projet n'y est stockée :
- la liste réelle des dépôts suivis est dans le secret `HUB_PROJECTS` ;
- les données sont lues à chaque exécution avec des tokens en lecture seule (`HUB_TOKEN`, `HUB_TOKEN_<PROPRIÉTAIRE>`) ;
- la page publiée est **chiffrée** (AES-256-GCM, clé dérivée par PBKDF2) avec le secret `HUB_PASSWORD` (16 caractères minimum) ;
- les logs du workflow n'affichent aucun nom de dépôt.

## Développement local
```bash
node scripts/sync.mjs --gh    # lit les dépôts avec la CLI gh, écrit dist/index.html (non chiffré, ne pas publier)
```
Sources : `template.html` (structure et styles), `app.js` (application), `unlock.html` (connexion et chargement), `logo.svg`.
