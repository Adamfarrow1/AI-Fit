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
  email: String,
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
    // Create a new user using data from the request body
    console.log(req.body)
    const { name, password, email } = req.body;
    const newUser = new UserModel({ name, password, email });
    
    // Save the new user to the database
    await newUser.save();

    res.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


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
