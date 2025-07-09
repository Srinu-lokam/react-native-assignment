import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: require('../assets/loc.png'),
    text: 'Schedule pickups at your convenience',
  },
  {
    id: '2',
    image: require('../assets/ccc.png'),
    text: 'Track pickup status in real-time',
  },
  {
    id: '3',
    image: require('../assets/app.png'),
    text: 'View and approve orders easily',
  },
];

const PRIMARY = '#FF7754';
const ACCENT = '#FF7754';
const DOT_INACTIVE = '#ffe1d6';
const BG_GRADIENT = ['#fff5f0', '#f9fafe'];

const GetStartedScreen = () => {
  const navigation = useNavigation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef();

  useEffect(() => {
    const checkSession = async () => {
      const user = await AsyncStorage.getItem('userPhone'); 
      if (user) {
        navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      let nextSlide = currentSlide + 1;
      if (nextSlide >= slides.length) nextSlide = 0;
      setCurrentSlide(nextSlide);
      flatListRef.current?.scrollToIndex({ index: nextSlide, animated: true });
    }, 2000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  const handleNext = () => {
    navigation.replace('Login');
  };

  const renderItem = ({ item }) => (
    <View style={styles.slideFull}>
      <Image source={item.image} style={styles.slideImage} resizeMode="contain" />
      <Text style={styles.slideText}>{item.text}</Text>
    </View>
  );

  return (
    <LinearGradient colors={BG_GRADIENT} style={styles.gradient}>
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentSlide(index);
          }}
          style={{ flexGrow: 0 }}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />

        <View style={styles.dotsContainer}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === currentSlide ? ACCENT : DOT_INACTIVE },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default GetStartedScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  slideFull: {
    width,
    height: height * 0.75,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  slideImage: {
    width: width * 0.8,
    height: height * 0.4,
    marginBottom: 32,
  },
  slideText: {
    fontSize: 24,
    color: '#222',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 10,
    paddingHorizontal: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    alignSelf: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  button: {
    backgroundColor: ACCENT,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 70,
    elevation: 6,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    alignSelf: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 20,
    letterSpacing: 1,
    textAlign: 'center',
  },
});
