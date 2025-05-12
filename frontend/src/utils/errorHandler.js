/**
 * Gestionnaire d'erreurs centralisé pour Livora UP
 * Standardise la gestion et l'affichage des erreurs dans l'application
 */
import { Alert, Platform } from 'react-native';

/**
 * Types d'erreurs possibles dans l'application
 */
export const ErrorTypes = {
  NETWORK: 'network',
  AUTH: 'auth',
  API: 'api',
  DATA: 'data',
  ASSET: 'asset',
  PERMISSION: 'permission',
  VALIDATION: 'validation',
  UNKNOWN: 'unknown',
};

/**
 * Fonction principale de gestion des erreurs
 * @param {Error} error - L'erreur à traiter
 * @param {string} context - Contexte dans lequel l'erreur s'est produite
 * @param {boolean} showAlert - Si true, affiche une alerte à l'utilisateur
 * @returns {Object} - Objet contenant le type d'erreur et un message utilisateur
 */
export const handleError = (error, context = '', showAlert = false) => {
  // Journalisation de l'erreur avec son contexte
  console.error(`[${context}] Erreur:`, error);
  
  let errorInfo = {
    type: ErrorTypes.UNKNOWN,
    message: 'Une erreur inattendue est survenue.',
    technicalMessage: error.message || 'Erreur sans message',
    originalError: error,
  };
  
  // Déterminer le type d'erreur et générer un message adapté
  if (error.message && typeof error.message === 'string') {
    if (error.message.includes('Network request failed')) {
      errorInfo = {
        ...errorInfo,
        type: ErrorTypes.NETWORK,
        message: 'Problème de connexion réseau. Vérifiez votre connexion internet et réessayez.',
      };
    } else if (error.message.includes('permission')) {
      errorInfo = {
        ...errorInfo,
        type: ErrorTypes.PERMISSION,
        message: 'Livora UP n\'a pas les permissions nécessaires pour cette action.',
      };
    } else if (error.message.includes('Cannot read property') || error.message.includes('undefined')) {
      errorInfo = {
        ...errorInfo,
        type: ErrorTypes.DATA,
        message: 'Données incomplètes ou invalides reçues.',
      };
    } else if (error.message.includes('auth') || error.message.includes('Authentication')) {
      errorInfo = {
        ...errorInfo,
        type: ErrorTypes.AUTH,
        message: 'Vous devez être connecté pour effectuer cette action.',
      };
    } else if (error.message.includes('load') && error.message.includes('asset')) {
      errorInfo = {
        ...errorInfo,
        type: ErrorTypes.ASSET,
        message: 'Impossible de charger les ressources nécessaires.',
      };
    }
  }
  
  // Vérifier les codes d'état HTTP
  if (error.status === 401 || error.response?.status === 401) {
    errorInfo = {
      ...errorInfo,
      type: ErrorTypes.AUTH,
      message: 'Votre session a expiré. Veuillez vous reconnecter.',
    };
  } else if (error.status === 403 || error.response?.status === 403) {
    errorInfo = {
      ...errorInfo,
      type: ErrorTypes.AUTH,
      message: 'Vous n\'avez pas les droits pour effectuer cette action.',
    };
  } else if (error.status === 404 || error.response?.status === 404) {
    errorInfo = {
      ...errorInfo,
      type: ErrorTypes.API,
      message: 'La ressource demandée n\'existe pas.',
    };
  } else if (error.status >= 500 || error.response?.status >= 500) {
    errorInfo = {
      ...errorInfo,
      type: ErrorTypes.API,
      message: 'Le serveur a rencontré un problème. Veuillez réessayer plus tard.',
    };
  }
  
  // Afficher une alerte si demandé
  if (showAlert) {
    Alert.alert(
      'Erreur',
      errorInfo.message,
      [{ text: 'OK' }],
      { cancelable: true }
    );
  }
  
  return errorInfo;
};

/**
 * Utilitaire pour charger des ressources de manière sécurisée
 * @param {Function} loadFunction - Fonction de chargement à exécuter
 * @param {string} resourceName - Nom de la ressource pour le log
 * @param {Function} onError - Callback en cas d'erreur
 * @returns {Promise<any>} - La ressource chargée ou null en cas d'erreur
 */
export const loadResourceSafely = async (loadFunction, resourceName, onError) => {
  try {
    const result = await loadFunction();
    return result;
  } catch (error) {
    const errorInfo = handleError(error, `Chargement de ${resourceName}`);
    if (onError) onError(errorInfo);
    return null;
  }
};

/**
 * Utilitaire pour exécuter une opération de manière sécurisée
 * @param {Function} operation - Fonction à exécuter
 * @param {string} operationName - Nom de l'opération pour le log
 * @param {Function} onError - Callback en cas d'erreur
 * @param {boolean} showAlert - Si true, affiche une alerte en cas d'erreur
 * @returns {Promise<any>} - Le résultat de l'opération ou null en cas d'erreur
 */
export const executeWithErrorHandling = async (operation, operationName, onError, showAlert = false) => {
  try {
    return await operation();
  } catch (error) {
    const errorInfo = handleError(error, operationName, showAlert);
    if (onError) onError(errorInfo);
    return null;
  }
};

/**
 * Utilitaire pour analyser les données et éviter les erreurs "Cannot read property of undefined"
 * @param {any} data - Les données à valider
 * @param {Array<string>} requiredProps - Liste des propriétés requises
 * @param {string} context - Contexte pour le log
 * @returns {boolean} - true si les données sont valides
 */
export const validateDataSafely = (data, requiredProps = [], context = '') => {
  if (!data) {
    console.warn(`[${context}] Données absentes ou invalides`);
    return false;
  }
  
  let isValid = true;
  
  for (const prop of requiredProps) {
    // Gestion des propriétés imbriquées avec notation pointée
    if (prop.includes('.')) {
      const parts = prop.split('.');
      let current = data;
      
      for (const part of parts) {
        if (current === undefined || current === null) {
          console.warn(`[${context}] Propriété imbriquée manquante: ${prop}`);
          isValid = false;
          break;
        }
        current = current[part];
      }
    } else if (data[prop] === undefined || data[prop] === null) {
      console.warn(`[${context}] Propriété manquante: ${prop}`);
      isValid = false;
    }
  }
  
  return isValid;
};
