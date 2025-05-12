/**
 * Page d'aide pour la fonctionnalité de génération de programmes sportifs avec IA
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AIWorkoutHelpScreen() {
  const router = useRouter();
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Aide - IA Sportive',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#4CAF50',
          headerTitleStyle: {
            fontWeight: '600',
          }
        }} 
      />
      
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>Programme sportif personnalisé avec IA</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comment ça fonctionne ?</Text>
            <Text style={styles.paragraph}>
              Notre technologie d'IA analyse votre profil, vos objectifs et vos préférences 
              pour créer un programme d'entraînement sur mesure adapté à vos besoins spécifiques.
            </Text>
          </View>
          
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="sparkles" size={24} color="#4CAF50" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Personnalisation avancée</Text>
              <Text style={styles.featureDescription}>
                Indiquez votre niveau, objectif, équipement disponible et zones à cibler 
                pour un programme parfaitement adapté.
              </Text>
            </View>
          </View>
          
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="mic" size={24} color="#4CAF50" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Commandes vocales</Text>
              <Text style={styles.featureDescription}>
                Utilisez votre voix pour générer un programme sportif en disant :
                "Créer programme sportif" ou "Générer programme IA".
              </Text>
            </View>
          </View>
          
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="refresh" size={24} color="#4CAF50" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Optimisation continue</Text>
              <Text style={styles.featureDescription}>
                Améliorez votre programme existant avec l'IA en fonction de vos retours
                et des changements dans vos objectifs.
              </Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comment utiliser cette fonctionnalité ?</Text>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Accédez au générateur</Text>
                <Text style={styles.stepDescription}>
                  Naviguez vers l'onglet "Sport" et appuyez sur "Créer mon programme avec IA" ou utilisez une commande vocale.
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Personnalisez votre programme</Text>
                <Text style={styles.stepDescription}>
                  Configurez les options selon vos préférences : niveau, objectif, jours d'entraînement,
                  équipement disponible et zones à cibler.
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Générez votre programme</Text>
                <Text style={styles.stepDescription}>
                  Appuyez sur "Générer mon programme" et attendez que l'IA crée votre 
                  plan personnalisé en fonction de vos paramètres.
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Suivez et optimisez</Text>
                <Text style={styles.stepDescription}>
                  Suivez votre programme et utilisez le bouton "Optimiser" pour l'affiner 
                  selon vos progrès et besoins changeants.
                </Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/sport/ai-generator')}
          >
            <Ionicons name="fitness" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Créer mon programme maintenant</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 10,
    margin: 20,
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
