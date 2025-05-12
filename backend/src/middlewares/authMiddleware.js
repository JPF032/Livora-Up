/**
 * Middleware d'authentification pour sécuriser les routes API
 * Vérifie la validité des tokens Firebase JWT
 */
const admin = require('firebase-admin');
const prisma = require('../prismaClient');

// Initialisation de Firebase Admin SDK si pas déjà fait
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) return;

  try {
    // Vérifier si les variables d'environnement nécessaires sont présentes
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!projectId || !clientEmail || !privateKey) {
      console.warn('⚠️ Variables Firebase manquantes. Authentification en mode dégradé.');
      return false;
    }

    // Initialiser Firebase Admin SDK avec les credentials
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      })
    });
    
    console.log('✅ Firebase Admin SDK initialisé avec succès');
    firebaseInitialized = true;
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de Firebase Admin:', error);
    return false;
  }
};

/**
 * Middleware pour vérifier les tokens Firebase JWT
 * Ajoute req.user avec les informations de l'utilisateur authentifié
 */
const verifyFirebaseToken = async (req, res, next) => {
  // Initialisé Firebase Admin si nécessaire
  if (!firebaseInitialized && !initializeFirebase()) {
    // Mode dégradé: vérification superficielle pour le développement/test
    console.warn('⚠️ Mode d\'authentification dégradé actif');
    return handleDevAuthentication(req, res, next);
  }

  try {
    // Extraire le token du header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Accès non autorisé. Token manquant.'
      });
    }

    // Récupérer et vérifier le token
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Récupérer ou créer l'utilisateur dans la base de données
    const { uid: firebaseUid, email } = decodedToken;
    
    // Trouver l'utilisateur par son UID Firebase
    let user = await prisma.user.findUnique({
      where: { firebaseUid }
    });

    // Créer l'utilisateur s'il n'existe pas encore
    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid,
          email: email || `user_${firebaseUid.substring(0, 8)}@example.com`
        }
      });
      console.log(`👤 Nouvel utilisateur créé: ${user.id}`);
    }

    // Ajouter l'utilisateur à la requête
    req.user = {
      id: user.id,           // ID interne de la base de données
      firebaseUid,           // UID Firebase
      email: user.email      // Email (peut être différent de celui de Firebase)
    };

    next();
  } catch (error) {
    console.error('❌ Erreur d\'authentification:', error);
    return res.status(401).json({
      success: false,
      message: 'Accès non autorisé. Token invalide.'
    });
  }
};

/**
 * Middleware d'authentification simplifié pour le développement
 * À utiliser uniquement dans les environnements de test/développement
 */
const handleDevAuthentication = (req, res, next) => {
  // Vérifier si on est en environnement de développement
  if (process.env.NODE_ENV !== 'development') {
    return res.status(401).json({
      success: false,
      message: 'Configuration Firebase manquante en production.'
    });
  }

  // Permettre l'authentification simple par userId dans les query params uniquement en dev
  const userId = req.query.userId || req.body?.userProfile?.userId;
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Mode développement: userId manquant dans les paramètres.'
    });
  }

  // Définir l'utilisateur test pour la requête
  req.user = {
    firebaseUid: userId,
    // Ces valeurs sont fictives pour les tests
    id: userId,
    email: `test_${userId}@example.com`
  };

  console.warn(`⚠️ Authentification de développement utilisée pour userId: ${userId}`);
  next();
};

/**
 * Middleware pour protéger les routes qui nécessitent une authentification
 */
const requireAuth = async (req, res, next) => {
  // Simplement vérifier si req.user existe
  // Si verifyFirebaseToken a fait son travail, req.user devrait être défini
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise.'
    });
  }
  
  next();
};

/**
 * Middleware pour autoriser uniquement certains rôles 
 * (pour une future implémentation de rôles utilisateurs)
 */
const requireRole = (roles = []) => {
  return (req, res, next) => {
    // S'assurer que l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise.'
      });
    }

    // Exemple simple - pour développement futur avec système de rôles
    // const userRoles = req.user.roles || ['user'];
    // const hasPermission = roles.some(role => userRoles.includes(role));
    
    // Pour l'instant, on permet tout accès aux utilisateurs authentifiés
    const hasPermission = true;

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas les permissions nécessaires.'
      });
    }

    next();
  };
};

module.exports = {
  verifyFirebaseToken,
  requireAuth,
  requireRole,
  initializeFirebase
};
