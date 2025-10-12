import OpsMember from "../models/OpsMember.js";
import User from "../models/User.js"
// Create new ops member
export const createOpsMember = async (req, res) => {
  try {
    const userData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        username: req.body.username,
        gender: req.body.gender,
        password: req.body.password, // Hash before saving in production
        phoneNumber: req.body.phoneNumber,
        profilePic: req.body.profilePic,
        role: "Ops",
    };
    const user = new User(userData);
    const savedUser = await user.save();

    const opsMemberData = {
        user: savedUser._id, // link Ops → User
    };

    const opsMember = new OpsMember(opsMemberData);
    const savedOpsMember = await opsMember.save();
    return res.status(201).json({
        user: savedUser,
        opsMember: savedOpsMember,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
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