import Medorder from "../../models/medications/MedOrder.js";
import Patient from "../../models/patients/Patient.js";
import Doctor from "../../models/doctors/Doctor.js";
import nodemailer from "nodemailer";
import { logEvent } from "../../utils/logger.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Create a new medication order
export const createMedorder = async (req, res) => {
  try {
    const {
      patientID,
      doctorID,
      medicationName,
      dosage,
      instruction,
      recurringEvery,
      duration,
      quantity,
      refillCount,
    } = req.body;
    logEvent(
      "Medorder",
      `Create medication order initiated - Patient: ${patientID}, Doctor: ${doctorID}, Medication: ${medicationName}`,
      req.user?._id
    );
    // Validate required fields
    if (!patientID || !doctorID || !medicationName || !instruction) {
      logEvent(
        "Medorder",
        `Create medication order failed - Missing required fields`,
        req.user?._id
      );
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Verify patient exists
    const patient = await Patient.findById(patientID);
    if (!patient) {
      logEvent(
        "Medorder",
        `Create medication order failed - Patient ${patientID} not found`,
        req.user?._id
      );
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorID);
    if (!doctor) {
      logEvent(
        "Medorder",
        `Create medication order failed - Doctor ${doctorID} not found`,
        req.user?._id
      );
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Create the medication order
    const newMedorder = new Medorder({
      patientID,
      doctorID,
      prescribedOn: new Date(),
      medicationName,
      dosage,
      instruction,
      recurringEvery: recurringEvery || "",
      duration: duration || "",
      quantity: quantity || "",
      refillCount: refillCount || 0,
    });

    await newMedorder.save();

    // Populate patient and doctor details
    await newMedorder.populate("patientID", "name email");
    await newMedorder.populate("doctorID", "name email specialty");

    logEvent(
      "Medorder",
      `Medication order created successfully - Order ID: ${
        newMedorder.orderID
      }, Medication: ${medicationName}, Patient: ${patientID}, Doctor: ${doctorID}, Dosage: ${dosage}, Refills: ${
        refillCount || 0
      }`,
      req.user?._id
    );
    res.status(201).json({
      success: true,
      message: "Medication order created successfully",
      medorder: newMedorder,
    });
  } catch (error) {
    logEvent(
      "Medorder",
      `Create medication order error - Patient: ${req.body?.patientID}, Error: ${error.message}`,
      req.user?._id
    );
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all medication orders for a patient
export const getMedordersByPatient = async (req, res) => {
  try {
    const { patientID } = req.params;
    logEvent(
      "Medorder",
      `Get medication orders by patient initiated - Patient: ${patientID}`,
      req.user?._id
    );
    const medorders = await Medorder.find({ patientID })
      .populate("doctorID", "name email specialty")
      .sort({ prescribedOn: -1 });
    logEvent(
      "Medorder",
      `Get medication orders by patient initiated - Patient: ${patientID}`,
      req.user?._id
    );
    res.status(200).json({
      success: true,
      medorders,
    });
  } catch (error) {
    logEvent(
      "Medorder",
      `Get medication orders by patient error - Patient: ${req.params?.patientID}, Error: ${error.message}`,
      req.user?._id
    );
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all medication orders prescribed by a doctor
export const getMedordersByDoctor = async (req, res) => {
  try {
    const { doctorID } = req.params;
    logEvent(
      "Medorder",
      `Get medication orders by doctor initiated - Doctor: ${doctorID}`,
      req.user?._id
    );
    const medorders = await Medorder.find({ doctorID })
      .populate("patientID", "name email dateOfBirth")
      .sort({ prescribedOn: -1 });
    logEvent(
      "Medorder",
      `Medication orders retrieved for doctor - Doctor: ${doctorID}, Count: ${medorders.length}`,
      req.user?._id
    );
    res.status(200).json({
      success: true,
      medorders,
    });
  } catch (error) {
    logEvent(
      "Medorder",
      `Get medication orders by doctor error - Doctor: ${req.params?.doctorID}, Error: ${error.message}`,
      req.user?._id
    );
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get a single medication order by ID
export const getMedorderById = async (req, res) => {
  try {
    const { orderID } = req.params;

    logEvent(
      "Medorder",
      `Get medication order by ID initiated - Order: ${orderID}`,
      req.user?._id
    );
    const medorder = await Medorder.findOne({ orderID })
      .populate("patientID", "name email dateOfBirth")
      .populate("doctorID", "name email specialty");

    if (!medorder) {
      logEvent(
        "Medorder",
        `Get medication order failed - Order ${orderID} not found`,
        req.user?._id
      );
      return res.status(404).json({
        success: false,
        message: "Medication order not found",
      });
    }

    logEvent(
      "Medorder",
      `Medication order retrieved - Order: ${orderID}, Medication: ${medorder.medicationName}, Patient: ${medorder.patientID?._id}`,
      req.user?._id
    );
    res.status(200).json({
      success: true,
      medorder,
    });
  } catch (error) {
    logEvent(
      "Medorder",
      `Get medication order error - Order: ${req.params?.orderID}, Error: ${error.message}`,
      req.user?._id
    );
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update a medication order (e.g., for refills)
export const updateMedorder = async (req, res) => {
  try {
    const { orderID } = req.params;
    const updates = req.body;

    logEvent(
      "Medorder",
      `Update medication order initiated - Order: ${orderID}, Updates: ${JSON.stringify(
        updates
      )}`,
      req.user?._id
    );
    const medorder = await Medorder.findOneAndUpdate(
      { orderID },
      { ...updates },
      { new: true, runValidators: true }
    )
      .populate("patientID", "name email")
      .populate("doctorID", "name email specialty");

    if (!medorder) {
      logEvent(
        "Medorder",
        `Update medication order failed - Order ${orderID} not found`,
        req.user?._id
      );
      return res.status(404).json({
        success: false,
        message: "Medication order not found",
      });
    }

    logEvent(
      "Medorder",
      `Medication order updated successfully - Order: ${orderID}, Medication: ${medorder.medicationName}`,
      req.user?._id
    );
    res.status(200).json({
      success: true,
      message: "Medication order updated successfully",
      medorder,
    });
  } catch (error) {
    logEvent(
      "Medorder",
      `Update medication order error - Order: ${req.params?.orderID}, Error: ${error.message}`,
      req.user?._id
    );
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Process a refill
export const processRefill = async (req, res) => {
  try {
    const { orderID } = req.params;
    logEvent(
      "Medorder",
      `Process refill initiated - Order: ${orderID}`,
      req.user?._id
    );
    const medorder = await Medorder.findOne({ orderID });

    if (!medorder) {
      logEvent(
        "Medorder",
        `Process refill failed - Order ${orderID} not found`,
        req.user?._id
      );
      return res.status(404).json({
        success: false,
        message: "Medication order not found",
      });
    }

    if (medorder.refillCount <= 0) {
      logEvent(
        "Medorder",
        `Process refill failed - Order ${orderID} has no refills remaining`,
        req.user?._id
      );
      return res.status(400).json({
        success: false,
        message: "No refills remaining",
      });
    }

    medorder.refillCount -= 1;
    medorder.lastRefillDate = new Date();
    await medorder.save();

    await medorder.populate("patientID", "name email");
    await medorder.populate("doctorID", "name email specialty");

    logEvent(
      "Medorder",
      `Refill processed successfully - Order: ${orderID}, Medication: ${medorder.medicationName}, Previous Refills: ${previousRefillCount}, Remaining Refills: ${medorder.refillCount}`,
      req.user?._id
    );
    res.status(200).json({
      success: true,
      message: "Refill processed successfully",
      medorder,
    });
  } catch (error) {
    logEvent(
      "Medorder",
      `Process refill error - Order: ${req.params?.orderID}, Error: ${error.message}`,
      req.user?._id
    );
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete a medication order
export const deleteMedorder = async (req, res) => {
  try {
    const { orderID } = req.params;
    logEvent(
      "Medorder",
      `Delete medication order initiated - Order: ${orderID}`,
      req.user?._id
    );
    const medorder = await Medorder.findOneAndDelete({ orderID });

    if (!medorder) {
      logEvent(
        "Medorder",
        `Delete medication order failed - Order ${orderID} not found`,
        req.user?._id
      );
      return res.status(404).json({
        success: false,
        message: "Medication order not found",
      });
    }

    logEvent(
      "Medorder",
      `Medication order deleted successfully - Order: ${orderID}, Medication: ${medorder.medicationName}, Patient: ${medorder.patientID}`,
      req.user?._id
    );
    res.status(200).json({
      success: true,
      message: "Medication order deleted successfully",
    });
  } catch (error) {
    logEvent(
      "Medorder",
      `Delete medication order error - Order: ${req.params?.orderID}, Error: ${error.message}`,
      req.user?._id
    );
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const sendRefillRequest = async (req, res) => {
  try {
    const {
      medicationName,
      patientName,
      patientEmail,
      quantity,
      pharmacy,
      lastRefillDate,
    } = req.body;

    logEvent(
      "Medorder",
      `Send refill request initiated - Patient: ${patientName}, Medication: ${medicationName}, Pharmacy: ${pharmacy}`,
      req.user?._id
    );
    // Email to Willow CRM
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: "willowcrm@example.com", // Replace with your admin email
      subject: `Medication Refill Request - ${patientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5B7B9D;">Medication Refill Request</h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Patient Information</h3>
            <p><strong>Name:</strong> ${patientName}</p>
            <p><strong>Email:</strong> ${patientEmail}</p>
          </div>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Medication Details</h3>
            <p><strong>Medication:</strong> ${medicationName}</p>
            <p><strong>Quantity:</strong> ${quantity}</p>
            <p><strong>Pharmacy:</strong> ${pharmacy}</p>
            ${
              lastRefillDate
                ? `<p><strong>Last Refill:</strong> ${new Date(
                    lastRefillDate
                  ).toLocaleDateString()}</p>`
                : ""
            }
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              This is an automated refill request from the Willow CRM patient portal.
            </p>
          </div>
        </div>
      `,
    };

    // Confirmation email to patient
    const patientMailOptions = {
      from: process.env.EMAIL_USER,
      to: patientEmail,
      subject: `Refill Request Confirmation - ${medicationName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5B7B9D;">Refill Request Confirmed</h2>
          
          <p>Hi ${patientName},</p>
          
          <p>We've received your refill request for <strong>${medicationName}</strong> and have sent it to ${pharmacy}.</p>

          <div style="background-color: #e8f4f8; padding: 15px; border-left: 4px solid #5B7B9D; margin: 20px 0;">
            <p style="margin: 0;"><strong>What happens next?</strong></p>
            <ul style="margin: 10px 0;">
              <li>Your pharmacy will process the request within 1-2 business days</li>
              <li>You'll receive a notification when your refill is ready for pickup</li>
              <li>If there are any issues, the pharmacy will contact you directly</li>
            </ul>
          </div>

          <p>If you have any questions, please contact:</p>
          <ul>
            <li><strong>Pharmacy:</strong> (555) 123-4567</li>
            <li><strong>Provider's Office:</strong> (555) 987-6543</li>
          </ul>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              This is an automated message from Willow CRM. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    };

    // Send both emails
    await transporter.sendMail(adminMailOptions);
    logEvent(
      "Medorder",
      `Admin refill request email sent - Patient: ${patientName}, Medication: ${medicationName}`,
      req.user?._id
    );

    await transporter.sendMail(patientMailOptions);
    logEvent(
      "Medorder",
      `Patient refill confirmation email sent - Patient: ${patientName}, Email: ${patientEmail}, Medication: ${medicationName}`,
      req.user?._id
    );

    logEvent(
      "Medorder",
      `Refill request sent successfully - Patient: ${patientName}, Medication: ${medicationName}, Quantity: ${quantity}, Pharmacy: ${pharmacy}`,
      req.user?._id
    );
    res.status(200).json({
      success: true,
      message: "Refill request sent successfully",
    });
  } catch (error) {
    logEvent(
      "Medorder",
      `Send refill request error - Patient: ${req.body?.patientName}, Medication: ${req.body?.medicationName}, Error: ${error.message}`,
      req.user?._id
    );
    res.status(500).json({
      success: false,
      message: "Failed to send refill request",
      error: error.message,
    });
  }
};
