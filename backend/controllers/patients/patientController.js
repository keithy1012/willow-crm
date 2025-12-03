import dotenv from "dotenv";
dotenv.config();

import Patient from "../../models/patients/Patient.js";
import User from "../../models/users/User.js";
import EmergencyContact from "../../models/patients/EmergencyContact.js";
import { generateToken } from "../../middleware/authentication.js";
import { logEvent, getClientIp } from "../../utils/logger.js";

// Create new patient
export const createPatient = async (req, res) => {
  const ip = getClientIp(req);
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

    logEvent(
      "Patient",
      `Create patient initiated - Email: ${email}, Username: ${username}, Name: ${firstName} ${lastName}`,
      "N/A",
      ip
    );

    // Function to save base64 image as Buffer
    const convertBase64ToBuffer = (base64String) => {
      if (!base64String) return null;
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
      gender: sex,
      password,
      phoneNumber: phone,
      profilePic,
      role: "Patient",
    });

    await newUser.save();
    logEvent(
      "Patient",
      `User account created - User ID: ${newUser._id}, Email: ${email}`,
      newUser._id,
      ip
    );

    // Create emergency contact
    const emergencyContact = await EmergencyContact.create({
      name: ec_name,
      phoneNumber: ec_phone,
      relationship: ec_relationship,
    });
    logEvent(
      "Patient",
      `Emergency contact created - EC ID: ${emergencyContact._id}, Name: ${ec_name}, Relationship: ${ec_relationship}`,
      newUser._id,
      ip
    );

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

    logEvent(
      "Patient",
      `Patient created successfully - Patient ID: ${newPatient._id}, User ID: ${newUser._id}, Email: ${email}, Name: ${firstName} ${lastName}, Blood Type: ${bloodtype}`,
      newUser._id,
      ip
    );

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
    logEvent(
      "Patient",
      `Create patient error - Email: ${req.body?.email}, Error: ${error.message}`,
      "N/A",
      ip
    );
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Get all patients
export const getAllPatients = async (req, res) => {
  const ip = getClientIp(req);
  try {
    logEvent("Patient", "Get all patients initiated", req.user?._id, ip);

    const patients = await Patient.find()
      .populate(
        "user",
        "firstName lastName email username gender phoneNumber profilePic role"
      )
      .populate("emergencyContact", "name phoneNumber relationship");

    logEvent(
      "Patient",
      `All patients retrieved - Count: ${patients.length}`,
      req.user?._id,
      ip
    );

    res.status(200).json(patients);
  } catch (err) {
    logEvent(
      "Patient",
      `Get all patients error - Error: ${err.message}`,
      req.user?._id,
      ip
    );
    res.status(500).json({ error: err.message });
  }
};

// Get single patient by user ID
export const getPatientById = async (req, res) => {
  const ip = getClientIp(req);
  try {
    const userId = req.params.id || req.params.userId;

    logEvent(
      "Patient",
      `Get patient by user ID initiated - User ID: ${userId}`,
      req.user?._id,
      ip
    );

    const patient = await Patient.findOne({ user: userId }).populate([
      {
        path: "user",
        select:
          "firstName lastName email username gender phoneNumber profilePic role",
      },
      { path: "emergencyContact", select: "name phoneNumber relationship" },
    ]);

    if (!patient) {
      logEvent(
        "Patient",
        `Get patient failed - User ID ${userId} not found`,
        req.user?._id,
        ip
      );
      return res.status(404).json({ error: "Patient not found" });
    }

    logEvent(
      "Patient",
      `Patient retrieved - Patient ID: ${patient._id}, User ID: ${userId}, Email: ${patient.user?.email}`,
      req.user?._id,
      ip
    );

    res.status(200).json(patient);
  } catch (err) {
    logEvent(
      "Patient",
      `Get patient error - User ID: ${
        req.params?.id || req.params?.userId
      }, Error: ${err.message}`,
      req.user?._id,
      ip
    );
    res.status(500).json({ error: err.message });
  }
};

// Update patient by user ID
export const updatePatient = async (req, res) => {
  const ip = getClientIp(req);
  try {
    const userId = req.params.id || req.params.userId;

    logEvent(
      "Patient",
      `Update patient initiated - User ID: ${userId}, Updates: ${JSON.stringify(
        req.body
      )}`,
      req.user?._id,
      ip
    );

    const updatedPatient = await Patient.findOneAndUpdate(
      { user: userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPatient) {
      logEvent(
        "Patient",
        `Update patient failed - User ID ${userId} not found`,
        req.user?._id,
        ip
      );
      return res.status(404).json({ error: "Patient not found" });
    }

    logEvent(
      "Patient",
      `Patient updated successfully - Patient ID: ${updatedPatient._id}, User ID: ${userId}`,
      req.user?._id,
      ip
    );

    res.status(200).json(updatedPatient);
  } catch (err) {
    logEvent(
      "Patient",
      `Update patient error - User ID: ${
        req.params?.id || req.params?.userId
      }, Error: ${err.message}`,
      req.user?._id,
      ip
    );
    res.status(400).json({ error: err.message });
  }
};

// Delete patient by user ID
export const deletePatient = async (req, res) => {
  const ip = getClientIp(req);
  try {
    const userId = req.params.id || req.params.userId;

    logEvent(
      "Patient",
      `Delete patient initiated - User ID: ${userId}`,
      req.user?._id,
      ip
    );

    const deletedPatient = await Patient.findOneAndDelete({ user: userId });

    if (!deletedPatient) {
      logEvent(
        "Patient",
        `Delete patient failed - User ID ${userId} not found`,
        req.user?._id,
        ip
      );
      return res.status(404).json({ error: "Patient not found" });
    }

    const patientId = deletedPatient._id;

    // Delete associated user and emergency contact
    await User.findByIdAndDelete(deletedPatient.user);
    await EmergencyContact.findByIdAndDelete(deletedPatient.emergencyContact);

    logEvent(
      "Patient",
      `Patient deleted successfully - Patient ID: ${patientId}, User ID: ${userId}, Associated user and emergency contact also deleted`,
      req.user?._id,
      ip
    );

    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (err) {
    logEvent(
      "Patient",
      `Delete patient error - User ID: ${
        req.params?.id || req.params?.userId
      }, Error: ${err.message}`,
      req.user?._id,
      ip
    );
    res.status(500).json({ error: err.message });
  }
};

// Get insurance card images by user ID
export const getInsuranceCards = async (req, res) => {
  const ip = getClientIp(req);
  try {
    const { id } = req.params;

    logEvent(
      "Patient",
      `Get insurance cards initiated - User ID: ${id}`,
      req.user?._id,
      ip
    );

    // Find patient by user ID
    const patient = await Patient.findOne({ user: id });

    if (!patient) {
      logEvent(
        "Patient",
        `Get insurance cards failed - User ID ${id} not found`,
        req.user?._id,
        ip
      );
      return res.status(404).json({ error: "Patient not found" });
    }

    const insuranceCardFront = patient.insuranceCardFront
      ? `data:image/png;base64,${patient.insuranceCardFront.toString("base64")}`
      : null;

    const insuranceCardBack = patient.insuranceCardBack
      ? `data:image/png;base64,${patient.insuranceCardBack.toString("base64")}`
      : null;

    logEvent(
      "Patient",
      `Insurance cards retrieved - Patient ID: ${
        patient._id
      }, User ID: ${id}, Has Front: ${!!insuranceCardFront}, Has Back: ${!!insuranceCardBack}`,
      req.user?._id,
      ip
    );

    res.json({
      success: true,
      insuranceCardFront,
      insuranceCardBack,
    });
  } catch (err) {
    logEvent(
      "Patient",
      `Get insurance cards error - User ID: ${req.params?.id}, Error: ${err.message}`,
      req.user?._id,
      ip
    );
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
};

// Search patients by name
export const searchPatientsByName = async (req, res) => {
  const ip = getClientIp(req);
  try {
    const { name } = req.query;
    logEvent(
      "Patient",
      `Search patients by name initiated - Search term: ${name}`,
      req.user?._id,
      ip
    );

    if (!name) {
      logEvent(
        "Patient",
        "Search patients failed - Name parameter is required",
        req.user?._id,
        ip
      );
      return res.status(400).json({ error: "Name parameter is required" });
    }

    // Find all patients and populate user info
    const patients = await Patient.find()
      .populate("user", "firstName lastName email phoneNumber profilePic")
      .lean();
    // Filter by name
    const filteredPatients = patients.filter((patient) => {
      if (!patient.user) return false;
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
    logEvent(
      "Patient",
      `Search patients completed - Search term: ${name}, Results: ${filteredPatients.length}`,
      req.user?._id,
      ip
    );

    return res.json({
      searchTerm: name,
      count: filteredPatients.length,
      patients: filteredPatients,
    });
  } catch (err) {
    logEvent(
      "Patient",
      `Search patients error - Search term: ${req.query?.name}, Error: ${err.message}`,
      req.user?._id,
      ip
    );
    return res.status(500).json({ error: err.message });
  }
};

// Get single patient by patient ID (not user ID)
export const getPatientByPatientId = async (req, res) => {
  const ip = getClientIp(req);
  try {
    const patientId = req.params.id;

    logEvent(
      "Patient",
      `Get patient by patient ID initiated - Patient ID: ${patientId}`,
      req.user?._id,
      ip
    );

    const patient = await Patient.findById(patientId).populate([
      {
        path: "user",
        select:
          "firstName lastName email username gender phoneNumber profilePic role",
      },
      { path: "emergencyContact", select: "name phoneNumber relationship" },
    ]);

    if (!patient) {
      logEvent(
        "Patient",
        `Get patient failed - Patient ID ${patientId} not found`,
        req.user?._id,
        ip
      );
      return res.status(404).json({ error: "Patient not found" });
    }

    logEvent(
      "Patient",
      `Patient retrieved by patient ID - Patient ID: ${patientId}, User ID: ${patient.user?._id}, Email: ${patient.user?.email}`,
      req.user?._id,
      ip
    );

    res.status(200).json(patient);
  } catch (err) {
    logEvent(
      "Patient",
      `Get patient by patient ID error - Patient ID: ${req.params?.id}, Error: ${err.message}`,
      req.user?._id,
      ip
    );
    res.status(500).json({ error: err.message });
  }
};
