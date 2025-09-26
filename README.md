## 🎵 À propos

TuneRate est une application web qui permet aux passionnés de musique de découvrir, noter et partager leurs opinions sur des albums et des EP. Inspiré par Letterboxd (pour les films), TuneRate se concentre exclusivement sur les albums complets et les EP, créant ainsi une communauté dédiée à l'appréciation des œuvres musicales complètes.

## ✨ Fonctionnalités

- **Recherche intelligente** : Recherchez des albums et des EP (pas de singles) avec un système de filtrage avancé
- **Détails des albums** : Consultez les informations détaillées sur chaque album
- **Système d'authentification** : Inscription, connexion et profil utilisateur
- **Interface responsive** : Design adaptatif pour mobile et desktop
- **Expérience utilisateur fluide** : Animations et transitions élégantes
- **Intégration API** : Communication transparente avec le backend TuneRate

## 🚀 Technologies utilisées

- **React 19** avec hooks et composants fonctionnels
- **TypeScript** pour le typage statique
- **Vite** comme outil de build ultra-rapide
- **React Router v7** pour la navigation
- **Axios** pour les requêtes HTTP
- **TailwindCSS** pour le styling
- **Heroicons** pour les icônes

## 📋 Prérequis

- Node.js (v18 ou supérieur)
- npm ou yarn
- API Backend TuneRate en cours d'exécution (voir le dépôt backend)

## 🛠️ Installation

```bash
# Cloner le dépôt
git clone https://github.com/EnzoDelpy/tunerate-frontend.git
cd tunerate-frontend

# Installer les dépendances
npm install
# ou
yarn install

# Lancer le serveur de développement
npm run dev
# ou
yarn dev
```

L'application sera disponible à l'adresse [http://localhost:5173](http://localhost:5173).

## 🏗️ Structure du projet

```
tunearate-frontend/
├── public/             # Fichiers statiques
├── src/
│   ├── api/            # Configuration Axios et appels API
│   ├── components/     # Composants réutilisables
│   ├── pages/          # Composants de page
│   ├── utils/          # Fonctions utilitaires
│   ├── App.tsx         # Composant principal
│   ├── Routes.tsx      # Configuration des routes
│   └── main.tsx        # Point d'entrée de l'application
├── .eslintrc.json      # Configuration ESLint
├── index.html          # Template HTML
├── package.json        # Dépendances et scripts
├── tsconfig.json       # Configuration TypeScript
└── vite.config.ts      # Configuration Vite
```

## 📱 Pages principales

- **LandingPage** : Page d'accueil pour les visiteurs non connectés
- **HomePage** : Tableau de bord utilisateur après connexion
- **SearchAlbumsPage** : Recherche et affichage des albums et EP
- **AlbumDetailPage** : Détails d'un album spécifique
- **LoginPage** / **RegisterPage** : Authentification utilisateur
- **ProfilePage** : Gestion du profil utilisateur

## 🔄 Communication avec l'API

L'application communique avec le backend TuneRate via Axios. Les requêtes sont configurées dans le dossier `api/` et incluent l'authentification par token JWT.

```typescript
// Exemple d'utilisation d'API
const albums = await albumsApi.searchAlbums(searchQuery, page, limit);
```

## 🧪 Tests

```bash
# Lancer les tests
npm run test
# ou
yarn test
```

## 🏗️ Build de production

```bash
# Créer un build de production
npm run build
# ou
yarn build

# Prévisualiser le build
npm run preview
# ou
yarn preview
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add some amazing feature'`)
4. Pushez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus d'informations.

## 📞 Contact

Enzo Delpy - [@EnzoDelpy](https://github.com/EnzoDelpy)

Lien du projet : [https://github.com/EnzoDelpy/tunerate-frontend](https://github.com/EnzoDelpy/tunerate-frontend)

---

Réalisé avec ❤️ pour tous les passionnés de musique
