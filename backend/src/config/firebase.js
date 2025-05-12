/**
 * Configuration Firebase Admin pour le backend Livora UP
 * Centralise l'initialisation et la gestion de Firebase
 */
const admin = require('firebase-admin');

// État d'initialisation
let firebaseAdminInitialized = false;

/**
 * Initialise Firebase Admin SDK avec les informations de service
 * @returns {boolean} Succès de l'initialisation
 */
const initializeFirebaseAdmin = () => {
  // Ne pas réinitialiser si déjà fait
  if (firebaseAdminInitialized) {
    return true;
  }

  try {
    // Récupérer les variables d'environnement
    const {
      FIREBASE_PROJECT_ID: projectId,
      FIREBASE_PRIVATE_KEY: privateKey,
      FIREBASE_CLIENT_EMAIL: clientEmail
    } = process.env;

    // Vérifier que les variables nécessaires sont présentes
    if (!projectId || !privateKey || !clientEmail) {
      console.warn('⚠️ Variables d\'environnement Firebase manquantes pour l\'initialisation Admin SDK.');
      return false;
    }

    // Formater la clé privée correctement
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

    // Initialiser l'app Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey: formattedPrivateKey,
        clientEmail
      })
    });

    console.log('✅ Firebase Admin SDK initialisé avec succès');
    firebaseAdminInitialized = true;
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de Firebase Admin:', error.message);
    return false;
  }
};

/**
 * Vérifie si un token Firebase est valide
 * @param {string} token - Token Firebase à vérifier
 * @returns {Promise<object|null>} - Informations décodées du token ou null
 */
const verifyFirebaseToken = async (token) => {
  if (!firebaseAdminInitialized && !initializeFirebaseAdmin()) {
    console.error('Firebase Admin SDK non initialisé. Vérification du token impossible.');
    return null;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Erreur de vérification du token Firebase:', error.message);
    return null;
  }
};

/**
 * Récupère un utilisateur Firebase par son UID
 * @param {string} uid - UID Firebase de l'utilisateur
 * @returns {Promise<object|null>} - Informations utilisateur ou null
 */
const getUserByUid = async (uid) => {
  if (!firebaseAdminInitialized && !initializeFirebaseAdmin()) {
    console.error('Firebase Admin SDK non initialisé. Récupération utilisateur impossible.');
    return null;
  }

  try {
    const userRecord = await admin.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    console.error(`Utilisateur Firebase avec UID ${uid} non trouvé:`, error.message);
    return null;
  }
};

module.exports = {
  initializeFirebaseAdmin,
  verifyFirebaseToken,
  getUserByUid,
  firebaseAdmin: admin
};
