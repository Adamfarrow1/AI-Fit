import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated } from 'react-native';
import { Circle, Svg } from 'react-native-svg';
import axios from 'axios';





export default function Workouts() {
  
  // State and Refs
  const [progress, setProgress] = useState(0.6); // Example: 60% progress
  const animatedValue = useRef(new Animated.Value(0)).current;
  const circleCircumference = 2 * Math.PI * 40; 
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);



  const viewPastMonth = () => {// NEEDS TO BE ADDED
    console.log('Viewing the past month');
  };


  // Animated properties for progress circle
  const animatedStrokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circleCircumference, circleCircumference * (1 - progress)]
  });
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false
    }).start();
  }, []);

  // Day progress
  const toggleDay = (day) => {
      setWorkoutDays(prevState => ({ ...prevState, [day]: !prevState[day] }));
  };
  const [workoutDays, setWorkoutDays] = useState({
    'M': false,
    'T': false,
    'W': false,
    'Th': false,
    'F': false,
    'S': false,
    'Su': false
  });


  // Workout categories
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





  // WORKOUT PROGRAMS ---------------------------------------------------------------------------------------
  
  // Get the information from the database
  const fetchWorkouts = async (category) => {
    try {
      const response = await axios.get(`http://your-api-endpoint/getWorkouts/${category}`);
      setSelectedWorkouts(response.data.workouts); // Assuming response.data.workouts is an array of workout objects
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };


  const renderCategory = ({ item, index }) => {
    const inputRange = [-1, 0, 50 * index, 50 * (index + 2)];
  
    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0]
    });
  
    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.5]
    });
  
    return (
      <View style={styles.container}>
    
        {/* Workout Categories (Inside scroll bar)*/}
        <View style={styles.categories}>
          <Text style={styles.subtitle}>Your custom workout:</Text>
          <Animated.FlatList
            data={categories}
            keyExtractor={(item) => item}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
          />
        </View>
    
        
  
    
      </View>
    );
    
  };







  

  














  // LAYOUT __________________________________________________________________________________________________________
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




      {/* Workout Days */}
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












// STYLES ___________________________________________________________________________



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    padding: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center'
  },
  text: {
    fontSize: 16,
    color: '#d0d0d0'
  },
  trackingBox: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#1a1a1a'
  },
  categoriesBox: {
    flex: 3,
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#1a1a1a'
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
    width: '100%',
  },
  dayButton: {
    width: '10%',
    paddingVertical: 8,
    alignItems: 'center',
    margin: 5,
    borderWidth: 1.5,
    borderColor: '#3a90e2',
    borderRadius: 5,
    backgroundColor: '#1a1a1a'
  },
  workoutDone: {
    textDecorationLine: 'line-through',
    color: '#27ae60',
    textAlign: 'center',
    fontWeight: '600'
  },
  workoutNotDone: {
    color: '#3a90e2',
    textAlign: 'center',
    fontWeight: '600'
  },
  monthButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#3a90e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  workoutGroupContainer: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  workoutContainer: {
    padding: 8,
    backgroundColor: '#e7e7e7',
    borderRadius: 5,
    marginTop: 5,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  workoutDetail: {
    fontSize: 14,
    color: '#666',
  },
  noWorkoutsText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  }
});
