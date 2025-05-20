/**
 * Service de base de données pour les programmes nutritionnels
 * Gère les opérations CRUD sur les programmes nutritionnels
 */
const { db } = require('../../config/firebase');

/**
 * Sauvegarde un programme nutritionnel complet généré par l'IA
 * @param {string} userId - ID de l'utilisateur (Firebase UID)
 * @param {Object} nutritionPlanJson - Plan nutritionnel au format JSON généré par l'IA
 * @param {string} sportProgramId - ID du programme sportif associé (optionnel)
 * @returns {Promise<Object>} - Programme nutritionnel sauvegardé
 */
const saveNutritionProgram = async (userId, nutritionPlanJson, sportProgramId = null) => {
  try {
    // Désactiver tous les programmes nutritionnels existants de l'utilisateur
    const userProgramsRef = db.collection('nutritionPrograms')
      .where('userId', '==', userId)
      .where('isActive', '==', true);
      
    const existingPrograms = await userProgramsRef.get();
    
    const batch = db.batch();
    existingPrograms.forEach(doc => {
      batch.update(doc.ref, { isActive: false });
    });
    
    // Créer un nouveau document pour le programme nutritionnel
    const newProgramRef = db.collection('nutritionPrograms').doc();
    
    const timestamp = new Date();
    const newProgram = {
      id: newProgramRef.id,
      userId,
      name: nutritionPlanJson.name || 'Plan nutritionnel personnalisé',
      aiGeneratedPlanJson: nutritionPlanJson,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
      version: 1,
      sportProgramId: sportProgramId // Pour lier au programme sportif
    };
    
    batch.set(newProgramRef, newProgram);
    await batch.commit();
    
    console.log(`Programme nutritionnel ${newProgramRef.id} créé pour l'utilisateur ${userId}`);
    return newProgram;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du programme nutritionnel:', error);
    throw error;
  }
};

/**
 * Récupère le programme nutritionnel actif d'un utilisateur
 * @param {string} userId - ID de l'utilisateur (Firebase UID)
 * @returns {Promise<Object|null>} - Programme nutritionnel actif ou null
 */
const getActiveNutritionProgramForUser = async (userId) => {
  try {
    const snapshot = await db.collection('nutritionPrograms')
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .limit(1)
      .get();
      
    if (snapshot.empty) {
      console.log(`Aucun programme nutritionnel actif trouvé pour l'utilisateur ${userId}`);
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Erreur lors de la récupération du programme nutritionnel actif:', error);
    throw error;
  }
};

/**
 * Récupère tous les programmes nutritionnels d'un utilisateur
 * @param {string} userId - ID de l'utilisateur (Firebase UID)
 * @param {Object} options - Options de filtrage et pagination
 * @returns {Promise<Array>} - Liste des programmes nutritionnels
 */
const getUserNutritionPrograms = async (userId, options = {}) => {
  try {
    const { onlyActive = false, limit = 10, offset = 0 } = options;
    
    let query = db.collection('nutritionPrograms')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc');
      
    if (onlyActive) {
      query = query.where('isActive', '==', true);
    }
    
    query = query.limit(limit);
    
    if (offset > 0) {
      // Implémenter une pagination réelle avec startAfter si nécessaire
      // Pour l'instant, on utilise une approche simplifiée
    }
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Erreur lors de la récupération des programmes nutritionnels:', error);
    throw error;
  }
};

/**
 * Récupère le plan nutritionnel simple d'un utilisateur
 * @param {string} userId - ID de l'utilisateur (Firebase UID)
 * @returns {Promise<Object|null>} - Plan nutritionnel simple ou null
 */
const getSimplePlan = async (userId) => {
  try {
    const docRef = db.collection('nutritionSimplePlans').doc(userId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return null;
    }
    
    return doc.data();
  } catch (error) {
    console.error('Erreur lors de la récupération du plan nutritionnel simple:', error);
    throw error;
  }
};

/**
 * Sauvegarde ou met à jour le plan nutritionnel simple d'un utilisateur
 * @param {string} userId - ID de l'utilisateur (Firebase UID)
 * @param {Object} planData - Données du plan nutritionnel
 * @returns {Promise<Object>} - Plan nutritionnel sauvegardé
 */
const saveSimplePlan = async (userId, planData) => {
  try {
    const timestamp = new Date();
    const docRef = db.collection('nutritionSimplePlans').doc(userId);
    
    // Vérifier si le document existe déjà
    const doc = await docRef.get();
    let versionNum = 1;
    
    if (doc.exists) {
      versionNum = (doc.data().version || 0) + 1;
    }
    
    const plan = {
      userId,
      dailyCalorieTarget: planData.dailyCalorieTarget,
      macronutrientSplit: planData.macronutrientSplit || {
        protein: '30%',
        carbs: '50%',
        fats: '20%'
      },
      mealFrequency: planData.mealFrequency || 3,
      createdAt: doc.exists ? doc.data().createdAt : timestamp,
      updatedAt: timestamp,
      version: versionNum
    };
    
    await docRef.set(plan);
    
    console.log(`Plan nutritionnel simple sauvegardé pour l'utilisateur ${userId}`);
    return plan;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du plan nutritionnel simple:', error);
    throw error;
  }
};

module.exports = {
  saveNutritionProgram,
  getActiveNutritionProgramForUser,
  getUserNutritionPrograms,
  getSimplePlan,
  saveSimplePlan
};
