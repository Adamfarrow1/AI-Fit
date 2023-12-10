import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/authcontext';
import { LineChart } from 'react-native-chart-kit';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState('');

  useEffect(() => {
    // Fetch workout history, meal plans, and progress data
    fetchWorkoutHistory();
    //fetchMealPlans();
    //fetchProgressData();
    //fetchAiRecommendations();
  }, [user]);


  // const fetchMealPlans = async () => {
  //   try {
  //     const response = await axios.get(`${process.env.GLOBAL_IP}:3000/user/${user._id}/mealPlans`);
  //     setMealPlans(response.data.mealPlans);
  //   } catch (error) {
  //     console.error('Error fetching meal plans:', error);
  //   }
  // };

  const fetchWorkoutHistory = async () => {
    if (!user._id) {
      console.log('User ID not available, skipping fetch');
      return;
    }
  
    try {
      const url = `http://${process.env.GLOBAL_IP}:3000/user/${user._id}/workoutHistory`;
      const response = await axios.get(url);
  
      if (response.status === 200) {
        console.log('Workout history fetched');
        setWorkoutHistory(response.data.recentWorkouts.map(workout => ({
          ...workout,
          date: new Date(workout.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
        })));
      } else {
        console.error('Failed to fetch workout history:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching workout history:', error);
    }
  };
  


  // const fetchAiRecommendations = async () => {
  //   // Implement fetching AI-generated fitness recommendations
  // };

  const renderWorkoutHistory = () => {
    if (workoutHistory.length === 0) {
      return <Text style={styles.noDataText}>No recent workouts to display.</Text>;
    }
  
    console.log('Rendering workout history');
    return workoutHistory.map((workout, index) => (
      <TouchableOpacity 
        key={index} 
        style={styles.workoutItem}
        onPress={() => navigateToWorkoutDetail(workout)}
        accessibilityLabel={`Workout details for ${workout.name}`}
        accessibilityHint="Double tap to view more details about this workout"
      >
        <View style={styles.workoutHeader}>
          <Text style={styles.workoutDate}>{formatDate(workout.date)}</Text>
          <Text style={styles.workoutName}>{workout.name}</Text>
        </View>
        <View style={styles.workoutContent}>
          <Text style={styles.workoutSummary}>{workout.summary || 'No summary available'}</Text>
        </View>
      </TouchableOpacity>
    ));
    
  };
  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // const renderMealPlans = () => {
  //   return mealPlans.map((meal, index) => (
  //     <View key={index} style={styles.mealItem}>
  //       <Text style={styles.mealText}>{meal.name}</Text>
  //     </View>
  //   ));
  // };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Welcome, {user.userName}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        {renderWorkoutHistory()}
      </View>

  
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meal Plans</Text>
        {mealPlans.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {renderMealPlans()}
          </ScrollView>
        ) : (
          <Text style={styles.noDataText}>No meal plans available.</Text>
        )}
      </View>
  
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress Over Time</Text>
        {progressData.length > 0 ? (
          <LineChart
            // Chart properties
          />
        ) : (
          <Text style={styles.noDataText}>No progress data to display.</Text>
        )}
      </View>
  
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Recommendations</Text>
        <Text style={styles.recommendationText}>
          {aiRecommendations || 'Fetching AI recommendations...'}
        </Text>
      </View>
    </ScrollView>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginVertical: 10,
  },
  noDataText: {
    color: 'gray',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  workoutItem: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutDate: {
    fontSize: 14,
    color: '#666',
  },
  workoutName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  workoutContent: {
    marginTop: 5,
  },
  workoutSummary: {
    fontSize: 14,
    color: '#333',
  },
});

export default Dashboard;
