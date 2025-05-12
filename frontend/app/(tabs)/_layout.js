import { Tabs } from 'expo-router';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VoiceCommandButton from '../../src/components/VoiceCommandButton';

export default function TabsLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#3498DB',
          tabBarInactiveTintColor: '#95A5A6',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#DDDDDD',
            paddingTop: 5,
          },
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sport"
        options={{
          title: 'Sport',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fitness" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
    {/* Bouton de commande vocale flottant */}
    <View style={styles.voiceButtonContainer}>
      <VoiceCommandButton size={60} color="#3498DB" />
    </View>
  </View>);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  voiceButtonContainer: {
    position: 'absolute',
    bottom: 80, // Position au-dessus de la barre d'onglets
    alignSelf: 'center',
    zIndex: 999, // S'assurer qu'il est au-dessus des autres éléments
  },
});
