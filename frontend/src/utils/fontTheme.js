/**
 * Fonction de mapping des polices qui fournit toujours un fallback valide
 * @param {boolean} loaded - Indique si les polices personnalisées sont chargées
 * @returns {Object} - Mapping de polices sécurisé pour le thème
 */
export const fontTheme = (loaded = false) => ({
  regular: {
    fontFamily: loaded ? 'OpenSans-Regular' : 'System',
    fontWeight: 'normal',
  },
  bold: {
    fontFamily: loaded ? 'OpenSans-Bold' : 'System',
    fontWeight: 'bold',
  },
});

/**
 * Styles de texte de base utilisant les polices configurées
 */
export const getBaseTextStyle = (loaded = false) => ({
  fontFamily: loaded ? 'OpenSans-Regular' : 'System',
});
