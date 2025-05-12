import * as Font from 'expo-font';

/**
 * Hook pour charger les polices personnalisées de l'application
 * @returns {[boolean, Error]} Tableau contenant l'état de chargement des polices et une éventuelle erreur
 */
export const useCustomFonts = () => {
  return Font.useFonts({
    'OpenSans-Regular': require('../../assets/fonts/OpenSans-Regular.ttf'),
    'OpenSans-Bold': require('../../assets/fonts/OpenSans-Bold.ttf'),
    'SpaceMono-Regular': require('../../assets/fonts/SpaceMono-Regular.ttf'),
  });
};

/**
 * Liste des polices disponibles dans l'application
 */
export const availableFonts = [
  'OpenSans-Regular',
  'OpenSans-Bold',
  'SpaceMono-Regular',
];

/**
 * Vérifie si une police est disponible
 * @param {string} fontFamily - Nom de la police à vérifier
 * @returns {boolean} - True si la police est disponible
 */
export const isFontAvailable = (fontFamily) => {
  if (!fontFamily) return false;
  return availableFonts.includes(fontFamily);
};
