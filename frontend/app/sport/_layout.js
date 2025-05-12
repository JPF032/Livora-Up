/**
 * Layout pour la section sport de l'application
 * Ce fichier définit la structure de navigation commune pour les écrans liés au sport
 */
import { Stack } from 'expo-router';

export default function SportLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#4CAF50',
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerBackTitleVisible: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
