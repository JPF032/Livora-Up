/**
 * Utilitaire de génération de programme sportif personnalisé
 * Génère un programme d'exercices en fonction du niveau et des objectifs de l'utilisateur
 */

// Bibliothèque d'exercices prédéfinis par groupe musculaire et niveau
const exerciseLibrary = {
  debutant: {
    jambes: [
      { name: 'Squats', sets: 3, reps: 10, description: 'Fléchissez les genoux comme pour vous asseoir, en gardant le dos droit.', durationMinutes: 0, restSeconds: 60, muscleGroups: ['jambes'] },
      { name: 'Fentes avant', sets: 2, reps: 8, description: 'Faites un grand pas en avant et fléchissez les genoux à 90 degrés.', durationMinutes: 0, restSeconds: 45, muscleGroups: ['jambes'] },
      { name: 'Montées de marche', sets: 3, reps: 12, description: 'Montez sur une marche ou un step en alternant les jambes.', durationMinutes: 0, restSeconds: 30, muscleGroups: ['jambes'] }
    ],
    poitrine: [
      { name: 'Pompes sur les genoux', sets: 3, reps: 8, description: 'Position de pompe avec les genoux au sol pour réduire la difficulté.', durationMinutes: 0, restSeconds: 60, muscleGroups: ['poitrine', 'bras'] },
      { name: 'Pompes contre un mur', sets: 3, reps: 12, description: 'Pompes debout en appui contre un mur, idéal pour les débutants.', durationMinutes: 0, restSeconds: 45, muscleGroups: ['poitrine'] }
    ],
    dos: [
      { name: 'Superman', sets: 3, reps: 10, description: 'Allongé sur le ventre, levez simultanément bras et jambes du sol.', durationMinutes: 0, restSeconds: 45, muscleGroups: ['dos'] },
      { name: 'Rowing avec bouteilles d\'eau', sets: 3, reps: 12, description: 'Penché en avant, tirez les coudes vers l\'arrière avec des bouteilles d\'eau.', durationMinutes: 0, restSeconds: 60, muscleGroups: ['dos', 'bras'] }
    ],
    abdominaux: [
      { name: 'Crunchs', sets: 3, reps: 12, description: 'Allongé sur le dos, relevez légèrement les épaules en contractant les abdos.', durationMinutes: 0, restSeconds: 45, muscleGroups: ['abdominaux'] },
      { name: 'Planche sur les genoux', sets: 3, reps: 1, description: 'Maintenez la position de planche avec les genoux au sol.', durationMinutes: 0.5, restSeconds: 30, muscleGroups: ['abdominaux', 'dos'] }
    ],
    cardio: [
      { name: 'Marche rapide', sets: 1, reps: 1, description: 'Marchez d\'un pas soutenu pendant 20 minutes.', durationMinutes: 20, restSeconds: 0, muscleGroups: ['cardio'] },
      { name: 'Jumping jacks', sets: 3, reps: 20, description: 'Sautez en écartant jambes et bras puis revenez à la position initiale.', durationMinutes: 0, restSeconds: 45, muscleGroups: ['cardio'] }
    ],
    epaules: [
      { name: 'Élévations latérales avec bouteilles', sets: 3, reps: 10, description: 'Levez les bras sur les côtés jusqu\'à hauteur d\'épaules.', durationMinutes: 0, restSeconds: 45, muscleGroups: ['epaules'] }
    ],
    bras: [
      { name: 'Curl avec bouteilles d\'eau', sets: 3, reps: 12, description: 'Fléchissez les coudes pour amener les bouteilles vers les épaules.', durationMinutes: 0, restSeconds: 45, muscleGroups: ['bras'] }
    ]
  },
  intermediaire: {
    jambes: [
      { name: 'Squats sautés', sets: 4, reps: 12, description: 'Faites un squat puis sautez en extension.', durationMinutes: 0, restSeconds: 60, muscleGroups: ['jambes'] },
      { name: 'Fentes sautées alternées', sets: 3, reps: 10, description: 'Alternez les jambes en fente avec un saut entre chaque répétition.', durationMinutes: 0, restSeconds: 60, muscleGroups: ['jambes'] },
      { name: 'Step-ups dynamiques', sets: 3, reps: 15, description: 'Montez sur une marche avec dynamisme en levant le genou opposé.', durationMinutes: 0, restSeconds: 45, muscleGroups: ['jambes'] }
    ],
    poitrine: [
      { name: 'Pompes classiques', sets: 3, reps: 15, description: 'Pompes en appui sur les mains et la pointe des pieds.', durationMinutes: 0, restSeconds: 60, muscleGroups: ['poitrine', 'bras'] },
      { name: 'Pompes pieds surélevés', sets: 3, reps: 12, description: 'Pompes avec les pieds sur une marche ou un step.', durationMinutes: 0, restSeconds: 60, muscleGroups: ['poitrine', 'epaules'] }
    ],
    dos: [
      { name: 'Pull-ups assistés', sets: 3, reps: 8, description: 'Tractions avec aide (élastique ou pieds au sol).', durationMinutes: 0, restSeconds: 90, muscleGroups: ['dos', 'bras'] },
      { name: 'Rowing inversé', sets: 3, reps: 12, description: 'Allongé sous une table solide, tirez-vous vers le haut.', durationMinutes: 0, restSeconds: 60, muscleGroups: ['dos'] }
    ],
    abdominaux: [
      { name: 'Planche', sets: 3, reps: 1, description: 'Maintenez la position de gainage sur les avant-bras et la pointe des pieds.', durationMinutes: 1, restSeconds: 45, muscleGroups: ['abdominaux'] },
      { name: 'Mountain climbers', sets: 3, reps: 20, description: 'En position de pompe, ramenez alternativement les genoux vers la poitrine.', durationMinutes: 0, restSeconds: 45, muscleGroups: ['abdominaux', 'cardio'] }
    ],
    cardio: [
      { name: 'Course à pied', sets: 1, reps: 1, description: 'Courez à un rythme modéré.', durationMinutes: 20, restSeconds: 0, muscleGroups: ['cardio'] },
      { name: 'Burpees', sets: 3, reps: 15, description: 'Enchaînez squat, pompe, et saut vertical.', durationMinutes: 0, restSeconds: 60, muscleGroups: ['cardio', 'full_body'] }
    ],
    epaules: [
      { name: 'Pompes piquées', sets: 3, reps: 12, description: 'Pompes avec les fesses relevées, ciblant les épaules.', durationMinutes: 0, restSeconds: 60, muscleGroups: ['epaules', 'bras'] }
    ],
    bras: [
      { name: 'Dips sur chaise', sets: 3, reps: 12, description: 'Appuyé sur une chaise derrière vous, fléchissez les coudes.', durationMinutes: 0, restSeconds: 60, muscleGroups: ['bras', 'poitrine'] }
    ]
  },
  avance: {
    jambes: [
      { name: 'Pistol squats', sets: 3, reps: 8, description: 'Squat sur une jambe, l\'autre tendue devant vous.', durationMinutes: 0, restSeconds: 90, muscleGroups: ['jambes'] },
      { name: 'Box jumps', sets: 4, reps: 12, description: 'Sautez sur une boîte ou un banc stable.', durationMinutes: 0, restSeconds: 60, muscleGroups: ['jambes'] },
      { name: 'Bulgarian split squats', sets: 4, reps: 10, description: 'Fentes avec pied arrière surélevé sur un banc.', durationMinutes: 0, restSeconds: 60, muscleGroups: ['jambes'] }
    ],
    poitrine: [
      { name: 'Pompes claquées', sets: 3, reps: 12, description: 'Pompes explosives avec décollement des mains du sol.', durationMinutes: 0, restSeconds: 90, muscleGroups: ['poitrine', 'bras'] },
      { name: 'Pompes archer', sets: 3, reps: 8, description: 'Pompes avec un bras tendu sur le côté.', durationMinutes: 0, restSeconds: 60, muscleGroups: ['poitrine', 'bras'] }
    ],
    dos: [
      { name: 'Pull-ups', sets: 4, reps: 8, description: 'Tractions complètes sur une barre.', durationMinutes: 0, restSeconds: 90, muscleGroups: ['dos', 'bras'] },
      { name: 'Rowing inversé lesté', sets: 4, reps: 10, description: 'Rowing inversé avec un sac à dos lesté.', durationMinutes: 0, restSeconds: 60, muscleGroups: ['dos'] }
    ],
    abdominaux: [
      { name: 'Planche avec touchers d\'épaule', sets: 3, reps: 20, description: 'En position de planche, touchez alternativement l\'épaule opposée.', durationMinutes: 0, restSeconds: 45, muscleGroups: ['abdominaux'] },
      { name: 'Dragon flags', sets: 3, reps: 8, description: 'Allongé sur un banc, levez les jambes tendues et contrôlez la descente.', durationMinutes: 0, restSeconds: 60, muscleGroups: ['abdominaux'] }
    ],
    cardio: [
      { name: 'Interval training (HIIT)', sets: 8, reps: 1, description: '30 secondes d\'effort maximal, 30 secondes de récupération.', durationMinutes: 0.5, restSeconds: 30, muscleGroups: ['cardio'] },
      { name: 'Burpees avec pompe et saut en extension', sets: 4, reps: 15, description: 'Burpees complets avec pompe et saut en extension.', durationMinutes: 0, restSeconds: 60, muscleGroups: ['cardio', 'full_body'] }
    ],
    epaules: [
      { name: 'Handstand push-ups contre un mur', sets: 3, reps: 8, description: 'Pompes en position verticale contre un mur.', durationMinutes: 0, restSeconds: 90, muscleGroups: ['epaules', 'bras'] }
    ],
    bras: [
      { name: 'Muscle-ups', sets: 3, reps: 5, description: 'Combinaison de traction et de dips sur une barre.', durationMinutes: 0, restSeconds: 120, muscleGroups: ['bras', 'dos', 'poitrine'] }
    ]
  }
};

// Programmes par objectif (répartition des groupes musculaires par jour)
const programTemplates = {
  perte_poids: {
    title: 'Programme Perte de Poids',
    description: 'Programme axé sur le cardio et les exercices à haute intensité pour maximiser la dépense calorique',
    3: [ // 3 jours par semaine
      { day: 1, focus: ['cardio', 'full_body'], title: 'Cardio & Full Body' },
      { day: 3, focus: ['jambes', 'abdominaux'], title: 'Bas du Corps & Core' },
      { day: 5, focus: ['cardio', 'poitrine', 'dos'], title: 'Cardio & Haut du Corps' }
    ],
    5: [ // 5 jours par semaine 
      { day: 1, focus: ['cardio', 'jambes'], title: 'Cardio & Jambes' },
      { day: 2, focus: ['poitrine', 'epaules'], title: 'Haut du Corps - Push' },
      { day: 3, focus: ['cardio', 'abdominaux'], title: 'Cardio & Core' },
      { day: 4, focus: ['dos', 'bras'], title: 'Haut du Corps - Pull' },
      { day: 5, focus: ['cardio', 'full_body'], title: 'Cardio & Full Body' }
    ]
  },
  prise_muscle: {
    title: 'Programme Prise de Muscle',
    description: 'Programme concentré sur le renforcement musculaire avec temps de récupération optimisé',
    3: [ // 3 jours par semaine
      { day: 1, focus: ['poitrine', 'epaules', 'bras'], title: 'Haut du Corps' },
      { day: 3, focus: ['jambes', 'abdominaux'], title: 'Bas du Corps & Core' },
      { day: 5, focus: ['dos', 'bras', 'abdominaux'], title: 'Dos & Bras' }
    ],
    5: [ // 5 jours par semaine
      { day: 1, focus: ['poitrine', 'epaules'], title: 'Poitrine & Épaules' },
      { day: 2, focus: ['dos', 'bras'], title: 'Dos & Bras' },
      { day: 3, focus: ['jambes', 'abdominaux'], title: 'Jambes & Abdos' },
      { day: 4, focus: ['poitrine', 'epaules', 'bras'], title: 'Haut du Corps' },
      { day: 5, focus: ['jambes', 'dos', 'abdominaux'], title: 'Bas du Corps & Dos' }
    ]
  },
  forme_physique: {
    title: 'Programme Forme Physique Générale',
    description: 'Programme équilibré combinant cardio et musculation pour améliorer la condition physique globale',
    3: [ // 3 jours par semaine
      { day: 1, focus: ['cardio', 'full_body'], title: 'Full Body #1' },
      { day: 3, focus: ['cardio', 'full_body'], title: 'Full Body #2' },
      { day: 5, focus: ['cardio', 'full_body'], title: 'Full Body #3' }
    ],
    5: [ // 5 jours par semaine
      { day: 1, focus: ['poitrine', 'abdominaux', 'cardio'], title: 'Poitrine & Cardio' },
      { day: 2, focus: ['jambes', 'abdominaux'], title: 'Jambes & Core' },
      { day: 3, focus: ['dos', 'epaules', 'cardio'], title: 'Dos & Cardio' },
      { day: 4, focus: ['bras', 'abdominaux'], title: 'Bras & Core' },
      { day: 5, focus: ['cardio', 'full_body'], title: 'Full Body & Cardio' }
    ]
  },
  endurance: {
    title: 'Programme Endurance',
    description: 'Programme axé sur le développement de l\'endurance cardiovasculaire et musculaire',
    3: [ // 3 jours par semaine
      { day: 1, focus: ['cardio', 'jambes'], title: 'Endurance Bas du Corps' },
      { day: 3, focus: ['cardio', 'poitrine', 'dos'], title: 'Endurance Haut du Corps' },
      { day: 5, focus: ['cardio', 'full_body'], title: 'Endurance Générale' }
    ],
    5: [ // 5 jours par semaine
      { day: 1, focus: ['cardio'], title: 'Cardio Long' },
      { day: 2, focus: ['jambes', 'abdominaux', 'cardio'], title: 'Endurance Bas du Corps' },
      { day: 3, focus: ['cardio'], title: 'HIIT' },
      { day: 4, focus: ['poitrine', 'dos', 'cardio'], title: 'Endurance Haut du Corps' },
      { day: 5, focus: ['cardio', 'full_body'], title: 'Endurance Complète' }
    ]
  },
  general: { // Programme par défaut
    title: 'Programme Général',
    description: 'Programme d\'entraînement complet pour développer force et endurance',
    3: [ // 3 jours par semaine
      { day: 1, focus: ['poitrine', 'bras', 'abdominaux'], title: 'Haut du Corps' },
      { day: 3, focus: ['jambes', 'abdominaux', 'cardio'], title: 'Bas du Corps' },
      { day: 5, focus: ['dos', 'epaules', 'abdominaux'], title: 'Dos & Épaules' }
    ],
    5: [ // 5 jours par semaine
      { day: 1, focus: ['poitrine', 'epaules'], title: 'Push' },
      { day: 2, focus: ['dos', 'bras'], title: 'Pull' },
      { day: 3, focus: ['jambes', 'abdominaux'], title: 'Jambes' },
      { day: 4, focus: ['poitrine', 'epaules', 'bras'], title: 'Upper Body' },
      { day: 5, focus: ['cardio', 'abdominaux'], title: 'Cardio & Core' }
    ]
  }
};

/**
 * Génère un programme d'entraînement personnalisé
 * @param {Object} userProfile - Profil de l'utilisateur contenant niveau, objectif, etc.
 * @returns {Object} Programme d'entraînement généré
 */
const generateWorkoutPlan = (userProfile) => {
  // Paramètres par défaut si non spécifiés
  const level = userProfile.level || 'debutant';
  const goal = userProfile.goal || 'general';
  const daysPerWeek = userProfile.daysPerWeek || 3;

  // Validation des paramètres
  const validLevel = ['debutant', 'intermediaire', 'avance'].includes(level) ? level : 'debutant';
  const validGoal = Object.keys(programTemplates).includes(goal) ? goal : 'general';
  const validDays = daysPerWeek > 3 ? 5 : 3; // On ne propose que 3 ou 5 jours pour simplifier

  // Récupérer le template approprié
  const template = programTemplates[validGoal][validDays];
  
  // Préparer le programme avec les métadonnées
  const workoutPlan = {
    title: programTemplates[validGoal].title,
    description: programTemplates[validGoal].description,
    level: validLevel,
    goal: validGoal,
    daysPerWeek: validDays,
    exercises: []
  };

  // Pour chaque jour du programme, sélectionner des exercices des groupes musculaires ciblés
  template.forEach(day => {
    // Pour chaque groupe musculaire ciblé ce jour
    day.focus.forEach(muscleGroup => {
      // S'assurer que le groupe musculaire existe dans la bibliothèque pour ce niveau
      if (exerciseLibrary[validLevel][muscleGroup]) {
        // Définir combien d'exercices sélectionner pour ce groupe musculaire
        // Pour le cardio et les exercices full_body, on en prend moins
        const numExercisesToPick = ['cardio', 'full_body'].includes(muscleGroup) ? 1 : 2;
        
        // Sélectionner aléatoirement des exercices sans duplication
        const availableExercises = [...exerciseLibrary[validLevel][muscleGroup]];
        const selectedExercises = [];
        
        for (let i = 0; i < numExercisesToPick && availableExercises.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * availableExercises.length);
          const exercise = availableExercises.splice(randomIndex, 1)[0];
          
          // Ajouter des informations supplémentaires à l'exercice
          selectedExercises.push({
            ...exercise,
            day: day.day,
            order: i,
            dayTitle: day.title
          });
        }
        
        // Ajouter les exercices sélectionnés au programme
        workoutPlan.exercises.push(...selectedExercises);
      }
    });
  });
  
  return workoutPlan;
};

/**
 * Génère un programme d'entraînement par défaut pour un nouvel utilisateur
 * @param {String} firebaseUid - Identifiant Firebase de l'utilisateur
 * @param {Object} userMetadata - Métadonnées optionnelles de l'utilisateur
 * @returns {Object} Plan d'entraînement par défaut
 */
const generateDefaultWorkoutPlan = (firebaseUid, userMetadata = {}) => {
  // Paramètres par défaut pour un nouvel utilisateur
  const userProfile = {
    level: userMetadata.level || 'debutant',
    goal: userMetadata.goal || 'general',
    daysPerWeek: userMetadata.daysPerWeek || 3
  };
  
  // Générer le programme
  const workoutPlan = generateWorkoutPlan(userProfile);
  
  // Ajouter les informations utilisateur
  return {
    firebaseUid,
    ...workoutPlan,
    active: true,
    createdBy: 'ai',
    lastGenerated: new Date(),
    isCustomized: false
  };
};

module.exports = {
  generateWorkoutPlan,
  generateDefaultWorkoutPlan,
  exerciseLibrary,
  programTemplates
};
