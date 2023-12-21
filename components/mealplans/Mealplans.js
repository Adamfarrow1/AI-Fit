import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Easing, ScrollView,Button } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { OPENAI_API_KEY , GLOBAL_IP } from 'react-native-dotenv'
import { useAuth } from '../../context/authcontext';
import axios from 'axios';
import { createStackNavigator } from '@react-navigation/stack';

export default function Mealplans({ navigation }) {

  const Stack = createStackNavigator();




  const [selectedDay, setSelectedDay] = useState(1);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [totalCaloriesNeeded, setTotalCal] = useState(1800);
  const [caloriesRatio, setCaloriesRatio] = useState((caloriesConsumed / totalCaloriesNeeded).toFixed(2) * 100);
  const [mealsData, setMealsData] = useState([]);
  const { user } = useAuth();
  let ready = true;

  const circularProgressRef = useRef(null);


  useEffect(() => {
     // You can access the updated caloriesConsumed value here
     console.log('Calories Consumed:', caloriesConsumed);
     setCaloriesRatio((caloriesConsumed / totalCaloriesNeeded).toFixed(2) * 100)
     console.log('Calories Ratio :', caloriesRatio);
     // circularProgressRef.current.animate(0, 0, Easing.quad);
     if(ready && caloriesConsumed !== 0)
      circularProgressRef.current.reAnimate(0,caloriesRatio,2000, Easing.linear);
  }, [caloriesConsumed]);


  const convertToCentimeters = (height) => {
    // Extract feet and inches from the input string
    const [feetStr, inchesStr] = height.split("'");
    const feet = parseFloat(feetStr) || 0;
    const inches = parseFloat(inchesStr) || 0;

    // Convert feet and inches to centimeters
    const centimeters = (feet * 30.48) + (inches * 2.54);

    return centimeters.toFixed(2);
  };


  const calculateTDEE = () => {
    // Convert weight and height to numbers
    const weightValue = parseFloat(user.weight) * 0.453592;
    const heightValue = parseFloat(convertToCentimeters(user.height));
    console.log("this is the vlaues for TDEE:");
    console.log(weightValue);
    console.log(heightValue);
    const age = parseInt(user.age);
    console.log(age);

    if (isNaN(weightValue) || isNaN(heightValue) || isNaN(age)) {
      alert('Please enter valid numeric values for weight, height, and age.');
      return;
    }

    let bmr;

    // Calculate BMR based on gender
    if (user.gender === 'Male') {
      console.log("this is a male")
      bmr = (10 * weightValue) + (6.25 * heightValue) - (5 * age) + 5;
    } else {
      bmr =  (10 * weightValue) + (6.25 * heightValue) - (5 * age) - 161;
    }

    // Adjust BMR based on activity level
    console.log(user.activityLevel);
    console.log(bmr);
    switch (user.activityLevel) {
      case 'sedentary':
        setTotalCal(Math.round(bmr * 1.2));
        break;
      case 'lightlyActive':
        setTotalCal(Math.round(bmr * 1.375));
        break;
      case 'moderatelyActive':
        setTotalCal(Math.round(bmr * 1.55));
        break;
      case 'veryActive':
        setTotalCal(Math.round(bmr * 1.725));
        break;
      case 'extraActive':
        setTotalCal(Math.round(bmr * 1.9));
        break;
      default:
        setTotalCal(null);
    }
  };




  

  const updateMeals = async (mealsData) => {
    try {
      console.log("meals data:::::")
      console.log(JSON.stringify(mealsData, null, 2));
      const response = await axios.post('http://' + GLOBAL_IP + ':3000/meals', {
        mealsData: mealsData,
        _id: user._id
      });

      console.log(response.data.user);
    } catch (error) {
      console.error('Error meal:', error);
    }
  };

  const setReady = async (state) => {
    ready = state;
  }


  const getMeals = async () =>{
    try{
      console.log(user);
      const response = await axios.post('http://' + GLOBAL_IP + ':3000/updateMeals', {
        _id: user._id
      });
      console.log("geting meals now------------------------------")
      console.log(response.data.user.meals);
      const today = new Date();
      const mealday = new Date(response.data.user.date)
      if(mealday.getDate() !== today.getDate()){
        getPlans();
      }
      else{
        setMealsData(response.data.user.meals);
        if(response.data.user.meals[0].foods[0].calories && response.data.user.meals[1].foods[0].calories && response.data.user.meals[2].foods[0].calories){
        await setReady(false);
        circularProgressRef.current.reAnimate(0,0,2000, Easing.linear);
        setCaloriesConsumed(0);  
        extractNumberFromStringAsInteger(response.data.user.meals[0].foods[0].calories)
        extractNumberFromStringAsInteger(response.data.user.meals[1].foods[0].calories)
        extractNumberFromStringAsInteger(response.data.user.meals[2].foods[0].calories)
        await setReady(true);
        }
        // circularProgressRef.current.animate(caloriesRatio,2000, Easing.linear);
        // console.log("kcal rn" )
        // console.log(caloriesRatio)
      }
    }
    catch(e){
      getPlans();
      console.error("error fetching meals:", e)
    }
  }



  function extractNumberFromStringAsInteger(inputString) {
    // Use a regular expression to match and extract the number
    const match = inputString.match(/\d+/);
    setReady(false)
    // Check if a match is found
    if (match) {
      const number = parseInt(match[0], 10); // Parse the matched number as an integer
      setCaloriesConsumed(prevCaloriesConsumed => prevCaloriesConsumed + number);
      return number;
    } else {
      return null; // Return null (or another appropriate value) when no number is found
    }
  }







  const parseMeals = async (mealString) => {
    if (!mealString) {
      console.error('mealString is undefined or empty');
      return [];
    }
  
    const mealSections = mealString.split('\n');
    const meals = [];
    let currentMeal = null;
  
    for (const section of mealSections) {
      if (section.trim() !== '') {
        const [label, ...rest] = section.split(/: | - |\(/);

  
        if (label && rest) {
          const sectionText = rest.join(': ');
          if (label === 'Breakfast' || label === 'Lunch' || label === 'Dinner') {
            currentMeal = { mealName: label, foods: [] };
            meals.push(currentMeal);
          }
          if (currentMeal) {
            let [foodName, foodCalories, foodIngredients] = sectionText.split(': ');
            if (foodName && foodCalories) {
              currentMeal.foods.push({ name: foodName, calories: foodCalories, ingredients: foodIngredients.replace(/[^a-zA-Z0-9, ]/g, '') });
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
    await updateMeals(meals);
    await getMeals();
    console.log('Parsing successful');
    console.log("meals so far:" + JSON.stringify(meals, null, 2));
    return meals;
  };
  
  
  
  const getPlans = async () => {

    try {
      await setReady(false);
      circularProgressRef.current.reAnimate(0,0,2000, Easing.linear);
      setCaloriesConsumed(0);
      console.log("--------------------------------------")
      console.log(Math.round(totalCaloriesNeeded / 3))
      let prompt = "Can you give me three meals with each meal containing " + Math.round(totalCaloriesNeeded / 3) + " calories? format your reponse like so (do not use commas to seperate except for ingredients): Breakfast: (food name): (number of calories) calories: (ingredients ingredients seperated by comma and use queries known by USDA API)";

      if(user.diet !== ""){
        prompt = "Can you give me three meals with each meal containing " + Math.round(totalCaloriesNeeded / 3) + " calories and has a restriction of " + user.diet  + "? format your reponse like so (do not use commas to seperate except for ingredients): Breakfast: (food name): (number of calories) calories: (ingredients seperated by comma and use queries known by USDA API)";
      }
      const res = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "text-davinci-003",
          prompt: prompt,
          max_tokens: 1000,
          temperature: 1,
        }),
      });
  
      if (res.ok) {
        
        const responseJson = await res.json();
       
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
    { label: 'Mon', value: 1, fullName:"Monday" },
    { label: 'Tues', value: 2, fullName: "Tuesday" },
    { label: 'Wed', value: 3, fullName: "Wednesday" },
    { label: 'Th', value: 4, fullName: "Thursday" },
    { label: 'Fri', value: 5, fullName: "Friday"},
    { label: 'Sat', value: 6, fullName: "Saturday"},
    { label: 'Sun', value: 7, fullName: "Sunday"},
  ];



  // useEffect(() => {
  //   setCaloriesRatio((caloriesConsumed / totalCaloriesNeeded).toFixed(2) * 100)
  //   if (circularProgressRef.current) {
  //     console.log("we are getting ehre")
  //     circularProgressRef.current.reAnimate(0, caloriesRatio, 1800, Easing.linear);
  //   }
  // }, [caloriesRatio])





  const handleFoodContainerPress = (meals) => {
    console.log("meals here for detauls page_----------------------------------------------------")
    console.log(meals);
    navigation.navigate('Details', {meals: meals});
  };
  

  const [hasFocusEffectRun, setHasFocusEffectRun] = useState(false);
  useFocusEffect(() => {
    if (!hasFocusEffectRun) {
      console.log("this is a fresh page-------------------------------------------------")
      // Call your function only once
      calculateTDEE();
       getMeals();
      
      // Mark that the effect has run
      setHasFocusEffectRun(true);
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
        fill={0}
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
      <Button title="Test" onPress={async () => {await getPlans()}} color="#6b6776" />
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

      <Text style={styles.title}>{selectedDay !== null ? "Recommended meals for " + daysOfWeek[selectedDay - 1].fullName + ":" : null}</Text>
      <ScrollView style={styles.viewbg}>
  {mealsData.map((meal, index) => (
    <View key={index}>
      <Text style={styles.sectionTitle}>{meal.mealName}:</Text>
      {meal.foods.map((food, foodIndex) => (
        <TouchableOpacity
          key={foodIndex}
          style={styles.foodContainer}
          onPress={() => { handleFoodContainerPress(food) }} // Remove the "meal" parameter here
        >
          <View style={styles.foodTitleMaxW}>
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
        </TouchableOpacity>
      ))}
    </View>
  ))}
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
  },
  foodTitleMaxW: {
    maxWidth: '80%',
  }
});
