import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { Circle, Svg } from 'react-native-svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';





export default function Workouts() {

  const navigation = useNavigation();
  
  // State and Refs
  const [progress, setProgress] = useState(0.6); // Example: 60% progress
  const animatedValue = useRef(new Animated.Value(0)).current;
  const circleCircumference = 2 * Math.PI * 40; 
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);
  const [workoutGroups, setWorkoutGroups] = useState([]);
  const [aiWorkout, setAiWorkout] = useState('');
  const routes = useRoute();
  const [aiWorkoutDescription, setAiWorkoutDescription] = useState('');
  const { params } = routes;
  



  useEffect(() => {
    fetchAIWorkout();
  }, []);


  const fetchAIWorkout = async () => {

    const userData = getUserData();

    try {
      const res = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "text-davinci-003",
          prompt: "",// This must return first a discription of why this workout is usefull for the user followed by the workout in json
          max_tokens: 300,
          temperature: 1,
        }),
      });

      if (response.data && response.data.workout) {
        setAiWorkout(response.data.workout);
        setAiWorkoutDescription(response.data.workout)
      } else {
        console.error('No workout data received');
        Alert.alert('Error', 'Failed to receive workout data');
      }
    } catch (error) {
      console.error('Error fetching AI workout:', error);
      Alert.alert('Error', 'An error occurred while fetching the AI workout');
    }
  };




  useEffect(() => {
      if (routes.params?.workoutCompleted) {
        const completedDay = routes.params.completedDay;
        setWorkoutDays(prevDays => ({ ...prevDays, [completedDay]: true }));
      }
    }, [routes.params?.workoutCompleted, routes.params?.completedDay]);



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
    'Su': false,
  });

 




  const scrollY = useRef(new Animated.Value(0)).current;


  


  const navigateToWorkoutDetail = (workoutGroup) => {
    console.log('navigateToWorkoutDetail called with:', workoutGroup);
  
    if (navigation && workoutGroup) {
      console.log('Navigating to WorkoutDetailScreen with:', workoutGroup);
      navigation.navigate('WorkoutDetailScreen', { workoutGroup });
    } else {
      console.error('Navigation error: navigation object or workoutGroup is undefined');
    }
  };
  




  // WORKOUT PROGRAMS ---------------------------------------------------------------------------------------
  
  // Get the information from the database
  const fetchWorkoutGroups = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/getWorkoutGroups`);
      setWorkoutGroups(response.data.workoutGroups); 

    } catch (error) {
      console.error('Error fetching workout groups:', error);
    }
  };

  useEffect(() => {
    fetchWorkoutGroups();
  }, []);

  


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
      <TouchableOpacity 
        style={styles.categoryItem} 
        onPress={() => navigateToWorkoutDetail(item)}// Passes the entire workout the user selected
      >
        <Animated.View style={{ opacity, transform: [{ scale }] }}>
          <Text style={styles.categoryText}>{item.groupName}</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  

  const route = useRoute();
  const workoutCompleted = route.params?.workoutCompleted;


  





  

  














  // LAYOUT __________________________________________________________________________________________________________
  return (
    <View style={styles.container}>

      

      {/* Workout Tracking */}
      <View style={styles.trackingBox}>
       {/* AI Recommended Workout of the Day */}
      <View style={styles.aiWorkoutBox}>
        <Text style={styles.subtitle}>AI Recommended Workout of the Day</Text>
        <Text style={styles.aiWorkoutText}>{aiWorkout || 'Fetching workout...'}</Text>
        <Text style={styles.descriptionText}>{aiWorkoutDescription || 'Fetching description...'}</Text>
      </View>

</View>





       {/* Updated Workout Categories */}
       <View style={styles.categoriesBox}>
        <Text style={styles.subtitle}>Your custom workouts:</Text>
        <Animated.FlatList
          data={workoutGroups}
          keyExtractor={(item) => item}
          renderItem={renderCategory} // Use the updated renderCategory function
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        />
      </View>





      {/* Workout Days */}
      <View style={styles.plansBox}>
        <Text style={styles.subtitle}>This Week's Progress</Text>
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
  },
  categoryItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: 'grey',
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center'
  },

  aiWorkoutBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#4a90e2', // A vibrant, appealing color
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, // Adds depth to the box
  },
  aiWorkoutText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white', // Ensures text is readable against the background
    textAlign: 'center',
    marginTop: 10,
  },


});
