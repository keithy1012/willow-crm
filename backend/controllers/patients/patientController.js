// controllers/patientController.js
import Patient from "../../models/patients/Patient.js";
import User from "../../models/users/User.js"
import EmergencyContact from "../../models/patients/EmergencyContact.js"
// Create new patient
export const createPatient = async (req, res) => {
  try {
    const userPayload = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      username: req.body.username,
      gender: req.body.gender,
      password: req.body.password,
      phoneNumber: req.body.phoneNumber,
      profilePic: req.body.profilePic,
      role: "Patient",
    };

    const registerResponse = await axios.post(
      "http://localhost:5050/api/users/register",
      userPayload
    );

    if (!registerResponse.data?.user?._id) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    const userId = registerResponse.data.user._id;

    const emergencyContactData = {
      name: req.body.ec_name,
      phoneNumber: req.body.ec_phone,
      relationship: req.body.ec_relationship,
    };

    const savedContact = await EmergencyContact.create(emergencyContactData);

    const patientData = {
      user: userId,
      birthday: req.body.birthdate,
      address: req.body.address,
      bloodtype: req.body.bloodtype,
      allergies: req.body.allergies,
      medicalHistory: req.body.medicalHistory,
      emergencyContact: savedContact._id,
    };

    const savedPatient = await Patient.create(patientData);

    res.status(201).json({
      success: true,
      user: registerResponse.data.user,
      patient: savedPatient,
      emergencyContact: savedContact,
      token: registerResponse.data.token,
    });
  } catch (error) {
    console.error("Error creating Patient:", error.message);

    if (error.response?.data) {
      return res.status(error.response.status || 500).json(error.response.data);
    }

    res.status(500).json({ error: "Internal server error" });
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
