import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { useAuth } from '../../context/authcontext';

const MonthlyProgress = () => {
  const [calendarData, setCalendarData] = useState({});
  const [workoutsList, setWorkoutsList] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchWorkoutHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/user/${user._id}/workoutHistory`);
        const { recentWorkouts } = response.data;
        processWorkoutData(recentWorkouts);
      } catch (error) {
        console.error('Error fetching workout history:', error);
      }
    };

    fetchWorkoutHistory();
  }, [user._id]);

  const processWorkoutData = (workouts) => {
    // Sort workouts by date in descending order
    const sortedWorkouts = workouts.sort((a, b) => new Date(b.date) - new Date(a.date));

    const calendar = {};
    sortedWorkouts.forEach(workout => {
      const date = new Date(workout.date);
      const day = date.getDate();
      if (!calendar[day]) {
        calendar[day] = [];
      }
      calendar[day].push(workout);
    });

    setCalendarData(calendar);
    setWorkoutsList(sortedWorkouts);
  };

  const hasWorkoutsForDay = (day) => {
    return calendarData[day] && calendarData[day].length > 0;
  };

  const renderCalendarDay = (day) => {
    const workoutsOnDay = calendarData[day] || [];
    const isWorkoutDay = hasWorkoutsForDay(day);
  
    return (
      <View key={day} style={[styles.calendarDayContainer, isWorkoutDay && styles.workoutDay]}>
        <Text style={[styles.calendarDayText, isWorkoutDay && styles.workoutDayText]}>{day}</Text>
      </View>
    );
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = today.getTime();
  today.setDate(today.getDate() - 27); // Display the past 4 weeks

  const calendarDays = [];
  const currentDate = new Date(today);

  while (currentDate.getTime() <= endDate) {
    calendarDays.push(currentDate.getDate());
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <View style={styles.container}>
      <View>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.calendarRow}>
            {week.map((day, dayIndex) => (
              <View key={dayIndex} style={styles.calendarDayContainer}>
                {renderCalendarDay(day)}
              </View>
            ))}
          </View>
        ))}
      </View>
      <Text style={styles.workoutListTitle}>Workouts:</Text>
      <Text style={styles.workoutListTitles}> </Text>
      <ScrollView style={styles.workoutListScroll}>
        <View style={styles.workoutListContainer}>
          {workoutsList.map((workout, index) => (
            <View key={index} style={styles.workoutItem}>
              <Text style={styles.workoutItemText}>{workout.workouts}</Text>
              <Text style={styles.workoutItemDate}>
                {new Date(workout.date).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'grey',
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calendarDayContainer: {
    flex: 1,
    aspectRatio: 1, // To maintain a square shape
    backgroundColor: '#3a90e2',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    borderColor: 'black',
    borderWidth: 1,
  },
  calendarDay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutDay: {
    backgroundColor: 'green',
  },
  calendarDayText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  workoutDayText: {
    color: 'white',
  },
  workoutListScroll: {
    flex: 1,
  },
  workoutListContainer: {
    padding: 20,
    marginTop: 4,
  },
  workoutListTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  workoutListTitles: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 5,
  },
  workoutItem: {
  marginBottom: 10,
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 10,
  borderColor: '#ddd',
  borderWidth: 1,
  borderBottomWidth: 2,  // Add a bottom border for the divider
  borderBottomColor: 'lightgrey', // Set the color of the divider
},
  workoutItemText: {
    fontSize: 16,
    color: '#333',
  },
  workoutItemDate: {
    fontSize: 12,
    color: '#888',
  },
});

export default MonthlyProgress;
