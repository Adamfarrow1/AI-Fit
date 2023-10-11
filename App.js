import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Page from './Page';

import { AuthProvider } from './context/authcontext'; // Import AuthProvider

const Stack = createStackNavigator();

export default function App() {
  
  return (
    <AuthProvider>
      <Page></Page>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
