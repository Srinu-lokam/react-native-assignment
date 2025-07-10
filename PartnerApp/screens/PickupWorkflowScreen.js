import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Linking,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { AuthContext } from '../contexts/AuthContext';

const STATUS_FLOW = [
  'Pending',
  'Accepted',
  'In-Process',
  'Pending for Approval',
  'Completed',
];

const PickupWorkflowScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);
  const { pickupId } = route.params;

  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [pickupCodeInput, setPickupCodeInput] = useState('');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [items, setItems] = useState([{ name: '', quantity: '', price: '' }]);

  useEffect(() => {
    fetchPickup();
  }, []);

  const fetchPickup = async () => {
    try {
      const res = await axios.get(`https://6868edb5d5933161d70ce3e4.mockapi.io/axios/pickups/${pickupId}`);
      setPickup(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch pickup details.');
    } finally {
      setLoading(false);
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

  const nextStatus = () => {
    if (!pickup) return null;
    const currentIndex = STATUS_FLOW.indexOf(pickup.status);
    return STATUS_FLOW[currentIndex + 1] || null;
  };

 const updateStatusWithAlert = async (statusToUpdate, successMessage, onSuccess) => {
  setUpdating(true);
  try {
    const totalAmount = items.reduce((sum, item) => {
      return sum + (parseFloat(item.price) || 0);
    }, 0);

    const updatedItemList = items.map(item => `${item.name} x ${item.quantity}`);

    const res = await axios.put(
      `https://6868edb5d5933161d70ce3e4.mockapi.io/axios/pickups/${pickupId}`,
      {
        status: statusToUpdate,
        items,
        itemList: updatedItemList, 
        totalAmount,
      }
    );

    setPickup(res.data);
    Alert.alert('Success', successMessage, [{ text: 'OK', onPress: onSuccess }]);
  } catch (err) {
    Alert.alert('Error', 'Failed to update status.');
  } finally {
    setUpdating(false);
  }
};


  const handleStatusUpdate = () => {
    const newStatus = nextStatus();
    if (!newStatus) {
      Alert.alert('Info', 'Pickup is already completed.');
      return;
    }

    if (newStatus === 'Accepted') {
      updateStatusWithAlert('Accepted', 'Pickup accepted.', () => setShowCodeModal(true));
    } else if (newStatus === 'In-Process') {
      setShowCodeModal(true);
    } else {
      updateStatusWithAlert(newStatus, `Status updated to "${newStatus}"`);
    }
  };

  const handleCodeSubmit = () => {
    if (pickupCodeInput.trim() === '') {
      Alert.alert('Error', 'Please enter the pickup code.');
      return;
    }

    if (pickupCodeInput !== pickup.pickupCode) {
      Alert.alert('Invalid Code', 'The pickup code you entered is incorrect.');
      return;
    }

    setShowCodeModal(false);
    setShowItemModal(true);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleAddItemSubmit = () => {
    const hasEmpty = items.some(item => !item.name || !item.quantity || !item.price);
    if (hasEmpty) {
      Alert.alert('Error', 'Please fill all item fields.');
      return;
    }

    const allValid = items.every(item =>
      !isNaN(item.quantity) && !isNaN(item.price)
    );
    if (!allValid) {
      Alert.alert('Error', 'Quantity and Price must be numeric values.');
      return;
    }

    setShowItemModal(false);
    updateStatusWithAlert('In-Process', 'Status updated to In-Process');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  if (!pickup) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Pickup not found.</Text>
      </View>
    );
  }
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🚚 Pickup Workflow</Text>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={18} style={styles.icon} color={COLORS.secondary} />
              <Text style={styles.info}><Text style={styles.label}>Customer:</Text> {pickup.userName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={18} style={styles.icon} color={COLORS.secondary} />
              <Text style={styles.info}><Text style={styles.label}>Phone:</Text> {pickup.userPhone}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={18} style={styles.icon} color={COLORS.secondary} />
              <Text style={styles.info}><Text style={styles.label}>Address:</Text> {pickup.address}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={18} style={styles.icon} color={COLORS.secondary} />
              <Text style={styles.info}><Text style={styles.label}>Date:</Text> {pickup.pickupDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={18} style={styles.icon} color={COLORS.secondary} />
              <Text style={styles.info}><Text style={styles.label}>Time:</Text> {pickup.timeSlot}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="information-circle-outline" size={18} style={styles.icon} color={COLORS.secondary} />
              <Text style={[styles.info, { color: getStatusColor(pickup.status) }]}>
                <Text style={styles.label}>Status:</Text> {pickup.status}
              </Text>
            </View>

            {pickup.mapLink && (
              <TouchableOpacity onPress={() => Linking.openURL(pickup.mapLink)}>
                <Text style={styles.mapLink}>🌐 Open Map</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

     
        {pickup.status !== 'Completed' &&
          pickup.status !== 'In-Process' &&
          pickup.status !== 'Pending for Approval' && (
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={handleStatusUpdate}
              disabled={updating}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.btnText}>
                {updating ? 'Updating...' : `Mark as "${nextStatus()}"`}
              </Text>
            </TouchableOpacity>
          )}

        
        {pickup.status === 'In-Process' && (
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => updateStatusWithAlert('Pending for Approval', 'Submitted for customer approval')}
            disabled={updating}
          >
            <Ionicons name="paper-plane-outline" size={20} color="#fff" />
            <Text style={styles.btnText}>
              {updating ? 'Submitting...' : 'Submit for Approval'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>


      <Modal visible={showCodeModal} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Enter Pickup Code</Text>
            <TextInput
              value={pickupCodeInput}
              onChangeText={(text) => setPickupCodeInput(text.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="numeric"
              maxLength={4}
              placeholder="4-digit code"
              style={styles.input}
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleCodeSubmit}>
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showItemModal} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={[styles.modalCard, { maxHeight: '80%' }]}>
            <ScrollView style={{ width: '100%' }}>
              <Text style={styles.modalTitle}>Add Items</Text>
              {items.map((item, index) => (
                <View key={index} style={{ marginBottom: 14 }}>
                  <TextInput
                    placeholder="Item Name"
                    value={item.name}
                    onChangeText={(text) => handleItemChange(index, 'name', text)}
                    style={styles.input}
                  />
                  <TextInput
                    placeholder="Quantity"
                    value={item.quantity}
                    onChangeText={(text) => handleItemChange(index, 'quantity', text)}
                    style={styles.input}
                    keyboardType="numeric"
                  />
                  <TextInput
                    placeholder="Price"
                    value={item.price}
                    onChangeText={(text) => handleItemChange(index, 'price', text)}
                    style={styles.input}
                    keyboardType="numeric"
                  />
                </View>
              ))}
              <TouchableOpacity
                onPress={() => setItems([...items, { name: '', quantity: '', price: '' }])}
                style={[styles.submitBtn, { marginBottom: 10 }]}
              >
                <Text style={styles.submitText}>+ Add Another Item</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddItemSubmit} style={styles.submitBtn}>
                <Text style={styles.submitText}>Submit Items</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      
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
    </View>
  );
};

export default PickupWorkflowScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    backgroundColor: '#f3ecff',
    paddingTop: 50,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    paddingLeft: 67,
    color: COLORS.secondary,
  },
  cardContainer: {
    
    alignItems: 'center',
    marginTop: 20,
  },
  card: {
    marginTop: 80,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 18,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    marginRight: 8,
  },
  info: {
    fontSize: 15,
    color: COLORS.text,
    flexShrink: 1,
  },
  label: {
    fontWeight: '600',
    color: COLORS.black,
  },
  mapLink: {
    marginTop: 10,
    color: '#007bff',
    fontWeight: '600',
  },
  nextBtn: {
    marginHorizontal: 20,
    marginTop: 50,
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    fontSize: 16,
    color: 'red',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 14,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: COLORS.secondary,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'left',
  },
  submitBtn: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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
    color: COLORS.secondary,
    fontWeight: '600',
  },
});
