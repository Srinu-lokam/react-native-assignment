import React, { useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  ScrollView,
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

const PRIMARY = '#FF7754';
const ACCENT = '#FF7754';
const BG_GRADIENT = ['#fff5f0', '#fff1e6'];

const DashboardScreen = () => {
  const { logout, userPhone, userName } = useContext(AuthContext);
  const navigation = useNavigation();

  const [pickupHistory, setPickupHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const logoScale = useRef(new Animated.Value(1)).current;

  const statusColors = {
    Pending: '#ffb482',
    Accepted: '#ffc39e',
    'In-Process': '#ffa94d',
    'Pending for Approval': '#ffd5b4',
    Completed: '#28a745',
  };

  const fetchPickups = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('https://6868edb5d5933161d70ce3e4.mockapi.io/axios/pickups');
      const userData = response.data.filter(
        item => item.userName === userName && item.userPhone === userPhone
      );
      const sorted = userData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5); 
      setPickupHistory(sorted);
    } catch (err) {
      console.error(err);
      setError('Failed to load pickup history.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchPickups(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPickups();
    setRefreshing(false);
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, { toValue: 1.1, duration: 600, useNativeDriver: true }),
        Animated.timing(logoScale, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const renderCard = (item) => (
    <View
      key={item.id}
      style={[styles.card, { borderLeftColor: statusColors[item.status] || ACCENT }]}
    >
      <Text style={styles.row}><Ionicons name="location-outline" size={16} color={PRIMARY} /> <Text style={styles.label}>Address:</Text> {item.address}</Text>
      <Text style={styles.row}><Ionicons name="calendar-outline" size={16} color={PRIMARY} /> <Text style={styles.label}>Date:</Text> {item.pickupDate}</Text>
      <Text style={styles.row}><Ionicons name="time-outline" size={16} color={PRIMARY} /> <Text style={styles.label}>Time:</Text> {item.timeSlot}</Text>
      <Text style={styles.row}><Ionicons name="checkmark-done-outline" size={16} color={PRIMARY} /> <Text style={styles.label}>Status:</Text> <Text style={[styles.badge, styles[`status_${item.status.replace(/\s/g, '').toLowerCase()}`]]}>{item.status}</Text></Text>
    </View>
  );

  return (
    <LinearGradient colors={BG_GRADIENT} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
       
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Ionicons name="person-circle-outline" size={32} color={BG_GRADIENT} />
            <Text style={styles.welcome}>Welcome, {userName || userPhone}!</Text>
          </View>
        </View>

      
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.logoContainer}>
            <Animated.Image
              source={require('../assets/logo.png')}
              style={[styles.logo, { transform: [{ scale: logoScale }] }]}
              resizeMode="contain"
            />
            <Text style={styles.textx}>Fast. Easy. Reliable Pickups at Your Doorstep</Text>
          </View>

          <Text style={styles.sectionTitle}>📦 Recent Pickups</Text>

          {loading ? (
            <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 20 }} />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : pickupHistory.length === 0 ? (
            <Text style={styles.noData}>No pickups found.</Text>
          ) : (
            pickupHistory.map(renderCard)
          )}
        </ScrollView>

        <View style={styles.bottomTab}>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.tabButton}>
            <Ionicons name="home-outline" size={22} color={ACCENT} />
            <Text style={styles.tabText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('SchedulePickup')} style={styles.tabButton}>
            <Ionicons name="calendar-outline" size={22} color={ACCENT} />
            <Text style={styles.tabText}>Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('OrderHistory')} style={styles.tabButton}>
            <Ionicons name="list-outline" size={22} color={ACCENT} />
            <Text style={styles.tabText}>Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={styles.tabButton}>
            <Ionicons name="log-out-outline" size={22} color={ACCENT} />
            <Text style={styles.tabText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  textx: {
     marginTop: 5,
  fontSize: 18,
  fontWeight: '700',
  color: '#FF7754', 
  textAlign: 'center',
  paddingHorizontal: 20,
  fontStyle: 'italic',
  letterSpacing: 0.5,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FF7754',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  welcome: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
  },
  logoContainer: {
    marginTop: 120,
    marginVertical: 30,
    alignItems: 'center',
  },
  logo: {
    width: 370,
    height: 380,
    marginBottom: 50,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 18,
    color: PRIMARY,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff7f2',
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#FF7754',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 6,
  },
  row: {
    fontSize: 15,
    marginBottom: 10,
    color: '#444',
    lineHeight: 22,
  },
  label: {
    fontWeight: '600',
    color: '#333',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: 'bold',
  },
  status_completed: { color: '#28a745' },
  status_pending: { color: PRIMARY },
  status_inprocess: { color: '#FFA94D' },
  status_pendingforapproval: { color: '#ffc078' },
  status_accepted: { color: '#FFB88C' },
  error: {
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
  },
  noData: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  bottomTab: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff7f2',
    borderTopWidth: 1,
    borderTopColor: '#f5c7b8',
    height: 75,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    color: PRIMARY,
    fontWeight: '600',
  },
});
