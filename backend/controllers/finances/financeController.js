import FinanceMember from "../../models/finance/FinanceMember.js";
import User from "../../models/users/User.js";
import { generateToken } from "../../middleware/authentication.js";

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
    logEvent(
      "Finance",
      `Finance member creation initiated - Email: ${email}, Username: ${username}, Name: ${firstName} ${lastName}`
    );
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
    logEvent(
      "Finance",
      `User created for finance member - User ID: ${newUser._id}, Email: ${email}`,
      newUser._id
    );
    const financeMember = await FinanceMember.create({ user: newUser._id });
    logEvent(
      "Finance",
      `Finance member created successfully - Finance ID: ${financeMember._id}, User ID: ${newUser._id}`,
      newUser._id
    );

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
    logEvent(
      "Finance",
      `Finance member creation error - Email: ${req.body?.email}, Error: ${error.message}`
    );
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Get all Finance members
export const getAllFinanceMembers = async (req, res) => {
  try {
    logEvent("Finance", "Get all finance members initiated");

    const financeMembers = await FinanceMember.find().populate(
      "user",
      "-password"
    );

    logEvent(
      "Finance",
      `All finance members retrieved - Count: ${financeMembers.length}`
    );

    res.status(200).json(financeMembers);
  } catch (error) {
    logEvent(
      "Finance",
      `Get all finance members error - Error: ${error.message}`
    );
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
      logEvent(
        "Finance",
        `Get finance member failed - Finance member ${id} not found`
      );
      return res.status(404).json({ message: "Finance member not found" });
    }

    logEvent(
      "Finance",
      `Finance member retrieved - Finance ID: ${id}, User ID: ${financeMember.user?._id}`,
      financeMember.user?._id
    );

    res.status(200).json(financeMember);
  } catch (error) {
    logEvent(
      "Finance",
      `Get finance member error - Finance ID: ${req.params?.id}, Error: ${error.message}`
    );
    res.status(500).json({ message: "Server error", error });
  }
};

// Update Finance member
export const updateFinanceMember = async (req, res) => {
  try {
    const financeMember = await FinanceMember.findById(req.params.id);
    if (!financeMember) {
      logEvent(
        "Finance",
        `Update failed - Finance member ${id} not found`,
        req.user?._id
      );
      return res.status(404).json({ message: "Finance member not found" });
    }

    const user = await User.findById(financeMember.user);
    if (!user) {
      logEvent(
        "Finance",
        `Update failed - Associated user not found for Finance member ${id}`,
        req.user?._id
      );
      return res.status(404).json({ message: "Associated user not found" });
    }

    const updatedFields = Object.keys(req.body).filter(
      (key) => key !== "password"
    );
    Object.assign(user, req.body);
    await user.save();
    logEvent(
      "Finance",
      `Finance member updated successfully - Finance ID: ${id}, User ID: ${
        user._id
      }, Updated fields: ${updatedFields.join(", ")}`,
      user._id
    );

    res
      .status(200)
      .json({ message: "Finance member updated successfully", user });
  } catch (error) {
    logEvent(
      "Finance",
      `Update finance member error - Finance ID: ${req.params?.id}, Error: ${error.message}`,
      req.user?._id
    );
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete Finance member
export const deleteFinanceMember = async (req, res) => {
  try {
    const { id } = req.params;
    logEvent(
      "Finance",
      `Delete finance member initiated - Finance ID: ${id}`,
      req.user?._id
    );
    const financeMember = await FinanceMember.findById(id);
    if (!financeMember) {
      logEvent(
        "Finance",
        `Delete failed - Finance member ${id} not found`,
        req.user?._id
      );
      return res.status(404).json({ message: "Finance member not found" });
    }

    await User.findByIdAndDelete(financeMember.user);
    await financeMember.deleteOne();
    logEvent(
      "Finance",
      `Finance member deleted successfully - Finance ID: ${id}, User ID: ${userId}`,
      req.user?._id
    );
    res.status(200).json({ message: "Finance member deleted successfully" });
  } catch (error) {
    logEvent(
      "Finance",
      `Delete finance member error - Finance ID: ${req.params?.id}, Error: ${error.message}`,
      req.user?._id
    );
    res.status(500).json({ message: "Server error", error });
  }
};
