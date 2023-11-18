import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DetailsScreen = ({ route }) => {
  const meal = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{meal.meals.name}</Text>
      {/* Add more Text components to display other properties if needed */}
      <Text>{meal.meals.calories}</Text>
      <Text>{meal.meals.ingredients}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },

  title: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: 20,
  },
});

export default DetailsScreen;
