import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './navigate/AppNavigator';
export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
