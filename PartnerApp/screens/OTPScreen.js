import React, { useEffect, useRef, useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../contexts/AuthContext';
import { COLORS } from '../constants/colors';

const BG_GRADIENT = [COLORS.secondary, COLORS.secondary];

const OTPScreen = ({ route }) => {
  const { name, phoneNumber } = route.params;
  const { login } = useContext(AuthContext);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef([]);
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    inputs.current[0]?.focus();
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          setIsResendDisabled(false);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 3, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleChange = (text, index) => {
    if (/^\d$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      if (index < 5) inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      const updated = [...otp];
      if (otp[index]) {
        updated[index] = '';
        setOtp(updated);
      } else if (index > 0) {
        updated[index - 1] = '';
        setOtp(updated);
        inputs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      showMessage('Please enter all 6 digits of the OTP', 'error');
      triggerShake();
      return;
    }

    if (enteredOtp === '123456') {
      login(name, phoneNumber);
      showMessage('OTP Verified!', 'success');
    } else {
      showMessage('Invalid OTP. Please try again.', 'error');
      triggerShake();
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputs.current[0]?.focus(), 300);
    }
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
    setIsResendDisabled(true);
    setTimer(30);
    inputs.current[0]?.focus();
    showMessage('OTP has been resent successfully', 'success');

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          setIsResendDisabled(false);
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <LinearGradient colors={BG_GRADIENT} style={styles.gradient}>
      <View style={styles.outerContainer}>
        <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
          <Text style={styles.icon}>🔐</Text>
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>A 6-digit code was sent to</Text>
          <Text style={styles.phoneText}>{phoneNumber}</Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                style={styles.otpBox}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                ref={(ref) => (inputs.current[index] = ref)}
                autoFocus={index === 0}
                blurOnSubmit={false}
                placeholder="•"
                placeholderTextColor={COLORS.border}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
            <Text style={styles.verifyText}>Verify OTP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleResend}
            disabled={isResendDisabled}
            style={[styles.resendButton, isResendDisabled && styles.disabledButton]}
          >
            <Text style={styles.resendText}>
              {isResendDisabled ? `Resend in ${timer}s` : 'Resend OTP'}
            </Text>
          </TouchableOpacity>

          {message !== '' && (
            <Text style={[styles.feedback, messageType === 'error' ? styles.error : styles.success]}>
              {message}
            </Text>
          )}
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

export default OTPScreen;

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
    maxWidth: 370,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  icon: {
    fontSize: 38,
    marginBottom: 16,
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
  phoneText: {
    fontSize: 16,
    marginBottom: 24,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    width: '100%',
    maxWidth: 240,
    alignSelf: 'center',
    gap: 6,
  },
  otpBox: {
    borderBottomWidth: 2,
    borderColor: COLORS.primary,
    width: 36,
    height: 52,
    textAlign: 'center',
    fontSize: 22,
    color: COLORS.text,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    marginBottom: 10,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  verifyText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 1,
  },
  resendButton: {
    paddingVertical: 10,
    borderRadius: 10,
    borderColor: COLORS.primary,
    borderWidth: 1,
    width: '100%',
    alignItems: 'center',
    marginBottom: 2,
    backgroundColor: COLORS.lightGray,
  },
  resendText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  feedback: {
    marginTop: 15,
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
