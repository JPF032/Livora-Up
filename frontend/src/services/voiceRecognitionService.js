/**
 * Service de reconnaissance vocale pour Livora UP
 * Utilise expo-audio pour l'enregistrement et une API cloud pour le STT (Speech-to-Text)
 */
import * as Audio from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import { apiClient } from './apiClient';

// Configuration de l'enregistrement audio
const RECORDING_OPTIONS = {
  android: {
    extension: '.m4a',
    // Utiliser des valeurs directes plutôt que des constantes qui ont changé
    outputFormat: 2, // MPEG_4 format
    audioEncoder: 3,  // AAC encoder
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    audioQuality: 'high', // Utiliser une chaîne au lieu d'une constante
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

// Timeouts (en ms)
const LISTENING_TIMEOUT = 8000; // 8 secondes max d'écoute
const SILENCE_DETECTION_TIMEOUT = 2000; // 2 secondes de silence pour arrêter automatiquement

class VoiceRecognitionService {
  constructor() {
    this.recording = null;
    this.listeningTimeout = null;
    this.silenceTimeout = null;
    this.onResultCallback = null;
    this.onListeningChangeCallback = null;
    this.lastUpdateTime = 0;
  }

  /**
   * Demande les permissions pour accéder au microphone
   * @returns {Promise<boolean>} - True si les permissions sont accordées
   */
  async requestPermissions() {
    try {
      console.log('Demande des permissions microphone...');
      const { granted } = await Audio.requestPermissionsAsync();
      
      if (!granted) {
        Alert.alert(
          'Permission requise',
          'Livora UP a besoin de la permission d\'accéder au microphone pour les commandes vocales.',
          [{ text: 'OK' }]
        );
      }
      
      return granted;
    } catch (error) {
      console.error('Erreur lors de la demande de permissions:', error);
      return false;
    }
  }

  /**
   * Démarre l'enregistrement audio pour la reconnaissance vocale
   * @param {Function} onResult - Callback appelé avec le texte reconnu
   * @param {Function} onListeningChange - Callback pour l'état d'écoute (true/false)
   */
  async startListening(onResult, onListeningChange) {
    try {
      // Vérifier et demander les permissions si nécessaire
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      // Stocker les callbacks
      this.onResultCallback = onResult;
      this.onListeningChangeCallback = onListeningChange;

      // Configurer le mode audio - API compatible avec expo-audio
      await Audio.requestPermissionsAsync(); // S'assurer que les permissions sont accordées
      
      // Note: expo-audio peut avoir une API différente de expo-av
      // Utiliser l'API adaptée à expo-audio

      // Créer une nouvelle instance d'enregistrement avec expo-audio
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(RECORDING_OPTIONS);
      await recording.startAsync();
      this.recording = recording;
      
      // Mettre à jour l'état d'écoute
      if (this.onListeningChangeCallback) {
        this.onListeningChangeCallback(true);
      }

      console.log('Enregistrement démarré...');
      this.lastUpdateTime = Date.now();

      // Configurer un timeout pour l'écoute maximum
      this.listeningTimeout = setTimeout(() => {
        console.log('Timeout d\'écoute atteint, arrêt automatique');
        this.stopListening();
      }, LISTENING_TIMEOUT);

      // Surveiller le niveau audio pour détecter les silences
      this.startSilenceDetection();

    } catch (error) {
      console.error('Erreur lors du démarrage de l\'enregistrement:', error);
      if (this.onListeningChangeCallback) {
        this.onListeningChangeCallback(false);
      }
      Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement audio.');
    }
  }

  /**
   * Détection du silence pour arrêter automatiquement l'enregistrement
   */
  startSilenceDetection() {
    // Créer un intervalle pour vérifier régulièrement le niveau sonore
    this.silenceDetectionInterval = setInterval(async () => {
      if (!this.recording) {
        clearInterval(this.silenceDetectionInterval);
        return;
      }

      try {
        const status = await this.recording.getStatusAsync();
        // Si le niveau est très bas (silence) pendant un certain temps, arrêter
        const now = Date.now();
        
        if (status.metering && status.metering < -50 && (now - this.lastUpdateTime > SILENCE_DETECTION_TIMEOUT)) {
          console.log('Silence détecté, arrêt automatique');
          this.stopListening();
        } else if (status.metering && status.metering > -40) {
          // Réinitialiser le délai si du son est détecté
          this.lastUpdateTime = now;
        }
      } catch (error) {
        console.log('Erreur lors de la détection du silence:', error);
      }
    }, 500); // Vérifier toutes les 500ms
  }

  /**
   * Arrête l'enregistrement et lance la reconnaissance vocale
   */
  async stopListening() {
    try {
      // Nettoyage des timeouts
      if (this.listeningTimeout) {
        clearTimeout(this.listeningTimeout);
        this.listeningTimeout = null;
      }
      
      if (this.silenceDetectionInterval) {
        clearInterval(this.silenceDetectionInterval);
        this.silenceDetectionInterval = null;
      }

      // Vérifier si un enregistrement est en cours
      if (!this.recording) {
        console.log('Aucun enregistrement en cours');
        return;
      }

      console.log('Arrêt de l\'enregistrement...');
      await this.recording.stopAndUnloadAsync();
      
      // Mettre à jour l'état d'écoute
      if (this.onListeningChangeCallback) {
        this.onListeningChangeCallback(false);
      }

      // Obtenir l'URI de l'enregistrement (compatible avec expo-audio)
      let uri;
      try {
        // Différentes méthodes selon la version de l'API
        uri = this.recording.getURI ? this.recording.getURI() : 
              (this.recording._uri || this.recording._value);
        this.recording = null;
        
        if (!uri) {
          console.error('URI d\'enregistrement non disponible');
          return;
        }
      } catch (uriError) {
        console.error('Erreur lors de la récupération de l\'URI:', uriError);
        return;
      }

      // Lire le fichier audio et le convertir en base64
      const audioBase64 = await this.getAudioBase64(uri);
      if (!audioBase64) return;

      // Envoyer à l'API de reconnaissance vocale
      this.sendToSpeechRecognition(audioBase64);

    } catch (error) {
      console.error('Erreur lors de l\'arrêt de l\'enregistrement:', error);
      if (this.onListeningChangeCallback) {
        this.onListeningChangeCallback(false);
      }
    }
  }

  /**
   * Annule l'enregistrement en cours sans traitement
   */
  cancelListening() {
    try {
      if (this.listeningTimeout) {
        clearTimeout(this.listeningTimeout);
        this.listeningTimeout = null;
      }
      
      if (this.silenceDetectionInterval) {
        clearInterval(this.silenceDetectionInterval);
        this.silenceDetectionInterval = null;
      }

      if (this.recording) {
        this.recording.stopAndUnloadAsync();
        this.recording = null;
      }

      if (this.onListeningChangeCallback) {
        this.onListeningChangeCallback(false);
      }

      console.log('Enregistrement annulé');
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'enregistrement:', error);
    }
  }

  /**
   * Convertit un fichier audio en base64
   * @param {string} uri - URI du fichier audio
   * @returns {Promise<string>} - Contenu audio en base64
   */
  async getAudioBase64(uri) {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('Erreur lors de la conversion du fichier audio en base64:', error);
      return null;
    }
  }

  /**
   * Envoie l'audio à l'API de reconnaissance vocale
   * Nous passons par notre propre API qui sert de proxy sécurisé vers une API STT
   * @param {string} audioBase64 - Audio encodé en base64
   */
  async sendToSpeechRecognition(audioBase64) {
    try {
      if (!this.onResultCallback) return;

      // Informer l'utilisateur
      this.onResultCallback(null, { status: 'processing', message: 'Traitement en cours...' });
      
      // Appel à notre API proxy
      const response = await apiClient.post('speech/recognize', {
        audio: audioBase64,
        config: {
          languageCode: 'fr-FR', // Langue par défaut - Ajuster selon la langue de l'app
          model: 'command_and_search', // Modèle optimisé pour les commandes vocales courtes
        }
      }, { timeout: 10000 }); // Timeout de 10 secondes
      
      // Traiter la réponse
      if (response && response.transcript) {
        console.log('Texte reconnu:', response.transcript);
        this.onResultCallback(response.transcript);
      } else {
        throw new Error('Réponse invalide de l\'API');
      }
    } catch (error) {
      console.error('Erreur lors de la reconnaissance vocale:', error);
      this.onResultCallback(null, { status: 'error', message: 'Impossible de reconnaître la commande vocale' });
    }
  }
}

// Exporter une instance unique
export const voiceRecognitionService = new VoiceRecognitionService();
