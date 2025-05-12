/**
 * Écran de détail du programme sportif
 * Affiche les informations complètes d'un programme sportif généré ou optimisé par IA
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
  Image,
  FlatList
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAISportProgram } from '../hooks/useAISportProgram';
import { handleError } from '../utils/errorHandler';

// Composant pour afficher un jour d'entraînement
const WorkoutDay = ({ day, workout, onPress }) => (
  <TouchableOpacity style={styles.workoutCard} onPress={onPress}>
    <View style={styles.workoutHeader}>
      <Text style={styles.workoutTitle}>Jour {day}: {workout.title}</Text>
      <View style={styles.workoutBadge}>
        <Text style={styles.workoutBadgeText}>{workout.duration} min</Text>
      </View>
    </View>
    
    <View style={styles.workoutContent}>
      <Text style={styles.workoutFocus}>
        Focus: {workout.focus.join(', ')}
      </Text>
      
      <Text style={styles.workoutDescription} numberOfLines={2}>
        {workout.description}
      </Text>
      
      <View style={styles.exercisePreview}>
        <Text style={styles.exerciseCount}>
          {workout.exercises?.length || 0} exercices
        </Text>
        <Ionicons name="chevron-forward" size={18} color="#4CAF50" />
      </View>
    </View>
  </TouchableOpacity>
);

// Composant pour afficher un conseil personnalisé
const Tip = ({ icon, title, content }) => (
  <View style={styles.tipCard}>
    <View style={styles.tipHeader}>
      <Ionicons name={icon} size={20} color="#4CAF50" style={styles.tipIcon} />
      <Text style={styles.tipTitle}>{title}</Text>
    </View>
    <Text style={styles.tipContent}>{content}</Text>
  </View>
);

const SportProgramDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { loading, program: hookProgram, optimizeProgram } = useAISportProgram();
  
  // Programme sportif (depuis les params ou le hook)
  const [program, setProgram] = useState(route.params?.program || hookProgram);
  
  // État pour le jour sélectionné (pour voir les détails d'un entraînement)
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Conversion du programme en tableau de jours pour l'affichage
  const workoutDays = program?.workouts?.map((workout, index) => ({
    day: index + 1,
    ...workout
  })) || [];
  
  // Tips personnalisés basés sur le programme
  const tips = [
    {
      icon: 'water',
      title: 'Hydratation',
      content: 'Pensez à boire au moins 2L d\'eau par jour, particulièrement les jours d\'entraînement intensif.'
    },
    {
      icon: 'bed',
      title: 'Récupération',
      content: 'Le repos est essentiel. Assurez-vous de dormir 7-8h par nuit pour optimiser vos résultats.'
    },
    {
      icon: 'nutrition',
      title: 'Nutrition',
      content: `Pour votre objectif de ${program?.goal || 'forme'}, privilégiez les protéines et limitez les sucres transformés.`
    }
  ];
  
  // Si le programme a été généré par IA, ajoutez des tips spécifiques
  if (program?.generatedByAI) {
    tips.push({
      icon: 'analytics',
      title: 'Conseil IA',
      content: program?.aiRecommendations?.general || 'Ce programme a été optimisé par intelligence artificielle selon votre profil.'
    });
  }
  
  // Fonctions de gestion
  const handleDayPress = (day) => {
    setSelectedDay(day);
    navigation.navigate('WorkoutDetail', { 
      workout: workoutDays.find(w => w.day === day),
      programName: program?.name 
    });
  };
  
  const handleOptimize = () => {
    // Naviguer vers l'écran de génération en mode optimisation
    navigation.navigate('AIWorkoutGenerator', { programId: program?._id });
  };
  
  const renderWorkoutDay = ({ item }) => (
    <WorkoutDay 
      day={item.day} 
      workout={item} 
      onPress={() => handleDayPress(item.day)} 
    />
  );
  
  if (!program) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Chargement du programme...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* En-tête du programme */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.programName}>{program.name}</Text>
            <Text style={styles.programSubtitle}>
              {program.level} • {program.daysPerWeek} jours/semaine
            </Text>
            
            {program.generatedByAI && (
              <View style={styles.aiBadge}>
                <Ionicons name="sparkles" size={14} color="#fff" />
                <Text style={styles.aiBadgeText}>Généré par IA</Text>
              </View>
            )}
          </View>
          
          <View style={styles.programInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Objectif</Text>
              <Text style={styles.infoValue}>{program.goal}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Niveau</Text>
              <Text style={styles.infoValue}>{program.level}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Durée</Text>
              <Text style={styles.infoValue}>{program.daysPerWeek} jours/sem</Text>
            </View>
          </View>
        </View>
        
        {/* Description du programme */}
        {program.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>À propos de ce programme</Text>
            <Text style={styles.descriptionText}>{program.description}</Text>
          </View>
        )}
        
        {/* Jours d'entraînement */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Votre plan d'entraînement</Text>
          <FlatList
            data={workoutDays}
            renderItem={renderWorkoutDay}
            keyExtractor={(item) => `day-${item.day}`}
            scrollEnabled={false}
          />
        </View>
        
        {/* Conseils personnalisés */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Conseils personnalisés</Text>
          {tips.map((tip, index) => (
            <Tip 
              key={`tip-${index}`}
              icon={tip.icon}
              title={tip.title}
              content={tip.content}
            />
          ))}
        </View>
        
        {/* Boutons d'action */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.optimizeButton]} 
            onPress={handleOptimize}
          >
            <Ionicons name="sparkles" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Optimiser ce programme</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.calendarButton]} 
            onPress={() => navigation.navigate('Calendar')}
          >
            <Ionicons name="calendar" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Voir mon planning</Text>
          </TouchableOpacity>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    marginBottom: 16,
  },
  programName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  programSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  aiBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  programInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  descriptionContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 16,
  },
  descriptionTitle: {
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
  sectionContainer: {
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  workoutHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  workoutBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  workoutBadgeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  workoutContent: {
    padding: 16,
  },
  workoutFocus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  workoutDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  exercisePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  exerciseCount: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipIcon: {
    marginRight: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  tipContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  buttonsContainer: {
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  optimizeButton: {
    backgroundColor: '#4CAF50',
  },
  calendarButton: {
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

export default SportProgramDetailScreen;
