const admin = require('firebase-admin');
require('dotenv').config();

// Vérifie si l'environnement est en mode test ou développement
const isTestOrDev = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';

// Configuration Firebase Admin à partir des variables d'environnement
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// Fonction pour initialiser Firebase Admin
const initializeFirebaseAdmin = () => {
  try {
    // Pour l'environnement de test, utiliser un mock Firebase Admin
    if (process.env.NODE_ENV === 'test') {
      console.log('Mode test: utilisation d\'un mock Firebase Admin');
      return getMockFirebaseAdmin();
    }

    // Vérifie si les variables d'environnement Firebase sont définies
    const configValid = firebaseConfig.projectId && firebaseConfig.privateKey && firebaseConfig.clientEmail;

    // Vérifie si Firebase Admin n'est pas déjà initialisé et si la configuration est valide
    if (!admin.apps.length && configValid) {
      admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig),
      });
      console.log('Firebase Admin SDK initialisé avec succès');
      return admin;
    } else if (admin.apps.length) {
      // Firebase Admin est déjà initialisé
      return admin;
    } else {
      // En développement, on peut continuer même si Firebase n'est pas configuré
      if (process.env.NODE_ENV === 'development') {
        console.warn('Mode développement: l\'application continuera sans Firebase Admin');
        return getMockFirebaseAdmin();
      } else {
        throw new Error('Configuration Firebase invalide');
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de Firebase Admin:', error);
    
    // En développement ou test, on continue avec un mock
    if (isTestOrDev) {
      console.warn(`Mode ${process.env.NODE_ENV}: l\'application continuera avec un mock Firebase Admin`);
      return getMockFirebaseAdmin();
    }
    
    throw error;
  }
};

// Créer un objet mock pour Firebase Admin en mode test/développement
function getMockFirebaseAdmin() {
  return {
    auth: () => ({
      verifyIdToken: (token) => {
        // Simule la vérification d'un token
        if (token === 'invalid-token') {
          return Promise.reject(new Error('Token invalide'));
        }
        return Promise.resolve({ 
          uid: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User'
        });
      }
    })
  };
}

module.exports = { 
  admin: initializeFirebaseAdmin(),
  initializeFirebaseAdmin
};
