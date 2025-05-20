import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { apiClient } from '../services/apiClient';
import { getAuth } from 'firebase/auth';
import { COLORS, FONTS, SIZES } from '../constants';

/**
 * Composant d'analyse nutritionnelle de nourriture par photo
 */
const FoodAnalyzer = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);
  const cameraRef = useRef(null);
  const auth = getAuth();

  // Demander la permission d'utiliser la caméra
  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    if (status === 'granted') {
      setCameraVisible(true);
    } else {
      Alert.alert(
        "Permission refusée",
        "Vous devez autoriser l'accès à la caméra pour utiliser cette fonctionnalité."
      );
    }
  };

  // Prendre une photo
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ 
          quality: 0.7,
          base64: true
        });
        setCameraVisible(false);
        setImageUri(photo.uri);
        analyzeFood(photo.base64);
      } catch (error) {
        console.error("Erreur lors de la prise de photo:", error);
        Alert.alert("Erreur", "Impossible de prendre une photo. Veuillez réessayer.");
      }
    }
  };

  // Sélectionner une image depuis la galerie
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        setImageUri(selectedAsset.uri);
        analyzeFood(selectedAsset.base64);
      }
    } catch (error) {
      console.error("Erreur lors de la sélection d'image:", error);
      Alert.alert("Erreur", "Impossible de sélectionner une image. Veuillez réessayer.");
    }
  };

  // Analyser la nourriture via l'API
  const analyzeFood = async (base64Image) => {
    try {
      setLoading(true);
      setNutritionData(null);

      // Récupérer le token Firebase
      const token = await auth.currentUser?.getIdToken?.() || "mock-token-for-demo";
      
      // Appel API pour analyser l'image
      const response = await apiClient.post(
        'nutrition-analysis/analyze-image', 
        { imageBase64: `data:image/jpeg;base64,${base64Image}` }, 
        token
      );
      
      if (response && response.data && response.data.success) {
        setNutritionData(response.data.data);
      } else {
        throw new Error(response?.data?.message || "Erreur lors de l'analyse");
      }
    } catch (error) {
      console.error("Erreur lors de l'analyse:", error);
      Alert.alert(
        "Erreur d'analyse",
        "Impossible d'analyser cette image. Assurez-vous que la photo contient clairement des aliments."
      );
    } finally {
      setLoading(false);
    }
  };

  // Formatter les valeurs nutritionnelles
  const formatNutrition = (value) => {
    return value ? Math.round(value) + "g" : "0g";
  };

  // Afficher la caméra
  if (cameraVisible) {
    return (
      <View style={styles.cameraContainer}>
        <Camera 
          style={styles.camera} 
          type={Camera.Constants.Type.back}
          ref={cameraRef}
          ratio="4:3"
        >
          <View style={styles.cameraControls}>
            <TouchableOpacity 
              style={styles.cameraButton} 
              onPress={() => setCameraVisible(false)}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.takePictureButton} 
              onPress={takePicture}
            >
              <View style={styles.takePictureButtonInner} />
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analyse Nutritionnelle</Text>
        <Text style={styles.subtitle}>
          Prenez une photo de votre repas pour obtenir ses valeurs nutritionnelles
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={requestCameraPermission}
        >
          <Ionicons name="camera" size={24} color="white" />
          <Text style={styles.buttonText}>Prendre une photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#9B59B6' }]} 
          onPress={pickImage}
        >
          <Ionicons name="images" size={24} color="white" />
          <Text style={styles.buttonText}>Choisir une image</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.foodImage} />
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Analyse en cours...</Text>
        </View>
      )}

      {nutritionData && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Résultats de l'analyse</Text>
          
          {nutritionData.detectedFoods && (
            <View style={styles.detectedFoodsContainer}>
              <Text style={styles.detectedFoodsTitle}>Aliments détectés:</Text>
              <View style={styles.detectedFoodsList}>
                {nutritionData.detectedFoods.map((food, index) => (
                  <View key={index} style={styles.foodChip}>
                    <Text style={styles.foodChipText}>{food}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.nutritionCard}>
            <View style={styles.calorieContainer}>
              <Text style={styles.calorieValue}>
                {nutritionData.nutrition?.calories || nutritionData.calories || 0}
              </Text>
              <Text style={styles.calorieUnit}>calories</Text>
            </View>

            <View style={styles.macrosContainer}>
              <View style={styles.macroItem}>
                <View style={[styles.macroIndicator, { backgroundColor: '#3498DB' }]} />
                <Text style={styles.macroValue}>
                  {formatNutrition(nutritionData.nutrition?.protein || nutritionData.protein)}
                </Text>
                <Text style={styles.macroLabel}>Protéines</Text>
              </View>
              
              <View style={styles.macroItem}>
                <View style={[styles.macroIndicator, { backgroundColor: '#E74C3C' }]} />
                <Text style={styles.macroValue}>
                  {formatNutrition(nutritionData.nutrition?.carbs || nutritionData.carbs)}
                </Text>
                <Text style={styles.macroLabel}>Glucides</Text>
              </View>
              
              <View style={styles.macroItem}>
                <View style={[styles.macroIndicator, { backgroundColor: '#F1C40F' }]} />
                <Text style={styles.macroValue}>
                  {formatNutrition(nutritionData.nutrition?.fat || nutritionData.fat)}
                </Text>
                <Text style={styles.macroLabel}>Lipides</Text>
              </View>
            </View>

            {nutritionData.source === 'nutritionix' && nutritionData.detailedFoods && (
              <View style={styles.detailedFoodsContainer}>
                <Text style={styles.detailedFoodsTitle}>Détails des aliments:</Text>
                {nutritionData.detailedFoods.map((food, index) => (
                  <View key={index} style={styles.detailedFoodItem}>
                    <View style={styles.detailedFoodHeader}>
                      <Text style={styles.detailedFoodName}>{food.name}</Text>
                      <Text style={styles.detailedFoodServing}>{food.serving}</Text>
                    </View>
                    <View style={styles.detailedFoodNutrition}>
                      <Text style={styles.detailedFoodNutritionItem}>
                        {food.calories} cal
                      </Text>
                      <Text style={styles.detailedFoodNutritionItem}>
                        P: {food.protein}g
                      </Text>
                      <Text style={styles.detailedFoodNutritionItem}>
                        G: {food.carbs}g
                      </Text>
                      <Text style={styles.detailedFoodNutritionItem}>
                        L: {food.fat}g
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.sourceContainer}>
              <Text style={styles.sourceText}>
                Source: {nutritionData.source === 'nutritionix' ? 'Nutritionix API' : 'Estimation locale'}
              </Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  button: {
    backgroundColor: '#2ECC71',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.48,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 20,
  },
  cameraButton: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 50,
    marginBottom: 20,
  },
  takePictureButton: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    marginBottom: 20,
  },
  takePictureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  foodImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#757575',
  },
  resultsContainer: {
    padding: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  detectedFoodsContainer: {
    marginBottom: 15,
  },
  detectedFoodsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#555555',
  },
  detectedFoodsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  foodChip: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  foodChipText: {
    color: '#333333',
    fontSize: 14,
  },
  nutritionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  calorieContainer: {
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 20,
  },
  calorieValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2ECC71',
  },
  calorieUnit: {
    fontSize: 18,
    color: '#757575',
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroIndicator: {
    width: 30,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  macroLabel: {
    fontSize: 14,
    color: '#757575',
  },
  detailedFoodsContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 20,
  },
  detailedFoodsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#555555',
  },
  detailedFoodItem: {
    marginBottom: 15,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
  },
  detailedFoodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailedFoodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  detailedFoodServing: {
    fontSize: 14,
    color: '#757575',
  },
  detailedFoodNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailedFoodNutritionItem: {
    fontSize: 14,
    color: '#555555',
  },
  sourceContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
});

export default FoodAnalyzer;
