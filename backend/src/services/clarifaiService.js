/**
 * Service d'intégration avec Clarifai pour la génération de programmes sportifs
 * Utilise l'API Clarifai pour accéder aux modèles de LLM et générer du contenu structuré
 */
const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");

// Vérification des variables d'environnement requises
const CLARIFAI_PAT = process.env.CLARIFAI_PAT; // Personal Access Token
const LLM_MODEL_ID = process.env.CLARIFAI_LLM_MODEL_ID;
const CLARIFAI_USER_ID = process.env.CLARIFAI_USER_ID;
const CLARIFAI_APP_ID = process.env.CLARIFAI_APP_ID;

// Validation des configurations essentielles au démarrage
if (!CLARIFAI_PAT || !LLM_MODEL_ID || !CLARIFAI_USER_ID || !CLARIFAI_APP_ID) {
  console.error("❌ Variables d'environnement Clarifai manquantes !");
  console.error("Vérifiez CLARIFAI_PAT, CLARIFAI_LLM_MODEL_ID, CLARIFAI_USER_ID, CLARIFAI_APP_ID");
  // Ne pas bloquer le démarrage, mais le service ne fonctionnera pas correctement
}

// Initialisation du client Clarifai
const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();
metadata.set("authorization", `Key ${CLARIFAI_PAT}`);

/**
 * Construit un prompt adapté pour la génération d'un programme sportif
 * @param {Object} userProfile - Profil de l'utilisateur avec préférences
 * @returns {string} - Prompt formaté pour le modèle LLM
 */
const constructSportProgramPrompt = (userProfile) => {
  // Extraction des informations du profil avec valeurs par défaut pour éviter les erreurs
  const {
    age = 'Non spécifié',
    sex = 'Non spécifié',
    currentLevel = 'Débutant',
    objective = 'Amélioration générale',
    constraints = [],
    availability = '3 fois par semaine',
    weight = null,
    height = null,
    availableEquipment = []
  } = userProfile;

  // Construction d'une section sur l'équipement disponible si spécifié
  const equipmentSection = availableEquipment && availableEquipment.length > 0
    ? `\n- Équipement disponible: ${availableEquipment.join(', ')}`
    : '\n- Aucun équipement spécifique disponible';

  // Construction d'une section sur les contraintes si spécifiées
  const constraintsSection = constraints && constraints.length > 0
    ? `\n- Contraintes: ${constraints.join(', ')}`
    : '';

  // Construction du prompt complet avec instructions détaillées
  return `
[System role prompt]
Tu es CoachUp, l'assistant virtuel de coaching sportif. Tu génères des programmes d'entraînement JSON personnalisés et motivants.
La réponse DOIT être au format JSON valide avec la structure exacte suivante:
{
  "name": "Nom du programme",
  "introduction": "Introduction motivante expliquant le programme",
  "sessions": [
    {
      "name": "Nom de la séance",
      "dayOfWeek": "Jour de la semaine (Lundi, etc.)",
      "description": "Description de la séance",
      "exercises": [
        {
          "name": "Nom de l'exercice",
          "sets": "Nombre de séries (ex: '3')",
          "reps": "Nombre de répétitions (ex: '12', '30 secondes')",
          "restSeconds": 60,
          "notes": "Conseils d'exécution ou variantes"
        }
      ]
    }
  ]
}

IMPORTANT:
1. Ta réponse DOIT être seulement un objet JSON valide, sans texte avant ou après.
2. Le JSON doit respecter exactement le format décrit ci-dessus.
3. Chaque exercice doit avoir name, sets, reps (obligatoires) et peut avoir restSeconds et notes (optionnels).

[User prompt]
Profil Utilisateur:
- Âge: ${age} ans
- Sexe: ${sex}
- Niveau actuel: ${currentLevel}
- Objectif principal: ${objective}
${constraintsSection}
- Disponibilités: ${availability}${equipmentSection}
${weight ? `\n- Poids: ${weight} kg` : ''}
${height ? `\n- Taille: ${height} cm` : ''}

Génère un programme d'entraînement JSON complet adapté à ce profil sur 4 semaines. L'introduction doit être motivante et personnalisée.
`;
};

/**
 * Génère un programme sportif via l'API Clarifai
 * @param {Object} userProfile - Profil de l'utilisateur
 * @returns {Promise<Object>} - Programme sportif au format JSON
 */
const generateSportProgramWithClarifai = (userProfile) => {
  return new Promise((resolve, reject) => {
    // Création du prompt personnalisé
    const promptText = constructSportProgramPrompt(userProfile);
    console.log('[Clarifai] Envoi du prompt pour génération de programme sportif');
    
    // Appel à l'API Clarifai
    stub.PostModelOutputs(
      {
        user_app_id: { 
          user_id: CLARIFAI_USER_ID, 
          app_id: CLARIFAI_APP_ID 
        },
        model_id: LLM_MODEL_ID,
        inputs: [{ 
          data: { 
            text: { 
              raw: promptText 
            } 
          } 
        }],
      },
      metadata,
      (err, response) => {
        // Gestion des erreurs de communication
        if (err) {
          console.error("[Clarifai] Erreur de communication:", err);
          return reject(new Error("Erreur de communication avec l'IA Clarifai."));
        }
        
        // Vérification de la réussite de l'appel (code 10000 = SUCCESS)
        if (response.status.code !== 10000) {
          console.error("[Clarifai] Erreur de réponse:", response.status);
          return reject(new Error(`Erreur IA Clarifai: ${response.status.description || 'Statut inconnu'}`));
        }
        
        try {
          // Extraction de la réponse textuelle
          const rawOutput = response.outputs[0].data.text.raw;
          console.log('[Clarifai] Réponse brute reçue:', rawOutput.substring(0, 100) + '...');
          
          // Nettoyage de la réponse pour parser le JSON 
          // Parfois le modèle peut ajouter des backticks ou des balises json autour de la réponse
          let cleanJsonString = rawOutput.trim();
          
          // Supprime les backticks de début et fin si présents
          if (cleanJsonString.startsWith('```json')) {
            cleanJsonString = cleanJsonString.substring(7);
          } else if (cleanJsonString.startsWith('```')) {
            cleanJsonString = cleanJsonString.substring(3);
          }
          
          if (cleanJsonString.endsWith('```')) {
            cleanJsonString = cleanJsonString.substring(0, cleanJsonString.length - 3);
          }
          
          // Essaie de parser le JSON
          const programJson = JSON.parse(cleanJsonString);
          console.log('[Clarifai] JSON parsé avec succès');
          
          // Validation de la structure minimale nécessaire
          if (!programJson.name || !programJson.sessions || !Array.isArray(programJson.sessions)) {
            throw new Error("Structure JSON de programme invalide");
          }
          
          return resolve(programJson);
        } catch (parseError) {
          console.error("[Clarifai] Erreur de parsing JSON:", parseError);
          console.error("[Clarifai] Début de la réponse brute:", rawOutput.substring(0, 200));
          return reject(new Error("L'IA n'a pas retourné un format de programme valide. Impossible de parser le JSON."));
        }
      }
    );
  });
};

/**
 * Construit un prompt pour la génération d'un plan nutritionnel basé sur les objectifs sportifs
 * @param {Object} nutritionProfile - Profil nutritionnel de l'utilisateur incluant les données du programme sportif
 * @returns {string} - Prompt formaté pour le modèle LLM
 */
const constructNutritionPlanPrompt = (nutritionProfile) => {
  // Extraction des informations du programme sportif
  const { 
    sportProgram = {},
    allergies = [],
    preferences = [],
    mealFrequency = 3,
    dietaryRestrictions = [],
    weight = null,
    height = null,
    age = null,
    sex = null,
  } = nutritionProfile;

  // Calcul de l'IMC si poids et taille sont fournis
  let bmiInfo = '';
  if (weight && height) {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    bmiInfo = `\n- IMC approximatif: ${bmi.toFixed(1)}`;
  }

  // Construction des sections spécifiques
  const allergiesSection = allergies && allergies.length > 0
    ? `\n- Allergies alimentaires: ${allergies.join(', ')}`
    : '';

  const preferencesSection = preferences && preferences.length > 0
    ? `\n- Préférences alimentaires: ${preferences.join(', ')}`
    : '';

  const dietaryRestrictionsSection = dietaryRestrictions && dietaryRestrictions.length > 0
    ? `\n- Restrictions alimentaires: ${dietaryRestrictions.join(', ')}`
    : '';

  return `
[System role prompt]
Tu es NutriCoach, l'assistant nutritionnel spécialisé pour les sportifs. Tu génères des plans nutritionnels JSON personnalisés pour soutenir les objectifs d'entraînement physique.
La réponse DOIT être au format JSON valide avec la structure exacte suivante:
{
  "name": "Nom du plan nutritionnel",
  "introduction": "Explication détaillée du plan et de son alignement avec les objectifs sportifs",
  "dailyCalorieTarget": 2500,
  "macronutrientSplit": {
    "protein": "30%",
    "carbs": "50%",
    "fats": "20%"
  },
  "mealPlan": [
    {
      "mealName": "Petit-déjeuner",
      "timeOfDay": "7h30",
      "description": "Description du repas",
      "items": [
        {
          "name": "Nom de l'aliment",
          "quantity": "Quantité",
          "notes": "Conseils ou variantes"
        }
      ],
      "nutritionalInfo": {
        "calories": 500,
        "protein": "30g",
        "carbs": "60g",
        "fats": "10g"
      }
    }
  ],
  "supplementationAdvice": "Conseils sur les suppléments pertinents",
  "hydrationGuidelines": "Recommandations pour l'hydratation",
  "mealTimingWithTraining": "Conseils sur la coordination repas-entraînements"
}

IMPORTANT:
1. Ta réponse DOIT être seulement un objet JSON valide, sans texte avant ou après.
2. Le JSON doit respecter exactement le format décrit ci-dessus.
3. Les objectifs caloriques doivent être scientifiquement justifiés et adaptés au profil et au programme sportif.

[User prompt]
Profil Nutritionnel et Sportif:
- Objectif sportif: ${sportProgram.objective || 'Maintenir la forme'}
- Intensité d'entraînement: ${sportProgram.intensity || 'Modérée'}
- Fréquence d'entraînement: ${sportProgram.frequency || 3} fois par semaine
- Zone(s) de focus: ${sportProgram.focusAreas ? sportProgram.focusAreas.join(', ') : 'Général'}
${age ? `\n- Âge: ${age} ans` : ''}
${sex ? `\n- Sexe: ${sex}` : ''}
${weight ? `\n- Poids: ${weight} kg` : ''}
${height ? `\n- Taille: ${height} cm` : ''}
${bmiInfo}
- Fréquence des repas souhaitée: ${mealFrequency} repas par jour${allergiesSection}${preferencesSection}${dietaryRestrictionsSection}

Génère un plan nutritionnel JSON complet adapté à ce profil pour soutenir le programme sportif. Assure-toi que les apports caloriques et la répartition des macronutriments correspondent aux objectifs d'entraînement et à l'intensité de l'activité physique.
`;
};

/**
 * Génère un plan nutritionnel adapté au programme sportif via l'API Clarifai
 * @param {Object} nutritionProfile - Profil nutritionnel incluant les données du programme sportif
 * @returns {Promise<Object>} - Plan nutritionnel au format JSON
 */
const generateNutritionPlanWithClarifai = (nutritionProfile) => {
  return new Promise((resolve, reject) => {
    // Création du prompt personnalisé
    const promptText = constructNutritionPlanPrompt(nutritionProfile);
    console.log('[Clarifai] Envoi du prompt pour génération de plan nutritionnel');
    
    // Appel à l'API Clarifai
    stub.PostModelOutputs(
      {
        user_app_id: { 
          user_id: CLARIFAI_USER_ID, 
          app_id: CLARIFAI_APP_ID 
        },
        model_id: LLM_MODEL_ID,
        inputs: [{ 
          data: { 
            text: { 
              raw: promptText 
            } 
          } 
        }],
      },
      metadata,
      (err, response) => {
        // Gestion des erreurs de communication
        if (err) {
          console.error("[Clarifai] Erreur de communication:", err);
          return reject(new Error("Erreur de communication avec l'IA Clarifai."));
        }
        
        // Vérification de la réussite de l'appel (code 10000 = SUCCESS)
        if (response.status.code !== 10000) {
          console.error("[Clarifai] Erreur de réponse:", response.status);
          return reject(new Error(`Erreur IA Clarifai: ${response.status.description || 'Statut inconnu'}`));
        }
        
        try {
          // Extraction de la réponse textuelle
          const rawOutput = response.outputs[0].data.text.raw;
          console.log('[Clarifai] Réponse nutritionnelle brute reçue:', rawOutput.substring(0, 100) + '...');
          
          // Nettoyage de la réponse pour parser le JSON 
          // Parfois le modèle peut ajouter des backticks ou des balises json autour de la réponse
          let cleanJsonString = rawOutput.trim();
          
          // Supprime les backticks de début et fin si présents
          if (cleanJsonString.startsWith('```json')) {
            cleanJsonString = cleanJsonString.substring(7);
          } else if (cleanJsonString.startsWith('```')) {
            cleanJsonString = cleanJsonString.substring(3);
          }
          
          if (cleanJsonString.endsWith('```')) {
            cleanJsonString = cleanJsonString.substring(0, cleanJsonString.length - 3);
          }
          
          // Essaie de parser le JSON
          const nutritionPlanJson = JSON.parse(cleanJsonString);
          console.log('[Clarifai] JSON plan nutritionnel parsé avec succès');
          
          // Validation de la structure minimale nécessaire
          if (!nutritionPlanJson.name || !nutritionPlanJson.dailyCalorieTarget || !nutritionPlanJson.mealPlan) {
            throw new Error("Structure JSON du plan nutritionnel invalide");
          }
          
          return resolve(nutritionPlanJson);
        } catch (parseError) {
          console.error("[Clarifai] Erreur de parsing JSON nutritionnel:", parseError);
          console.error("[Clarifai] Début de la réponse brute:", rawOutput.substring(0, 200));
          return reject(new Error("L'IA n'a pas retourné un format de plan nutritionnel valide. Impossible de parser le JSON."));
        }
      }
    );
  });
};

module.exports = {
  generateSportProgramWithClarifai,
  generateNutritionPlanWithClarifai
};
