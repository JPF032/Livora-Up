// Service d'intégration Clarifai pour analyse alimentaire
const axios = require('axios');
const CLARIFAI_PAT = process.env.CLARIFAI_PAT || process.env.CLARIFAI_API_KEY;
const CLARIFAI_FOOD_MODEL_ID = 'bd367be194cf45149e75f01d59f77ba7'; // Modèle Food spécialisé de Clarifai

// Clés API pour Nutritionix (à configurer dans .env)
const NUTRITIONIX_APP_ID = process.env.NUTRITIONIX_APP_ID;
const NUTRITIONIX_API_KEY = process.env.NUTRITIONIX_API_KEY;

/**
 * Analyse une image de nourriture via le modèle Food de Clarifai
 * et récupère les informations nutritionnelles détaillées via Nutritionix
 * @param {string} base64Image - Image encodée en base64
 * @returns {Promise<Object>} - Données nutritionnelles détaillées
 */
async function analyzeFoodImage(base64Image) {
  // En-têtes pour l'API Clarifai
  const headers = {
    'Authorization': `Key ${CLARIFAI_PAT}`,
    'Content-Type': 'application/json',
  };
  
  // Données pour la requête Clarifai
  const data = {
    inputs: [
      {
        data: {
          image: { base64: base64Image }
        }
      }
    ],
    model: {
      id: CLARIFAI_FOOD_MODEL_ID,
      model_version: {
        id: "dfebc169854e429086aceb8368662641" // Version la plus récente
      }
    }
  };
  
  try {
    // 1. Appel au modèle Clarifai Food
    const response = await axios.post(
      `https://api.clarifai.com/v2/models/${CLARIFAI_FOOD_MODEL_ID}/outputs`,
      data, 
      { headers }
    );
    
    const concepts = response.data.outputs[0].data.concepts;
    
    // Prendre les 3 prédictions les plus probables (>20%)
    const topFoods = concepts
      .filter(c => c.value > 0.2)
      .slice(0, 3)
      .map(c => c.name);
    
    if (topFoods.length === 0) {
      throw new Error('Aucun aliment reconnu avec une confiance suffisante');
    }
    
    // 2. Récupérer les informations nutritionnelles via Nutritionix
    if (NUTRITIONIX_APP_ID && NUTRITIONIX_API_KEY) {
      const nutritionixHeaders = {
        'x-app-id': NUTRITIONIX_APP_ID,
        'x-app-key': NUTRITIONIX_API_KEY,
        'Content-Type': 'application/json'
      };
      
      const nutritionixResponse = await axios.post(
        'https://trackapi.nutritionix.com/v2/natural/nutrients',
        { query: topFoods.join(', ') },
        { headers: nutritionixHeaders }
      );
      
      // 3. Traiter et structurer les données nutritionnelles
      const foods = nutritionixResponse.data.foods;
      
      // Agréger les informations nutritionnelles
      const totalNutrition = foods.reduce((acc, food) => {
        return {
          calories: acc.calories + food.nf_calories,
          protein: acc.protein + food.nf_protein,
          carbs: acc.carbs + food.nf_total_carbohydrate,
          fat: acc.fat + food.nf_total_fat,
          fiber: acc.fiber + (food.nf_dietary_fiber || 0),
          sugar: acc.sugar + (food.nf_sugars || 0)
        };
      }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 });
      
      // Retourner un résultat détaillé
      return {
        detectedFoods: topFoods,
        nutrition: {
          calories: Math.round(totalNutrition.calories),
          protein: Math.round(totalNutrition.protein),
          carbs: Math.round(totalNutrition.carbs),
          fat: Math.round(totalNutrition.fat),
          fiber: Math.round(totalNutrition.fiber),
          sugar: Math.round(totalNutrition.sugar)
        },
        detailedFoods: foods.map(food => ({
          name: food.food_name,
          serving: food.serving_qty + ' ' + food.serving_unit,
          calories: Math.round(food.nf_calories),
          protein: Math.round(food.nf_protein),
          carbs: Math.round(food.nf_total_carbohydrate),
          fat: Math.round(food.nf_total_fat)
        })),
        source: 'nutritionix'
      };
    } else {
      // Fallback vers l'ancienne méthode si Nutritionix n'est pas configuré
      return estimateCaloriesFromConcepts(concepts);
    }
  } catch (err) {
    console.error('Erreur lors de l\'analyse nutritionnelle:', err);
    // Fallback vers l'ancienne méthode en cas d'erreur
    if (err.message !== 'Aucun aliment reconnu avec une confiance suffisante') {
      try {
        return estimateCaloriesFromConcepts(err.concepts || []);
      } catch (fallbackErr) {
        // Si le fallback échoue aussi, lancer l'erreur originale
        throw new Error('Erreur lors de l\'analyse nutritionnelle: ' + (err.message || 'Erreur inconnue'));
      }
    } else {
      throw err;
    }
  }
}

/**
 * Solution de secours si les APIs externes ne sont pas disponibles
 * Estime les calories à partir d'une base de données locale simplifiée
 * @param {Array<{name: string, value: number}>} concepts
 * @returns {{foodName: string, calories: number, source: string}}
 */
function estimateCaloriesFromConcepts(concepts) {
  if (!concepts || concepts.length === 0) {
    return { foodName: 'inconnu', calories: 0, source: 'local' };
  }
  
  // Table de correspondance simplifiée pour estimation calorique
  const CALORIE_DB = {
    pizza: { calories: 300, protein: 12, carbs: 33, fat: 10 },
    apple: { calories: 80, protein: 0, carbs: 21, fat: 0 },
    salad: { calories: 150, protein: 2, carbs: 10, fat: 8 },
    burger: { calories: 500, protein: 25, carbs: 40, fat: 25 },
    sandwich: { calories: 350, protein: 15, carbs: 35, fat: 12 },
    pasta: { calories: 400, protein: 12, carbs: 70, fat: 5 },
    rice: { calories: 200, protein: 4, carbs: 45, fat: 0 },
    chicken: { calories: 250, protein: 35, carbs: 0, fat: 10 },
    soup: { calories: 120, protein: 5, carbs: 15, fat: 3 },
    steak: { calories: 400, protein: 40, carbs: 0, fat: 25 },
    fries: { calories: 350, protein: 4, carbs: 50, fat: 17 },
    egg: { calories: 90, protein: 7, carbs: 1, fat: 6 },
    cheese: { calories: 110, protein: 7, carbs: 1, fat: 9 },
    bread: { calories: 90, protein: 3, carbs: 15, fat: 1 },
    yogurt: { calories: 100, protein: 5, carbs: 10, fat: 3 },
    sushi: { calories: 200, protein: 10, carbs: 30, fat: 2 },
    fish: { calories: 220, protein: 25, carbs: 0, fat: 12 },
    avocado: { calories: 160, protein: 2, carbs: 8, fat: 15 },
    banana: { calories: 105, protein: 1, carbs: 27, fat: 0 },
    smoothie: { calories: 180, protein: 3, carbs: 35, fat: 2 },
    bean: { calories: 130, protein: 8, carbs: 22, fat: 0 },
    potato: { calories: 130, protein: 3, carbs: 30, fat: 0 },
    meat: { calories: 350, protein: 30, carbs: 0, fat: 20 },
    sauce: { calories: 100, protein: 1, carbs: 5, fat: 8 },
    chocolate: { calories: 170, protein: 2, carbs: 18, fat: 10 },
    coffee: { calories: 5, protein: 0, carbs: 1, fat: 0 },
    wine: { calories: 120, protein: 0, carbs: 4, fat: 0 },
    cake: { calories: 350, protein: 4, carbs: 50, fat: 15 }
  };

  // Prend le concept le plus probable
  const main = concepts[0].name.toLowerCase();
  const nutritionData = CALORIE_DB[main] || { calories: 250, protein: 10, carbs: 30, fat: 10 };
  
  // Ajouter le nom et la source
  return { 
    foodName: main,
    ...nutritionData,
    source: 'local'
  };
}

/**
 * Analyse une image Clarifai à partir d'une URL
 * @param {string} imageUrl
 * @returns {Promise<Array<{name: string, value: number}>>}
 */
async function analyzeFoodImageUrl(imageUrl) {
  const headers = {
    'Authorization': `Key ${CLARIFAI_API_KEY}`,
    'Content-Type': 'application/json',
  };
  const data = {
    inputs: [
      {
        data: {
          image: { url: imageUrl }
        }
      }
    ]
  };
  try {
    const response = await axios.post(CLARIFAI_API_URL, data, { headers });
    const concepts = response.data.outputs[0].data.concepts;
    return concepts.map(c => ({ name: c.name, value: c.value }));
  } catch (err) {
    throw new Error('Erreur lors de l\'analyse de l\'image Clarifai (URL)');
  }
}

module.exports = {
  analyzeFoodImage,
  estimateCaloriesFromConcepts,
  analyzeFoodImageUrl
};
