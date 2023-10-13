import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated } from 'react-native';
import { Circle, Svg } from 'react-native-svg';


export default function Workouts() {
  
  
  const [progress, setProgress] = useState(0.6); // Example: 60% progress
  const animatedValue = useRef(new Animated.Value(0)).current;
  const circleCircumference = 2 * Math.PI * 40; // Assuming a circle radius of 40
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  const viewPastMonth = () => {
    console.log('Viewing the past month');
  };

  const animatedStrokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circleCircumference, circleCircumference * (1 - progress)]
  });


  const [workoutDays, setWorkoutDays] = useState({
    'M': false,
    'T': false,
    'W': false,
    'T': false,
    'F': false,
    'S': false,
    'Su': false
});

// Toggle workout status for a day
  const toggleDay = (day) => {
      setWorkoutDays(prevState => ({ ...prevState, [day]: !prevState[day] }));
  };

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false
    }).start();
  }, []);
  
  
  const categories = [
    "Strength Training",
    "Cardio",
    "Flexibility",
    "Yoga",
    "Pilates",
    "HIIT",
    "CrossFit",
    "Aerobics",
    "Martial Arts"
  ];

  const scrollY = useRef(new Animated.Value(0)).current;

  const renderCategory = ({ item, index }) => {
    const inputRange = [
      -1,
      0,
      50 * index,
      50 * (index + 2)
    ];

    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0]
    });

    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.5]
    });

    return (
      <Animated.View style={{ ...styles.category, opacity, transform: [{ scale }] }}>
        <Text style={styles.text}>{item}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>

      {/* Workout Tracking */}
      <View style={styles.trackingBox}>
    <Text style={styles.subtitle}>Your Activity</Text>
    <Svg width={100} height={100} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="40" strokeWidth="5" stroke="#3d3d3f" fill="none"/>
        <AnimatedCircle
            cx="50"
            cy="50"
            r="40"
            strokeWidth="5"
            stroke="#FFFFFF"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circleCircumference}, ${circleCircumference}`}
            strokeDashoffset={animatedStrokeDashoffset}
            rotation="90" 
            origin="50, 50"
        />
    </Svg>
    <Text style={styles.text}>{Math.round(progress * 100)}% completed</Text>
</View>



      {/* Workout Categories */}
      <View style={styles.categoriesBox}>
        <Text style={styles.subtitle}>Your custom workouts:</Text>
        <Animated.FlatList
          data={categories}
          keyExtractor={(item) => item}
          renderItem={renderCategory}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        />
      </View>

      {/* Workout Plans */}
      <View style={styles.plansBox}>
        <Text style={styles.subtitle}>Week's Workouts</Text>
        <View style={styles.weekContainer}>
          {Object.keys(workoutDays).map(day => (
            <TouchableOpacity key={day} onPress={() => toggleDay(day)} style={styles.dayButton}>
              <Text style={[styles.text, workoutDays[day] ? styles.workoutDone : styles.workoutNotDone]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.monthButton} onPress={viewPastMonth}>
          <Text style={styles.monthButtonText}>View the past month</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};








const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161618',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
    alignSelf: 'center'
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10
  },
  text: {
    fontSize: 16,
    color: 'white'
  },
  trackingBox: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#2c2c2e'
  },
  categoriesBox: {
    flex: 3,
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#2c2c2e'
  },
  category: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: '#3d3d3f',
    alignItems: 'center'
  },
  plansBox: {
    flex: 2,
    justifyContent: 'center',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#2c2c2e'
  },

  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap', // In case there's not enough space for all the days in one line
  },
  
  
  plansBox: {
    flex: 2,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#2c2c2e',
    alignItems: 'center', // To center the week's workouts
},
weekContainer: {
  flexDirection: 'row',
  justifyContent: 'space-evenly', // Change to space-evenly for better distribution
  alignItems: 'center',
  flexWrap: 'wrap',
  marginTop: 10,
  width: '100%',
},
dayButton: {
  width: '13%', 
  paddingVertical: 8, // Increase padding for a more touch-friendly area
  alignItems: 'center',
  margin: 5, // Increase margin for more spacing between days
  borderWidth: 1.5, // Slightly thicker border
  borderColor: '#4a90e2', // Matching blue theme
  borderRadius: 5,
  backgroundColor: '#2c2c2e' // Slight background to stand out
},
workoutDone: {
  textDecorationLine: 'line-through',
  color: '#2ecc71', // A harmonious shade of green
  textAlign: 'center',
  fontWeight: '600' // Make it bold
},
workoutNotDone: {
  color: '#4a90e2', // Light blue color
  textAlign: 'center',
  fontWeight: '600' // Make it bold
},

monthButton: {
  marginTop: 10, // Added spacing above the button
  paddingVertical: 8,
  paddingHorizontal: 20,
  borderRadius: 5,
  backgroundColor: '#4a90e2', // Light blue color for the button
  alignItems: 'center',
  justifyContent: 'center',
},
monthButtonText: {
  color: 'white',
  fontWeight: '600',
  fontSize: 16,
},


  
});
