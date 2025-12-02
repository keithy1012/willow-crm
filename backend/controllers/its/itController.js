import ITMember from "../../models/its/ITMember.js";
import User from "../../models/users/User.js";
import { generateToken } from "../../middleware/authentication.js";
import { logEvent } from "../../utils/logger.js";

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

    logEvent(
      "IT",
      `IT member creation initiated - Email: ${email}, Username: ${username}, Name: ${firstName} ${lastName}`
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
      role: "IT",
    });

    await newUser.save();
    logEvent(
      "IT",
      `User created for IT member - User ID: ${newUser._id}, Email: ${email}`,
      newUser._id
    );

    const itMember = await ITMember.create({ user: newUser._id });
    logEvent(
      "IT",
      `IT member created successfully - IT ID: ${itMember._id}, User ID: ${newUser._id}`,
      newUser._id
    );

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
    logEvent(
      "IT",
      `IT member creation error - Email: ${req.body?.email}, Error: ${error.message}`
    );
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Get all IT members
export const getAllITMembers = async (req, res) => {
  try {
    logEvent("IT", "Get all IT members initiated");
    const itMembers = await ITMember.find().populate("user", "-password");
    logEvent("IT", `All IT members retrieved - Count: ${itMembers.length}`);
    res.status(200).json(itMembers);
  } catch (error) {
    logEvent("IT", `Get all IT members error - Error: ${error.message}`);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get IT member by ID
export const getITMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    logEvent("IT", `Get IT member by ID - IT ID: ${id}`);

    const itMember = await ITMember.findById(id).populate("user", "-password");

    if (!itMember) {
      logEvent("IT", `Get IT member failed - IT member ${id} not found`);
      return res.status(404).json({ message: "IT member not found" });
    }

    logEvent(
      "IT",
      `IT member retrieved - IT ID: ${id}, User ID: ${itMember.user?._id}`,
      itMember.user?._id
    );

    res.status(200).json(itMember);
  } catch (error) {
    logEvent(
      "IT",
      `Get IT member error - IT ID: ${req.params?.id}, Error: ${error.message}`
    );
    res.status(500).json({ message: "Server error", error });
  }
};

// Update IT member
export const updateITMember = async (req, res) => {
  try {
    const { id } = req.params;

    logEvent("IT", `Update IT member initiated - IT ID: ${id}`, req.user?._id);
    const itMember = await ITMember.findById(id);

    if (!itMember) {
      logEvent(
        "IT",
        `Update failed - IT member ${id} not found`,
        req.user?._id
      );
      return res.status(404).json({ message: "IT member not found" });
    }

    const user = await User.findById(itMember.user);
    if (!user) {
      logEvent(
        "IT",
        `Update failed - Associated user not found for IT member ${id}`,
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
      "IT",
      `IT member updated successfully - IT ID: ${id}, User ID: ${
        user._id
      }, Updated fields: ${updatedFields.join(", ")}`,
      user._id
    );
    res.status(200).json({ message: "IT member updated successfully", user });
  } catch (error) {
    logEvent(
      "IT",
      `Update IT member error - IT ID: ${req.params?.id}, Error: ${error.message}`,
      req.user?._id
    );
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete IT member
export const deleteITMember = async (req, res) => {
  try {
    const { id } = req.params;

    logEvent("IT", `Delete IT member initiated - IT ID: ${id}`, req.user?._id);

    const itMember = await ITMember.findById(id);
    if (!itMember) {
      logEvent(
        "IT",
        `Delete failed - IT member ${id} not found`,
        req.user?._id
      );
      return res.status(404).json({ message: "IT member not found" });
    }

    const userId = itMember.user;

    await User.findByIdAndDelete(itMember.user);
    await itMember.remove();

    logEvent(
      "IT",
      `IT member deleted successfully - IT ID: ${id}, User ID: ${userId}`,
      req.user?._id
    );

    res.status(200).json({ message: "IT member deleted successfully" });
  } catch (error) {
    logEvent(
      "IT",
      `Delete IT member error - IT ID: ${req.params?.id}, Error: ${error.message}`,
      req.user?._id
    );
    res.status(500).json({ message: "Server error", error });
  }
};
