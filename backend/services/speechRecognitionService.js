/**
 * Service de reconnaissance vocale pour Livora UP
 * Utilise Google Cloud Speech-to-Text pour la transcription
 */
const { SpeechClient } = require('@google-cloud/speech');
const dotenv = require('dotenv');

dotenv.config();

// Initialiser le client Google Cloud Speech-to-Text
// La clé API est définie via la variable d'environnement GOOGLE_APPLICATION_CREDENTIALS
// qui pointe vers un fichier JSON contenant les identifiants de service
const speechClient = new SpeechClient();

/**
 * Convertit un audio base64 en texte
 * @param {string} audioBase64 - Le contenu audio encodé en base64
 * @param {Object} config - Configuration pour la reconnaissance vocale
 * @returns {Promise<string>} - Le texte transcrit
 */
async function recognizeSpeech(audioBase64, config = {}) {
  try {
    // Configuration par défaut
    const recognitionConfig = {
      encoding: 'LINEAR16',
      sampleRateHertz: 44100,
      languageCode: config.languageCode || 'fr-FR',
      model: config.model || 'command_and_search',
      useEnhanced: true,
    };
    
    // Convertir le base64 en un buffer d'octets
    const audioBytes = Buffer.from(audioBase64, 'base64');
    
    // Créer la requête
    const request = {
      audio: {
        content: audioBytes,
      },
      config: recognitionConfig,
    };
    
    // Appeler l'API Google Cloud Speech-to-Text
    const [response] = await speechClient.recognize(request);
    
    // Extraire la transcription
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join(' ');
    
    return transcription;
  } catch (error) {
    console.error('Erreur lors de la reconnaissance vocale:', error);
    throw new Error('Erreur lors de la transcription audio');
  }
}

/**
 * Alternative : utiliser un service REST API si Google Cloud n'est pas configuré
 * Nécessite une clé API pour le service choisi (Wit.ai, Azure, etc.)
 */
async function recognizeSpeechAlternative(audioBase64, config = {}) {
  try {
    // Exemple avec Microsoft Azure Speech Services
    // Vous pouvez adapter cela à d'autres services comme Wit.ai, etc.
    const axios = require('axios');
    
    const SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
    const SPEECH_REGION = process.env.AZURE_SPEECH_REGION || 'westeurope';
    
    if (!SPEECH_KEY) {
      throw new Error('Clé Azure Speech Services non configurée');
    }
    
    // Obtenir un token d'accès
    const tokenResponse = await axios.post(
      `https://${SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      null,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': SPEECH_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    
    const accessToken = tokenResponse.data;
    
    // Format audio (adapté selon votre format d'entrée)
    const audioContentType = 'audio/wav; codecs=audio/pcm; samplerate=44100';
    
    // Envoyer l'audio pour transcription
    const recognitionResponse = await axios.post(
      `https://${SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${config.languageCode || 'fr-FR'}`,
      Buffer.from(audioBase64, 'base64'),
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': audioContentType,
          'Accept': 'application/json',
        },
      }
    );
    
    return recognitionResponse.data.DisplayText || '';
    
  } catch (error) {
    console.error('Erreur lors de la reconnaissance vocale alternative:', error);
    throw error;
  }
}

module.exports = {
  recognizeSpeech,
  recognizeSpeechAlternative,
};
