import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
// import { useTheme } from '../../src/theme/ThemeProvider';
// import ThemedCard from '../../src/components/themed/ThemedCard';
// import ThemedButton from '../../src/components/themed/ThemedButton';

/**
 * Écran de démonstration des composants thématiques
 * Montre comment les différents éléments d'interface réagissent aux changements de thème
 */
export default function ThemeDemoScreen() {
  // const { theme, currentSeason } = useTheme();
  const currentSeason = 'summer'; // Valeur temporaire pour démonstration

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.pageTitle}>
        Démonstration du Thème {currentSeason === 'summer' ? 'Été' : 'Hiver'}
      </Text>
      
      <Text style={styles.sectionTitle}>
        Fonctionnalité de thème adaptatif
      </Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thème adaptatif en cours d'implémentation</Text>
        <Text style={styles.cardContent}>
          Le système de thèmes saisonniers adaptatifs est en cours d'intégration. Il permettra bientôt de personnaliser l'apparence de l'application selon vos préférences.
        </Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fonctionnalités à venir</Text>
        <Text style={styles.cardContent}>
          - Adaptation saisonnière entre thèmes Été et Hiver
          - Personnalisation par commandes vocales ou textuelles
          - Ajustement des coins, couleurs et contrastes
          - Mémorisation de vos préférences
        </Text>
      </View>
      
      <Text style={styles.sectionTitle}>
        Revenez bientôt!
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  }
});
