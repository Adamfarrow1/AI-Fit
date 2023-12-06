import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import Login from './Login';
import { GLOBAL_IP } from 'react-native-dotenv';

export default function Register() {
  const [step, setStep] = useState(1); // To keep track of the current step
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [heightFeet, setHeightFeet] = useState('5');  // Defaulting to 5 feet
  const [heightInches, setHeightInches] = useState(0); // Defaulting to 0 inches
  const [goal, setGoal] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const height = `${heightFeet}'${heightInches}"`;
  const navigation = useNavigation();

  const [dietRescrictions , setDietRescrictions] = useState('');

  const [res , setRes] = useState('');


  function delay() {
    setTimeout(() => {
      
    }, 3000); // 3000 milliseconds = 3 seconds
  }

  



  const handleRegister = async () => {
    try {
      console.log('Attempting to create user');
      const height = `${heightFeet}'${heightInches}"`;
      const response = await axios.post('http://' + GLOBAL_IP + ':3000/registerUser', {
        userName: username,
        password: password,
        fullName: fullName,
        email: email,
        age: age,
        gender: gender,
        weight: weight,
        height: height,
        goal: goal,
        diet: dietRescrictions
      });

      console.log('Step one done');


      if (response.data.message === 'User registered successfully') {
        console.log('User register successful');
        setUsername('');
        setPassword('');
        setRes("successfully registered")
        delay();
        // Optionally, you can navigate to another screen after successful login
        // navigation.navigate('SuccessScreen');
      }
    } catch (error) {
      setRes("Error registering user")
      console.error('Error registering user:', error.message);
      console.error('Stack trace:', error.stack);
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true, // Hide the navigation header
    });
  }, [navigation]);



  const dismissKeyboard = () => {
    Keyboard.dismiss(); // Dismiss the keyboard when the screen is tapped
  };


  const handleBack = () => {
    setStep(step - 1)
  }



  const advanceStep = () => {
    if (step < 10) {
      setStep(step + 1);
    } else {
      handleRegister();
      console.log('Full Registration Details:', {
        fullName, email, age, gender, weight, height, goal, username, password
      });
      navigation.navigate('Login')
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
      case 8: return "Dietary Restrictions";
      case 9: return "Username";
      case 10: return "Password";
      
      default: return "";
    }
  };

  const renderInput = () => {
    switch(step) {
      case 1: return <TextInput value={fullName} style={styles.input} placeholder="Full Name" onChangeText={(text) => setFullName(text)} />;
      case 2: return <TextInput value={email} style={styles.input} placeholder="Email" onChangeText={(text) => setEmail(text)} />;
      case 3: // Age
        return (
          <Picker
            selectedValue={age}
            style={styles.picker}
            itemStyle={{ color: 'white' }}
            onValueChange={(itemValue) => setAge(itemValue)}
          >
            {[...Array(100).keys()].map((_, index) => (
              <Picker.Item key={index} label={String(index + 1)} value={String(index + 1)} />
            ))}
          </Picker>
        );
      case 4: return <TextInput value={gender} style={styles.input} placeholder="Gender (e.g. Male, Female)" onChangeText={(text) => setGender(text)} />;
      case 5: // Weight
        return (
          <Picker
              selectedValue={weight}
              style={styles.picker}
              itemStyle={{ color: 'white' }}
              onValueChange={(itemValue) => setWeight(itemValue)}
          >
              {[...Array(341).keys()].map((_, index) => (
                  <Picker.Item key={index} label={String(index + 60)} value={String(index + 60)} />
              ))}
          </Picker>
        );
        case 6:
          return (
            <View style={styles.heightContainer}>
              <Picker
                selectedValue={heightFeet}
                style={styles.heightPicker}
                itemStyle={{ color: 'white' }}
                onValueChange={(itemValue) => setHeightFeet(itemValue)}
              >
                {[...Array(8).keys()].map((_, index) => (
                  <Picker.Item key={index} label={String(index + 3)} value={String(index + 3)} /> 
                ))}
              </Picker>
              <Text style={styles.heightText}>ft</Text>
              <Picker
                selectedValue={heightInches}
                style={styles.heightPicker}
                itemStyle={{ color: 'white' }}
                onValueChange={(itemValue) => setHeightInches(itemValue)}
              >
                {[...Array(12).keys()].map((_, index) => (
                  <Picker.Item key={index} label={String(index)} value={index} />
                ))}
              </Picker>
              <Text style={styles.heightText}>in</Text>
            </View>
          );
        
      case 7: return <TextInput value={goal} style={styles.input} placeholder="Fitness Goal (e.g. Weight Loss, Muscle Gain)" onChangeText={(text) => setGoal(text)} />;
      case 8: return <TextInput value={dietRescrictions} style={styles.input} placeholder="e.g. Lactose intolerant, High Cholesteral" onChangeText={(text) => setDietRescrictions(text)} />;
      case 9: return <TextInput value={username} style={styles.input} placeholder="Username" onChangeText={(text) => setUsername(text)} />;
      case 10: return <TextInput value={password} style={styles.input} placeholder="Password" secureTextEntry={true} onChangeText={(text) => setPassword(text)} />;
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
              <TouchableOpacity onPress={advanceStep} style={styles.fullWidthButton}>
                <Text style={styles.buttonText}>Next</Text>
                
              </TouchableOpacity>
             
            </View>
            
          </View>
          {step > 1 ? ( <Button style={styles.backbtn} onPress={handleBack} title="Back" color="#6b6776" />) : null}
          <Text style={styles.textcolor}>{res}</Text>
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

  heightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 300,
  },
  
  heightPicker: {
    width: 100,
    height: 220,
    color: 'white',
  },
  
  heightText: {
    color: 'white',
    fontSize: 18,
    marginHorizontal: 5,
  },
  
  input: {
    width: 300,
    height: 70,
    borderColor: 'dimgray',
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 15,  // Increased for a softer edge
    paddingLeft: 15,   // Slight increase for better spacing
    paddingTop: 10,    // Vertical padding for better spacing
    paddingBottom: 10,
    fontSize: 18,      // Increased font size
    color: 'white',
    textAlign: 'center', // Center the text
    elevation: 5,
},
  picker: {  
    width: 300,
    height: 200,
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

  fullWidthButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'aqua',
    paddingVertical: 15,
    borderRadius: 20,
    width: '100%', // Take up the full width inside the button container
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
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
