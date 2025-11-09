import OpsMember from "../../models/ops/OpsMember.js";
import User from "../../models/users/User.js";
import { generateToken } from "../../middleware/authentication.js";

export const createOpsMember = async (req, res) => {
  try {
    // Step 1: Create the User directly
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      username: req.body.username,
      gender: req.body.gender || req.body.sex,
      password: req.body.password, // hashed via pre-save hook
      phoneNumber: req.body.phoneNumber || req.body.phone,
      profilePic: req.body.profilePic,
      role: "Ops",
    });

    const savedUser = await user.save();

    // Step 2: Create the OpsMember entry linked to the user
    const opsMember = new OpsMember({ user: savedUser._id });
    const savedOpsMember = await opsMember.save();

    // Generate JWT token for authentication
    const token = generateToken(savedUser._id);

    res.status(201).json({
      success: true,
      message: "Ops member and user account created successfully",
      token,
      user: savedUser.toJSON(),
      opsMember: savedOpsMember,
    });
  } catch (error) {
    console.error("Error creating Ops member:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all ops members
export const getAllOpsMembers = async (req, res) => {
  try {
    const opsMembers = await OpsMember.find().populate(
      "user",
      "firstName lastName email username gender phoneNumber profilePic role"
    );
    return res.json(opsMembers);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get single ops member by ID
export const getOpsMemberById = async (req, res) => {
  try {
    const opsMember = await OpsMember.findOne({ user: req.params.userId }).populate(
      "user",
      "firstName lastName email username gender phoneNumber profilePic role"
    );
    if (!opsMember) {
      return res.status(404).json({ error: "OpsMember not found" });
    }
    return res.json(opsMember);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Update ops member by ID
export const updateOpsMember = async (req, res) => {
  try {
    const opsMember = await OpsMember.findOne({ user: req.params.userId });
    if (!opsMember) {
      return res.status(404).json({ error: "OpsMember not found" });
    }
    const userUpdates = req.body;
    const updatedUser = await User.findByIdAndUpdate(opsMember.user, userUpdates, { new: true });
    return res.json({ user: updatedUser });
  } catch (err) {
    return res.status(400).json({ error: err.message });
    }
};

// Delete ops member by ID
export const deleteOpsMember = async (req, res) => {
  try {
    const opsMember = await OpsMember.findOne({ user: req.params.userId });
    if (!opsMember) {
        return res.status(404).json({ error: "OpsMember not found" });
    }
    await User.findByIdAndDelete(opsMember.user);
    await OpsMember.findByIdAndDelete(opsMember._id);
    return res.json({ message: "OpsMember and associated user deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};