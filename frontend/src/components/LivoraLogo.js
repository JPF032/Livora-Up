import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Composant logo Livora UP
 * Implémentation en code plutôt qu'en image pour assurer la compatibilité
 * et le chargement rapide dans l'application
 */
const LivoraLogo = ({ size = 'medium', style }) => {
  // Calcul des tailles en fonction de la propriété size
  const getSizes = () => {
    switch (size) {
      case 'small':
        return {
          container: { width: 100, height: 50 },
          livora: { fontSize: 20 },
          up: { width: 25, height: 25, borderWidth: 3 }
        };
      case 'large':
        return {
          container: { width: 300, height: 150 },
          livora: { fontSize: 60 },
          up: { width: 70, height: 70, borderWidth: 8 }
        };
      case 'medium':
      default:
        return {
          container: { width: 200, height: 100 },
          livora: { fontSize: 40 },
          up: { width: 45, height: 45, borderWidth: 5 }
        };
    }
  };

  const sizes = getSizes();

  return (
    <View style={[styles.container, sizes.container, style]}>
      <Text style={[styles.livoraText, sizes.livora]}>LIVORA</Text>
      <View style={[styles.upContainer, sizes.up]}>
        <View style={[styles.upVertical, { borderWidth: sizes.up.borderWidth }]} />
        <View style={[styles.upHorizontal, { borderWidth: sizes.up.borderWidth }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  livoraText: {
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 5,
  },
  upContainer: {
    position: 'relative',
  },
  upVertical: {
    position: 'absolute',
    height: '100%',
    width: 0,
    right: '30%',
    borderColor: '#FF0000',
  },
  upHorizontal: {
    position: 'absolute',
    width: '70%',
    height: 0,
    top: '30%',
    right: 0,
    borderColor: '#FF0000',
  },
});

export default LivoraLogo;
