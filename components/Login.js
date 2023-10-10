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
import { useAuth } from '../context/authcontext';


export default function Login() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState(true);
  const { user, login } = useAuth();

  const handleLogin = async () => {
    console.log(username + ' ' + password)
    try {
      if(!username || !password) return
      const response = await axios.post('http://10.127.130.59:3000/login', {
        userName: username,
        password: password,
      });

      login({
        userName: username,
        password: password,
      });


      if (response.data.message === 'Login successful') {
        console.log('User login successful');
        setUsername('');
        setPassword('');
        navigation.navigate("Home");
        // Optionally, you can navigate to another screen after successful login
        // navigation.navigate('SuccessScreen');
      }
    } catch (error) {
      console.error('Error login user:', error);
    }
  };

  const handleTypewriter = () => {
    setTimeout(() => {
      setType((prevType) => !prevType);
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
            {type ? (
              <TypeWriter fixed={true} onTypingEnd={handleTypewriter} style={styles.textcolor} minDelay={120} typing={1}>
                Welcome to Fit AI
              </TypeWriter>
            ) : (
              <TypeWriter fixed={true} onTypingEnd={handleTypewriter} style={styles.textcolor} minDelay={120} typing={1}>
                Become Fit Today.
              </TypeWriter>
            )}
          </View>

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
                <Button title="Login" onPress={handleLogin} color="black" />
              </View>

              <Button title="New User? Register" onPress={() => navigation.navigate('Register')} color="#6b6776" />
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
