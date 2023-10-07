import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function Register() {
  const [name, setName] = useState(''); // Change the state variable name
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://10.127.130.59:3000/registerUser', {
        name: name, // Updated state variable name
        password: password,
        email: email,
      });

      if (response.data.message === 'User registered successfully') {
        console.log('User registered successfully');
        // Optionally, you can navigate to another screen after successful registration
        // navigation.navigate('SuccessScreen');
      }
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Register',
      headerStyle: {
        backgroundColor: 'white',
      },
      headerTintColor: 'black',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerBackTitle: ' ',
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/fitness-sport-gym-logo-design-vector.jpg')}
        style={styles.logo}
      />
      <View>
        <TextInput
          style={styles.input}
          placeholderTextColor="black"
          placeholder="Email"
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor="black"
          placeholder="Username"
          onChangeText={(text) => setName(text)} // Updated state variable name
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={true}
          placeholderTextColor="black"
          onChangeText={(text) => setPassword(text)}
        />

        <Button title="Register" onPress={handleRegister} color="black" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  input: {
    width: 300,
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 12,
    paddingLeft: 10,
    color: 'black',
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 50,
    marginBottom: 100,
  },
});
