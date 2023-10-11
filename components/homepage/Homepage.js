import React from 'react';
import { View, Text, StyleSheet,Button } from 'react-native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Dashboard from './Dashboard'
import Mealplans from '../mealplans/Mealplans'
import Workouts from '../workouts/Workouts';

import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuth } from '../../context/authcontext';
const Tab = createBottomTabNavigator();

export default function Home(){
    const { user, login } = useAuth();
    console.log(user);
  return (
      <Tab.Navigator initialRouteName='Home' screenOptions={{headerShown:false,tabBarStyle: {backgroundColor: '#161618',borderTopWidth: 0}}}>
        <Tab.Screen name="Screen1" component={Dashboard} options={{ tabBarLabel: "Home", tabBarIcon: ({ color, size }) => (
        <Ionicons name="home" color={color} size={size} />
      ), }} />
        <Tab.Screen name="Screen2" component={Workouts} options={{ tabBarLabel: "Workouts",tabBarIcon: ({ color, size }) => (
        <MaterialCommunityIcons name="weight-lifter" size={size} color={color} />
      ), }} />
        <Tab.Screen name="Screen3" component={Mealplans} options={{ tabBarLabel: "Meal plans",tabBarIcon: ({ color, size }) => (
        <MaterialCommunityIcons name="food-apple-outline" size={size} color={color} />
      ), }} />
      </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black', // Background color
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
  },
});
