import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ScrollView, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'; 
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const SEA_EMOJIS = ["🌊", "🐙", "🦈", "🏝️", "⛵", "🐳", "🦀", "🐬", "🐢"];

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState("🌊");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !name) return Alert.alert("Missing Info", "All fields are required.");
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return Alert.alert("Invalid Email", "Please enter a valid email address (e.g., sailor@ocean.com).");
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8}$/;
    
    if (!passwordRegex.test(password)) {
      return Alert.alert(
        "Weak Password", 
        "Password must be exactly 8 characters long and include a letter, a number, and a special character."
      );
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCred.user.uid), {
        displayName: name,
        profilePic: selectedEmoji,
        email: email
      });

      await signOut(auth);

      Alert.alert("Success", "Account created! Now log in.");
      router.replace('/login');
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#e1f5fe' }}>
      
      <View style={styles.fixedHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/login')}>
          <Ionicons name="chevron-back" size={30} color="#fff" />
        </TouchableOpacity>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Join the Crew</Text>
        </View>
        <View style={{ width: 30 }} /> 
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.container} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>Please fill all the fields to join the crew.</Text>

            <TextInput placeholder="Full Name" value={name} onChangeText={setName} style={styles.input} maxLength={30}/>
            
            <Text style={styles.label}>Choose your avatar:</Text>
            <View style={styles.emojiGrid}>
              {SEA_EMOJIS.map(e => (
                <TouchableOpacity 
                  key={e} 
                  onPress={() => setSelectedEmoji(e)}
                  style={[styles.emojiBtn, selectedEmoji === e && styles.selectedEmojiBtn]}
                >
                  <Text style={{ fontSize: 32 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" maxLength={30} keyboardType='email-address' />
            
            <View style={styles.passwordWrapper}>
              <TextInput 
                placeholder="Password" 
                value={password} 
                onChangeText={setPassword} 
                style={styles.passwordInput} 
                secureTextEntry={!showPassword} 
                maxLength={8}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#005b96" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.regBtn} onPress={handleRegister}>
              <Text style={styles.btnText}>Register Account</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
        <View style={styles.footer}></View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#005b96',
  },
  backButton: {
    zIndex: 10,
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
    marginRight: 10, 
  },
  container: { 
    flexGrow: 1, 
    padding: 20, 
    paddingTop: 40, 
    backgroundColor: '#e1f5fe', 
    justifyContent: 'flex-start' 
  },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center', marginLeft: 20 },
  label: { color: '#005b96', fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 },
  emojiBtn: { padding: 10, borderRadius: 15, borderWidth: 2, borderColor: 'transparent' },
  selectedEmojiBtn: { borderColor: '#005b96', backgroundColor: '#fff' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 25, marginBottom: 15, borderWidth: 1.5, borderColor: '#b3e5fc' },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 25, marginBottom: 25, borderWidth: 1.5, borderColor: '#b3e5fc' },
  passwordInput: { flex: 1, padding: 15 },
  eyeIcon: { paddingHorizontal: 15 },
  regBtn: { backgroundColor: '#005b96', padding: 18, borderRadius: 25, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footer: { paddingVertical: 20, backgroundColor: '#005b96', borderTopWidth: 1, borderTopColor: '#b3e5fc', alignItems: 'center', },
});