/**
 * Service API pour Livora UP
 * Gère les communications entre le frontend et le backend
 * Version compatible Expo
 */
import { getAuth } from 'firebase/auth';
import Constants from 'expo-constants';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import { handleError, ErrorTypes } from '../utils/errorHandler';

// Déterminer automatiquement l'URL API en fonction de la plateforme et de l'environnement
const getApiUrl = () => {
  // Priorité 1: URL configurée dans l'environnement Expo
  if (Constants.expoConfig?.extra?.apiUrl) {
    return Constants.expoConfig.extra.apiUrl;
  }
  
  // Priorité 2: Variables d'environnement (si disponibles)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Priorité 3: URL par défaut selon la plateforme en développement
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000'; // Émulateur Android
    } else if (Platform.OS === 'ios') {
      return 'http://localhost:3000'; // Simulateur iOS
    }
  }
  
  // Fallback pour la production
  return 'https://api.livora-up.com';
};

// L'URL de base du serveur backend (configurée de manière optimale)
const API_URL = getApiUrl();

// Journaliser l'URL utilisée (en développement uniquement)
if (__DEV__) {
  console.log(`API URL configurée: ${API_URL}`);
}

/**
 * Vérifie la connectivité réseau de l'appareil
 * @returns {Promise<boolean>} - True si l'appareil est connecté à Internet
 */
export const checkNetworkConnectivity = async () => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable;
  } catch (error) {
    console.error('Erreur lors de la vérification de la connectivité:', error);
    return false;
  }
};

/**
 * Vérifie la connectivité avec l'API backend
 * @returns {Promise<boolean>} - True si l'API est accessible
 */
export const checkApiConnection = async () => {
  try {
    // Vérifier d'abord la connectivité réseau générale
    const isNetworkAvailable = await checkNetworkConnectivity();
    if (!isNetworkAvailable) return false;
    
    // Essayer d'accéder à l'endpoint de santé de l'API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 secondes
    
    const response = await fetch(`${API_URL}/health`, { 
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    // Gérer spécifiquement l'erreur d'abandon
    if (error.name === 'AbortError') {
      console.warn('Vérification de l\'API abandonnée après délai d\'attente');
    } else {
      console.error('Erreur lors de la vérification de l\'API:', error);
    }
    return false;
  }
};

/**
 * Obtient le token d'authentification Firebase de l'utilisateur actuel
 * @returns {Promise<string>} - Le token Firebase ou null si non authentifié
 */
export const getFirebaseToken = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.warn('Tentative de récupération de token sans utilisateur connecté');
      return null;
    }
    
    // En mode développement, on peut utiliser un token special pour contourner l'authentification
    if (__DEV__ && Constants.expoConfig?.extra?.useMockToken) {
      return 'dev-mock-token-for-testing';
    }
    
    // Récupère un token JWT Firebase frais
    const token = await user.getIdToken(true);
    return token;
  } catch (error) {
    // Utiliser notre gestionnaire d'erreurs centralisé
    const formattedError = handleError(error, `API getFirebaseToken`, false);
    
    // Gérer spécifiquement les différents types d'erreurs réseau
    if (error.name === 'AbortError') {
      const timeoutError = new Error('La requête a expiré. Veuillez réessayer ultérieurement.');
      timeoutError.type = ErrorTypes.NETWORK;
      throw timeoutError;
    } else if (error.message.includes('Network request failed')) {
      const networkError = new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
      networkError.type = ErrorTypes.NETWORK;
      throw networkError;
    } else {
      // Rethrow l'erreur déjà traitée par handleError
      throw formattedError.originalError || error;
    }
  }
};

/**
 * Fonction utilitaire pour effectuer des requêtes HTTP avec authentification Firebase
 * @param {string} endpoint - Endpoint de l'API sans le slash initial
 * @param {string} method - Méthode HTTP (GET, POST, PUT, DELETE)
 * @param {Object} data - Données à envoyer pour POST/PUT
 * @param {string} token - Token d'authentification Firebase (optionnel, sera récupéré si non fourni)
 * @returns {Promise} - Promise avec la réponse
 */
const fetchApi = async (endpoint, method = 'GET', data = null, token = null) => {
  // Déterminer l'URL complète - ajouter le préfixe /api/ pour les endpoints qui ne commencent pas par health
  const baseEndpoint = endpoint.startsWith('health') ? endpoint : `api/${endpoint}`;
  const url = `${API_URL}/${baseEndpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // Si aucun token n'est fourni, essayer de récupérer le token Firebase
  if (!token) {
    try {
      token = await getFirebaseToken();
    } catch (error) {
      console.warn('Impossible de récupérer le token Firebase pour la requête API');
    }
  }
  
  // Ajouter le token d'authentification si disponible
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers,
  };
  
  // Ajouter le corps de la requête si c'est un POST ou PUT
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }
  
  try {
    // Vérifier la connectivité réseau avant la requête
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      const error = new Error('Aucune connexion Internet disponible');
      error.type = ErrorTypes.NETWORK;
      throw error;
    }
    
    // Ajouter un timeout pour éviter les attentes infinies
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes de timeout
    options.signal = controller.signal;
    
    // Ajouter une journalisation en développement
    if (__DEV__) {
      console.log(`API Request: ${method} ${url}`, data ? { data } : '');
    }
    
    const response = await fetch(url, options);
    clearTimeout(timeoutId);
    
    // Vérifier explicitement le code de statut HTTP
    if (!response.ok) {
      // Essayer d'extraire un message d'erreur JSON si disponible
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorData = {};
      
      try {
        errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (jsonError) {
        // Ignorer les erreurs de parsing JSON pour les réponses non-JSON
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = errorData;
      error.type = response.status === 401 || response.status === 403 
        ? ErrorTypes.AUTH 
        : response.status >= 500 
          ? ErrorTypes.API 
          : ErrorTypes.UNKNOWN;
      
      throw error;
    }
    
    // Vérifier si la réponse est au format JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const responseData = await response.json();
      
      // Si le statut n'est pas 2xx, lancer une erreur
      if (!response.ok) {
        throw {
          status: response.status,
          message: responseData.message || 'Une erreur est survenue',
          data: responseData,
        };
      }
      
      return responseData;
    } else {
      // Si la réponse n'est pas JSON
      if (!response.ok) {
        throw {
          status: response.status,
          message: 'Une erreur est survenue',
        };
      }
      
      return await response.text();
    }
  } catch (error) {
    // Gérer les erreurs réseau ou les erreurs de l'API
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Services API par catégorie
 */
export const api = {
  // Vérification de la santé du serveur
  health: {
    check: () => fetchApi('health'),
  },
  
  // Services liés au profil utilisateur
  user: {
    // Récupère automatiquement le token Firebase si non fourni
    getProfile: (token = null) => fetchApi('profile', 'GET', null, token),
    updateProfile: (data, token = null) => fetchApi('profile', 'PUT', data, token),
  },
  
  // Services liés au programme sportif
  sport: {
    // Récupérer le programme sportif de l'utilisateur
    getProgram: (token = null) => fetchApi('programs/sport', 'GET', null, token),
    
    // Créer ou régénérer un programme sportif
    createProgram: (data, token = null) => fetchApi('programs/sport', 'POST', data, token),
    
    // Mettre à jour l'ensemble du programme sportif
    updateProgram: (data, token = null) => fetchApi('programs/sport', 'PUT', data, token),
    
    // Mettre à jour le statut d'un exercice spécifique (complété ou non)
    updateExerciseStatus: (exerciseId, data, token = null) => 
      fetchApi(`programs/sport/exercise/${exerciseId}`, 'PUT', data, token),
    
    // Enregistrer un entraînement terminé
    trackWorkout: (data, token = null) => fetchApi('programs/sport/track', 'POST', data, token),
  },
  
  // Services liés au programme nutritionnel
  nutrition: {
    getProgram: (token = null) => fetchApi('nutrition-programs', 'GET', null, token),
    trackMeal: (data, token = null) => fetchApi('nutrition-programs/track', 'POST', data, token),
    
    // Nouvelles fonctionnalités d'analyse alimentaire et gestion des repas
    getSimplePlan: (token = null) => fetchApi('nutrition-programs/simple', 'GET', null, token),
    upsertSimplePlan: (data, token = null) => fetchApi('nutrition-programs/simple', 'POST', data, token),
    
    // Service d'analyse d'image pour estimation calorique
    analyzeImage: (base64Image, token = null) => 
      fetchApi('nutrition-programs/analyze', 'POST', { image: base64Image }, token),
    
    // Ajouter une entrée de repas après analyse
    addMealEntry: (data, token = null) => 
      fetchApi('nutrition-programs/entries', 'POST', data, token),
    
    // Récupérer les entrées de repas
    getMealEntries: (date = null, token = null) => {
      const query = date ? `?date=${date}` : '';
      return fetchApi(`nutrition-programs/entries${query}`, 'GET', null, token);
    },
  },
};

export default api;
