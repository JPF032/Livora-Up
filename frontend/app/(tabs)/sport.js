import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import { useRouter } from 'expo-router';
import { useAISportProgram } from '../../src/hooks/useAISportProgram';
import GenerateNutritionPlanButton from '../../src/components/GenerateNutritionPlanButton';

export default function SportProgramScreen() {
  const router = useRouter();
  const { program, loading, error, fetchProgram } = useAISportProgram();
  
  const auth = getAuth();

  useEffect(() => {
    fetchProgram();
  }, []);

  const handleExerciseCompletion = async (exerciseId, completed) => {
    try {
      const token = await auth.currentUser?.getIdToken?.() || "mock-token-for-demo";
      await api.sport.updateExerciseStatus(exerciseId, { completed }, token);
      
      // Mettre à jour localement l'état de l'exercice
      setProgram(prevProgram => {
        if (!prevProgram) return null;
        
        // Copie profonde du programme
        const updatedProgram = JSON.parse(JSON.stringify(prevProgram));
        
        // Parcourir les jours et exercices pour trouver et mettre à jour celui qui correspond à l'ID
        updatedProgram.days.forEach(day => {
          day.exercises.forEach(exercise => {
            if (exercise._id === exerciseId) {
              exercise.completed = completed;
            }
          });
        });
        
        return updatedProgram;
      });
      
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut de l\'exercice.');
      console.error('Erreur:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Programme Sportif</Text>
          <Text style={styles.subtitle}>Votre entraînement personnalisé</Text>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498DB" />
            <Text style={styles.loadingText}>Chargement de votre programme...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchProgram}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : program ? (
          <View>
            <View style={styles.actionButtons}>
              <GenerateNutritionPlanButton 
                onSuccess={() => router.push('/nutrition')} 
                style={styles.nutritionPlanButton}
              />
            </View>
            
            {program.days.map((day, index) => (
              <View key={day._id || index} style={styles.dayCard}>
                <Text style={styles.dayTitle}>{day.name}</Text>
                
                {day.exercises.map((exercise) => (
                  <View key={exercise._id} style={styles.exerciseItem}>
                    <View style={styles.exerciseHeader}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <TouchableOpacity
                        onPress={() => handleExerciseCompletion(exercise._id, !exercise.completed)}
                        style={[
                          styles.completeButton,
                          exercise.completed && styles.completedButton
                        ]}
                      >
                        {exercise.completed ? (
                          <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                        ) : (
                          <Ionicons name="checkmark-circle-outline" size={24} color="#FFFFFF" />
                        )}
                      </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.exerciseDetails}>
                      {exercise.sets} séries • {exercise.reps} répétitions
                    </Text>
                    
                    {exercise.notes && (
                      <Text style={styles.exerciseNotes}>{exercise.notes}</Text>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun programme sportif trouvé.</Text>
            <Text style={styles.emptySubtext}>Générez un programme personnalisé avec notre assistant IA.</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/sport/ai-generator')}
            >
              <Ionicons name="sparkles" size={18} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.createButtonText}>Créer mon programme avec IA</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Fonction pour naviguer vers les détails d'un exercice
const navigateToExerciseDetail = (exercise) => {
  router.push({
    pathname: '/sport/exercise-detail',
    params: { exercise: JSON.stringify(exercise) }
  });
};

// Fonction pour naviguer vers l'optimisation du programme
const handleOptimizeProgram = () => {
  if (program && program._id) {
    router.push({
      pathname: '/sport/ai-generator',
      params: { programId: program._id }
    });
  } else {
    Alert.alert(
      'Erreur', 
      'Impossible de trouver le programme à optimiser. Veuillez réessayer.'
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#34495E',
  },
  loadingContainer: {
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7F8C8D',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#FADBD8',
    borderRadius: 10,
    alignItems: 'center',
  },
  errorText: {
    color: '#C0392B',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  exerciseItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 15,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495E',
    flex: 1,
  },
  completeButton: {
    backgroundColor: '#3498DB',
    borderRadius: 20,
    padding: 5,
  },
  completedButton: {
    backgroundColor: '#2ECC71',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  exerciseNotes: {
    fontSize: 14,
    color: '#95A5A6',
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 10,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  buttonIcon: {
    marginRight: 8,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
