# API Backend Livora UP

API backend pour l'application Livora UP, construite avec Express.js, MongoDB et Firebase Admin.

## Table des matières

- [Configuration](#configuration)
- [Lancement du serveur](#lancement-du-serveur)
- [Authentification](#authentification)
- [Routes API](#routes-api)
- [Tests](#tests)
- [Mode Développement](#mode-développement)

## Configuration

### Prérequis

- Node.js (v14 ou plus récent)
- MongoDB (local ou cloud comme MongoDB Atlas)
- Un projet Firebase avec authentification activée

### Installation des dépendances

```bash
cd backend
npm install
```

### Variables d'environnement

Créez un fichier `.env` à la racine du dossier `backend` basé sur `.env.example` :

```env
# Configuration pour MongoDB
MONGO_URI=mongodb://localhost:27017/livoradb

# Configuration Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVotre clé privée ici\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=your-service-account-email@example.com

# Configuration du serveur
PORT=3000
NODE_ENV=development
```

### Configuration de Firebase Admin

1. Accédez à la console Firebase : [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Sélectionnez votre projet
3. Allez dans "Project settings" > "Service accounts"
4. Cliquez sur "Generate new private key"
5. Utilisez les valeurs du fichier JSON téléchargé pour remplir les variables d'environnement

## Lancement du serveur

### Mode développement

```bash
npm run dev
```

### Mode production

```bash
npm start
```

## Authentification

L'API utilise Firebase pour l'authentification. Toutes les routes protégées nécessitent un token JWT Firebase valide.

### Obtention d'un token Firebase

Côté client, vous pouvez obtenir un token Firebase avec :

```javascript
// Avec Firebase v9+
const token = await getAuth().currentUser.getIdToken();
```

### Utilisation du token dans les requêtes API

Ajoutez le token dans l'en-tête HTTP `Authorization` au format Bearer :

```
Authorization: Bearer <firebase-token>
```

## Routes API

Toutes les routes API commencent par `/api`.

### Routes publiques

- `GET /api/health` - Vérification de la santé de l'API

### Routes protégées (nécessitent authentification)

#### Profil utilisateur

- `GET /api/profile` - Récupérer le profil de l'utilisateur connecté
- `PUT /api/profile` - Mettre à jour le profil utilisateur
  - Corps de la requête: `{ "displayName": "Nouveau nom", "metadata": { ... } }`

#### Programme sportif

- `GET /api/programs/sport` - Récupérer le programme sportif de l'utilisateur
- `POST /api/programs/sport/track` - Enregistrer un entraînement
  - Corps de la requête: `{ "exerciseId": "id-exercice", "completed": true, "actualSets": 3, "actualReps": 12, "notes": "..." }`

#### Programme nutritionnel

- `GET /api/programs/nutrition` - Récupérer le programme nutritionnel de l'utilisateur
- `POST /api/programs/nutrition/track` - Enregistrer un repas
  - Corps de la requête: `{ "mealTypeId": "id-type-repas", "mealSuggestionId": "id-suggestion", "customMeal": "...", "satisfied": true, "notes": "..." }`

## Tests

Exécutez les tests avec :

```bash
npm test
```

Les tests incluent :
- Tests unitaires du middleware d'authentification
- Tests d'intégration des routes API

## Mode Développement

En mode développement, vous pouvez utiliser un token spécial pour contourner l'authentification Firebase :

```
Authorization: Bearer dev-mock-token-for-testing
```

Ce token ne fonctionnera qu'en mode développement (`NODE_ENV=development`).
