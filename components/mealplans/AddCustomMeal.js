import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { GLOBAL_IP } from 'react-native-dotenv';
import { useAuth } from '../../context/authcontext';
import axios from 'axios';

const CustomMealForm = () => {
  const navigation = useNavigation();
  const [mealTitle, setMealTitle] = useState('');
  const [mealName, setMealName] = useState('');
  const [totalCalories, setTotalCalories] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [ingredientName, setIngredientName] = useState('');
  const [amount, setAmount] = useState('');
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState('');
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


  const handleAddMealDB = async () => {
    try {
      console.log(GLOBAL_IP);
  
      const response = await axios.post(`http://${process.env.GLOBAL_IP}:3000/customMeals`, {
        _id: user._id,
        dayOfWeek: selectedDay,
        mealsData: [
          {
            mealName: mealTitle, // Assuming mealTitle is the meal name
            details: {
              name: mealName, // Assuming mealName is the food name
              calories: totalCalories, // Assuming totalCalories is the total calories
              ingredients: ingredients,
              // Add other food properties as needed
            },
          },
          // Add more mealsData objects as needed
        ],
      });
  
      console.log("Added custom meal into the user account:", response.data);
    } catch (error) {
      console.error('Error setting up add custom meal request:', error.message);
    }
  };
  






  const handleAddIngredient = () => {
    if (ingredientName && amount) {
      setIngredients((prevIngredients) => [
        ...prevIngredients,
        { name: ingredientName, amount: amount },
      ]);

      setIngredientName('');
      setAmount('');
    }
  };

  const handleDeleteIngredient = (index) => {
    setIngredients((prevIngredients) => {
      const updatedIngredients = [...prevIngredients];
      updatedIngredients.splice(index, 1);
      return updatedIngredients;
    });
  };

  const handleAddMeal = () => {
    console.log({
      mealTitle,
      mealName,
      totalCalories,
      ingredients,
    });
    handleAddMealDB();
    setMealTitle('');
    setMealName('');
    setTotalCalories('');
    setIngredients([]);
    setIngredientName('');
    setAmount('');
  };

  useEffect(() => {
    navigation.setOptions({
      title: 'Add Custom Meal',
      headerRight: () => (
        <Button title="Add" style={{ color: "white" }} onPress={handleAddMeal} />
      ),
    });
  }, [navigation, handleAddMeal]);


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.label}>Meal Title:</Text>
        <TextInput
          placeholderTextColor="#6b6776"
          style={styles.input}
          value={mealTitle}
          onChangeText={setMealTitle}
          placeholder="Enter Meal Title (e.g., Snack 1, Lunch, Afternoon Snack)"
        />

      <Text style={styles.label}>Day of the week:</Text>
      <Picker
        selectedValue={selectedDay}
        onValueChange={(itemValue, itemIndex) => setSelectedDay(itemValue)}
        itemStyle={styles.pickerItem}
      >
        <Picker.Item label="Select a day" value="" />
        {daysOfWeek.map((day, index) => (
          <Picker.Item  color="#ffffff" key={index} label={day} value={day} />
        ))}
      </Picker>



        <Text style={styles.label}>Meal Name:</Text>
        <TextInput
          placeholderTextColor="#6b6776"
          style={styles.input}
          value={mealName}
          onChangeText={setMealName}
          placeholder="Enter Meal Name i.e "
        />

        <Text style={styles.label}>Total Calories:</Text>
        <TextInput
          style={styles.input}
          value={totalCalories}
          placeholderTextColor="#6b6776"
          onChangeText={setTotalCalories}
          placeholder="Enter Total Calories"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Ingredients:</Text>
        <View style={styles.ingredientsContainer}>
          {ingredients.map((item, index) => (
            <View key={index} style={styles.ingredientContainer}>
              <Text style={{ color: "white" }}>{`${item.name}: ${item.amount} grams`}</Text>
              <TouchableOpacity onPress={() => handleDeleteIngredient(index)}>
                <Text style={styles.deleteButton}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TextInput
          style={styles.input}
          value={ingredientName}
          placeholderTextColor="#6b6776"
          onChangeText={setIngredientName}
          placeholder="Ingredient Name"
        />

        <TextInput
          style={styles.input}
          value={amount}
          placeholderTextColor="#6b6776"
          onChangeText={setAmount}
          placeholder="Amount (grams)"
          keyboardType="numeric"
        />

        <Button title="Add Ingredient" onPress={handleAddIngredient} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#161618",
  },
  scrollContainer: {
    padding: 16,
  },
  pickerItem: {
    color: '#ffffff', // Set the text color of picker items to white
  },
  label: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
    marginTop: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 12,
    paddingLeft: 10,
    color: 'white',
  },
  ingredientsContainer: {
    marginBottom: 20,
    width: '100%',
  },
  ingredientContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  deleteButton: {
    color: 'red',
    marginLeft: 10,
  },
});

export default CustomMealForm;
