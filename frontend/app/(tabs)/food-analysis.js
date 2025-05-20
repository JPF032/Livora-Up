import React from 'react';
import { View, StyleSheet } from 'react-native';
import FoodAnalyzer from '../../src/components/FoodAnalyzer';

export default function FoodAnalysisScreen() {
  return (
    <View style={styles.container}>
      <FoodAnalyzer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});
