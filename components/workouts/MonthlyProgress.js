import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useAuth } from '../../context/authcontext';

const MonthlyProgress = () => {
  const [calendarData, setCalendarData] = useState({});
  const [selectedDayWorkouts, setSelectedDayWorkouts] = useState(null);
  const [workoutsList, setWorkoutsList] = useState([]);
  const [selectedDayData, setSelectedDayData] = useState(null);
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

  const renderCalendarDay = (day) => {
    const isWorkoutDay = calendarData[day] && calendarData[day].length > 0;

    return (
      <TouchableOpacity key={day} onPress={() => handleDayClick(day)}>
        <View style={[styles.calendarDayContainer, isWorkoutDay && styles.workoutDay]}>
          <Text style={[styles.calendarDayText, isWorkoutDay && styles.workoutDayText]}>{day}</Text>
        </View>
      </TouchableOpacity>
    );
  };









  const handleDayClick = (day) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentDay = new Date().getDate();
    const date = new Date(currentYear, currentMonth, day);
  
    if (day > currentDay) {
      // Adjust for the previous month
      date.setMonth(date.getMonth() - 1);
    }
  
    // Check if the adjustment set the month to December of the previous year
    if (date.getMonth() === 11 && currentMonth === 0) {
      date.setFullYear(currentYear - 1);
    }
  
    const dateString = date.toLocaleDateString(); // Format the date as a string
  
    const workoutsOnDay = calendarData[day];
    if (workoutsOnDay && workoutsOnDay.length > 0) {
      setSelectedDayData({
        date: dateString,
        workouts: workoutsOnDay.map(workout => workout.workouts).join(", ")
      });
    } else {
      setSelectedDayData({
        date: dateString,
        workouts: "No Workouts"
      });
    }
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
      {/* Display selected day's workout information */}
      <View style={styles.selectedDayWorkoutContainer}>
        {selectedDayData ? (
          <>
            <Text style={styles.selectedDayWorkoutDate}>{selectedDayData.date}</Text>
            <Text style={styles.selectedDayWorkoutText}>{selectedDayData.workouts}</Text>
          </>
        ) : (
          <Text style={styles.selectedDayWorkoutText}>Select a day to see workouts</Text>
        )}
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
    marginTop: 10,
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
  borderColor: 'lightblue',
  borderWidth: 4,
  borderBottomColor: 'lightblue', // Set the color of the divider
},
  workoutItemText: {
    fontSize: 16,
    color: '#333',
  },
  workoutItemDate: {
    fontSize: 12,
    color: '#888',
  },
  selectedDayWorkoutContainer: {
    padding: 10,
    marginTop: 20,
    backgroundColor: '#ddd', // Example background color
    // Other styling as needed
  },
  selectedDayWorkoutText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 2.5,
    // Other text styling as needed
  },
  selectedDayWorkoutDate: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    // Other styling as needed
  },

});

export default MonthlyProgress;
