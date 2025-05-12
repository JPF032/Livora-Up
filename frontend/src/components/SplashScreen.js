import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import LivoraLogo from './LivoraLogo';

/**
 * Écran de démarrage avec animation du logo Livora UP
 */
const SplashScreen = ({ onFinish }) => {
  // Animation de l'opacité
  const fadeAnim = new Animated.Value(0);
  
  useEffect(() => {
    // Animation d'entrée
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.delay(1000), // Maintenir visible pendant 1 seconde
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Callback pour indiquer que l'animation est terminée
      if (onFinish) {
        onFinish();
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <LivoraLogo size="large" />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SplashScreen;
