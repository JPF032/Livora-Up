/**
 * Hook pour gérer les programmes sportifs avec IA
 * Permet de créer, récupérer et optimiser des programmes sportifs via l'API
 */
import { useState } from 'react';
import { Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { apiClient } from '../services/apiClient';
import { handleError } from '../utils/errorHandler';

/**
 * Hook personnalisé pour interagir avec l'API de programmes sportifs IA
 * @returns {Object} Fonctions et états pour manipuler les programmes sportifs
 */
export const useAISportProgram = () => {
  const [loading, setLoading] = useState(false);
  const [program, setProgram] = useState(null);
  const [error, setError] = useState(null);
  
  const auth = getAuth();
  
  /**
   * Récupérer le programme sportif actif de l'utilisateur
   * @returns {Promise<Object|null>} Programme sportif récupéré
   */
  const fetchProgram = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('programs/sport');
      
      if (response && response.data) {
        setProgram(response.data);
        return response.data;
      }
      
      return null;
    } catch (error) {
      // Si le statut est 404, c'est normal (pas encore de programme)
      if (error.status === 404) {
        setProgram(null);
        return null;
      }
      
      // Sinon c'est une erreur
      const errorInfo = handleError(error, 'Récupération du programme sportif', false);
      setError(errorInfo.message);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Générer un nouveau programme sportif (avec ou sans IA)
   * @param {Object} options - Options pour la génération
   * @param {string} options.level - Niveau de l'utilisateur (debutant, intermediaire, avance)
   * @param {string} options.goal - Objectif (perte_poids, prise_muscle, etc.)
   * @param {number} options.daysPerWeek - Nombre de jours d'entraînement (3 ou 5)
   * @param {boolean} options.useAI - Utiliser l'IA pour la génération
   * @param {Object} options.preferences - Préférences utilisateur (cardio, équipement, etc.)
   * @returns {Promise<Object|null>} Nouveau programme généré
   */
  const generateProgram = async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Options par défaut
      const defaultOptions = {
        level: 'debutant',
        goal: 'general',
        daysPerWeek: 3,
        useAI: true,
        preferences: {
          cardioPreference: 'medium',
          equipmentAvailable: ['none'],
          focusAreas: []
        },
        regenerate: true
      };
      
      // Fusionner les options par défaut avec celles fournies
      const fullOptions = { ...defaultOptions, ...options };
      
      // Utilisation d'apiClient pour gérer les erreurs réseau
      const response = await apiClient.post('programs/sport', fullOptions);
      
      if (response && response.data) {
        setProgram(response.data);
        return response.data;
      }
      
      return null;
    } catch (error) {
      const errorInfo = handleError(error, 'Génération du programme sportif', true);
      setError(errorInfo.message);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Optimiser un programme sportif existant avec l'IA
   * @param {Object} options - Options pour l'optimisation
   * @param {string} options.programId - ID du programme à optimiser (optionnel)
   * @param {Object} options.preferences - Préférences utilisateur pour l'optimisation
   * @returns {Promise<Object|null>} Programme optimisé
   */
  const optimizeProgram = async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Si pas de programme et pas d'ID fourni, erreur
      if (!program && !options.programId) {
        Alert.alert(
          'Erreur',
          'Aucun programme sportif à optimiser. Veuillez d\'abord générer un programme.'
        );
        return null;
      }
      
      // Création des options pour l'API
      const apiOptions = {
        programId: options.programId || (program ? program._id : null),
        preferences: options.preferences || {}
      };
      
      // Appel API
      const response = await apiClient.post('programs/sport/optimize', apiOptions);
      
      if (response && response.data) {
        setProgram(response.data);
        return response.data;
      }
      
      return null;
    } catch (error) {
      const errorInfo = handleError(error, 'Optimisation du programme sportif', true);
      setError(errorInfo.message);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    program,
    error,
    fetchProgram,
    generateProgram,
    optimizeProgram,
    setProgram
  };
};
