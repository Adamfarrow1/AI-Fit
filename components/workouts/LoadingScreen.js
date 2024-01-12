import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import TypeWriter from 'react-native-typewriter';
import { useNavigation } from '@react-navigation/native';


const LoadingScreen = ({ route }) => {
  const navigation = useNavigation();


  const [text, setText] = useState('Loading your custom AI workout...');
  
  const navigateToWorkoutDetail = (workoutGroup) => {
    try {
      navigation.navigate('WorkoutDetailScreen', { workoutGroup: workoutGroup });
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };



  useEffect(() => {
    const intervalId = setInterval(() => {
      setText(prevText => 
        prevText === 'Loading your custom AI workout...'
        ? 'Please wait one moment'
        : 'Loading your custom AI workout...'
      );

    }, 5000);

    const timer = setTimeout(() => {

      navigateToWorkoutDetail(route.params.workouts);

    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <View style={styles.container}>
      <TypeWriter typing={1} style={styles.text}>
        {text}
      </TypeWriter>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#161618', // Adjust the background color as needed
  },
  text: {
    color: '#FFFFFF', // Adjust the text color as needed
    fontSize: 20, // Adjust the font size as needed
  },
});

export default LoadingScreen;
