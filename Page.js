import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './components/login-register/Login';
import Register from './components/login-register/Register';
import Home from './components/homepage/Homepage';
import WorkoutDetailScreen from './components/workouts/WorkoutDetailScreen';
import Workouts from './components/workouts/Workouts';
import MonthlyProgress from './components/workouts/MonthlyProgress';
import { useAuth } from './context/authcontext';

const Stack = createStackNavigator();

const Page = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!user && navigation.isFocused()) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#161618',
          },
          headerShadowVisible: false,
          headerTintColor: 'white',
        }}
      >

        <Stack.Screen name="Login" options={{ headerShown: false }} component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Home" options={{ gestureEnabled: false }} component={Home} />
        <Stack.Screen name="Workouts"  component={Workouts} />
        <Stack.Screen name="MonthlyProgress" component={MonthlyProgress} />
        <Stack.Screen 
          name="WorkoutDetailScreen" 
          component={WorkoutDetailScreen} 
          options={{ headerShown: false }}  // Add this line
        />

      </Stack.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default Page;
