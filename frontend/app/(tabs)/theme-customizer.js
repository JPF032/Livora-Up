import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Écran de personnalisation du thème
 * Permet aux utilisateurs de personnaliser l'apparence de l'application
 * via des commandes textuelles ou vocales
 */
export default function ThemeCustomizationScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={styles.title}>Personnalisation du Thème</Text>
        <Text style={styles.subtitle}>Fonctionnalité en cours d'intégration</Text>
        <Text style={styles.message}>
          Le système de personnalisation de thème par commandes textuelles est en cours de développement.
        </Text>
        <Text style={styles.message}>
          Bientôt, vous pourrez ajuster l'apparence de l'application avec des commandes comme:
        </Text>
        <View style={styles.exampleContainer}>
          <Text style={styles.example}>"Couleurs plus vives"</Text>
          <Text style={styles.example}>"Interface plus arrondie"</Text>
          <Text style={styles.example}>"Plus de contraste"</Text>
          <Text style={styles.example}>"Thème hiver"</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messageContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3498DB',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: '#7f8c8d',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#34495e',
  },
  exampleContainer: {
    marginTop: 20,
    width: '100%',
  },
  example: {
    fontSize: 16,
    padding: 10,
    marginVertical: 5,
    backgroundColor: 'white',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
