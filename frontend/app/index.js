import { useEffect } from 'react';
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  useEffect(() => {
    // Vérifier l'état d'authentification et naviguer en conséquence
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      // L'utilisateur est connecté, naviguer vers les onglets
      router.replace('/(tabs)');
    } else {
      // L'utilisateur n'est pas connecté, naviguer vers l'écran de connexion
      router.replace('/(auth)/login');
    }
  }, []);
  
  // Afficher un écran de chargement pendant la vérification
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3498DB" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
