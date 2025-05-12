/**
 * Middleware de protection CSRF pour sécuriser les requêtes d'API
 * Utilise un token double-soumission pour la validation
 */
const crypto = require('crypto');
const { logger } = require('../utils/logger');

// Durée de validité d'un token CSRF (en secondes)
const CSRF_TOKEN_EXPIRY = 60 * 60; // 1 heure

// Stockage en mémoire des tokens (en production, utiliser Redis)
const csrfTokens = new Map();

// Nettoyer périodiquement les tokens expirés
setInterval(() => {
  const now = Math.floor(Date.now() / 1000);
  for (const [token, data] of csrfTokens.entries()) {
    if (now > data.expiresAt) {
      csrfTokens.delete(token);
    }
  }
}, 15 * 60 * 1000); // Nettoyage toutes les 15 minutes

/**
 * Génère un token CSRF pour un utilisateur authentifié
 */
const generateCsrfToken = (req, res, next) => {
  // S'assurer que l'utilisateur est authentifié
  if (!req.user || !req.user.firebaseUid) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise pour générer un token CSRF'
    });
  }

  // Générer un token aléatoire
  const token = crypto.randomBytes(32).toString('hex');
  const now = Math.floor(Date.now() / 1000);
  
  // Enregistrer le token avec les informations de l'utilisateur et l'expiration
  csrfTokens.set(token, {
    userId: req.user.firebaseUid,
    createdAt: now,
    expiresAt: now + CSRF_TOKEN_EXPIRY
  });

  // Envoyer le token dans la réponse
  res.json({
    success: true,
    csrfToken: token,
    expiresAt: now + CSRF_TOKEN_EXPIRY
  });
};

/**
 * Vérifie la validité d'un token CSRF
 */
const verifyCsrfToken = (req, res, next) => {
  // Pour les requêtes GET, HEAD, OPTIONS, pas besoin de vérifier
  const safeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  if (safeMethod) {
    return next();
  }

  // Récupérer le token depuis l'en-tête ou le cookie
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  
  if (!token) {
    logger.warn('CSRF token manquant', { 
      ip: req.ip, 
      path: req.path, 
      method: req.method 
    });
    return res.status(403).json({
      success: false,
      message: 'CSRF token manquant'
    });
  }

  // Vérifier la validité du token
  const tokenData = csrfTokens.get(token);
  if (!tokenData) {
    logger.warn('CSRF token invalide ou expiré', { 
      ip: req.ip, 
      path: req.path, 
      token: token.substring(0, 8) + '...' // Ne pas journaliser le token entier
    });
    return res.status(403).json({
      success: false,
      message: 'CSRF token invalide ou expiré'
    });
  }

  // Vérifier que le token appartient bien à l'utilisateur authentifié
  if (req.user && req.user.firebaseUid && tokenData.userId !== req.user.firebaseUid) {
    logger.warn('CSRF token utilisé par un autre utilisateur', { 
      ip: req.ip, 
      expectedUserId: tokenData.userId,
      actualUserId: req.user.firebaseUid
    });
    return res.status(403).json({
      success: false,
      message: 'CSRF token non valide pour cet utilisateur'
    });
  }

  // Vérifier l'expiration
  const now = Math.floor(Date.now() / 1000);
  if (now > tokenData.expiresAt) {
    csrfTokens.delete(token);
    return res.status(403).json({
      success: false,
      message: 'CSRF token expiré'
    });
  }

  // Token valide, continuer
  next();
};

module.exports = {
  generateCsrfToken,
  verifyCsrfToken
};
