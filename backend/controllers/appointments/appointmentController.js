import Appointment from "../../models/Appointment.js";
import Availability from "../../models/doctors/Availability.js";
import Doctor from "../../models/doctors/Doctor.js";
import Patient from "../../models/patients/Patient.js";

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
    } = req.body;

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
    const appointmentDate = new Date(year, month - 1, day, 12, 0, 0); // Set to noon

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
    // First check for single date availability
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
      // Check if there's a blocking entry (empty slots)
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
        // No blocking entry, check recurring
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

    // Find the specific time slot
    const timeSlot = availability.timeSlots.find(
      (slot) => slot.startTime === startTime && slot.endTime === endTime
    );

    if (!timeSlot) {
      return res.status(400).json({
        error: "Time slot not found",
      });
    }

    if (timeSlot.isBooked) {
      return res.status(400).json({
        error: "Time slot is already booked",
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
    });

    await appointment.save();

    // Mark time slot as booked
    timeSlot.isBooked = true;
    timeSlot.appointmentId = appointment._id;
    await availability.save();

    // If this was a recurring availability, we might need to create a single date entry
    // to properly track this specific booking
    if (availability.type === "Recurring") {
      // Create a single date entry for this specific date with the booking
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
        // Copy all time slots from recurring and mark this one as booked
        const newTimeSlots = availability.timeSlots.map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          isBooked:
            slot.startTime === startTime && slot.endTime === endTime
              ? true
              : false,
          appointmentId:
            slot.startTime === startTime && slot.endTime === endTime
              ? appointment._id
              : undefined,
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
      await sendAppointmentConfirmation({
        patientEmail: patient.user.email,
        patientName: `${patient.user.firstName} ${patient.user.lastName}`,
        doctorName: `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`,
        appointmentDate: formatDate(appointmentStartTime),
        appointmentTime: `${formatTime(startTime)} - ${formatTime(endTime)}`,
        appointmentId: appointment.appointmentID,
        summary: summary || "Medical Consultation",
        notes: notes,
        symptoms: symptoms,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Continue even if email fails
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
    });
  } catch (err) {
    console.error("Booking error:", err);
    return res.status(500).json({ error: err.message });
  }
};

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
    const startTime = date.toTimeString().slice(0, 5); // Get HH:MM format

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
