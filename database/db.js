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
      fullName: String,
      email: String,
      age: String,
      gender: String,
      weight: String,
      height: String,
      goal: String,
});

// Create a model using the schema
const UserModel = mongoose.model('User', userSchema);

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
<<<<<<< HEAD
    // Create a new user using data from the request body
    console.log(req.body)
    const { password,
=======
    // Log the incoming request body
    console.log("Received request with body:", req.body);

    // Extract data from the request body
    const {
      password,
>>>>>>> aa107b13d08e843d0b169a66a2ec5fa8ebbbf5db
      fullName,
      email,
      age,
      gender,
      weight,
      height,
<<<<<<< HEAD
      goal} = req.body;
=======
      goal
    } = req.body;

    // Log the extracted data
    console.log("Extracted data:", {
      password, fullName, email, age, gender, weight, height, goal
    });


>>>>>>> aa107b13d08e843d0b169a66a2ec5fa8ebbbf5db
    const newUser = new UserModel({
      password,
      fullName,
      email,
      age,
      gender,
      weight,
      height,
<<<<<<< HEAD
      goal});
    
    // Save the new user to the database
    await newUser.save();

=======
      goal
    });

    // Log the user object before saving
    console.log("User object to be saved:", newUser);

    // Save the new user to the database
    await newUser.save();

    console.log("User saved successfully");
>>>>>>> aa107b13d08e843d0b169a66a2ec5fa8ebbbf5db
    res.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


<<<<<<< HEAD
=======


>>>>>>> aa107b13d08e843d0b169a66a2ec5fa8ebbbf5db
// Route to handle user login
app.post('/login', async (req, res) => {
  try {
    // Extract the username and password from the request body
    const { name, password } = req.body;

    // Query the database to find a user with the given username and password
    const user = await UserModel.findOne({ name, password });

    if (!user) {
      // If no user is found, return an error response
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // If the user is found, you can customize the response accordingly
    res.json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
