# Romy's Projects Hub

Un village en pixel-art qui suit tous mes projets : une maison par projet, un petit personnage par dépôt de code.
Activité, niveau, liens, conversations avec Claude, statistiques, recherche, notes et tutoriel intégré.

## Utiliser la page
- **Village** (page d'accueil) : une seule ligne de maisons qui défile avec les flèches ← →, la molette, les boutons sur les côtés ou les repères en bas. Clic sur une maison ou un personnage pour ouvrir sa fiche. Les liens s'ouvrent dans un nouvel onglet.
- **Reprendre** : ouvre la conversation Claude la plus récente.
- **Recherche** : `Ctrl+K` (projets, dépôts, conversations). Flèches `←` `→` : projet suivant ou précédent.
- **Stats** : calendrier d'activité, classement des dépôts, langages, fiches détaillées.
- **?** : visite guidée et explication de chaque symbole du village.
- **Connexion** : la case « Garder cet appareil connecté » mémorise une clé non exportable dans le navigateur. Le bouton de sortie l'efface.

## Conversations, demandes et collaborateurs externes
- **Conversation principale** : le bouton à droite de chaque plaque l'ouvre en un clic. Elle se choisit dans la fiche du projet (« Choisir ou changer », ou « ☆ Principale » sur une conversation), sinon la plus active est retenue. Pour la rendre permanente, ajoutez `"main": "https://claude.ai/code/session_…"` au projet dans `HUB_PROJECTS` (le bouton « Rendre permanent » prépare le JSON).
- **Demandes en attente** : le bouton à gauche de la plaque, le bouton « Demandes » en haut, la boîte aux lettres et les colis du village ouvrent la liste des propositions (pull requests) et des tâches (issues). Un clic ouvre la demande sur GitHub, dans un nouvel onglet, pour y répondre.
- **Collaborateurs externes** : une personne est « externe » si elle n'est ni vous (`me`), ni dans `team` (global ou par projet, dans la configuration), ni un robot. Ils apparaissent comme des visiteurs au gilet orange. Le bouton « C'est l'équipe » les reclasse sur l'appareil.
- **Période** : 7 jours, 30 jours ou 12 semaines pour les chiffres, les statistiques, le classement et les collaborateurs.

## Suivi : usage, santé, alertes, échéances
- **Usage des sites** (applications Supabase) : utilisateurs inscrits et actifs, données saisies par jour, jours d'activité, volume en base, statut « utilisé / peu utilisé / pas utilisé ». Les utilisateurs apparaissent dans le village comme des personnages à casquette bleue.
  Le hub ne lit que des **totaux** (jamais de noms, d'e-mails ni de contenus), via une fonction SQL `hub_stats` protégée par une clé de lecture :
  1. Bouton « Connecter l'usage de ce site » (fiche du projet, ou puce « usage » du haut) : le hub génère la clé et le script SQL (`usage/hub-stats.sql`).
  2. Exécuter le script dans le SQL Editor de Supabase.
  3. Créer le secret GitHub `HUB_USAGE_KEY` (la même clé pour tous les sites) et recopier la configuration dans `HUB_PROJECTS`.
  Dans la configuration : `"usage": { "supabase": { "url": "https://xxxx.supabase.co", "anon": "clé publique du site" }, "ignore": ["textes"] }`.
  Une autre API peut fournir le même JSON : `"usage": { "endpoint": { "url": "https://…", "tokenEnv": "HUB_USAGE_TOKEN" } }`.
- **Autres sources d'usage** (un projet peut en combiner plusieurs, bouton « Connecter l'usage » puis « Sentry, Better Stack, UptimeRobot ») :
  | Outil | Ce que le hub affiche | Configuration | Secrets GitHub |
  |---|---|---|---|
  | UptimeRobot | disponibilité 7 et 30 jours, temps de réponse, fréquence des contrôles, dernière panne | `"uptimerobot": { "monitors": ["nom ou numéro"] }` (facultatif) | `HUB_UPTIMEROBOT_KEY` (clé API en lecture seule) |
  | Sentry | erreurs par jour, requêtes tracées, problèmes non résolus | `"sentry": { "org": "mon-organisation" }` | `HUB_SENTRY_TOKEN` (droits `org:read`, `project:read`, `event:read`) |
  | Better Stack | lignes de logs par jour (le vrai trafic) | `"betterstack": { "host": "…betterstackdata.com", "source": "t123456_mon_app" }` | `HUB_BETTERSTACK_USER`, `HUB_BETTERSTACK_PASS` (identifiants ClickHouse HTTP) |
  Les erreurs, la disponibilité et les pannes alimentent la santé du projet et le panneau « À surveiller ». Ces trois collecteurs suivent les API publiques des outils ; vérifiez leurs droits et leurs noms de source si une lecture échoue (le hub affiche la cause dans la fiche).
- **Disponibilité** : à chaque mise à jour, chaque site est contrôlé (code HTTP, temps de réponse, expiration du certificat).
- **Santé** (0 à 100) : activité, tests automatiques, propositions qui traînent, site en ligne, usage. Le détail est dans la fiche.
- **À surveiller** : tests en échec, site injoignable, certificat proche, propositions de plus de 30 jours, avis demandé, échéances, usage nul.
- **Échéances et renouvellements** : `"deadline": { "date": "2027-06-12", "label": "Mariage" }` et `"renewals": [{ "label": "Domaine", "date": "2027-03-01", "cost": "12 €" }]` (modifiables avec le crayon).
- **Mes tâches** par projet, **nouveautés depuis la dernière visite**, **résumé de la semaine** à copier, **sauvegarde des réglages** de l'appareil (menu « Modifier le hub »).
- **Modifier le hub** : lien vers la conversation Claude dédiée (`"hub": { "claude": "https://claude.ai/code/session_…" }`) et raccourcis vers le code, la mise à jour et les secrets.

## Éléments du village qui reflètent une donnée
Arc-en-ciel (tests au vert), camion (pipeline réussi < 24 h), ballon (version publiée < 3 j), étoile filante (activité < 1 h), volets fermés et toiles (rien depuis 30 j), cheminée et drapeau qui s'agitent avec l'activité, pluie (tests en échec), lettres qui débordent (10 propositions ou plus), personnages bleus (utilisateurs). Chaque élément explique sa signification au survol.
Le bouton « Me balader » permet de marcher dans le village (flèches ou ZQSD, clic au sol, Entrée pour interagir). Quelques surprises sont cachées : les trophées (🏆) les listent.

## Modifier un projet
Le crayon de la fiche change le nom, le logo, la couleur, la description et la liste des dépôts. Nom, logo et couleur s'appliquent tout de suite sur l'appareil. Pour les garder partout, « Rendre permanent » prépare la configuration à coller dans `HUB_PROJECTS`.

## Ajouter un projet
1. Bouton **+ Projet** dans la page : nom, logo, couleur et dépôts. Les dépôts se choisissent dans la liste de vos dépôts, ou se collent (liens GitHub, `proprietaire/nom`, commandes `git clone`, adresses SSH). La page prépare la configuration complète et pose un chantier dans le village.
2. Collez la configuration dans le secret `HUB_PROJECTS` (le bouton ouvre la bonne page GitHub).
3. Lancez le workflow « Sync & deploy » (Run workflow). Le projet apparaît en 1 à 2 minutes.

En local : `node scripts/add.mjs owner/repo [--project id] [--name ...] [--emoji ...]` modifie `projects.json` (ignoré par git).
Si le propriétaire du dépôt est nouveau (autre organisation), créez un token en lecture seule, ajoutez-le comme secret `HUB_TOKEN_<PROPRIÉTAIRE>` et déclarez-le dans `.github/workflows/sync.yml`.

## Logos
12 logos au choix (santé, mariage, cinéma, maison, fusée, cœur, étoile, livre, photo, code, boutique, musique) ou l'initiale du projet. Un projet sans choix explicite reçoit un logo selon son nom. Pour ajouter un logo : une grille 12×12 dans `EMB` (`app.js`).

## Principe de sécurité (dépôt public)
Ce dépôt ne contient **que du code**. Aucune donnée de projet n'y est stockée :
- la liste réelle des dépôts suivis (et les adresses des bases à mesurer) est dans le secret `HUB_PROJECTS` ;
- les données sont lues à chaque exécution avec des tokens en lecture seule (`HUB_TOKEN`, `HUB_TOKEN_<PROPRIÉTAIRE>`) ;
- la page publiée est **chiffrée** (AES-256-GCM, clé dérivée par PBKDF2) avec le secret `HUB_PASSWORD` (16 caractères minimum) ;
- les logs du workflow n'affichent aucun nom de dépôt.

## Développement local
```bash
node scripts/sync.mjs --gh    # lit les dépôts avec la CLI gh, écrit dist/index.html (non chiffré, ne pas publier)
```
Sources : `template.html` (structure et styles), `app.js` (application), `unlock.html` (connexion et chargement), `logo.svg`.
