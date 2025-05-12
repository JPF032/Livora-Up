/**
 * Écran de génération de programmes sportifs IA avec Expo Router
 */
import AIWorkoutGeneratorScreen from '../../src/screens/AIWorkoutGeneratorScreen';
import { Stack } from 'expo-router';

export default function AIWorkoutGeneratorRoute() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Créer un programme sportif',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#4CAF50',
          headerTitleStyle: {
            fontWeight: '600',
          },
          presentation: 'modal',
        }} 
      />
      <AIWorkoutGeneratorScreen />
    </>
  );
}
