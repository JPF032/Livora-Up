import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const auth = getAuth();
  const router = useRouter();

  const handleResetPassword = async () => {
    // Validation basique
    if (!email || !email.includes('@')) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (error) {
      let errorMessage = 'Impossible d\'envoyer l\'email de réinitialisation';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Format d\'email invalide';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Aucun compte ne correspond à cet email';
          break;
        default:
          errorMessage = `Erreur: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Livora UP</Text>
          <Text style={styles.subtitle}>Réinitialisation</Text>

          {success ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                Un email de réinitialisation a été envoyé à {email}.
              </Text>
              <Text style={styles.successSubtext}>
                Veuillez vérifier votre boîte de réception et suivre les instructions.
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => router.replace('/login')}
              >
                <Text style={styles.buttonText}>Retour à la connexion</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.instructions}>
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </Text>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TouchableOpacity 
                style={styles.button}
                onPress={handleResetPassword}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Envoi en cours...' : 'Réinitialiser le mot de passe'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>Retour</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2C3E50',
  },
  subtitle: {
    fontSize: 24,
    marginBottom: 30,
    color: '#34495E',
  },
  instructions: {
    textAlign: 'center',
    color: '#7F8C8D',
    marginBottom: 20,
    fontSize: 16,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#F8F9FA',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#3498DB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#E74C3C',
    marginBottom: 15,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    padding: 10,
  },
  backButtonText: {
    color: '#34495E',
    fontSize: 16,
  },
  successContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#EAF7FF',
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
  },
  successText: {
    fontSize: 18,
    color: '#2980B9',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  successSubtext: {
    color: '#34495E',
    textAlign: 'center',
    marginBottom: 25,
  },
});
