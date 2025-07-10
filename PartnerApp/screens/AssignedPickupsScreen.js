import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';

const STATUSES = [
  'All',
  'Pending',
  'Accepted',
  'In-Process',
  'Pending for Approval',
  'Completed',
];

const PRIMARY = '#FFCA40';
const ACCENT = '#6A5AE0';
const BG = '#f4f4f4';

const AssignedPickupsScreen = () => {
  const [pickups, setPickups] = useState([]);
  const [filteredPickups, setFilteredPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { userPhone, logout } = useContext(AuthContext);
  const navigation = useNavigation();

  const fetchAssignedPickups = async () => {
    try {
      const response = await axios.get('https://6868edb5d5933161d70ce3e4.mockapi.io/axios/pickups');
      const assigned = response.data.filter((p) => p.partnerPhone === userPhone);
      const sorted = assigned.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPickups(sorted);
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

  useEffect(() => {
    let filtered = pickups;

    if (filter !== 'All') {
      filtered = filtered.filter((p) => p.status === filter);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPickups(filtered);
  }, [pickups, filter, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAssignedPickups();
    setRefreshing(false);
  };

  const openMap = (url) => {
    if (url) {
      Linking.openURL(url);
    } else {
      Alert.alert('No Map Link');
    }
  };

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

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚚 Assigned Pickups</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {STATUSES.map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterBtn, filter === status && styles.filterBtnActive]}
              onPress={() => setFilter(status)}
            >
              <Text style={[styles.filterText, filter === status && styles.filterTextActive]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TextInput
          placeholder="Search by customer or address..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {loading ? (
          <ActivityIndicator size="large" color={ACCENT} />
        ) : filteredPickups.length === 0 ? (
          <Text style={styles.noText}>No pickups found.</Text>
        ) : (
          filteredPickups.map((pickup) => (
            <View key={pickup.id} style={styles.card}>
              <Text style={styles.info}><Text style={styles.label}>👤 Customer:</Text> {pickup.userName}</Text>
              <Text style={styles.info}><Text style={styles.label}>📞 Phone:</Text> {pickup.userPhone}</Text>
              <Text style={styles.info}><Text style={styles.label}>📍 Address:</Text> {pickup.address}</Text>
              <Text style={styles.info}><Text style={styles.label}>📅 Date:</Text> {pickup.pickupDate}</Text>
              <Text style={styles.info}><Text style={styles.label}>⏰ Time Slot:</Text> {pickup.timeSlot}</Text>
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
    </View>
  );
};

export default AssignedPickupsScreen;

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#f3ecff',
    paddingTop: 50,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
  },
  headerTitle: {
    paddingLeft: 50,
    fontSize: 22,
    fontWeight: '800',
    color: ACCENT,
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
  filterRow: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 12,
  },
  filterBtn: {
    backgroundColor: '#e6e6e6',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 10,
  },
  filterBtnActive: {
    backgroundColor: ACCENT,
  },
  filterText: {
    color: '#555',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
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
    color: ACCENT,
    fontWeight: '600',
  },
});
