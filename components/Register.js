import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const handleLogin = () => {
    // Implement your login logic here
    console.log('Username:', username);
    console.log('Password:', password);
  };


  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Register', // Set the title of the navigation bar
      headerStyle: {
        backgroundColor: 'white', // Change the background color
      },
      headerTintColor: 'black', // Change the text color
      headerTitleStyle: {
        fontWeight: 'bold', // Change the title text style
      },
      headerBackTitle: ' '
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
          onChangeText={(text) => setUsername(text)}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor="black"
          placeholder="Username"
          onChangeText={(text) => setUsername(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={true}
          placeholderTextColor="black"
          onChangeText={(text) => setPassword(text)}
        />
        
        <Button
          title="Register"
          onPress={handleLogin}
          color="black"
        />
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
    color: 'black', // Text color for input fields
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 50,
    marginBottom: 100,
  },
});
