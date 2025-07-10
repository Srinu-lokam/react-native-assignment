import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Alert,
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import axios from 'axios';

const DashboardScreen = () => {
  const { userName, userPhone, logout } = useContext(AuthContext);
  const navigation = useNavigation();
  const logoScale = useRef(new Animated.Value(1)).current;

  const [latestPickupId, setLatestPickupId] = useState(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const fetchLatestPickup = async () => {
      try {
        const res = await axios.get('https://6868edb5d5933161d70ce3e4.mockapi.io/axios/pickups');
        const assigned = res.data.filter((p) => p.partnerPhone === userPhone);
        if (assigned.length > 0) {
          setLatestPickupId(assigned[0].id); 
        }
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Could not fetch pickups.');
      }
    };

    fetchLatestPickup();
  }, [userPhone]);

  const handleWorkflowPress = () => {
    if (latestPickupId) {
      navigation.navigate('PickupWorkflow', { pickupId: latestPickupId });
    } else {
      Alert.alert('No Assigned Pickup', 'You have no assigned pickups to view workflow.');
    }
  };

  return (
    <LinearGradient colors={[COLORS.white, COLORS.lightGray]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Ionicons name="person-circle-outline" size={32} color={COLORS.primary} />
            <Text style={styles.welcome}>Welcome, {userName || userPhone}!</Text>
          </View>
        </View>

        <View style={styles.logoContainer}>
          <Animated.Image
            source={require('../assets/logoo.png')}
            style={[styles.logo, { transform: [{ scale: logoScale }] }]}
            resizeMode="contain"
          />
          <Text style={styles.textx}>Your pickups await – Let's roll!</Text>
        </View>

        <View style={styles.bottomTab}>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.tabButton}>
            <Ionicons name="home-outline" size={22} color={COLORS.secondary} />
            <Text style={styles.tabText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('AssignedPickups')} style={styles.tabButton}>
            <Ionicons name="cube-outline" size={22} color={COLORS.secondary} />
            <Text style={styles.tabText}>Assigned</Text>
          </TouchableOpacity>

         

          <TouchableOpacity onPress={logout} style={styles.tabButton}>
            <Ionicons name="log-out-outline" size={22} color={COLORS.secondary} />
            <Text style={styles.tabText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  textx: {
  fontSize: 22,
  fontWeight: '700',
  color: COLORS.secondary,
  marginTop: 20,
  textAlign: 'center',
  letterSpacing: 0.5,
  textShadowColor: '#d6ccff',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 2,
},

  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    backgroundColor: '#f3ecff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  welcome: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 400,
    height:450,
    marginTop: -60,
  },
  bottomTab: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f3ecff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    height: 70,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    color: COLORS.secondary,
    fontWeight: '600',
  },
});
