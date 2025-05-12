/**
 * Script de démarrage personnalisé pour Livora UP Expo
 * 
 * Ce script fournit des options pour démarrer l'application en mode développement
 * avec différentes configurations.
 */

const { exec } = require('child_process');
const readline = require('readline');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

// Configuration des options
const options = [
  { id: 1, name: 'Démarrer sur Android', command: 'npx expo start --android' },
  { id: 2, name: 'Démarrer sur iOS', command: 'npx expo start --ios' },
  { id: 3, name: 'Démarrer sur le web', command: 'npx expo start --web' },
  { id: 4, name: 'Démarrer en mode tunnel', command: 'npx expo start --tunnel' },
  { id: 5, name: 'Vérifier la migration', command: 'node ./scripts/verify-migration.js' },
  { id: 6, name: 'Installer les dépendances', command: 'npm install' },
  { id: 7, name: 'Nettoyer le cache', command: 'npx expo start --clear' },
  { id: 8, name: 'Quitter', command: null },
];

// Interface de ligne de commande
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fonction pour afficher le menu
function displayMenu() {
  console.log(chalk.blue.bold('\n=== Livora UP Expo - Menu de développement ===\n'));
  
  options.forEach(option => {
    console.log(`${chalk.green(option.id)}. ${option.name}`);
  });
  
  console.log('');
  rl.question(chalk.yellow('Choisissez une option (1-8): '), handleOption);
}

// Fonction pour exécuter une commande
function executeCommand(command) {
  console.log(chalk.blue(`\nExécution de: ${command}\n`));
  
  const child = exec(command, { cwd: path.resolve(__dirname, '..') });
  
  child.stdout.on('data', data => {
    process.stdout.write(data);
  });
  
  child.stderr.on('data', data => {
    process.stderr.write(data);
  });
  
  child.on('exit', code => {
    if (code === 0) {
      console.log(chalk.green('\nCommande terminée avec succès!\n'));
    } else {
      console.log(chalk.red(`\nLa commande s'est terminée avec le code d'erreur: ${code}\n`));
    }
    
    // Retour au menu principal après l'exécution
    rl.question(chalk.yellow('Appuyez sur Entrée pour revenir au menu...'), () => {
      displayMenu();
    });
  });
  
  // Gestion de l'interruption (Ctrl+C)
  process.on('SIGINT', () => {
    child.kill();
    console.log(chalk.yellow('\nCommande interrompue.\n'));
    
    rl.question(chalk.yellow('Appuyez sur Entrée pour revenir au menu...'), () => {
      displayMenu();
    });
  });
}

// Fonction pour gérer le choix de l'utilisateur
function handleOption(answer) {
  const option = options.find(opt => opt.id === parseInt(answer));
  
  if (option) {
    if (option.id === 8) {
      // Option pour quitter
      console.log(chalk.green('Au revoir!'));
      rl.close();
      process.exit(0);
    } else if (option.command) {
      // Exécuter la commande sélectionnée
      executeCommand(option.command);
    }
  } else {
    console.log(chalk.red('Option invalide!'));
    displayMenu();
  }
}

// Vérifier si le projet est correctement configuré
function checkProjectSetup() {
  const packageJsonPath = path.resolve(__dirname, '../package.json');
  
  try {
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = require(packageJsonPath);
      
      // Vérifier les dépendances clés
      const hasDependencies = packageJson.dependencies && 
        packageJson.dependencies.expo && 
        packageJson.dependencies.firebase;
      
      if (hasDependencies) {
        console.log(chalk.green('✓ Configuration du projet validée'));
        return true;
      }
    }
    
    console.log(chalk.red('✗ Configuration du projet incomplète'));
    return false;
  } catch (error) {
    console.log(chalk.red('Erreur lors de la vérification du projet:'), error.message);
    return false;
  }
}

// Point d'entrée principal
function main() {
  console.log(chalk.blue.bold('=== Livora UP Expo - Outil de développement ==='));
  
  if (checkProjectSetup()) {
    displayMenu();
  } else {
    console.log(chalk.yellow('\nDes problèmes ont été détectés dans la configuration du projet.'));
    
    rl.question(chalk.yellow('Souhaitez-vous installer les dépendances? (o/n): '), answer => {
      if (answer.toLowerCase() === 'o') {
        executeCommand('npm install');
      } else {
        displayMenu();
      }
    });
  }
}

// Démarrer le script
main();
