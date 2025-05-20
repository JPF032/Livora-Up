/**
 * Application principale Express pour le backend Livora UP
 * Point d'entrée central qui configure et démarre le serveur
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const apiRoutes = require('./routes/api');
const nutritionProgramRoutes = require('./routes/nutritionProgramRoutes');
const nutritionAnalysisRoutes = require('./routes/nutritionAnalysisRoutes');
const { initializeFirebaseAdmin } = require('./config/firebase');
const { apiLimiter } = require('./middlewares/rateLimitMiddleware');
const { logger, logHttpRequest, logError } = require('./utils/logger');

// Chargement des variables d'environnement
require('dotenv').config();

// Instance Express
const app = express();

// Configuration du port
const PORT = process.env.PORT || 3000;

// Middlewares essentiels
app.use(helmet()); // Sécurité HTTP
app.use(cors()); // Support des requêtes cross-origin
app.use(express.json()); // Parser JSON pour les requêtes
app.use(express.urlencoded({ extended: true })); // Support des formulaires

// Journalisation des requêtes HTTP
app.use(logHttpRequest); // Logger personnalisé pour toutes les requêtes

// Morgan pour une journalisation supplémentaire en développement
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev')); // Format concis pour le développement
} else {
  // En production, utiliser un format plus détaillé
  app.use(morgan('combined', {
    // Envoyer les logs à Winston au lieu de la console par défaut
    stream: { 
      write: (message) => logger.http(message.trim()) 
    }
  }));
}

// Vérification des variables d'environnement critiques
const requiredEnvVars = [
  'DATABASE_URL',
  'CLARIFAI_PAT',
  'CLARIFAI_LLM_MODEL_ID',
  'CLARIFAI_USER_ID',
  'CLARIFAI_APP_ID',
  // Variables Firebase Admin (optionnelles en développement)
  ...(process.env.NODE_ENV === 'production' ? [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
  ] : [])
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.warn('⚠️ Variables d\'environnement manquantes:', missingEnvVars.join(', '));
  console.warn('Certaines fonctionnalités pourraient ne pas fonctionner correctement.');
}

// Initialiser Firebase Admin SDK
if (initializeFirebaseAdmin()) {
  console.log('✅ Firebase Admin SDK initialisé avec succès');
} else {
  console.warn('⚠️ Firebase Admin SDK non initialisé - Mode authentification dégradé');
  if (process.env.NODE_ENV === 'production') {
    console.error('⛔ AVERTISSEMENT: L\'application s\'exécute en production sans Firebase Admin SDK initialisé!');
  }
}

// Appliquer le rate limiter global à toutes les routes API
// Cela aide à prévenir les attaques par déni de service (DoS)
app.use('/api/v1', apiLimiter);

// Routes API
app.use('/api/v1', apiRoutes);
app.use('/api/v1/nutrition-programs', nutritionProgramRoutes);
app.use('/api/v1/nutrition-analysis', nutritionAnalysisRoutes);

// Route racine
app.get('/', (req, res) => {
  res.json({
    name: 'Livora UP API',
    status: 'running',
    version: '1.0.0',
    endpoints: '/api/v1'
  });
});

// Middleware de gestion des erreurs globales
app.use((err, req, res, next) => {
  // Journaliser l'erreur avec tous les détails pertinents
  logError(err, req, { 
    statusCode: err.status || 500,
    name: err.name, 
    // Ajouter toute information contextuelle pertinente
    route: req.originalUrl || req.url,
    query: req.query,
    // Pour le débogage, inclure le corps de la requête en développement
    requestBody: process.env.NODE_ENV !== 'production' ? req.body : undefined
  });
  
  // Gérer différents types d'erreurs
  let statusCode = err.status || 500;
  let errorMessage;
  
  // En production, masquer les détails techniques 
  if (process.env.NODE_ENV === 'production') {
    errorMessage = statusCode >= 500 
      ? 'Une erreur interne est survenue' 
      : err.message || 'Erreur de requête';
  } else {
    // En développement, fournir plus de détails pour le débogage
    errorMessage = err.message || 'Erreur inconnue';
  }
  
  // Renvoyer une réponse d'erreur structurée
  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    // Inclure plus de détails en mode développement
    ...(process.env.NODE_ENV !== 'production' && {
      error: {
        name: err.name,
        stack: err.stack,
        code: err.code
      }
    })
  });
});

// Démarrage du serveur
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📞 API accessible à http://localhost:${PORT}/api/v1`);
  
  // Afficher l'adresse IP locale pour faciliter les tests avec Expo Go
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  
  // Trouver les adresses IP non-internes
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Ignorer les interfaces non IPv4 et les adresses internes
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`🔌 Adresse IP locale: http://${net.address}:${PORT}/api/v1`);
      }
    }
  }
  
  console.log(`🧪 Mode: ${process.env.NODE_ENV || 'development'}`);
});

// Gestion des terminaisons propres
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu, fermeture gracieuse du serveur...');
  server.close(() => {
    console.log('Serveur fermé');
    process.exit(0);
  });
});

module.exports = app;
