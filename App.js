import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import { getSecureData } from './src/utils/storage';

export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Task 03: Otomatis membaca token dari SecureStore saat aplikasi pertama kali dibuka
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const token = await getSecureData('user_token');
    if (token) {
      setUserToken(token);
    }
    setCheckingSession(false);
  };

  if (checkingSession) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return userToken ? (
    <HomeScreen 
      token={userToken} 
      onLogout={() => setUserToken(null)} 
    />
  ) : (
    <LoginScreen 
      onLoginSuccess={(newToken) => setUserToken(newToken)} 
    />
  );
}