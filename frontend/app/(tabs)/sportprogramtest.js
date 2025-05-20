/**
 * Écran de test pour la génération de programmes sportifs avec IA
 * Permet de tester la génération et l'affichage des programmes sportifs 
 */
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS, SHARED_STYLES } from '../../src/config/theme';
import { generateAISportProgram, getCurrentSportProgram, validateSportProgram, fetchSportProgram } from '../../src/services/sportProgramService';

// Fonction pour récupérer l'ID utilisateur temporaire 
// Dans une vraie application, cela viendrait du système d'authentification
const getTempUserId = () => {
  return 'test-user-123'; // ID utilisateur de test pour la démonstration
};

export default function SportProgramTest() {
  const insets = useSafeAreaInsets();
  const [program, setProgram] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const userId = getTempUserId();

  // Fonction pour générer un profil utilisateur de test
  const getTestUserProfile = () => {
    return {
      userId: userId,
      age: 30,
      sex: 'Homme',
      currentLevel: 'Débutant',
      objective: 'Perdre du poids et tonifier',
      constraints: ['Légère douleur au genou droit', 'Matériel limité'],
      availability: '3 fois par semaine, 45 minutes max',
    };
  };

  // Fonction pour générer un nouveau programme sportif
  const handleGenerateProgram = async () => {
    setIsLoading(true);
    setError(null);
    setProgram(null); // Réinitialiser le programme précédent
    
    try {
      const userProfile = getTestUserProfile();
      console.log('Demande de génération de programme avec profil:', userProfile);
      
      const generatedProgram = await generateAISportProgram(userProfile);
      console.log('Programme généré:', generatedProgram);
      
      // Valider la structure du programme avant de l'afficher
      if (validateSportProgram(generatedProgram)) {
        setProgram(generatedProgram);
      } else {
        throw new Error('Le programme généré a une structure invalide');
      }
    } catch (err) {
      console.error('Erreur lors de la génération du programme:', err);
      setError(err.message || 'Une erreur est survenue lors de la génération.');
      Alert.alert(
        "Erreur de génération", 
        err.message || 'Une erreur est survenue lors de la génération du programme.',
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour récupérer le programme actuel
  const fetchCurrentProgram = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Récupération du programme actuel pour l\'utilisateur:', userId);
      const currentProgram = await getCurrentSportProgram(userId);
      
      if (currentProgram) {
        if (validateSportProgram(currentProgram)) {
          setProgram(currentProgram);
        } else {
          throw new Error('Le programme récupéré a une structure invalide');
        }
      } else {
        Alert.alert(
          "Information",
          "Aucun programme actif trouvé. Générez un nouveau programme.",
          [{ text: "OK" }]
        );
      }
    } catch (err) {
      console.error('Erreur lors de la récupération du programme:', err);
      setError(err.message || 'Une erreur est survenue lors de la récupération.');
      Alert.alert(
        "Erreur", 
        err.message || 'Une erreur est survenue lors de la récupération du programme.',
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer le programme au chargement de l'écran
  useEffect(() => {
    fetchCurrentProgram();
  }, []);

  // Rendu de la section du programme avec gestion d'erreur améliorée
  const renderProgramDetails = () => {
    if (!program) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>
            Aucun programme à afficher. Utilisez le bouton "Générer Programme" pour créer un nouveau programme personnalisé.
          </Text>
        </View>
      );
    }

    try {
      return (
        <ScrollView style={styles.programContainer}>
          <Text style={styles.programTitle}>{program.name || 'Mon Programme Personnalisé'}</Text>
          
          {program.introduction && (
            <View style={styles.introCard}>
              <Text style={styles.programIntro}>{program.introduction}</Text>
            </View>
          )}
          
          {Array.isArray(program.sessions) ? (
            program.sessions.map((session, sessionIndex) => (
              <View key={`session-${sessionIndex}`} style={styles.sessionCard}>
                <Text style={styles.sessionName}>
                  {session.name || `Séance ${session.dayOfWeek || (sessionIndex + 1)}`}
                </Text>
                
                {session.description && (
                  <Text style={styles.sessionDescription}>{session.description}</Text>
                )}
                
                {Array.isArray(session.exercises) ? (
                  session.exercises.map((exercise, exIndex) => (
                    <View key={`ex-${sessionIndex}-${exIndex}`} style={styles.exerciseItem}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <Text style={styles.exerciseDetails}>
                        {exercise.sets} × {exercise.reps}
                        {exercise.restSeconds ? ` (Repos: ${exercise.restSeconds}s)` : ''}
                      </Text>
                      {exercise.notes && (
                        <Text style={styles.exerciseNotes}>{exercise.notes}</Text>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.errorText}>Données d'exercices invalides</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.errorText}>Structure de programme invalide</Text>
          )}
        </ScrollView>
      );
    } catch (renderError) {
      console.error('Erreur lors du rendu du programme:', renderError);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Erreur d'affichage</Text>
          <Text style={styles.errorText}>
            Le programme n'a pas pu être affiché correctement.
          </Text>
          <Text style={styles.errorDetails}>{renderError.message}</Text>
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.header}>Test Programme Sportif IA</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.generateButton]}
          onPress={handleGenerateProgram}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Générer un Nouveau Programme</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.refreshButton]}
          onPress={fetchCurrentProgram}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Rafraîchir Programme Actuel</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Génération en cours...</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorNotice}>
          <Text style={styles.errorTitle}>Erreur</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {!isLoading && renderProgramDetails()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  header: {
    ...FONTS.h1,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SIZES.padding * 1.5,
  },
  buttonContainer: {
    flexDirection: 'column',
    marginBottom: SIZES.padding,
  },
  button: {
    ...SHARED_STYLES.button,
    marginVertical: SIZES.base,
  },
  generateButton: {
    backgroundColor: COLORS.primary,
  },
  refreshButton: {
    backgroundColor: COLORS.secondary,
  },
  buttonText: {
    ...SHARED_STYLES.buttonText,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding * 2,
  },
  loadingText: {
    ...FONTS.body1,
    color: COLORS.primary,
    marginTop: SIZES.padding,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding * 2,
  },
  emptyStateText: {
    ...FONTS.body1,
    color: COLORS.mediumGray,
    textAlign: 'center',
  },
  programContainer: {
    flex: 1,
  },
  programTitle: {
    ...FONTS.h2,
    color: COLORS.darkGray,
    marginBottom: SIZES.base,
  },
  introCard: {
    ...SHARED_STYLES.card,
    backgroundColor: COLORS.lightGray,
  },
  programIntro: {
    ...FONTS.body2,
    color: COLORS.darkGray,
    fontStyle: 'italic',
  },
  sessionCard: {
    ...SHARED_STYLES.card,
  },
  sessionName: {
    ...FONTS.h3,
    color: COLORS.secondary,
    marginBottom: SIZES.base,
  },
  sessionDescription: {
    ...FONTS.body2,
    color: COLORS.mediumGray,
    marginBottom: SIZES.padding,
  },
  exerciseItem: {
    marginLeft: SIZES.base,
    paddingVertical: SIZES.base,
    borderLeftColor: COLORS.accent,
    borderLeftWidth: 3,
    paddingLeft: SIZES.padding,
    marginBottom: SIZES.base,
  },
  exerciseName: {
    ...FONTS.body1,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  exerciseDetails: {
    ...FONTS.body2,
    color: COLORS.mediumGray,
  },
  exerciseNotes: {
    ...FONTS.caption,
    fontStyle: 'italic',
    color: COLORS.mediumGray,
    marginTop: SIZES.base / 2,
  },
  errorNotice: {
    backgroundColor: COLORS.error + '20', // Transparence ajoutée
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    borderLeftColor: COLORS.error,
    borderLeftWidth: 4,
  },
  errorContainer: {
    padding: SIZES.padding,
    alignItems: 'center',
  },
  errorTitle: {
    ...FONTS.h3,
    color: COLORS.error,
    marginBottom: SIZES.base,
  },
  errorText: {
    ...FONTS.body2,
    color: COLORS.error,
  },
  errorDetails: {
    ...FONTS.caption,
    color: COLORS.error,
    marginTop: SIZES.base,
  },
});

// Pas d'export supplémentaire nécessaire car il y a déjà un export par défaut à la ligne 24
