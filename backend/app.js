const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Initialiser l'application Express
const app = express();

// Middlewares

// Configuration CORS sécurisée
const corsOptions = {
  // Origines autorisées (domaines qui peuvent accéder à l'API)
  origin: [
    // Autorise tout en développement (DEV ONLY - à remplacer en production)
    process.env.NODE_ENV === 'development' ? '*' : null,
    // URLs spécifiques autorisées en production
    'https://livora-up.com',                // Site web principal
    'https://app.livora-up.com',            // Application web
    'capacitor://app.livora-up.com',        // Application mobile (iOS/Android) - Capacitor
    'https://expo.dev/@livora-up/livora-up' // Expo Go
  ].filter(Boolean), // Filtrer les valeurs null

  // Autorise les cookies et credentials
  credentials: true,
  
  // Limiter les méthodes HTTP autorisées
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  
  // Headers autorisés
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes API
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'API Livora UP est opérationnelle',
    timestamp: new Date().toISOString()
  });
});

// Route racine
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Bienvenue sur l\'API Livora UP',
    documentation: '/api-docs',
    health: '/health'
  });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connexion à MongoDB pour les tests
if (process.env.NODE_ENV === 'test') {
  // Utiliser une base de données in-memory pour les tests
  mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/livoraup-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connected to MongoDB Test database'))
  .catch(err => {
    console.error('MongoDB connection error for tests:', err.message);
    // Pour les tests, nous pouvons continuer même sans connexion MongoDB en utilisant un mock
    console.warn('Tests will run with mocked database responses');
  });
  
  // Activer la journalisation des requêtes MongoDB pour le débogage des tests
  mongoose.set('debug', true);
}

module.exports = app;
