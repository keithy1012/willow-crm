// controllers/doctorController.js
import Doctor from "../models/Doctor.js";


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
    const doctors = await Doctor.find({ speciality: req.params.speciality }).populate(
      "user",
      "firstName lastName email username gender phoneNumber profilePic role"
    );

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({ error: "No doctors found for this speciality" });
    }

    return res.json(doctors);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
