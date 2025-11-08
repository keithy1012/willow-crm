import Patient from "../../models/patients/Patient.js";
import User from "../../models/users/User.js";
import EmergencyContact from "../../models/patients/EmergencyContact.js";

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
      const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
      return Buffer.from(base64Data, 'base64');
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
      emergencyContact: emergencyContact._id,
      insuranceCardFront: frontBuffer,
      insuranceCardBack: backBuffer,
    });

    res.status(201).json({
      success: true,
      message:
        "Patient, linked user, and emergency contact created successfully",
      user: newUser,
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
    const patients = await Patient.find().populate(
      "user",
      "firstName lastName email username gender phoneNumber profilePic role"
    );
    res.status(200).json(patients);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get single patient by user ID
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.params.userId }).populate(
      "user",
      "firstName lastName email username gender phoneNumber profilePic role"
    );
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
    const updatedPatient = await Patient.findOneAndUpdate(
      { user: req.params.userId },
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
    const deletedPatient = await Patient.findOneAndDelete({
      user: req.params.userId,
    });

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
