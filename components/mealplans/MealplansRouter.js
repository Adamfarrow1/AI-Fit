import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Mealplans from './Mealplans';
import DetailsScreen from './Details';
import { useEffect } from 'react';

const Stack = createStackNavigator();

const MealplansRouter = ({ navigation }) => {

  return (

      <Stack.Navigator initialRouteName="Home">
                <Stack.Screen
          name="Home"
          component={Mealplans}
          options={{ headerShown: false }} // Hide the header for the "Home" screen
        />
        <Stack.Screen name="Details" component={DetailsScreen}  />
      </Stack.Navigator>

  );
};

export default MealplansRouter;
