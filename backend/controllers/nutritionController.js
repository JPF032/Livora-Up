const NutritionProgram = require('../models/NutritionProgram');
const User = require('../models/User');
const { estimateCalories, analyzeImageForCalories } = require('../utils/calorieEstimator');

/**
 * @desc    Récupérer le programme nutritionnel de l'utilisateur courant
 * @route   GET /api/programs/nutrition
 * @access  Private
 */
exports.getNutritionProgram = async (req, res, next) => {
  try {
    const firebaseUid = req.user.uid;
    
    // Chercher l'utilisateur dans la base de données
    const user = await User.findOne({ firebaseUid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Chercher le programme nutritionnel actif de l'utilisateur
    let nutritionProgram = await NutritionProgram.findOne({ 
      firebaseUid, 
      active: true 
    });
    
    // Si aucun programme n'existe, créer un programme par défaut
    if (!nutritionProgram) {
      nutritionProgram = await NutritionProgram.create({
        userId: user._id,
        firebaseUid,
        title: 'Plan nutritionnel équilibré',
        description: 'Alimentation équilibrée pour atteindre vos objectifs',
        dailyCalorieTarget: 2000,
        macrosRatio: {
          proteins: 30,
          carbs: 45,
          fats: 25
        },
        meals: [
          {
            name: 'Petit-déjeuner',
            description: 'Premier repas de la journée',
            timeOfDay: 'matin',
            suggestions: [
              {
                name: 'Flocons d\'avoine avec fruits',
                ingredients: ['Flocons d\'avoine', 'Lait', 'Banane', 'Miel'],
                proteins: 10,
                carbs: 60,
                fats: 8,
                calories: 350,
                preparationTime: 5
              },
              {
                name: 'Oeufs et avocat',
                ingredients: ['Oeufs', 'Avocat', 'Pain complet', 'Tomate'],
                proteins: 15,
                carbs: 20,
                fats: 15,
                calories: 300,
                preparationTime: 10
              }
            ]
          },
          {
            name: 'Déjeuner',
            description: 'Repas du midi',
            timeOfDay: 'midi',
            suggestions: [
              {
                name: 'Salade complète avec protéines',
                ingredients: ['Poulet', 'Salade verte', 'Légumes', 'Vinaigrette légère'],
                proteins: 25,
                carbs: 15,
                fats: 12,
                calories: 400,
                preparationTime: 15
              },
              {
                name: 'Bowl de quinoa aux légumes',
                ingredients: ['Quinoa', 'Légumes de saison', 'Pois chiches', 'Sauce au yaourt'],
                proteins: 18,
                carbs: 45,
                fats: 10,
                calories: 450,
                preparationTime: 20
              }
            ]
          },
          {
            name: 'Dîner',
            description: 'Repas du soir',
            timeOfDay: 'soir',
            suggestions: [
              {
                name: 'Poisson et légumes verts',
                ingredients: ['Filet de poisson blanc', 'Légumes verts', 'Huile d\'olive', 'Citron'],
                proteins: 25,
                carbs: 10,
                fats: 12,
                calories: 350,
                preparationTime: 20
              },
              {
                name: 'Poulet et patate douce',
                ingredients: ['Poulet', 'Patate douce', 'Légumes', 'Épices'],
                proteins: 30,
                carbs: 35,
                fats: 8,
                calories: 420,
                preparationTime: 25
              }
            ]
          }
        ],
        active: true,
        createdBy: 'system',
        dietType: 'equilibre'
      });
    }
    
    res.status(200).json({
      success: true,
      data: nutritionProgram
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Créer ou mettre à jour un programme nutritionnel
 * @route   POST /api/programs/nutrition
 * @access  Private
 */
exports.createOrUpdateNutritionProgram = async (req, res, next) => {
  try {
    const firebaseUid = req.user.uid;
    const { 
      title, 
      description, 
      dailyCalorieTarget, 
      macrosRatio, 
      dietType 
    } = req.body;
    
    // Chercher l'utilisateur dans la base de données
    const user = await User.findOne({ firebaseUid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Chercher un programme nutritionnel actif existant
    let nutritionProgram = await NutritionProgram.findOne({ 
      firebaseUid, 
      active: true 
    });
    
    if (nutritionProgram) {
      // Mise à jour du programme existant
      if (title) nutritionProgram.title = title;
      if (description) nutritionProgram.description = description;
      if (dailyCalorieTarget) nutritionProgram.dailyCalorieTarget = dailyCalorieTarget;
      if (macrosRatio) nutritionProgram.macrosRatio = { ...nutritionProgram.macrosRatio, ...macrosRatio };
      if (dietType) nutritionProgram.dietType = dietType;
      
      await nutritionProgram.save();
    } else {
      // Création d'un nouveau programme
      nutritionProgram = await NutritionProgram.create({
        userId: user._id,
        firebaseUid,
        title: title || 'Programme nutritionnel personnalisé',
        description: description || 'Plan alimentaire adapté à vos besoins',
        dailyCalorieTarget: dailyCalorieTarget || 2000,
        macrosRatio: macrosRatio || {
          proteins: 30,
          carbs: 45,
          fats: 25
        },
        meals: [],
        active: true,
        createdBy: 'user',
        dietType: dietType || 'equilibre'
      });
    }
    
    res.status(200).json({
      success: true,
      message: nutritionProgram ? 'Programme nutritionnel mis à jour' : 'Programme nutritionnel créé',
      data: nutritionProgram
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mettre à jour un programme nutritionnel existant
 * @route   PUT /api/programs/nutrition
 * @access  Private
 */
exports.updateNutritionProgram = async (req, res, next) => {
  try {
    const firebaseUid = req.user.uid;
    const { 
      title, 
      description, 
      dailyCalorieTarget, 
      macrosRatio, 
      dietType 
    } = req.body;
    
    // Chercher le programme nutritionnel actif de l'utilisateur
    let nutritionProgram = await NutritionProgram.findOne({ 
      firebaseUid, 
      active: true 
    });
    
    if (!nutritionProgram) {
      return res.status(404).json({
        success: false,
        message: 'Programme nutritionnel non trouvé'
      });
    }
    
    // Mise à jour des champs
    if (title) nutritionProgram.title = title;
    if (description) nutritionProgram.description = description;
    if (dailyCalorieTarget) nutritionProgram.dailyCalorieTarget = dailyCalorieTarget;
    if (macrosRatio) {
      nutritionProgram.macrosRatio = {
        proteins: macrosRatio.proteins || nutritionProgram.macrosRatio.proteins,
        carbs: macrosRatio.carbs || nutritionProgram.macrosRatio.carbs,
        fats: macrosRatio.fats || nutritionProgram.macrosRatio.fats
      };
    }
    if (dietType) nutritionProgram.dietType = dietType;
    
    await nutritionProgram.save();
    
    res.status(200).json({
      success: true,
      message: 'Programme nutritionnel mis à jour',
      data: nutritionProgram
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Enregistrer un repas consommé
 * @route   POST /api/programs/nutrition/track
 * @access  Private
 */
exports.trackMeal = async (req, res, next) => {
  try {
    const firebaseUid = req.user.uid;
    const { mealTypeId, mealSuggestionId, customMeal, satisfied, notes } = req.body;
    
    if (!mealTypeId) {
      return res.status(400).json({
        success: false,
        message: 'ID du type de repas requis'
      });
    }
    
    // Chercher le programme nutritionnel actif de l'utilisateur
    let nutritionProgram = await NutritionProgram.findOne({ 
      firebaseUid, 
      active: true 
    });
    
    if (!nutritionProgram) {
      return res.status(404).json({
        success: false,
        message: 'Programme nutritionnel non trouvé'
      });
    }
    
    // Vérifier si le type de repas existe dans le programme
    const mealTypeExists = nutritionProgram.meals.id(mealTypeId);
    
    if (!mealTypeExists) {
      return res.status(404).json({
        success: false,
        message: 'Type de repas non trouvé dans le programme'
      });
    }
    
    // Si un ID de suggestion est fourni, vérifier qu'il existe
    if (mealSuggestionId && !mealTypeExists.suggestions.id(mealSuggestionId)) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion de repas non trouvée'
      });
    }
    
    // Créer un nouvel enregistrement de repas
    nutritionProgram.mealTracks.push({
      date: new Date(),
      mealTypeId,
      mealSuggestionId,
      customMeal,
      satisfied: satisfied !== undefined ? satisfied : true,
      notes
    });
    
    await nutritionProgram.save();
    
    res.status(201).json({
      success: true,
      message: 'Repas enregistré avec succès',
      data: nutritionProgram.mealTracks[nutritionProgram.mealTracks.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Ajouter une entrée de repas
 * @route   POST /api/programs/nutrition/entries
 * @access  Private
 */
exports.addMealEntry = async (req, res, next) => {
  try {
    const firebaseUid = req.user.uid;
    const { mealTypeId, foodName, customMeal, calories, notes } = req.body;
    
    if (!mealTypeId) {
      return res.status(400).json({
        success: false,
        message: 'ID du type de repas requis'
      });
    }
    
    // Chercher le programme nutritionnel actif de l'utilisateur
    let nutritionProgram = await NutritionProgram.findOne({ 
      firebaseUid, 
      active: true 
    });
    
    if (!nutritionProgram) {
      return res.status(404).json({
        success: false,
        message: 'Programme nutritionnel non trouvé'
      });
    }
    
    // Vérifier si le type de repas existe dans le programme
    const mealTypeExists = nutritionProgram.meals.id(mealTypeId);
    
    if (!mealTypeExists) {
      return res.status(404).json({
        success: false,
        message: 'Type de repas non trouvé dans le programme'
      });
    }
    
    // Accepter foodName ou customMeal (pour la compatibilité avec différents clients)
    const mealName = customMeal || foodName;
    
    // Créer un nouvel enregistrement de repas
    nutritionProgram.mealTracks.push({
      date: new Date(),
      mealTypeId,
      customMeal: mealName,
      calories: calories || 0,
      notes
    });
    
    await nutritionProgram.save();
    
    // Pour la compatibilité avec les tests, retourner les données au format attendu
    const mealData = nutritionProgram.mealTracks[nutritionProgram.mealTracks.length - 1];
    const responseData = {
      ...mealData.toObject(),
      foodName: mealData.customMeal // Ajouter foodName pour rétrocompatibilité
    };
    
    res.status(201).json({
      success: true,
      message: 'Entrée de repas ajoutée avec succès',
      data: responseData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Récupérer les entrées de repas
 * @route   GET /api/programs/nutrition/entries
 * @access  Private
 */
exports.getMealEntries = async (req, res, next) => {
  try {
    const firebaseUid = req.user.uid;
    const { date } = req.query;
    
    // Chercher le programme nutritionnel actif de l'utilisateur
    let nutritionProgram = await NutritionProgram.findOne({ 
      firebaseUid, 
      active: true 
    });
    
    if (!nutritionProgram) {
      return res.status(404).json({
        success: false,
        message: 'Programme nutritionnel non trouvé'
      });
    }
    
    // Filtrer les entrées par date si spécifiée
    let mealEntries = nutritionProgram.mealTracks;
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      mealEntries = mealEntries.filter(entry => 
        entry.date >= startOfDay && entry.date <= endOfDay
      );
    }
    
    // Transformer les données pour la compatibilité des tests
    const formattedEntries = mealEntries.map(entry => {
      const entryObj = entry.toObject ? entry.toObject() : entry;
      // Ajouter foodName pour la rétrocompatibilité
      if (entryObj.customMeal && !entryObj.foodName) {
        entryObj.foodName = entryObj.customMeal;
      }
      return entryObj;
    });
    
    res.status(200).json({
      success: true,
      data: formattedEntries
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Analyser une image pour estimer les calories
 * @route   POST /api/programs/nutrition/analyze
 * @access  Private
 */
exports.analyzeImage = async (req, res, next) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image requise pour l\'analyse'
      });
    }
    
    // Analyser l'image pour estimer les calories
    const result = await analyzeImageForCalories(image);
    
    res.status(200).json({
      success: true,
      message: 'Analyse d\'image réussie',
      data: result
    });
  } catch (error) {
    console.error('Erreur lors de l\'analyse de l\'image:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'analyse de l\'image',
      error: error.message
    });
  }
};
