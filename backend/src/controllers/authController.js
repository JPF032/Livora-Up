/**
 * Contrôleur d'authentification pour la gestion des utilisateurs
 * Gère l'inscription, la connexion et la vérification des utilisateurs
 */
const { logger, logError } = require('../utils/logger');
const authService = require('../services/authService');

/**
 * Vérifie un utilisateur par son Firebase UID et crée/récupère un utilisateur dans la base de données
 * @param {string} firebaseUid - L'ID Firebase de l'utilisateur
 * @returns {Promise<Object>} - L'utilisateur trouvé ou créé
 */
const verifyOrCreateUser = async (firebaseUid) => {
  try {
    // Utiliser le service d'authentification pour trouver ou créer l'utilisateur
    return await authService.findOrCreateUser(firebaseUid);
  } catch (error) {
    logError(error, null, { operation: 'verifyOrCreateUser', firebaseUid });
    throw error;
  }
};

/**
 * Route d'authentification qui crée/met à jour un utilisateur dans notre base de données
 * Utilisée lorsqu'un utilisateur se connecte via le frontend
 */
const authenticateUser = async (req, res) => {
  try {
    // L'ID Firebase de l'utilisateur est déjà vérifié par middleware
    const { firebaseUid } = req.user;
    
    // Vérifier/créer l'utilisateur dans notre base de données
    const user = await authService.findOrCreateUser(firebaseUid);
    
    // Envoyer les informations utilisateur au client
    res.status(200).json({
      success: true,
      message: 'Authentification réussie',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        role: user.role,
        profile: user.userProfile ? {
          currentLevel: user.userProfile.currentLevel,
          objective: user.userProfile.objective,
          // Autres informations du profil
        } : null
      }
    });
  } catch (error) {
    logError(error, req, { operation: 'authenticateUser' });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'authentification',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

/**
 * Met à jour le profil d'un utilisateur
 */
const updateUserProfile = async (req, res) => {
  try {
    const { firebaseUid } = req.user;
    const profileData = req.body;
    
    // Utiliser le service pour mettre à jour le profil
    const updatedProfile = await authService.updateUserProfile(firebaseUid, profileData);
    
    res.status(200).json({
      success: true,
      message: 'Profil utilisateur mis à jour',
      profile: updatedProfile
    });
  } catch (error) {
    logError(error, req, { operation: 'updateUserProfile' });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

/**
 * Récupère les informations utilisateur et son profil
 */
const getUserProfile = async (req, res) => {
  try {
    const { firebaseUid } = req.user;
    
    // Utiliser le service pour trouver l'utilisateur
    const user = await authService.findOrCreateUser(firebaseUid);
    
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        role: user.role,
        createdAt: user.createdAt,
        profile: user.userProfile || null
      }
    });
  } catch (error) {
    logError(error, req, { operation: 'getUserProfile' });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

/**
 * Attribue un rôle à un utilisateur (administrateur uniquement)
 */
const assignUserRole = async (req, res) => {
  try {
    // Vérifier que l'utilisateur actuel est administrateur
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé. Rôle administrateur requis.'
      });
    }

    const { userId, role } = req.body;
    
    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur et rôle requis'
      });
    }
    
    // Attribuer le rôle via le service
    const updatedUser = await authService.assignRole(userId, role);
    
    res.status(200).json({
      success: true,
      message: `Rôle ${role} attribué avec succès`,
      user: updatedUser
    });
  } catch (error) {
    logError(error, req, { operation: 'assignUserRole' });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'attribution du rôle',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

// Expose le module
module.exports = {
  authenticateUser,
  updateUserProfile,
  getUserProfile,
  verifyOrCreateUser,
  assignUserRole
};
