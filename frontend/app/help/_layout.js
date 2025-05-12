/**
 * Layout pour la section aide de l'application
 */
import { Stack } from 'expo-router';

export default function HelpLayout() {
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
      }}
    />
  );
}
