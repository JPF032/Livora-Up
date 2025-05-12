const express = require('express');
const router = express.Router();
const { authenticateFirebaseToken } = require('../middlewares/auth');
const clarifaiService = require('../services/clarifaiService');
const speechRecognitionService = require('../services/speechRecognitionService');

// Importer les contrôleurs
const userController = require('../controllers/userController');
const sportController = require('../controllers/sportController');
const nutritionController = require('../controllers/nutritionController');
const nutritionPlanController = require('../controllers/nutritionPlanController');

/**
 * @route   GET /api/health
 * @desc    Vérification de la santé de l'API (route publique)
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'API Livora UP est opérationnelle',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * Routes utilisateur
 */

// Récupérer le profil de l'utilisateur connecté
router.get('/profile', authenticateFirebaseToken, userController.getUserProfile);

// Mettre à jour le profil de l'utilisateur connecté
router.put('/profile', authenticateFirebaseToken, userController.updateUserProfile);

/**
 * Routes programme sportif
 */

// Récupérer le programme sportif de l'utilisateur
router.get('/programs/sport', authenticateFirebaseToken, sportController.getSportProgram);

// Créer ou régénérer un programme sportif
router.post('/programs/sport', authenticateFirebaseToken, sportController.createWorkoutPlan);

// Optimiser un programme sportif existant avec l'IA
router.post('/programs/sport/optimize', authenticateFirebaseToken, sportController.optimizeWorkoutPlan);

// Mettre à jour un programme sportif existant
router.put('/programs/sport', authenticateFirebaseToken, sportController.updateWorkoutPlan);

/**
 * Proxy sécurisé pour Clarifai - analyse d'image
 */
router.post('/clarifai/predict', authenticateFirebaseToken, async (req, res) => {
  try {
    const { imageUrl, base64Image } = req.body;
    if (!imageUrl && !base64Image) {
      return res.status(400).json({ error: 'Image URL ou base64 requis' });
    }
    // Utilisation du service Clarifai côté backend (aucune clé exposée)
    let result;
    if (base64Image) {
      result = await clarifaiService.analyzeFoodImage(base64Image);
    } else {
      result = await clarifaiService.analyzeFoodImageUrl(imageUrl);
    }
    res.json({ concepts: result });
  } catch (err) {
    console.error('Clarifai proxy error:', err.message);
    res.status(500).json({ error: 'Clarifai request failed' });
  }
});

/**
 * Proxy sécurisé pour la reconnaissance vocale
 */
router.post('/speech/recognize', authenticateFirebaseToken, async (req, res) => {
  try {
    const { audio, config = {} } = req.body;
    
    if (!audio) {
      return res.status(400).json({ error: 'Données audio requises' });
    }
    
    // Définir la configuration par défaut si non fournie
    const recognitionConfig = {
      languageCode: config.languageCode || 'fr-FR',
      model: config.model || 'command_and_search'
    };
    
    // Utiliser le service de reconnaissance vocale
    let transcript;
    try {
      // Essayer d'abord avec Google Cloud Speech
      transcript = await speechRecognitionService.recognizeSpeech(audio, recognitionConfig);
    } catch (error) {
      console.warn('Erreur avec le service principal de reconnaissance vocale, utilisation de l\'alternative:', error.message);
      // Fallback sur le service alternatif
      transcript = await speechRecognitionService.recognizeSpeechAlternative(audio, recognitionConfig);
    }
    
    // Répondre avec la transcription
    res.json({ transcript });
    
  } catch (err) {
    console.error('Speech recognition error:', err.message);
    res.status(500).json({ error: 'Speech recognition failed' });
  }
});

// Créer ou régénérer un programme sportif
router.post('/programs/sport', authenticateFirebaseToken, sportController.createWorkoutPlan);

// Mettre à jour le programme sportif existant
router.put('/programs/sport', authenticateFirebaseToken, sportController.updateWorkoutPlan);

// Mettre à jour le statut d'un exercice (complété ou non)
router.put('/programs/sport/exercise/:exerciseId', authenticateFirebaseToken, sportController.updateExerciseStatus);

// Enregistrer un entraînement terminé
router.post('/programs/sport/track', authenticateFirebaseToken, sportController.trackWorkout);

/**
 * Routes programme nutritionnel
 */

// === Nouvelle API NutritionPlan (objectif calorique simple) ===
router.get('/programme/nutrition', authenticateFirebaseToken, nutritionPlanController.getNutritionPlan);
router.post('/programme/nutrition', authenticateFirebaseToken, nutritionPlanController.upsertNutritionPlan);
router.put('/programme/nutrition', authenticateFirebaseToken, nutritionPlanController.updateNutritionPlan);

// === Legacy/Advanced NutritionProgram endpoints ===
// Récupérer le programme nutritionnel de l'utilisateur
router.get('/programs/nutrition', authenticateFirebaseToken, nutritionController.getNutritionProgram);
// Créer ou mettre à jour un programme nutritionnel
router.post('/programs/nutrition', authenticateFirebaseToken, nutritionController.createOrUpdateNutritionProgram);
// Mettre à jour un programme nutritionnel existant
router.put('/programs/nutrition', authenticateFirebaseToken, nutritionController.updateNutritionProgram);

// Enregistrer un repas consommé
router.post('/programs/nutrition/track', authenticateFirebaseToken, nutritionController.trackMeal);

// Ajouter une entrée de repas
router.post('/programs/nutrition/entries', authenticateFirebaseToken, nutritionController.addMealEntry);

// Récupérer les entrées de repas
router.get('/programs/nutrition/entries', authenticateFirebaseToken, nutritionController.getMealEntries);

// Analyser une image pour estimer les calories
router.post('/programs/nutrition/analyze', authenticateFirebaseToken, nutritionController.analyzeImage);

module.exports = router;
