// =============================================================================
// backend/controllers/authController.js
// Contains logic for user registration and login
// =============================================================================
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create new user
    const user = await User.create({
      username,
      password,
    });

    if (user) {
      // Respond with user info and token (exclude password)
      res.status(201).json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id, user.username),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by username and explicitly select password
    const user = await User.findOne({ username }).select('+password');

    // Check if user exists and password matches
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id, user.username),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
     console.error("Login Error:", error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export { registerUser, loginUser };