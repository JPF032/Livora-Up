/**
 * Thème de base pour l'hiver
 * Palette inspirée des couleurs fraîches et élégantes de l'hiver
 * Tons bleus clairs, gris argentés, blanc neige
 */

export const winterTheme = {
  id: 'winter',
  name: 'Hiver',
  
  // Couleurs principales
  colors: {
    // Fond principal (blanc neige)
    background: {
      base: '#F0F5F9',
      min: '#E1E8EE',  // Version plus sombre
      max: '#FFFFFF',  // Version plus claire
    },
    
    // Surface (pour les cartes, éléments d'interface)
    surface: {
      base: '#FFFFFF',
      min: '#F2F6FA',
      max: '#FFFFFF',
    },
    
    // Couleur primaire (bleu glacier)
    primary: {
      base: '#C9D6DF',
      min: '#AEBBC4',  // Version désaturée
      max: '#D9E6EF',  // Version plus vive
    },
    
    // Couleur d'accentuation (cuivre clair)
    accent: {
      base: '#E4A787',
      min: '#C89678',  // Version désaturée
      max: '#F5B898',  // Version plus vive
    },
    
    // Texte principal (gris bleuté foncé)
    text: {
      base: '#2E3A48',
      min: '#1E2834',  // Plus foncé pour contraste élevé
      max: '#4A5764',  // Plus clair pour contraste faible
    },
    
    // Texte sur couleur primaire (blanc)
    textOnPrimary: {
      base: '#FFFFFF',
      min: '#E6E6E6',
      max: '#FFFFFF',
    },
    
    // Bordures et séparateurs
    border: {
      base: '#D6DEE6',
      min: '#BBC5CF',
      max: '#E8EFF5',
    },
    
    // Couleur de statut - succès
    success: {
      base: '#83B1A3',
      min: '#729988',
      max: '#97C9B9',
    },
    
    // Couleur de statut - erreur
    error: {
      base: '#E07A5F',
      min: '#C66950',
      max: '#F78B6F',
    },
    
    // Couleur de statut - information
    info: {
      base: '#8AA4BF',
      min: '#778EA6',
      max: '#9DBAD8',
    },
    
    // Couleur de statut - avertissement
    warning: {
      base: '#E4C286',
      min: '#CAAA73',
      max: '#F8D699',
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
      base: 8,
      min: 2,   // Angulaire
      max: 16,  // Arrondi
    },
    
    // Rayon des boutons
    buttonBorderRadius: {
      base: 6,
      min: 0,   // Carré
      max: 16,  // Arrondi
    },
    
    // Rayon des champs de saisie
    inputBorderRadius: {
      base: 6,
      min: 0,
      max: 12,
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
      base: 3,
      min: 1,
      max: 6,
    },
    
    // Couleur de l'ombre
    shadowColor: {
      base: 'rgba(46, 58, 72, 0.18)',
      min: 'rgba(46, 58, 72, 0.08)',
      max: 'rgba(46, 58, 72, 0.25)',
    },
    
    // Rayon de l'ombre
    shadowRadius: {
      base: 10,
      min: 5,
      max: 18,
    },
    
    // Décalage vertical de l'ombre
    shadowOffset: {
      base: { height: 2, width: 0 },
      min: { height: 1, width: 0 },
      max: { height: 4, width: 0 },
    },
    
    // Opacité de l'ombre
    shadowOpacity: {
      base: 0.15,
      min: 0.08,
      max: 0.25,
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
      base: 250,
      min: 120,
      max: 400,
    },
    
    // Timing function
    easing: {
      base: 'cubic-bezier(0.4, 0, 0.2, 1)',
      min: 'ease-in',
      max: 'ease-out',
    },
  },
  
  // Constantes spécifiques au thème d'hiver
  assets: {
    // Chemin vers les illustrations spécifiques au thème
    illustrations: {
      // Note: Ces lignes sont commentées jusqu'à ce que les images réelles soient disponibles
      // background: require('../../../assets/images/winter-bg.png'),
      // headerDecoration: require('../../../assets/images/winter-decoration.png'),
      background: null,
      headerDecoration: null,
    },
    
    // Motifs ou éléments graphiques spécifiques
    patterns: {
      // light: require('../../../assets/patterns/winter-light.png'),
      // dark: require('../../../assets/patterns/winter-dark.png'),
      light: null,
      dark: null,
    }
  }
};
