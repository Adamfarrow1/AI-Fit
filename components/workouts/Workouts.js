import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { Circle, Svg } from 'react-native-svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {OPENAI_API_KEY} from 'react-native-dotenv';
import axios from 'axios';
import { useAuth } from '../../context/authcontext';
import WorkoutDetailScreen from './WorkoutDetailScreen';





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
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);




  // useEffect(() => {
  //   fetchAIWorkout();
  // }, []);



  //Get the summarized workout
  const fetchAIWorkout = async () => {
    //Feed the user data
    const userPrompt = `Create a summary of 3-4 sentences of what you think the ideal personalized workout today would be for me (a ${user.age}-year-old ${user.gender}, weighing ${user.weight} lbs, ${user.height} cm tall, with a fitness goal of ${user.goal}). State this summary to user and refer to them as "you" when discussing why the workout is beneficial. These are the workouts they have recently completed along with the dates: ${user.workoutHistory}. Make sure to include their personal information and previous workouts in the explanation.`;
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
          prompt: userPrompt + " Please include why this workout is beneficial for them specifically.",
          max_tokens: 50,
          temperature: 1,
        }),
      });
      
      if (res.ok) {
        const responseJson = await res.json();
  
        // Check if the response contains the expected data
        if (responseJson.choices && responseJson.choices.length > 0 && responseJson.choices[0].text) {
          console.log("OpenAI API Response:", responseJson.choices[0].text);
          setAiWorkoutDescription(responseJson.choices[0].text);
          createCustomWorkout(responseJson.choices[0].text);
        } else {
          console.error("Invalid response structure:", JSON.stringify(responseJson, null, 2));
        }
      } else {
        console.error("Failed to fetch data from OpenAI API. Status:", res.status, "Status Text:", res.statusText);
        const errorResponse = await res.text();
        console.error("Error Response Body:", errorResponse);
      }
    } catch (error) {
      console.error("An error occurred while fetching data from OpenAI API:", error);
    }
  };











// PARSE -------------------------------------------------------


  const createCustomWorkout = async () => {
    // Check if AI-generated workout description is available
    if (!aiWorkoutDescription) {
      console.error('AI workout description is not available');
      return;
    }
  
    // Use the AI to generate a complete workout plan
    const aiWorkoutPrompt = `Create a detailed workout plan for a ${user.age}-year-old ${user.gender}, weighing ${user.weight} lbs, ${user.height} cm tall, with a fitness goal of ${user.goal}. Consider their recent workout history: ${user.workoutHistory}. Include exercises, sets, reps, and rest periods.`;
  
    try {
      const aiRes = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "text-davinci-003",
          prompt: aiWorkoutPrompt,
          max_tokens: 150,
          temperature: 0.7,
        }),
      });
  
      if (aiRes.ok) {
        const aiResponseJson = await aiRes.json();
  
        // Check if the AI response is valid
        if (aiResponseJson.choices && aiResponseJson.choices.length > 0 && aiResponseJson.choices[0].text) {
          const aiGeneratedWorkout = aiResponseJson.choices[0].text;
          console.log("AI Generated Workout Plan:", aiGeneratedWorkout);
  
          // Process AI-generated workout plan
          const newWorkoutGroup = {
            groupName: `AI Custom Workout for ${user.fullName}`,
            workouts: processAIWorkoutPlan(aiGeneratedWorkout),
            createdDate: new Date(),
          };
  
          // Post the new workout group to your server/database
          const response = await axios.post('http://' + GLOBAL_IP +':3000/addWorkoutGroup', newWorkoutGroup);
          if (response.status === 201) {
            console.log('Custom workout group created successfully');
            setWorkoutGroups(prevGroups => [...prevGroups, response.data.workoutGroup]);
            navigation.navigate('WorkoutDetailScreen', { workoutGroup: response.data.workoutGroup });
          } else {
            console.error('Failed to create custom workout group');
          }
        } else {
          console.error("Invalid AI response structure:", JSON.stringify(aiResponseJson, null, 2));
        }
      } else {
        console.error("Failed to fetch data from AI API. Status:", aiRes.status, "Status Text:", aiRes.statusText);
        const errorResponse = await aiRes.text();
        console.error("Error Response Body:", errorResponse);
      }
    } catch (error) {
      console.error("An error occurred while fetching data from AI API:", error);
    }
  };
  
  const processAIWorkoutPlan = (aiWorkoutPlan) => {
    // Parse and structure the AI-generated workout plan into a format suitable for your application.
    // This parsing logic will depend on how the AI structures the workout plan.
    // For example, it might involve splitting the text into individual workouts and extracting details like sets, reps, etc.
  
    // Dummy implementation (replace with actual parsing logic):
    return [
      {
        name: 'AI Custom Exercise 1',
        description: 'First exercise description from AI',
        sets: '3',
        reps: '10',
        // Add other properties as needed
      },
      // ... other exercises
    ];
  };
  
  
  













  useEffect(() => {
      if (routes.params?.workoutCompleted) {
        const completedDay = routes.params.completedDay;
        setWorkoutDays(prevDays => ({ ...prevDays, [completedDay]: true }));
      }
    }, [routes.params?.workoutCompleted, routes.params?.completedDay]);



  const viewPastMonth = () => {// NEEDS TO BE ADDED
    navigation.navigate('MonthlyProgress');
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
      const response = await axios.get(`http://${process.env.GLOBAL_IP}:3000/getWorkoutGroups`);
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
      <TouchableOpacity 
        style={styles.aiWorkoutBox} 
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <MaterialCommunityIcons name="brain" size={24} color="aqua" />
        <Text style={[styles.aiWorkoutText, { textDecorationLine: 'underline' }]}>AI Recommended Workout</Text>
        {
          isExpanded 
          ? <Text style={styles.descriptionText}>{aiWorkoutDescription}</Text>
          : <Text style={styles.descriptionText}>Tap to see details</Text>
        }
        {
          isExpanded &&
          <TouchableOpacity 
            style={styles.detailButton}
            //onPress={() => navigation.navigate('WorkoutDetailScreen', { workoutGroup: })}    
          >
            <Text style={styles.detailButtonText}>Go to Workout</Text>
          </TouchableOpacity>
        }
      </TouchableOpacity>







       {/* Updated Workout Categories */}
       <View style={styles.categoriesBox}>
          <Text style={styles.subtitle}>Your custom workouts:</Text>
          <Animated.FlatList
            data={workoutGroups}
            keyExtractor={(item, index) => `${item.groupName}-${index}`} 
            renderItem={({ item, index }) => renderCategory({ item, index })} // Pass item and index explicitly to renderCategory
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
    flex: 1.9,
    marginBottom: 20,
    marginTop: 20,
    padding: 30,
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
    borderColor: 'aqua',
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
    color: 'white',
    textAlign: 'center',
    fontWeight: '600'
  },
  monthButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: 'aqua',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonText: {
    color: 'black',
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
    padding: 20,
    margin: 4,
    borderRadius: 10,
    backgroundColor: '#1a1a1a', // Dark theme color
    shadowColor: '#000',
    shadowOffset: {
    width: 0,
    height: 4,
  },

  aiWorkoutBoxExpanded: {
    height: 'auto', // Adjust as needed
  },
  aiWorkoutBoxCollapsed: {
    height: 100, // Adjust as needed
  },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, // Adds depth to the box
  },
    aiWorkoutText: {
    fontSize: 23,
    fontWeight: 'bold',
    color: 'aqua', // Vibrant text color for emphasis
    textAlign: 'center',
    marginTop: 5,
  },
  descriptionText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white', // Vibrant text color for emphasis
    textAlign: 'center',
    marginBottom: 10,
  },
  workoutItemContainer: {
    backgroundColor: '#fff', // White background
    borderRadius: 10, // Rounded corners
    padding: 15, // Internal spacing
    marginVertical: 8, // Space between items
    marginHorizontal: 16, // Horizontal spacing from screen edges
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.23, // Shadow opacity
    shadowRadius: 2.62, // Shadow radius
    elevation: 4, // Elevation for Android
  },

  // Title of the workout
  workoutTitle: {
    fontSize: 18, // Font size
    fontWeight: 'bold', // Bold font
    color: '#333', // Text color
    marginBottom: 8, // Space below the title
  },

  // Description of the workout
  workoutDescription: {
    fontSize: 14, // Font size
    color: '#666', // Text color
    lineHeight: 20, // Line height for better readability
  },

  // Button or touchable area for selecting the workout
  selectButton: {
    backgroundColor: '#3a90e2', // Button color
    padding: 10, // Padding inside the button
    borderRadius: 5, // Rounded corners of the button
    marginTop: 10, // Space above the button
    alignItems: 'center', // Center items inside the button
  },

  // Text inside the select button
  buttonText: {
    color: '#fff', // White text color
    fontWeight: '600', // Slightly bold
  },

  detailButtonText: {
    color: '#fff', // White text color
    fontWeight: '300',
  }


});
