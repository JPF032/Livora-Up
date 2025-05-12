/**
 * Écran de détail d'un entraînement spécifique avec Expo Router
 */
import WorkoutDetailScreen from '../../src/screens/WorkoutDetailScreen';
import { Stack } from 'expo-router';

export default function WorkoutDetailRoute() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Détail de l\'entraînement',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#4CAF50',
          headerTitleStyle: {
            fontWeight: '600',
          },
          animation: 'slide_from_right',
        }} 
      />
      <WorkoutDetailScreen />
    </>
  );
}
