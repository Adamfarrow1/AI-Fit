import React from 'react';
import { View, Text, StyleSheet,Button } from 'react-native';

export default function Workouts(){

  return (
      <View style={styles.container}>
        <Text>Meal plans</Text>
      </View>  );
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