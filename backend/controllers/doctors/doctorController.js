import Doctor from "../../models/doctors/Doctor.js";
import User from "../../models/users/User.js";
import { logEvent, getClientIp } from "../../utils/logger.js";

export const createDoctor = async (req, res) => {
  const ip = getClientIp(req);
  try {
    const { email, username, firstName, lastName, speciality } = req.body;

    logEvent(
      "Doctor",
      `Doctor creation initiated - Email: ${email}, Username: ${username}, Name: ${firstName} ${lastName}, Speciality: ${speciality}`,
      req.user?._id,
      ip
    );

    // Step 1: Create the User directly
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      username: req.username,
      gender: req.body.gender,
      password: req.body.password, // hashed by pre-save hook if you have one
      phoneNumber: req.body.phoneNumber,
      profilePic: req.body.profilePic,
      role: "Doctor",
    });

    const savedUser = await user.save();
    logEvent(
      "Doctor",
      `User created for doctor - User ID: ${savedUser._id}, Email: ${savedUser.email}`,
      savedUser._id,
      ip
    );

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

    logEvent(
      "Doctor",
      `Doctor profile created successfully - Doctor ID: ${savedDoctor._id}, User ID: ${savedUser._id}, Speciality: ${savedDoctor.speciality}`,
      savedUser._id,
      ip
    );
    res.status(201).json({
      success: true,
      message: "Doctor profile and user account created successfully",
      user: savedUser,
      doctor: savedDoctor,
    });
  } catch (error) {
    logEvent(
      "Doctor",
      `Doctor creation error - Email: ${req.body?.email}, Error: ${error.message}`,
      req.user?._id,
      ip
    );
    res.status(500).json({ error: "Internal server error" });
  }
};

// search doctors by name only
export const searchDoctorsByName = async (req, res) => {
  const ip = getClientIp(req);
  try {
    const { name } = req.query;

    if (!name) {
      logEvent(
        "Doctor",
        "Search by name failed - Name parameter missing",
        req.user?._id,
        ip
      );
      return res.status(400).json({ error: "Name parameter is required" });
    }
    logEvent(
      "Doctor",
      `Search by name initiated - Search term: ${name}`,
      req.user?._id,
      ip
    );

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

    logEvent(
      "Doctor",
      `Search by name completed - Search term: ${name}, Results: ${result.length}`,
      req.user?._id,
      ip
    );
    return res.json({
      searchTerm: name,
      count: result.length,
      doctors: result,
    });
  } catch (err) {
    logEvent(
      "Doctor",
      `Search by name error - Search term: ${req.query?.name}, Error: ${err.message}`,
      req.user?._id,
      ip
    );
    return res.status(500).json({ error: err.message });
  }
};

// Get All Doctors
export const getAllDoctors = async (req, res) => {
  const ip = getClientIp(req);
  try {
    logEvent("Doctor", "Get all doctors initiated", req.user?._id, ip);

    const doctors = await Doctor.find().populate(
      "user",
      "firstName lastName email username gender phoneNumber profilePic"
    );

    logEvent(
      "Doctor",
      `All doctors retrieved - Count: ${doctors.length}`,
      req.user?._id,
      ip
    );

    return res.json(doctors);
  } catch (err) {
    logEvent(
      "Doctor",
      `Get all doctors error - Error: ${err.message}`,
      req.user?._id,
      ip
    );
    return res.status(500).json({ error: err.message });
  }
};

// Get all doctors by speciality
export const getDoctorsBySpeciality = async (req, res) => {
  const ip = getClientIp(req);
  try {
    const { speciality } = req.params;

    logEvent(
      "Doctor",
      `Get doctors by speciality - Speciality: ${speciality}`,
      req.user?._id,
      ip
    );

    const doctors = await Doctor.find({
      speciality: speciality,
    }).populate(
      "user",
      "firstName lastName email username gender phoneNumber profilePic role"
    );

    if (!doctors || doctors.length === 0) {
      logEvent(
        "Doctor",
        `No doctors found for speciality - Speciality: ${speciality}`,
        req.user?._id,
        ip
      );
      return res
        .status(404)
        .json({ error: "No doctors found for this speciality" });
    }
    logEvent(
      "Doctor",
      `Doctors by speciality retrieved - Speciality: ${speciality}, Count: ${doctors.length}`,
      req.user?._id,
      ip
    );
    return res.json(doctors);
  } catch (err) {
    logEvent(
      "Doctor",
      `Get doctors by speciality error - Speciality: ${req.params?.speciality}, Error: ${err.message}`,
      req.user?._id,
      ip
    );
    return res.status(500).json({ error: err.message });
  }
};

// Creates a Doctor from the Doctor Acocunt Creation Ticket
// Creates a Doctor from the Doctor Account Creation Ticket
export const createDoctorFromData = async (
  doctorData,
  ip = null,
  userId = null
) => {
  try {
    logEvent(
      "Doctor",
      `Doctor creation from data initiated - Email: ${doctorData.email}, Username: ${doctorData.username}`,
      userId,
      ip
    );

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
    logEvent(
      "Doctor",
      `User created from data - User ID: ${savedUser._id}, Email: ${savedUser.email}`,
      savedUser._id,
      ip
    );

    const doctor = new Doctor({
      user: savedUser._id,
      bioContent: doctorData.bioContent,
      education: doctorData.education,
      graduationDate: doctorData.graduationDate,
      speciality: doctorData.speciality,
      availability: doctorData.availability,
    });

    const savedDoctor = await doctor.save();
    logEvent(
      "Doctor",
      `Doctor created from data - Doctor ID: ${savedDoctor._id}, User ID: ${savedUser._id}, Speciality: ${savedDoctor.speciality}`,
      savedUser._id,
      ip
    );

    return { savedUser, savedDoctor };
  } catch (error) {
    logEvent(
      "Doctor",
      `Doctor creation from data error - Email: ${doctorData?.email}, Error: ${error.message}`,
      userId,
      ip
    );
    throw error; // Re-throw so the caller can handle it
  }
};

// backend/controllers/doctors/doctorController.js
export const getDoctorByUserId = async (req, res) => {
  const ip = getClientIp(req);
  try {
    const { userId } = req.params;
    logEvent(
      "Doctor",
      `Get doctor by user ID - User ID: ${userId}`,
      req.user?._id,
      ip
    );

    // Find doctor by user reference and populate user data
    let doctor = await Doctor.findOne({ user: userId }).populate("user");

    // If no doctor record exists, create one
    if (!doctor) {
      logEvent(
        "Doctor",
        `Doctor profile not found, checking user - User ID: ${userId}`,
        req.user?._id,
        ip
      );
      const user = await User.findById(userId);
      if (!user || user.role !== "Doctor") {
        logEvent(
          "Doctor",
          `Get doctor by user ID failed - User ${userId} is not a doctor or not found`,
          req.user?._id,
          ip
        );
        return res.status(404).json({ error: "User is not a doctor" });
      }
      logEvent(
        "Doctor",
        `Creating doctor profile for existing user - User ID: ${userId}`,
        userId,
        ip
      );

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
      logEvent(
        "Doctor",
        `Doctor profile auto-created - Doctor ID: ${doctor._id}, User ID: ${userId}, Default speciality: General Practice`,
        userId,
        ip
      );
    } else {
      logEvent(
        "Doctor",
        `Doctor profile found - Doctor ID: ${doctor._id}, User ID: ${userId}, Speciality: ${doctor.speciality}`,
        userId,
        ip
      );
    }

    return res.json(doctor);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
