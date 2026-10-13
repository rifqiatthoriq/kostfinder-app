import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { saveSecureData } from '../utils/storage';

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Email dan Password wajib diisi!');
      return;
    }

    // Task 01: Simulasi Credential Validation via API & Menerima Access Token (JWT)
    if (
      (email === 'rifqiatthoriq847gmailcom@webmail.umm.ac.id' || email === 'mahasiswa@umm.ac.id') && 
      password === '123456'
    ) {
      setErrorMessage('');
      
      // Token JWT Dummy sesuai materi Sprint 04
      const mockJwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IlJpZnFpIEF0dGhvcmlxIiwicm9sZSI6InN0dWRlbnQifQ.sample_signature";
      
      // Menyimpan access token secara aman ke SecureStore
      await saveSecureData('user_token', mockJwtToken);
      Alert.alert('Sukses', 'Login berhasil! Access token diterima.');
      
      onLoginSuccess(mockJwtToken);
    } else {
      setErrorMessage('Email/Password salah!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>KostFinder</Text>
      <Text style={styles.subtitle}>Aplikasi Katalog Kos Area Kampus</Text>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>MASUK</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F8F9FA' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#007AFF', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6C757D', textAlign: 'center', marginBottom: 24 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CED4DA', padding: 14, borderRadius: 10, marginBottom: 12 },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  errorText: { color: '#DC3545', textAlign: 'center', marginBottom: 12 }
});