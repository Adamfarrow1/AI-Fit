import React, { Component, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './components/Login'; // Adjust the import path as needed
import Register from './components/Register';


import axios from 'axios';


const Stack = createStackNavigator();
export default function App() {
  // Replace with your server's IP or hostname
const serverURL = 'http://10.127.130.59:3000';

useEffect(() => {
  // Make the GET request to your server.
  axios
    .get(`${serverURL}/getData/adam`)
    .then((response) => {
      // Handle the response data here.
      console.log(response.data);
    })
    .catch((error) => {
      console.error('API request error:', error);
    });
}, []);

return (
    <View style={styles.container}>
      <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
      </Stack.Navigator>
    </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
