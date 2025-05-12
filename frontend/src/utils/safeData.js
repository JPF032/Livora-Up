/**
 * Utilitaires pour manipuler les données de manière sécurisée
 * et éviter les erreurs de type "Cannot read property of undefined"
 */

/**
 * Accède en toute sécurité à une propriété d'un objet potentiellement undefined
 * Alternative à l'optional chaining pour les versions plus anciennes de JS
 * 
 * @param {Object} obj - L'objet à accéder
 * @param {string} path - Le chemin d'accès (ex: "user.profile.name")
 * @param {any} defaultValue - Valeur par défaut si le chemin n'existe pas
 * @returns {any} - La valeur trouvée ou la valeur par défaut
 */
export const safeGet = (obj, path, defaultValue = undefined) => {
  if (!obj || !path) return defaultValue;

  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined || !Object.prototype.hasOwnProperty.call(result, key)) {
      return defaultValue;
    }
    result = result[key];
  }

  return result === undefined ? defaultValue : result;
};

/**
 * Vérifie si un objet a toutes les propriétés requises
 * 
 * @param {Object} obj - L'objet à vérifier
 * @param {Array<string>} requiredProps - Liste des propriétés requises
 * @returns {boolean} - True si toutes les propriétés sont présentes
 */
export const hasRequiredProps = (obj, requiredProps = []) => {
  if (!obj || !requiredProps.length) return false;
  
  return requiredProps.every(prop => {
    return obj[prop] !== undefined && obj[prop] !== null;
  });
};

/**
 * Crée un nouvel objet avec des valeurs par défaut pour les propriétés manquantes
 * 
 * @param {Object} obj - Objet source
 * @param {Object} defaults - Objet contenant les valeurs par défaut
 * @returns {Object} - Nouvel objet avec les valeurs par défaut appliquées
 */
export const withDefaults = (obj = {}, defaults = {}) => {
  return { ...defaults, ...obj };
};

/**
 * Valide un objet contre un schéma simple
 * 
 * @param {Object} obj - Objet à valider
 * @param {Object} schema - Schéma de validation {prop: {type: 'string', required: true}}
 * @returns {Object} - {isValid: boolean, errors: string[]}
 */
export const validateObject = (obj = {}, schema = {}) => {
  const errors = [];
  let isValid = true;
  
  Object.keys(schema).forEach(key => {
    const rule = schema[key];
    const value = obj[key];
    
    // Vérifier si la propriété est requise
    if (rule.required && (value === undefined || value === null)) {
      errors.push(`La propriété ${key} est requise`);
      isValid = false;
      return;
    }
    
    // Si la valeur est undefined ou null et n'est pas requise, ignorer les autres validations
    if ((value === undefined || value === null) && !rule.required) {
      return;
    }
    
    // Vérifier le type
    if (rule.type && typeof value !== rule.type) {
      errors.push(`La propriété ${key} doit être de type ${rule.type}`);
      isValid = false;
    }
    
    // Vérifier les validations personnalisées
    if (rule.validate && typeof rule.validate === 'function') {
      const isValidCustom = rule.validate(value);
      if (!isValidCustom) {
        errors.push(rule.message || `La propriété ${key} est invalide`);
        isValid = false;
      }
    }
  });
  
  return { isValid, errors };
};

/**
 * Applique une fonction à chaque élément d'un tableau, avec gestion des erreurs
 * 
 * @param {Array} array - Tableau à mapper
 * @param {Function} mapFn - Fonction de mapping
 * @param {any} defaultValue - Valeur par défaut si l'array est undefined
 * @returns {Array} - Nouveau tableau avec les résultats
 */
export const safeMap = (array, mapFn, defaultValue = []) => {
  if (!array || !Array.isArray(array)) return defaultValue;
  return array.map(mapFn);
};

/**
 * Convertit en toute sécurité une valeur en nombre
 * 
 * @param {any} value - Valeur à convertir
 * @param {number} defaultValue - Valeur par défaut si la conversion échoue
 * @returns {number} - La valeur convertie ou la valeur par défaut
 */
export const safeNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') return defaultValue;
  
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Convertit en toute sécurité une valeur en booléen
 * 
 * @param {any} value - Valeur à convertir
 * @param {boolean} defaultValue - Valeur par défaut si la conversion échoue
 * @returns {boolean} - La valeur convertie ou la valeur par défaut
 */
export const safeBoolean = (value, defaultValue = false) => {
  if (value === null || value === undefined) return defaultValue;
  
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  if (typeof value === 'number') return value !== 0;
  
  return defaultValue;
};
