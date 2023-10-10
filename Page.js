import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Homepage';

import { AuthProvider ,useAuth } from './context/authcontext'; 

const Stack = createStackNavigator();
const Page = () => {
    const {user} = useAuth();
    return ( 
        <View style={styles.container}>
        <NavigationContainer>
            { user ? (
            <Stack.Navigator>
              <Stack.Screen name="Home" component={Home} />
            </Stack.Navigator> )
            :
            (<Stack.Navigator>
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Register" component={Register} />
              <Stack.Screen name="Home" component={Home} />
            </Stack.Navigator>)
            }

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
 
export default Page;