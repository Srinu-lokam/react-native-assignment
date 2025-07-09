import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [userPhone, setUserPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedPhone = await AsyncStorage.getItem('userPhone');
        const storedName = await AsyncStorage.getItem('userName');

        if (storedPhone && storedName) {
          setUserPhone(storedPhone);
          setUserName(storedName);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error loading session:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (name, number) => {
    if (!name || !number) {
      console.error('Login error: name or phone is missing');
      return;
    }

    await AsyncStorage.setItem('userPhone', number);
    await AsyncStorage.setItem('userName', name);
    setUserPhone(number);
    setUserName(name);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userPhone');
    await AsyncStorage.removeItem('userName');
    setUserPhone('');
    setUserName('');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userPhone, userName, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
