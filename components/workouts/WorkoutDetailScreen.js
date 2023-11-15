import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Workouts from './Workouts';
import { Ionicons } from '@expo/vector-icons';

export default function WorkoutDetailScreen({ route }) {
    const { workoutGroup } = route.params;
    const navigation = useNavigation();
    const [currentSet, setCurrentSet] = useState(1);
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
    



    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>{workoutGroup.groupName}</Text>
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
});
