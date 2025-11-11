// controllers/finance/financeController.js
import FinanceMember from "../../models/finance/FinanceMember.js";
import User from "../../models/users/User.js";
import { generateToken } from "../../middleware/authentication.js";

// ===== Finance Member Management =====

// Create new Finance member
export const createFinanceMember = async (req, res) => {
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
    } = req.body;

    // Create user directly
    const newUser = new User({
      firstName,
      lastName,
      email,
      username,
      gender: gender || req.body.sex,
      password,
      phoneNumber: phoneNumber || req.body.phone,
      profilePic,
      role: "Finance",
    });

    await newUser.save();

    const financeMember = await FinanceMember.create({ user: newUser._id });

    // Generate JWT token for authentication
    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      message: "Finance member and linked user created successfully",
      token,
      user: newUser.toJSON(),
      financeMember,
    });
  } catch (error) {
    console.error("Error creating Finance member:", error.message);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Get all Finance members
export const getAllFinanceMembers = async (req, res) => {
  try {
    const financeMembers = await FinanceMember.find().populate(
      "user",
      "-password"
    );
    res.status(200).json(financeMembers);
  } catch (error) {
    console.error("Error fetching Finance members:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get Finance member by ID
export const getFinanceMemberById = async (req, res) => {
  try {
    const financeMember = await FinanceMember.findById(req.params.id).populate(
      "user",
      "-password"
    );
    if (!financeMember) {
      return res.status(404).json({ message: "Finance member not found" });
    }

    res.status(200).json(financeMember);
  } catch (error) {
    console.error("Error fetching Finance member:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Update Finance member
export const updateFinanceMember = async (req, res) => {
  try {
    const financeMember = await FinanceMember.findById(req.params.id);
    if (!financeMember) {
      return res.status(404).json({ message: "Finance member not found" });
    }

    const user = await User.findById(financeMember.user);
    if (!user) {
      return res.status(404).json({ message: "Associated user not found" });
    }

    Object.assign(user, req.body);
    await user.save();

    res
      .status(200)
      .json({ message: "Finance member updated successfully", user });
  } catch (error) {
    console.error("Error updating Finance member:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete Finance member
export const deleteFinanceMember = async (req, res) => {
  try {
    const financeMember = await FinanceMember.findById(req.params.id);
    if (!financeMember) {
      return res.status(404).json({ message: "Finance member not found" });
    }

    await User.findByIdAndDelete(financeMember.user);
    await financeMember.deleteOne();
    res.status(200).json({ message: "Finance member deleted successfully" });
  } catch (error) {
    console.error("Error deleting Finance member:", error);
    res.status(500).json({ message: "Server error", error });
  }
};