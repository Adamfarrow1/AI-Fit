import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {OPENAI_API_KEY} from 'react-native-dotenv';
import axios from 'axios';
import { useAuth } from '../../context/authcontext';
import WorkoutDetailScreen from './WorkoutDetailScreen';





export default function Workouts() {

  
  const navigation = useNavigation();
  
  // State and Refs
  const [workoutGroups, setWorkoutGroups] = useState([]);
  const routes = useRoute();
  const [aiWorkoutDescription, setAiWorkoutDescription] = useState('');
  const { params } = routes;
  const { user } = useAuth();
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
  }, );
  
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
  





  //_________________________ AI WORKOUT SUMMARY ____________________________________________________________


  //Get the SUMMARY workout
  const fetchAIWorkout = async () => {
    //Feed the user data
    const userPrompt = `You are currently working as part of an ai fitness app. Your task is to provide a short, brief, 2-sentence summary of an ideal personalized workout for today for a ${user.age}-year-old ${user.gender}, weighing ${user.weight} lbs, ${user.height} cm tall, with a fitness goal of ${user.goal}. Consider their recent workouts: ${user.workoutHistory}.`;
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
          prompt: userPrompt + " Please include why this workout is beneficial for the user. Now output the preview for today in an exciting tone that addresses the current user as if you were talking to them",
          max_tokens: 100,
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
          const response = await axios.post(`http://localhost:3000/user/${user._id}/updateDailyAIWorkout`, workoutDetails);
          if (response.status === 200) {
            console.log('Daily AI workout updated successfully');
            navigateToWorkoutDetail(workoutDetails);
            // Handle successful update here
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
      console.log('parseAIWorkoutPlan: Successfully parsed workout plan:', workoutPlanObject);
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



  const viewPastMonth = () => {// NEEDS TO BE ADDED
    navigation.navigate('MonthlyProgress');
  };



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
    console.log('navigateToWorkoutDetail called with:', workoutGroup);
  
    if (navigation && workoutGroup) {
      console.log('Navigating to WorkoutDetailScreen with:', workoutGroup);
      navigation.navigate('WorkoutDetailScreen', { workoutGroup });
    } else {
      console.error('Navigation error: navigation object or workoutGroup is undefined');
    }
  };
  




  // ----------------------------- WORKOUT PROGRAMS --------------------------------------------------------------

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


  





  

  














  // ____________________________  LAYOUT  _________________________________________________________________________
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
        <Text style={styles.subtitle}>AI Workout Series:</Text>
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
          style={{ flex: 1 }} // Add this line to ensure the modal takes up the entire screen
        >
          <View style={styles.fullScreenModalView}>
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
    backgroundColor: '#1a1a1a', 
    shadowColor: '#000',
    shadowOffset: {
    width: 0,
    height: 4,
  },

  aiWorkoutBoxExpanded: {
    height: 'auto', 
  },
  aiWorkoutBoxCollapsed: {
    height: 100, 
  },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, 
  },
    aiWorkoutText: {
    fontSize: 23,
    fontWeight: 'bold',
    color: 'aqua', 
    textAlign: 'center',
    marginTop: 5,
  },
  descriptionText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white', 
    textAlign: 'center',
    marginBottom: 10,
  },
  workoutItemContainer: {
    backgroundColor: '#fff', 
    borderRadius: 10, 
    padding: 15,
    marginVertical: 8, 
    marginHorizontal: 16,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23, 
    shadowRadius: 2.62, 
    elevation: 4, 
  },

  workoutTitle: {
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 8, 
  },

  workoutDescription: {
    fontSize: 14, 
    color: '#666', 
    lineHeight: 20, 
  },

  selectButton: {
    backgroundColor: '#3a90e2',
    padding: 10, 
    borderRadius: 5, 
    marginTop: 10, 
    alignItems: 'center', 
  },

  buttonText: {
    color: '#fff', 
    fontWeight: '600', 
  },

  detailButtonText: {
    color: '#fff', 
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalView: {
    margin: 5,
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
    margin: 30,
    textAlign: "center",
    color: 'white', 
    fontSize: 16, 
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10, 
  },
  buttonClose: {
    backgroundColor: "aqua", 
  },
  textStyle: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
  },
  fullScreenModalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.9)', 
  },

});
