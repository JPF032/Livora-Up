const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Clé secrète pour JWT (uniquement pour les tests)
const JWT_SECRET = process.env.JWT_SECRET || 'livora-up-secret-key-for-tests';

/**
 * Génère un token JWT pour les tests
 * @param {Object} user - Utilisateur pour lequel générer le token
 * @returns {String} Token JWT
 */
exports.generateToken = (user) => {
  return jwt.sign(
    { 
      uid: user.firebaseUid,
      email: user.email,
      name: user.displayName
    }, 
    JWT_SECRET, 
    { expiresIn: '1h' }
  );
};

/**
 * Vérifie un token Firebase et extrait les informations utilisateur
 * @param {String} token - Token Firebase à vérifier
 * @returns {Promise<Object>} Informations de l'utilisateur
 */
exports.verifyFirebaseToken = async (token) => {
  try {
    // Pour l'environnement de test, nous simulons la vérification
    if (process.env.NODE_ENV === 'test') {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    }
    
    // Vérification réelle du token Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Token invalide ou expiré');
  }
};
