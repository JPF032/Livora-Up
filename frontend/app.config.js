/**
 * Configuration dynamique Expo pour Livora UP
 * Charge les fichiers .env en fonction de l'environnement (APP_ENV)
 */
const path = require('path');
const fs = require('fs');
const { config } = require('dotenv');

// Détermine l'environnement courant (development par défaut)
const APP_ENV = process.env.APP_ENV || 'development';
console.log(`🚀 Chargement de l'environnement: ${APP_ENV}`);

// Charge les variables d'environnement du fichier .env.{environment}
const envPath = path.resolve(process.cwd(), `.env.${APP_ENV}`);
const fallbackEnvPath = path.resolve(process.cwd(), '.env');

// Charge d'abord le fichier spécifique à l'environnement, puis le .env générique en fallback
if (fs.existsSync(envPath)) {
  console.log(`📄 Chargement des variables depuis ${envPath}`);
  config({ path: envPath });
} else if (fs.existsSync(fallbackEnvPath)) {
  console.log(`⚠️ Fichier .env.${APP_ENV} non trouvé, utilisation de .env par défaut`);
  config({ path: fallbackEnvPath });
} else {
  console.warn('⚠️ Aucun fichier .env trouvé!');
}

// Obtient les valeurs des variables d'environnement pour les injecter dans la config
const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://api.livora-up.com';
const appEnv = process.env.EXPO_PUBLIC_APP_ENV || APP_ENV;
const enableLogs = process.env.EXPO_PUBLIC_ENABLE_LOGS === 'true';
const useMockData = process.env.EXPO_PUBLIC_MOCK_DATA === 'true';

// Charge la configuration de base depuis app.json
const config_json = require('./app.json');

// Applique la configuration avec les variables d'environnement
module.exports = {
  ...config_json,
  expo: {
    ...config_json.expo,
    name: `Livora UP${APP_ENV === 'development' ? ' (Dev)' : ''}`,
    extra: {
      ...config_json.expo.extra,
      apiUrl,
      appEnv,
      enableLogs,
      useMockData,
      // Vous pouvez ajouter d'autres valeurs ici
    },
    hooks: {
      postPublish: [
        {
          file: 'sentry-expo/upload-sourcemaps',
          config: {
            organization: 'livora',
            project: 'livora-up',
            authToken: process.env.SENTRY_AUTH_TOKEN,
          },
        },
      ],
    },
    updates: {
      // Permet les mises à jour Over-The-Air (OTA)
      enabled: true,
      checkAutomatically: 'ON_LOAD',
      fallbackToCacheTimeout: 30000,
      url: 'https://u.expo.dev/your-project-id',
    },
    runtimeVersion: {
      policy: 'sdkVersion',
    },
    // Configuration spécifique par plateforme
    android: {
      ...config_json.expo.android,
      versionCode: config_json.expo.android?.versionCode || 1,
      adaptiveIcon: {
        ...config_json.expo.android?.adaptiveIcon,
        backgroundColor: APP_ENV === 'development' ? '#FF6B6B' : '#3498DB',
      },
    },
    ios: {
      ...config_json.expo.ios,
      buildNumber: config_json.expo.ios?.buildNumber || '1.0.0',
    },
  },
};
