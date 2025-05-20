import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { summerTheme } from './baseThemes/summer';
import { winterTheme } from './baseThemes/winter';
import { personalizeTheme } from './ThemeEngine';

// Créer le contexte de thème
export const ThemeContext = createContext();

// Clés pour le stockage des préférences
const THEME_PREFERENCES_KEY = 'livora_theme_preferences';
const CURRENT_SEASON_KEY = 'livora_current_season';

// Fonction pour déterminer la saison actuelle
const determineCurrentSeason = () => {
  const now = new Date();
  const month = now.getMonth();
  
  // Mois d'été: Juin, Juillet, Août (5-7)
  // Mois d'hiver: Décembre, Janvier, Février (11-1) 
  // Printemps et automne (pourront être ajoutés plus tard)
  
  if (month >= 5 && month <= 7) {
    return 'summer';
  } else if (month >= 11 || month <= 1) {
    return 'winter';
  } else if (month >= 2 && month <= 4) {
    return 'spring'; // Pour le moment, on renvoie summer comme fallback
  } else {
    return 'autumn'; // Pour le moment, on renvoie winter comme fallback
  }
};

// Préférences par défaut de l'utilisateur
const defaultUserPrefs = {
  // Forme des éléments (arrondi vs angulaire)
  cornerStyle: 'balanced', // 'soft', 'balanced', 'sharp'
  cornerIntensity: 0.5,    // 0 à 1 (à quel point appliquer l'effet)
  
  // Couleurs
  colorVibrancy: 'balanced', // 'muted', 'balanced', 'vibrant'
  colorIntensity: 0.5,       // 0 à 1
  
  // Contraste
  contrast: 'balanced',     // 'low', 'balanced', 'high'
  contrastIntensity: 0.5,   // 0 à 1
  
  // Espacement
  spacing: 'balanced',      // 'compact', 'balanced', 'spacious'
  spacingIntensity: 0.5,    // 0 à 1
  
  // Source de la préférence (auto ou manuelle)
  sources: {
    cornerStyle: 'auto',
    colorVibrancy: 'auto',
    contrast: 'auto',
    spacing: 'auto'
  }
};

export const ThemeProvider = ({ children }) => {
  // États pour le thème et les préférences utilisateur
  const [currentSeason, setCurrentSeason] = useState(determineCurrentSeason());
  const [userPrefs, setUserPrefs] = useState(defaultUserPrefs);
  const [computedTheme, setComputedTheme] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les préférences sauvegardées au démarrage
  useEffect(() => {
    const loadSavedPreferences = async () => {
      try {
        setIsLoading(true);
        
        // Charger la saison sauvegardée (si existante)
        const savedSeason = await AsyncStorage.getItem(CURRENT_SEASON_KEY);
        if (savedSeason) {
          setCurrentSeason(savedSeason);
        }
        
        // Charger les préférences utilisateur (si existantes)
        const savedPrefs = await AsyncStorage.getItem(THEME_PREFERENCES_KEY);
        if (savedPrefs) {
          setUserPrefs(JSON.parse(savedPrefs));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des préférences de thème:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedPreferences();
  }, []);

  // Mettre à jour le thème calculé quand la saison ou les préférences changent
  useEffect(() => {
    if (isLoading) return;
    
    const baseTheme = currentSeason === 'summer' ? summerTheme : winterTheme;
    const newTheme = personalizeTheme(baseTheme, userPrefs);
    setComputedTheme(newTheme);
    
    // Sauvegarder les préférences actuelles
    const savePreferences = async () => {
      try {
        await AsyncStorage.setItem(THEME_PREFERENCES_KEY, JSON.stringify(userPrefs));
        await AsyncStorage.setItem(CURRENT_SEASON_KEY, currentSeason);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des préférences de thème:', error);
      }
    };
    
    savePreferences();
  }, [currentSeason, userPrefs, isLoading]);

  // Fonction pour mettre à jour une préférence utilisateur spécifique
  const updatePreference = (key, value, intensity = null, source = 'manual') => {
    setUserPrefs(prev => {
      const newPrefs = { ...prev };
      newPrefs[key] = value;
      
      if (intensity !== null) {
        newPrefs[`${key}Intensity`] = intensity;
      }
      
      // Marquer cette préférence comme manuelle si modifiée manuellement
      if (source === 'manual' && newPrefs.sources) {
        newPrefs.sources = { ...newPrefs.sources, [key]: 'manual' };
      }
      
      return newPrefs;
    });
  };

  // Fonction pour changer de saison (peut être utilisée manuellement ou automatiquement)
  const changeSeason = (season) => {
    if (season === 'summer' || season === 'winter') {
      setCurrentSeason(season);
    }
  };

  // Fonction pour réinitialiser les préférences
  const resetPreferences = () => {
    setUserPrefs(defaultUserPrefs);
  };

  // Rendre le provider avec les valeurs de contexte
  return (
    <ThemeContext.Provider
      value={{
        theme: computedTheme || (currentSeason === 'summer' ? summerTheme : winterTheme),
        currentSeason,
        userPrefs,
        isLoading,
        updatePreference,
        changeSeason,
        resetPreferences
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Hook pour utiliser le thème dans les composants
export const useTheme = () => useContext(ThemeContext);
