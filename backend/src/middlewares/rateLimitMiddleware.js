/**
 * Middleware de rate limiting pour protéger l'API contre les abus
 * Utilise une mémoire locale pour limiter les requêtes par IP/utilisateur
 */
const rateLimit = require('express-rate-limit');

// Configuration de base pour limiter les requêtes API générales
const createBasicLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,     // Fenêtre de temps en ms (défaut: 15 minutes)
    max,          // Nombre maximal de requêtes dans cette fenêtre
    standardHeaders: true,  // Renvoie les headers `RateLimit-*` aux standards IETF 
    legacyHeaders: false,   // Désactive les headers X-RateLimit-* obsolètes
    message: {
      success: false,
      message: 'Trop de requêtes, veuillez réessayer plus tard.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    // Fonction pour extraire l'identifiant de limitation (IP par défaut)
    keyGenerator: (req) => {
      // Si l'utilisateur est authentifié, utiliser son ID pour le tracking
      // Cela permet une limite "par utilisateur" plutôt que "par IP"
      if (req.user && req.user.firebaseUid) {
        return req.user.firebaseUid;
      }
      return req.ip; // Fallback sur l'IP
    },
    skip: (req) => {
      // Ne pas limiter les routes de santé ou status
      return req.path === '/api/v1/health';
    }
  });
};

// Limiteur plus strict pour les opérations sensibles ou intensives en ressources
const createStrictLimiter = () => {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 requêtes par minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Trop de requêtes pour cette opération sensible. Veuillez patienter.',
      retryAfter: 60
    },
    keyGenerator: (req) => {
      if (req.user && req.user.firebaseUid) {
        return `strict_${req.user.firebaseUid}`;
      }
      return `strict_${req.ip}`;
    }
  });
};

// Limiteur pour l'authentification pour prévenir le brute force
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // 10 requêtes par heure
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Trop de tentatives d\'authentification. Veuillez réessayer dans 1 heure.',
    retryAfter: 3600
  },
  // Basé uniquement sur l'IP pour les tentatives d'authentification
  keyGenerator: (req) => `auth_${req.ip}`
});

module.exports = {
  apiLimiter: createBasicLimiter(),                   // Limiteur général
  sportProgramLimiter: createStrictLimiter(),         // Limiteur pour génération de programmes (intensif)
  authLimiter                                         // Limiteur pour authentification
};
