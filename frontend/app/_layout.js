import { useEffect, useState, useCallback } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { ThemeProvider } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useCustomFonts } from '../src/utils/fontsLoader';
import { fontTheme } from '../src/utils/fontTheme';
import { auth } from '../src/services/firebaseConfig';

// Prévenir la fermeture automatique du splash screen
SplashScreen.preventAutoHideAsync().catch(err => {
  console.warn("Erreur lors de la prévention de la fermeture du splash screen:", err);
});

// Fonction pour construire le thème avec des polices sécurisées
const getTheme = (fontsLoaded) => ({
  dark: false,
  colors: {
    primary: '#3498DB',
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#2C3E50',
    border: '#DDDDDD',
    notification: '#E74C3C',
  },
  fonts: fontTheme(fontsLoaded),
});

export default function RootLayout() {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  
  // Utiliser useRouter pour accéder aux fonctionnalités de routage de manière sécurisée
  const router = useRouter();
  
  // Charger les polices avec le hook useCustomFonts
  const [fontsLoaded] = useCustomFonts();
  
  // Callback pour cacher le splash screen une fois les polices chargées
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && initialized) {
      await SplashScreen.hideAsync().catch(err => {
        console.warn("Erreur lors de la fermeture du splash screen:", err);
      });
    }
  }, [fontsLoaded, initialized]);
  
  // Construire le thème avec ou sans polices personnalisées
  const theme = getTheme(fontsLoaded);

  useEffect(() => {
    // On utilise l'instance auth déjà initialisée avec AsyncStorage
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthenticated(!!user);
      setInitialized(true);
      
      // onLayoutRootView sera appelé quand tout est prêt
      
      // Navigate based on authentication state
      if (user) {
        // User is signed in, redirect to tabs
        // Utilisation sécurisée de getState avec optional chaining
        const currentRoute = router.canGoBack() 
          ? (router.getState?.()?.routes?.[router.getState?.()?.index]?.name || '') 
          : '';
        if (currentRoute.includes('(auth)')) {
          router.replace('/(tabs)');
        }
      } else {
        // User is signed out, redirect to login
        // Utilisation sécurisée de getState avec optional chaining
        const currentRoute = router.canGoBack() 
          ? (router.getState?.()?.routes?.[router.getState?.()?.index]?.name || '') 
          : '';
        if (currentRoute.includes('(tabs)')) {
          router.replace('/(auth)/login');
        }
      }
    });
    
    // Cleanup on unmount
    return () => unsubscribe();
  }, []);
  
  // Montrer un écran vide pendant le chargement
  if (!initialized || !fontsLoaded) {
    return null;
  }
  
  return (
    <ThemeProvider value={theme}>
      <SafeAreaProvider onLayout={onLayoutRootView}>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            // Utiliser les polices chargées et configurées de manière sécurisée
            headerTitleStyle: { fontFamily: fontsLoaded ? 'OpenSans-Bold' : 'System' },
            headerBackTitleStyle: { fontFamily: fontsLoaded ? 'OpenSans-Regular' : 'System' },
          }}
        >
          {/* Authentication stacks */}
          <Stack.Screen
            name="(auth)/login"
          />
          <Stack.Screen
            name="(auth)/register"
          />
          <Stack.Screen
            name="(auth)/forgot-password"
          />
          
          {/* Protected routes */}
          <Stack.Screen
            name="(tabs)"
          />
          <Stack.Screen
            name="index"
          />
        </Stack>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
