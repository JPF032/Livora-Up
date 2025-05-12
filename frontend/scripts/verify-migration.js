/**
 * Script de vérification de la migration de Livora UP vers Expo
 * 
 * Ce script vérifie les points clés de la migration pour s'assurer que
 * toutes les fonctionnalités essentielles sont correctement configurées.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const paths = {
  root: path.resolve(__dirname, '..'),
  app: path.resolve(__dirname, '../app'),
  src: path.resolve(__dirname, '../src'),
  services: path.resolve(__dirname, '../src/services'),
  screens: path.resolve(__dirname, '../src/screens'),
};

const requiredFiles = [
  { path: path.join(paths.app, '_layout.js'), description: 'Layout principal de navigation' },
  { path: path.join(paths.app, 'index.js'), description: 'Point d\'entrée de l\'application' },
  { path: path.join(paths.app, '(auth)/login.js'), description: 'Écran de connexion' },
  { path: path.join(paths.app, '(auth)/register.js'), description: 'Écran d\'inscription' },
  { path: path.join(paths.app, '(auth)/forgot-password.js'), description: 'Écran de réinitialisation de mot de passe' },
  { path: path.join(paths.app, '(tabs)/_layout.js'), description: 'Navigation par onglets' },
  { path: path.join(paths.app, '(tabs)/index.js'), description: 'Écran d\'accueil' },
  { path: path.join(paths.app, '(tabs)/nutrition.js'), description: 'Écran nutritionnel' },
  { path: path.join(paths.app, '(tabs)/sport.js'), description: 'Écran sportif' },
  { path: path.join(paths.app, '(tabs)/profile.js'), description: 'Écran de profil' },
  { path: path.join(paths.services, 'firebaseConfig.js'), description: 'Configuration Firebase' },
  { path: path.join(paths.services, 'api.js'), description: 'Service API' },
  { path: path.join(paths.services, 'clarifaiService.js'), description: 'Service Clarifai' },
  { path: path.join(paths.screens, 'LoginScreen.js'), description: 'Composant écran de connexion' },
  { path: path.join(paths.screens, 'NutritionProgramScreen.js'), description: 'Composant écran nutritionnel' },
  { path: path.join(paths.root, 'metro.config.js'), description: 'Configuration Metro' },
  { path: path.join(paths.root, 'app.json'), description: 'Configuration Expo' },
];

const requiredPackages = [
  'expo',
  'expo-router',
  'expo-camera',
  'expo-image-manipulator',
  'firebase',
  'axios',
  'react-native-safe-area-context',
];

// Vérification des fichiers
console.log(chalk.blue.bold('=== Vérification des fichiers ==='));
let missingFiles = 0;

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file.path);
  if (exists) {
    console.log(chalk.green(`✓ ${file.description} (${path.basename(file.path)})`));
  } else {
    console.log(chalk.red(`✗ ${file.description} (${path.basename(file.path)})`));
    missingFiles++;
  }
});

// Vérification des dépendances
console.log(chalk.blue.bold('\n=== Vérification des dépendances ==='));
let missingPackages = 0;

try {
  const packageJson = require(path.join(paths.root, 'package.json'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  requiredPackages.forEach(pkg => {
    if (dependencies[pkg]) {
      console.log(chalk.green(`✓ ${pkg} (${dependencies[pkg]})`));
    } else {
      console.log(chalk.red(`✗ ${pkg} (manquant)`));
      missingPackages++;
    }
  });
} catch (error) {
  console.log(chalk.red('Erreur lors de la lecture de package.json'));
  missingPackages = requiredPackages.length;
}

// Vérification des configurations supplémentaires
console.log(chalk.blue.bold('\n=== Vérification des configurations ==='));

// Vérification de la configuration Firebase
let firebaseConfigOk = false;
try {
  const firebaseConfig = fs.readFileSync(path.join(paths.services, 'firebaseConfig.js'), 'utf8');
  if (firebaseConfig.includes('initializeApp') && firebaseConfig.includes('getAuth')) {
    console.log(chalk.green('✓ Configuration Firebase correcte'));
    firebaseConfigOk = true;
  } else {
    console.log(chalk.yellow('⚠ Configuration Firebase incomplète'));
  }
} catch (error) {
  console.log(chalk.red('✗ Impossible de lire la configuration Firebase'));
}

// Vérification des permissions dans app.json
let cameraPermissionsOk = false;
try {
  const appJson = require(path.join(paths.root, 'app.json'));
  if (
    appJson.expo && 
    appJson.expo.plugins && 
    appJson.expo.plugins.some(p => 
      (typeof p === 'string' && p === 'expo-camera') || 
      (p[0] === 'expo-camera')
    )
  ) {
    console.log(chalk.green('✓ Permissions caméra configurées'));
    cameraPermissionsOk = true;
  } else {
    console.log(chalk.yellow('⚠ Permissions caméra potentiellement manquantes dans app.json'));
  }
} catch (error) {
  console.log(chalk.red('✗ Impossible de vérifier les permissions dans app.json'));
}

// Résumé
console.log(chalk.blue.bold('\n=== Résumé de la vérification ==='));
if (missingFiles === 0 && missingPackages === 0 && firebaseConfigOk && cameraPermissionsOk) {
  console.log(chalk.green.bold('✅ Migration complète et correcte !'));
  console.log(chalk.green('Vous pouvez démarrer l\'application avec la commande :'));
  console.log(chalk.white.bgGreen.bold(' npx expo start '));
} else {
  console.log(chalk.yellow.bold('⚠ La migration nécessite quelques ajustements :'));
  
  if (missingFiles > 0) {
    console.log(chalk.yellow(`- ${missingFiles} fichiers manquants à créer`));
  }
  
  if (missingPackages > 0) {
    console.log(chalk.yellow(`- ${missingPackages} dépendances à installer`));
    console.log(chalk.yellow('  Exécutez : npm install'));
  }
  
  if (!firebaseConfigOk) {
    console.log(chalk.yellow('- Configuration Firebase à compléter'));
  }
  
  if (!cameraPermissionsOk) {
    console.log(chalk.yellow('- Vérifiez les permissions de caméra dans app.json'));
  }
}
