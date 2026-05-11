import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const getFriendlyErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/invalid-credential':
        return "We couldn't find those credentials in our logbook. Please check your email and secret code.";
      case 'auth/invalid-email':
        return "That email address doesn't look like a valid route. Please check the format.";
      case 'auth/too-many-requests':
        return "Too many failed attempts! The tides are rough—wait a moment before trying again.";
      default:
        return "An unexpected storm hit our servers. Please check your connection.";
    }
  };

  const validateFields = () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail && !trimmedPassword) {
      Alert.alert("Empty Waters", "Please enter your Sailor Email and Secret Code.");
      return false;
    }
    if (!trimmedEmail) {
      Alert.alert("Missing Email", "We need your email to identify your ship.");
      return false;
    }
    if (!trimmedPassword) {
      Alert.alert("Missing Password", "Please enter your secret code to set sail.");
      return false;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert("Invalid Route", "That email format is not recognized by our charts.");
      return false;
    }
    return true;
  };

  const handleLogin = () => {
    if (!validateFields()) return;
    signInWithEmailAndPassword(auth, email.trim(), password.trim())
      .catch(error => {
        const message = getFriendlyErrorMessage(error.code);
        Alert.alert("Login Failed", message);
      });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#e1f5fe' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Ionicons name="boat" size={60} color="#005b96" />
              <Text style={styles.title}>Sea Friends</Text>
              <Text style={styles.subtitle}>Log in to your voyage</Text>
            </View>
            
            <TextInput 
              placeholder="Email Address" 
              value={email} 
              onChangeText={setEmail} 
              style={styles.input} 
              autoCapitalize="none"
            />

            <View style={styles.passwordWrapper}>
              <TextInput 
                placeholder="Password" 
                value={password} 
                onChangeText={setPassword} 
                style={styles.passwordInput} 
                secureTextEntry={!showPassword} 
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#005b96" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
              <Text style={styles.btnText}>Set Sail</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => router.replace('/register')}>
              <Text style={styles.linkText}>New sailor? Join the crew</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
        <View style={styles.footer}></View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#e1f5fe' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 36, fontWeight: '900', color: '#011f4b' },
  subtitle: { color: '#005b96', fontSize: 14, marginTop: 5 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 25, marginBottom: 15, borderWidth: 1.5, borderColor: '#b3e5fc' },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 25, marginBottom: 25, borderWidth: 1.5, borderColor: '#b3e5fc' },
  passwordInput: { flex: 1, padding: 15 },
  eyeIcon: { paddingHorizontal: 15 },
  loginBtn: { backgroundColor: '#005b96', padding: 18, borderRadius: 25, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkText: { color: '#005b96', textAlign: 'center', marginTop: 20, fontWeight: '600', textDecorationLine: 'underline' },
  footer: { paddingVertical: 20, backgroundColor: '#005b96', borderTopWidth: 1, borderTopColor: '#b3e5fc', alignItems: 'center', },
});