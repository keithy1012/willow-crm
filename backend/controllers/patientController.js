// controllers/patientController.js
import Patient from "../models/Patient.js";
import User from "../models/User.js";
// Create new patient
export const createPatient = async (req, res) => {
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
      role: "Patient",
    };
    const user = new User(userData);
    const savedUser = await user.save();
  
    const patientData = {
      user: savedUser._id, // link Patient → User
      birthday: req.body.birthday,
      address: req.body.address,
      bloodtype: req.body.bloodtype,
      allergies: req.body.allergies,
      medicalHistory: req.body.medicalHistory,
      emergencyContact: req.body.emergencyContact,
    };

    const patient = new Patient(patientData);
    const savedPatient = await patient.save();
    return res.status(201).json({
      user: savedUser,
      patient: savedPatient,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// Get all patients
export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().populate(
      "user",
      "firstName lastName email username gender phoneNumber profilePic role"
    );
    return res.json(patients);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get single patient by ID
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.params.userId }).populate(
      "user",
      "firstName lastName email username gender phoneNumber profilePic role"
    );
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    return res.json(patient);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Update patient by ID
export const updatePatient = async (req, res) => {
  try {
    const updatedPatient = await Patient.findOneAndUpdate(
      { user: req.params.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPatient) return res.status(404).json({ error: "Patient not found" });
    return res.json(updatedPatient);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// Delete patient by ID
export const deletePatient = async (req, res) => {
  try {
    const deletedPatient = await Patient.findOneAndDelete({ user: req.params.userId });

    if (!deletedPatient) return res.status(404).json({ error: "Patient not found" });
    return res.json({ message: "Patient deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
