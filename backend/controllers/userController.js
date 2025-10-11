import User from "../models/User.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

// POST /api/users
export const createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// POST /api/users/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ error: "Please provide email and password" });
    }

    // Find user by email and include password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if password matches
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      token,
      user: userResponse,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/me - Get current user profile
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};