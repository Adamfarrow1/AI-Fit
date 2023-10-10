import React from 'react';
import { View, Text, StyleSheet,Button } from 'react-native';
import { useAuth } from '../context/authcontext';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

export default function Home(){
    const { user, login } = useAuth();
    console.log(user);
  return (
      <View style={styles.container}>
            <Text style={styles.title}>Welcome: {user.userName}</Text>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#201a30', // Background color
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  subtitle: {
    fontSize: 18,
  },
});
