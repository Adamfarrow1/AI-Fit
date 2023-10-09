import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/authcontext';

export default function Home(){
    const { user, login } = useAuth();
    console.log(user);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome: {user.userName}!</Text>
      <Text style={styles.subtitle}>This is the home screen</Text>
    </View>
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
