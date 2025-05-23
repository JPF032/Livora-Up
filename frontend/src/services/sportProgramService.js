/**
 * Service de gestion des programmes sportifs pour Livora UP
 * Contient les fonctions pour générer et récupérer des programmes sportifs via l'API
 */
import { apiClient } from './apiClient';

// Utilisation directe de l'instance apiClient pré-initialisée

/**
 * Demande la génération d'un nouveau programme sportif au backend.
 * @param {object} userProfile - Profil de l'utilisateur (âge, objectifs, contraintes, etc.).
 * @returns {Promise<object>} Le programme sportif généré par l'IA.
 */
export const generateAISportProgram = async (userProfile) => {
  try {
    // Mise à jour du chemin pour correspondre à l'API actuelle
    const response = await apiClient.post('sport-programs/generate', { userProfile });
    return response;
  } catch (error) {
    console.error('Erreur lors de la génération du programme sportif IA:', error);
    throw error;
  }
};

/**
 * Récupère le programme sportif actuel de l'utilisateur.
 * @param {string} userId - ID de l'utilisateur (Firebase UID)
 * @returns {Promise<object|null>} Le programme sportif actuel ou null.
 */
export const getCurrentSportProgram = async (userId) => {
  try {
    // Mise à jour du chemin pour correspondre à l'API actuelle
    const response = await apiClient.get(`sport-programs/user/${userId}`);
    return response;
  } catch (error) {
    // Si le code est 404, on retourne null plutôt que de lancer une erreur
    if (error.message && error.message.includes('404')) {
      console.log('Aucun programme sportif actif trouvé pour cet utilisateur');
      return null;
    }
    console.error('Erreur lors de la récupération du programme sportif:', error);
    throw error;
  }
};

/**
 * Récupère un programme sportif spécifique par son ID
 * @param {string} programId - ID du programme sportif à récupérer
 * @returns {Promise<object>} Le programme sportif
 */
export const fetchSportProgram = async (programId) => {
  try {
    // Mise à jour du chemin pour correspondre à l'API actuelle
    const response = await apiClient.get(`sport-programs/${programId}`);
    return response;
  } catch (error) {
    console.error('[Récupération du programme sportif] Erreur:', error);
    throw error;
  }
};

/**
 * Valide la structure d'un programme sportif
 * @param {object} program - Le programme sportif à valider
 * @returns {boolean} - True si valide, sinon false
 */
export const validateSportProgram = (program) => {
  if (!program) return false;
  
  // Vérifier les propriétés obligatoires
  if (!program.name || !Array.isArray(program.sessions)) {
    return false;
  }
  
  // Vérifier chaque session
  for (const session of program.sessions) {
    if (!session.name || !Array.isArray(session.exercises)) {
      return false;
    }
    
    // Vérifier chaque exercice
    for (const exercise of session.exercises) {
      if (!exercise.name || !exercise.sets || !exercise.reps) {
        return false;
      }
    }
  }
  
  return true;
};
