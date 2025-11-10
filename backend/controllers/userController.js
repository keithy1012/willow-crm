import User from "../models/users/User.js";
import { generateToken } from "../middleware/authentication.js";

// POST /api/users/register - Register a new user
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      username,
      gender,
      password,
      phoneNumber,
      profilePic,
      role,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({
        error:
          "Missing required fields: firstName, lastName, email, password, role",
      });
    }

    // Validate role
    const validRoles = ["Doctor", "Patient", "Ops", "IT", "Finance"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error:
          "Invalid role. Must be one of: Doctor, Patient, Ops, IT, Finance",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
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
      return res
        .status(400)
        .json({ error: "Please provide email and password" });
    }

    // Find user and include password field (since it's excluded by default)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials - No User" });
    }

    // Check if password matches
    const isPasswordValid = await user.comparePassword(password);
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

// GET /api/users/email-check?email=...
export const checkEmail = async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking email:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/users/search?query=... - Search for users
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    console.log("Search request for query:", query);
    console.log("Current user:", req.user?._id || req.userId);

    // Require at least 2 characters to search
    if (!query || query.length < 2) {
      return res.json({ success: true, users: [] });
    }

    // Get the current user ID from the auth middleware
    const currentUserId = req.user?._id || req.userId;

    if (!currentUserId) {
      console.error("No user ID found in request");
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Build search criteria
    const searchCriteria = {
      _id: { $ne: currentUserId }, // Exclude current user
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    };

    console.log("Searching with criteria:", searchCriteria);

    // Find matching users
    const users = await User.find(searchCriteria)
      .select(
        "firstName lastName username email role profilePic isOnline lastActive"
      )
      .limit(20)
      .sort({ isOnline: -1, lastActive: -1 });

    console.log(`Found ${users.length} users`);

    // Transform the results
    const transformedUsers = users.map((user) => ({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      isOnline: user.isOnline || false,
      lastActive: user.lastActive,
    }));

    res.json({
      success: true,
      count: transformedUsers.length,
      users: transformedUsers,
    });
  } catch (error) {
    console.error("User search error:", error);
    res.status(500).json({
      error: "Search failed",
      details: error.message,
    });
  }
};

export const searchUsersByRole = async (req, res) => {
  try {
    const { role, query } = req.query;
    const currentUserId = req.user?._id || req.userId;

    // Validate role if provided
    const validRoles = ["Doctor", "Patient", "Ops", "IT", "Finance"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      });
    }

    // Build search criteria
    const searchCriteria = {
      $and: [
        // Exclude current user
        currentUserId ? { _id: { $ne: currentUserId } } : {},
        // Filter by role if provided
        role ? { role } : {},
        // Search by query if provided
        query && query.length >= 2
          ? {
              $or: [
                { firstName: { $regex: query, $options: "i" } },
                { lastName: { $regex: query, $options: "i" } },
                { username: { $regex: query, $options: "i" } },
              ],
            }
          : {},
      ],
    };

    const users = await User.find(searchCriteria)
      .select("firstName lastName username email role profilePic isOnline")
      .limit(20)
      .sort({ isOnline: -1, firstName: 1 });

    res.json({
      success: true,
      count: users.length,
      users: users.map((user) => ({
        _id: user._id,
        fullName: `${user.firstName} ${user.lastName}`,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        isOnline: user.isOnline || false,
      })),
    });
  } catch (error) {
    console.error("Role-based search error:", error);
    res.status(500).json({
      error: "Search failed",
      details: error.message,
    });
  }
};

// GET /api/users/:id - Get a specific user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select(
      "firstName lastName username email role profilePic isOnline lastActive"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        fullName: `${user.firstName} ${user.lastName}`,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        isOnline: user.isOnline || false,
        lastActive: user.lastActive,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      error: "Failed to get user",
      details: error.message,
    });
  }
};
