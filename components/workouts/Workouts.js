import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated } from 'react-native';
import { Circle, Svg } from 'react-native-svg';
import { Modal, ScrollView } from 'react-native';


export default function Workouts() {
  
  
  const [progress, setProgress] = useState(0.6); // Example: 60% progress
  const animatedValue = useRef(new Animated.Value(0)).current;
  const circleCircumference = 2 * Math.PI * 40; // Assuming a circle radius of 40
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);
  const [showStrengthTraining, setShowStrengthTraining] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [setsCompleted, setSetsCompleted] = useState(0);

  const [exerciseVideos, setExerciseVideos] = useState({
    // This should be filled with actual video URLs for your exercises
    Squats: "url_to_squats_video",
    Deadlifts: "url_to_deadlifts_video",
    // ... other exercises
  });
  
  const selectExercise = (exerciseName) => {
    setSelectedExercise(exerciseName);
    // Reset sets to 0 whenever a new exercise is selected
    setSetsCompleted(0);
    // Logic to show video and set tracker
  };

  const incrementSets = () => {
    // Logic to increment sets
    setSetsCompleted(prev => prev + 1);
  };
  

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

  const selectCategory = (category) => {
    setSelectedCategory(category);
    if (category === 'Strength Training') {
      setShowStrengthTraining(true);
    }
  };


  const closeStrengthTraining = () => {
    setShowStrengthTraining(false);
  };


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



  const ExerciseSet = ({ name, reps, tips, setsCompleted, onIncrement, totalSets }) => {
    // Calculate the width of the progress bar based on sets completed
    const progressWidth = (setsCompleted / totalSets) * 100 + '%';
  
    // Create an animated value for the progress bar width
    const animatedWidth = React.useRef(new Animated.Value(0)).current;
    React.useEffect(() => {
      // Animate the progress bar width when setsCompleted changes
      Animated.timing(animatedWidth, {
        toValue: setsCompleted / totalSets,
        duration: 500,
        useNativeDriver: false, // Width is not supported by native driver yet
      }).start();
    }, [setsCompleted, totalSets]);
  
    return (
      <View style={styles.exerciseContainer}>
        <Text style={styles.exerciseName}>{name}</Text>
        <Text style={styles.exerciseInfo}>{setsCompleted} sets of {reps} reps</Text>
        <Text style={styles.exerciseTips}>{tips}</Text>
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, { width: animatedWidth.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%']
          }) }]} />
        </View>
        <TouchableOpacity style={styles.button} onPress={onIncrement}>
          <Text style={styles.buttonText}>Set Complete</Text>
        </TouchableOpacity>
      </View>
    );
  };
  


  // STRENGTH TRAINING -----------------------------------------------
  const renderStrengthTrainingRegimen = () => {
    const [squatsSets, setSquatsSets] = useState(0);
  const [deadliftsSets, setDeadliftsSets] = useState(0);
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={showStrengthTraining}
        onRequestClose={closeStrengthTraining}
      >
        <View style={styles.modalView}>
          <ScrollView>
            <Text style={styles.modalTitle}>Today's Strength Training Regimen</Text>
  
            {/* Exercise List */}
            <ExerciseSet
            name="Squats"
            reps="12"
            tips="Keep your back straight and chest up."
            setsCompleted={squatsSets}
            onIncrement={() => setSquatsSets(squatsSets + 1)}
            />
            <ExerciseSet
            name="Deadlifts"
            reps="10"
            tips="Keep your back straight and chest up."
            setsCompleted={squatsSets}
            onIncrement={() => setSquatsSets(squatsSets + 1)}
            />

            <ExerciseSet
            name="Bench Press"
            reps="8"
            tips="Keep your back straight and chest up."
            setsCompleted={squatsSets}
            onIncrement={() => setSquatsSets(squatsSets + 1)}
            />

            <ExerciseSet
            name="Pull-Ups"
            reps="max"
            tips="Keep your back straight and chest up."
            setsCompleted={squatsSets}
            onIncrement={() => setSquatsSets(squatsSets + 1)}
            />

            <ExerciseSet
            name="Overhead Press"
            reps="10"
            tips="Keep your back straight and chest up."
            setsCompleted={squatsSets}
            onIncrement={() => setSquatsSets(squatsSets + 1)}
            />
            
  
  
            <View style={styles.exerciseContainer}>
              <Text style={styles.exerciseName}>Bicep Curls</Text>
              <Text style={styles.exerciseInfo}>2 sets of 15 reps</Text>
            </View>
  
            <View style={styles.exerciseContainer}>
              <Text style={styles.exerciseName}>Tricep Dips</Text>
              <Text style={styles.exerciseInfo}>2 sets of 15 reps</Text>
            </View>
  
            {/* Close button */}
            <TouchableOpacity
              style={styles.button}
              onPress={closeStrengthTraining}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    );
  };
  
  
  





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
      
      <TouchableOpacity onPress={() => selectCategory(item)}>
        <Animated.View style={{ ...styles.category, opacity, transform: [{ scale }] }}>
          <Text style={styles.text}>{item}</Text>
        </Animated.View>
      </TouchableOpacity>
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
        {renderStrengthTrainingRegimen()}
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
    backgroundColor: '#0d0d0d', // Darker background color
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ffffff', // Pure white text for better contrast
    alignSelf: 'center'
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10
  },
  text: {
    fontSize: 16,
    color: '#d0d0d0' // Light grey text for better readability
  },
  trackingBox: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#1a1a1a' // Slightly lighter than container for depth
  },
  categoriesBox: {
    flex: 3,
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#1a1a1a'
  },
  category: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: '#262626', // Even lighter to differentiate categories
    alignItems: 'center'
  },
  plansBox: {
    flex: 2,
    justifyContent: 'center',
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
    width: '13%',
    paddingVertical: 8,
    alignItems: 'center',
    margin: 5,
    borderWidth: 1.5,
    borderColor: '#3a90e2', // A cooler blue for the theme
    borderRadius: 5,
    backgroundColor: '#1a1a1a'
  },
  workoutDone: {
    textDecorationLine: 'line-through',
    color: '#27ae60', // A darker green to match the dark theme
    textAlign: 'center',
    fontWeight: '600'
  },
  workoutNotDone: {
    color: '#3a90e2', // A cooler blue to match the dark theme
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
  modalView: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a1a', // Dark background for modal as well
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 20,
    color: '#ffffff', // Ensuring text is readable on dark background
    textAlign: 'center',
  },
  scrollViewContent: {
    paddingTop: 20,
  },
  exerciseContainer: {
    marginBottom: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#333333', // Dark border for subtle delineation
    borderRadius: 4,
    backgroundColor: '#262626', // Slightly lighter to stand out against the background
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff', // White for the name for better visibility
  },
  exerciseInfo: {
    fontSize: 16,
    color: '#d0d0d0', // Light grey to differentiate from the name
  },
  button: {
    marginTop: 20,
    backgroundColor: '#3a90e2', // Cool blue for button
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
  },
  progressBarContainer: {
    height: 20,
    width: '100%',
    backgroundColor: '#333333', // Darker background for the progress bar
  }


  
});
