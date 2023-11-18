import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import TypeWriter from 'react-native-typewriter';
import { useAuth } from '../../context/authcontext';
import { GLOBAL_IP } from 'react-native-dotenv';

export default function Login() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { user, login } = useAuth();
  const [text, setText] = useState('Welcome to Fit AI');

  const handleLogin = async () => {
    console.log("Attempting login with:", username, password);

    // Input Validation
    if (!username.trim() || !password.trim()) {
      console.error('Username or Password is empty');
      return;
    }

    try {
      console.log(GLOBAL_IP);
      const response = await axios.post(`http://${GLOBAL_IP}:3000/login`, {
        userName: username,
        password: password,
      });

      console.log("Login response data:", response.data);

      // Checking if the response has the expected structure
      if (response.data && response.data.message === 'Login successful') {
        console.log('User login successful', response.data.user);
        login(response.data.user);

        setUsername('');
        setPassword('');
        navigation.navigate('Home');
      } else {
        // Handle unexpected response structure
        console.error('Unexpected response structure:', response.data);
      }
    } catch (error) {
      if (error.response) {
        // Request made and server responded
        console.error('Server responded with an error:', error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No Response Received:', {
          request: {
            url: error.config.url,
            method: error.config.method,
            headers: error.config.headers,
            data: error.config.data,
          },
          message: error.message,
          isTimeout: error.code === 'ECONNABORTED',
          isNetworkError: !error.response,
        });
      } else {
        // Something happened in setting up the request that triggered an error
        console.error('Error setting up login request:', error.message);
      }
    }
  };


  const handleTypewriter = () => {
    setTimeout(() => {
      if (text === 'Welcome to Fit AI') {
        setText('Become Fit Today.');
      } else {
        setText('Welcome to Fit AI');
      }
    }, 2500); // Delay in milliseconds (adjust as needed)
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false, // Hide the navigation header
    });
  }, [navigation]);

  const dismissKeyboard = () => {
    Keyboard.dismiss(); // Dismiss the keyboard when the screen is tapped
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.spacing}>
          <View style={styles.helloWorldContainer}>
            <TypeWriter
              onTypingEnd={handleTypewriter}
              style={styles.textcolor}
              minDelay={120}
              typing={1}
            >
              {text}
            </TypeWriter>
          </View>

          <View style={styles.center}>
            <TextInput
              style={styles.input}
              placeholderTextColor="#6b6776"
              placeholder="Username"
              textContentType="oneTimeCode"
              value={username}
              onChangeText={(text) => setUsername(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry={true}
              textContentType="oneTimeCode"
              placeholderTextColor="#6b6776"
              value={password}
              onChangeText={(text) => setPassword(text)}
            />
            <View style={styles.apart}>
              <View style={styles.button}>
                <Button title="Login" onPress={handleLogin} color="black" />
              </View>

              <Button
                title="New User? Register"
                onPress={() => navigation.navigate('Register')}
                color="#6b6776"
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#161618',
  },
  input: {
    width: 300,
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 12,
    paddingLeft: 10,
    color: 'white',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'aqua',
    borderColor: 'grey',
    height: 55,
    width: 250,
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
  },
  textcolor: {
    color: 'aqua',
    fontSize: 30,
    height: 50,
  },
  spacing: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helloWorldContainer: {
    marginBottom: 130,
    height: 50,
  },
});
