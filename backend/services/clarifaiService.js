// Service d'intégration Clarifai pour analyse alimentaire
const axios = require('axios');
const CLARIFAI_API_KEY = process.env.CLARIFAI_API_KEY;
const CLARIFAI_FOOD_MODEL_ID = 'food-item-recognition';
const CLARIFAI_API_URL = 'https://api.clarifai.com/v2/models/' + CLARIFAI_FOOD_MODEL_ID + '/outputs';

/**
 * Envoie une image à Clarifai et retourne les concepts identifiés
 * @param {string} base64Image
 * @returns {Promise<Array<{name: string, value: number}>>}
 */
async function analyzeFoodImage(base64Image) {
  const headers = {
    'Authorization': `Key ${CLARIFAI_API_KEY}`,
    'Content-Type': 'application/json',
  };
  const data = {
    inputs: [
      {
        data: {
          image: { base64: base64Image }
        }
      }
    ]
  };
  try {
    const response = await axios.post(CLARIFAI_API_URL, data, { headers });
    const concepts = response.data.outputs[0].data.concepts;
    // concepts: [{ id, name, value }, ...]
    return concepts.map(c => ({ name: c.name, value: c.value }));
  } catch (err) {
    throw new Error('Erreur lors de l\'analyse de l\'image Clarifai');
  }
}

// Table de correspondance simplifiée pour estimation calorique
const CALORIE_DB = {
  pizza: 300,
  apple: 80,
  salad: 150,
  burger: 500,
  sandwich: 350,
  pasta: 400,
  rice: 200,
  chicken: 250,
  soup: 120,
  steak: 400,
  fries: 350,
  egg: 90,
  cheese: 110,
  bread: 90,
  yogurt: 100,
  sushi: 200,
  // Ajouter d'autres plats courants si besoin
};

/**
 * Estime les calories à partir des concepts Clarifai
 * @param {Array<{name: string, value: number}>} concepts
 * @returns {{foodName: string, calories: number}}
 */
function estimateCalories(concepts) {
  if (!concepts || !concepts.length) {
    return { foodName: 'unknown', calories: 250 };
  }
  // Prend le concept le plus probable
  const main = concepts[0].name.toLowerCase();
  const calories = CALORIE_DB[main] || 250;
  return { foodName: main, calories };
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
  analyzeFoodImageUrl,
  estimateCalories,
};
