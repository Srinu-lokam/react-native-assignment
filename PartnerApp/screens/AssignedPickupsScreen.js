import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const PRIMARY = '#FFCA40';    
const ACCENT = '#6A5AE0';     
const BG = '#f4f4f4';

const AssignedPickupsScreen = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userPhone, logout } = useContext(AuthContext);
  const navigation = useNavigation();

  const fetchAssignedPickups = async () => {
    try {
      const response = await axios.get('https://6868edb5d5933161d70ce3e4.mockapi.io/axios/pickups');
      const assigned = response.data.filter((p) => p.partnerPhone === userPhone);
      setPickups(assigned);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load pickups.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedPickups();
  }, []);

  const getStatusColor = (status) => {
    const map = {
      Pending: '#FFA500',
      Accepted: '#17a2b8',
      'In-Process': '#007bff',
      'Pending for Approval': '#ffc107',
      Completed: '#28a745',
    };
    return map[status] || '#666';
  };

  const openMap = (url) => {
    if (url) Linking.openURL(url);
    else Alert.alert('No Map Link');
  };

  const latestPickupId = pickups.length > 0 ? pickups[0].id : null;

  const handleWorkflowNavigation = () => {
    if (latestPickupId) {
      navigation.navigate('PickupWorkflow', { pickupId: latestPickupId });
    } else {
      Alert.alert('No Assigned Pickup', 'There is no pickup available to view workflow.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}> 🚚  Assigned Pickups</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.screenTitle}></Text>

        {loading ? (
          <ActivityIndicator size="large" color={ACCENT} />
        ) : pickups.length === 0 ? (
          <Text style={styles.noText}>No pickups assigned.</Text>
        ) : (
          pickups.map((pickup) => (
            <View key={pickup.id} style={styles.card}>
              <Text style={styles.info}><Text style={styles.label}>👤 Customer:</Text> {pickup.userName}</Text>
              <Text style={styles.info}><Text style={styles.label}>📞 Phone:</Text> {pickup.userPhone}</Text>
              <Text style={styles.info}><Text style={styles.label}>📍 Address:</Text> {pickup.address}</Text>
              <Text style={styles.info}><Text style={styles.label}>📅 Date:</Text> {pickup.pickupDate} </Text>
              <Text style={styles.info}><Text style={styles.label}>⏰ TimeSlot:</Text> {pickup.timeSlot}</Text>
              <Text style={[styles.status, { color: getStatusColor(pickup.status) }]}>Status: {pickup.status}</Text>

              {pickup.mapLink && (
                <TouchableOpacity onPress={() => openMap(pickup.mapLink)}>
                  <Text style={styles.mapLink}>🌐 Open in Google Maps</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => navigation.navigate('PickupWorkflow', { pickupId: pickup.id })}
              >
                <Ionicons name="chevron-forward-circle" size={18} color="#fff" />
                <Text style={styles.viewText}> View & Update</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.bottomTab}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.tabButton}>
          <Ionicons name="home-outline" size={22} color={ACCENT} />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AssignedPickups')} style={styles.tabButton}>
          <Ionicons name="cube-outline" size={22} color={ACCENT} />
          <Text style={styles.tabText}>Assigned</Text>
        </TouchableOpacity>
       
        <TouchableOpacity onPress={logout} style={styles.tabButton}>
          <Ionicons name="log-out-outline" size={22} color={ACCENT} />
          <Text style={styles.tabText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AssignedPickupsScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  header: {
    backgroundColor: '#f3ecff',
    paddingTop: 50,
    paddingBottom: 18,
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
  emoji: {
    fontSize: 26,
  },
  headerTitle: {
    paddingLeft: 50,
    fontSize: 22,
    fontWeight: '800',
    color: ACCENT,
  },
  screenTitle: {
    marginBottom: -10,
    fontSize: 20,
    fontWeight: '700',
    color: ACCENT,
    textAlign: 'center',
    marginVertical: 20,
  },
  scrollContainer: {
    paddingBottom: 120,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  info: {
    fontSize: 15,
    marginBottom: 6,
    color: '#333',
  },
  label: {
    fontWeight: '600',
    color: '#000',
  },
  status: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '600',
  },
  mapLink: {
    marginTop: 10,
    color: '#007bff',
    fontWeight: '600',
  },
  viewBtn: {
    marginTop: 14,
    flexDirection: 'row',
    backgroundColor: ACCENT,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  noText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
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
    paddingVertical: 6,
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    color: ACCENT,
    fontWeight: '600',
  },
});
