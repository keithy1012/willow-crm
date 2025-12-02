import User from "../models/users/User.js";
import { generateToken } from "../middleware/authentication.js";
import { logEvent, getClientIp } from "../utils/logger.js";
import { get } from "mongoose";

// Register a new user
export const register = async (req, res) => {
  const ip = getClientIp(req);
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
    logEvent(
      "User",
      `Registration initiated - Email: ${email}, Username: ${username}, Role: ${role}`,
      "N/A",
      ip
    );

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      logEvent(
        "User",
        `Registration failed - Missing required fields - Email: ${email}`,
        "N/A",
        ip
      );
      return res.status(400).json({
        error:
          "Missing required fields: firstName, lastName, email, password, role",
      });
    }

    // Validate role
    const validRoles = ["Doctor", "Patient", "Ops", "IT", "Finance"];
    if (!validRoles.includes(role)) {
      logEvent(
        "User",
        `Registration failed - Invalid role: ${role} - Email: ${email}`,
        "N/A",
        ip
      );
      return res.status(400).json({
        error:
          "Invalid role. Must be one of: Doctor, Patient, Ops, IT, Finance",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logEvent(
        "User",
        `Registration failed - Email already exists: ${email}`,
        "N/A",
        ip
      );
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
    logEvent(
      "User",
      `Registration successful - User ID: ${user._id}, Email: ${email}, Username: ${username}, Role: ${role}, Name: ${firstName} ${lastName}`,
      user._id,
      ip
    );

    res.status(201).json({
      success: true,
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    if (err.code === 11000) {
      logEvent(
        "User",
        `Registration failed - Duplicate field value - Email: ${req.body?.email}, Error: ${err.message}`,
        "N/A",
        ip
      );
      return res.status(409).json({ error: "Duplicate field value entered" });
    }
    logEvent(
      "User",
      `Registration error - Email: ${req.body?.email}, Error: ${err.message}`,
      "N/A",
      ip
    );
    res.status(500).json({ error: err.message });
  }
};

// Login user
export const login = async (req, res) => {
  const ip = getClientIp(req);
  try {
    const { email, password } = req.body;
    logEvent("User", `Login attempt initiated - Email: ${email}`, "N/A", ip);

    // Validate input
    if (!email || !password) {
      logEvent(
        "User",
        `Login failed - Missing credentials - Email: ${
          email || "not provided"
        }`,
        "N/A",
        ip
      );
      return res
        .status(400)
        .json({ error: "Please provide email and password" });
    }

    // Find user and include password field (since it's excluded by default)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      logEvent(
        "User",
        `Login failed - User not found - Email: ${email}`,
        "N/A",
        ip
      );
      return res.status(401).json({ error: "Invalid credentials - No User" });
    }

    // Check if password matches
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logEvent(
        "User",
        `Login failed - Incorrect password - Email: ${email}, User ID: ${user._id}`,
        "N/A",
        ip
      );
      return res.status(401).json({ error: "Incorrect Password" });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    logEvent(
      "User",
      `Login successful - User ID: ${user._id}, Email: ${email}, Role: ${user.role}`,
      user._id,
      ip
    );

    res.status(200).json({
      success: true,
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    logEvent(
      "User",
      `Login error - Email: ${req.body?.email}, Error: ${err.message}`,
      "N/A",
      ip
    );
    res.status(500).json({ error: err.message });
  }
};

// Get current user profile (protected)
export const getCurrentUser = async (req, res) => {
  ip = getClientIp(req);
  try {
    logEvent(
      "User",
      `Get current user initiated - User ID: ${req.user._id}`,
      req.user?._id,
      ip
    );
    const user = await User.findById(req.user._id);
    if (!user) {
      logEvent(
        "User",
        `Get current user failed - User ID ${req.user._id} not found`,
        req.user?._id,
        ip
      );
      return res.status(404).json({ error: "User not found" });
    }
    logEvent(
      "User",
      `Current user retrieved - User ID: ${user._id}, Email: ${user.email}, Role: ${user.role}`,
      req.user?._id,
      ip
    );
    res.status(200).json({
      success: true,
      user: user.toJSON(),
    });
  } catch (err) {
    logEvent(
      "User",
      `Get current user error - User ID: ${req.user?._id}, Error: ${err.message}`,
      req.user?._id,
      ip
    );
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/email-check?email=...
export const checkEmail = async (req, res) => {
  ip = getClientIp(req);
  const email = req.query.email;
  logEvent(
    "User",
    `Email check initiated - Email: ${email}`,
    req.user?._id,
    ip
  );

  if (!email) {
    logEvent(
      "User",
      "Email check failed - Email not provided",
      req.user?._id,
      ip
    );
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      logEvent(
        "User",
        `Email check completed - Email: ${email}, Exists: true`,
        req.user?._id,
        ip
      );
      return res.json({ exists: true });
    } else {
      logEvent(
        "User",
        `Email check completed - Email: ${email}, Exists: false`,
        req.user?._id,
        ip
      );
      return res.json({ exists: false });
    }
  } catch (error) {
    logEvent(
      "User",
      `Email check error - Email: ${email}, Error: ${error.message}`,
      req.user?._id,
      ip
    );
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/users/search?query=... - Search for users
export const searchUsers = async (req, res) => {
  try {
    ip = getClientIp(req);
    const { query } = req.query;
    const currentUserId = req.user?._id || req.userId;

    logEvent(
      "User",
      `User search initiated - Query: ${query}, Requested By: ${currentUserId}`,
      currentUserId,
      ip
    );

    // Require at least 2 characters to search
    if (!query || query.length < 2) {
      return res.json({ success: true, users: [] });
    }

    if (!currentUserId) {
      logEvent(
        "User",
        "User search failed - User not authenticated",
        "N/A",
        ip
      );
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

    logEvent(
      "User",
      `User search initiated - Criteria: ${searchCriteria}`,
      currentUserId,
      ip
    );

    // Find matching users
    const users = await User.find(searchCriteria)
      .select(
        "firstName lastName username email role profilePic isOnline lastActive"
      )
      .limit(20)
      .sort({ isOnline: -1, lastActive: -1 });

    logEvent(
      "User",
      `User search  - Found: ${users.length} users`,
      currentUserId,
      ip
    );

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

    logEvent(
      "User",
      `User search completed - Query: ${query}, Results: ${transformedUsers.length}`,
      currentUserId,
      ip
    );
    res.json({
      success: true,
      count: transformedUsers.length,
      users: transformedUsers,
    });
  } catch (error) {
    logEvent(
      "User",
      `User search error - Query: ${req.query?.query}, Error: ${error.message}`,
      req.user?._id || req.userId,
      ip
    );
    res.status(500).json({
      error: "Search failed",
      details: error.message,
    });
  }
};

export const searchUsersByRole = async (req, res) => {
  try {
    ip = getClientIp(req);
    const { role, query } = req.query;
    const currentUserId = req.user?._id || req.userId;
    logEvent(
      "User",
      `Role-based search initiated - Role: ${role || "all"}, Query: ${
        query || "none"
      }, Requested By: ${currentUserId}`,
      currentUserId,
      ip
    );

    // Validate role if provided
    const validRoles = ["Doctor", "Patient", "Ops", "IT", "Finance"];
    if (role && !validRoles.includes(role)) {
      logEvent(
        "User",
        `Role-based search failed - Invalid role: ${role}`,
        currentUserId,
        ip
      );
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
    logEvent(
      "User",
      `Role-based search completed - Role: ${role || "all"}, Query: ${
        query || "none"
      }, Results: ${users.length}`,
      currentUserId,
      ip
    );
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
    logEvent(
      "User",
      `Role-based search error - Role: ${req.query?.role}, Query: ${req.query?.query}, Error: ${error.message}`,
      req.user?._id || req.userId,
      ip
    );
    res.status(500).json({
      error: "Search failed",
      details: error.message,
    });
  }
};

// GET /api/users/:id - Get a specific user by ID
export const getUserById = async (req, res) => {
  try {
    ip = getClientIp(req);
    const { id } = req.params;
    logEvent(
      "User",
      `Get user by ID initiated - Target User ID: ${id}`,
      req.user?._id,
      ip
    );
    const user = await User.findById(id).select(
      "firstName lastName username email role profilePic isOnline lastActive"
    );

    if (!user) {
      logEvent(
        "User",
        `Get user by ID failed - User ID ${id} not found`,
        req.user?._id,
        ip
      );
      return res.status(404).json({ error: "User not found" });
    }

    logEvent(
      "User",
      `User retrieved - User ID: ${id}, Email: ${user.email}, Role: ${user.role}`,
      req.user?._id,
      ip
    );

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
    logEvent(
      "User",
      `Get user by ID error - User ID: ${req.params?.id}, Error: ${error.message}`,
      req.user?._id,
      ip
    );
    res.status(500).json({
      error: "Failed to get user",
      details: error.message,
    });
  }
};
