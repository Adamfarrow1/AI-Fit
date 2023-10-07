import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import axios from 'axios';
export default function Login() {
    const navigation = useNavigation(); // Use the useNavigation hook
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const  handleLogin = async () => {
    try {
      const response = await axios.post('http://10.127.130.59:3000/login', {
        name: username, // Updated state variable name
        password: password,
      });

      if (response.data.message === 'Login successful') {
        console.log('User login successful');
        // Optionally, you can navigate to another screen after successful registration
        // navigation.navigate('SuccessScreen');
      }
    } catch (error) {
      console.error('Error login user:', error);
    }
    setUsername('');
      setPassword('');
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false, // Hide the navigation header
    });
  }, [navigation]);



  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/fitness-sport-gym-logo-design-vector.jpg')}
        style={styles.logo}
      />
      <View style={styles.center}>
        <TextInput
          style={styles.input}
          placeholderTextColor="#6b6776"
          placeholder="Username"
          value={username}
          onChangeText={(text) => setUsername(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={true}
          placeholderTextColor="#6b6776"
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        <View style={styles.apart}>
          <View style={styles.button}>
              <Button
                title="Login"
                onPress={handleLogin}
                color="black"
              />
          </View>

          
            <Button
              title="New User? Register"
              onPress={() => navigation.navigate('Register')} // Use the navigation object
              color="#6b6776"
            />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#201a30',
  },
  input: {
    width: 300,
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 12,
    paddingLeft: 10,
    color: 'black', // Text color for input fields
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 50,
    marginBottom: 100,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "aqua",
    borderColor: 'grey',
    height: 55,
    width:250,
    borderRadius: 20,
    marginTop: 15,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  apart: {
    justifyContent: 'space-between',
    alignItems: 'center',
  }

});
