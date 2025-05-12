import { Stack } from 'expo-router';

export default function HelpLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#3498DB',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="voice-commands"
        options={{
          title: 'Commandes Vocales',
        }}
      />
    </Stack>
  );
}
