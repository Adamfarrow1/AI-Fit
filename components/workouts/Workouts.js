import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal, Alert } from 'react-native';
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
  const [workoutHistory, setWorkoutHistory] = useState(new Set());
  const [streakCounter, setStreakCounter] = useState(0);
  const [showSummaryModal, setShowSummaryModal] = useState(false);





  

  useEffect(() => {
    const fetchWorkoutHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/user/${user._id}/workoutHistory`);
        const { recentWorkouts } = response.data;
        const processedHistory = processWorkoutHistory(recentWorkouts);
        setWorkoutHistory(processedHistory);
        calculateStreak(processedHistory);
      } catch (error) {
        console.error('Error fetching workout history:', error);
      }
    };
    fetchWorkoutHistory();
  }, [user._id]);
  
  const processWorkoutHistory = (workouts) => {
    // Process and return the workout dates as a set
    return new Set(workouts.map(workout => new Date(workout.date).toDateString()));
  };
  
  const calculateStreak = (processedHistory) => {
    const today = new Date();
    let streak = 0;
  
    for (let i = 0; i <= 365; i++) { 
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      if (processedHistory.has(checkDate.toDateString())) {
        streak++;
      } else {
        break;
      }
    }
  
    setStreakCounter(streak);
  };
  





  //______________________________________________________________________________________


  //Get the SUMMARY workout
  const fetchAIWorkout = async () => {
    //Feed the user data
    const userPrompt = `Provide a brief, 2-sentence summary of an ideal personalized workout for a ${user.age}-year-old ${user.gender}, weighing ${user.weight} lbs, ${user.height} cm tall, with a fitness goal of ${user.goal}. Focus on the key aspects and benefits, considering their recent workouts: ${user.workoutHistory}.`;
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
          setShowSummaryModal(true);
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
    const aiWorkoutPrompt = `Generate a personalized workout plan for a user with the following profile: age: ${user.age} years, gender: ${user.gender}, weight: ${user.weight} lbs, height: ${user.height} cm, fitness goal: ${user.goal}. Take into account their recent workout history: ${user.workoutHistory}. If the history is blank, mention that this is their first custom workout. The plan should include a variety of exercises targeting different muscle groups appropriate for the user's fitness level and goals. For each exercise, specify the name, sets, reps, and rest periods in a clear, structured format that can be easily understood and implemented. The plan should be balanced, progressive, and safe, considering the user's physical capabilities and objectives.`;
  
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
      {/* Existing content and components */}
      
      {/* AI Recommended Workout Box */}
      <TouchableOpacity 
        style={styles.aiWorkoutBox} 
        onPress={fetchAIWorkout} // Directly calling fetchAIWorkout on press
      >
        <MaterialCommunityIcons name="brain" size={24} color="aqua" />
        <Text style={[styles.aiWorkoutText, { textDecorationLine: 'underline' }]}>
          AI Recommended Workout
        </Text>
      </TouchableOpacity>

  
      {/* Workout Categories */}
      <View style={styles.categoriesBox}>
        <Text style={styles.subtitle}>Your custom workouts:</Text>
        <Animated.FlatList
          data={workoutGroups}
          keyExtractor={(item, index) => `${item.groupName}-${index}`} 
          renderItem={({ item, index }) => renderCategory({ item, index })}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        />
      </View>
  
      {/* Week's Progress */}
      <View style={styles.plansBox}>
        <Text style={styles.subtitle}>This Week's Progress</Text>
        <Text style={styles.streakText}>Workout Streak: {streakCounter}</Text>
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
  
      {/* AI Workout Summary Modal */}
      {
        showSummaryModal &&
        <Modal
          animationType="slide"
          transparent={true}
          visible={showSummaryModal}
          onRequestClose={() => setShowSummaryModal(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>{aiWorkoutDescription}</Text>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => {
                  setShowSummaryModal(false);
                  createCustomWorkout();
                }}
              >
                <Text style={styles.textStyle}>Proceed to Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      }
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
    marginBottom: 10,
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
  },

  streakText: {
    fontSize: 16,
    color: '#d0d0d0',
    textAlign: 'center',
    marginBottom: 10,
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)' // Semi-transparent background
  },
  modalView: {
    margin: 20,
    backgroundColor: "black",
    borderRadius: 20,
    borderColor: "aqua",
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    color: 'white', // Text color
    fontSize: 16, // Text size
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10, // Spacing above the button
  },
  buttonClose: {
    backgroundColor: "#2196F3", // Button background color
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },

});
