import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const PRIMARY = '#FF7754';
const ACCENT = '#FF7754';
const BG_GRADIENT = ['#fff5f0', '#f9fafe'];

const LoginScreen = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigation = useNavigation();
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSendOTP = () => {
    if (name.trim().length === 0) {
      triggerShake();
      showMessage('Please enter your name', 'error');
      return;
    }
    if (phoneNumber.length !== 10) {
      triggerShake();
      showMessage('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    navigation.navigate('OTP', { phoneNumber, name });
  };

  return (
    <LinearGradient colors={BG_GRADIENT} style={styles.gradient}>
      <KeyboardAvoidingView style={styles.outerContainer} behavior="padding">
        <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
          <Image
            source={require('../assets/log.png')} 
            style={{ width: 100, height: 100, marginBottom: 12 }}
          />
          <Text style={[styles.title, { fontSize: 23 }]} numberOfLines={1} ellipsizeMode="tail">
            Welcome to Tesukupo!
          </Text>
          <Text style={styles.subtitle}>Let's get started</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={22} color={PRIMARY} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
              placeholderTextColor="#a0aec0"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={22} color={PRIMARY} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              returnKeyType="done"
              placeholderTextColor="#a0aec0"
            />
          </View>

          <TouchableOpacity style={styles.verifyButton} onPress={handleSendOTP}>
            <Text style={styles.verifyText}>Send OTP</Text>
          </TouchableOpacity>

          {message !== '' && (
            <Text style={[styles.feedback, messageType === 'error' ? styles.error : styles.success]}>
              {message}
            </Text>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  outerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: PRIMARY,
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: ACCENT,
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7f2',
    borderRadius: 14,
    marginBottom: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ffe1d6',
    width: '100%',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 18,
    color: '#333',
    backgroundColor: 'transparent',
    letterSpacing: 1,
  },
  verifyButton: {
    backgroundColor: ACCENT,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
    marginTop: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  verifyText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 19,
    letterSpacing: 1,
  },
  feedback: {
    marginTop: 16,
    fontSize: 15,
    textAlign: 'center',
  },
  error: {
    color: '#ff3b30',
  },
  success: {
    color: '#28a745',
  },
});
