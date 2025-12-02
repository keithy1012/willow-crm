import Appointment from "../../models/appointments/Appointment.js";
import Availability from "../../models/doctors/Availability.js";
import Doctor from "../../models/doctors/Doctor.js";
import Patient from "../../models/patients/Patient.js";
import {
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
  sendDocumentNotification,
  sendEmail,
} from "../../utils/emailService.js";

// Helper functions
const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (time) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Book an appointment
export const bookAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      patientId,
      date,
      startTime,
      endTime,
      summary,
      notes,
      symptoms,
      duration,
      isEmergency,
      patientEmail,
      doctorEmail,
    } = req.body;

    console.log("Booking appointment with data:", req.body);

    // Validate doctor and patient exist
    const [doctor, patient] = await Promise.all([
      Doctor.findById(doctorId).populate("user"),
      Patient.findById(patientId).populate("user"),
    ]);

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Parse the date properly to handle timezone
    const [year, month, day] = date.split("-").map(Number);
    const appointmentDate = new Date(year, month - 1, day, 12, 0, 0);

    // Create date range for querying
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59);

    const dayOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][appointmentDate.getDay()];

    // Check if slot is available
    let availability = await Availability.findOne({
      doctor: doctorId,
      type: "Single",
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      isActive: true,
    });

    // If no single date, check recurring
    if (!availability) {
      const blockingEntry = await Availability.findOne({
        doctor: doctorId,
        type: "Single",
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        isActive: true,
        timeSlots: { $size: 0 },
      });

      if (!blockingEntry) {
        availability = await Availability.findOne({
          doctor: doctorId,
          type: "Recurring",
          dayOfWeek: dayOfWeek,
          isActive: true,
        });
      }
    }

    if (!availability) {
      return res.status(400).json({
        error: "Doctor is not available on this date",
      });
    }

    // Helper function to check if a time is within a range
    const isTimeWithinRange = (timeStart, timeEnd, rangeStart, rangeEnd) => {
      const [startHour, startMin] = timeStart.split(":").map(Number);
      const [endHour, endMin] = timeEnd.split(":").map(Number);
      const [rangeStartHour, rangeStartMin] = rangeStart.split(":").map(Number);
      const [rangeEndHour, rangeEndMin] = rangeEnd.split(":").map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const rangeStartMinutes = rangeStartHour * 60 + rangeStartMin;
      const rangeEndMinutes = rangeEndHour * 60 + rangeEndMin;

      return startMinutes >= rangeStartMinutes && endMinutes <= rangeEndMinutes;
    };

    // Check if the requested slot falls within any available slot
    let availableSlot = null;

    for (const slot of availability.timeSlots) {
      // Skip if already booked
      if (slot.isBooked) continue;

      // Check if requested time falls within this slot
      if (isTimeWithinRange(startTime, endTime, slot.startTime, slot.endTime)) {
        availableSlot = slot;
        break;
      }
    }

    if (!availableSlot) {
      return res.status(400).json({
        error: "Time slot not available or already booked",
        requestedTime: `${startTime} - ${endTime}`,
        availableSlots: availability.timeSlots
          .filter((s) => !s.isBooked)
          .map((s) => `${s.startTime} - ${s.endTime}`),
      });
    }

    // Create the appointment with proper date/time
    const appointmentStartTime = new Date(year, month - 1, day);
    const [startHour, startMin] = startTime.split(":").map(Number);
    appointmentStartTime.setHours(startHour, startMin, 0, 0);

    const appointmentEndTime = new Date(year, month - 1, day);
    const [endHour, endMin] = endTime.split(":").map(Number);
    appointmentEndTime.setHours(endHour, endMin, 0, 0);

    const appointment = new Appointment({
      patientID: patientId,
      doctorID: doctorId,
      summary: summary || "Medical Consultation",
      startTime: appointmentStartTime,
      endTime: appointmentEndTime,
      status: "Scheduled",
      notes: notes || "",
      symptoms: symptoms || [],
    });

    await appointment.save();

    // Handle slot booking based on whether it's a large block or exact match
    if (
      availableSlot.startTime === startTime &&
      availableSlot.endTime === endTime
    ) {
      // Exact match - mark as booked
      availableSlot.isBooked = true;
      availableSlot.appointmentId = appointment._id;
    } else {
      // The slot is a larger block, need to split it
      const slotIndex = availability.timeSlots.indexOf(availableSlot);
      const newSlots = [];

      // Add slots before the booked time
      const [slotStartHour, slotStartMin] = availableSlot.startTime
        .split(":")
        .map(Number);
      const [bookStartHour, bookStartMin] = startTime.split(":").map(Number);

      if (
        slotStartHour < bookStartHour ||
        (slotStartHour === bookStartHour && slotStartMin < bookStartMin)
      ) {
        newSlots.push({
          startTime: availableSlot.startTime,
          endTime: startTime,
          isBooked: false,
        });
      }

      // Add the booked slot
      newSlots.push({
        startTime: startTime,
        endTime: endTime,
        isBooked: true,
        appointmentId: appointment._id,
      });

      // Add slots after the booked time
      const [slotEndHour, slotEndMin] = availableSlot.endTime
        .split(":")
        .map(Number);
      const [bookEndHour, bookEndMin] = endTime.split(":").map(Number);

      if (
        bookEndHour < slotEndHour ||
        (bookEndHour === slotEndHour && bookEndMin < slotEndMin)
      ) {
        newSlots.push({
          startTime: endTime,
          endTime: availableSlot.endTime,
          isBooked: false,
        });
      }

      // Replace the original slot with the new split slots
      availability.timeSlots.splice(slotIndex, 1, ...newSlots);
    }

    await availability.save();

    // If this was a recurring availability, create a single date entry
    if (availability.type === "Recurring") {
      const singleDateAvailability = await Availability.findOne({
        doctor: doctorId,
        type: "Single",
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        isActive: true,
      });

      if (!singleDateAvailability) {
        // Copy all time slots from recurring and apply the booking
        const newTimeSlots = availability.timeSlots.map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          isBooked: slot.isBooked,
          appointmentId: slot.appointmentId,
        }));

        const singleEntry = new Availability({
          doctor: doctorId,
          type: "Single",
          date: appointmentDate,
          timeSlots: newTimeSlots,
          isActive: true,
          createdBy: req.user?._id,
        });

        await singleEntry.save();
      }
    }

    // Send confirmation email
    try {
      const finalPatientEmail = patientEmail || patient.user.email;
      const finalDoctorEmail = doctorEmail || doctor.user.email;

      console.log("Sending confirmation email to:", finalPatientEmail);

      await sendAppointmentConfirmation({
        patientEmail: finalPatientEmail,
        patientName: `${patient.user.firstName} ${patient.user.lastName}`,
        doctorName: `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`,
        appointmentDate: formatDate(appointmentStartTime),
        appointmentTime: `${formatTime(startTime)} - ${formatTime(endTime)}`,
        appointmentId: appointment._id.toString(),
        summary: summary || "Medical Consultation",
        notes: notes || "",
        symptoms: symptoms || [],
      });

      console.log("Confirmation email sent successfully");
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Continue even if email fails - appointment is still booked
    }

    // Populate for response
    await appointment.populate([
      {
        path: "doctorID",
        populate: { path: "user", select: "firstName lastName email" },
      },
      {
        path: "patientID",
        populate: { path: "user", select: "firstName lastName email" },
      },
    ]);

    return res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
      emailSent: true, // Indicate email was attempted
    });
  } catch (err) {
    console.error("Booking error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Cancel an appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Find and update availability slot
    const date = new Date(appointment.startTime);
    const startTime = date.toTimeString().slice(0, 5);

    const dayOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][date.getDay()];

    // Try single date first
    let availability = await Availability.findOne({
      doctor: appointment.doctorID,
      type: "Single",
      date: new Date(date.toDateString()),
      "timeSlots.appointmentId": appointment._id,
    });

    // If not found, try recurring
    if (!availability) {
      availability = await Availability.findOne({
        doctor: appointment.doctorID,
        type: "Recurring",
        dayOfWeek: dayOfWeek,
        "timeSlots.appointmentId": appointment._id,
      });
    }

    if (availability) {
      const slot = availability.timeSlots.find(
        (s) => s.appointmentId?.toString() === appointment._id.toString()
      );
      if (slot) {
        slot.isBooked = false;
        slot.appointmentId = undefined;
        await availability.save();
      }
    }

    // Update appointment status
    appointment.status = "Cancelled";
    await appointment.save();

    return res.json({
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get appointments for a doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date, status } = req.query;

    let query = { doctorID: doctorId };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      query.startTime = { $gte: startDate, $lte: endDate };
    }

    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: "patientID",
        populate: {
          path: "user",
          select: "firstName lastName email phoneNumber",
        },
      })
      .sort({ startTime: 1 });

    return res.json(appointments);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get appointments for a patient
export const getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { upcoming } = req.query;

    let query = { patientID: patientId };

    if (upcoming === "true") {
      query.startTime = { $gte: new Date() };
      query.status = { $in: ["Scheduled", "In-Progress"] };
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: "doctorID",
        populate: { path: "user", select: "firstName lastName email" },
      })
      .sort({ startTime: 1 });

    return res.json(appointments);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "Scheduled",
      "Completed",
      "Cancelled",
      "No-Show",
      "In-Progress",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    ).populate([
      {
        path: "doctorID",
        populate: { path: "user", select: "firstName lastName" },
      },
      {
        path: "patientID",
        populate: { path: "user", select: "firstName lastName" },
      },
    ]);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    return res.json({
      message: "Appointment status updated",
      appointment,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get appointment by ID
// Updated getAppointmentById to include document info but not the full base64 data by default
export const getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { includeDocuments } = req.query; // Optional query param to include full documents

    let appointment;

    if (includeDocuments === "true") {
      // Include full document data (base64)
      appointment = await Appointment.findById(appointmentId)
        .select("+afterVisitSummary +notesAndInstructions")
        .populate([
          {
            path: "doctorID",
            populate: {
              path: "user",
              select: "firstName lastName email phoneNumber",
            },
          },
          {
            path: "patientID",
            populate: {
              path: "user",
              select: "firstName lastName email phoneNumber gender",
            },
          },
        ]);
    } else {
      // Default: include document metadata but not the actual base64 data
      appointment = await Appointment.findById(appointmentId).populate([
        {
          path: "doctorID",
          populate: {
            path: "user",
            select: "firstName lastName email phoneNumber",
          },
        },
        {
          path: "patientID",
          populate: {
            path: "user",
            select:
              "firstName lastName email phoneNumber gender allergies medicalHistory",
          },
        },
      ]);
    }

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Add flags to indicate if documents exist
    const appointmentData = appointment.toObject();
    appointmentData.hasAfterVisitSummary = !!appointment.afterVisitSummaryName;
    appointmentData.hasNotesAndInstructions =
      !!appointment.notesAndInstructionsName;

    return res.json(appointmentData);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Send notification when document is uploaded
export const notifyPatientOfDocument = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const {
      documentType,
      patientEmail,
      patientName,
      doctorName,
      appointmentDate,
    } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: "patientID",
        populate: { path: "user", select: "firstName lastName email" },
      })
      .populate({
        path: "doctorID",
        populate: { path: "user", select: "firstName lastName" },
      });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const finalPatientEmail = patientEmail || appointment.patientID.user.email;
    const finalPatientName =
      patientName ||
      `${appointment.patientID.user.firstName} ${appointment.patientID.user.lastName}`;
    const finalDoctorName =
      doctorName ||
      `Dr. ${appointment.doctorID.user.firstName} ${appointment.doctorID.user.lastName}`;
    const finalAppointmentDate =
      appointmentDate || new Date(appointment.startTime).toLocaleDateString();

    await sendDocumentNotification({
      patientEmail: finalPatientEmail,
      patientName: finalPatientName,
      doctorName: finalDoctorName,
      appointmentDate: finalAppointmentDate,
      appointmentId: appointmentId,
      documentType: documentType,
    });
    return res.json({
      message: "Notification sent successfully",
      sentTo: finalPatientEmail,
    });
  } catch (err) {
    console.error("Error sending notification:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Fixed updateAppointmentDocuments function for your appointmentController.js
export const updateAppointmentDocuments = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const {
      afterVisitSummary,
      afterVisitSummaryName,
      afterVisitSummaryUploadDate,
      notesAndInstructions,
      notesAndInstructionsName,
      notesAndInstructionsUploadDate,
    } = req.body;

    // Need to explicitly select the document fields since they have select: false
    const appointment = await Appointment.findById(appointmentId).select(
      "+afterVisitSummary +notesAndInstructions"
    );

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Update appointment with documents
    if (afterVisitSummary !== undefined) {
      appointment.afterVisitSummary = afterVisitSummary;
      appointment.afterVisitSummaryName =
        afterVisitSummaryName || "after_visit_summary.pdf";
      appointment.afterVisitSummaryUploadDate =
        afterVisitSummaryUploadDate || new Date();
    }

    if (notesAndInstructions !== undefined) {
      appointment.notesAndInstructions = notesAndInstructions;
      appointment.notesAndInstructionsName =
        notesAndInstructionsName || "notes_and_instructions.pdf";
      appointment.notesAndInstructionsUploadDate =
        notesAndInstructionsUploadDate || new Date();
    }

    await appointment.save();

    // Return response without the large base64 data
    const response = {
      message: "Documents uploaded successfully",
      appointment: {
        _id: appointment._id,
        appointmentID: appointment.appointmentID,
        hasAfterVisitSummary: !!appointment.afterVisitSummary,
        hasNotesAndInstructions: !!appointment.notesAndInstructions,
        afterVisitSummaryName: appointment.afterVisitSummaryName,
        afterVisitSummaryUploadDate: appointment.afterVisitSummaryUploadDate,
        notesAndInstructionsName: appointment.notesAndInstructionsName,
        notesAndInstructionsUploadDate:
          appointment.notesAndInstructionsUploadDate,
      },
    };

    return res.json(response);
  } catch (err) {
    console.error("Error updating documents:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Also fix getAppointmentDocuments to properly select the fields
export const getAppointmentDocuments = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { includeData } = req.query; // Optional query param to include base64 data

    let appointment;

    if (includeData === "true") {
      // Include the actual base64 data
      appointment = await Appointment.findById(appointmentId).select(
        "+afterVisitSummary +notesAndInstructions afterVisitSummaryName afterVisitSummaryUploadDate notesAndInstructionsName notesAndInstructionsUploadDate"
      );
    } else {
      // Just get metadata
      appointment = await Appointment.findById(appointmentId).select(
        "afterVisitSummaryName afterVisitSummaryUploadDate notesAndInstructionsName notesAndInstructionsUploadDate"
      );
    }

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const response = {
      hasAfterVisitSummary: !!appointment.afterVisitSummaryName,
      hasNotesAndInstructions: !!appointment.notesAndInstructionsName,
      afterVisitSummaryName: appointment.afterVisitSummaryName,
      afterVisitSummaryUploadDate: appointment.afterVisitSummaryUploadDate,
      notesAndInstructionsName: appointment.notesAndInstructionsName,
      notesAndInstructionsUploadDate:
        appointment.notesAndInstructionsUploadDate,
    };

    if (includeData === "true" && appointment.afterVisitSummary) {
      response.afterVisitSummary = appointment.afterVisitSummary;
    }

    if (includeData === "true" && appointment.notesAndInstructions) {
      response.notesAndInstructions = appointment.notesAndInstructions;
    }

    return res.json(response);
  } catch (err) {
    console.error("Error getting documents:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Fix downloadDocument to properly select the document field
export const downloadDocument = async (req, res) => {
  try {
    const { appointmentId, documentType } = req.params;

    if (!["afterVisitSummary", "notesAndInstructions"].includes(documentType)) {
      return res.status(400).json({ error: "Invalid document type" });
    }

    // Need to explicitly select the document field since it has select: false
    const appointment = await Appointment.findById(appointmentId).select(
      `+${documentType} ${documentType}Name`
    );

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (!appointment[documentType]) {
      return res.status(404).json({ error: "Document not found" });
    }

    return res.json({
      document: appointment[documentType],
      filename: appointment[`${documentType}Name`] || `${documentType}.pdf`,
    });
  } catch (err) {
    console.error("Error downloading document:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const cancelAppointmentWithReason = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { reason, cancelledBy } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: "patientID",
        populate: { path: "user" },
      })
      .populate({
        path: "doctorID",
        populate: { path: "user" },
      });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Update appointment status
    appointment.status = "Cancelled";
    appointment.cancellationReason = reason;
    appointment.cancelledBy = cancelledBy;
    appointment.cancelledAt = new Date();
    await appointment.save();

    // Get patient and doctor details
    const patient = appointment.patientID;
    const doctor = appointment.doctorID;
    const patientUser = patient.user;
    const doctorUser = doctor.user;

    const appointmentDate = formatDate(new Date(appointment.startTime));
    const appointmentTime = new Date(appointment.startTime).toLocaleTimeString(
      "en-US",
      { hour: "numeric", minute: "2-digit" }
    );

    // Send email to the other party
    const recipientEmail =
      cancelledBy === "patient" ? doctorUser.email : patientUser.email;
    const recipientName =
      cancelledBy === "patient"
        ? `Dr. ${doctorUser.firstName} ${doctorUser.lastName}`
        : `${patientUser.firstName} ${patientUser.lastName}`;
    const cancellerName =
      cancelledBy === "patient"
        ? `${patientUser.firstName} ${patientUser.lastName}`
        : `Dr. ${doctorUser.firstName} ${doctorUser.lastName}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #5B7B9D 0%, #6886AC 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Appointment Cancelled</h1>
        </div>
        
        <div style="background-color: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            Dear ${recipientName},
          </p>
          
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            ${cancellerName} has cancelled the following appointment:
          </p>

          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0; color: #555;"><strong>Date:</strong> ${appointmentDate}</p>
            <p style="margin: 10px 0; color: #555;"><strong>Time:</strong> ${appointmentTime}</p>
            <p style="margin: 10px 0; color: #555;"><strong>Type:</strong> ${
              appointment.summary || "Medical Consultation"
            }</p>
          </div>

          <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>Reason:</strong></p>
            <p style="margin: 10px 0 0 0; color: #92400e;">${reason}</p>
          </div>

          ${
            cancelledBy === "patient"
              ? `<p style="font-size: 14px; color: #666; margin-top: 20px;">
                  If you need to reschedule, please contact the patient or use the Willow CRM portal.
                </p>`
              : `<p style="font-size: 14px; color: #666; margin-top: 20px;">
                  If you would like to reschedule, please book another appointment through the Willow CRM portal.
                </p>`
          }
        </div>

        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            This is an automated message from Willow CRM. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    // Use the imported sendEmail function instead of transporter directly
    await sendEmail({
      to: recipientEmail,
      subject: `Appointment Cancelled - ${appointmentDate}`,
      html,
    });

    res.status(200).json({
      success: true,
      message: "Appointment cancelled and notification sent",
      appointment,
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      error: error.message,
    });
  }
};

// Mark appointment as no-show with reason and email notification
export const markNoShowWithReason = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: "patientID",
        populate: { path: "user" },
      })
      .populate({
        path: "doctorID",
        populate: { path: "user" },
      });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Update appointment status
    appointment.status = "No-Show";
    appointment.noShowReason = reason;
    appointment.markedNoShowAt = new Date();
    await appointment.save();

    // Get patient and doctor details
    const patient = appointment.patientID;
    const doctor = appointment.doctorID;
    const patientUser = patient.user;
    const doctorUser = doctor.user;

    const appointmentDate = formatDate(new Date(appointment.startTime));
    const appointmentTime = new Date(appointment.startTime).toLocaleTimeString(
      "en-US",
      { hour: "numeric", minute: "2-digit" }
    );

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #5B7B9D 0%, #6886AC 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Missed Appointment</h1>
        </div>
        
        <div style="background-color: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            Dear ${patientUser.firstName} ${patientUser.lastName},
          </p>
          
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            We noticed you missed your scheduled appointment with Dr. ${
              doctorUser.firstName
            } ${doctorUser.lastName}.
          </p>

          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0; color: #555;"><strong>Date:</strong> ${appointmentDate}</p>
            <p style="margin: 10px 0; color: #555;"><strong>Time:</strong> ${appointmentTime}</p>
            <p style="margin: 10px 0; color: #555;"><strong>Type:</strong> ${
              appointment.summary || "Medical Consultation"
            }</p>
          </div>

          <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>Reason Recorded:</strong></p>
            <p style="margin: 10px 0 0 0; color: #92400e;">${reason}</p>
          </div>

          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            If you need to reschedule, please book another appointment through the Willow CRM portal or contact our office.
          </p>

          <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; color: #991b1b; font-size: 13px;">
              <strong>Important:</strong> Multiple no-shows may affect your ability to schedule future appointments.
            </p>
          </div>
        </div>

        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            This is an automated message from Willow CRM. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    // Send the email
    await sendEmail({
      to: patientUser.email,
      subject: `Missed Appointment - ${appointmentDate}`,
      html,
    });

    // Return a response (this was missing!)
    res.status(200).json({
      success: true,
      message: "Appointment marked as no-show and notification sent",
      appointment,
    });
  } catch (error) {
    console.error("Error marking no-show:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark as no-show",
      error: error.message,
    });
  }
};
