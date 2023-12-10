import React, { useRef, useState, useEffect, useReducer } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal, Dimensions, FlatList, ScrollView, ActivityIndicator, PanResponder } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import {OPENAI_API_KEY} from 'react-native-dotenv';
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



const EnhancedCategoryList = ({ workoutGroups }) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const renderItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.categoryItem,
        {
          opacity: scrollY.interpolate({
            inputRange: [-1, 0, 150 * index, 150 * (index + 2)],
            outputRange: [1, 1, 1, 0],
          }),
          transform: [
            {
              scale: scrollY.interpolate({
                inputRange: [-1, 0, 150 * index, 150 * (index + 1)],
                outputRange: [1, 1, 1, 0.7],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.itemText}>{item.groupName}</Text>
    </Animated.View>
  );

  return (
    <View style={styles.categoriesBox}>
      <Text style={styles.subtitle}>AI Workout Series</Text>
      <Animated.FlatList
        data={workoutGroups}
        keyExtractor={(item, index) => `${item.groupName}-${index}`}
        renderItem={renderItem}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      />
    </View>
  );
};






export default function Workouts() {

// State and Refs
  const initialState = {
    workoutGroups: [],
    workoutHistory: new Set(),
    streakCounter: 0,
    showSummaryModal: false,
    aiWorkoutDescription: '',
  };
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigation = useNavigation();
  const [lastWorkoutDate, setLastWorkoutDate] = useState(null);
  const fadeIn = useRef(new Animated.Value(1)).current; 
  const flipA = useRef(new Animated.Value(0)).current;
  const [buttonExpanded, setButtonExpanded] = useState(false);
  const buttonAnimation = useRef(new Animated.Value(1)).current;
  const routes = useRoute();
  const { params } = routes;
  const { user } = useAuth();
  const aiBoxPanResponder = useRef(null);
  const [isFetchingWorkout, setIsFetchingWorkout] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const { workoutGroups, aiWorkoutDescription, workoutHistory, streakCounter, showSummaryModal } = state;
  const route = useRoute();
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const progress = 60;//calculateProgress();
  const [colorAnim] = useState(new Animated.Value(0));
  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 0, 0, 1)', 'rgba(0, 0, 255, 1)'] // Red to Blue
  });    
  const animatedValue = useRef(new Animated.Value(1)).current;
  const [showWorkoutOptions, setShowWorkoutOptions] = useState(false);


  const handleProceedToWorkout = () => {
    setButtonExpanded(true);
    Animated.timing(buttonAnimation, {
      toValue: 100, // Arbitrary large number to fill the screen
      duration: 500,
      useNativeDriver: false
    }).start(() => {
      // Navigate to the workout detail after the animation
      navigateToWorkoutDetail(selectedWorkoutGroup);
    });
  };
  

  const LoadingScreen = () => (
    <View style={styles.container}>
      <View style={styles.helloWorldContainer}>
        <TypeWriter
          style={styles.textcolor}
          minDelay={120}
          typing={1}
        >
          Creating your custom AI workout...
        </TypeWriter>
      </View>
      <ActivityIndicator size="large" color="#00ff00" />
    </View>
  );
  

  useEffect(() => {
    Animated.timing(
      fadeIn,
      {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }
    ).start();
  }, [fadeIn]);

  const handlePressCategory = (id) => {
    setSelectedCategoryId(id);
    Animated.spring(animatedValue, {
      toValue: selectedCategoryId === id ? 1 : 1.05,
      useNativeDriver: true,
    }).start();
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



  const startColorAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 5000, // Corrected duration
          useNativeDriver: false
        }),
        Animated.timing(colorAnim, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: false
        })
      ])
    ).start();
  };
  useEffect(() => {
    startColorAnimation();
  }, []);



  useEffect(() => {
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        const isSwipeUp = gestureState.dy < -50; // Adjust threshold as needed
        const isSwipeDown = gestureState.dy > 50; // Adjust threshold as needed
  
        if (isSwipeUp || isSwipeDown) {
          dispatch({ type: 'TOGGLE_SUMMARY_MODAL' });
        }
      },
    });
  
    aiBoxPanResponder.current = panResponder.panHandlers;
  }, []);
  
  
  
  



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
      console.log('Workout already fetched for today');
      return; //  TAKE USER TO THE WORKOUT
    }


    setIsFetchingWorkout(true);
    const userPrompt = `You are currently working as part of an ai fitness app. Your task is to provide a short, brief, 2-sentence summary of an ideal personalized workout for today for a ${user.age}-year-old ${user.gender}, weighing ${user.weight} lbs, ${user.height} cm tall, with a fitness goal of ${user.goal}. Consider their recent workouts: ${user.workoutHistory}. Their name is ${user.fullName}`;
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
          prompt: userPrompt + " Please include why this workout is beneficial for the user. Now output the preview for today in an exciting tone that addresses the current user as if you were talking to them. Ensure that you do not include any extra characters or symbols",
          max_tokens: 100,
          temperature: 1,
        }),
      });
      
      if (res.ok) {
        const responseJson = await res.json();
  
        // Check if the response contains the expected data
        if (responseJson.choices && responseJson.choices.length > 0 && responseJson.choices[0].text) {
          console.log("OpenAI API Response:", responseJson.choices[0].text);
          dispatch({ type: 'SET_AI_WORKOUT_DESCRIPTION', payload: responseJson.choices[0].text });
          dispatch({ type: 'TOGGLE_SUMMARY_MODAL' });
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












// ----------------------------  AI WORKOUT CREATOR  --------------------------------------------------------------------


  const createCustomWorkout = async () => {
    // Check if AI-generated workout description is available
    if (!aiWorkoutDescription) {
      console.error('AI workout description is not available');
      return;
    }
  
    // Use the AI to generate a complete workout plan
    const aiWorkoutPrompt = `
        Create a personalized workout for the following user in a JSON format:
        - Age: ${user.age} years
        - Gender: ${user.gender}
        - Weight: ${user.weight} lbs
        - Height: ${user.height} cm
        - Fitness Goal: ${user.goal}
        - Recent Workouts: ${user.workoutHistory.join(', ')}

        The workout plan should be suitable for the user's fitness level and goals. 
        Please include a variety of exercises targeting different muscle groups, 
        with specific details using this format from these examples: "groupName": "Advanced Strength Training",
        "workouts": [
            {
                "name": "Squat",
                "description": "High weight, low rep barbell squats for leg strength.",
                "videoURL": "http://example.com/squat-video",
                "tip": "Keep your back straight and drive through your heels.",
                "sets": "5",
                "reps": "5"
            },
            {
                "name": "Deadlift",
                "description": "Heavy deadlifts focusing on form and power.",
                "videoURL": "http://example.com/deadlift-video",
                "tip": "Keep your spine neutral and use your legs to lift.",
                "sets": "5",
                "reps": "5"
            },
            {
                "name": "Bench Press",
                "description": "Barbell bench press for chest, shoulders, and triceps.",
                "videoURL": "http://example.com/benchpress-video",
                "tip": "Lower the bar to your mid-chest and press up explosively.",
                "sets": "5",
                "reps": "5"
            },
            {
                "name": "Pull Up",
                "description": "Wide-grip pull-ups for upper back and arm muscles.",
                "videoURL": "http://example.com/pullup-video",
                "tip": "Lead with your chest and pull until your chin is over the bar.",
                "sets": "4",
                "reps": "8-10"
            },
            {
                "name": "Military Press",
                "description": "Standing overhead press for shoulder strength.",
                "videoURL": "http://example.com/militarypress-video",
                "tip": "Keep your core tight and press straight overhead.",
                "sets": "4",
                "reps": "6-8"
            },
            {
                "name": "Barbell Row",
                "description": "Bent-over barbell rows for back and biceps.",
                "videoURL": "http://example.com/barbellrow-video",
                "tip": "Keep your back parallel to the ground and pull the bar to your waist.",
                "sets": "4",
                "reps": "8-10"
            }
          ]
    },
    {
        "groupName": "HIIT Workout",
        "workouts": [
            {
                "name": "Interval Sprints",
                "description": "Short, high-intensity sprints with rest periods to boost cardiovascular fitness.",
                "videoURL": "http://example.com/intervalsprints-video",
                "tip": "Sprint at maximum effort for 30 seconds, then walk or jog for 1 minute.",
                "sets": "10",
                "reps": "N/A"
            },
            {
                "name": "Jump Rope",
                "description": "High-tempo jump rope sessions for coordination and stamina.",
                "videoURL": "http://example.com/jumprope-video",
                "tip": "Maintain a steady rhythm and use your wrists to swing the rope.",
                "sets": "5",
                "reps": "3 minutes per set"
            },
            {
                "name": "Burpees",
                "description": "Full-body exercise for strength and aerobic endurance.",
                "videoURL": "http://example.com/burpees-video",
                "tip": "Keep your movements fluid and jump high during each repetition.",
                "sets": "4",
                "reps": "15-20"
            },
            {
                "name": "Mountain Climbers",
                "description": "Dynamic plank exercise for core strength and cardio.",
                "videoURL": "http://example.com/mountainclimbers-video",
                "tip": "Maintain a tight core and rapidly alternate your legs.",
                "sets": "4",
                "reps": "30 seconds per set"
            },
            {
                "name": "High Knees",
                "description": "Running in place with high knees to improve cardio and leg strength.",
                "videoURL": "http://example.com/highknees-video",
                "tip": "Drive your knees as high as possible and maintain a fast pace.",
                "sets": "5",
                "reps": "1 minute per set"
            }
          ]
    },
    {
        "groupName": "Stress Relief Yoga Sequence",
        "workouts": [
            {
                "name": "Breathing Exercise (Pranayama)",
                "description": "Deep breathing exercises to calm the mind and reduce anxiety.",
                "videoURL": "http://example.com/pranayama-video",
                "tip": "Inhale deeply through your nose, hold for a few seconds, then exhale slowly through the mouth.",
                "sets": "1",
                "reps": "5 minutes"
            },
            {
                "name": "Child's Pose (Balasana)",
                "description": "Gentle stretch for the back, hips, thighs, and ankles, helps release tension.",
                "videoURL": "http://example.com/childspose-video",
                "tip": "Focus on relaxing your body with each exhale, allowing the stress to melt away.",
                "sets": "1",
                "reps": "Hold for 2-3 minutes"
            },
            {
                "name": "Cat-Cow Stretch (Marjaryasana-Bitilasana)",
                "description": "Gently massages the spine and belly organs, useful for stress relief.",
                "videoURL": "http://example.com/catcow-video",
                "tip": "Coordinate your breath with the movement, inhaling as you arch the back and exhaling as you round the spine.",
                "sets": "1",
                "reps": "1-2 minutes"
            },
            {
                "name": "Forward Bend (Uttanasana)",
                "description": "Stretches the hamstrings and spine, calms the mind and relieves tension in the neck and back.",
                "videoURL": "http://example.com/forwardbend-video",
                "tip": "Bend your knees slightly if needed, and let your head hang heavily to deepen the stretch.",
                "sets": "2",
                "reps": "Hold for 1 minute each"
            },
            {
                "name": "Legs Up The Wall (Viparita Karani)",
                "description": "Relieves tired leg muscles, helps calm the nervous system.",
                "videoURL": "http://example.com/legsupthewall-video",
                "tip": "Support your lower back with a cushion and allow your arms to relax by your sides.",
                "sets": "1",
                "reps": "Hold for 5-10 minutes"
            },
            {
                "name": "Corpse Pose (Savasana)",
                "description": "Deep relaxation pose, helps to reduce stress, anxiety, and fatigue.",
                "videoURL": "http://example.com/savasana-video",
                "tip": "Close your eyes, breathe naturally, and focus on releasing tension from every part of your body.",
                "sets": "1",
                "reps": "5-10 minutes"
            }
          ]
    },
        and also keep in mind it must be able to run through this function, so only include what needs to be passed to this
        "app.post('/addWorkoutGroup', async (req, res) => {
          try {
            // Assuming req.body contains the groupName and an array of workouts
            const { groupName, workouts } = req.body;
        
            // Create a new instance of WorkoutGroupModel
            const workoutGroup = new WorkoutGroupModel({
              groupName,
              workouts
            });
        
            // Save the new workout group to the database
            await workoutGroup.save();
        
            res.status(201).json({ message: 'Workout group created successfully', workoutGroup });
          } catch (error) {
            console.error('Error creating workout group:', error);
            res.status(500).json({ error: 'An error occurred while creating the workout group' });
          }
        });"
        If there's no recent workout history, consider this as the first workout session for the user. 
    `;
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
          max_tokens: 1000,
          temperature: 0.7,
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
        const errorResponse = await aiRes.text();
        console.error("Error Response Body:", errorResponse);
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

  // Get the information from the database
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

  

  













  // ____________________________  LAYOUT  _________________________________________________________________________
  return (
    <View style={styles.container}>
      

    {/* AI Workout Summary Section */}
    <Animated.View 
      style={[styles.aiWorkoutBox, { transform: [{ scale: animatedValue }] }]}
      {...aiBoxPanResponder.current}
    >
      <TouchableOpacity 
        style={styles.aiWorkoutSummaryPic} 
        onPress={() => {
          fetchAIWorkoutSummary();
          setShowWorkoutOptions(true); // Show buttons after fetching summary
        }}
        disabled={isFetchingWorkout}
      >
        {isFetchingWorkout ? (
          <ActivityIndicator size="large" color="#00ff00" />
        ) : (
          <>
            <MaterialCommunityIcons name="dumbbell" size={24} color="white" />
            <Text style={styles.aiWorkoutText}>
              {aiWorkoutDescription || 'Tap to generate your personalized workout'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Conditionally render buttons */}
      {showWorkoutOptions && (
        <View style={styles.workoutOptions}>
          <TouchableOpacity style={styles.button} onPress={handleCloseSummary}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleProceedToWorkout}>
            <Text style={styles.buttonText}>Proceed to Workout</Text>
          </TouchableOpacity>
        </View>
      )}


    </Animated.View>
      {/* Progress Overview Section */}
      <View style={styles.cardDebug}>
        <Text style={styles.cardHeader}>Progress Overview</Text>
        <View 
          style={styles.progressBarContainerDebug}
        />
        <View 
          style={[styles.progressBarDebug, { width: `${progress}%` }]} 
        />
        <Text style={styles.cardContent}>Streak: {streakCounter} days</Text>
      </View>
  





      {/* Workout Categories Section */}
      <Text style={styles.sectionTitle}>Workout Categories</Text>
      <FlatList
        data={workoutGroups}
        keyExtractor={(item, index) => `${item.groupName}-${index}`}
        renderItem={({ item }) => (
          <Text style={styles.categoryText}>{item.groupName}</Text>
        )}
      />
  




      {/* Debugging Text */}
      <Text style={styles.debugText}>Debug: Selected Category ID: {selectedCategoryId}</Text>
      
    </View>

  );

};
  
  
  
  

















const styles = StyleSheet.create({

  workoutOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },

  // ___________________________________ BASICS ________________________________________________
  debugText: {
    fontSize: 16,
    color: 'red',
  },
  container: {
    flex: 1,
    backgroundColor: 'black', // Dark background
    padding: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4FC3F7', // Bright blue for contrast
    textShadowColor: 'rgba(0, 255, 255, 0.75)', // Neon-like shadow
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4FC3F7', // Bright futuristic color
    marginBottom: 15,
    textShadowColor: 'rgba(0, 255, 255, 0.75)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  text: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  button: {
    backgroundColor: '#00bcd4', // Neon-like blue
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#29B6F6', // Border color
    shadowColor: '#29B6F6', // Shadow color
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },






   // ___________________________________ CARD ________________________________________________

  card: {
    backgroundColor: '#263238',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    // shadowColor: '#29B6F6',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
    elevation: 5,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4FC3F7',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  categoryCard: {
    backgroundColor: '#263238',
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FC3F7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0',
    textShadowColor: '#4FC3F7',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  // slider: {
  //   height: 40,
  //   borderRadius: 5,
  //   backgroundColor: '#E0E0E0',
  // },
  // switch: {
  //   transform: [{ scaleX: .8 }, { scaleY: .8 }],
  //   marginRight: 10,
  // },

  // navBar: {
  //   backgroundColor: '#003366',
  //   height: 60,
  //   justifyContent: 'center',
  //   paddingHorizontal: 15,
  // },
  // navItem: {
  //   color: '#FFF',
  //   fontSize: 18,
  // },






// ______________________________  MODAL  ___________________________________________
  
  // modalContainer: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   backgroundColor: 'rgba(0,0,0,0.7)', // Semi-transparent background
  // },
  // modalContent: {
  //   backgroundColor: '#37474F',
  //   padding: 20,
  //   borderRadius: 10,
  //   shadowColor: '#29B6F6',
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.3,
  //   shadowRadius: 4,
  //   elevation: 5,
  // },
  // modalHeader: {
  //   fontSize: 20,
  //   fontWeight: 'bold',
  //   color: '#4FC3F7',
  //   marginBottom: 10,
  // },
  // modalView: {
  //   margin: 20,
  //   backgroundColor: 'rgba(28, 28, 30, 0.9)', // Dark background with slight opacity
  //   borderRadius: 20,
  //   padding: 35,
  //   alignItems: 'center',
  //   shadowColor: '#00FFDD', // Bright neon-like shadow color
  //   shadowOffset: {
  //     width: 0,
  //     height: 2
  //   },
  //   shadowOpacity: 0.5,
  //   shadowRadius: 4,
  //   elevation: 10,
  //   borderColor: '#00FFDD', // Neon border color
  //   borderWidth: 2,
  //   borderStyle: 'solid',
  //   // Adding a gradient background
  //   overflow: 'hidden',
  // },
  // gradientBackground: {
  //   position: 'absolute',
  //   left: 0,
  //   right: 0,
  //   top: 0,
  //   bottom: 0,
  //   borderRadius: 20,
  // },
  // modalText: {
  //   color: '#E0E0E0', // Light text for contrast
  //   textAlign: 'center',
  //   fontSize: 18,
  //   fontWeight: 'bold',
  //   marginVertical: 10,
  // },
  
  






  progressBarContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(55, 71, 79, 0.5)', // Semi-transparent background
    borderRadius: 10,
    height: 20,
    overflow: 'hidden',
    paddingHorizontal: 2, // Add some padding for a border effect
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'linear-gradient(to right, #4FC3F7, #2196F3)', // Gradient background
    width: '0%', // Dynamically update this value based on progress
    position: 'relative', // Position for animation
    overflow: 'hidden', // Hide overflowing content
  },
  // progressBarFill: {
  //   height: '100%',
  //   borderRadius: 10,
  //   backgroundColor: 'rgba(39, 174, 96, 0.9)', // Slightly transparent fill
  //   position: 'absolute', // Position for animation
  //   top: 0,
  //   left: 0,
  // },
  








  // listItem: {
  //   paddingVertical: 15,
  //   paddingHorizontal: 20,
  //   borderBottomWidth: 1,
  //   borderBottomColor: '#E0E0E0',
  // },
  // listItemText: {
  //   fontSize: 16,
  //   color: '#333',
  // },
  // divider: {
  //   height: 1,
  //   backgroundColor: '#E0E0E0',
  //   marginVertical: 10,
  // },
  // animatedView: {
  //   transform: [{ scale: 1.1 }],
  //   opacity: 0.8,
  // },  
  

  aiWorkoutBox: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#37474F', // Dark shade for the futuristic theme
    borderStyle: 'groove',
    borderWidth: 2,
    borderColor: '#29B6F6', // Vibrant border color
    shadowColor: '#29B6F6', // Shadow color matching border
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  aiWorkoutText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#29B6F6', 
    textAlign: 'center',
    textShadowColor: 'rgba(0, 255, 255, 0.75)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7,
  },
  aiWorkoutSummaryPic: {
    alignItems: 'center',
    justifyContent: 'center',

  },
  
  
})


