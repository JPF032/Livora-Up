/**
 * Base de données simplifiée des aliments et leurs valeurs caloriques approximatives
 */
const clarifaiService = require('../services/clarifaiService');

// (On garde foodCaloriesDatabase pour enrichissement éventuel ou fallback)
const foodCaloriesDatabase = {
  // Fruits
  'apple': { minCalories: 70, maxCalories: 100 },
  'banana': { minCalories: 90, maxCalories: 120 },
  'orange': { minCalories: 60, maxCalories: 80 },
  'strawberry': { minCalories: 30, maxCalories: 50 },
  'mango': { minCalories: 130, maxCalories: 160 },
  'grape': { minCalories: 90, maxCalories: 120 },
  'fruit': { minCalories: 80, maxCalories: 120 },

  // Légumes
  'broccoli': { minCalories: 30, maxCalories: 50 },
  'carrot': { minCalories: 40, maxCalories: 60 },
  'tomato': { minCalories: 20, maxCalories: 40 },
  'potato': { minCalories: 130, maxCalories: 180 },
  'salad': { minCalories: 20, maxCalories: 40 },
  'vegetable': { minCalories: 40, maxCalories: 80 },
  
  // Viandes
  'chicken': { minCalories: 150, maxCalories: 250 },
  'beef': { minCalories: 200, maxCalories: 350 },
  'fish': { minCalories: 120, maxCalories: 220 },
  'pork': { minCalories: 180, maxCalories: 300 },
  'meat': { minCalories: 180, maxCalories: 300 },
  
  // Plats préparés
  'pizza': { minCalories: 250, maxCalories: 350 },
  'pasta': { minCalories: 200, maxCalories: 350 },
  'sandwich': { minCalories: 300, maxCalories: 500 },
  'burger': { minCalories: 350, maxCalories: 600 },
  'fries': { minCalories: 300, maxCalories: 500 },
  'rice': { minCalories: 150, maxCalories: 250 },
  'bread': { minCalories: 80, maxCalories: 150 },
  'cake': { minCalories: 300, maxCalories: 500 },
  'ice cream': { minCalories: 200, maxCalories: 350 },
  
  // Valeur par défaut pour les aliments inconnus
  'unknown food': { minCalories: 250, maxCalories: 250 }
};

const foodConcepts = new Set([
  ...Object.keys(foodCaloriesDatabase),
  'food', 'meal', 'dish', 'breakfast', 'lunch', 'dinner'
]);

/**
 * Estime les calories basées sur les concepts détectés dans une image
 * @param {Array} concepts - Liste des concepts détectés avec leurs niveaux de confiance
 * @returns {Object} - Objet contenant le nom de l'aliment et l'estimation calorique
 */
exports.estimateCalories = clarifaiService.estimateCalories;
/**
 * Estime les calories à partir d'une image en utilisant l'API Clarifai
 * Note: Cette fonction est un modèle et nécessiterait l'intégration de l'API Clarifai
 * @param {String} imageData - Image en base64
 * @returns {Promise<Object>} - Promesse résolvant vers un objet avec nom de l'aliment et calories
 */
exports.analyzeImageForCalories = async (imageData) => {
  try {
    // Appel effectif à Clarifai
    const concepts = await clarifaiService.analyzeFoodImage(imageData);
    return clarifaiService.estimateCalories(concepts);
  } catch (error) {
    console.error("Erreur lors de l'analyse Clarifai:", error);
    throw new Error("Échec de l'analyse de l'image (Clarifai)");
  }
};
