require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
const port = 3000;

const uri = process.env.NODE_ENV;
console.log(uri)
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Define a Mongoose schema for your data
const userSchema = new mongoose.Schema({
      name: String,
      password: String,
      userName: String,
      fullName: String,
      email: String,
      age: String,
      gender: String,
      weight: String,
      height: String,
      goal: String,
      workoutHistory: [{
        date: Date,
        workouts: String,
      }],
});

const deleteOldWorkouts = async () => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  await UserModel.updateMany(
    {},
    { $pull: { workoutHistory: { date: { $lt: oneMonthAgo } } } }
  );
};

const workoutSchema = new mongoose.Schema({
  name: String,
  description: String,
  videoURL: String,
  tip: String,
  sets: String,
  reps: String,
});

const workoutGroupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true
  },
  workouts: [workoutSchema], // An array of workoutSchema instances
  createdDate: {
    type: Date,
    default: Date.now
  },
  // Any other fields you find necessary for a group of workouts
});



// Create models using the schemas
const UserModel = mongoose.model('User', userSchema);
const WorkoutModel = mongoose.model('Workout', workoutSchema);
const WorkoutGroupModel = mongoose.model('WorkoutGroup', workoutGroupSchema);



module.exports = WorkoutGroupModel;

app.post('/user/:userId/recordWorkout', async (req, res) => {
  try {
      const { userId } = req.params;
      const { date, workouts } = req.body;

      // Correctly converting userId to ObjectId
      const objectId = new mongoose.Types.ObjectId(userId);

      // Find the user and update their workout history
      const updatedUser = await UserModel.findByIdAndUpdate(
          objectId,
          { $push: { workoutHistory: { date, workouts } } },
          { new: true } // Return the updated document
      );

      if (!updatedUser) {
          return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({ message: 'Workout recorded successfully', updatedUser });
  } catch (error) {
      console.error('Error recording workout:', error);
      res.status(500).json({ error: 'An error occurred' });
  }
});








// TRIES TO GET USER ID 
app.get('/user/:userId/workoutHistory', async (req, res) => {
  const { userId } = req.params;
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  console.log("working");

  const user = await UserModel.findById(userId).populate('workoutHistory.workouts');
  const recentWorkouts = user.workoutHistory.filter(w => w.date >= oneMonthAgo);

  res.json({ recentWorkouts });
});


app.post('/addWorkoutGroup', async (req, res) => {
  try {
    // Assuming req.body contains the groupName and an array of workouts
    const { groupName, workouts } = req.body;

    // Create a new instance of WorkoutGroupModel
    const workoutGroup = new WorkoutGroupModel({
      groupName,
      workouts
    });

    // Save the new workout group to the database
    await workoutGroup.save();

    res.status(201).json({ message: 'Workout group created successfully', workoutGroup });
  } catch (error) {
    console.error('Error creating workout group:', error);
    res.status(500).json({ error: 'An error occurred while creating the workout group' });
  }
});



app.get('/getWorkoutGroup/:groupName', async (req, res) => {
  try {
    const groupName = req.params.groupName;
    const workoutGroup = await WorkoutGroupModel.findOne({ groupName });

    if (!workoutGroup) {
      return res.status(404).json({ message: 'Workout group not found' });
    }

    res.json(workoutGroup);
  } catch (error) {
    console.error('Error retrieving workout group:', error);
    res.status(500).json({ error: 'An error occurred while retrieving the workout group' });
  }
});

app.get('/getWorkoutGroups', async (req, res) => {
  try {
    // Fetch all workout groups from the database
    const workoutGroups = await WorkoutGroupModel.find({});
    res.json({ workoutGroups });
  } catch (error) {
    console.error('Error fetching workout groups:', error);
    res.status(500).json({ error: 'An error occurred while fetching the workout groups' });
  }
});


app.get('/getWorkoutNames', async (req, res) => {
  try {
    // Fetch only the groupName field from all workout groups in the database
    const workoutGroups = await WorkoutGroupModel.find({}, 'groupName');

    // Extract the groupName from each workout group
    const workoutGroupNames = workoutGroups.map(group => group.groupName);

    res.json({ workoutGroupNames });
  } catch (error) {
    console.error('Error fetching workout group names:', error);
    res.status(500).json({ error: 'An error occurred while fetching the workout group names' });
  }
});









// Route to retrieve user data by name from the database
app.get('/getData/:name', async (req, res) => {
  try {
    const name = req.params.name;
    // Query the "UserModel" collection for a user with the specified name
    const userData = await UserModel.findOne({ name });

    if (!userData) {
      res.json({ message: 'User not found' });
    } else {
      res.json(userData);
    }
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


app.post('/registerUser', async (req, res) => {
  try {
    // Log the incoming request body
    console.log("Received request with body:", req.body);

    // Extract data from the request body
    const {
      password,
      fullName,
      userName,
      email,
      age,
      gender,
      weight,
      height,
      goal
    } = req.body;

    // Log the extracted data
    console.log("Extracted data:", {
      password, userName, fullName, email, age, gender, weight, height, goal
    });


    const newUser = new UserModel({
      password,
      fullName,
      userName,
      email,
      age,
      gender,
      weight,
      height,
      goal
    });

    // Log the user object before saving
    console.log("User object to be saved:", newUser);

    // Save the new user to the database
    await newUser.save();

    console.log("User saved successfully");
    res.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});




// Route to handle user login
app.post('/login', async (req, res) => {
  try {
    console.log(req.body)
    // Extract the username and password from the request body
    const { userName, password } = req.body;

    // Query the database to find a user with the given username and password
    const user = await UserModel.findOne({ userName, password });
    if (!user) {
      // If no user is found, return an error response
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log("user login success: " + user)

    // If the user is found, you can customize the response accordingly
    res.json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});



// this part of the code is for the meal plans
const mealSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  date: {
    type: Date,
    default: Date.now, // Set the default value to the current date
  },
  meals: [
    {
      mealName: String,
      foods: [
        {
          name: String,
          calories: String,
          ingredients: String,
          recipe: String,
          macros: String,
        }
      ]
    }
  ]
});



const Meal = mongoose.model('Meal', mealSchema);
app.post('/meals', async (req, res) => {
  try {
    const { _id, mealsData } = req.body;
    // Convert the provided _id (string) to a mongoose ObjectId
    const userId = new mongoose.Types.ObjectId(_id); // Use 'new'
    // Find the user by _id
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get the current date
    const currentDate = new Date();

    // Check if a meal with the specified userId already exists
    const existingMeal = await Meal.findOne({ _id: userId });

    if (existingMeal) {
      // If a meal exists, update the mealsData and date
      await Meal.updateOne({ _id: userId }, { meals: mealsData, date: currentDate });
      console.log('Meals updated in the Meal collection successfully.');
      res.json({ message: 'Meals updated in the Meal collection successfully' });
    } else {
      // If a meal does not exist, create a new Meal document with the current date
      const newMeal = new Meal({
        _id: userId, // Use the user's _id as the _id
        meals: mealsData, // Store it as a JavaScript object
        date: currentDate,
      });
      // Save the new Meal document to the "Meal" collection
      await newMeal.save();
      console.log('Meals added to the Meal collection successfully.');
      res.json({ message: 'Meals added to the Meal collection successfully' });
    }
  } catch (error) {
    console.error('Error adding/updating meals to the Meal collection:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});



app.post('/updateMacros', async (req, res) => {
  try {
    const { _id, mealName, macros } = req.body;
    const foodId = new mongoose.Types.ObjectId(_id);

    console.log('Received request with _id:', _id, 'mealName:', mealName, 'macros:', macros);

    const updatedMeal = await Meal.findOneAndUpdate(
      {
        "meals.foods": {
          $elemMatch: { "_id": foodId, "name": mealName }
        }
      },
      {
        $set: {
          "meals.$[mealElem].foods.$[foodElem].macros": macros,
        },
      },
      {
        arrayFilters: [
          { "mealElem.foods.name": mealName },
          { "foodElem._id": foodId }
        ],
        new: true
      }
    );

    if (!updatedMeal) {
      console.error('Meal or food not found');
      return res.status(404).json({ error: 'Meal or food not found' });
    }

    console.log('Meal updated successfully:', updatedMeal);
    res.json({ success: true, updatedMeal });
  } catch (error) {
    console.error('Error updating meal:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




app.post('/fetchMacros', async (req, res) => {
  try {
    const { _id, mealName } = req.body;
    const foodId = new mongoose.Types.ObjectId(_id);

    console.log('Received request with _id:', _id, 'mealName:', mealName);

    const updatedFood = await Meal.findOneAndUpdate(
      {
        "meals.foods": {
          $elemMatch: { "_id": foodId, "name": mealName }
        }
      },
      {
        arrayFilters: [
          { "mealElem.foods.name": mealName },
          { "foodElem._id": foodId }
        ],
        new: true
      }
    );

    if (!updatedFood) {
      console.error('Meal or food not found');
      return res.status(404).json({ error: 'Meal or food not found' });
    }

    const updatedFoodDetails = updatedFood.meals.reduce((result, meal) => {
      const food = meal.foods.find(f => f._id.toString() === foodId.toString());
      if (food) {
        result = food;
      }
      return result;
    }, null);

    console.log('Food details updated successfully:', updatedFoodDetails);
    res.json({ success: true, updatedFoodDetails });
  } catch (error) {
    console.error('Error updating meal:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});













app.post('/updateMeals', async (req, res) => {
  try {
    const { _id } = req.body;

    // Check if _id is provided in the request body
    if (!_id) {
      return res.status(400).json({ error: 'Missing _id in the request body' });
    }

    // Convert the provided _id (string) to a mongoose ObjectId
    const userId = new mongoose.Types.ObjectId(_id);

    // Find the user by _id
    const user = await Meal.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Continue with any additional logic for updating meals or processing the user

    res.json({ user }); // Send the user details as the response

   
  } catch (error) {
    console.error('Error adding/updating meals to the Meal collection:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});




app.post('/updateRecipe', async (req, res) => {
  try {
    const { _id, mealName, recipe } = req.body;
    const foodId = new mongoose.Types.ObjectId(_id);

    console.log('Received request with _id:', _id, 'mealName:', mealName, 'recipe:', recipe);

    const updatedMeal = await Meal.findOneAndUpdate(
      {
        "meals.foods": {
          $elemMatch: { "_id": foodId, "name": mealName }
        }
      },
      {
        $set: {
          "meals.$[mealElem].foods.$[foodElem].recipe": recipe,
        },
      },
      {
        arrayFilters: [
          { "mealElem.foods.name": mealName },
          { "foodElem._id": foodId }
        ],
        new: true
      }
    );

    if (!updatedMeal) {
      console.error('Meal or food not found');
      return res.status(404).json({ error: 'Meal or food not found' });
    }

    console.log('Meal updated successfully:', updatedMeal);
    console.log('Updated recipe:', updatedMeal.meals.find(meal => meal.foods.find(food => food._id.equals(foodId))).foods.find(food => food._id.equals(foodId)).recipe);

    res.json({ success: true, updatedMeal });
  } catch (error) {
    console.error('Error updating meal:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});











// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



