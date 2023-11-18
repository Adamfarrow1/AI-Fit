import React from 'react';
import { View, Text, StyleSheet, Button, Dimensions } from 'react-native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Dashboard from './Dashboard'
import Workouts from '../workouts/Workouts';

import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SimpleLineIcons } from '@expo/vector-icons'; 
import { useAuth } from '../../context/authcontext';
import Mealplans from '../mealplans/Mealplans';
const Tab = createBottomTabNavigator();

export default function Home(){
  const navigation = useNavigation();
  const {logout} = useAuth()

  navigation.setOptions({
    headerLeft: () => (
      <SimpleLineIcons onPress={logout} name="logout" style={{marginLeft: 15, marginTop: 5}} size={20} color="grey" />
    ),
    headerTitle: '',
    headerRight: () => (
      <Ionicons name="person-circle-outline" style={{marginRight: 10, marginTop: 5}} size={30} color="grey" />
    )
  });
  return (
      <Tab.Navigator initialRouteName='Home' screenOptions={{headerShown:false,tabBarStyle: {backgroundColor: '#161618',borderTopWidth: 0}}} id='tab'>
        <Tab.Screen name="Screen1" component={Dashboard} options={{ tabBarLabel: "Home", tabBarIcon: ({ color, size }) => (
        <Ionicons name="home" color={color} size={size- 5} />
      ), }} />
        <Tab.Screen name="Screen2" component={Workouts} options={{ tabBarLabel: "Workouts",tabBarIcon: ({ color, size }) => (
        <MaterialCommunityIcons name="weight-lifter" size={size - 5} color={color} />
      ), }} />
      
        <Tab.Screen name="Screen3" component={Mealplans} options={{ tabBarLabel: "Meal plans",tabBarIcon: ({ color, size }) => (
        <MaterialCommunityIcons name="food-apple-outline" size={size - 5} color={color} />
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
