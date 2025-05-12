import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Configuration Firebase pour Livora UP
export const firebaseConfig = {
  apiKey: "AIzaSyCyS2Q2Fss3Uxj8uuVBhNt4631rLHlkukM",
  authDomain: "livora-up.firebaseapp.com",
  projectId: "livora-up",
  storageBucket: "livora-up.appspot.com",
  messagingSenderId: "205973293719",
  appId: "1:205973293719:android:891e02d0d026b1095df7d2"
};

// Initialisation de Firebase
export const app = initializeApp(firebaseConfig);

// Initialisation de l'authentification avec persistance AsyncStorage
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialisation de Firestore
export const db = getFirestore(app);
