import React from 'react';
import { View, Text, StyleSheet,Button } from 'react-native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Dashboard from './Dashboard'
import Mealplans from '../mealplans/Mealplans'
import Workouts from '../workouts/Workouts';

import { useAuth } from '../../context/authcontext';
const Tab = createBottomTabNavigator();

export default function Home(){
    const { user, login } = useAuth();
    console.log(user);
  return (
      <Tab.Navigator initialRouteName='Home' screenOptions={{headerShown:false}}>
        <Tab.Screen name="Screen1" component={Dashboard} options={{ tabBarLabel: "Home" }} />
        <Tab.Screen name="Screen2" component={Workouts} options={{ tabBarLabel: "Workouts" }} />
        <Tab.Screen name="Screen3" component={Mealplans} options={{ tabBarLabel: "Meal plans" }} />
      </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Background color
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
