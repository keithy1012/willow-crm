import OpsMember from "../../models/ops/OpsMember.js";
import User from "../../models/users/User.js";
import { generateToken } from "../../middleware/authentication.js";
import { logEvent, getClientIp } from "../../utils/logger.js";

export const createOpsMember = async (req, res) => {
  const ip = getClientIp(req);
  try {
    logEvent(
      "OpsMember",
      `Create ops member initiated - Email: ${req.body.email}, Username: ${req.body.username}`,
      "N/A",
      ip
    );

    // Step 1: Create the User directly
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      username: req.body.username,
      gender: req.body.gender || req.body.sex,
      password: req.body.password,
      phoneNumber: req.body.phoneNumber || req.body.phone,
      profilePic: req.body.profilePic,
      role: "Ops",
    });

    const savedUser = await user.save();
    logEvent(
      "OpsMember",
      `User account created - User ID: ${savedUser._id}, Email: ${savedUser.email}`,
      savedUser._id,
      ip
    );

    // Step 2: Create the OpsMember entry linked to the user
    const opsMember = new OpsMember({ user: savedUser._id });
    const savedOpsMember = await opsMember.save();

    logEvent(
      "OpsMember",
      `Ops member created successfully - OpsMember ID: ${savedOpsMember._id}, User ID: ${savedUser._id}, Email: ${savedUser.email}, Name: ${savedUser.firstName} ${savedUser.lastName}`,
      savedUser._id,
      ip
    );

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
    logEvent(
      "OpsMember",
      `Create ops member error - Email: ${req.body?.email}, Error: ${error.message}`,
      "N/A",
      ip
    );
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all ops members
export const getAllOpsMembers = async (req, res) => {
  const ip = getClientIp(req);
  try {
    logEvent("OpsMember", "Get all ops members initiated", req.user?._id, ip);

    const opsMembers = await OpsMember.find().populate(
      "user",
      "firstName lastName email username gender phoneNumber profilePic role"
    );

    logEvent(
      "OpsMember",
      `All ops members retrieved - Count: ${opsMembers.length}`,
      req.user?._id,
      ip
    );

    return res.json(opsMembers);
  } catch (err) {
    logEvent(
      "OpsMember",
      `Get all ops members error - Error: ${err.message}`,
      req.user?._id,
      ip
    );
    return res.status(500).json({ error: err.message });
  }
};

// Get single ops member by ID
export const getOpsMemberById = async (req, res) => {
  const ip = getClientIp(req);
  try {
    const { userId } = req.params;

    logEvent(
      "OpsMember",
      `Get ops member by ID initiated - User ID: ${userId}`,
      req.user?._id,
      ip
    );

    const opsMember = await OpsMember.findOne({ user: userId }).populate(
      "user",
      "firstName lastName email username gender phoneNumber profilePic role"
    );

    if (!opsMember) {
      logEvent(
        "OpsMember",
        `Get ops member failed - User ID ${userId} not found`,
        req.user?._id,
        ip
      );
      return res.status(404).json({ error: "OpsMember not found" });
    }

    logEvent(
      "OpsMember",
      `Ops member retrieved - OpsMember ID: ${opsMember._id}, User ID: ${userId}, Email: ${opsMember.user?.email}`,
      req.user?._id,
      ip
    );

    return res.json(opsMember);
  } catch (err) {
    logEvent(
      "OpsMember",
      `Get ops member error - User ID: ${req.params?.userId}, Error: ${err.message}`,
      req.user?._id,
      ip
    );
    return res.status(500).json({ error: err.message });
  }
};

// Update ops member by ID
export const updateOpsMember = async (req, res) => {
  const ip = getClientIp(req);
  try {
    const { userId } = req.params;
    const userUpdates = req.body;

    logEvent(
      "OpsMember",
      `Update ops member initiated - User ID: ${userId}, Updates: ${JSON.stringify(
        userUpdates
      )}`,
      req.user?._id,
      ip
    );

    const opsMember = await OpsMember.findOne({ user: userId });
    if (!opsMember) {
      logEvent(
        "OpsMember",
        `Update ops member failed - User ID ${userId} not found`,
        req.user?._id,
        ip
      );
      return res.status(404).json({ error: "OpsMember not found" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      opsMember.user,
      userUpdates,
      { new: true }
    );

    logEvent(
      "OpsMember",
      `Ops member updated successfully - OpsMember ID: ${opsMember._id}, User ID: ${userId}, Email: ${updatedUser.email}`,
      req.user?._id,
      ip
    );

    return res.json({ user: updatedUser });
  } catch (err) {
    logEvent(
      "OpsMember",
      `Update ops member error - User ID: ${req.params?.userId}, Error: ${err.message}`,
      req.user?._id,
      ip
    );
    return res.status(400).json({ error: err.message });
  }
};

// Delete ops member by ID
export const deleteOpsMember = async (req, res) => {
  const ip = getClientIp(req);
  try {
    const { userId } = req.params;

    logEvent(
      "OpsMember",
      `Delete ops member initiated - User ID: ${userId}`,
      req.user?._id,
      ip
    );

    const opsMember = await OpsMember.findOne({ user: userId });

    if (!opsMember) {
      logEvent(
        "OpsMember",
        `Delete ops member failed - User ID ${userId} not found`,
        req.user?._id,
        ip
      );
      return res.status(404).json({ error: "OpsMember not found" });
    }

    const opsMemberId = opsMember._id;
    await User.findByIdAndDelete(opsMember.user);
    await OpsMember.findByIdAndDelete(opsMemberId);

    logEvent(
      "OpsMember",
      `Ops member deleted successfully - OpsMember ID: ${opsMemberId}, User ID: ${userId}`,
      req.user?._id,
      ip
    );

    return res.json({ message: "OpsMember and associated user deleted" });
  } catch (err) {
    logEvent(
      "OpsMember",
      `Delete ops member error - User ID: ${req.params?.userId}, Error: ${err.message}`,
      req.user?._id,
      ip
    );
    return res.status(500).json({ error: err.message });
  }
};
