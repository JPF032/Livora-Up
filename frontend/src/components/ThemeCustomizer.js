import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { parseVoiceCommand } from '../theme/ThemeEngine';

/**
 * Composant permettant de personnaliser le thème via des commandes textuelles
 */
const ThemeCustomizer = () => {
  const { theme, userPrefs, updatePreference, changeSeason, currentSeason, resetPreferences } = useTheme();
  const [command, setCommand] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { 
      id: '0', 
      type: 'system', 
      message: 'Je suis votre assistant de personnalisation. Comment puis-je adapter votre interface ?'
    }
  ]);
  const [suggestions, setSuggestions] = useState([]);
  const scrollViewRef = useRef();
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const inputRef = useRef();

  // Générer des suggestions basées sur l'état actuel
  useEffect(() => {
    const generateSuggestions = () => {
      const suggestionList = [
        'Interface plus arrondie',
        'Couleurs plus vives',
        'Plus de contraste',
        'Interface plus compacte',
        'Changer pour le thème ' + (currentSeason === 'summer' ? 'hiver' : 'été'),
        'Réinitialiser les préférences'
      ];
      setSuggestions(suggestionList);
    };

    generateSuggestions();
  }, [currentSeason, userPrefs]);

  // Afficher/masquer les suggestions
  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: suggestions.length > 0 ? 60 : 0,
      duration: 300,
      useNativeDriver: false
    }).start();
  }, [suggestions, animatedHeight]);

  // Traiter une commande utilisateur
  const handleCommand = (text = command) => {
    if (!text.trim()) return;

    // Ajouter la commande à l'historique
    const userCommandId = Date.now().toString();
    setChatHistory(prev => [
      ...prev,
      { id: userCommandId, type: 'user', message: text }
    ]);

    // Analyser la commande
    processCommand(text);
    
    // Réinitialiser le champ de saisie
    setCommand('');

    // Faire défiler vers le bas après l'ajout du message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Traiter la commande et générer une réponse
  const processCommand = (text) => {
    // Convertir en minuscules
    const normalizedCommand = text.toLowerCase();
    
    // Commandes spéciales pour changer de saison
    if (normalizedCommand.includes('thème été') || normalizedCommand.includes('theme ete')) {
      changeSeason('summer');
      addSystemResponse("J'ai activé le thème d'été pour vous.");
      return;
    }
    
    if (normalizedCommand.includes('thème hiver') || normalizedCommand.includes('theme hiver')) {
      changeSeason('winter');
      addSystemResponse("J'ai activé le thème d'hiver pour vous.");
      return;
    }
    
    // Commande de réinitialisation
    if (normalizedCommand.includes('réinitialiser') && normalizedCommand.includes('préférences')) {
      resetPreferences();
      addSystemResponse("J'ai réinitialisé toutes vos préférences de thème.");
      return;
    }
    
    // Utiliser le moteur de parsing pour interpréter la commande
    const newPrefs = parseVoiceCommand(text, userPrefs);
    
    // Vérifier si des modifications ont été apportées
    if (JSON.stringify(newPrefs) !== JSON.stringify(userPrefs)) {
      // Appliquer les nouvelles préférences
      Object.keys(newPrefs).forEach(key => {
        if (key !== 'sources' && userPrefs[key] !== newPrefs[key]) {
          updatePreference(key, newPrefs[key], newPrefs[`${key}Intensity`], 'manual');
        }
      });
      
      // Générer une réponse en fonction des modifications
      generateResponseFromChanges(userPrefs, newPrefs);
    } else {
      // Aucune modification détectée
      addSystemResponse("Je n'ai pas compris comment modifier votre thème. Essayez des phrases comme 'Couleurs plus vives' ou 'Interface plus arrondie'.");
    }
  };

  // Ajouter une réponse système à l'historique
  const addSystemResponse = (message) => {
    const systemResponseId = (Date.now() + 1).toString();
    setChatHistory(prev => [
      ...prev,
      { id: systemResponseId, type: 'system', message }
    ]);

    // Faire défiler vers le bas après l'ajout du message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Générer une réponse basée sur les changements de préférences
  const generateResponseFromChanges = (oldPrefs, newPrefs) => {
    let changes = [];
    
    if (oldPrefs.cornerStyle !== newPrefs.cornerStyle) {
      const direction = newPrefs.cornerStyle === 'soft' ? 'plus arrondie' : 
                        newPrefs.cornerStyle === 'sharp' ? 'plus angulaire' : 'équilibrée';
      changes.push(`l'interface est maintenant ${direction}`);
    }
    
    if (oldPrefs.colorVibrancy !== newPrefs.colorVibrancy) {
      const direction = newPrefs.colorVibrancy === 'vibrant' ? 'plus vives' : 
                        newPrefs.colorVibrancy === 'muted' ? 'plus douces' : 'équilibrées';
      changes.push(`les couleurs sont désormais ${direction}`);
    }
    
    if (oldPrefs.contrast !== newPrefs.contrast) {
      const direction = newPrefs.contrast === 'high' ? 'augmenté' : 
                        newPrefs.contrast === 'low' ? 'réduit' : 'équilibré';
      changes.push(`le contraste a été ${direction}`);
    }
    
    if (oldPrefs.spacing !== newPrefs.spacing) {
      const direction = newPrefs.spacing === 'spacious' ? 'plus aérée' : 
                        newPrefs.spacing === 'compact' ? 'plus compacte' : 'équilibrée';
      changes.push(`la mise en page est maintenant ${direction}`);
    }
    
    if (changes.length > 0) {
      const response = `J'ai modifié votre thème : ${changes.join(', ')}.`;
      addSystemResponse(response);
    } else {
      addSystemResponse("J'ai ajusté votre thème selon vos préférences.");
    }
  };

  // Appliquer une suggestion
  const applySuggestion = (suggestion) => {
    setCommand(suggestion);
    handleCommand(suggestion);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Personnalisation du thème
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.text }]}>
          Thème actuel : {currentSeason === 'summer' ? 'Été' : 'Hiver'}
        </Text>
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
      >
        {chatHistory.map((chat) => (
          <View 
            key={chat.id}
            style={[
              styles.chatBubble,
              chat.type === 'user' ? styles.userBubble : styles.systemBubble,
              { 
                backgroundColor: chat.type === 'user' 
                  ? theme.colors.primary 
                  : theme.colors.surface,
                borderRadius: theme.shape.cardBorderRadius,
                shadowColor: theme.shadows.shadowColor,
                shadowOpacity: theme.shadows.shadowOpacity,
                shadowRadius: theme.shadows.shadowRadius,
                shadowOffset: theme.shadows.shadowOffset,
              }
            ]}
          >
            <Text 
              style={[
                styles.chatText,
                { 
                  color: chat.type === 'user' 
                    ? theme.colors.textOnPrimary 
                    : theme.colors.text 
                }
              ]}
            >
              {chat.message}
            </Text>
          </View>
        ))}
      </ScrollView>
      
      <Animated.View style={[styles.suggestionsContainer, { height: animatedHeight }]}>
        <FlatList
          horizontal
          data={suggestions}
          keyExtractor={(item, index) => `suggestion-${index}`}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.suggestionChip,
                { 
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.shape.buttonBorderRadius,
                  borderColor: theme.colors.border,
                  shadowColor: theme.shadows.shadowColor,
                  shadowOpacity: theme.shadows.shadowOpacity / 2,
                  shadowRadius: theme.shadows.shadowRadius / 2,
                  shadowOffset: {
                    width: 0,
                    height: 1
                  }
                }
              ]}
              onPress={() => applySuggestion(item)}
            >
              <Text style={[styles.suggestionText, { color: theme.colors.text }]}>
                {item}
              </Text>
            </Pressable>
          )}
          contentContainerStyle={styles.suggestionsList}
        />
      </Animated.View>
      
      <View 
        style={[
          styles.inputContainer,
          { 
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            borderRadius: theme.shape.cardBorderRadius,
          }
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { 
              color: theme.colors.text,
              backgroundColor: theme.colors.background,
              borderRadius: theme.shape.inputBorderRadius,
              borderColor: theme.colors.border,
            }
          ]}
          value={command}
          onChangeText={setCommand}
          placeholder="Tapez votre commande de personnalisation..."
          placeholderTextColor={theme.colors.text + '80'} // 50% opacity
          returnKeyType="send"
          onSubmitEditing={() => handleCommand()}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { 
              backgroundColor: theme.colors.primary,
              borderRadius: theme.shape.buttonBorderRadius,
            }
          ]}
          onPress={() => handleCommand()}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={theme.colors.textOnPrimary} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingTop: 0,
  },
  chatBubble: {
    padding: 12,
    marginVertical: 6,
    maxWidth: '85%',
    elevation: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  systemBubble: {
    alignSelf: 'flex-start',
  },
  chatText: {
    fontSize: 16,
  },
  suggestionsContainer: {
    overflow: 'hidden',
  },
  suggestionsList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    elevation: 1,
  },
  suggestionText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  sendButton: {
    marginLeft: 8,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ThemeCustomizer;
