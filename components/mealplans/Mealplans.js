import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Easing, ScrollView,Button } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import {OPENAI_API_KEY} from 'react-native-dotenv'
import { useAuth } from '../../context/authcontext';
import axios from 'axios';

export default function Workouts({ navigation }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [totalCaloriesNeeded, setTotalCal] = useState(1800);
  const [caloriesRatio, setCaloriesRatio] = useState((caloriesConsumed / totalCaloriesNeeded) * 100);
  const [mealsData, setMealsData] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    // You can access the updated caloriesConsumed value here
    console.log('Calories Consumed:', caloriesConsumed);
  }, [caloriesConsumed]);


  

  const updateMeals = async (mealsData) => {
    try {
      console.log(user._id);
      const response = await axios.post('http://10.127.130.59:3000/meals', {
        mealsData: mealsData,
        uuid: user._id
      });

      console.log(response);
    } catch (error) {
      console.error('Error meal:', error);
    }
  };



  function extractNumberFromStringAsInteger(inputString) {
    // Use a regular expression to match and extract the number
    const match = inputString.match(/\d+/);
  
    // Check if a match is found
    if (match) {
      const number = parseInt(match[0], 10); // Parse the matched number as an integer
      setCaloriesConsumed(prevCaloriesConsumed => prevCaloriesConsumed + number);
      return number;
    } else {
      return null; // Return null (or another appropriate value) when no number is found
    }
  }







  const parseMeals = (mealString) => {
    if (!mealString) {
      console.error('mealString is undefined or empty');
      return [];
    }
  
    const mealSections = mealString.split('\n');
    const meals = [];
    let currentMeal = null;
  
    for (const section of mealSections) {
      if (section.trim() !== '') {
        const [label, ...rest] = section.split(': ');
  
        if (label && rest) {
          const sectionText = rest.join(': ');
          if (label === 'Breakfast' || label === 'Lunch' || label === 'Dinner') {
            currentMeal = { mealName: label, foods: [] };
            meals.push(currentMeal);
          }
          if (currentMeal) {
            const [foodName, foodCalories, foodIngredients] = sectionText.split(': ');
            if (foodName && foodCalories) {
              currentMeal.foods.push({ name: foodName, calories: foodCalories, ingredients: foodIngredients });
              extractNumberFromStringAsInteger(foodCalories);
            } else {
              console.error('Incomplete food information found');
            }
          }
        } else {
          console.error('Incomplete meal information found');
        }
      }
    }
  
    setMealsData(meals);
    console.log('Parsing successful');
    console.log("meals so far:" + JSON.stringify(meals, null, 2));
    return meals;
  };
  
  
  
  const getPlans = async () => {
    try {
      const res = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "text-davinci-003",
          prompt: "Can you give me three meals for a day that is under 1500 calories? format your reponse like so (you dont have to include eggs with toast): Breakfast: (food name): (number of calories) calories: (ingredients)",
          max_tokens: 300,
          temperature: 1,
        }),
      });
  
      if (res.ok) {
        
        const responseJson = await res.json();
        updateMeals(responseJson.choices[0].text.toString());
        console.log(responseJson.choices[0].text);
        parseMeals(responseJson.choices[0].text.toString());
        
      } else {
        console.error('Failed to fetch data');
      }
    } catch (error) {
      console.error(error);
    }
  }
  






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
      <Button title="Test" onPress={() => {getPlans()}} color="#6b6776" />
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
      <View>
  {mealsData.map((meal, index) => (
    <View key={index}>
      <Text style={styles.sectionTitle}>{meal.mealName}:</Text>
      
      {meal.foods.map((food, foodIndex) => (
        <View style={styles.foodContainer} key={foodIndex}>
          <View>
            <Text style={styles.foodTitle}>{food.name}</Text>
            <Text style={styles.foodsubTitle}>{food.calories}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.details}>Details</Text>
            <MaterialIcons
              style={{ marginRight: 5 }}
              name="arrow-forward-ios"
              size={16}
              color="white"
            />
          </View>
        </View>
      ))}
    </View>
  ))}
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
