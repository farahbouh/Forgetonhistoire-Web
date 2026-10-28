<div align="center">

# Forge ton histoire : interface Angular

**Interface web de l'outil d'aide à l'écriture pour structurer un univers romanesque : livres, univers, personnages, lieux, événements et chronologie**

![Status](https://img.shields.io/badge/status-en%20cours-orange)
![Dernière mise à jour](https://img.shields.io/github/last-commit/farahbouh/Forgetonhistoire-Web?label=derni%C3%A8re%20mise%20%C3%A0%20jour)

![Angular](https://img.shields.io/badge/Angular-standalone%20%2B%20signals-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow?logo=conventionalcommits)

[Dépôt de l'API Java](https://github.com/farahbouh/Forgetonhistoire) · [Installation](#mise-en-place) · [Feuille de route](#feuille-de-route) · [Signaler un bug](../../issues)

</div>

---

## Pourquoi ce projet ?

Ce dépôt contient l'interface web de **Forge ton histoire**, un outil pour les écrivains qui construisent un univers : retrouver ses personnages, ses lieux et ses événements, et garder le tout cohérent dans le temps.

Le projet est réparti sur deux dépôts :

| Dépôt | Rôle |
|---|---|
| [Forgetonhistoire](https://github.com/farahbouh/Forgetonhistoire) | Backend Java : modèle métier, vérifications de cohérence, API REST, persistance JSON, version console |
| [Celui-ci](https://github.com/farahbouh/Forgetonhistoire-Web) | Interface Angular qui consomme l'API |

> **Avancement :** le backend est fonctionnel et l'interface est en cours de développement. Le projet avance à un rythme d'**une à deux fonctionnalités par semaine**.

---

## Stack technique

| | |
|---|---|
| **Framework** | Angular, composants standalone |
| **État** | Signals Angular |
| **Appels API** | `HttpClient`, vers l'API Java sur `http://localhost:8080` |
| **Formulaires** | `FormsModule` (`ngModel`) |
| **Langage** | TypeScript |

---

## Fonctionnalités disponibles

### Livres

- [x] Créer un livre (titre obligatoire, type, description)
- [x] Reprendre un livre existant depuis la liste
- [x] Ouvrir un livre et consulter son contenu, puis le fermer

### Univers

- [x] Afficher les univers d'un livre
- [x] Créer un univers (nom obligatoire, type)

### Personnages

- [x] Lister les personnages de chaque univers
- [x] Créer un personnage (nom et prénom obligatoires, description)
- [x] Modifier un personnage directement dans la liste, sans changer de page
- [x] Renseigner une date de naissance et une date de décès (jour, mois, année), affichées au format jj/mm/aaaa
- [x] Afficher l'âge au décès à côté de la date de décès

### Cohérence des données

La logique de cohérence est géré par l'[API Java](https://github.com/farahbouh/Forgetonhistoire) et l'interface la rend seulement visible :

- [x] **Dates de personnages** : si l'API refuse des dates incohérentes (par exemple un décès antérieur à la naissance), son message s'affiche dans le formulaire et les champs de date passent en erreur
- [x] **Validation à la saisie** : titre d'un livre, nom d'un univers, nom et prénom d'un personnage obligatoires, contrôlés avant tout envoi
- [x] **Erreurs réseau et serveur** : message d'erreur affiché à l'écran 
- [x] **Correction facilitée** : la mise en évidence disparaît dès que l'on modifie un champ
- [x] **Statut à une année donnée** : pour chaque personnage, saisir une année et voir s'il n'est pas encore né, est vivant, ou est mort (avec l'âge au décès quand on teste l'année exacte du décès)

---

## Fonctionnalité en cours
### Prévu
**Gestion du contenu existant**

- [ ] Supprimer un personnage
- [ ] Modifier et supprimer un livre ou un univers

**Lieux**

- [ ] Lister et créer des lieux dans un univers
- [ ] Donner plusieurs noms successifs à un lieu selon les époques (par exemple Lugdunum, puis Lyon), avec refus des périodes qui se chevauchent ou sont inversées

**Événements**

- [ ] Lister et créer des événements dans un univers

**Liens**

- [ ] Relier personnages, lieux et événements entre eux

**Temps**

- [ ] Choisir le système de calendrier d'un univers (grégorien, lunaire, calendrier libre)
- [ ] Saisir les dates avec un sélecteur adapté au calendrier choisi
- [ ] Afficher une frise chronologique des événements et de la vie des personnages

**Confort d'usage**

- [ ] Découper l'interface en composants plus petits (livres, univers, personnages)
- [ ] Adapter l'affichage aux écrans de téléphone
- [ ] Rechercher un personnage, un lieu ou un événement dans un livre

**À plus long terme**

- [ ] Déploiement en ligne pour que d'autres personnes puissent utiliser l'outil
---

## Mise en place

Il vous faut Node.js 20 (par exemple avec `nvm use 20`), Angular CLI, et l'[API Java](https://github.com/farahbouh/Forgetonhistoire) lancée sur le port 8080.

```bash
git clone https://github.com/farahbouh/Forgetonhistoire-Web.git
cd Forgetonhistoire-Web
npm install
ng serve
```

L'interface est disponible sur http://localhost:4200.

<details>
<summary>Structure du projet</summary>

```bash
.
├── .editorconfig
├── .gitignore
├── .prettierrc
├── README.md
├── angular.json
├── package-lock.json
├── package.json
├── public
│   └── favicon.ico
├── src
│   ├── app
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   ├── app.css
│   │   ├── app.html
│   │   ├── app.routes.ts
│   │   └── services
│   │       ├── connexion-java.service.spec.ts
│   │       └── connexion-java.service.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── tsconfig.app.json
├── tsconfig.json
└── tsconfig.spec.json
```
</details>
<details>
<summary>Un problème au lancement ?</summary>

- **La liste des livres ne s'affiche pas** : vérifiez que le serveur Java tourne bien (`http://localhost:8080/test` doit répondre).
- **Erreur CORS dans la console du navigateur** : l'API doit autoriser les appels depuis `http://localhost:4200`.
- **Port 4200 déjà utilisé** : fermez l'ancien `ng serve` (sous Linux : `fuser -k 4200/tcp`), ou lancez `ng serve --port 4300`.
- **Erreurs à l'installation ou au lancement** : vérifiez que vous êtes bien sur Node.js 20 (`node -v`).
</details>

---

## Ce que ce projet m'a appris

- Construire une interface Angular moderne avec des composants standalone et des signals
- Communiquer avec une API REST (GET, POST, PUT) et gérer les erreurs côté interface
- Gérer des formulaires avec validation et retour visuel sur les champs en erreur
- Faire évoluer un projet réparti sur deux dépôts

---

## Contribuer

Les suggestions sont les bienvenues : ouvrez un [ticket](../../issues) pour proposer une idée ou signaler un problème.

---

<div align="center">

Réalisé par [Farah](https://github.com/farahbouh)

Contact : [LinkedIn](https://www.linkedin.com/in/farahbouh) · [Email](mailto:farah.bouhnaida@gmail.com)

</div>