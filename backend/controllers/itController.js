import ITMember from "../models/ITMember";

// Create new IT member
export const createITMember = async (req, res) => {
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
        role: "IT",
    };
    const user = new User(userData);
    const savedUser = await user.save();
    const itMember = new ITMember({ user: savedUser._id });
    const savedITMember = await itMember.save();
    res.status(201).json(savedITMember);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all IT members
export const getAllITMembers = async (req, res) => {
  try {
    const itMembers = await ITMember.find().populate('user', '-password');
    res.status(200).json(itMembers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get IT member by ID
export const getITMemberById = async (req, res) => {
  try {
    const itMember = await ITMember.findById(req.params.id).populate('user', '-password');
    if (!itMember) {
      return res.status(404).json({ message: "IT member not found" });
    }
    res.status(200).json(itMember);
    } catch (error) {
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
    res.status(200).json({ message: "IT member updated successfully" });
  } catch (error) {
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
    res.status(500).json({ message: "Server error", error });
  }
};

