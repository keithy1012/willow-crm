// controllers/patientController.js
import Patient from "../models/Patient.js";

// Create new patient
export const createPatient = async (req, res) => {
  try {
    console.log("Creating Patient")
    const patient = new Patient(req.body);
    const savedPatient = await patient.save();
    return res.status(201).json(savedPatient);
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
    const patient = await Patient.findById(req.params.id).populate(
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
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
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
    const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
    if (!deletedPatient) return res.status(404).json({ error: "Patient not found" });
    return res.json({ message: "Patient deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
