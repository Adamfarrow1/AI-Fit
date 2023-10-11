import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useAuth } from '../../context/authcontext';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

export default function Home(){
    const { user, login } = useAuth();
    console.log(user);
  return (
      <View style={styles.container}>
        <View style={styles.sectioncontainer}>
          <Text style={styles.title}>Progress</Text>
          <View style={styles.background}>
              <Text style={styles.text}>Welcome: {user.userName} add progress tracker here</Text>

            </View>
          </View>
        <View style={styles.sectioncontainer}>
          <Text style={styles.title}>Supplements</Text>
          <View style={styles.background}>
              <Text style={styles.title}>add supplements here</Text>
            </View>
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#161618', // Background color
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
  },
  text:{
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 18,
  },
  background:{
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222126',
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  sectioncontainer: {
    justifyContent: 'center',
    width: '85%',
    height: '15%',
  },
});
