// controllers/doctorController.js
import Doctor from "../../models/doctors/Doctor.js";
import User from "../../models/users/User.js";
import Availability from "../../models/doctors/Availability.js";

export const createDoctor = async (req, res) => {
  try {
    // Step 1: Create the User directly
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      username: req.body.username,
      gender: req.body.gender,
      password: req.body.password, // hashed by pre-save hook if you have one
      phoneNumber: req.body.phoneNumber,
      profilePic: req.body.profilePic,
      role: "Doctor",
    });

    const savedUser = await user.save();

    // Step 2: Create the Doctor entry and link to the user
    const doctor = new Doctor({
      user: savedUser._id,
      bioContent: req.body.bioContent,
      education: req.body.education,
      graduationDate: req.body.graduationDate,
      speciality: req.body.speciality,
      availability: req.body.availability || [],
    });

    const savedDoctor = await doctor.save();

    res.status(201).json({
      success: true,
      message: "Doctor profile and user account created successfully",
      user: savedUser,
      doctor: savedDoctor,
    });
  } catch (error) {
    console.error("Error creating doctor:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// search doctors by name only
export const searchDoctorsByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: "Name parameter is required" });
    }

    // Find all doctors and populate user info
    const doctors = await Doctor.find()
      .populate("user", "firstName lastName email phoneNumber profilePic")
      .populate("availability");

    const filteredDoctors = doctors.filter((doctor) => {
      const fullName =
        `${doctor.user.firstName} ${doctor.user.lastName}`.toLowerCase();
      const firstName = doctor.user.firstName.toLowerCase();
      const lastName = doctor.user.lastName.toLowerCase();
      const searchTerm = name.toLowerCase();
      return (
        fullName.includes(searchTerm) ||
        firstName.includes(searchTerm) ||
        lastName.includes(searchTerm)
      );
    });

    const result = filteredDoctors.map((doctor) => ({
      _id: doctor._id,
      user: doctor.user,
      bioContent: doctor.bioContent,
      education: doctor.education,
      graduationDate: doctor.graduationDate,
      speciality: doctor.speciality,
    }));

    return res.json({
      searchTerm: name,
      count: result.length,
      doctors: result,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get All Doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate(
      "user",
      "firstName lastName email username gender phoneNumber profilePic"
    );
    return res.json(doctors);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get all doctors by speciality
export const getDoctorsBySpeciality = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      speciality: req.params.speciality,
    }).populate(
      "user",
      "firstName lastName email username gender phoneNumber profilePic role"
    );

    if (!doctors || doctors.length === 0) {
      return res
        .status(404)
        .json({ error: "No doctors found for this speciality" });
    }

    return res.json(doctors);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Creates a Doctor from the Doctor Acocunt Creation Ticket
export const createDoctorFromData = async (doctorData) => {
  // Create a user entry first
  const user = new User({
    firstName: doctorData.firstName,
    lastName: doctorData.lastName,
    email: doctorData.email,
    username: doctorData.username,
    gender: doctorData.gender,
    password: doctorData.password,
    phoneNumber: doctorData.phoneNumber,
    profilePic: doctorData.profilePic,
    role: "Doctor",
  });
  const savedUser = await user.save();

  // Create the doctor entry and link to the user
  const doctor = new Doctor({
    user: savedUser._id,
    bioContent: doctorData.bioContent,
    education: doctorData.education,
    graduationDate: doctorData.graduationDate,
    speciality: doctorData.speciality,
    availability: doctorData.availability,
  });
  const savedDoctor = await doctor.save();

  return { savedUser, savedDoctor };
};

// backend/controllers/doctors/doctorController.js
export const getDoctorByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find doctor by user reference and populate user data
    let doctor = await Doctor.findOne({ user: userId }).populate("user");

    // If no doctor record exists, create one
    if (!doctor) {
      const user = await User.findById(userId);
      if (!user || user.role !== "Doctor") {
        return res.status(404).json({ error: "User is not a doctor" });
      }

      // Create doctor record matching your type
      doctor = new Doctor({
        user: userId,
        bioContent: "",
        education: "",
        graduationDate: new Date(),
        speciality: "General Practice", // Default
      });

      await doctor.save();
      await doctor.populate("user");
    }

    return res.json(doctor);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
