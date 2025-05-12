/**
 * Configuration du thème pour Livora UP
 * Contient les couleurs, tailles et styles de texte utilisés dans l'application
 */

export const COLORS = {
  primary: '#4CAF50',         // Vert principal
  secondary: '#3498DB',       // Bleu secondaire
  accent: '#FF9800',          // Orange pour accent
  background: '#F8F8F8',      // Fond d'écran principal
  white: '#FFFFFF',
  black: '#000000',
  lightGray: '#F5F5F5',
  mediumGray: '#9E9E9E',
  darkGray: '#424242',
  error: '#F44336',           // Rouge pour les erreurs
  success: '#4CAF50',         // Vert pour les succès
  warning: '#FFC107',         // Jaune pour les avertissements
  info: '#2196F3',            // Bleu pour les infos
};

export const SIZES = {
  // Tailles standards
  base: 8,                     // Unité de base pour l'espacement
  small: 12,
  medium: 16,
  large: 18,
  xlarge: 24,
  xxlarge: 32,
  
  // Espacements
  padding: 16,
  margin: 16,
  radius: 10,                  // Rayon des bordures
  
  // Texte
  h1: 28,
  h2: 22,
  h3: 18,
  body1: 16,
  body2: 14,
  caption: 12,
};

export const FONTS = {
  // Styles de texte principaux
  h1: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    lineHeight: 36,
  },
  h2: {
    fontSize: SIZES.h2,
    fontWeight: '600',
    lineHeight: 30,
  },
  h3: {
    fontSize: SIZES.h3,
    fontWeight: '600',
    lineHeight: 24,
  },
  body1: {
    fontSize: SIZES.body1,
    fontWeight: 'normal',
    lineHeight: 22,
  },
  body2: {
    fontSize: SIZES.body2,
    fontWeight: 'normal',
    lineHeight: 20,
  },
  caption: {
    fontSize: SIZES.caption,
    fontWeight: 'normal',
    lineHeight: 18,
  },
  button: {
    fontSize: SIZES.body1,
    fontWeight: '600',
    lineHeight: 22,
  },
};

// Styles partagés pour les composants courants
export const SHARED_STYLES = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SIZES.margin / 2,
  },
  buttonText: {
    ...FONTS.button,
    color: COLORS.white,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    marginBottom: SIZES.margin,
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    marginBottom: SIZES.margin / 2,
  },
};

export default {
  COLORS,
  SIZES,
  FONTS,
  SHARED_STYLES,
};
