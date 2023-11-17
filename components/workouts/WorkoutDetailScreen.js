import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Workouts from './Workouts';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/authcontext';

export default function WorkoutDetailScreen({ route }) {
    const { workoutGroup } = route.params;
    const navigation = useNavigation();
    const [currentSet, setCurrentSet] = useState(1);
    const mongoose = require('mongoose');
    const { user } = useAuth();
    

    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

    const getCurrentDay = () => {
        const days = ['Su', 'M', 'T', 'W', 'Th', 'F', 'S'];
        return days[new Date().getDay()];
    };

    const incrementSet = () => {
        const currentExercise = workoutGroup.workouts[currentExerciseIndex];
        const isLastExercise = currentExerciseIndex === workoutGroup.workouts.length - 1;
        const isLastSet = currentSet >= parseInt(currentExercise.sets);
    
        if (isLastSet) {
            if (isLastExercise) {
                recordWorkoutCompletion();
                // This was the last set of the last exercise, go back to Workout page
                setCurrentExerciseIndex(1);
                setCurrentSet(1);
                navigation.navigate('Workouts', { workoutCompleted: true, completedDay: getCurrentDay() });
            } else {
                // Move to the next exercise
                setCurrentExerciseIndex(currentExerciseIndex + 1);
                setCurrentSet(1);
            }
        } else {
            // Increment the current set
            setCurrentSet(currentSet + 1);
        }
    };

    const recordWorkoutCompletion = () => {
        // Check if user object is defined and has _id property
        if (!user || !user._id) {
            console.error('User or user ID is undefined');
            return; // Exit the function if user or user ID is not available
        }
    
        // Convert ObjectId to a string
        const userId = user._id.toString();
    
        const url = `http://localhost:3000/user/${userId}/recordWorkout`;
    
        // Prepare the data to be sent
        const postData = {
            date: new Date(),
            workouts: workoutGroup.groupName,
        };
    
        // Perform the POST request
        axios.post(url, postData)
            .then(response => {
                console.log('Workout recorded successfully:', response.data);
            })
            .catch(error => {
                console.error('Error recording workout:', error);
            });
    };
    
    
    
    
    

    const calculateProgress = () => {
        const totalExercises = workoutGroup.workouts.length;
        let totalSets = 0;
        let completedSets = 0;
      
        workoutGroup.workouts.forEach((exercise, index) => {
          totalSets += parseInt(exercise.sets);
          if (index < currentExerciseIndex) {
            completedSets += parseInt(exercise.sets);
          } else if (index === currentExerciseIndex) {
            completedSets += currentSet - 1;
          }
        });
      
        return completedSets / totalSets;
      };
      



    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>{workoutGroup.groupName}</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${calculateProgress() * 100}%` }]} />
            </View>

            <View style={styles.content}>
            <Text style={styles.subtitle}>Current Exercise: {workoutGroup.workouts[currentExerciseIndex].name}</Text>
            <Text style={styles.subtitle}>Current Set: {currentSet}</Text>
            <Text style={styles.subtitle}>Tip: {workoutGroup.workouts[currentExerciseIndex].tip}</Text>
            
            <TouchableOpacity style={styles.button} onPress={incrementSet}>
                <Text style={styles.buttonText}>Next Set</Text>
            </TouchableOpacity>
        </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0d0d0d',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 38,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 10,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: 'white',
        marginBottom: 10,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        backgroundColor: '#3a90e2',
        marginTop: 20,
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
    progressBarContainer: {
        height: 20,
        width: '100%',
        backgroundColor: 'grey',
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 20,
      },
      progressBar: {
        height: '100%',
        backgroundColor: '#3a90e2',
        borderRadius: 10,
      },
});
