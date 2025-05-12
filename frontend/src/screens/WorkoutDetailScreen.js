/**
 * Écran de détail d'un entraînement
 * Affiche les exercices et instructions pour un jour d'entraînement spécifique
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Modal
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

// Composant pour afficher un exercice dans la liste
const ExerciseItem = ({ exercise, onPress }) => (
  <TouchableOpacity style={styles.exerciseItem} onPress={onPress}>
    <View style={styles.exerciseImageContainer}>
      {exercise.imageUrl ? (
        <Image 
          source={{ uri: exercise.imageUrl }} 
          style={styles.exerciseImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.exercisePlaceholder}>
          <Ionicons name="fitness" size={30} color="#aaa" />
        </View>
      )}
    </View>
    
    <View style={styles.exerciseInfo}>
      <Text style={styles.exerciseName}>{exercise.name}</Text>
      <Text style={styles.exerciseDetail}>{exercise.sets} séries • {exercise.reps}</Text>
    </View>
    
    <Ionicons name="information-circle-outline" size={24} color="#4CAF50" />
  </TouchableOpacity>
);

// Composant Modal pour les détails d'un exercice
const ExerciseDetailModal = ({ exercise, visible, onClose }) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{exercise?.name}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          {exercise?.imageUrl && (
            <Image 
              source={{ uri: exercise.imageUrl }} 
              style={styles.modalImage}
              resizeMode="cover"
            />
          )}
          
          <View style={styles.exerciseStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Séries</Text>
              <Text style={styles.statValue}>{exercise?.sets}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Répétitions</Text>
              <Text style={styles.statValue}>{exercise?.reps}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Repos</Text>
              <Text style={styles.statValue}>{exercise?.rest || '60s'}</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{exercise?.description || "Pas de description disponible."}</Text>
          </View>
          
          {exercise?.instructions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Instructions</Text>
              {exercise.instructions.map((instruction, index) => (
                <View key={`instruction-${index}`} style={styles.instructionItem}>
                  <Text style={styles.instructionNumber}>{index + 1}</Text>
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
            </View>
          )}
          
          {exercise?.tips && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Conseils</Text>
              {exercise.tips.map((tip, index) => (
                <View key={`tip-${index}`} style={styles.tipItem}>
                  <Ionicons name="bulb-outline" size={18} color="#4CAF50" style={styles.tipIcon} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
        
        <TouchableOpacity style={styles.startButton} onPress={onClose}>
          <Text style={styles.startButtonText}>Compris</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const WorkoutDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { workout, programName } = route.params || {};
  
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Gérer l'appui sur un exercice
  const handleExercisePress = (exercise) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedExercise(exercise);
    setModalVisible(true);
  };
  
  // Fermer le modal
  const closeModal = () => {
    setModalVisible(false);
  };
  
  if (!workout) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Informations d'entraînement non disponibles</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.programName}>{programName || 'Programme sportif'}</Text>
          <Text style={styles.workoutTitle}>Jour {workout.day}: {workout.title}</Text>
          
          <View style={styles.workoutMetrics}>
            <View style={styles.metricItem}>
              <Ionicons name="time-outline" size={18} color="#4CAF50" />
              <Text style={styles.metricText}>{workout.duration} min</Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons name="flame-outline" size={18} color="#FF5722" />
              <Text style={styles.metricText}>{workout.intensity || 'Modéré'}</Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons name="barbell-outline" size={18} color="#2196F3" />
              <Text style={styles.metricText}>{workout.focus.join(', ')}</Text>
            </View>
          </View>
        </View>
        
        {/* Description */}
        {workout.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>{workout.description}</Text>
          </View>
        )}
        
        {/* Échauffement */}
        {workout.warmup && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flame-outline" size={20} color="#FF5722" />
              <Text style={styles.sectionTitle}>Échauffement</Text>
            </View>
            <Text style={styles.warmupText}>{workout.warmup}</Text>
          </View>
        )}
        
        {/* Liste des exercices */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="barbell-outline" size={20} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Exercices</Text>
          </View>
          
          {workout.exercises?.map((exercise, index) => (
            <ExerciseItem 
              key={`exercise-${index}`}
              exercise={exercise}
              onPress={() => handleExercisePress(exercise)}
            />
          ))}
          
          {(!workout.exercises || workout.exercises.length === 0) && (
            <Text style={styles.noExercisesText}>
              Aucun exercice disponible pour cet entraînement.
            </Text>
          )}
        </View>
        
        {/* Étirements */}
        {workout.cooldown && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="water-outline" size={20} color="#2196F3" />
              <Text style={styles.sectionTitle}>Récupération</Text>
            </View>
            <Text style={styles.cooldownText}>{workout.cooldown}</Text>
          </View>
        )}
        
        {/* Conseils généraux */}
        {workout.tips && workout.tips.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb-outline" size={20} color="#FFC107" />
              <Text style={styles.sectionTitle}>Conseils</Text>
            </View>
            {workout.tips.map((tip, index) => (
              <View key={`workout-tip-${index}`} style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" style={styles.tipIcon} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Bouton pour démarrer l'entraînement */}
        <TouchableOpacity 
          style={styles.startWorkoutButton}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // Navigation vers un potentiel écran de suivi d'entraînement
            Alert.alert('Entraînement démarré', 'Bon courage pour votre séance!');
          }}
        >
          <Ionicons name="play-circle" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.startWorkoutButtonText}>Démarrer cet entraînement</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Modal pour les détails d'exercice */}
      <ExerciseDetailModal 
        exercise={selectedExercise}
        visible={modalVisible}
        onClose={closeModal}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
    padding: 20,
  },
  backButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 40,
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  programName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  workoutMetrics: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  metricText: {
    color: '#333',
    fontSize: 12,
    marginLeft: 4,
  },
  descriptionContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  warmupText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  cooldownText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  noExercisesText: {
    fontSize: 15,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exerciseImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  exercisePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  exerciseDetail: {
    fontSize: 14,
    color: '#666',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  tipIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  startWorkoutButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 10,
    margin: 16,
  },
  startWorkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  exerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  instructionNumber: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
    marginTop: 2,
  },
  instructionText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WorkoutDetailScreen;
