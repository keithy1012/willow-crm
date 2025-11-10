import jwt from "jsonwebtoken";
import User from "../models/users/User.js";

// Lazy load
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET not configured - check your .env file");
  }
  return secret;
};

const getJWTExpire = () => process.env.JWT_EXPIRE || "7d";

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, getJWTSecret(), {
    expiresIn: getJWTExpire(),
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, getJWTSecret());
};

// Middleware to protect routes - verifies JWT token
export const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ error: "Not authorized, no token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, getJWTSecret());

    // Get user from database and attach to request
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(500).json({ error: "Authentication failed" });
  }
};
