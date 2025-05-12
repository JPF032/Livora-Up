/**
 * Service de gestion des programmes sportifs dans la base de données
 * Centralise toutes les opérations liées aux programmes sportifs dans PostgreSQL
 */
const prisma = require('../prismaClient');

/**
 * Sauvegarde un nouveau programme sportif généré par l'IA
 * Désactive les programmes actifs existants pour l'utilisateur
 * 
 * @param {string} userId - ID de l'utilisateur Firebase
 * @param {Object} programDataJson - Données du programme au format JSON
 * @returns {Promise<Object>} - Le programme sportif sauvegardé
 */
const saveSportProgram = async (userId, programDataJson) => {
  try {
    // Récupérer ou créer l'utilisateur en base
    let user = await prisma.user.findUnique({ 
      where: { firebaseUid: userId }
    });

    // Si l'utilisateur n'existe pas, le créer
    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid: userId,
          email: `user_${userId.substring(0, 8)}@example.com` // Email temporaire
        }
      });
      console.log(`Nouvel utilisateur créé avec l'ID interne: ${user.id}`);
    }

    // Désactiver tous les programmes actifs existants pour cet utilisateur
    await prisma.sportProgram.updateMany({
      where: { 
        userId: user.id, 
        isActive: true 
      },
      data: { 
        isActive: false 
      }
    });

    // Sauvegarder le nouveau programme sportif
    const newProgram = await prisma.sportProgram.create({
      data: {
        userId: user.id,
        name: programDataJson.name || "Programme LivoraUp personnalisé",
        introduction: programDataJson.introduction || "",
        aiGeneratedProgramJson: programDataJson,
        isActive: true,
        version: 1
      }
    });

    console.log(`Programme sportif créé avec succès: ${newProgram.id}`);
    return newProgram;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du programme sportif:', error);
    throw new Error(`Erreur de base de données: ${error.message}`);
  }
};

/**
 * Récupère le programme sportif actif d'un utilisateur
 * 
 * @param {string} firebaseUid - ID Firebase de l'utilisateur
 * @returns {Promise<Object|null>} - Le programme sportif actif ou null
 */
const getActiveSportProgramForUser = async (firebaseUid) => {
  try {
    // Trouver l'utilisateur par son ID Firebase
    const user = await prisma.user.findUnique({
      where: { firebaseUid }
    });

    if (!user) {
      console.log(`Aucun utilisateur trouvé avec l'ID Firebase: ${firebaseUid}`);
      return null;
    }

    // Récupérer le programme actif le plus récent
    const activeProgram = await prisma.sportProgram.findFirst({
      where: {
        userId: user.id,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc' // Le plus récent en premier
      }
    });

    if (!activeProgram) {
      console.log(`Aucun programme actif trouvé pour l'utilisateur: ${firebaseUid}`);
      return null;
    }

    return activeProgram;
  } catch (error) {
    console.error('Erreur lors de la récupération du programme sportif:', error);
    throw new Error(`Erreur de base de données: ${error.message}`);
  }
};

/**
 * Liste tous les programmes sportifs d'un utilisateur
 * 
 * @param {string} firebaseUid - ID Firebase de l'utilisateur
 * @param {Object} options - Options de pagination et filtrage
 * @returns {Promise<Array>} - Liste des programmes sportifs
 */
const getUserSportPrograms = async (firebaseUid, options = {}) => {
  const { 
    onlyActive = false, 
    limit = 10, 
    offset = 0 
  } = options;

  try {
    // Trouver l'utilisateur par son ID Firebase
    const user = await prisma.user.findUnique({
      where: { firebaseUid }
    });

    if (!user) {
      return [];
    }

    // Construire les filtres
    const where = { userId: user.id };
    if (onlyActive) {
      where.isActive = true;
    }

    // Récupérer les programmes avec pagination
    const programs = await prisma.sportProgram.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return programs;
  } catch (error) {
    console.error('Erreur lors de la récupération des programmes:', error);
    throw new Error(`Erreur de base de données: ${error.message}`);
  }
};

module.exports = {
  saveSportProgram,
  getActiveSportProgramForUser,
  getUserSportPrograms
};
