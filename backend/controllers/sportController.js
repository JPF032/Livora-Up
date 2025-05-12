const SportProgram = require('../models/SportProgram');
const User = require('../models/User');
const { generateDefaultWorkoutPlan, generateWorkoutPlan } = require('../utils/workoutGenerator');
const aiWorkoutService = require('../services/aiWorkoutService');

/**
 * @desc    Récupérer le programme sportif de l'utilisateur courant
 * @route   GET /api/programs/sport
 * @access  Private
 */
exports.getSportProgram = async (req, res, next) => {
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
    
    // Chercher le programme sportif actif de l'utilisateur
    let sportProgram = await SportProgram.findOne({ 
      firebaseUid, 
      active: true 
    });
    
    // Si aucun programme n'existe, on renvoie un 404 pour que le frontend puisse proposer d'en générer un
    if (!sportProgram) {
      return res.status(404).json({
        success: false,
        message: 'Aucun programme sportif trouvé. Vous pouvez en générer un nouveau.'
      });
    }
    
    res.status(200).json({
      success: true,
      data: sportProgram
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Créer ou régénérer un programme sportif pour l'utilisateur
 * @route   POST /api/programs/sport
 * @access  Private
 */
exports.createWorkoutPlan = async (req, res, next) => {
  try {
    const firebaseUid = req.user.uid;
    
    // Paramètres optionnels pour la génération du programme
    const { level, goal, daysPerWeek, regenerate } = req.body;
    
    // Chercher l'utilisateur dans la base de données
    const user = await User.findOne({ firebaseUid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Vérifier si un programme existe déjà
    let existingProgram = await SportProgram.findOne({ 
      firebaseUid, 
      active: true 
    });
    
    // Si un programme existe et que regenerate est false, retourner celui existant
    if (existingProgram && !regenerate) {
      return res.status(200).json({
        success: true,
        message: 'Un programme sportif existe déjà. Utilisez regenerate=true pour le remplacer.',
        data: existingProgram
      });
    }
    
    // Récupérer les métadonnées complètes de l'utilisateur pour personnaliser le programme
    const userMetadata = {
      level: level || user.metadata?.level || 'debutant',
      goal: goal || user.metadata?.goals || 'general',
      daysPerWeek: daysPerWeek || user.metadata?.daysPerWeek || 3,
      age: user.profile?.age,
      gender: user.profile?.gender,
      weight: user.profile?.weight,
      height: user.profile?.height,
      healthConditions: user.profile?.healthConditions || [],
      preferences: req.body.preferences || user.profile?.preferences || {
        cardioPreference: 'medium',
        equipmentAvailable: ['none'],
        focusAreas: []
      },
      restrictions: user.profile?.restrictions || []
    };
    
    // Vérifier si l'utilisateur souhaite utiliser l'IA pour la génération
    const useAI = req.body.useAI === true;
    
    let workoutPlanData;
    
    // Générer un nouveau programme (avec IA si demandé)
    try {
      if (useAI) {
        console.log('Génération d\'un programme sportif avec IA...');
        workoutPlanData = await aiWorkoutService.generateAIWorkoutPlan(userMetadata);
        workoutPlanData.generatedByAI = true;
      } else {
        console.log('Génération d\'un programme sportif standard...');
        workoutPlanData = generateDefaultWorkoutPlan(firebaseUid, userMetadata);
        workoutPlanData.generatedByAI = false;
      }
      
      // Ajouter l'id Firebase
      workoutPlanData.firebaseUid = firebaseUid;
    } catch (error) {
      console.error('Erreur lors de la génération du programme sportif:', error);
      // Fallback sur la génération standard en cas d'erreur
      workoutPlanData = generateDefaultWorkoutPlan(firebaseUid, userMetadata);
      workoutPlanData.generatedByAI = false;
      workoutPlanData.firebaseUid = firebaseUid;
    }
    
    // Ajouter l'ID utilisateur MongoDB au plan
    workoutPlanData.userId = user._id;
    
    // Si un programme existe déjà, le désactiver
    if (existingProgram) {
      existingProgram.active = false;
      await existingProgram.save();
    }
    
    // Créer le nouveau programme en base de données
    const newProgram = await SportProgram.create(workoutPlanData);
    
    res.status(201).json({
      success: true,
      message: 'Programme sportif généré avec succès',
      data: newProgram
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Optimiser un programme sportif existant avec l'IA
 * @route   POST /api/programs/sport/optimize
 * @access  Private
 */
exports.optimizeWorkoutPlan = async (req, res, next) => {
  try {
    const firebaseUid = req.user.uid;
    const { programId } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Récupérer le programme à optimiser
    let sportProgram;
    
    if (programId) {
      // Si un ID spécifique est fourni
      sportProgram = await SportProgram.findById(programId);
      
      // Vérifier que le programme appartient à l'utilisateur
      if (!sportProgram || sportProgram.firebaseUid !== firebaseUid) {
        return res.status(404).json({
          success: false,
          message: 'Programme non trouvé ou non autorisé'
        });
      }
    } else {
      // Sinon, récupérer le programme actif de l'utilisateur
      sportProgram = await SportProgram.findOne({ firebaseUid, active: true });
      
      if (!sportProgram) {
        return res.status(404).json({
          success: false,
          message: 'Aucun programme actif trouvé. Générez d\'abord un programme.'
        });
      }
    }
    
    // Récupérer les métadonnées de l'utilisateur
    const userMetadata = {
      level: user.metadata?.level || 'debutant',
      goal: user.metadata?.goals || 'general',
      daysPerWeek: sportProgram.daysPerWeek || 3,
      age: user.profile?.age,
      gender: user.profile?.gender,
      weight: user.profile?.weight,
      height: user.profile?.height,
      healthConditions: user.profile?.healthConditions || [],
      preferences: req.body.preferences || user.profile?.preferences || {},
      restrictions: user.profile?.restrictions || []
    };
    
    // Utiliser l'IA pour optimiser le programme
    try {
      console.log('Optimisation du programme sportif avec IA...');
      const optimizedPlan = await aiWorkoutService.enhanceWorkoutPlan(sportProgram.toObject(), userMetadata);
      
      // Créer une copie optimisée du programme
      const optimizedProgram = new SportProgram({
        ...optimizedPlan,
        firebaseUid,
        userId: user._id,
        active: true,
        generatedByAI: true,
        optimized: true,
        basedOn: sportProgram._id
      });
      
      // Désactiver l'ancien programme
      sportProgram.active = false;
      await sportProgram.save();
      
      // Sauvegarder le nouveau programme optimisé
      await optimizedProgram.save();
      
      return res.status(200).json({
        success: true,
        message: 'Programme sportif optimisé avec succès',
        data: optimizedProgram
      });
    } catch (error) {
      console.error('Erreur lors de l\'optimisation du programme:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'optimisation du programme',
        error: error.message
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mettre à jour le programme sportif existant
 * @route   PUT /api/programs/sport
 * @access  Private
 */
exports.updateWorkoutPlan = async (req, res, next) => {
  try {
    const firebaseUid = req.user.uid;
    const { exercises } = req.body;
    
    // Vérifier si les exercices sont fournis
    if (!exercises || !Array.isArray(exercises)) {
      return res.status(400).json({
        success: false,
        message: 'Un tableau d\'exercices est requis'
      });
    }
    
    // Chercher le programme sportif actif de l'utilisateur
    let sportProgram = await SportProgram.findOne({ 
      firebaseUid, 
      active: true 
    });
    
    if (!sportProgram) {
      return res.status(404).json({
        success: false,
        message: 'Programme sportif non trouvé'
      });
    }
    
    // Mettre à jour les exercices
    sportProgram.exercises = exercises;
    sportProgram.isCustomized = true;
    sportProgram.updatedAt = Date.now();
    
    // Sauvegarder les modifications
    await sportProgram.save();
    
    res.status(200).json({
      success: true,
      message: 'Programme sportif mis à jour avec succès',
      data: sportProgram
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Marquer un exercice comme terminé
 * @route   PUT /api/programs/sport/exercise/:exerciseId
 * @access  Private
 */
exports.updateExerciseStatus = async (req, res, next) => {
  try {
    const firebaseUid = req.user.uid;
    const { exerciseId } = req.params;
    const { completed } = req.body;
    
    if (completed === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Le statut completed est requis'
      });
    }
    
    // Chercher le programme sportif actif de l'utilisateur
    let sportProgram = await SportProgram.findOne({ 
      firebaseUid, 
      active: true 
    });
    
    if (!sportProgram) {
      return res.status(404).json({
        success: false,
        message: 'Programme sportif non trouvé'
      });
    }
    
    // Trouver l'exercice dans le programme
    const exercise = sportProgram.exercises.id(exerciseId);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercice non trouvé dans le programme'
      });
    }
    
    // Mettre à jour le statut de l'exercice
    exercise.completed = completed;
    
    // Créer un enregistrement d'entraînement si l'exercice est marqué comme terminé
    if (completed) {
      sportProgram.workoutTracks.push({
        date: new Date(),
        exerciseId,
        completed: true,
        actualSets: exercise.sets,
        actualReps: exercise.reps,
        notes: 'Complété via l\'application'
      });
    }
    
    // Sauvegarder les modifications
    await sportProgram.save();
    
    res.status(200).json({
      success: true,
      message: `Exercice marqué comme ${completed ? 'terminé' : 'non terminé'}`,
      data: exercise
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Enregistrer un entraînement terminé
 * @route   POST /api/programs/sport/track
 * @access  Private
 */
exports.trackWorkout = async (req, res, next) => {
  try {
    const firebaseUid = req.user.uid;
    const { exerciseId, completed, actualSets, actualReps, notes } = req.body;
    
    if (!exerciseId) {
      return res.status(400).json({
        success: false,
        message: 'ID de l\'exercice requis'
      });
    }
    
    // Chercher le programme sportif actif de l'utilisateur
    let sportProgram = await SportProgram.findOne({ 
      firebaseUid, 
      active: true 
    });
    
    if (!sportProgram) {
      return res.status(404).json({
        success: false,
        message: 'Programme sportif non trouvé'
      });
    }
    
    // Vérifier si l'exercice existe dans le programme
    const exerciseExists = sportProgram.exercises.id(exerciseId);
    
    if (!exerciseExists) {
      return res.status(404).json({
        success: false,
        message: 'Exercice non trouvé dans le programme'
      });
    }
    
    // Créer un nouvel enregistrement d'entraînement
    sportProgram.workoutTracks.push({
      date: new Date(),
      exerciseId,
      completed: completed !== undefined ? completed : true,
      actualSets,
      actualReps,
      notes
    });
    
    // Si l'exercice est marqué comme terminé, mettre à jour son statut
    if (completed !== undefined && exerciseExists) {
      exerciseExists.completed = completed;
    }
    
    await sportProgram.save();
    
    res.status(201).json({
      success: true,
      message: 'Entraînement enregistré avec succès',
      data: sportProgram.workoutTracks[sportProgram.workoutTracks.length - 1]
    });
  } catch (error) {
    next(error);
  }
};
