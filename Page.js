import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './components/login-register/Login';
import Register from './components/login-register/Register';
import Home from './components/homepage/Homepage';
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
