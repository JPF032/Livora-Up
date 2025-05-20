/**
 * Moteur de thème pour Livora UP
 * 
 * Transforme un thème de base en thème personnalisé selon les préférences utilisateur
 * Toutes les personnalisations sont limitées aux plages autorisées pour chaque token
 */

// Fonction utilitaire pour limiter une valeur à une plage donnée
const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

// Fonction utilitaire pour interpoler entre deux valeurs
const lerp = (min, max, t) => {
  return min + (max - min) * t;
};

// Fonction utilitaire pour modifier les couleurs (format hex)
const adjustColor = (hexColor, intensity, type = 'saturation') => {
  // Convertir hex en RGB
  let r = parseInt(hexColor.slice(1, 3), 16);
  let g = parseInt(hexColor.slice(3, 5), 16);
  let b = parseInt(hexColor.slice(5, 7), 16);
  
  // Convertir RGB en HSL pour faciliter les ajustements
  // Algorithme standard de conversion RGB -> HSL
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatique
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }
  
  // Appliquer l'ajustement en fonction du type
  if (type === 'saturation') {
    // Intensité = 0.5 est neutre, 0 est totalement désaturé, 1 est saturation max
    const targetSaturation = intensity < 0.5 ? 
      lerp(0, s, intensity * 2) :
      lerp(s, 1, (intensity - 0.5) * 2);
    s = clamp(targetSaturation, 0, 1);
  } else if (type === 'lightness') {
    // Intensité = 0.5 est neutre, 0 est plus sombre, 1 est plus clair
    const targetLightness = intensity < 0.5 ?
      lerp(Math.max(0, l - 0.3), l, intensity * 2) :
      lerp(l, Math.min(1, l + 0.3), (intensity - 0.5) * 2);
    l = clamp(targetLightness, 0, 1);
  }
  
  // Reconvertir HSL en RGB
  if (s === 0) {
    r = g = b = l; // achromatique
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  // Convertir RGB en hex
  r = Math.round(r * 255).toString(16).padStart(2, '0');
  g = Math.round(g * 255).toString(16).padStart(2, '0');
  b = Math.round(b * 255).toString(16).padStart(2, '0');
  
  return `#${r}${g}${b}`;
};

/**
 * Calcule une valeur de token en fonction de la préférence utilisateur
 * @param {Object} tokenConfig - Configuration du token avec base, min, max
 * @param {string} prefValue - Valeur de préférence (soft, balanced, sharp, etc.)
 * @param {number} intensity - Intensité de l'effet (0-1)
 * @returns {*} - Valeur calculée du token
 */
const calculateTokenValue = (tokenConfig, prefValue, intensity = 0.5) => {
  if (!tokenConfig) return null;
  
  const { base, min, max } = tokenConfig;
  
  // Si la valeur est un objet, traiter chaque propriété récursivement
  if (typeof base === 'object' && base !== null && !Array.isArray(base)) {
    const result = {};
    for (const key in base) {
      if (min && max && min[key] !== undefined && max[key] !== undefined) {
        result[key] = calculateTokenValue(
          { base: base[key], min: min[key], max: max[key] },
          prefValue,
          intensity
        );
      } else {
        result[key] = base[key];
      }
    }
    return result;
  }
  
  // Pour les valeurs simples
  if (prefValue === 'balanced') {
    return base;
  }
  
  let result;
  if (prefValue === 'soft' || prefValue === 'rounded' || prefValue === 'muted' || 
      prefValue === 'spacious' || prefValue === 'low') {
    // Pour "soft", on interpole entre base et max (valeurs plus douces)
    result = lerp(base, max, intensity);
  } else if (prefValue === 'sharp' || prefValue === 'vibrant' || 
             prefValue === 'compact' || prefValue === 'high') {
    // Pour "sharp", on interpole entre min et base (valeurs plus vives/angulaires)
    result = lerp(min, base, 1 - intensity);
  } else {
    return base; // Valeur par défaut
  }
  
  // Si la valeur est un nombre, arrondir pour éviter des décimales inutiles
  return typeof base === 'number' ? Math.round(result) : result;
};

/**
 * Applique les personnalisations au thème de base en fonction des préférences utilisateur
 * @param {Object} baseTheme - Thème de base (été, hiver, etc.)
 * @param {Object} userPrefs - Préférences utilisateur
 * @returns {Object} - Thème personnalisé
 */
export const personalizeTheme = (baseTheme, userPrefs) => {
  if (!baseTheme || !userPrefs) return baseTheme;
  
  // Copier le thème de base pour éviter de le modifier
  const theme = JSON.parse(JSON.stringify(baseTheme));
  
  // 1. Appliquer les préférences de forme (arrondi vs angulaire)
  if (userPrefs.cornerStyle && theme.shape) {
    for (const key in theme.shape) {
      if (key.toLowerCase().includes('radius') && theme.shape[key]) {
        theme.shape[key] = calculateTokenValue(
          theme.shape[key],
          userPrefs.cornerStyle,
          userPrefs.cornerIntensity || 0.5
        );
      }
    }
  }
  
  // 2. Appliquer les préférences de couleur (vibrance)
  if (userPrefs.colorVibrancy && theme.colors) {
    for (const key in theme.colors) {
      // Ne pas modifier les couleurs spécifiques comme textOnPrimary
      if (!key.startsWith('textOn') && theme.colors[key]) {
        // Si le token est un objet avec base/min/max
        if (theme.colors[key].base && typeof theme.colors[key].base === 'string' && 
            theme.colors[key].base.startsWith('#')) {
          // Ajuster la couleur directement
          const intensity = userPrefs.colorIntensity || 0.5;
          const prefValue = userPrefs.colorVibrancy;
          
          if (prefValue === 'balanced') {
            theme.colors[key] = theme.colors[key].base;
          } else if (prefValue === 'vibrant') {
            theme.colors[key] = adjustColor(theme.colors[key].base, 0.5 + intensity / 2, 'saturation');
          } else if (prefValue === 'muted') {
            theme.colors[key] = adjustColor(theme.colors[key].base, 0.5 - intensity / 2, 'saturation');
          } else {
            theme.colors[key] = theme.colors[key].base;
          }
        } else if (theme.colors[key].base) {
          // Utiliser calculateTokenValue pour les objets structurés
          theme.colors[key] = calculateTokenValue(
            theme.colors[key],
            userPrefs.colorVibrancy,
            userPrefs.colorIntensity || 0.5
          );
        }
      }
    }
  }
  
  // 3. Appliquer les préférences de contraste
  if (userPrefs.contrast && theme.colors) {
    // Ajuster principalement les couleurs de texte pour le contraste
    if (theme.colors.text && typeof theme.colors.text.base === 'string') {
      const intensity = userPrefs.contrastIntensity || 0.5;
      const prefValue = userPrefs.contrast;
      
      if (prefValue === 'high') {
        // Pour un contraste élevé, assombrir le texte
        theme.colors.text = adjustColor(theme.colors.text.base, 0.5 - intensity / 2, 'lightness');
      } else if (prefValue === 'low') {
        // Pour un contraste faible, éclaircir le texte
        theme.colors.text = adjustColor(theme.colors.text.base, 0.5 + intensity / 2, 'lightness');
      } else {
        theme.colors.text = theme.colors.text.base;
      }
    }
  }
  
  // 4. Appliquer les préférences d'espacement
  if (userPrefs.spacing && theme.spacing) {
    for (const key in theme.spacing) {
      theme.spacing[key] = calculateTokenValue(
        theme.spacing[key],
        userPrefs.spacing,
        userPrefs.spacingIntensity || 0.5
      );
    }
  }
  
  // Retourner le thème personnalisé
  return theme;
};

/**
 * Traduit une commande vocale/chatbot en préférences utilisateur
 * @param {string} command - Commande vocale/texte de l'utilisateur
 * @param {Object} currentPrefs - Préférences actuelles de l'utilisateur
 * @returns {Object} - Préférences mises à jour
 */
export const parseVoiceCommand = (command, currentPrefs) => {
  // Copier les préférences actuelles
  const newPrefs = { ...currentPrefs };
  
  // Convertir en minuscules pour faciliter la correspondance
  const normalizedCommand = command.toLowerCase();
  
  // Structure des règles:
  // [regex pattern, preference key, preference value, intensity adjustment (optional)]
  const rules = [
    // Forme (coins arrondis vs angulaires)
    [/plus (arrondi|rond|doux)/i, 'cornerStyle', 'soft', 0.2],
    [/très (arrondi|rond|doux)/i, 'cornerStyle', 'soft', 0.5],
    [/moins (arrondi|rond|doux)/i, 'cornerStyle', 'sharp', 0.2],
    [/plus (angul|carré|tranchant)/i, 'cornerStyle', 'sharp', 0.2],
    [/très (angul|carré|tranchant)/i, 'cornerStyle', 'sharp', 0.5],
    [/coins? (équilibré|normal|standard)/i, 'cornerStyle', 'balanced', 0],
    
    // Couleurs (vibrantes vs atténuées)
    [/couleurs? plus (vives?|vibrantes?|intenses?)/i, 'colorVibrancy', 'vibrant', 0.2],
    [/couleurs? très (vives?|vibrantes?|intenses?)/i, 'colorVibrancy', 'vibrant', 0.5],
    [/couleurs? moins (vives?|vibrantes?|intenses?)/i, 'colorVibrancy', 'muted', 0.2],
    [/couleurs? plus (douces?|atténuées?|pastel)/i, 'colorVibrancy', 'muted', 0.2],
    [/couleurs? très (douces?|atténuées?|pastel)/i, 'colorVibrancy', 'muted', 0.5],
    [/couleurs? (équilibrées?|normales?|standards?)/i, 'colorVibrancy', 'balanced', 0],
    
    // Contraste
    [/plus de contraste/i, 'contrast', 'high', 0.2],
    [/beaucoup plus de contraste/i, 'contrast', 'high', 0.5],
    [/moins de contraste/i, 'contrast', 'low', 0.2],
    [/beaucoup moins de contraste/i, 'contrast', 'low', 0.5],
    [/contraste (équilibré|normal|standard)/i, 'contrast', 'balanced', 0],
    
    // Espacement
    [/interface plus (spacieuse|aérée)/i, 'spacing', 'spacious', 0.2],
    [/interface très (spacieuse|aérée)/i, 'spacing', 'spacious', 0.5],
    [/interface moins (spacieuse|aérée)/i, 'spacing', 'compact', 0.2],
    [/interface plus (compacte|dense)/i, 'spacing', 'compact', 0.2],
    [/interface très (compacte|dense)/i, 'spacing', 'compact', 0.5],
    [/espacement (équilibré|normal|standard)/i, 'spacing', 'balanced', 0],
    
    // Réinitialisation
    [/réinitialiser (tout|toutes les préférences)/i, 'reset', true, 0],
    [/réinitialiser les (couleurs|coins|contrastes|espacements)/i, 'resetPartial', '$1', 0],
  ];
  
  // Appliquer les règles
  for (const [pattern, prefKey, prefValue, intensityAdjustment] of rules) {
    if (pattern.test(normalizedCommand)) {
      if (prefKey === 'reset' && prefValue === true) {
        // Réinitialiser toutes les préférences
        return {
          cornerStyle: 'balanced',
          cornerIntensity: 0.5,
          colorVibrancy: 'balanced',
          colorIntensity: 0.5,
          contrast: 'balanced',
          contrastIntensity: 0.5,
          spacing: 'balanced',
          spacingIntensity: 0.5,
          sources: { ...currentPrefs.sources }
        };
      } else if (prefKey === 'resetPartial') {
        const match = normalizedCommand.match(/réinitialiser les (\w+)/i);
        if (match && match[1]) {
          const aspect = match[1].toLowerCase();
          if (aspect.includes('couleur')) {
            newPrefs.colorVibrancy = 'balanced';
            newPrefs.colorIntensity = 0.5;
          } else if (aspect.includes('coin')) {
            newPrefs.cornerStyle = 'balanced';
            newPrefs.cornerIntensity = 0.5;
          } else if (aspect.includes('contraste')) {
            newPrefs.contrast = 'balanced';
            newPrefs.contrastIntensity = 0.5;
          } else if (aspect.includes('espace')) {
            newPrefs.spacing = 'balanced';
            newPrefs.spacingIntensity = 0.5;
          }
        }
      } else {
        // Mettre à jour la préférence
        newPrefs[prefKey] = prefValue;
        
        // Ajuster l'intensité si nécessaire
        const intensityKey = `${prefKey}Intensity`;
        if (intensityAdjustment !== 0 && newPrefs[intensityKey] !== undefined) {
          // Ajuster l'intensité actuelle en la limitant entre 0 et 1
          if (intensityAdjustment > 0) {
            // Augmenter l'intensité
            newPrefs[intensityKey] = clamp(newPrefs[intensityKey] + intensityAdjustment, 0, 1);
          } else {
            // Diminuer l'intensité
            newPrefs[intensityKey] = clamp(newPrefs[intensityKey] - Math.abs(intensityAdjustment), 0, 1);
          }
        }
      }
      
      // Marquer cette préférence comme manuelle
      if (newPrefs.sources && prefKey !== 'reset' && prefKey !== 'resetPartial') {
        newPrefs.sources = { ...newPrefs.sources, [prefKey]: 'manual' };
      }
      
      break; // Arrêter après la première correspondance
    }
  }
  
  return newPrefs;
};
