import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Workouts from './Workouts';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/authcontext';
import workoutGif from '../../assets/gifs/12501301-Weighted-Crunch-(behind-head)_Waist_180.gif';

export default function WorkoutDetailScreen({ route }) {
    const { workoutGroup } = route.params;
    const navigation = useNavigation();
    const [currentSet, setCurrentSet] = useState(1);
    const mongoose = require('mongoose');
    const { user } = useAuth();
    const [showQuiz, setShowQuiz] = useState(false);
    const [answerOne, setAnswerOne] = useState('');
    const [answerTwo, setAnswerTwo] = useState('');
    

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

    const handleQuizSubmit = () => {
        setShowQuiz(false);
        // Handle quiz submission logic here (e.g., validate answers)
        console.log('Answer 1:', answerOne, 'Answer 2:', answerTwo);
        // Navigate back to Workouts screen
        navigation.navigate('Screen2', { workoutCompleted: true, completedDay: getCurrentDay() });    
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
        setShowQuiz(true);
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
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>{workoutGroup.groupName}</Text>
        </View>

        {/* Workout Description */}
        <Text style={styles.workoutDescription}>
            {workoutGroup.workouts[currentExerciseIndex].description}
        </Text>


        <Image 
            source={workoutGif} 
            style={styles.workoutGif} 
        />


        <View style={styles.bottomContent}>
            <Text style={styles.subtitle}>Tip: {workoutGroup.workouts[currentExerciseIndex].tip}</Text>
            <Text style={styles.subtitle}>Current Set: {currentSet}</Text>
            <TouchableOpacity style={styles.button} onPress={incrementSet}>
                <Text style={styles.buttonText}>Next Set</Text>
            </TouchableOpacity>
        </View>

         {/* Quiz Modal */}
         <Modal
                animationType="slide"
                transparent={true}
                visible={showQuiz}
                onRequestClose={() => setShowQuiz(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Answer these short questions to help our AI bot fine tune your next workout</Text>
                        <Text></Text>
                        <Text style={styles.modalText}>How hard was that workout</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={setAnswerOne}
                            value={answerOne}
                            placeholder="Your answer"
                        />
                        <Text style={styles.modalText}>Did you enjoy it?</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={setAnswerTwo}
                            value={answerTwo}
                            placeholder="Your answer"
                        />
                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={handleQuizSubmit}
                        >
                            <Text style={styles.buttonText}>Submit Answers</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
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
        color: 'black',
        marginLeft: 10,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    workoutGif: {
        width: 300,
        height: 300,
        margin: 20,
        alignSelf: 'center', // Centers the GIF in the view
        backgroundColor: '#0d0d0d', // Matches the app background color
        borderRadius: 10, // Optional: Adds rounded corners
    },




    subtitle: {
        fontSize: 18,
        color: 'black',
        marginBottom: 10,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        backgroundColor: 'black',
        marginTop: 20,
        marginBottom: 20,
    },
    buttonText: {
        color: 'white',
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
      workoutDescription: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 20,
        textAlign: 'center',
    },
    bottomContent: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "#e0e0e0",
        borderRadius: 20,
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
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        color: 'black',
        padding: 10,
        width: 200
    },
});
