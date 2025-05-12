/**
 * Écran de génération de programmes sportifs avec IA
 * Permet aux utilisateurs de configurer et générer des programmes personnalisés
 */
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Switch
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAISportProgram } from '../hooks/useAISportProgram';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import { handleError } from '../utils/errorHandler';

// Composant d'option de focus corporel
const FocusAreaOption = ({ label, isSelected, onToggle }) => (
  <TouchableOpacity 
    style={[styles.focusOption, isSelected && styles.focusOptionSelected]} 
    onPress={onToggle}
  >
    <Text style={[styles.focusOptionText, isSelected && styles.focusOptionTextSelected]}>
      {label}
    </Text>
    {isSelected && (
      <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={styles.checkIcon} />
    )}
  </TouchableOpacity>
);

// Composant d'option d'équipement
const EquipmentOption = ({ label, isSelected, onToggle }) => (
  <TouchableOpacity 
    style={[styles.equipmentOption, isSelected && styles.equipmentOptionSelected]} 
    onPress={onToggle}
  >
    <Text style={[styles.equipmentOptionText, isSelected && styles.equipmentOptionTextSelected]}>
      {label}
    </Text>
    {isSelected && (
      <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={styles.checkIcon} />
    )}
  </TouchableOpacity>
);

const AIWorkoutGeneratorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { loading, program, generateProgram, optimizeProgram } = useAISportProgram();
  
  // État local pour les options de configuration
  const [level, setLevel] = useState('debutant');
  const [goal, setGoal] = useState('general');
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [useAI, setUseAI] = useState(true);
  const [cardioPreference, setCardioPreference] = useState('medium');
  const [focusAreas, setFocusAreas] = useState([]);
  const [equipment, setEquipment] = useState(['none']);
  const [regenerate, setRegenerate] = useState(true);
  
  // Options disponibles
  const levelOptions = [
    { label: 'Débutant', value: 'debutant' },
    { label: 'Intermédiaire', value: 'intermediaire' },
    { label: 'Avancé', value: 'avance' }
  ];
  
  const goalOptions = [
    { label: 'Forme générale', value: 'general' },
    { label: 'Perte de poids', value: 'perte_poids' },
    { label: 'Prise de muscle', value: 'prise_muscle' },
    { label: 'Endurance', value: 'endurance' },
    { label: 'Force', value: 'force' }
  ];
  
  const availableFocusAreas = [
    { label: 'Bras', value: 'bras' },
    { label: 'Jambes', value: 'jambes' },
    { label: 'Dos', value: 'dos' },
    { label: 'Poitrine', value: 'poitrine' },
    { label: 'Abdominaux', value: 'abdominaux' },
    { label: 'Épaules', value: 'epaules' },
    { label: 'Cardio', value: 'cardio' }
  ];
  
  const availableEquipment = [
    { label: 'Aucun équipement', value: 'none' },
    { label: 'Haltères', value: 'halteres' },
    { label: 'Élastiques', value: 'elastiques' },
    { label: 'Kettlebell', value: 'kettlebell' },
    { label: 'Barre de traction', value: 'barre_traction' },
    { label: 'Banc', value: 'banc' },
    { label: 'TRX', value: 'trx' }
  ];
  
  // Gestion des zones de focus
  const toggleFocusArea = (area) => {
    if (focusAreas.includes(area)) {
      setFocusAreas(focusAreas.filter(a => a !== area));
    } else {
      setFocusAreas([...focusAreas, area]);
    }
  };
  
  // Gestion des équipements
  const toggleEquipment = (item) => {
    if (item === 'none') {
      // Si "aucun équipement" est sélectionné, désélectionner tous les autres
      if (!equipment.includes('none')) {
        setEquipment(['none']);
      }
      return;
    }
    
    // Si un autre équipement est sélectionné, retirer "aucun équipement"
    let newEquipment = equipment.filter(e => e !== 'none');
    
    if (newEquipment.includes(item)) {
      newEquipment = newEquipment.filter(e => e !== item);
    } else {
      newEquipment = [...newEquipment, item];
    }
    
    // Si aucun équipement n'est sélectionné, ajouter "none"
    if (newEquipment.length === 0) {
      newEquipment = ['none'];
    }
    
    setEquipment(newEquipment);
  };
  
  // Fonction de génération du programme
  const handleGenerateProgram = async () => {
    try {
      // Préparer les options
      const options = {
        level,
        goal,
        daysPerWeek,
        useAI,
        regenerate,
        preferences: {
          cardioPreference,
          equipmentAvailable: equipment,
          focusAreas
        }
      };
      
      // Générer le programme
      const result = await generateProgram(options);
      
      if (result) {
        // Rediriger vers l'écran de visualisation du programme
        navigation.navigate('SportProgramDetail', { program: result });
      }
    } catch (error) {
      const errorInfo = handleError(error, 'Génération du programme', true);
      Alert.alert('Erreur', errorInfo.message);
    }
  };
  
  // Fonction d'optimisation du programme
  const handleOptimizeProgram = async () => {
    try {
      // Vérifier si un programme existe
      if (!route.params?.programId) {
        Alert.alert(
          'Information', 
          'Pour optimiser un programme, vous devez d\'abord en créer un.'
        );
        return;
      }
      
      // Préparer les options
      const options = {
        programId: route.params.programId,
        preferences: {
          cardioPreference,
          equipmentAvailable: equipment,
          focusAreas
        }
      };
      
      // Optimiser le programme
      const result = await optimizeProgram(options);
      
      if (result) {
        // Rediriger vers l'écran de visualisation du programme
        navigation.navigate('SportProgramDetail', { program: result });
      }
    } catch (error) {
      const errorInfo = handleError(error, 'Optimisation du programme', true);
      Alert.alert('Erreur', errorInfo.message);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Créez votre programme sportif</Text>
          <Text style={styles.subtitle}>
            Personnalisez votre entraînement selon vos besoins et objectifs
          </Text>
        </View>
        
        {/* Option IA */}
        <View style={styles.optionContainer}>
          <Text style={styles.optionTitle}>Utiliser l'IA pour la génération</Text>
          <View style={styles.aiToggleContainer}>
            <Text style={styles.aiOptionText}>
              {useAI ? 'Programme optimisé par IA' : 'Programme standard'}
            </Text>
            <Switch
              trackColor={{ false: "#767577", true: "#4CAF50" }}
              thumbColor={useAI ? "#fff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setUseAI}
              value={useAI}
            />
          </View>
          <Text style={styles.optionDescription}>
            {useAI ? 
              'L\'intelligence artificielle va créer un programme personnalisé en fonction de votre profil et préférences.' : 
              'Un programme standard sera créé selon des modèles prédéfinis.'}
          </Text>
        </View>
        
        {/* Option Niveau */}
        <View style={styles.optionContainer}>
          <Text style={styles.optionTitle}>Votre niveau</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={level}
              onValueChange={setLevel}
              style={styles.picker}
            >
              {levelOptions.map(option => (
                <Picker.Item 
                  key={option.value} 
                  label={option.label} 
                  value={option.value}
                />
              ))}
            </Picker>
          </View>
        </View>
        
        {/* Option Objectif */}
        <View style={styles.optionContainer}>
          <Text style={styles.optionTitle}>Votre objectif principal</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={goal}
              onValueChange={setGoal}
              style={styles.picker}
            >
              {goalOptions.map(option => (
                <Picker.Item 
                  key={option.value} 
                  label={option.label} 
                  value={option.value}
                />
              ))}
            </Picker>
          </View>
        </View>
        
        {/* Option Jours par semaine */}
        <View style={styles.optionContainer}>
          <Text style={styles.optionTitle}>
            Jours d'entraînement par semaine: {daysPerWeek}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={2}
            maximumValue={6}
            step={1}
            minimumTrackTintColor="#4CAF50"
            maximumTrackTintColor="#000000"
            thumbTintColor="#4CAF50"
            value={daysPerWeek}
            onValueChange={setDaysPerWeek}
          />
          <View style={styles.sliderLabels}>
            <Text>2</Text>
            <Text>3</Text>
            <Text>4</Text>
            <Text>5</Text>
            <Text>6</Text>
          </View>
        </View>
        
        {/* Option Cardio */}
        <View style={styles.optionContainer}>
          <Text style={styles.optionTitle}>Préférence cardio</Text>
          <View style={styles.cardioOptions}>
            <TouchableOpacity 
              style={[styles.cardioOption, cardioPreference === 'low' && styles.cardioOptionSelected]} 
              onPress={() => setCardioPreference('low')}
            >
              <Text style={styles.cardioOptionText}>Faible</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.cardioOption, cardioPreference === 'medium' && styles.cardioOptionSelected]} 
              onPress={() => setCardioPreference('medium')}
            >
              <Text style={styles.cardioOptionText}>Modéré</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.cardioOption, cardioPreference === 'high' && styles.cardioOptionSelected]} 
              onPress={() => setCardioPreference('high')}
            >
              <Text style={styles.cardioOptionText}>Intensif</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Option Zones de focus */}
        <View style={styles.optionContainer}>
          <Text style={styles.optionTitle}>Zones de focus (optionnel)</Text>
          <Text style={styles.optionDescription}>
            Sélectionnez les zones du corps que vous souhaitez cibler prioritairement
          </Text>
          <View style={styles.focusOptions}>
            {availableFocusAreas.map(area => (
              <FocusAreaOption
                key={area.value}
                label={area.label}
                isSelected={focusAreas.includes(area.value)}
                onToggle={() => toggleFocusArea(area.value)}
              />
            ))}
          </View>
        </View>
        
        {/* Option Équipement */}
        <View style={styles.optionContainer}>
          <Text style={styles.optionTitle}>Équipement disponible</Text>
          <Text style={styles.optionDescription}>
            Sélectionnez les équipements que vous avez à disposition
          </Text>
          <View style={styles.equipmentOptions}>
            {availableEquipment.map(item => (
              <EquipmentOption
                key={item.value}
                label={item.label}
                isSelected={equipment.includes(item.value)}
                onToggle={() => toggleEquipment(item.value)}
              />
            ))}
          </View>
        </View>
        
        {/* Boutons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.generateButton]} 
            onPress={handleGenerateProgram}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="fitness" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Générer mon programme</Text>
              </>
            )}
          </TouchableOpacity>
          
          {route.params?.programId && (
            <TouchableOpacity 
              style={[styles.button, styles.optimizeButton]} 
              onPress={handleOptimizeProgram}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Optimiser mon programme</Text>
                </>
              )}
            </TouchableOpacity>
          )}
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  optionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  aiToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiOptionText: {
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  cardioOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardioOption: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardioOptionSelected: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  cardioOptionText: {
    fontSize: 14,
    color: '#333',
  },
  focusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  focusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
  },
  focusOptionSelected: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  focusOptionText: {
    fontSize: 14,
    color: '#333',
  },
  focusOptionTextSelected: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  equipmentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  equipmentOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
  },
  equipmentOptionSelected: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  equipmentOptionText: {
    fontSize: 14,
    color: '#333',
  },
  equipmentOptionTextSelected: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 4,
  },
  buttonsContainer: {
    marginVertical: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  generateButton: {
    backgroundColor: '#4CAF50',
  },
  optimizeButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  }
});

export default AIWorkoutGeneratorScreen;
