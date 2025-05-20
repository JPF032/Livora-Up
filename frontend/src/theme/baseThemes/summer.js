/**
 * Thème de base pour l'été
 * Palette inspirée des couleurs douces et naturelles de l'été
 * Tons vert d'eau, beige doré, crème
 */

export const summerTheme = {
  id: 'summer',
  name: 'Été',
  
  // Couleurs principales
  colors: {
    // Fond principal (crème chaud)
    background: {
      base: '#F9F5EC',
      min: '#E8E4DB',  // Version plus sombre
      max: '#FFFDF5',  // Version plus claire
    },
    
    // Surface (pour les cartes, éléments d'interface)
    surface: {
      base: '#FFFFFF',
      min: '#F2F2F2',
      max: '#FFFFFF',
    },
    
    // Couleur primaire (vert d'eau)
    primary: {
      base: '#A8C5C8',
      min: '#91AAAD',  // Version désaturée
      max: '#B5DEE2',  // Version plus vive
    },
    
    // Couleur d'accentuation (sable doré)
    accent: {
      base: '#F2D28D',
      min: '#DDBD7D',  // Version désaturée
      max: '#FFE39A',  // Version plus vive
    },
    
    // Texte principal (vert olive foncé)
    text: {
      base: '#6B705C',
      min: '#545845',  // Plus foncé pour contraste élevé
      max: '#828872',  // Plus clair pour contraste faible
    },
    
    // Texte sur couleur primaire (blanc)
    textOnPrimary: {
      base: '#FFFFFF',
      min: '#E6E6E6',
      max: '#FFFFFF',
    },
    
    // Bordures et séparateurs
    border: {
      base: '#D5D7B9',
      min: '#BEC0A6',
      max: '#E8EACC',
    },
    
    // Couleur de statut - succès
    success: {
      base: '#A3C9A8',
      min: '#8DAD92',
      max: '#B9E5BF',
    },
    
    // Couleur de statut - erreur
    error: {
      base: '#E07A5F',
      min: '#C66950',
      max: '#F78B6F',
    },
    
    // Couleur de statut - information
    info: {
      base: '#81B29A',
      min: '#6E9884',
      max: '#94CCB0',
    },
    
    // Couleur de statut - avertissement
    warning: {
      base: '#F2CC8F',
      min: '#DDB77D',
      max: '#FFDEAA',
    },
  },
  
  // Typographie
  typography: {
    // Famille de police principale
    fontFamily: {
      base: 'Helvetica Neue, System',
      min: 'Helvetica Neue, System',
      max: 'Helvetica Neue, System',
    },
    
    // Taille de police de base
    fontSize: {
      base: 16,
      min: 14,
      max: 20,
    },
    
    // Taille des titres
    headingSize: {
      base: 24,
      min: 20,
      max: 32,
    },
    
    // Poids de police normal
    fontWeight: {
      base: '400',
      min: '300',
      max: '500',
    },
    
    // Poids de police pour les titres
    headingWeight: {
      base: '600',
      min: '500',
      max: '700',
    },
    
    // Interlignage
    lineHeight: {
      base: 1.5,
      min: 1.3,
      max: 1.8,
    },
  },
  
  // Formes et coins
  shape: {
    // Rayon des cartes
    cardBorderRadius: {
      base: 12,
      min: 4,   // Angulaire
      max: 24,  // Très arrondi
    },
    
    // Rayon des boutons
    buttonBorderRadius: {
      base: 8,
      min: 2,   // Angulaire
      max: 20,  // Très arrondi (presque pilule)
    },
    
    // Rayon des champs de saisie
    inputBorderRadius: {
      base: 8,
      min: 2,
      max: 16,
    },
    
    // Épaisseur des bordures
    borderWidth: {
      base: 1,
      min: 0,
      max: 2,
    },
  },
  
  // Ombres et élévation
  shadows: {
    // Élévation des cartes
    elevation: {
      base: 2,
      min: 0,
      max: 5,
    },
    
    // Couleur de l'ombre
    shadowColor: {
      base: 'rgba(107, 112, 92, 0.15)',
      min: 'rgba(107, 112, 92, 0.05)',
      max: 'rgba(107, 112, 92, 0.25)',
    },
    
    // Rayon de l'ombre
    shadowRadius: {
      base: 8,
      min: 4,
      max: 16,
    },
    
    // Décalage vertical de l'ombre
    shadowOffset: {
      base: { height: 2, width: 0 },
      min: { height: 1, width: 0 },
      max: { height: 4, width: 0 },
    },
    
    // Opacité de l'ombre
    shadowOpacity: {
      base: 0.1,
      min: 0.05,
      max: 0.2,
    },
  },
  
  // Espacement
  spacing: {
    // Espacement de base (utilisé comme unité multipliée)
    base: {
      base: 8,
      min: 6,
      max: 10,
    },
    
    // Densité (facteur multiplicateur pour l'espacement)
    density: {
      base: 1,
      min: 0.8,  // Plus compact
      max: 1.25, // Plus spacieux
    },
    
    // Espacement entre les éléments
    gap: {
      base: 16,
      min: 8,
      max: 24,
    },
    
    // Marge intérieure des conteneurs
    containerPadding: {
      base: 16,
      min: 8,
      max: 24,
    },
    
    // Marge intérieure des boutons
    buttonPadding: {
      base: { vertical: 12, horizontal: 16 },
      min: { vertical: 8, horizontal: 12 },
      max: { vertical: 16, horizontal: 24 },
    },
  },
  
  // Animations et transitions
  animation: {
    // Durée des transitions
    duration: {
      base: 300,
      min: 150,
      max: 500,
    },
    
    // Timing function
    easing: {
      base: 'cubic-bezier(0.4, 0, 0.2, 1)',
      min: 'ease-in',
      max: 'ease-out',
    },
  },
  
  // Constantes spécifiques au thème d'été
  assets: {
    // Chemin vers les illustrations spécifiques au thème
    illustrations: {
      // Note: Ces lignes sont commentées jusqu'à ce que les images réelles soient disponibles
      // background: require('../../../assets/images/summer-bg.png'),
      // headerDecoration: require('../../../assets/images/summer-decoration.png'),
      background: null,
      headerDecoration: null,
    },
    
    // Motifs ou éléments graphiques spécifiques
    patterns: {
      // light: require('../../../assets/patterns/summer-light.png'),
      // dark: require('../../../assets/patterns/summer-dark.png'),
      light: null,
      dark: null,
    }
  }
};
