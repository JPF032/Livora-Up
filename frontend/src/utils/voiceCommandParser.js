/**
 * Utilitaire de traitement et interprétation des commandes vocales
 * Analyse le texte reconnu et détermine les actions à exécuter
 */
import { safeGet } from './safeData';

// Liste des commandes supportées avec leurs synonymes et variations
const COMMANDS = {
  START_WORKOUT: {
    keywords: [
      'commencer entraînement', 'débuter entraînement', 
      'commencer exercice', 'débuter exercice',
      'commencer séance', 'débuter séance',
      'démarrer entraînement', 'démarrer exercice', 'démarrer séance',
      'lancer entraînement', 'lancer exercice', 'lancer séance',
      'ouvrir entraînement', 'ouvrir exercice', 'ouvrir séance',
      'commencer workout', 'démarrer workout', 'lancer workout',
      'sport', 'entraînement', 'exercice', 'séance', 'workout'
    ],
    action: 'startWorkout',
    feedback: 'Démarrage de l\'entraînement...'
  },
  
  GENERATE_WORKOUT_PLAN: {
    keywords: [
      'créer programme', 'générer programme', 'crée programme', 'génère programme',
      'faire programme', 'créer plan', 'générer plan', 'crée plan', 'génère plan',
      'créer entraînement', 'générer entraînement',
      'nouveau programme', 'nouvelle routine',
      'programme intelligence artificielle', 'programme ia', 'IA programme',
      'programme sportif', 'plan entraînement',
      'créer workout', 'générer workout', 'nouveau workout'
    ],
    action: 'generateWorkoutPlan',
    feedback: 'Génération d\'un programme sportif personnalisé...'
  },
  
  SUGGEST_MEAL: {
    keywords: [
      'suggérer repas', 'suggère repas', 'suggestion repas', 'suggérer un repas',
      'proposer repas', 'propose repas', 'proposition repas', 'proposer un repas',
      'suggérer menu', 'suggère menu', 'suggestion menu', 'suggérer un menu',
      'idée repas', 'idée de repas', 'idées repas', 'idées de repas',
      'que manger', 'quoi manger', 'conseil repas', 'conseils repas',
      'nourriture', 'alimentation', 'manger', 'nutrition'
    ],
    action: 'suggestMeal',
    feedback: 'Recherche de suggestions de repas...'
  },
  
  SHOW_PROFILE: {
    keywords: [
      'profil', 'mon profil', 'voir profil', 'afficher profil', 'ouvrir profil',
      'mon compte', 'voir compte', 'afficher compte', 'ouvrir compte',
      'mes données', 'mes informations', 'mes stats', 'mes statistiques'
    ],
    action: 'showProfile',
    feedback: 'Ouverture de votre profil...'
  },
  
  SHOW_PROGRESS: {
    keywords: [
      'progrès', 'mes progrès', 'voir progrès', 'afficher progrès', 'montrer progrès',
      'progression', 'ma progression', 'voir progression', 'afficher progression',
      'statistiques', 'stats', 'mes statistiques', 'mes stats',
      'résultats', 'mes résultats', 'voir résultats', 'afficher résultats',
      'évolution', 'mon évolution', 'voir évolution', 'afficher évolution'
    ],
    action: 'showProgress',
    feedback: 'Affichage de vos progrès...'
  },
  
  SCAN_FOOD: {
    keywords: [
      'scanner nourriture', 'scanner aliment', 'scanner repas', 'scanner plat',
      'analyser nourriture', 'analyser aliment', 'analyser repas', 'analyser plat',
      'reconnaître nourriture', 'reconnaître aliment', 'reconnaître repas',
      'photo nourriture', 'photo aliment', 'photo repas', 'photo plat',
      'prendre photo', 'photo', 'appareil photo', 'caméra'
    ],
    action: 'scanFood',
    feedback: 'Ouverture du scanner d\'aliments...'
  },
  
  HELP: {
    keywords: [
      'aide', 'besoin d\'aide', 'assistance', 'aider moi', 'instructions',
      'commandes', 'commandes vocales', 'que puis-je dire', 'que dire',
      'comment ça marche', 'fonctionnement', 'guide', 'tutoriel', 'help'
    ],
    action: 'showHelp',
    feedback: 'Voici comment utiliser les commandes vocales...'
  }
};

/**
 * Analyse une commande vocale et retourne l'action correspondante
 * @param {string} text - Texte reconnu par la reconnaissance vocale
 * @returns {Object|null} - Action trouvée ou null si aucune correspondance
 */
export function parseVoiceCommand(text) {
  if (!text) return null;
  
  // Normaliser le texte (minuscules, sans accents, espaces supplémentaires)
  const normalizedText = normalizeText(text);
  console.log('Texte normalisé:', normalizedText);
  
  // Parcourir toutes les commandes pour trouver une correspondance
  for (const [commandName, commandData] of Object.entries(COMMANDS)) {
    for (const keyword of commandData.keywords) {
      // Normaliser également le mot-clé pour la comparaison
      const normalizedKeyword = normalizeText(keyword);
      
      if (normalizedText.includes(normalizedKeyword)) {
        return {
          command: commandName,
          action: commandData.action,
          feedback: commandData.feedback,
          confidence: calculateConfidence(normalizedText, normalizedKeyword)
        };
      }
    }
  }
  
  return null;
}

/**
 * Normalise un texte pour faciliter la comparaison
 * (minuscules, sans accents, espaces normalisés)
 * @param {string} text - Texte à normaliser
 * @returns {string} - Texte normalisé
 */
function normalizeText(text) {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[.,;:!?]/g, '') // Supprimer la ponctuation
    .replace(/\s+/g, ' ') // Normaliser les espaces
    .trim();
}

/**
 * Calcule un score de confiance simple basé sur la longueur relative
 * du texte reconnu et du mot-clé
 * @param {string} text - Texte normalisé
 * @param {string} keyword - Mot-clé normalisé
 * @returns {number} - Score de confiance (0-1)
 */
function calculateConfidence(text, keyword) {
  // Simple ratio longueur du mot-clé / longueur du texte
  // (plus le ratio est élevé, plus la confiance est grande)
  const ratio = keyword.length / text.length;
  
  // Limiter le score entre 0.5 et 1.0
  // Même un match partiel a au moins 0.5 de confiance
  return Math.min(1.0, Math.max(0.5, ratio));
}

/**
 * Obtient une liste de toutes les commandes supportées pour l'aide
 * @returns {Array<Object>} - Liste des commandes avec exemples et descriptions
 */
export function getSupportedCommands() {
  return [
    {
      name: 'Entraînement',
      examples: ['Commencer l\'entraînement', 'Démarrer une séance', 'Je veux faire du sport'],
      description: 'Démarre une séance d\'entraînement personnalisée'
    },
    {
      name: 'Nutrition',
      examples: ['Suggère-moi un repas', 'Idées de repas', 'Quoi manger ce soir'],
      description: 'Propose des suggestions de repas adaptées à vos objectifs'
    },
    {
      name: 'Profil',
      examples: ['Voir mon profil', 'Ouvrir mon compte', 'Mes données'],
      description: 'Accède à votre profil utilisateur et vos réglages'
    },
    {
      name: 'Progrès',
      examples: ['Voir mes progrès', 'Mes statistiques', 'Afficher mon évolution'],
      description: 'Montre vos statistiques et votre évolution'
    },
    {
      name: 'Scanner',
      examples: ['Scanner un aliment', 'Analyser ma nourriture', 'Prendre une photo de mon repas'],
      description: 'Ouvre le scanner pour analyser un aliment ou un repas'
    },
    {
      name: 'Aide',
      examples: ['Aide', 'Comment ça marche', 'Que puis-je dire'],
      description: 'Affiche l\'aide sur les commandes vocales disponibles'
    }
  ];
}
