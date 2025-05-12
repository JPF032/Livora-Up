/**
 * Définition des routes API pour le backend Livora UP
 * Centralise toutes les routes REST API de l'application
 */
const express = require('express');
const router = express.Router();
const { 
  generateAndSaveProgram, 
  getCurrentProgram,
  listUserPrograms 
} = require('../controllers/sportProgramController');

// Import du contrôleur d'authentification
const {
  authenticateUser,
  updateUserProfile,
  getUserProfile,
  assignUserRole
} = require('../controllers/authController');

// Import des middlewares d'authentification
const { 
  verifyFirebaseToken, 
  requireAuth,
  requireRole 
} = require('../middlewares/authMiddleware');

// Import des middlewares de limitation de débit (rate limiting)
const {
  sportProgramLimiter,
  authLimiter
} = require('../middlewares/rateLimitMiddleware');

// Import des middlewares de validation
const { validateRequest, schemas } = require('../utils/validationSchemas');

// Import du middleware de protection CSRF
const { generateCsrfToken, verifyCsrfToken } = require('../middlewares/csrfProtection');

// Routes publiques (sans authentification)

// Routes d'authentification
// Note: L'enregistrement et la connexion sont gérés par Firebase sur le frontend
// Ces endpoints permettent la synchronisation des données utilisateur après authentification

// Endpoint pour vérifier/synchroniser l'utilisateur après connexion Firebase
router.post('/auth/verify', 
  authLimiter, 
  verifyFirebaseToken, 
  requireAuth, 
  authenticateUser
);

// Route de vérification d'API et santé du serveur
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'API Livora UP opérationnelle', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      auth: true,
      sportPrograms: true,
      clarifaiIntegration: true,
      postgresql: true
    }
  });
});

// Routes protégées par authentification
// Utilisation des middlewares d'authentification dans l'ordre:
// 1. verifyFirebaseToken - Vérifie le token JWT et charge l'utilisateur
// 2. requireAuth - S'assure que l'utilisateur est authentifié

// Routes pour les programmes sportifs
router.post('/sport-programs/generate-ai', 
  verifyFirebaseToken, 
  requireAuth, 
  verifyCsrfToken,     // Protection CSRF requise pour opérations POST
  sportProgramLimiter,  // Rate limiting pour opérations coûteuses
  validateRequest(schemas.sportProgramRequest), // Validation des données d'entrée
  generateAndSaveProgram
);

router.get('/sport-programs/current', 
  verifyFirebaseToken, 
  requireAuth, 
  getCurrentProgram
);

router.get('/sport-programs/list', 
  verifyFirebaseToken, 
  requireAuth, 
  validateRequest(schemas.listProgramsQuery, 'query'),  // Validation des paramètres de requête
  listUserPrograms
);

// Routes pour le profil utilisateur
router.get('/user/profile', 
  verifyFirebaseToken, 
  requireAuth, 
  getUserProfile
);

router.put('/user/profile', 
  verifyFirebaseToken, 
  requireAuth, 
  verifyCsrfToken,
  validateRequest(schemas.userProfile),
  updateUserProfile
);

// Routes de test d'authentification
router.get('/auth/test', verifyFirebaseToken, requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentification réussie',
    user: req.user
  });
});

// Route pour générer un token CSRF (pour protéger les formulaires/API)
router.get('/auth/csrf-token', verifyFirebaseToken, requireAuth, generateCsrfToken);

// Routes administrateur
// Statistiques d'administration
router.get('/admin/stats', 
  verifyFirebaseToken, 
  requireAuth, 
  requireRole(['admin']), 
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Accès administrateur autorisé',
      // Statistiques, etc.
    });
  }
);

// Gestion des rôles utilisateurs (admin uniquement)
router.post('/admin/users/assign-role',
  verifyFirebaseToken,
  requireAuth,
  requireRole(['admin']),
  verifyCsrfToken,
  validateRequest(schemas.assignRole),
  assignUserRole
);

module.exports = router;
