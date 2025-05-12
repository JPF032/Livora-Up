/**
 * Service d'authentification pour gérer les interactions avec Firebase
 * Centralise toute la logique de gestion des utilisateurs
 */
const admin = require('firebase-admin');
const { PrismaClient } = require('@prisma/client');
const { logger, logError } = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * Vérifie la validité d'un token JWT Firebase
 * @param {string} token - Token JWT à vérifier
 * @returns {Promise<Object>} Payload du token décodé
 */
const verifyToken = async (token) => {
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    logger.warn(`Échec de vérification de token: ${error.message}`);
    throw new Error('Token d\'authentification invalide');
  }
};

/**
 * Retrouve un utilisateur Firebase par son UID
 * @param {string} uid - UID Firebase de l'utilisateur
 * @returns {Promise<Object>} Informations de l'utilisateur Firebase
 */
const getFirebaseUser = async (uid) => {
  try {
    return await admin.auth().getUser(uid);
  } catch (error) {
    logger.warn(`Utilisateur Firebase non trouvé: ${uid}`);
    throw new Error('Utilisateur non trouvé');
  }
};

/**
 * Retrouve ou crée un utilisateur dans la base de données à partir de son UID Firebase
 * @param {string} firebaseUid - UID Firebase de l'utilisateur
 * @returns {Promise<Object>} Utilisateur trouvé ou créé dans la base de données
 */
const findOrCreateUser = async (firebaseUid) => {
  try {
    // Vérifier si l'utilisateur existe déjà
    let user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: { userProfile: true }
    });
    
    // Si l'utilisateur n'existe pas encore, le créer
    if (!user) {
      // Récupérer les informations depuis Firebase
      const firebaseUser = await getFirebaseUser(firebaseUid);
      
      // Créer l'utilisateur dans la base de données
      user = await prisma.user.create({
        data: {
          firebaseUid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          emailVerified: firebaseUser.emailVerified || false,
          photoURL: firebaseUser.photoURL || '',
          role: 'user', // Rôle par défaut
          
          // Créer un profil utilisateur vide par défaut
          userProfile: {
            create: {
              currentLevel: 'Débutant'
            }
          }
        },
        include: { userProfile: true }
      });
      
      logger.info(`Nouvel utilisateur créé dans la base de données: ${firebaseUid}`);
    }
    
    return user;
  } catch (error) {
    logError(error, null, { function: 'findOrCreateUser', firebaseUid });
    throw error;
  }
};

/**
 * Met à jour les informations d'un utilisateur dans la base de données
 * @param {string} firebaseUid - UID Firebase de l'utilisateur
 * @param {Object} userData - Données à mettre à jour
 * @returns {Promise<Object>} Utilisateur mis à jour
 */
const updateUser = async (firebaseUid, userData) => {
  try {
    const user = await prisma.user.update({
      where: { firebaseUid },
      data: userData,
      include: { userProfile: true }
    });
    
    logger.info(`Utilisateur mis à jour: ${firebaseUid}`);
    return user;
  } catch (error) {
    logError(error, null, { function: 'updateUser', firebaseUid });
    throw error;
  }
};

/**
 * Met à jour le profil d'un utilisateur
 * @param {string} firebaseUid - UID Firebase de l'utilisateur
 * @param {Object} profileData - Données du profil à mettre à jour
 * @returns {Promise<Object>} Profil utilisateur mis à jour
 */
const updateUserProfile = async (firebaseUid, profileData) => {
  try {
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      select: { id: true }
    });
    
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    
    // Mettre à jour ou créer le profil
    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: {
        ...profileData,
        userId: user.id
      }
    });
    
    logger.info(`Profil utilisateur mis à jour: ${firebaseUid}`);
    return profile;
  } catch (error) {
    logError(error, null, { function: 'updateUserProfile', firebaseUid });
    throw error;
  }
};

/**
 * Attribuer un rôle à un utilisateur (admin, user, etc.)
 * @param {string} firebaseUid - UID Firebase de l'utilisateur
 * @param {string} role - Rôle à attribuer
 * @returns {Promise<Object>} Utilisateur mis à jour
 */
const assignRole = async (firebaseUid, role) => {
  try {
    // Vérifier si le rôle est valide
    const validRoles = ['user', 'admin', 'coach'];
    if (!validRoles.includes(role)) {
      throw new Error(`Rôle invalide: ${role}`);
    }
    
    // Mettre à jour le rôle de l'utilisateur
    const user = await prisma.user.update({
      where: { firebaseUid },
      data: { role },
      select: { id: true, email: true, role: true }
    });
    
    logger.info(`Rôle ${role} attribué à l'utilisateur ${firebaseUid}`);
    return user;
  } catch (error) {
    logError(error, null, { function: 'assignRole', firebaseUid, role });
    throw error;
  }
};

module.exports = {
  verifyToken,
  getFirebaseUser,
  findOrCreateUser,
  updateUser,
  updateUserProfile,
  assignRole
};
