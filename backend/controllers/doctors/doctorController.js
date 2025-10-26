// controllers/doctorController.js
import Doctor from "../../models/doctors/Doctor.js";
import User from "../../models/users/User.js";
import Availability from "../../models/doctors/Availability.js";

// Create new doctor
export const createDoctor = async (req, res) => {
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
      role: "Doctor",
    };
    const user = new User(userData);
    const savedUser = await user.save();

    const doctorData = {
      user: savedUser._id, // link Doctor to User
      bioContent: req.body.bioContent,
      education: req.body.education,
      graduationDate: req.body.graduationDate,
      speciality: req.body.speciality,
      availability: req.body.availability,
    };

    const doctor = new Doctor(doctorData);
    const savedDoctor = await doctor.save();
    return res.status(201).json({
      user: savedUser,
      doctor: savedDoctor,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
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
      availability: doctor.availability,
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

// Gets all doctors that are availible on a certain day
export const getDoctorsByAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: "Date query parameter is required (e.g., ?date=2025-10-11)" });
    }

    // Convert to weekday name (e.g., "Monday")
    const dayOfWeek = new Date(date).toLocaleString("en-US", { weekday: "long" });

    // Find all availability entries for that day
    const availabilities = await Availability.find({ day: dayOfWeek })
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "firstName lastName email phoneNumber profilePic role",
        },
      });

    if (!availabilities.length) {
      return res.status(404).json({ message: `No doctors available on ${dayOfWeek}` });
    }

    // Extract doctors (avoid duplicates if they have multiple time slots)
    const uniqueDoctors = [
      ...new Map(availabilities.map((a) => [a.doctor._id.toString(), a.doctor])).values(),
    ];

    // Return the doctors and their time slots
    res.status(200).json({
      day: dayOfWeek,
      total: uniqueDoctors.length,
      doctors: uniqueDoctors,
      slots: availabilities.map((a) => ({
        doctor: a.doctor._id,
        startTime: a.startTime,
        endTime: a.endTime,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
