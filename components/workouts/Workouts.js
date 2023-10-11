import React from 'react';
import { View, Text, StyleSheet,Button } from 'react-native';

export default function Workouts(){

  return (
      <View style={styles.container}>
        <Text style={styles.title}>workouts</Text>
      </View>  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#161618', // Background color
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white'
  },
  subtitle: {
    fontSize: 18,
  },
});