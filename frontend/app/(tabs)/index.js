import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const router = useRouter();

  useEffect(() => {
    // Récupérer les informations utilisateur
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser({
        displayName: currentUser.displayName || 'Utilisateur',
        email: currentUser.email,
      });
    }
  }, []);

  const fetchProgram = () => {
    // Code pour récupérer le programme sportif
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchProgram()}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.header}>
          <Text style={styles.title}>Bienvenue {user?.displayName}</Text>
          <Text style={styles.subtitle}>Tableau de bord</Text>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push('/sport')}
          >
            <Ionicons name="fitness" size={40} color="#3498DB" />
            <Text style={styles.cardTitle}>Programme sportif</Text>
            <Text style={styles.cardSubtitle}>Suivez votre progression</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push('/nutrition')}
          >
            <Ionicons name="restaurant" size={40} color="#2ECC71" />
            <Text style={styles.cardTitle}>Nutrition</Text>
            <Text style={styles.cardSubtitle}>Gérez votre alimentation</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push('/profile')}
          >
            <Ionicons name="person" size={40} color="#9B59B6" />
            <Text style={styles.cardTitle}>Profil</Text>
            <Text style={styles.cardSubtitle}>Configurez vos préférences</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.card, styles.analysisCard]}
            onPress={() => router.push('/nutrition')}
          >
            <Ionicons name="camera" size={40} color="#E74C3C" />
            <Text style={styles.cardTitle}>Analyse alimentaire</Text>
            <Text style={styles.cardSubtitle}>Prenez en photo vos repas</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  analysisCard: {
    backgroundColor: '#FADBD8',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 15,
    marginBottom: 5,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
});
