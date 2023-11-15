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
});

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
  meals: [
    {
      mealName: String,
      foods: [
        {
          name: String,
          calories: String,
          ingredients: String,
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
    // Create a new Meal document
    const newMeal = new Meal({
      _id: userId, // Use the user's _id as the _id
      meals: mealsData, // Store it as a JavaScript object
    });
    // Save the new Meal document to the "Meal" collection
    await newMeal.save();
    console.log('Meals added to the Meal collection successfully.');
    res.json({ message: 'Meals added to the Meal collection successfully' });
  } catch (error) {
    console.error('Error adding meals to the Meal collection:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});



// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



