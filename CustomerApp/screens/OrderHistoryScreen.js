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

const PRIMARY = '#FF7754';
const BACKGROUND = '#fff7f2';

const OrderHistoryScreen = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const navigation = useNavigation();
  const { logout, userPhone, userName } = useContext(AuthContext);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        'https://6868edb5d5933161d70ce3e4.mockapi.io/axios/pickups'
      );
      const userFiltered = response.data.filter(
        (item) => item.userName === userName && item.userPhone === userPhone
      );
      const sorted = userFiltered.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sorted);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    if (filter !== 'All') {
      filtered = filtered.filter((order) => order.status === filter);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((order) =>
        order.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [orders, filter, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(
        `https://6868edb5d5933161d70ce3e4.mockapi.io/axios/pickups/${id}`,
        { status: 'Completed' }
      );
      Alert.alert('Success', 'Pickup approved and marked as Completed.');
      fetchOrders();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update order.');
    }
  };

  const getCardBorderColor = (status) => {
    const colorMap = {
      Pending: '#ff9f00',
      Accepted: '#17a2b8',
      'In-Process': '#007bff',
      'Pending for Approval': '#ffc107',
      Completed: '#28a745',
    };
    return colorMap[status] || PRIMARY;
  };

  const renderStatusStyle = (status) => {
    const colorMap = {
      Pending: '#ff9f00',
      Accepted: '#17a2b8',
      'In-Process': '#007bff',
      'Pending for Approval': '#ffc107',
      Completed: '#28a745',
    };
    return {
      color: colorMap[status] || PRIMARY,
      fontWeight: 'bold',
    };
  };

  return (
    <View style={{ flex: 1, backgroundColor: BACKGROUND }}>
      <View style={styles.topNav}>
  <Text style={styles.topNavText}>📦 Order History</Text>
</View>

      
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        

        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {STATUSES.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterBtn,
                  filter === status && styles.filterBtnActive,
                ]}
                onPress={() => setFilter(status)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === status && styles.filterTextActive,
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TextInput
          placeholder="Search by address..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {loading ? (
          <ActivityIndicator size="large" color={PRIMARY} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : filteredOrders.length === 0 ? (
          <Text style={{ textAlign: 'center' }}>No pickup orders found.</Text>
        ) : (
          <>
            {filteredOrders.map((order) => (
              <View
                key={order.id}
                style={[
                  styles.card,
                  { borderLeftColor: getCardBorderColor(order.status) },
                ]}
              >
                <Text style={styles.row}>
                  <Ionicons name="calendar-outline" size={16} color={PRIMARY} />
                  <Text style={styles.label}> Date:</Text> {order.pickupDate}
                </Text>
                <Text style={styles.row}>
                  <Ionicons name="time-outline" size={16} color={PRIMARY} />
                  <Text style={styles.label}> Time:</Text> {order.timeSlot}
                </Text>
                <Text style={styles.row}>
                  <Ionicons name="location-outline" size={16} color={PRIMARY} />
                  <Text style={styles.label}> Address:</Text> {order.address}
                </Text>
                <Text style={styles.row}>
                  <Ionicons
                    name="checkmark-done-outline"
                    size={16}
                    color={PRIMARY}
                  />
                  <Text style={styles.label}> Status:</Text>{' '}
                  <Text
                    style={[styles.badge, renderStatusStyle(order.status)]}
                  >
                    {order.status}
                  </Text>
                </Text>

                {['Accepted', 'In-Process', 'Pending for Approval', 'Completed'].includes(
                  order.status
                ) && (
                  <Text style={styles.row}>
                    <Text style={styles.label}>🔑 Pickup Code:</Text>{' '}
                    <Text style={styles.codeBadge}>{order.pickupCode}</Text>
                  </Text>
                )}

                {order.status === 'Pending for Approval' && (
                  <>
                    <Text style={styles.row}>
                      <Text style={styles.label}>📦 Items:</Text>{' '}
                      {order.itemList?.join(', ') || 'No items'}
                    </Text>
                    <Text style={styles.row}>
                      <Text style={styles.label}>💰 Total:</Text> ₹
                      {order.totalAmount || 0}
                    </Text>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => handleApprove(order.id)}
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={22}
                        color="#fff"
                      />
                      <Text style={styles.approveText}>Approve & Complete</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.bottomTab}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Dashboard')}
          style={styles.tabButton}
        >
          <Ionicons name="home-outline" size={22} color={PRIMARY} />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('SchedulePickup')}
          style={styles.tabButton}
        >
          <Ionicons name="calendar-outline" size={22} color={PRIMARY} />
          <Text style={styles.tabText}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('OrderHistory')}
          style={styles.tabButton}
        >
          <Ionicons name="list-outline" size={22} color={PRIMARY} />
          <Text style={styles.tabText}>Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={logout} style={styles.tabButton}>
          <Ionicons name="log-out-outline" size={22} color={PRIMARY} />
          <Text style={styles.tabText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OrderHistoryScreen;

const styles = StyleSheet.create({
  topNav: {
  backgroundColor: PRIMARY,
  paddingTop: 40 ,
  paddingBottom: 20,
  paddingHorizontal: 20,
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 6,
},

topNavText: {
  fontSize: 24,
  fontWeight: '700',
  color: '#fff',
  textAlign: 'center',
},

  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 100,
    backgroundColor: '#fff7f2',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: PRIMARY,
    textAlign: 'center',
    marginBottom: 20,
  },
  filterRow: {
    marginTop: -40,
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterBtn: {
    backgroundColor: '#ffe0d1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  filterBtnActive: {
    backgroundColor: PRIMARY,
  },
  filterText: {
    color: '#444',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  searchInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  card: {
    backgroundColor: '#ffefe6',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#FF7754',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 6,
  },
  row: {
    fontSize: 16,
    marginBottom: 10,
    color: '#34495e',
  },
  label: {
    fontWeight: '600',
    color: '#2d3436',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#eef2fa',
    borderRadius: 6,
    overflow: 'hidden',
  },
  codeBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: '#dfe6e9',
    borderRadius: 5,
    fontWeight: '600',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  approveText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 10,
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
