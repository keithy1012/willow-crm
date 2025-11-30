import dotenv from "dotenv";
dotenv.config();

import Patient from "../../models/patients/Patient.js";
import User from "../../models/users/User.js";
import EmergencyContact from "../../models/patients/EmergencyContact.js";
import { generateToken } from "../../middleware/authentication.js";

// Create new patient
export const createPatient = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      username,
      sex,
      password,
      phone,
      profilePic,
      ec_name,
      ec_phone,
      ec_relationship,
      birthdate,
      address,
      bloodtype,
      allergies,
      medicalHistory,
      insuranceCardFront,
      insuranceCardBack,
    } = req.body;

    // Function to save base64 image as Buffer
    const convertBase64ToBuffer = (base64String) => {
      if (!base64String) return null;
      // Remove the data URL prefix (data:image/png;base64,)
      const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
      return Buffer.from(base64Data, "base64");
    };

    // Convert insurance card images to Buffer
    const frontBuffer = convertBase64ToBuffer(insuranceCardFront);
    const backBuffer = convertBase64ToBuffer(insuranceCardBack);

    // Create user directly
    const newUser = new User({
      firstName,
      lastName,
      email,
      username,
      gender: sex, // Frontend sends 'sex', backend expects 'gender'
      password,
      phoneNumber: phone, // Frontend sends 'phone', backend expects 'phoneNumber'
      profilePic,
      role: "Patient",
    });

    await newUser.save();

    // Create emergency contact
    const emergencyContact = await EmergencyContact.create({
      name: ec_name,
      phoneNumber: ec_phone,
      relationship: ec_relationship,
    });

    // Create patient linked to user and emergency contact
    const newPatient = await Patient.create({
      user: newUser._id,
      birthday: birthdate,
      address,
      bloodtype,
      allergies,
      medicalHistory,
      emergencyContact: [emergencyContact._id],
      insuranceCardFront: frontBuffer,
      insuranceCardBack: backBuffer,
    });

    // Generate JWT token for authentication
    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      message:
        "Patient, linked user, and emergency contact created successfully",
      token,
      user: newUser.toJSON(),
      patient: newPatient,
      emergencyContact,
    });
  } catch (error) {
    console.error("Error creating patient:", error.message);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Get all patients
export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate(
        "user",
        "firstName lastName email username gender phoneNumber profilePic role"
      )
      .populate("emergencyContact", "name phoneNumber relationship");
    res.status(200).json(patients);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get single patient by user ID
export const getPatientById = async (req, res) => {
  try {
    const userId = req.params.id || req.params.userId;
    const patient = await Patient.findOne({ user: userId }).populate([
      {
        path: "user",
        select:
          "firstName lastName email username gender phoneNumber profilePic role",
      },
      { path: "emergencyContact", select: "name phoneNumber relationship" },
    ]);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.status(200).json(patient);
  } catch (err) {
    console.error("Error fetching patient:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update patient by user ID
export const updatePatient = async (req, res) => {
  try {
    const userId = req.params.id || req.params.userId;
    const updatedPatient = await Patient.findOneAndUpdate(
      { user: userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPatient)
      return res.status(404).json({ error: "Patient not found" });
    res.status(200).json(updatedPatient);
  } catch (err) {
    console.error("Error updating patient:", err);
    res.status(400).json({ error: err.message });
  }
};

// Delete patient by user ID
export const deletePatient = async (req, res) => {
  try {
    const userId = req.params.id || req.params.userId;
    const deletedPatient = await Patient.findOneAndDelete({ user: userId });

    if (!deletedPatient)
      return res.status(404).json({ error: "Patient not found" });

    // Delete associated user and emergency contact
    await User.findByIdAndDelete(deletedPatient.user);
    await EmergencyContact.findByIdAndDelete(deletedPatient.emergencyContact);

    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (err) {
    console.error("Error deleting patient:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get insurance card images by user ID
export const getInsuranceCards = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Fetching insurance cards for user ID:", id);

    // Find patient by user ID
    const patient = await Patient.findOne({ user: id });

    if (!patient) {
      console.log("No patient found for user ID:", id);
      return res.status(404).json({ error: "Patient not found" });
    }

    console.log("Patient found:", patient._id);
    console.log("Has front card:", !!patient.insuranceCardFront);
    console.log("Has back card:", !!patient.insuranceCardBack);

    // Convert buffers to base64 strings if they exist
    const insuranceCardFront = patient.insuranceCardFront
      ? `data:image/png;base64,${patient.insuranceCardFront.toString("base64")}`
      : null;

    const insuranceCardBack = patient.insuranceCardBack
      ? `data:image/png;base64,${patient.insuranceCardBack.toString("base64")}`
      : null;

    res.json({
      success: true,
      insuranceCardFront,
      insuranceCardBack,
    });
  } catch (err) {
    console.error("Error fetching insurance cards:", err.message);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
};

// Search patients by name
export const searchPatientsByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: "Name parameter is required" });
    }

    // Find all patients and populate user info
    const patients = await Patient.find()
      .populate("user", "firstName lastName email phoneNumber profilePic")
      .lean();

    // Filter by name
    const filteredPatients = patients.filter((patient) => {
      const fullName =
        `${patient.user.firstName} ${patient.user.lastName}`.toLowerCase();
      const firstName = patient.user.firstName.toLowerCase();
      const lastName = patient.user.lastName.toLowerCase();
      const searchTerm = name.toLowerCase();

      return (
        fullName.includes(searchTerm) ||
        firstName.includes(searchTerm) ||
        lastName.includes(searchTerm)
      );
    });

    return res.json({
      searchTerm: name,
      count: filteredPatients.length,
      patients: filteredPatients,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get single patient by patient ID (not user ID)
export const getPatientByPatientId = async (req, res) => {
  try {
    const patientId = req.params.id;
    const patient = await Patient.findById(patientId).populate([
      {
        path: "user",
        select:
          "firstName lastName email username gender phoneNumber profilePic role",
      },
      { path: "emergencyContact", select: "name phoneNumber relationship" },
    ]);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.status(200).json(patient);
  } catch (err) {
    console.error("Error fetching patient:", err);
    res.status(500).json({ error: err.message });
  }
};
