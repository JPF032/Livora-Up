import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../services/apiClient';
import { getAuth } from 'firebase/auth';

/**
 * Composant de bouton pour générer un plan nutritionnel basé sur le programme sportif actif
 * @param {Object} props - Propriétés du composant
 * @param {Function} props.onSuccess - Callback appelé après la génération réussie
 * @param {String} props.style - Styles supplémentaires pour le bouton
 */
const GenerateNutritionPlanButton = ({ onSuccess, style }) => {
  const [loading, setLoading] = useState(false);
  const auth = getAuth();

  const handleGeneratePlan = async () => {
    try {
      setLoading(true);
      
      // Confirmation de l'utilisateur
      Alert.alert(
        "Générer un plan nutritionnel",
        "Voulez-vous générer un plan nutritionnel basé sur votre programme sportif actuel? Cela peut prendre jusqu'à 30 secondes.",
        [
          { text: "Annuler", style: "cancel" },
          { 
            text: "Générer", 
            onPress: async () => {
              try {
                // Récupérer le token Firebase
                const token = await auth.currentUser?.getIdToken?.() || "mock-token-for-demo";
                
                // Appel API pour générer le plan
                const response = await apiClient.post(
                  'nutrition-programs/generate-from-sport', 
                  {}, // Pas besoin de données supplémentaires, le backend utilisera le programme sportif actif
                  token
                );
                
                if (response && response.data) {
                  // Succès
                  Alert.alert(
                    "Plan nutritionnel généré",
                    "Votre plan nutritionnel personnalisé a été créé avec succès. Il est maintenant disponible dans l'onglet Nutrition.",
                    [{ text: "Voir le plan", onPress: onSuccess }]
                  );
                } else {
                  throw new Error("Réponse invalide du serveur");
                }
              } catch (err) {
                console.error("Erreur lors de la génération du plan nutritionnel:", err);
                
                let errorMessage = "Une erreur s'est produite lors de la génération de votre plan nutritionnel.";
                
                // Messages d'erreur spécifiques selon le cas
                if (err.response?.status === 404) {
                  errorMessage = "Vous devez d'abord générer un programme sportif avant de créer un plan nutritionnel.";
                } else if (err.message?.includes("Clarifai")) {
                  errorMessage = "Le service d'IA est temporairement indisponible. Veuillez réessayer plus tard.";
                }
                
                Alert.alert("Erreur", errorMessage);
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error("Erreur:", error);
      setLoading(false);
      Alert.alert("Erreur", "Une erreur s'est produite. Veuillez réessayer plus tard.");
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handleGeneratePlan}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <View style={styles.buttonContent}>
          <Ionicons name="nutrition" size={20} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.buttonText}>Générer un plan nutritionnel</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#9B59B6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  icon: {
    marginRight: 8,
  }
});

export default GenerateNutritionPlanButton;
