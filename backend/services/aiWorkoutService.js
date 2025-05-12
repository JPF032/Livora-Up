/**
 * Service d'intelligence artificielle pour la génération de programmes sportifs
 * Utilise OpenAI pour créer des programmes sportifs personnalisés
 */
const { Configuration, OpenAIApi } = require('openai');
const workoutGenerator = require('../utils/workoutGenerator');

// Configuration d'OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialisation de l'API OpenAI
const openai = new OpenAIApi(configuration);

/**
 * Génère un programme sportif personnalisé avec l'IA
 * @param {Object} userProfile - Profil utilisateur avec préférences, objectifs, etc.
 * @returns {Promise<Object>} - Programme sportif personnalisé
 */
async function generateAIWorkoutPlan(userProfile) {
  try {
    // Vérifier si la clé API est configurée
    if (!process.env.OPENAI_API_KEY) {
      console.warn('Clé API OpenAI non configurée. Utilisation du générateur standard.');
      return workoutGenerator.generateWorkoutPlan(userProfile);
    }

    // Préparer le contexte utilisateur pour l'IA
    const userContext = prepareUserContext(userProfile);
    
    // Créer le prompt pour l'IA
    const prompt = createWorkoutPrompt(userContext);
    
    // Appeler l'API OpenAI pour générer le programme
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo", // ou "gpt-4" pour une qualité supérieure
      messages: [
        { role: "system", content: "Vous êtes un coach sportif professionnel certifié, expert en création de programmes d'entraînement personnalisés." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
    
    // Extraire et parser la réponse
    const aiResponse = response.data.choices[0].message.content;
    
    // Convertir la réponse en JSON structuré
    const workoutPlan = parseAIResponse(aiResponse, userProfile);
    
    return workoutPlan;
  } catch (error) {
    console.error('Erreur lors de la génération du programme IA:', error);
    
    // Fallback sur le générateur standard en cas d'erreur
    console.log('Utilisation du générateur standard comme fallback');
    return workoutGenerator.generateWorkoutPlan(userProfile);
  }
}

/**
 * Prépare le contexte utilisateur pour l'IA
 * @param {Object} userProfile - Profil de l'utilisateur
 * @returns {Object} - Contexte structuré pour l'IA
 */
function prepareUserContext(userProfile) {
  return {
    level: userProfile.level || 'debutant',
    goal: userProfile.goal || 'general',
    daysPerWeek: userProfile.daysPerWeek || 3,
    age: userProfile.age || 30,
    gender: userProfile.gender || 'non_specifie',
    weight: userProfile.weight || 70,
    height: userProfile.height || 170,
    healthConditions: userProfile.healthConditions || [],
    preferences: userProfile.preferences || { 
      cardioPreference: 'medium', 
      equipmentAvailable: ['none'],
      focusAreas: []
    },
    restrictions: userProfile.restrictions || []
  };
}

/**
 * Crée un prompt détaillé pour l'IA
 * @param {Object} userContext - Contexte utilisateur préparé
 * @returns {string} - Prompt pour l'IA
 */
function createWorkoutPrompt(userContext) {
  return `Créez un programme d'entraînement personnalisé pour un utilisateur avec les caractéristiques suivantes:
  
  - Niveau: ${userContext.level}
  - Objectif principal: ${userContext.goal}
  - Jours d'entraînement par semaine: ${userContext.daysPerWeek}
  - Âge: ${userContext.age}
  - Sexe: ${userContext.gender}
  - Poids: ${userContext.weight} kg
  - Taille: ${userContext.height} cm
  ${userContext.healthConditions.length > 0 ? 
    `- Conditions médicales: ${userContext.healthConditions.join(', ')}` : 
    '- Aucune condition médicale particulière'}
  - Préférence cardio: ${userContext.preferences.cardioPreference}
  - Équipement disponible: ${userContext.preferences.equipmentAvailable.join(', ')}
  ${userContext.preferences.focusAreas.length > 0 ? 
    `- Zones à cibler: ${userContext.preferences.focusAreas.join(', ')}` : 
    '- Pas de zone particulière à cibler'}
  ${userContext.restrictions.length > 0 ? 
    `- Restrictions: ${userContext.restrictions.join(', ')}` : 
    '- Aucune restriction particulière'}
  
  Veuillez concevoir un programme d'entraînement COMPLET au format JSON avec la structure suivante:
  {
    "title": "Titre du programme",
    "description": "Description du programme",
    "level": "niveau du programme",
    "goal": "objectif principal",
    "daysPerWeek": nombre de jours,
    "weeks": 4,
    "workouts": [
      {
        "day": 1,
        "title": "Titre de la séance",
        "focus": ["groupe musculaire principal"],
        "exercises": [
          {
            "name": "Nom de l'exercice",
            "sets": nombre de séries,
            "reps": nombre de répétitions,
            "restSeconds": temps de repos en secondes,
            "description": "Description technique",
            "muscleGroups": ["groupes musculaires ciblés"]
          }
        ]
      }
    ],
    "recommendations": {
      "nutrition": "Conseils nutritionnels",
      "rest": "Conseils récupération",
      "progression": "Conseils progression"
    }
  }
  
  Notes importantes:
  - Adaptez les exercices au niveau ${userContext.level} de l'utilisateur
  - Concentrez-vous sur l'objectif ${userContext.goal}
  - Incluez un échauffement et un retour au calme pour chaque séance
  - Prévoyez des jours de repos appropriés
  - Fournissez uniquement la réponse au format JSON sans commentaires supplémentaires`;
}

/**
 * Parse et structure la réponse de l'IA
 * @param {string} aiResponse - Réponse brute de l'IA
 * @param {Object} userProfile - Profil utilisateur original 
 * @returns {Object} - Programme d'entraînement structuré
 */
function parseAIResponse(aiResponse, userProfile) {
  try {
    // Tentative d'extraction du JSON de la réponse
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      // Parser le JSON
      const workoutPlan = JSON.parse(jsonMatch[0]);
      
      // Validation de base de la structure
      if (!workoutPlan.workouts || !Array.isArray(workoutPlan.workouts)) {
        throw new Error('Structure de programme invalide');
      }
      
      return workoutPlan;
    } else {
      throw new Error('Impossible d\'extraire le JSON de la réponse');
    }
  } catch (error) {
    console.error('Erreur lors du parsing de la réponse IA:', error);
    
    // Fallback sur le générateur standard
    return workoutGenerator.generateWorkoutPlan(userProfile);
  }
}

/**
 * Améliore un programme existant avec des suggestions d'IA
 * @param {Object} existingPlan - Programme existant
 * @param {Object} userProfile - Profil utilisateur
 * @returns {Promise<Object>} - Programme amélioré
 */
async function enhanceWorkoutPlan(existingPlan, userProfile) {
  try {
    // Vérifier si la clé API est configurée
    if (!process.env.OPENAI_API_KEY) {
      console.warn('Clé API OpenAI non configurée. Pas d\'amélioration possible.');
      return existingPlan;
    }

    // Créer un prompt pour l'amélioration
    const prompt = `Voici un programme d'entraînement existant:
    ${JSON.stringify(existingPlan, null, 2)}
    
    Profil de l'utilisateur:
    ${JSON.stringify(prepareUserContext(userProfile), null, 2)}
    
    Veuillez suggérer des améliorations SPÉCIFIQUES pour ce programme d'entraînement au format JSON:
    {
      "improvedWorkouts": [...], // Exercices améliorés ou alternatives
      "recommendations": {
        "nutrition": "Conseils nutritionnels personnalisés",
        "progression": "Comment progresser après ce programme"
      }
    }`;
    
    // Appeler l'API OpenAI
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Vous êtes un coach sportif expert qui analyse et améliore des programmes d'entraînement." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    
    // Extraire et parser la réponse
    const aiResponse = response.data.choices[0].message.content;
    
    try {
      // Tenter d'extraire le JSON des améliorations
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const improvements = JSON.parse(jsonMatch[0]);
        
        // Fusionner les améliorations avec le plan existant
        return {
          ...existingPlan,
          workouts: improvements.improvedWorkouts || existingPlan.workouts,
          recommendations: improvements.recommendations || existingPlan.recommendations
        };
      }
    } catch (parseError) {
      console.error('Erreur lors du parsing des améliorations:', parseError);
    }
    
    // En cas d'erreur, retourner le plan d'origine
    return existingPlan;
  } catch (error) {
    console.error('Erreur lors de l\'amélioration du programme:', error);
    return existingPlan;
  }
}

module.exports = {
  generateAIWorkoutPlan,
  enhanceWorkoutPlan
};
