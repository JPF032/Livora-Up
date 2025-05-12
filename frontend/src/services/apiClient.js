/**
 * Client API sécurisé pour Livora UP
 * Gère les communications entre l'application mobile et le backend
 * Utilise les variables d'environnement pour la configuration
 */
import { getFirebaseToken } from './api';
import { checkNetworkConnectivity } from './api';

// URL de base de l'API (utilise la variable d'environnement)
// En production, cette variable doit être définie dans app.json ou .env comme EXPO_PUBLIC_API_URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.livora-up.com';

/**
 * Client API avec gestion des erreurs et de l'authentification
 */
class ApiClient {
  /**
   * Effectue une requête API sécurisée
   * @param {string} endpoint - Chemin de l'endpoint (sans le /api/)
   * @param {string} method - Méthode HTTP (GET, POST, PUT, DELETE)
   * @param {Object} data - Données à envoyer (pour POST, PUT)
   * @param {Object} options - Options supplémentaires
   * @returns {Promise<any>} - Réponse de l'API
   */
  async request(endpoint, method = 'GET', data = null, options = {}) {
    try {
      // Vérifier la connectivité réseau
      const isConnected = await checkNetworkConnectivity();
      if (!isConnected) {
        throw new Error('Aucune connexion internet disponible');
      }

      // Récupérer le token Firebase pour l'authentification
      const token = await getFirebaseToken();

      // Préparer l'URL complète
      const url = `${API_BASE_URL}/api/${endpoint}`;

      // Préparer les headers avec authentification
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
      };

      // Configuration de la requête
      const config = {
        method,
        headers,
        ...(data && (method === 'POST' || method === 'PUT') 
          ? { body: JSON.stringify(data) } 
          : {})
      };

      // Ajouter un timeout pour éviter les requêtes infinies
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);
      config.signal = controller.signal;

      // Effectuer la requête
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Vérifier si la réponse est OK
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
      }

      // Traiter la réponse
      return await response.json();
    } catch (error) {
      // Formatter les erreurs de manière plus user-friendly
      if (error.name === 'AbortError') {
        throw new Error('La requête a mis trop de temps à s\'exécuter. Veuillez réessayer.');
      }
      
      console.error(`[API Error] ${endpoint}:`, error);
      throw error;
    }
  }

  // Méthodes pratiques pour différents types de requêtes
  async get(endpoint, options = {}) {
    return this.request(endpoint, 'GET', null, options);
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, 'POST', data, options);
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, 'PUT', data, options);
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, 'DELETE', null, options);
  }

  /**
   * Exemple d'utilisation pour l'analyse d'image alimentaire (utilise le proxy backend sécurisé)
   * @param {string} base64Image - Image encodée en base64 ou URL
   * @returns {Promise<Array>} - Liste des concepts détectés
   */
  async analyzeFood(base64Image) {
    // Utilise le endpoint proxy sécurisé du backend (pas d'exposition de clé Clarifai)
    return this.post('clarifai/predict', { base64Image });
  }

  /**
   * Exemple d'utilisation pour l'analyse d'image alimentaire par URL
   * @param {string} imageUrl - URL de l'image à analyser
   * @returns {Promise<Array>} - Liste des concepts détectés
   */
  async analyzeFoodByUrl(imageUrl) {
    // Utilise le endpoint proxy sécurisé du backend (pas d'exposition de clé)
    return this.post('clarifai/predict', { imageUrl });
  }

  /**
   * Obtenir le profil de l'utilisateur connecté
   * @returns {Promise<Object>} - Données du profil
   */
  async getUserProfile() {
    return this.get('profile');
  }

  /**
   * Obtenir le programme sportif de l'utilisateur
   * @returns {Promise<Object>} - Programme sportif
   */
  async getSportProgram() {
    return this.get('programs/sport');
  }

  /**
   * Créer ou régénérer un programme sportif
   * @param {Object} options - Préférences pour le programme
   * @param {boolean} options.useAI - Utiliser l'IA pour la génération
   * @returns {Promise<Object>} - Nouveau programme sportif
   */
  async createSportProgram(options) {
    return this.post('programs/sport', options);
  }
  
  /**
   * Optimiser un programme sportif existant avec l'IA
   * @param {Object} options - Options pour l'optimisation
   * @param {string} options.programId - ID du programme à optimiser (optionnel)
   * @param {Object} options.preferences - Préférences utilisateur pour l'optimisation
   * @returns {Promise<Object>} - Programme sportif optimisé
   */
  async optimizeSportProgram(options) {
    return this.post('programs/sport/optimize', options);
  }
}

// Exporter une instance singleton pour utilisation dans toute l'application
export const apiClient = new ApiClient();

// Exemple d'utilisation:
/*
import { apiClient } from '../services/apiClient';

// Dans votre composant ou hook:
const fetchUserProfile = async () => {
  try {
    const profile = await apiClient.getUserProfile();
    setUserData(profile);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    Alert.alert('Erreur', error.message);
  }
};

// Ou pour l'analyse alimentaire via Clarifai:
const analyzeImage = async (base64) => {
  try {
    const results = await apiClient.analyzeFood(base64);
    setFoodConcepts(results.concepts);
  } catch (error) {
    Alert.alert('Erreur d\'analyse', error.message);
  }
};
*/
