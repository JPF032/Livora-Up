/**
 * Écran d'aide pour les commandes vocales
 * Affiche les commandes vocales disponibles et comment les utiliser
 */
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { getSupportedCommands } from '../utils/voiceCommandParser';

const VoiceCommandsHelpScreen = ({ navigation }) => {
  // Obtenir la liste des commandes supportées
  const commands = getSupportedCommands();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commandes Vocales</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.introSection}>
          <MaterialIcons name="mic" size={50} color="#3498DB" style={styles.micIcon} />
          <Text style={styles.introTitle}>Comment utiliser les commandes vocales</Text>
          <Text style={styles.introText}>
            Appuyez sur le bouton microphone dans l'application, parlez clairement et attendez 
            que votre commande soit reconnue. Voici les commandes que vous pouvez utiliser :
          </Text>
        </View>
        
        <View style={styles.commandsContainer}>
          {commands.map((command, index) => (
            <View key={index} style={styles.commandCard}>
              <Text style={styles.commandName}>{command.name}</Text>
              
              <View style={styles.examplesContainer}>
                <Text style={styles.examplesTitle}>Exemples :</Text>
                {command.examples.map((example, idx) => (
                  <View key={idx} style={styles.exampleItem}>
                    <MaterialIcons name="record-voice-over" size={16} color="#3498DB" />
                    <Text style={styles.exampleText}>{example}</Text>
                  </View>
                ))}
              </View>
              
              <Text style={styles.commandDescription}>{command.description}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Conseils pour de meilleurs résultats</Text>
          <View style={styles.tipItem}>
            <MaterialIcons name="lightbulb-outline" size={20} color="#FFA000" />
            <Text style={styles.tipText}>
              Parlez clairement et à un rythme normal.
            </Text>
          </View>
          <View style={styles.tipItem}>
            <MaterialIcons name="lightbulb-outline" size={20} color="#FFA000" />
            <Text style={styles.tipText}>
              Réduisez les bruits de fond lorsque vous utilisez les commandes vocales.
            </Text>
          </View>
          <View style={styles.tipItem}>
            <MaterialIcons name="lightbulb-outline" size={20} color="#FFA000" />
            <Text style={styles.tipText}>
              Utilisez les mots-clés spécifiques mentionnés dans les exemples.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  introSection: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  micIcon: {
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  introText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  commandsContainer: {
    paddingHorizontal: 16,
  },
  commandCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  commandName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498DB',
    marginBottom: 12,
  },
  examplesContainer: {
    marginBottom: 12,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingLeft: 8,
  },
  exampleText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#444',
  },
  commandDescription: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  tipsSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
});

export default VoiceCommandsHelpScreen;
