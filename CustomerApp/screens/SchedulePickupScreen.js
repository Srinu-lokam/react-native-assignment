import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const PRIMARY = '#FF7754';
const ACCENT = '#FF7754';
const BG_GRADIENT = ['#fff5f0', '#f9fafe'];

const SchedulePickupScreen = () => {
  const [pickupDate, setPickupDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlot, setTimeSlot] = useState('');
  const [address, setAddress] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); 

  const navigation = useNavigation();
  const { logout, userName, userPhone } = useContext(AuthContext);

  const timeSlotOptions = [
    { label: '10–11 AM', value: '10–11 AM' },
    { label: '11–12 PM', value: '11–12 PM' },
    { label: '12–1 PM', value: '12–1 PM' },
    { label: '2–3 PM', value: '2–3 PM' },
    { label: '3–4 PM', value: '3–4 PM' },
  ];

  const handleSubmit = async () => {
    if (!timeSlot || !address) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();

    const pickupData = {
      pickupDate: pickupDate.toDateString(),
      timeSlot,
      address,
      mapLink,
      status: 'Pending',
      pickupCode,
      totalAmount: 0,
      userName,
      userPhone,
       partnerPhone: '9391234123',
    };

    try {
      await axios.post(
        'https://6868edb5d5933161d70ce3e4.mockapi.io/axios/pickups',
        pickupData
      );
      Alert.alert('Success', 'Pickup request scheduled!');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to submit pickup request.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPickupDate(new Date());
    setTimeSlot('');
    setAddress('');
    setMapLink('');
    setTimeout(() => setRefreshing(false), 1000); 
  };

  return (
    <LinearGradient colors={BG_GRADIENT} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>

          <Image
            source={require('../assets/sch.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Schedule a Pickup</Text>

          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={22} color={PRIMARY} />
            <Text style={styles.dateText}>{pickupDate.toDateString()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={pickupDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setPickupDate(selectedDate);
              }}
            />
          )}

          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              onValueChange={(value) => setTimeSlot(value)}
              items={timeSlotOptions}
              placeholder={{ label: 'Select Time Slot...', value: '' }}
              value={timeSlot}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
              Icon={() => (
                <Ionicons name="chevron-down" size={20} color={PRIMARY} />
              )}
            />
          </View>

          <TextInput
            placeholder="Pickup Address"
            value={address}
            onChangeText={setAddress}
            style={styles.input}
            multiline
            placeholderTextColor="#999"
          />

          <TextInput
            placeholder="Google Map Link (optional)"
            value={mapLink}
            onChangeText={setMapLink}
            style={styles.input}
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
            )}
            <Text style={styles.submitText}>
              {loading ? 'Submitting...' : 'Submit'}
            </Text>
          </TouchableOpacity>
        </View>
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
    </LinearGradient>
  );
};

export default SchedulePickupScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  container: {
    width: '100%',
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 30,
    color: PRIMARY,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7f2',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: PRIMARY,
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: PRIMARY,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#fff7f2',
    paddingHorizontal: 12,
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff7f2',
    color: '#333',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    marginBottom: 80,
    elevation: 3,
  },
  submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  bottomTab: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    elevation: 10,
    paddingBottom: 30,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabText: {
    fontSize: 13,
    color: ACCENT,
    fontWeight: '600',
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    paddingRight: 30,
    color: '#333',
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    paddingRight: 30,
    color: '#333',
  },
  iconContainer: {
    top: 18,
    right: 10,
    position: 'absolute',
  },
};
