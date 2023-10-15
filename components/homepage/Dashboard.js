import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../../context/authcontext';

function FitnessGraph() {
  return (
    <LineChart
      data={{
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [{
          data: [200, 203, 199, 211, 213, 216],
          strokeWidth: 2,
        }],
      }}
      width={Dimensions.get('window').width * 0.85}
      height={Dimensions.get('window').height * 0.15}
      yAxisLabel={'   '}  // Added spaces to move y-axis labels to the right
      yAxisSuffix={'Lbs'}
      chartConfig={{
        backgroundColor: '#161618',
        backgroundGradientFrom: '#161618',
        backgroundGradientTo: '#2c2c2e',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
          borderRadius: 20,
        },
        propsForDots: {
          r: '6',
          strokeWidth: '2',
          stroke: '#0000FF',  // Changed color to blue
        },
      }}
      bezier
      style={{
        borderRadius: 20,
        overflow: 'hidden',
      }}
    />
  );
}


export default function Home() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.quoteContainer}>
        <Text style={styles.quote}>Timothy 2:12 | The word of god</Text>
      </View>
      <View style={styles.sectioncontainer}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.text}>Hello {user ? user.userName : ''}<Text>, your getting bigger by the second... stop eating please</Text></Text>
        <FitnessGraph />
      </View>
      <View style={styles.sectioncontainer}>
        <Text style={styles.title}>Supplements</Text>
        <Text style={styles.text}>Don't forget to take your special autism pills</Text>
      </View>
    </View>
  );
}


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
    marginRight: 10,
    marginLeft: 10
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

  quoteContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  quote: {
    fontSize: 20,
    fontStyle: 'italic',
    color: 'white',
  },
});
