import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { api } from '../services/api';
import { useRouter } from 'expo-router';

const NutritionProgramScreen = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [saving, setSaving] = useState(false);
  
  // État pour la caméra et l'analyse d'image
  const [cameraPermission, setCameraPermission] = useState(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzedFood, setAnalyzedFood] = useState(null);
  const cameraRef = useRef(null);
  
  const auth = getAuth();
  const router = useRouter();

  useEffect(() => {
    fetchNutritionPlan();
    
    // Demander les permissions de caméra au chargement
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');
    })();
  }, []);

  const fetchNutritionPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      setInputError('');
      // Utilise la nouvelle route et structure
      const token = await auth.currentUser?.getIdToken?.() || "mock-token-for-demo";
      const res = await api.nutrition.getSimplePlan(token);
      setPlan(res);
      setInputValue(res.dailyCalorieTarget?.toString() || '');
      setEditMode(false);
    } catch (err) {
      if (err?.response?.status === 404) {
        setPlan(null);
        setInputValue('');
        setEditMode(true);
      } else {
        setError('Impossible de récupérer votre programme nutritionnel.');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateInput = (val) => {
    if (!val || isNaN(val)) return 'Veuillez entrer un nombre.';
    const num = Number(val);
    if (num < 1000 || num > 10000) return 'Valeur entre 1000 et 10000 kcal.';
    return '';
  };

  const handleSave = async () => {
    const errMsg = validateInput(inputValue);
    if (errMsg) {
      setInputError(errMsg);
      return;
    }
    setInputError('');
    setSaving(true);
    try {
      const token = await auth.currentUser?.getIdToken?.() || "mock-token-for-demo";
      const body = { dailyCalorieTarget: Number(inputValue) };
      const res = await api.nutrition.upsertSimplePlan(body, token);
      setPlan(res);
      setEditMode(false);
      Alert.alert('Succès', 'Objectif calorique enregistré.');
    } catch (err) {
      setInputError('Erreur lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  // Fonctions pour la caméra et l'analyse d'image
  const openCamera = () => {
    if (cameraPermission) {
      setCameraVisible(true);
    } else {
      Alert.alert(
        "Permission requise",
        "Veuillez autoriser l'accès à la caméra pour analyser vos repas.",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Paramètres", onPress: () => router.push("app-settings") }
        ]
      );
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setAnalyzeLoading(true);
        
        // Capture de l'image
        const photo = await cameraRef.current.takePictureAsync();
        
        // Compression de l'image avec ImageManipulator
        const manipResult = await ImageManipulator.manipulateAsync(
          photo.uri,
          [],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );
        
        // Ferme la caméra
        setCameraVisible(false);
        
        // Analyse de l'image avec Clarifai via notre API
        const token = await auth.currentUser?.getIdToken?.() || "mock-token-for-demo";
        const result = await api.nutrition.analyzeImage(manipResult.base64, token);
        
        if (result && result.data) {
          setAnalyzedFood(result.data);
          
          // Afficher les résultats
          Alert.alert(
            "Aliment détecté",
            `Nom: ${result.data.foodName}\nCalories estimées: ${result.data.calories} kcal`,
            [
              { text: "Annuler", style: "cancel" },
              { 
                text: "Ajouter à mon journal", 
                onPress: () => saveMealEntry(result.data)
              }
            ]
          );
        }
      } catch (error) {
        console.error("Erreur lors de l'analyse:", error);
        Alert.alert("Erreur", "Impossible d'analyser l'image. Veuillez réessayer.");
      } finally {
        setAnalyzeLoading(false);
      }
    }
  };

  // Sauvegarder l'entrée de repas analysée
  const saveMealEntry = async (foodData) => {
    try {
      const token = await auth.currentUser?.getIdToken?.() || "mock-token-for-demo";
      
      // Créer l'entrée de repas avec les données analysées
      const mealData = {
        foodName: foodData.foodName,
        calories: foodData.calories,
        timestamp: new Date().toISOString(),
        notes: "Ajouté via analyse photo"
      };
      
      // Envoyer au backend
      await api.nutrition.addMealEntry(mealData, token);
      
      Alert.alert("Succès", "Entrée de repas ajoutée à votre journal");
      
      // Réinitialiser les données analysées
      setAnalyzedFood(null);
    } catch (error) {
      console.error("Erreur lors de l'ajout du repas:", error);
      Alert.alert("Erreur", "Impossible d'ajouter l'entrée de repas");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Programme Nutritionnel</Text>
          <Text style={styles.subtitle}>Votre plan alimentaire personnalisé</Text>
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498DB" />
            <Text style={styles.loadingText}>Chargement de votre objectif...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchNutritionPlan}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            {plan && !editMode ? (
              <>
                <Text style={styles.cardTitle}>Objectif quotidien</Text>
                <Text style={styles.cardText}>{plan.dailyCalorieTarget} kcal</Text>
                <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(true)}>
                  <Text style={styles.editButtonText}>Modifier</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.cardTitle}>Définir votre objectif calorique</Text>
                <TextInput
                  value={inputValue}
                  onChangeText={setInputValue}
                  keyboardType="numeric"
                  maxLength={5}
                  style={[styles.input, inputError && { borderColor: '#C0392B' }]}
                  placeholder="Ex: 2000"
                  editable={!saving}
                />
                {inputError ? <Text style={styles.inputError}>{inputError}</Text> : null}
                <TouchableOpacity
                  style={[styles.saveButton, saving && { opacity: 0.5 }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={styles.saveButtonText}>{plan ? 'Mettre à jour' : 'Enregistrer'}</Text>
                </TouchableOpacity>
                {plan && (
                  <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={() => { 
                      setEditMode(false); 
                      setInputValue(plan.dailyCalorieTarget?.toString() || ''); 
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
            
            {/* Suivi nutritionnel */}
            <View style={styles.trackingSection}>
              <Text style={styles.trackingLabel}>
                Calories consommées aujourd'hui : <Text style={{ fontWeight: 'bold' }}>0 kcal</Text>
              </Text>
              <Text style={styles.trackingLabel}>
                Reste : <Text style={{ fontWeight: 'bold' }}>{plan?.dailyCalorieTarget ? plan.dailyCalorieTarget : '--'} kcal</Text>
              </Text>
            </View>
            
            {/* Bouton d'analyse photo */}
            <TouchableOpacity 
              style={styles.analyzeButton}
              onPress={openCamera}
              disabled={analyzeLoading}
            >
              {analyzeLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.analyzeButtonText}>Analyser un repas (photo)</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      {/* Modal pour la caméra */}
      <Modal
        visible={cameraVisible}
        animationType="slide"
        onRequestClose={() => setCameraVisible(false)}
      >
        <View style={styles.cameraContainer}>
          {cameraPermission ? (
            <>
              <Camera 
                style={styles.camera} 
                ref={cameraRef}
                type={(Camera.Constants && Camera.Constants.Type) ? Camera.Constants.Type.back : undefined}
              />
              <View style={styles.cameraControls}>
                <TouchableOpacity 
                  style={styles.cameraButton}
                  onPress={takePicture}
                >
                  <Text style={styles.cameraButtonText}>Prendre en photo</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cancelCameraButton}
                  onPress={() => setCameraVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.noCameraContainer}>
              <Text style={styles.noCameraText}>Accès à la caméra refusé</Text>
              <TouchableOpacity 
                style={styles.cancelCameraButton}
                onPress={() => setCameraVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
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
  card: {
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
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2C3E50',
  },
  cardText: {
    fontSize: 16,
    color: '#7F8C8D',
    lineHeight: 24,
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
  input: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
  },
  inputError: {
    color: '#C0392B',
    marginBottom: 8,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#2ECC71',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  editButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  editButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  trackingSection: {
    marginTop: 18,
    padding: 12,
    backgroundColor: '#ECF0F1',
    borderRadius: 8,
  },
  trackingLabel: {
    fontSize: 16,
    color: '#34495E',
    marginBottom: 4,
  },
  analyzeButton: {
    backgroundColor: '#9B59B6',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 15,
  },
  analyzeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Styles pour la caméra
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  cameraButton: {
    backgroundColor: '#2ECC71',
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  cameraButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelCameraButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  noCameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noCameraText: {
    fontSize: 18,
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default NutritionProgramScreen;
