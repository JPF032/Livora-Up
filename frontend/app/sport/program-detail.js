/**
 * Écran de détail du programme sportif avec Expo Router
 */
import SportProgramDetailScreen from '../../src/screens/SportProgramDetailScreen';
import { Stack } from 'expo-router';

export default function SportProgramDetailRoute() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Mon programme sportif',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#4CAF50',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }} 
      />
      <SportProgramDetailScreen />
    </>
  );
}
