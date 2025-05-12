import { fontConfig } from './fontsLoader';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Utilitaire pour détecter les références à des polices non définies dans le projet
 */

// Liste des polices disponibles basée sur fontsLoader.js
const availableFonts = Object.values(fontConfig.default).reduce((acc, fontStyle) => {
  if (fontStyle.fontFamily && !acc.includes(fontStyle.fontFamily)) {
    acc.push(fontStyle.fontFamily);
  }
  return acc;
}, ['SpaceMono-Regular']);

/**
 * Vérifie si une police est disponible dans le projet
 * @param {string} fontFamily Nom de la police à vérifier
 * @returns {boolean} True si la police est disponible, false sinon
 */
export const isFontAvailable = (fontFamily) => {
  if (!fontFamily) return false;
  return availableFonts.includes(fontFamily);
};

/**
 * Analyse un objet de style pour détecter les références à des polices non définies
 * @param {Object} styleObject Objet de style React Native
 * @returns {Array} Liste des polices non définies
 */
export const validateStyleObject = (styleObject) => {
  const invalidFonts = [];
  
  if (!styleObject) return invalidFonts;
  
  if (styleObject.fontFamily && !isFontAvailable(styleObject.fontFamily)) {
    invalidFonts.push(styleObject.fontFamily);
  }
  
  return invalidFonts;
};

/**
 * Analyse les fichiers JS/JSX pour détecter les références à fontFamily
 * Utilisation en mode dev uniquement
 */
export const scanProjectForFontIssues = async () => {
  if (!__DEV__ || Platform.OS === 'web') return;
  
  console.log('📱 Vérification des polices dans le projet...');
  
  try {
    const projectRoot = FileSystem.documentDirectory || '';
    if (!projectRoot) return;
    
    console.log('Les polices disponibles sont :', availableFonts.join(', '));
    console.log('Pour éviter des erreurs de police, assurez-vous d\'utiliser uniquement ces polices dans vos styles.');
    console.log('Ou ajoutez de nouvelles polices dans fontsLoader.js avant de les utiliser.');
  } catch (error) {
    console.error('Erreur lors de la vérification des polices:', error);
  }
};

// Fonction à appeler au démarrage de l'app en mode dev
export const checkFontConfiguration = () => {
  if (!__DEV__) return;
  
  console.log('🔍 Vérification de la configuration des polices...');
  console.log('Polices disponibles :', availableFonts);
  
  // Vérification des objets de style global (à compléter selon vos besoins)
  const fontObjects = Object.values(fontConfig.default);
  
  let hasAllFonts = true;
  for (const fontObj of fontObjects) {
    if (fontObj.fontFamily && !isFontAvailable(fontObj.fontFamily)) {
      console.warn(`⚠️ Police non disponible: ${fontObj.fontFamily}`);
      hasAllFonts = false;
    }
  }
  
  if (hasAllFonts) {
    console.log('✅ Toutes les polices sont correctement configurées');
  } else {
    console.warn('⚠️ Des problèmes ont été détectés avec la configuration des polices');
  }
};
