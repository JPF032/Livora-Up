# Guide d'utilisation - Livora UP Expo

Ce guide détaille les étapes nécessaires pour configurer, développer et déployer Livora UP dans sa version migrée vers Expo.

## Table des matières

1. [Configuration initiale](#configuration-initiale)
2. [Développement](#développement)
3. [Utilisation des fonctionnalités](#utilisation-des-fonctionnalités)
4. [Déploiement](#déploiement)
5. [Résolution des problèmes courants](#résolution-des-problèmes-courants)

## Configuration initiale

### Prérequis

- Node.js 16.x ou supérieur
- npm 8.x ou supérieur
- Expo CLI (`npm install -g expo-cli`)
- Simulateur iOS (pour macOS) ou Émulateur Android
- Expo Go sur votre appareil mobile (pour le développement rapide)

### Installation

1. Clonez le dépôt si ce n'est pas déjà fait :
   ```bash
   git clone <url-du-repo> LivoraUpExpo
   cd LivoraUpExpo
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configuration de Firebase :
   - Assurez-vous que les paramètres dans `src/services/firebaseConfig.js` correspondent à votre projet Firebase
   - Si vous utilisez un nouveau projet Firebase, mettez à jour les identifiants

4. Vérifiez votre configuration :
   ```bash
   npm run verify
   ```

## Développement

### Démarrage rapide

Utilisez notre script de développement interactif :
```bash
npm run dev
```

Ce script vous offre plusieurs options pour démarrer l'application selon vos besoins.

### Commandes standard

- `npm start` : Démarre l'application avec Expo
- `npm run android` : Démarre sur un émulateur ou appareil Android
- `npm run ios` : Démarre sur un simulateur ou appareil iOS
- `npm run web` : Démarre en mode web
- `npm run clear-cache` : Nettoie le cache d'Expo et redémarre

### Structure du projet

```
LivoraUpExpo/
├── app/                 # Structure de navigation Expo Router
│   ├── (auth)/          # Routes d'authentification
│   ├── (tabs)/          # Navigation par onglets
│   ├── _layout.js       # Layout principal de navigation
│   └── index.js         # Point d'entrée de l'application
├── src/
│   ├── screens/         # Écrans de l'application
│   ├── services/        # Services (Firebase, API, etc.)
│   └── components/      # Composants réutilisables
├── scripts/             # Scripts utilitaires
└── app.json             # Configuration Expo
```

## Utilisation des fonctionnalités

### Authentification

L'application utilise Firebase Authentication pour gérer les utilisateurs :
- Connexion par email/mot de passe
- Inscription avec création de compte
- Réinitialisation du mot de passe

### Analyse alimentaire

La fonctionnalité d'analyse alimentaire par photo utilise :
1. `expo-camera` pour accéder à l'appareil photo
2. `expo-image-manipulator` pour optimiser les images avant envoi
3. L'API Clarifai via notre service backend pour l'analyse

Pour utiliser cette fonctionnalité :
1. Accédez à l'onglet Nutrition
2. Appuyez sur "Analyser un repas (photo)"
3. Prenez une photo de votre repas
4. Les résultats de l'analyse seront affichés

### Programme sportif

Le programme sportif vous permet de :
- Visualiser vos exercices quotidiens
- Marquer les exercices comme complétés
- Suivre votre progression

### Profil utilisateur

Gérez vos informations personnelles et préférences :
- Modification du nom d'affichage
- Paramètres des notifications
- Thème de l'application
- Déconnexion

## Déploiement

### Préparation pour la production

1. Mettez à jour la version dans `app.json` :
   ```json
   {
     "expo": {
       "version": "1.0.0",
       "ios": { "buildNumber": "1" },
       "android": { "versionCode": 1 }
     }
   }
   ```

2. Construisez l'application pour les magasins d'applications :
   
   Pour Android :
   ```bash
   eas build -p android
   ```
   
   Pour iOS :
   ```bash
   eas build -p ios
   ```

3. Soumettez aux magasins d'applications :
   
   Pour Android :
   ```bash
   eas submit -p android
   ```
   
   Pour iOS :
   ```bash
   eas submit -p ios
   ```

## Résolution des problèmes courants

### Problèmes de dépendances

Si vous rencontrez des erreurs liées aux dépendances :
```bash
npm run clear-cache
npm install
```

### Problèmes de connexion Firebase

Vérifiez :
1. La configuration dans `src/services/firebaseConfig.js`
2. Que les services Firebase (Auth, Firestore) sont activés dans la console Firebase
3. Les règles de sécurité Firestore

### Problèmes de caméra

Si la caméra ne fonctionne pas :
1. Vérifiez que les permissions sont correctement configurées dans `app.json`
2. Sur un appareil physique, assurez-vous que l'application a les autorisations nécessaires
3. Redémarrez l'application après avoir accordé les permissions

### Erreurs de navigation

En cas de problèmes de navigation :
1. Vérifiez la structure des fichiers dans le dossier `app/`
2. Assurez-vous que tous les imports de `expo-router` sont corrects
3. Nettoyez le cache avec `npm run clear-cache`

---

Pour toute question supplémentaire ou assistance, consultez la documentation Expo officielle à [docs.expo.dev](https://docs.expo.dev/) ou contactez l'équipe de développement Livora UP.
