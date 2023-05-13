const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const port = 4000; // You can use any port number you prefer

const app = express();

// Middleware
app.use(express.json());

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.userId = decoded.userId;
    next();
  });
};

// Database connection
databaseUsername = process.env.DB_USERNAME;
databasePassword = encodeURIComponent(process.env.DB_PASSWORD);
const uri = `mongodb+srv://${databaseUsername}:${databasePassword}@firstcluster.9w2bn.mongodb.net`;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Define User schema and model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// Register route
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ name, email, password: hashedPassword });

    // Save the user to the database
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET);

    res.status(200).json({ token }); // Return the token as a response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
