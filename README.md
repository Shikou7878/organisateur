# Mon Organisateur

Application de gestion de tâches avec synchronisation Firebase temps réel.

## Structure du projet

```
organisateur/
│
├── index.html              ← Structure HTML uniquement (ne pas toucher souvent)
│
├── css/
│   ├── base.css            ← Variables CSS, couleurs, polices → modifiez ici pour changer le thème
│   ├── layout.css          ← Sidebar, shell, navigation, responsive
│   └── components.css      ← Tous les composants UI (cartes, badges, boutons, modales...)
│
├── js/
│   ├── config.js           ← 🔑 Vos clés Firebase (à remplir une seule fois)
│   ├── state.js            ← Variables globales partagées entre modules
│   ├── utils.js            ← Fonctions utilitaires (dates, uid, échappement HTML)
│   ├── firebase.js         ← Synchronisation Firebase + fallback localStorage
│   ├── tasks.js            ← Page "Tâches du jour"
│   ├── planner.js          ← Page "Planificateur" (drag & drop)
│   ├── agenda.js           ← Page "Agenda" + transfert automatique
│   ├── recur.js            ← Page "Récurrences" + génération auto
│   ├── matrix.js           ← Page "Matrice d'Eisenhower"
│   └── app.js              ← Navigation + initialisation
│
└── README.md               ← Ce fichier
```

## Où toucher quoi ?

| Je veux…                        | Fichier à ouvrir        |
|---------------------------------|-------------------------|
| Changer les couleurs            | `css/base.css`          |
| Modifier la mise en page        | `css/layout.css`        |
| Modifier un composant visuel    | `css/components.css`    |
| Ajouter une fonctionnalité tâches | `js/tasks.js`         |
| Modifier le planificateur       | `js/planner.js`         |
| Modifier l'agenda               | `js/agenda.js`          |
| Ajouter une nouvelle page       | `index.html` + nouveau `js/mapage.js` |
| Changer les clés Firebase       | `js/config.js`          |

## Déploiement

1. Modifiez le code dans VS Code
2. Dans GitKraken : Stage → Commit → Push
3. GitHub Pages se met à jour automatiquement en 1-2 minutes
4. Toutes les données Firebase restent intactes

## Ajouter une nouvelle page

1. Ajouter le HTML dans `index.html` (copier un bloc `<div class="page">` existant)
2. Ajouter le lien dans la sidebar (`<div class="nav-item">`)
3. Créer `js/mapage.js` avec les fonctions `addXxx()`, `renderXxx()`
4. Ajouter `<script src="js/mapage.js"></script>` dans `index.html`
5. Ajouter `if (name === 'mapage') renderXxx();` dans `showPage()` dans `app.js`
