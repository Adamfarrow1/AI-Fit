import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { OPENAI_API_KEY , GLOBAL_IP } from 'react-native-dotenv'
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { Button } from 'react-native';

const DetailsScreen = ({ route }) => {
  const meal = route.params;
  const [jsonData, setJsonData] = useState(null);
  const [nutritionData, setNutritionData] = useState([]);
  const [activeButton, setActiveButton] = useState('ingredients');
  const navigation = useNavigation();


  useEffect(() => {
   
    const nav = navigation.getParent('parent');
    nav.setOptions({title: meal.meals.name});
  },[])


  const parseData = (data) => {
    if (!data) {
      console.error('Data is undefined or empty');
      return [];
    }
  
    const foodSections = data.split('\n');
    const parsedData = [];
  
    for (const section of foodSections) {
      console.log("without regex yet: " + section)
      const stringWithColons = section.replace(/,|-/g, ':')
      const stringWithoutCommas = stringWithColons.replace(/,/g, '');
      let stringWithoutParentheses = stringWithoutCommas.replace(/[()]/g, "");
      console.log("new string without par: " + stringWithoutParentheses);
      if((stringWithoutParentheses.match(/:/g) || []).length === 7){
        const parts = stringWithoutParentheses.split(':');

        // Map over the parts and keep every other one
        const modifiedParts = parts.map((part, index) => (index % 2 === 0 ? part : ''));

        // Join the modified parts back together with colons
        stringWithoutParentheses = modifiedParts.join(':');
      }
   
        const temp = stringWithoutParentheses.split(':');
        if (temp[0].trim() !== '') {
          const currentFood = {
            name: temp[0],
            calories: temp[1] ? parseInt(temp[1].replace(/[^0-9/.]/g, '')) : 0,
            protein: temp[2] ? parseFloat(temp[2].replace(/[^0-9/.]/g, '')) : 0,
            carbohydrates: temp[3] ? parseFloat(temp[3].replace(/[^0-9/.]/g, '')) : 0,
            fat: temp[4] ? parseFloat(temp[4].replace(/[^0-9/.]/g, '')) : 0,
          };
          parsedData.push(currentFood);
        }
    }
  
    console.log("parsed data------------");
    console.log(parsedData);
    setNutritionData(parsedData);
    savePlans(parsedData);
  };
  


  const fetchMacros = async () => {
    try{
        const response = await axios.post('http://' + GLOBAL_IP + ':3000/fetchMacros', {
          _id: meal.meals._id,
          mealName: meal.meals.name,
        });
  
        console.log(response.data.updatedFoodDetails.macros);
        setNutritionData(JSON.parse(response.data.updatedFoodDetails.macros))
    }catch(error){
      getPlans();
      console.error('Error fetching macros:', error);
    }
  }


  


  const savePlans = async (plans) => {
      try {
        console.log("meals data:::::")
        console.log(JSON.stringify(plans, null, 2));
        const response = await axios.post('http://' + GLOBAL_IP + ':3000/updateMacros', {
          macros: JSON.stringify(plans),
          _id: meal.meals._id,
          mealName: meal.meals.name,
        });
  
        console.log(response.data.updatedMeal);
      } catch (error) {
        console.error('Error meal:', error);
      }
  }





  const getPlans = async () => {
    try {
      console.log("chatgpt is being called")
      const res = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "text-davinci-003",
          prompt: "what are the macros for the meal " + meal.meals.name + " if it has " + meal.meals.calories + " with these ingredients " + meal.meals.ingredients + ". format your response like so without using the word full word grams seperate output by newlines. dont reply with the meal name: (ingredient 1) brocolli: Calories (amount of calories here)1 : Protein (amount of protein here)2g : Carbohydrates (amount of carbohydrates here)3g : Fat (amount of fat here)1g",
          max_tokens: 300,
          temperature: 1,
        }),
      });

      if (res.ok) {
        const responseJson = await res.json();
        console.log(responseJson.choices[0].text);
        parseData(responseJson.choices[0].text);

      } else {
        console.error('Failed to fetch data');
      }
    } catch (error) {
      console.error(error);
    }
  }


  const [hasFocusEffectRun, setHasFocusEffectRun] = useState(false);
  useFocusEffect(() => {
    if (!hasFocusEffectRun) {
      // Call your function only once
      console.log("fetch the macros")
      fetchMacros();
      
      // Mark that the effect has run
      setHasFocusEffectRun(true);
    }
  });

  const switchToIngredients = () => {
    setActiveButton('ingredients');
    // Fetch ingredient macros when switching to the Ingredients tab
    // fetchIngredientMacros();
  };

  const switchToInstructions = () => {
    setActiveButton('instructions');
    // Fetch cooking instructions when switching to the Instructions tab
    // fetchCookingInstructions();
  };

  return (
    <View style={styles.container}>
      {/* Buttons for switching between Ingredients and Instructions */}
      <Button title="Test" onPress={() => {getPlans()}} color="#6b6776" />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, activeButton === 'ingredients' && styles.activeButton]}
          onPress={switchToIngredients}
        >
          <Text style={styles.buttonText}>Ingredients</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, activeButton === 'instructions' && styles.activeButton]}
          onPress={switchToInstructions}
        >
          <Text style={styles.buttonText}>Instructions</Text>
        </TouchableOpacity>
      </View>

      {/* Content area based on active button */}
      <ScrollView style={styles.scrollViewW}>
        {activeButton === 'ingredients' && (
          // Render ingredient macros
          <View>
            {nutritionData.map((item, index) => (
              <View key={index} style={styles.itemContainer}>
                <Text style={styles.foodTitle}>{item.name}</Text>
                <View style={styles.macrosContainer}>
                  <Text style={styles.macroText}>Calories: {item.calories}</Text>
                  <Text style={styles.macroText}>Protein: {item.protein}g</Text>
                  <Text style={styles.macroText}>Carbohydrates: {item.carbohydrates}g</Text>
                  <Text style={styles.macroText}>Fat: {item.fat}g</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeButton === 'instructions' && (
          // Render cooking instructions
          <View>
            {/* ... */}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#161618',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
    alignSelf: 'center',
    textAlign: 'center',
    marginLeft: 20,
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 20,
    marginTop: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: '#161618',
  },
  buttonText: {
    color: 'white',

    fontSize: 16,
  },
  activeButton: {
    backgroundColor: 'black',
    borderWidth: 1,
    borderColor: '#161618',
    color: 'black',
  },
  scrollViewW: {
    width: '90%',
    flex: 1,
    backgroundColor: '#222126',
    borderRadius: 20,
  },
  itemContainer: {
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#161618',
    borderRadius: 20,
    width: '90%',
    justifyContent: 'center',
    alignSelf: 'center', // Added to center horizontally
    backgroundColor: '#161618',
  },
  foodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'white',
    marginTop: 5,
  },
  macrosContainer: {
    flexDirection: 'column',
  },
  macroText: {
    color: 'white',
  },
});

export default DetailsScreen;
