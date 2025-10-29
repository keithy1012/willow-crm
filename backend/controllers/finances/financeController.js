import FinanceMember from "../../models/finance/FinanceMember.js";
import User from "../../models/User.js";

// Create new Finance member
export const createFinanceMember = async (req, res) => {
  try {
    const userData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      username: req.body.username,
      gender: req.body.gender,
      password: req.body.password, // TODO: hash before saving
      phoneNumber: req.body.phoneNumber,
      profilePic: req.body.profilePic,
      role: "Finance",
    };

    const user = new User(userData);
    const savedUser = await user.save();

    const financeMember = new FinanceMember({ user: savedUser._id });
    const savedFinanceMember = await financeMember.save();

    res.status(201).json(savedFinanceMember);
  } catch (error) {
    console.error("Error creating Finance member:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all Finance members
export const getAllFinanceMembers = async (req, res) => {
  try {
    const financeMembers = await FinanceMember.find().populate("user", "-password");
    res.status(200).json(financeMembers);
  } catch (error) {
    console.error("Error fetching Finance members:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get Finance member by ID
export const getFinanceMemberById = async (req, res) => {
  try {
    const financeMember = await FinanceMember.findById(req.params.id).populate("user", "-password");

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

    res.status(200).json({ message: "Finance member updated successfully" });
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
    await financeMember.remove();

    res.status(200).json({ message: "Finance member deleted successfully" });
  } catch (error) {
    console.error("Error deleting Finance member:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
