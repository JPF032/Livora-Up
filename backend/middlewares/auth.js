const { admin } = require('../config/firebase');
const jwt = require('jsonwebtoken');

// Vérifie si l'environnement est en mode test
const isTestEnvironment = process.env.NODE_ENV === 'test';

// Clé pour vérifier les tokens générés pour les tests
const JWT_SECRET = process.env.JWT_SECRET || 'livora-up-secret-key-for-tests';

/**
 * Middleware pour authentifier les utilisateurs via Firebase
 * Vérifie le token JWT Firebase dans l'en-tête Authorization
 */
const authenticateFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Accès non autorisé: Token manquant ou format invalide' 
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Mode développement: permet de passer outre l'authentification si un token spécial est utilisé
    if (process.env.NODE_ENV === 'development' && idToken === 'dev-mock-token-for-testing') {
      req.user = { uid: 'dev-user-uid', email: 'dev@example.com' };
      return next();
    }
    
    // Pour les tests, utiliser la vérification JWT locale
    if (isTestEnvironment) {
      try {
        const decodedToken = jwt.verify(idToken, JWT_SECRET);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email || '',
          name: decodedToken.name || ''
        };
        return next();
      } catch (jwtError) {
        console.error('Erreur lors de la vérification du token de test:', jwtError.message);
        return res.status(401).json({ 
          success: false, 
          message: 'Token de test invalide' 
        });
      }
    }
    
    // Vérification du token avec Firebase Admin pour l'environnement de production/développement
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Attacher les informations de l'utilisateur à la requête pour une utilisation ultérieure
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      emailVerified: decodedToken.email_verified || false,
      name: decodedToken.name || '',
      picture: decodedToken.picture || ''
    };
    
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error.message);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expiré. Veuillez vous reconnecter.' 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Authentification échouée: Token invalide' 
    });
  }
};

module.exports = { authenticateFirebaseToken };
