import ITMember from "../../models/its/ITMember.js";
import User from "../../models/users/User.js";
import { generateToken } from "../../middleware/authentication.js";

// Create new IT member
export const createITMember = async (req, res) => {
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
      role: "IT",
    });

    await newUser.save();

    const itMember = await ITMember.create({ user: newUser._id });

    // Generate JWT token for authentication
    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      message: "IT member and linked user created successfully",
      token,
      user: newUser.toJSON(),
      itMember,
    });
  } catch (error) {
    console.error("Error creating IT member:", error.message);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Get all IT members
export const getAllITMembers = async (req, res) => {
  try {
    const itMembers = await ITMember.find().populate("user", "-password");
    res.status(200).json(itMembers);
  } catch (error) {
    console.error("Error fetching IT members:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get IT member by ID
export const getITMemberById = async (req, res) => {
  try {
    const itMember = await ITMember.findById(req.params.id).populate(
      "user",
      "-password"
    );
    if (!itMember) {
      return res.status(404).json({ message: "IT member not found" });
    }
    res.status(200).json(itMember);
  } catch (error) {
    console.error("Error fetching IT member:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Update IT member
export const updateITMember = async (req, res) => {
  try {
    const itMember = await ITMember.findById(req.params.id);
    if (!itMember) {
      return res.status(404).json({ message: "IT member not found" });
    }

    const user = await User.findById(itMember.user);
    if (!user) {
      return res.status(404).json({ message: "Associated user not found" });
    }

    Object.assign(user, req.body);
    await user.save();

    res.status(200).json({ message: "IT member updated successfully", user });
  } catch (error) {
    console.error("Error updating IT member:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete IT member
export const deleteITMember = async (req, res) => {
  try {
    const itMember = await ITMember.findById(req.params.id);
    if (!itMember) {
      return res.status(404).json({ message: "IT member not found" });
    }

    await User.findByIdAndDelete(itMember.user);
    await itMember.remove();

    res.status(200).json({ message: "IT member deleted successfully" });
  } catch (error) {
    console.error("Error deleting IT member:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
