import User from "../models/users/User.js";
import { generateToken } from "../middleware/authentication.js";

// POST /api/users/register - Register a new user
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, username, gender, password, phoneNumber, profilePic, role } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields: firstName, lastName, email, password, role" });
    }

    // Validate role
    const validRoles = ["Doctor", "Patient", "Ops", "IT", "Finance"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be one of: Doctor, Patient, Ops, IT, Finance" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User with this email already exists" });
    }

    // Create user (password will be hashed by the pre-save hook)
    const user = await User.create({
      firstName,
      lastName,
      email,
      username,
      gender,
      password,
      phoneNumber,
      profilePic,
      role,
    });

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Duplicate field value entered" });
    }
    res.status(500).json({ error: err.message });
  }
};

// POST /api/users/login - Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Please provide email and password" });
    }

    // Find user and include password field (since it's excluded by default)
    const user = await User.findOne({ email }).select("+password");
    console.log(user._id)
    console.log(user.password)
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials - No User" });
    }

    // Check if password matches
    //const isPasswordValid = await user.comparePassword(password);
    const isPasswordValid = (password === user.password) // TODO: Change bac to comparePassword
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect Password" });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/me - Get current user profile (protected)
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      success: true,
      user: user.toJSON(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};