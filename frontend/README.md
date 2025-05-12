# Livora UP - Migration vers Expo 🚀

Ce projet est la version migrée de Livora UP vers [Expo](https://expo.dev), une plateforme pour le développement d'applications React Native qui simplifie le processus de développement et de déploiement.

## Caractéristiques de la migration

### Changements principaux

- 🔥 **Firebase** : Passage des modules natifs (`@react-native-firebase/*`) à la version JavaScript SDK (`firebase`)
- 📸 **Caméra** : Utilisation de `expo-camera` et `expo-image-manipulator` pour les fonctionnalités photo
- 🧭 **Navigation** : Implémentation de la navigation avec Expo Router
- 🔐 **Authentification** : Système de connexion/inscription avec Firebase Auth
- 🍽️ **Analyse alimentaire** : Intégration de Clarifai pour l'analyse des photos de repas

### Structure de l'application

- `app/` : Navigation et structure de l'application (Expo Router)
- `src/` : Composants, écrans et services
- `src/services/` : Intégration Firebase, API et services externes

## Installation et démarrage

1. Installer les dépendances

   ```bash
   npm install
   ```

2. Démarrer l'application

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
