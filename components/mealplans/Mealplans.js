import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Easing, ScrollView } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

export default function Workouts({ navigation }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const caloriesConsumed = 600;
  const totalCaloriesNeeded = 1800;
  const [caloriesRatio, setCaloriesRatio] = useState((caloriesConsumed / totalCaloriesNeeded) * 100);

  const daysOfWeek = [
    { label: 'Mon', value: 1 },
    { label: 'Tues', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Th', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
    { label: 'Sun', value: 7 },
  ];

  const circularProgressRef = useRef(null);

  useEffect(() => {
    if (circularProgressRef.current) {
      circularProgressRef.current.reAnimate(0, caloriesRatio, 1800, Easing.linear);
    }
  }, [caloriesRatio])

  useFocusEffect(() => {
    if (circularProgressRef.current) {
      circularProgressRef.current.reAnimate(0, caloriesRatio, 1800, Easing.linear);
    }
  });

  const handleDayToggle = (day) => {
    if (day === selectedDay) {
      return;
    } else {
      setSelectedDay(day);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calorie Tracker</Text>
      <AnimatedCircularProgress
        size={150}
        width={10}
        fill={caloriesRatio}
        tintColor="white"
        backgroundColor="#262629"
        lineCap="round"
        rotation={180}
        preFill={0}
        duration={1500}
        ref={circularProgressRef}
      >
        {
          (fill) => (
            <Text style={styles.caloriesText}>
              {caloriesConsumed} / {totalCaloriesNeeded}
            </Text>
          )
        }
      </AnimatedCircularProgress>
      <Text style={styles.title}>Select a day</Text>
      <View style={styles.daysContainer}>
        {daysOfWeek.map((day) => (
          <TouchableOpacity
            key={day.value}
            style={[
              styles.dayToggle,
              selectedDay === day.value && styles.selectedDay,
            ]}
            onPress={() => handleDayToggle(day.value)}
          >
            <Text
              style={[
                styles.dayText,
                selectedDay === day.value && styles.selectedText,
              ]}
            >
              {day.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.viewbg}>
        {/* Food options go here */}
        <View>
          <Text style={styles.sectionTitle}>Breakfast:</Text>
          
          <View style={styles.foodContainer}>
              <View>
                <Text style={styles.foodTitle}>Cereal</Text>
                <Text style={styles.foodsubTitle}>Calories: 900</Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.details}>Details</Text>
                <MaterialIcons style={{marginRight: 5}} name="arrow-forward-ios" size={16} color="white" />
              </View>
          </View>

          <View style={styles.foodContainer}>
              <View>
                <Text style={styles.foodTitle}>Toast</Text>
                <Text style={styles.foodsubTitle}>Calories: 600</Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.details}>Details</Text>
                <MaterialIcons style={{marginRight: 5}} name="arrow-forward-ios" size={16} color="white" />
              </View>
          </View>


          <View style={styles.foodContainer}>
              <View>
                <Text style={styles.foodTitle}>Oatmeal</Text>
                <Text style={styles.foodsubTitle}>Calories: 450</Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.details}>Details</Text>
                <MaterialIcons style={{marginRight: 5}} name="arrow-forward-ios" size={16} color="white" />
              </View>
          </View>


        </View>





        <View>
          <Text style={styles.sectionTitle}>Lunch:</Text>
          
          <View style={styles.foodContainer}>
              <View>
                <Text style={styles.foodTitle}>Lazagna</Text>
                <Text style={styles.foodsubTitle}>Calories: 1620</Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.details}>Details</Text>
                <MaterialIcons style={{marginRight: 5}} name="arrow-forward-ios" size={16} color="white" />
              </View>
          </View>

          <View style={styles.foodContainer}>
              <View>
                <Text style={styles.foodTitle}>Lazagna</Text>
                <Text style={styles.foodsubTitle}>Calories: 1620</Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.details}>Details</Text>
                <MaterialIcons style={{marginRight: 5}} name="arrow-forward-ios" size={16} color="white" />
              </View>
          </View>


          <View style={styles.foodContainer}>
              <View>
                <Text style={styles.foodTitle}>Lazagna</Text>
                <Text style={styles.foodsubTitle}>Calories: 1620</Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.details}>Details</Text>
                <MaterialIcons style={{marginRight: 5}} name="arrow-forward-ios" size={16} color="white" />
              </View>
          </View>


        </View>






        <View>
          <Text style={styles.sectionTitle}>Dinner:</Text>
          
          <View style={styles.foodContainer}>
              <View>
                <Text style={styles.foodTitle}>Lazagna</Text>
                <Text style={styles.foodsubTitle}>Calories: 1620</Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.details}>Details</Text>
                <MaterialIcons style={{marginRight: 5}} name="arrow-forward-ios" size={16} color="white" />
              </View>
          </View>

          <View style={styles.foodContainer}>
              <View>
                <Text style={styles.foodTitle}>Lazagna</Text>
                <Text style={styles.foodsubTitle}>Calories: 1620</Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.details}>Details</Text>
                <MaterialIcons style={{marginRight: 5}} name="arrow-forward-ios" size={16} color="white" />
              </View>
          </View>


          <View style={styles.foodContainer}>
              <View>
                <Text style={styles.foodTitle}>Lazagna</Text>
                <Text style={styles.foodsubTitle}>Calories: 1620</Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.details}>Details</Text>
                <MaterialIcons style={{marginRight: 5}} name="arrow-forward-ios" size={16} color="white" />
              </View>
          </View>


        </View>


      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#161618',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
      color: 'white',
      alignSelf: 'flex-start',
      marginLeft: 20,
      marginTop: 20,
    },
    foodTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
      color: 'white',
      alignSelf: 'flex-start',
      marginLeft: 20,
      marginTop: 10,
    },
    foodsubTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 10,
      color: 'white',
      alignSelf: 'flex-start',
      marginLeft: 20,
    },
    details: {
      fontSize: 12,
      color: 'white',
      fontWeight: 'bold',
    },
  daysContainer: {
    flexDirection: 'row',    
  },
  dayToggle: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 5,
    margin: 5,
  },
  selectedDay: {
    backgroundColor: 'white',
  },
  dayText: {
    color: 'white',
  },
  selectedText: {
    color: 'black',
  },
  graphContainer: {
    marginTop: 20,
  },
  caloriesText: {
    alignSelf: 'center',
    color: 'white',
    fontSize: 12,
  },
  viewbg: {
    backgroundColor: '#222126',
    borderRadius: 20,
    height: '50%',
    width: '90%',
    marginTop: 10,
  },
  foodContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161618',
    borderRadius: 20,
    width: '95%',
    height: 80,
    marginTop: 10,
  }
});
