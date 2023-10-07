import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function Register() {
  const [step, setStep] = useState(1); // To keep track of the current step
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();



  const handleRegister = async () => {
    try {
      const response = await axios.post('http://10.127.130.59:3000/registerUser', {
        name: username,
        password: password,
        fullName: fullName,
        email: email,
        age: age,
        gender: gender,
        weight: weight,
        height: height,
        goal: goal,
      });

      if (response.data.message === 'User registered successfully') {
        console.log('User register successful');
        setUsername('');
        setPassword('');
        // Optionally, you can navigate to another screen after successful login
        // navigation.navigate('SuccessScreen');
      }
    } catch (error) {
      console.error('Error register user:', error);
    }
  };




  const dismissKeyboard = () => {
    Keyboard.dismiss(); // Dismiss the keyboard when the screen is tapped
  };

  const advanceStep = () => {
    if (step < 9) {
      setStep(step + 1);
    } else {
      handleRegister();
      console.log('Full Registration Details:', {
        fullName, email, age, gender, weight, height, goal, username, password
      });
      // Implement additional registration logic here if needed
    }
  };

  const getQuestionText = () => {
    switch(step) {
      case 1: return "Full Name";
      case 2: return "Email";
      case 3: return "Age";
      case 4: return "Gender (e.g. Male, Female)";
      case 5: return "Weight";
      case 6: return "Height";
      case 7: return "Fitness Goal (e.g. Weight Loss, Muscle Gain)";
      case 8: return "Username";
      case 9: return "Password";
      default: return "";
    }
  };

  const renderInput = () => {
    switch(step) {
      case 1: return <TextInput style={styles.input} placeholder="Full Name" onChangeText={(text) => setFullName(text)} />;
      case 2: return <TextInput style={styles.input} placeholder="Email" onChangeText={(text) => setEmail(text)} />;
      case 3: return <TextInput style={styles.input} placeholder="Age" keyboardType="numeric" onChangeText={(text) => setAge(text)} />;
      case 4: return <TextInput style={styles.input} placeholder="Gender (e.g. Male, Female)" onChangeText={(text) => setGender(text)} />;
      case 5: return <TextInput style={styles.input} placeholder="Weight" keyboardType="numeric" onChangeText={(text) => setWeight(text)} />;
      case 6: return <TextInput style={styles.input} placeholder="Height" keyboardType="numeric" onChangeText={(text) => setHeight(text)} />;
      case 7: return <TextInput style={styles.input} placeholder="Fitness Goal (e.g. Weight Loss, Muscle Gain)" onChangeText={(text) => setGoal(text)} />;
      case 8: return <TextInput style={styles.input} placeholder="Username" onChangeText={(text) => setUsername(text)} />;
      case 9: return <TextInput style={styles.input} placeholder="Password" secureTextEntry={true} onChangeText={(text) => setPassword(text)} />;
      default: return null;
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Register',
      // ... other options ...
    });
  }, [navigation]);

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.spacing}>
          <Text style={styles.textcolor}>{getQuestionText()}</Text>
          <View style={styles.center}>
            {renderInput()}
            <View style={styles.button}>
              <Button title="Next" onPress={advanceStep} color="black" />
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
    color: 'black',
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
    marginBottom: 30,
  },
  spacing: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
