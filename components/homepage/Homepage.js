import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Modal, TextInput, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Dashboard from './Dashboard';
import Workouts from '../workouts/Workouts';
import { Ionicons, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/authcontext';
import Mealplans from '../mealplans/Mealplans';




const Tab = createBottomTabNavigator();




export default function Home() {
  const { user, logout } = useAuth();
  const [personalInfo, setPersonalInfo] = useState({});
  const [modalState, setModalState] = useState({
    isVisible: false,
    isEditMode: false,
    editedInfo: {
      userName: '',
      fullName: '',
      email: '',
      age: '',
      gender: '',
      weight: '',
      height: '',
      goal: '',
      diet: '',
    },
  });
  const labels = [
    { field: 'userName', label: 'Username' },
    { field: 'fullName', label: 'Full Name' },
    { field: 'email', label: 'Email' },
    { field: 'age', label: 'Age' },
    { field: 'gender', label: 'Gender' },
    { field: 'weight', label: 'Weight' },
    { field: 'height', label: 'Height' },
    { field: 'goal', label: 'Goal' },
    { field: 'diet', label: 'Diet' },
  ];

  //___________________ Load user info ______________________________
  const viewPersonalInfo = useCallback(async () => {
    try {
      const url = `http://${process.env.GLOBAL_IP}:3000/user/${user._id}/personalInfo`;
      const response = await fetch(url);
      const data = await response.json();
      setPersonalInfo(data);
      setModalState({ ...modalState, isVisible: true });
    } catch (error) {
      console.error( error);
    }
  }, [modalState]);

  const PersonalInfoBox = ({ label, value }) => {
    return (
      <View style={styles.infoBox}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    );
  };

  const navigation = useNavigation();
  

  const toggleEditMode = useCallback(() => {
    setModalState({
      ...modalState,
      isEditMode: !modalState.isEditMode,
      editedInfo: modalState.isEditMode ? modalState.editedInfo : { ...personalInfo }
    });
  }, [modalState, personalInfo]);

  // ___________________ Edit User Data _________________________________

  // Formatting for modal
  const PersonalInfoBox2 = React.memo(({ label, field, editedInfo }) => {
    const [localValue, setLocalValue] = useState(editedInfo);

    useEffect(() => {
      setLocalValue(editedInfo);
    }, [editedInfo]);

    const handleChange = (value) => {
      setLocalValue(value);
      handleTextChange(field, value);
    };

    return (
      <View style={styles.infoBox}>
        <Text style={styles.label}>{label}</Text>
        <TextInput 
          id="filled-basic" 
          label="Filled" 
          variant="filled" 
          value={localValue}
          onChangeText={handleChange}
          multiline={label === "Goal"} // Enable multiline for goal input
          numberOfLines={4} // Adjust as needed
          style={(label === "Goal" || label === "Diet" )? styles.largeTextInput : null}
        />
      </View>
    );
  });

  const handleTextChange = (field, text) => {
    setModalState((prevState) => ({
      ...prevState,
      editedInfo: {
        ...prevState.editedInfo,
        [field]: text,
      }
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const url = `http://${process.env.GLOBAL_IP}:3000/user/${user._id}/updatePersonalInfo`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(modalState.editedInfo)
      });

      if (!response.ok) {
        throw new Error('Failed to update personal info');
      }

      const updatedData = await response.json();
      setPersonalInfo(updatedData);
      setModalState({ ...modalState, isEditMode: false })
    } catch (error) {
      console.error('Error updating personal info:', error);
      // Provide user feedback here
    }
  };


  
  const navigateToLogin = () => {
    navigation.navigate('Login'); // Replace 'Login' with the name of your login screen
  };



    //____________________ Navigation __________________________
    useEffect(() => {
      navigation.setOptions({
        headerLeft: () => (
          <SimpleLineIcons onPress={navigateToLogin} name="logout" style={{ marginLeft: 15, marginTop: 5 }} size={20} color="grey" />
        ),
        headerTitle: '',
        headerRight: () => (
          <Ionicons
            onPress={viewPersonalInfo}
            name="person-circle-outline"
            style={{ marginRight: 10, marginTop: 5 }}
            size={30}
            color="grey"
          />
        ),
      });
    }, [navigation, logout, viewPersonalInfo]);

    return (
      <>
        <Tab.Navigator 
          initialRouteName='Screen1' 
          screenOptions={{ 
            headerShown: false, 
            tabBarStyle: styles.tabNavigator
          }} 
          id='tab'
        >
          <Tab.Screen 
            name="Screen2" 
            component={Workouts} 
            options={{ 
              tabBarLabel: "Workouts", 
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="weight-lifter" size={size - 5} color={color} style={styles.tabIcon} />
              ), 
            }} 
          />
          <Tab.Screen 
            name="Screen1" 
            component={Dashboard} 
            options={{ 
              tabBarLabel: "Home", 
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" color={color} size={size - 5} style={styles.tabIcon} />
              ), 
            }} 
          />
          <Tab.Screen 
            name="Screen3" 
            component={Mealplans} 
            options={{ 
              tabBarLabel: "Meal plans", 
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="food-apple-outline" size={size - 5} color={color} style={styles.tabIcon} />
              ), 
            }} 
          />
        </Tab.Navigator>
    


        <Modal
        
          animationType="fade"
          transparent={true}
          visible={modalState.isVisible}
          ><TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                {modalState.isEditMode ? (
                  <>
                    {labels.map(item => (
                      <View style={styles.infoBox} key={item.field}>
                        <Text style={styles.label}>{item.label}</Text>
                        <TextInput
                          value={modalState.editedInfo[item.field]}
                          onChangeText={(text) => handleTextChange(item.field, text)}
                          style={styles.inputBox}
                        />
                      </View>
                    ))}
                  </>
                ) : (
                  <>
                    {labels.map(item => (
                      <View style={styles.infoBox} key={item.field}>
                        <Text style={styles.label}>{item.label}</Text>
                        <Text style={styles.value}>{personalInfo[item.field]}</Text>
                      </View>
                    ))}
                  </>
                )}
                <View style={styles.buttonContainer}>
                  {modalState.isEditMode ? (
                    <>
                      <Button title="Save" onPress={handleSaveChanges} />
                      <Button 
                        title="Cancel" 
                        onPress={() => setModalState({ ...modalState, isEditMode: false })} 
                      />
                    </>
                  ) : (
                    <>
                      <Button title="Edit" onPress={toggleEditMode} />
                      <Button 
                        title="Close" 
                        onPress={() => setModalState({ ...modalState, isVisible: false, isEditMode: false })} 
                      />
                    </>
                  )}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </>
    );
}
    



const styles = StyleSheet.create({

  largeTextInput: {
    height: 200, // Adjust the height as needed
    textAlignVertical: 'top', // Align text at the top
  },
  
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E', // Dark background for a sleek look
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF', // White text for contrast
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#DDD', // Light grey for subtitles
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent backdrop for modal
  },
  modalView: {
    margin: 20,
    marginTop: 95,
    backgroundColor: '#333', // Dark background for modal
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: '#FFF', // White text in modal
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#424242', // Lighter grey for each info box
    borderRadius: 10,
    padding: 10,
  },
  label: {
    flex: 2,
    marginLeft: 20,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF', // White text for labels
  },
  value: {
    flex: 2.5,
    fontSize: 14,
    textAlign: 'center',
    color: '#FFF', // White text for values
  },
  inputBox: {
    flex: 2,
    fontSize: 16,
    borderColor: '#777',
    borderWidth: 1,
    padding: 5,
    borderRadius: 5,
    backgroundColor: '#FFF', // White background for input
    color: '#000', // Black text for input
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: 15,
  },
  icon: {
    marginTop: 5,
    color: 'grey', // Grey color for icons
  },
  // Additional styles for the Tab Navigator and its items
  tabNavigator: {
    backgroundColor: '#161618', // Dark background for Tab Navigator
    borderTopWidth: 0,
  },
  tabLabel: {
    color: '#FFF', // White text for Tab labels
  },
  tabIcon: {
    color: '#FFF', // White icons
  },
});





