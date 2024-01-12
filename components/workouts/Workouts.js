import React, { useRef, useState, useEffect, useReducer } from 'react';
import { View, 
         Text, 
         StyleSheet, 
         TouchableOpacity, 
         Animated, 
         Modal, 
         Dimensions, 
         Image,
         FlatList, 
         ScrollView, 
         SafeAreaView,
         ImageBackground,
         useWindowDimensions,
         ActivityIndicator, 
         PanResponder,
         FastImage,
} from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../../context/authcontext';




const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_WORKOUT_GROUPS':
      return { ...state, workoutGroups: action.payload };

    case 'SET_WORKOUT_HISTORY':
      return { ...state, workoutHistory: action.payload };

    case 'SET_STREAK_COUNTER':
      return { ...state, streakCounter: action.payload };

    case 'TOGGLE_SUMMARY_MODAL':
      return { ...state, showSummaryModal: !state.showSummaryModal };

    case 'SET_AI_WORKOUT_DESCRIPTION':
      return { ...state, aiWorkoutDescription: action.payload };


    default:
      return state;
  }
};

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.7; // 70% of the screen width
const ITEM_HEIGHT = ITEM_WIDTH; // Maintaining a 3:2 aspect ratio
const ITEM_MARGIN = width * 0.04; // Example: 4% of the screen width, adjust as needed
const HEIGHT = ITEM_HEIGHT + (2 * ITEM_MARGIN);

const aihight = ITEM_HEIGHT * -0.4// SUPPOSED TO KEEP THE AI WORKOUT DISCRIPTION BOX IN THE SAME PLACE BUT DOESNT WORK






export default function Workouts() {

// State and Refs
  const initialState = {
    workoutGroups: [],
    workoutHistory: new Set(),
    streakCounter: 0,
    showSummaryModal: false,
  };
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigation = useNavigation();
  const [lastWorkoutDate, setLastWorkoutDate] = useState(null);
  const buttonAnimation = useRef(new Animated.Value(1)).current;
  const routes = useRoute();
  const { params } = routes;
  const { user } = useAuth();
  const [isFetchingWorkout, setIsFetchingWorkout] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const route = useRoute();
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const progress = 60;//calculateProgress();
  const animatedValue = useRef(new Animated.Value(1)).current;
  const [showWorkoutOptions, setShowWorkoutOptions] = useState(false);
  const [modalAnimation] = useState(new Animated.Value(0)); // 0 represents the initial value
  const data = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43]
      }
    ]
  };
  const images = {
    'pilates': require('../images/pilates.webp'),
    'hiit': require('../images/hiit.webp'),
    'yoga': require('../images/yoga.webp'),
    'endurance': require('../images/endurance.webp'),
    'mobility': require('../images/mobility.webp'),
  };



  const handleNavigateToMonthlyProgress = () => {
    navigation.navigate('MonthlyProgress'); // Replace 'MonthlyProgress' with the actual route name if it's different
};


const fetchWorkoutGroups = async () => {
  try {
    const response = await axios.get(`http://${process.env.GLOBAL_IP}:3000/getWorkoutGroups`);
    dispatch({ type: 'SET_WORKOUT_GROUPS', payload: response.data.workoutGroups });

  } catch (error) {
    console.error('Error fetching workout groups:', error);
  }
};
useEffect(() => {
  fetchWorkoutGroups();
}, []);





  const extendedData = [...state.workoutGroups, ...state.workoutGroups, ...state.workoutGroups];
  const flatListRef = useRef();
  const snap = ITEM_WIDTH + (ITEM_MARGIN * 2);



  const getItemLayout = (data, index) => ({
    length: ITEM_WIDTH,
    offset: (ITEM_WIDTH + ITEM_MARGIN * 1.8) * index,
    index,
  });
  
  

  useEffect(() => {
    if (flatListRef.current && state.workoutGroups.length > 0) {
      const initialIndex = Math.floor(extendedData.length / 2);
      flatListRef.current.scrollToIndex({ index: initialIndex, animated: false });
    }
  }, [state.workoutGroups]);  
  


  const renderCarouselItem = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={() => navigateToWorkoutDetail(item)}>
        <View style={styles.carouselItemStyle}>
          <Image 
            source={images[item.image]}
            style={styles.imageStyle} // Uniform image style
          />
          <Text style={styles.highTechText}>{item.groupName}</Text>
        </View>
      </TouchableOpacity>
    );
  };


  const handleScroll = (event) => {
    const position = event.nativeEvent.contentOffset.x;
    const totalContentWidth = (ITEM_WIDTH + ITEM_MARGIN * 2) * extendedData.length;
  
    if (position <= 0) {
      flatListRef.current.scrollToOffset({ offset: totalContentWidth / 3, animated: false });
    } else if (position >= totalContentWidth * 2 / 3) {
      flatListRef.current.scrollToOffset({ offset: totalContentWidth / 3 - totalContentWidth, animated: false });
    }
  };
  
  














  useEffect(() => {
    const fetchWorkoutHistory = async () => {
      if (!user._id) {
        console.log('User ID not available, skipping fetch');
        return;
      }

      try {
        const url = `http://${process.env.GLOBAL_IP}:3000/user/${user._id}/workoutHistory`;
        const response = await axios.get(url);

        const { recentWorkouts } = response.data;
        const processedHistory = processWorkoutHistory(recentWorkouts);
        dispatch({ type: 'SET_WORKOUT_HISTORY', payload: processedHistory });
        calculateStreak(processedHistory);
      } catch (error) {
        console.error('Error fetching workout history:', error);
      }
    };
    fetchWorkoutHistory();
  }, [user._id]);

  const processWorkoutHistory = (workouts) => {
    return new Set(workouts.map((workout) => new Date(workout.date).toDateString()));
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

    dispatch({ type: 'SET_STREAK_COUNTER',  })
  }
  





  //__________________________________ AI WORKOUT SUMMARY ____________________________________________________________


  //Get the SUMMARY workout
  const fetchAIWorkoutSummary = async () => {

    const currentDate = new Date().toDateString();
    if (lastWorkoutDate === currentDate) {//FIX THIS IT NEEDS TO BE STORED PROPERLY
      console.log('Workout already fetched for today, displaying todays message...');
      dispatch({ type: 'TOGGLE_SUMMARY_MODAL' });
      createCustomWorkout();
      return; //  TAKE USER TO THE WORKOUT
    }



    setIsFetchingWorkout(true);
    const userPrompt = `You're currently contributing to an AI fitness app, tasked with generating concise, personalized workout summaries. For ${user.fullName}, a ${user.age}-year-old ${user.gender}, weighing ${user.weight} lbs, ${user.height} cm tall, aiming for ${user.goal}, and with a workout history of ${user.workoutHistory}, your role is to provide a tailored three-sentence brief overview plan.`;
    try {
      const res = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`

        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo-instruct",
          prompt: userPrompt + " Please include the workout type we will assign them and why this workout type is beneficial for the user. Now output the preview for today in an exciting tone that addresses the current user as if you were talking to them. Don't mention specififc parts of the workout like certain excersizes or timeframes. Ensure that you do not include any extra characters or symbols",
          max_tokens: 100,
          temperature: 1,
        }),
      });
      
      if (res.ok) {
        const responseJson = await res.json();
  
        // Check if the response contains the expected data
        if (responseJson.choices && responseJson.choices.length > 0 && responseJson.choices[0].text) {
          console.log("AI Workout Summary:", responseJson.choices[0].text);
          extractFromFirstCapital(responseJson.choices[0].text );
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
    setLastWorkoutDate(currentDate);//THIS NEEDS TO BE STORED SOMEWHERE

    
    
    //setIsFetchingWorkout(false);// CREATE A WORKOUT SCREEN THAT IS JUST LIKE THE LOGIN THAT SAYS PLEASE WAIT WHILE WE MAKE U BLAHBLAHBLAH
  };


  function extractFromFirstCapital(text) {
    // Regular expression to find the first uppercase letter
    const firstCapitalRegex = /[A-Z]/;
    // Finding the first occurrence of a capital letter
    const match = firstCapitalRegex.exec(text);
    const final = text.substring(match.index)
  
    // If a match is found, return the substring from the match position to the end
    if (match) {
      dispatch({ type: 'SET_AI_WORKOUT_DESCRIPTION', payload:final });
      dispatch({ type: 'TOGGLE_SUMMARY_MODAL' });
    } else {
      // If no capital letter is found, return a default message or handle as needed
      return "No capital letter found in the text.";
    }
  }



  




  const getAIworkout = () =>{
    return user.dailyAIWorkout[0];
  }



// ----------------------------  AI WORKOUT CREATOR  --------------------------------------------------------------------


  const createCustomWorkout = async () => {
    // Check if AI-generated workout description is available
    if (!state.aiWorkoutDescription) {
      console.error('AI workout description is not available');
      return;
    }
  
    // Use the AI to generate a complete workout plan
    const aiWorkoutPrompt = `
        ONLY RETURN a json of a personalized workout for the following user using ONLY some of these select workouts, based on which ones will be most benifitial: 
        "Archer-Pull-up", "Arm-Circles", "Arm-Crossover", "Assisted-Pull-up", "Barbell-Curl", 
        "Barbell-Bench-Press", "Barbell-Bent-Over-Row", "Barbell-Deadlift", 
        "Barbell-Behind-The-Back-Deadlift", "Bench-Dip", "Basic-to-Cross-Donkey-Kick", 
        "Barbell-Front-Bench-Squat", "Arm-slingers-Hanging-Bent-Knee-Legs", 
        "90-Degree-Heel-Touch-Abs", "45-Degree-Hip-Extension-Glute-Focused", 
        "Air-Twisting-Crunch", "Alternate-Lateral-Pulldown", "Alternate-Leg-Raise", 
        "Band-Alternate-Low-Chest-Fly", "45-degree-Bycicle-Twisting-Crunch", 
        "Barbell-Back-Wide-Shrug", "45-degree-Side-Bend_Waist", "Sit-up", "Weighted-Crunch", 
        "Assisted-Bulgarian-Split-Squat", "Barbell-Full-Squat", "Alternating-Superman_Hips". Use the exact title for the workout
        

        User info:
        - Age: ${user.age} years
        - Gender: ${user.gender}
        - Weight: ${user.weight} lbs
        - Height: ${user.height} cm
        - Fitness Goal: ${user.goal}
        - Recent Workouts: ${user.workoutHistory.join(', ')}

        The workout plan should be suitable for the user's fitness level and goals. 
        Please at least 5 workouts, 
        with specific details using this format: 
        
        
        {
            "groupName": "Strength and Conditioning Workout",
            "workouts": [
                {
                    "name": "Archer-Pull-up",
                    "description": "Targets the upper body muscles, especially the back and biceps, with unilateral movement for improved strength and symmetry.",
                    "tip": "Focus on keeping one arm straight while pulling up with the other.",
                    "sets": "4",
                    "reps": "6-8 per arm",
                    "videoURL": "http://example.com/archerpullup-video"
                },
                {
                    "name": "Barbell Deadlift",
                    "description": "A fundamental strength exercise that works the entire posterior chain, including the glutes, hamstrings, and lower back.",
                    "tip": "Keep your back straight and drive the movement from your hips.",
                    "sets": "5",
                    "reps": "8-10",
                    "videoURL": "http://example.com/barbelldeadlift-video"
                },
                {
                    "name": "Bench Dip",
                    "description": "Triceps-focused exercise that also engages the shoulders and chest.",
                    "tip": "Keep your elbows pointing backward and lower your body until your arms are at a 90-degree angle.",
                    "sets": "4",
                    "reps": "12-15",
                    "videoURL": "http://example.com/benchdip-video"
                },
                {
                    "name": "Barbell Front Bench Squat",
                    "description": "Targets the quadriceps and core stability by placing the barbell in front of the body.",
                    "tip": "Keep your elbows up and maintain a straight back throughout the squat.",
                    "sets": "4",
                    "reps": "8-10",
                    "videoURL": "http://example.com/barbellfrontbenchsquat-video"
                }
            ]
        }


        
        
    `;
    try {
      const aiRes = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo-instruct",
          prompt: aiWorkoutPrompt,
          max_tokens: 900,
          temperature: 0.9,
        }),
      });
  
      if (aiRes.ok) {
        const aiResponseJson = await aiRes.json();
  
        // Check if the AI response is valid
        if (aiResponseJson.choices && aiResponseJson.choices.length > 0 && aiResponseJson.choices[0].text) {
          const aiGeneratedWorkout = aiResponseJson.choices[0].text;
          console.log("AI Generated Workout Plan:", aiGeneratedWorkout);

  
          const workoutDetails = parseAIWorkoutPlan(aiGeneratedWorkout);
          // Post the new workout group to your server/database
          const response = await axios.post(`http://${process.env.GLOBAL_IP}:3000/user/${user._id}/updateDailyAIWorkout`, workoutDetails);
          if (response.status === 200) {
            console.log('Daily AI workout updated successfully');
          } else {or('Failed to create custom workout group');
          }
        } else {
          console.error("Invalid AI response structure:", JSON.stringify(aiResponseJson, null, 2));
        }
      } else {
        console.error("Failed to fetch data from AI API. Status:", aiRes.status, "Status Text:", aiRes.statusText);
      }
    } catch (error) {
      console.error("An error occurred while fetching data from AI API:", error);
    }
  };

  

  function parseAIWorkoutPlan(aiWorkoutPlan) {
    // Check if aiWorkoutPlan is undefined or not a string
    if (typeof aiWorkoutPlan !== 'string') {
      console.error('parseAIWorkoutPlan: aiWorkoutPlan is undefined or not a string:', aiWorkoutPlan);
      return null;
    }
  
    // Find the indices of the first opening brace and the last closing brace
    const firstBraceIndex = aiWorkoutPlan.indexOf('{');
    const lastBraceIndex = aiWorkoutPlan.lastIndexOf('}');
  
    // Check if braces are found
    if (firstBraceIndex === -1 || lastBraceIndex === -1) {
      console.error('parseAIWorkoutPlan: Invalid AI workout plan format');
      return null;
    }
  
    // Extract the substring that is the JSON object
    const jsonString = aiWorkoutPlan.substring(firstBraceIndex, lastBraceIndex + 1);
  
    try {
      // Parse the JSON string into an object
      const workoutPlanObject = JSON.parse(jsonString);
      console.log('parseAIWorkoutPlan: Successfully parsed workout plan');
      return workoutPlanObject;
    } catch (error) {
      console.error('parseAIWorkoutPlan: Error parsing JSON string:', error);
      return null;
    }
  }
  



  // _______________________________________________________________________________________________________
  















  // MONTHLY PROGRESS
  useEffect(() => {
      if (routes.params?.workoutCompleted) {
        const completedDay = routes.params.completedDay;
        setWorkoutDays(prevDays => ({ ...prevDays, [completedDay]: true }));
      }
    }, [routes.params?.workoutCompleted, routes.params?.completedDay]);








  // DAY PROGRESS
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






  // NAVIGATION FUNCTION
  const navigateToWorkoutDetail = (workoutGroup) => {
  
    if (navigation && workoutGroup) {
      console.log('Navigating to WorkoutDetailScreen with:', workoutGroup);
      navigation.navigate('WorkoutDetailScreen', { workoutGroup });
    } else {
      console.error('Navigation error: navigation object or workoutGroup is undefined');
    }
  };
  




  // ----------------------------- PRESET WORKOUT PROGRAMS --------------------------------------------------------------


  
  //____________________________  ANIMATIONS ______________________________________

  


  // ____________________________  LAYOUT  _________________________________________________________________________




  
  

  const renderSummaryModal = () => {
    return (
      <Modal
          visible={state.showSummaryModal}
          onRequestClose={() => dispatch({ type: 'TOGGLE_SUMMARY_MODAL' })}
          transparent={true}
          animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
              <Text style={styles.modalText}>{state.aiWorkoutDescription}</Text>
              
              {/* "Go to Workout" Button */}
              <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    navigateToWorkoutDetail(getAIworkout());
                    dispatch({ type: 'TOGGLE_SUMMARY_MODAL' });
                  }}
              >
                  <Text style={styles.buttonText}>Go to Workout</Text>
              </TouchableOpacity>

              {/* Close Button - Now at the bottom */}
              <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => dispatch({ type: 'TOGGLE_SUMMARY_MODAL' })}
              >
                  <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
          </View>
        </View>
      </Modal>
  );
};



  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.summaryButton} 
        onPress={fetchAIWorkoutSummary}
      >
        <Text style={styles.summaryButtonText}>Create Today's Custom AI Workout</Text>
      </TouchableOpacity>{renderSummaryModal()}


      <FlatList
        ref={flatListRef}
        data={extendedData}
        renderItem={renderCarouselItem}
        horizontal={true}
        keyExtractor={(item, index) => index.toString()}
        onScroll={handleScroll}
        snapToInterval={snap}
        decelerationRate={"fast"}
        getItemLayout={getItemLayout} 
        initialNumToRender={15}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListStyle}
      />


      <LineChart
        data={data}
        width={Dimensions.get("window").width} // Full width of the device
        height={200} // Increased height for a larger display
        yAxisSuffix="lbs"
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: "#0d0d0d", // Very dark background
          backgroundGradientFrom: "#141416", 
          backgroundGradientTo: "#282828", 
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(100, 255, 255, ${opacity})`, // Bright line for contrast
          labelColor: (opacity = 1) => `rgba(200, 200, 200, ${opacity})`, // Lighter label for readability
          style: {
            borderRadius: 15,
            paddingVertical: 10 // Padding for aesthetic spacing
          },
          propsForDots: {
            r: "5", 
            strokeWidth: "2",
            stroke: "#007AFF", // Bright stroke color for dots
          },
        }}
        bezier // Smooth curve for the line
        style={{
          marginVertical: -2,
          borderRadius: 15,
        }}
      />

      <TouchableOpacity 
          style={styles.monthlyProgressButton}
          onPress={handleNavigateToMonthlyProgress}
      >
          <Text style={styles.buttonText}>View Monthly Progress</Text>
      </TouchableOpacity>




    </View>
  );

};
  
  
  






const styles = StyleSheet.create({



  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#161618',
  },



  monthlyProgressButton: {
    backgroundColor: '#007AFF', // A neutral blue, adjust as needed
    padding: 10,
    marginBottom: -15,
    marginTop: 17,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // Subtle shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    marginVertical: 2,
  },
  buttonText: {
      color: '#FFFFFF', // White text for contrast
      fontSize: 15,
      fontWeight: '500', // Medium weight for readability
  },



  

  //________________________  CAROUSEL  ____________________________________
  
  flatListStyle: {
    paddingHorizontal: (width - ITEM_WIDTH - 74) / 2,
  },

  carouselItemStyle: {
    width: ITEM_WIDTH,
    height: HEIGHT,
    margin: ITEM_MARGIN,
    backgroundColor: '#333', // Or any other color
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageStyle: {
    width: '100%', // Make the image take the full width of the container
    marginTop: -6,
    height: ITEM_HEIGHT, // Adjust the height to maintain aspect ratio
    resizeMode: 'contain', // Ensures the entire image is visible
  },


  highTechText: {
    color: 'white', // Bright cyan color for a futuristic feel
    fontFamily: 'Arial', // Choose a sleek, modern font
    fontSize: 16, // Adjust size as needed
    fontWeight: 'bold', // Bold text for emphasis
    textTransform: 'uppercase', // Uppercase letters for a techy look
    letterSpacing: 2, // Increase letter spacing
    textShadowColor: 'rgba(0, 255, 255, 0.55)', // Cyan text shadow for a neon effect
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 10,
    margin: 10,
    textAlign: 'center',
  },






  //________________________  SUMMARY BUTTON ____________________________________
  summaryButton: {
    marginTop: -7,
    marginBottom: 10,
    backgroundColor: '#0f0f0f', // Dark color for high-tech theme
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#3d3d3d',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  summaryButtonText: {
    color: '#ffffff', // White text for contrast
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  //___________________________________________________________________________









  //__________________________ SUMMARY ________________________________________
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Darker overlay for contrast
  },
  modalContainer: {
    backgroundColor: '#2A2A2D', // Dark background
    borderRadius: 10, // Sharp edges for a modern look
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
    margin: 20,
    maxWidth: '80%', // Maximum width
    minWidth: '50%', // Minimum width
    maxHeight: '80%', // Maximum height
    minHeight: '20%', // Minimum height
  },
  modalText: {
      marginBottom: 20,
      fontSize: 16,
      textAlign: 'center',
      color: '#E8E8E8', // Light text for contrast
      // Consider a custom font here for a more tech look
  },
  button: {
      borderRadius: 5, // Sharp edges
      padding: 12,
      elevation: 2,
      backgroundColor: '#007AFF', // Vibrant accent color
      width: '80%',
      marginBottom: 10,
  },
  buttonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      textAlign: 'center',
  },
  closeButton: {
      backgroundColor: '#555559', // Subtle color for secondary button
      borderRadius: 5,
      padding: 12,
      elevation: 2,
      width: '80%',
  },
  closeButtonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      textAlign: 'center',
  },
  
  
  //___________________________________________________________________________








})


