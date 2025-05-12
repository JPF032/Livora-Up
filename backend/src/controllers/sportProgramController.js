/**
 * Contrôleur pour la gestion des programmes sportifs
 * Gère les requêtes HTTP relatives aux programmes sportifs
 */
const { generateSportProgramWithClarifai } = require('../services/clarifaiService');
const { 
  saveSportProgram, 
  getActiveSportProgramForUser,
  getUserSportPrograms 
} = require('../services/sportProgramDBService');

/**
 * Génère un programme sportif via Clarifai et le sauvegarde dans la base de données
 * 
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const generateAndSaveProgram = async (req, res) => {
  try {
    // Récupérer l'utilisateur authentifié depuis le middleware d'authentification
    const authenticatedUser = req.user;
    if (!authenticatedUser || !authenticatedUser.firebaseUid) {
      return res.status(401).json({ 
        success: false, 
        message: "Utilisateur non authentifié" 
      });
    }

    // Récupérer le profil utilisateur depuis le corps de la requête
    const { userProfile } = req.body;
    
    // Validation des données requises
    if (!userProfile) {
      return res.status(400).json({ 
        success: false, 
        message: "Données de profil utilisateur manquantes." 
      });
    }

    // Fusionner le profile reçu avec l'ID utilisateur authentifié
    // pour garantir que l'utilisateur ne peut générer que pour lui-même
    const enrichedUserProfile = {
      ...userProfile,
      userId: authenticatedUser.firebaseUid // Remplacer par l'ID authentifié
    };

    // Informer le client que le processus a commencé
    console.log(`Génération d'un programme sportif pour l'utilisateur authentifié: ${authenticatedUser.firebaseUid}`);
    
    // Générer le programme sportif via Clarifai
    const programJsonFromAI = await generateSportProgramWithClarifai(enrichedUserProfile);
    
    // Sauvegarder le programme dans la base de données
    const savedProgram = await saveSportProgram(authenticatedUser.firebaseUid, programJsonFromAI);
    
    // Renvoyer le JSON du programme généré
    res.status(201).json({
      success: true,
      data: savedProgram.aiGeneratedProgramJson,
      programId: savedProgram.id,
      message: "Programme sportif personnalisé généré avec succès"
    });
  } catch (error) {
    console.error("Erreur dans le contrôleur generateAndSaveProgram:", error);
    
    // Distinguer les types d'erreurs pour des messages appropriés
    if (error.message.includes('Clarifai')) {
      return res.status(503).json({ 
        success: false, 
        message: error.message || "Erreur de service IA externe."
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || "Erreur serveur lors de la génération du programme." 
    });
  }
};

/**
 * Récupère le programme sportif actif de l'utilisateur authentifié
 * 
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const getCurrentProgram = async (req, res) => {
  try {
    // Récupérer l'utilisateur authentifié depuis le middleware d'authentification
    const authenticatedUser = req.user;
    if (!authenticatedUser || !authenticatedUser.firebaseUid) {
      return res.status(401).json({ 
        success: false, 
        message: "Utilisateur non authentifié" 
      });
    }
    
    // Utiliser l'ID Firebase de l'utilisateur authentifié
    const firebaseUid = authenticatedUser.firebaseUid;
    console.log(`Récupération du programme actif pour l'utilisateur authentifié: ${firebaseUid}`);
    
    // Récupérer le programme actif
    const program = await getActiveSportProgramForUser(firebaseUid);
    
    if (!program) {
      return res.status(404).json({ 
        success: false, 
        message: "Aucun programme actif trouvé pour votre compte. Générez un nouveau programme." 
      });
    }
    
    res.status(200).json({
      success: true,
      data: program.aiGeneratedProgramJson,
      metadata: {
        programId: program.id,
        createdAt: program.createdAt,
        version: program.version
      }
    });
  } catch (error) {
    console.error("Erreur dans le contrôleur getCurrentProgram:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Erreur serveur lors de la récupération du programme." 
    });
  }
};

/**
 * Liste tous les programmes sportifs de l'utilisateur authentifié
 * 
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const listUserPrograms = async (req, res) => {
  try {
    // Récupérer l'utilisateur authentifié depuis le middleware d'authentification
    const authenticatedUser = req.user;
    if (!authenticatedUser || !authenticatedUser.firebaseUid) {
      return res.status(401).json({ 
        success: false, 
        message: "Utilisateur non authentifié" 
      });
    }
    
    // Paramètres de filtrage et pagination
    const onlyActive = req.query.onlyActive === 'true';
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    // Utiliser l'ID Firebase de l'utilisateur authentifié
    const firebaseUid = authenticatedUser.firebaseUid;
    console.log(`Récupération des programmes pour l'utilisateur authentifié: ${firebaseUid}`);
    
    // Récupérer les programmes de l'utilisateur
    const programs = await getUserSportPrograms(firebaseUid, { onlyActive, limit, offset });
    
    // Ajouter des métadonnées de pagination
    const totalCount = programs.length;
    const hasMore = totalCount === limit; // Estimation simplifiée, à améliorer avec une vraie requête de comptage
    
    res.status(200).json({
      success: true,
      pagination: {
        limit,
        offset,
        totalCount,
        hasMore
      },
      data: programs.map(program => ({
        id: program.id,
        name: program.name,
        isActive: program.isActive,
        createdAt: program.createdAt,
        updatedAt: program.updatedAt,
        version: program.version,
        // Ajout d'informations sommaires pour l'affichage en liste
        summary: {
          sessionCount: Array.isArray(program.aiGeneratedProgramJson.sessions) 
            ? program.aiGeneratedProgramJson.sessions.length 
            : 0,
          introduction: program.aiGeneratedProgramJson.introduction 
            ? program.aiGeneratedProgramJson.introduction.substring(0, 100) + (program.aiGeneratedProgramJson.introduction.length > 100 ? '...' : '')
            : null
        }
      }))
    });
  } catch (error) {
    console.error("Erreur dans le contrôleur listUserPrograms:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Erreur serveur lors de la récupération des programmes." 
    });
  }
};

module.exports = {
  generateAndSaveProgram,
  getCurrentProgram,
  listUserPrograms
};
