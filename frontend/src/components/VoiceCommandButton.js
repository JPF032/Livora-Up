/**
 * Bouton de commande vocale pour Livora UP
 * Interface utilisateur pour activer la reconnaissance vocale
 */
import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Text, 
  Animated, 
  Easing,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Audio from 'expo-audio';
import { useNavigation } from '@react-navigation/native';
import { voiceRecognitionService } from '../services/voiceRecognitionService';
import { parseVoiceCommand } from '../utils/voiceCommandParser';
import { loadSound, playSound } from '../utils/assetLoader';
import { handleError } from '../utils/errorHandler';

// Chemins vers les sons (complètement optionnels)
// Ils seront chargés de manière sécurisée au runtime
const START_SOUND_PATH = '../../assets/sounds/start-listening.wav';
const STOP_SOUND_PATH = '../../assets/sounds/stop-listening.wav';

// Sons par défaut fallback - peuvent être null s'ils n'existent pas
let START_SOUND_ASSET = null;
let STOP_SOUND_ASSET = null;

// Tentative de référencement des assets (en mode sécurisé)
try {
  START_SOUND_ASSET = require(START_SOUND_PATH);
} catch (e) {
  console.log('Son de début d\'enregistrement non référencé');
}

try {
  STOP_SOUND_ASSET = require(STOP_SOUND_PATH);
} catch (e) {
  console.log('Son de fin d\'enregistrement non référencé');
}

const VoiceCommandButton = ({ size = 60, color = '#3498DB', style }) => {
  const navigation = useNavigation();
  const [isListening, setIsListening] = useState(false);
  const [processingText, setProcessingText] = useState('');
  const [recognizedText, setRecognizedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const startSound = useRef(null);
  const stopSound = useRef(null);

  // Animation de pulsation pour le feedback visuel
  useEffect(() => {
    let pulseAnimation;
    
    if (isListening) {
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      );
      
      pulseAnimation.start();
    } else {
      // Réinitialiser l'animation si on n'écoute plus
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
    
    // Nettoyage de l'animation à la fermeture du composant
    return () => {
      if (pulseAnimation) {
        pulseAnimation.stop();
      }
    };
  }, [isListening, pulseAnim]);

  // Charger les sons de manière sécurisée
  useEffect(() => {
    const loadSounds = async () => {
      // Utiliser notre utilitaire de chargement sécurisé
      if (START_SOUND_ASSET) {
        try {
          const { sound } = await loadSound(START_SOUND_ASSET);
          startSound.current = sound;
        } catch (error) {
          handleError(error, 'Chargement du son de début', false);
        }
      }
      
      if (STOP_SOUND_ASSET) {
        try {
          const { sound } = await loadSound(STOP_SOUND_ASSET);
          stopSound.current = sound;
        } catch (error) {
          handleError(error, 'Chargement du son de fin', false);
        }
      }
    };
    
    loadSounds();
    
    // Nettoyage des sons à la fermeture du composant
    return () => {
      if (startSound.current) {
        try {
          startSound.current.unloadAsync();
        } catch (error) {
          console.log('Erreur lors du déchargement du son de début');
        }
      }
      if (stopSound.current) {
        try {
          stopSound.current.unloadAsync();
        } catch (error) {
          console.log('Erreur lors du déchargement du son de fin');
        }
      }
    };
  }, []);

  // Jouer un son de manière sécurisée
  const playSoundEffect = async (soundRef) => {
    try {
      // Utiliser l'utilitaire de lecture audio sécurisée
      if (soundRef && soundRef.current) {
        await playSound(soundRef.current);
      }
    } catch (error) {
      // Ignorer silencieusement les erreurs de son (ne pas interrompre l'expérience utilisateur)
      console.log('Son non disponible:', error.message);
    }
  };

  // Gestionnaire pour le début de l'écoute
  const handleStartListening = async () => {
    try {
      // Si déjà en écoute, stopper
      if (isListening) {
        voiceRecognitionService.stopListening();
        return;
      }
      
      // Feedback haptique et sonore
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      playSoundEffect(startSound);
      
      // Réinitialiser les états
      setRecognizedText('');
      setProcessingText('');
      
      // Démarrer l'écoute
      voiceRecognitionService.startListening(handleRecognitionResult, handleListeningChange);
      
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'écoute:', error);
      setIsListening(false);
    }
  };

  // Callback pour le changement d'état d'écoute
  const handleListeningChange = (listening) => {
    setIsListening(listening);
    
    // Si on arrête d'écouter, jouer le son de fin
    if (!listening && isListening) {
      playSoundEffect(stopSound);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // Callback pour le résultat de la reconnaissance vocale
  const handleRecognitionResult = async (text, status) => {
    // Si c'est une mise à jour de statut
    if (!text && status) {
      if (status.status === 'processing') {
        setIsProcessing(true);
        setProcessingText(status.message);
        return;
      } else if (status.status === 'error') {
        setIsProcessing(false);
        setProcessingText(status.message);
        // Effacer le message d'erreur après 3 secondes
        setTimeout(() => setProcessingText(''), 3000);
        return;
      }
    }
    
    // Si c'est un texte reconnu
    setIsProcessing(false);
    setRecognizedText(text || '');
    
    // Analyser la commande
    const command = parseVoiceCommand(text);
    
    if (command) {
      // Feedback haptique
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Afficher le feedback
      setProcessingText(command.feedback);
      
      // Exécuter l'action après un court délai pour que l'utilisateur voie le feedback
      setTimeout(() => {
        executeCommand(command);
        // Effacer le texte après exécution
        setTimeout(() => {
          setRecognizedText('');
          setProcessingText('');
        }, 1000);
      }, 500);
    } else if (text) {
      // Commande non reconnue
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setProcessingText('Commande non reconnue. Essayez à nouveau.');
      
      // Effacer le message après 3 secondes
      setTimeout(() => setProcessingText(''), 3000);
    }
  };

  // Exécuter une commande reconnue
  const executeCommand = (command) => {
    switch (command.action) {
      case 'startWorkout':
        navigation.navigate('Workout');
        break;
        
      case 'generateWorkoutPlan':
        // Redirection vers l'écran de génération de programme sportif IA
        // Utilisation du routeur Expo pour accéder à notre nouvel écran
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          navigation.navigate('sport/ai-generator');
        } catch (error) {
          handleError(error, 'Navigation vers générateur IA', true);
          setProcessingText('Impossible d\'accéder au générateur de programme pour le moment.');
          setTimeout(() => setProcessingText(''), 3000);
        }
        break;
        
      case 'suggestMeal':
        navigation.navigate('Nutrition', { screen: 'MealSuggestions' });
        break;
        
      case 'showProfile':
        navigation.navigate('Profile');
        break;
        
      case 'showProgress':
        navigation.navigate('Progress');
        break;
        
      case 'scanFood':
        navigation.navigate('Nutrition', { screen: 'FoodScanner' });
        break;
        
      case 'showHelp':
        navigation.navigate('Help', { screen: 'VoiceCommands' });
        break;
        
      default:
        console.log('Action non implémentée:', command.action);
        setProcessingText('Cette fonctionnalité n\'est pas encore disponible.');
        setTimeout(() => setProcessingText(''), 3000);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Texte reconnu ou en cours de traitement */}
      {(recognizedText || processingText) && (
        <View style={styles.textContainer}>
          {recognizedText ? (
            <Text style={styles.recognizedText}>"{recognizedText}"</Text>
          ) : null}
          
          {processingText ? (
            <View style={styles.processingContainer}>
              {isProcessing && <ActivityIndicator size="small" color={color} style={styles.spinner} />}
              <Text style={styles.processingText}>{processingText}</Text>
            </View>
          ) : null}
        </View>
      )}
      
      {/* Bouton microphone */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleStartListening}
        accessibilityLabel="Commande vocale"
        accessibilityHint="Appuyez pour donner une commande vocale"
      >
        <Animated.View 
          style={[
            styles.button, 
            { 
              width: size, 
              height: size, 
              borderRadius: size / 2,
              backgroundColor: isListening ? '#F44336' : color,
              transform: [{ scale: pulseAnim }] 
            }
          ]}
        >
          <MaterialIcons 
            name={isListening ? "mic" : "mic-none"} 
            size={size * 0.5} 
            color="white" 
          />
        </Animated.View>
      </TouchableOpacity>
      
      {/* Tip pour l'utilisateur */}
      {!isListening && !recognizedText && !processingText && (
        <Text style={styles.tipText}>
          Appuyez pour parler
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  textContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    minWidth: 200,
    maxWidth: 300,
    alignItems: 'center',
  },
  recognizedText: {
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 5,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    color: '#555',
    fontSize: 12,
    textAlign: 'center',
  },
  spinner: {
    marginRight: 5,
  },
  tipText: {
    marginTop: 5,
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
  }
});

export default VoiceCommandButton;
