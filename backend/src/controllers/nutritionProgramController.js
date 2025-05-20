/**
 * Contrôleur pour la gestion des programmes nutritionnels
 * Gère les requêtes HTTP relatives aux programmes nutritionnels générés par IA
 */
const { generateNutritionPlanWithClarifai } = require('../services/clarifaiService');
const { 
  saveNutritionProgram, 
  getActiveNutritionProgramForUser,
  getUserNutritionPrograms,
  getSimplePlan,
  saveSimplePlan
} = require('../services/nutritionProgramDBService');
const {
  getActiveSportProgramForUser
} = require('../services/sportProgramDBService');

/**
 * Génère un programme nutritionnel basé sur le programme sportif via Clarifai
 * et le sauvegarde dans la base de données
 * 
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const generateNutritionPlanFromSportProgram = async (req, res) => {
  try {
    // Récupérer l'utilisateur authentifié
    const authenticatedUser = req.user;
    if (!authenticatedUser || !authenticatedUser.firebaseUid) {
      return res.status(401).json({ 
        success: false, 
        message: "Utilisateur non authentifié" 
      });
    }

    // Récupérer le programme sportif actif de l'utilisateur
    const sportProgram = await getActiveSportProgramForUser(authenticatedUser.firebaseUid);
    
    if (!sportProgram) {
      return res.status(404).json({ 
        success: false, 
        message: "Aucun programme sportif actif trouvé. Veuillez d'abord générer un programme sportif." 
      });
    }

    // Récupérer les données nutritionnelles supplémentaires (optionnelles)
    const { userNutritionProfile } = req.body;
    
    // Construire un profil nutritionnel complet en combinant les données du programme sportif
    // et les informations nutritionnelles supplémentaires
    const completeNutritionProfile = {
      userId: authenticatedUser.firebaseUid,
      sportProgram: {
        objective: sportProgram.aiGeneratedProgramJson.objective || 'Maintenir la forme',
        intensity: sportProgram.aiGeneratedProgramJson.intensity || 'Modérée',
        frequency: sportProgram.aiGeneratedProgramJson.sessions ? 
                  sportProgram.aiGeneratedProgramJson.sessions.length : 3,
        focusAreas: sportProgram.aiGeneratedProgramJson.focusAreas || ['Général'],
      },
      // Intégrer les données nutritionnelles spécifiques si elles sont fournies
      ...(userNutritionProfile || {}),
    };

    console.log(`Génération d'un programme nutritionnel basé sur le programme sportif pour l'utilisateur: ${authenticatedUser.firebaseUid}`);
    
    // Générer le programme nutritionnel via l'IA
    const nutritionPlanJson = await generateNutritionPlanWithClarifai(completeNutritionProfile);
    
    // Sauvegarder le programme nutritionnel
    const savedProgram = await saveNutritionProgram(
      authenticatedUser.firebaseUid, 
      nutritionPlanJson, 
      sportProgram.id // Lier au programme sportif
    );
    
    res.status(201).json({
      success: true,
      data: savedProgram.aiGeneratedPlanJson,
      programId: savedProgram.id,
      message: "Programme nutritionnel personnalisé généré avec succès"
    });
  } catch (error) {
    console.error("Erreur dans le contrôleur generateNutritionPlanFromSportProgram:", error);
    
    if (error.message.includes('Clarifai')) {
      return res.status(503).json({ 
        success: false, 
        message: error.message || "Erreur de service IA externe."
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || "Erreur serveur lors de la génération du programme nutritionnel." 
    });
  }
};

/**
 * Récupère le programme nutritionnel actif de l'utilisateur authentifié
 * 
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const getCurrentNutritionProgram = async (req, res) => {
  try {
    const authenticatedUser = req.user;
    if (!authenticatedUser || !authenticatedUser.firebaseUid) {
      return res.status(401).json({ 
        success: false, 
        message: "Utilisateur non authentifié" 
      });
    }
    
    const firebaseUid = authenticatedUser.firebaseUid;
    
    const program = await getActiveNutritionProgramForUser(firebaseUid);
    
    if (!program) {
      return res.status(404).json({ 
        success: false, 
        message: "Aucun programme nutritionnel actif trouvé. Veuillez générer un nouveau programme." 
      });
    }
    
    res.status(200).json({
      success: true,
      data: program.aiGeneratedPlanJson,
      metadata: {
        programId: program.id,
        createdAt: program.createdAt,
        linkedSportProgramId: program.sportProgramId
      }
    });
  } catch (error) {
    console.error("Erreur dans le contrôleur getCurrentNutritionProgram:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Erreur serveur lors de la récupération du programme nutritionnel." 
    });
  }
};

/**
 * Récupère le plan nutritionnel simple de l'utilisateur
 * Ce plan contient uniquement les objectifs caloriques et la répartition des macronutriments
 */
const getUserSimplePlan = async (req, res) => {
  try {
    const authenticatedUser = req.user;
    if (!authenticatedUser || !authenticatedUser.firebaseUid) {
      return res.status(401).json({ 
        success: false, 
        message: "Utilisateur non authentifié" 
      });
    }
    
    const simplePlan = await getSimplePlan(authenticatedUser.firebaseUid);
    
    if (!simplePlan) {
      return res.status(404).json({ 
        success: false, 
        message: "Aucun plan nutritionnel trouvé" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: simplePlan
    });
  } catch (error) {
    console.error("Erreur dans le contrôleur getUserSimplePlan:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Erreur serveur lors de la récupération du plan nutritionnel." 
    });
  }
};

/**
 * Enregistre ou met à jour le plan nutritionnel simple de l'utilisateur
 */
const upsertSimplePlan = async (req, res) => {
  try {
    const authenticatedUser = req.user;
    if (!authenticatedUser || !authenticatedUser.firebaseUid) {
      return res.status(401).json({ 
        success: false, 
        message: "Utilisateur non authentifié" 
      });
    }
    
    const planData = req.body;
    
    // Validation de base
    if (!planData || typeof planData.dailyCalorieTarget !== 'number') {
      return res.status(400).json({ 
        success: false, 
        message: "Données du plan nutritionnel invalides" 
      });
    }
    
    const savedPlan = await saveSimplePlan(authenticatedUser.firebaseUid, planData);
    
    res.status(200).json({
      success: true,
      data: savedPlan
    });
  } catch (error) {
    console.error("Erreur dans le contrôleur upsertSimplePlan:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Erreur serveur lors de l'enregistrement du plan nutritionnel." 
    });
  }
};

module.exports = {
  generateNutritionPlanFromSportProgram,
  getCurrentNutritionProgram,
  getUserSimplePlan,
  upsertSimplePlan
};
