/**
 * Utilitaire pour le chargement sécurisé des ressources dans Livora UP
 */
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import * as Audio from 'expo-audio';
import { handleError, ErrorTypes } from './errorHandler';

/**
 * Précharge un ensemble de ressources images
 * @param {Array} images - Tableau de ressources images à précharger
 * @returns {Promise<Array>} - Résultats du chargement
 */
export const preloadImages = async (images = []) => {
  try {
    return await Asset.loadAsync(images);
  } catch (error) {
    handleError(error, 'Préchargement des images');
    return [];
  }
};

/**
 * Précharge les polices de l'application
 * @param {Object} fonts - Objet contenant les polices à charger
 * @returns {Promise<boolean>} - true si le chargement a réussi
 */
export const preloadFonts = async (fonts = {}) => {
  try {
    await Font.loadAsync(fonts);
    return true;
  } catch (error) {
    handleError(error, 'Préchargement des polices');
    return false;
  }
};

/**
 * Charge un fichier audio de manière sécurisée
 * @param {any} source - Source du fichier audio
 * @returns {Promise<Object>} - Objet contenant le son et une fonction de nettoyage
 */
export const loadSound = async (source) => {
  try {
    // Si la source est null ou undefined, retourner un objet vide
    if (!source) {
      return { sound: null, cleanup: () => {} };
    }
    
    const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: false });
    
    // Fonction de nettoyage
    const cleanup = async () => {
      if (sound) {
        try {
          await sound.unloadAsync();
        } catch (e) {
          console.log('Erreur lors du déchargement du son', e);
        }
      }
    };
    
    return { sound, cleanup };
  } catch (error) {
    handleError(error, 'Chargement audio');
    return { sound: null, cleanup: () => {} };
  }
};

/**
 * Joue un son de manière sécurisée
 * @param {Audio.Sound} sound - Objet son à jouer
 * @returns {Promise<void>}
 */
export const playSound = async (sound) => {
  if (!sound) return;
  
  try {
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      await sound.setPositionAsync(0);
      await sound.playAsync();
    }
  } catch (error) {
    console.log('Erreur lors de la lecture du son:', error);
  }
};

/**
 * Précharge toutes les ressources de l'application
 * @param {Object} assets - Objet contenant toutes les ressources à précharger
 * @returns {Promise<boolean>} - true si le chargement a réussi
 */
export const preloadAllAssets = async (assets = {}) => {
  try {
    const { images = [], fonts = {}, sounds = {} } = assets;
    
    // Préchargement parallèle des ressources
    const [imagesLoaded, fontsLoaded] = await Promise.all([
      preloadImages(images),
      preloadFonts(fonts),
    ]);
    
    // Préchargement des sons (optionnel)
    const soundObjects = {};
    for (const [key, source] of Object.entries(sounds)) {
      if (source) {
        const { sound } = await loadSound(source);
        soundObjects[key] = sound;
      }
    }
    
    return {
      success: true,
      images: imagesLoaded,
      fonts: fontsLoaded,
      sounds: soundObjects,
    };
  } catch (error) {
    handleError(error, 'Préchargement des ressources');
    return { success: false };
  }
};
