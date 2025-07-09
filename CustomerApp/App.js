import React from 'react';
import AppNavigator from './navigate/StackNavigator'; 
import { AuthProvider } from './contexts/AuthContext'; 
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
