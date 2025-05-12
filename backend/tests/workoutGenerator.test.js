const { 
  generateWorkoutPlan, 
  generateDefaultWorkoutPlan, 
  exerciseLibrary, 
  programTemplates 
} = require('../utils/workoutGenerator');

describe('Générateur de programme sportif', () => {
  
  test('generateWorkoutPlan devrait générer un programme valide', () => {
    // Profil utilisateur de test
    const userProfile = {
      level: 'debutant',
      goal: 'perte_poids',
      daysPerWeek: 3
    };
    
    // Génération du programme
    const workoutPlan = generateWorkoutPlan(userProfile);
    
    // Vérifications de base
    expect(workoutPlan).toBeDefined();
    expect(workoutPlan.title).toBe(programTemplates.perte_poids.title);
    expect(workoutPlan.level).toBe('debutant');
    expect(workoutPlan.goal).toBe('perte_poids');
    expect(workoutPlan.daysPerWeek).toBe(3);
    
    // Vérification des exercices
    expect(Array.isArray(workoutPlan.exercises)).toBe(true);
    expect(workoutPlan.exercises.length).toBeGreaterThan(0);
    
    // Vérification des jours d'entraînement
    const uniqueDays = new Set(workoutPlan.exercises.map(e => e.day));
    expect(uniqueDays.size).toBeLessThanOrEqual(userProfile.daysPerWeek);
    
    // Vérification du contenu d'un exercice
    workoutPlan.exercises.forEach(exercise => {
      expect(exercise).toHaveProperty('name');
      expect(exercise).toHaveProperty('sets');
      expect(exercise).toHaveProperty('reps');
      expect(exercise).toHaveProperty('description');
      expect(exercise).toHaveProperty('day');
    });
  });
  
  test('generateDefaultWorkoutPlan devrait ajouter les informations utilisateur', () => {
    // UID Firebase de test
    const firebaseUid = 'test-user-123';
    
    // Génération du programme par défaut
    const defaultPlan = generateDefaultWorkoutPlan(firebaseUid);
    
    // Vérifications spécifiques à generateDefaultWorkoutPlan
    expect(defaultPlan).toHaveProperty('firebaseUid', firebaseUid);
    expect(defaultPlan).toHaveProperty('active', true);
    expect(defaultPlan).toHaveProperty('createdBy', 'ai');
    expect(defaultPlan).toHaveProperty('lastGenerated');
    expect(defaultPlan).toHaveProperty('isCustomized', false);
    
    // Vérifier que la date générée est valide
    expect(defaultPlan.lastGenerated instanceof Date).toBe(true);
  });
  
  test('generateWorkoutPlan avec niveau intermédiaire et objectif prise de muscle', () => {
    // Profil utilisateur de test
    const userProfile = {
      level: 'intermediaire',
      goal: 'prise_muscle',
      daysPerWeek: 5
    };
    
    // Génération du programme
    const workoutPlan = generateWorkoutPlan(userProfile);
    
    // Vérifications
    expect(workoutPlan.level).toBe('intermediaire');
    expect(workoutPlan.goal).toBe('prise_muscle');
    expect(workoutPlan.daysPerWeek).toBe(5);
    
    // Le template de prise de muscle avec 5 jours devrait avoir 5 jours différents
    const uniqueDays = new Set(workoutPlan.exercises.map(e => e.day));
    expect(uniqueDays.size).toBe(5);
    
    // Vérifier que les exercices sont du niveau intermédiaire
    const exerciseNames = workoutPlan.exercises.map(e => e.name);
    const intermediateNames = [];
    Object.values(exerciseLibrary.intermediaire).forEach(group => {
      group.forEach(ex => intermediateNames.push(ex.name));
    });
    
    // Au moins certains des exercices devraient être du niveau intermédiaire
    const hasIntermediateExercises = exerciseNames.some(name => intermediateNames.includes(name));
    expect(hasIntermediateExercises).toBe(true);
  });
  
  test('generateWorkoutPlan avec paramètres invalides devrait utiliser des valeurs par défaut', () => {
    // Profil utilisateur avec valeurs invalides
    const userProfile = {
      level: 'expert', // Niveau invalide
      goal: 'devenir_immortel', // Objectif invalide
      daysPerWeek: 10 // Trop de jours
    };
    
    // Génération du programme
    const workoutPlan = generateWorkoutPlan(userProfile);
    
    // Devrait utiliser des valeurs par défaut
    expect(workoutPlan.level).toBe('debutant'); // Valeur par défaut
    expect(workoutPlan.goal).toBe('general'); // Valeur par défaut
    expect(workoutPlan.daysPerWeek).toBe(5); // Limité à 5
    
    // Vérifier qu'il y a bien des exercices
    expect(workoutPlan.exercises.length).toBeGreaterThan(0);
  });
});
