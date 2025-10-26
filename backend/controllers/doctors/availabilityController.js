import Availability from "../../models/doctors/Availability.js";
import Doctor from "../../models/doctors/Doctor.js";

export const createRecurringAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { weeklySchedule } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const createdAvailabilities = [];

    for (const availabilityData of weeklySchedule) {
      // Check if this already exists
      const existing = await Availability.findOne({
        doctor: doctorId,
        type: "Recurring",
        dayOfWeek: availabilityData.dayOfWeek,
        isActive: true,
      });

      if (existing) {
        // Update existing with new time slots
        existing.timeSlots = availabilityData.timeSlots;
        existing.updatedBy = req.user?._id;
        await existing.save();
        createdAvailabilities.push(existing);
      } else {
        // Create new
        const availability = new Availability({
          doctor: doctorId,
          type: "Recurring",
          dayOfWeek: availabilityData.dayOfWeek,
          timeSlots: availabilityData.timeSlots,
          createdBy: req.user?._id,
        });
        await availability.save();
        createdAvailabilities.push(availability);
      }
    }

    return res.status(201).json({
      message: "Availability created",
      availabilities: createdAvailabilities,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// Set availability for a specific date (overrides recurring for that date)
export const setDateAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date, timeSlots } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Deactivate any existing availability for this specific date
    await Availability.updateMany(
      {
        doctor: doctorId,
        type: "Single",
        date: new Date(date),
      },
      { isActive: false }
    );

    // If no time slots provided, doctor is unavailable for this date
    if (!timeSlots || timeSlots.length === 0) {
      return res.json({
        message: "Doctor marked as unavailable for this date",
        date: date,
      });
    }

    // Create new availability for this date
    const availability = new Availability({
      doctor: doctorId,
      type: "Single",
      date: new Date(date),
      timeSlots: timeSlots,
      isActive: true,
      createdBy: req.user?._id,
    });

    await availability.save();

    return res.status(201).json({
      message: "Date availability set successfully",
      availability,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// Remove all availability for a specific date
export const removeAvailabilityForDate = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.body;

    // Create a "single" availability entry with no time slots
    // This overrides any recurring availability for this date
    await Availability.updateMany(
      {
        doctor: doctorId,
        type: "single",
        date: new Date(date),
      },
      { isActive: false }
    );

    // Create an empty availability to block this date
    const blockedDate = new Availability({
      doctor: doctorId,
      type: "Single",
      date: new Date(date),
      timeSlots: [], // Empty means unavailable
      isActive: true,
      createdBy: req.user?._id,
    });

    await blockedDate.save();

    return res.json({
      message: "Availability removed for date",
      date: date,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// Remove a specific time slot
export const removeTimeSlot = async (req, res) => {
  try {
    const { availabilityId, slotIndex } = req.params;

    const availability = await Availability.findById(availabilityId);
    if (!availability) {
      return res.status(404).json({ error: "Availability not found" });
    }

    // Remove the time slot at the specified index
    availability.timeSlots.splice(slotIndex, 1);
    availability.updatedBy = req.user?._id;

    await availability.save();

    return res.json({
      message: "Time slot removed successfully",
      availability,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// Get doctor's availability for a specific date
export const getDoctorAvailabilityForDate = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    const [year, month, day] = date.split("-").map(Number);
    const requestedDate = new Date(year, month - 1, day);

    const dayOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][requestedDate.getDay()];

    // check for single date availability
    const singleDateAvail = await Availability.findOne({
      doctor: doctorId,
      type: "Single",
      date: requestedDate,
      isActive: true,
    });

    if (singleDateAvail) {
      // If found but has no time slots, doctor is unavailable
      if (singleDateAvail.timeSlots.length === 0) {
        return res.json({
          date: date,
          dayOfWeek: dayOfWeek,
          available: false,
          timeSlots: [],
        });
      }

      return res.json({
        date: date,
        dayOfWeek: dayOfWeek,
        available: true,
        type: "Single",
        timeSlots: singleDateAvail.timeSlots.filter((slot) => !slot.isBooked),
      });
    }

    // If no single date override, check recurring availability
    const recurringAvail = await Availability.findOne({
      doctor: doctorId,
      type: "Recurring",
      dayOfWeek: dayOfWeek,
      isActive: true,
    });

    if (recurringAvail) {
      return res.json({
        date: date,
        dayOfWeek: dayOfWeek,
        available: true,
        type: "Recurring",
        timeSlots: recurringAvail.timeSlots.filter((slot) => !slot.isBooked),
      });
    }

    // No availability found
    return res.json({
      date: date,
      dayOfWeek: dayOfWeek,
      available: false,
      timeSlots: [],
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Search doctors available on a specific date and optionally at a specific time
export const searchDoctorsByDateTime = async (req, res) => {
  try {
    const { date, name } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    const [year, month, day] = date.split("-").map(Number);
    const requestedDate = new Date(year, month - 1, day);

    const dayOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][requestedDate.getDay()];

    // Build the search pipeline
    let availableDoctors = [];

    // 1. Find all single date availabilities for this specific date
    const singleDateAvails = await Availability.find({
      type: "Single",
      date: requestedDate,
      isActive: true,
      "timeSlots.0": { $exists: true }, // Has at least one time slot
    }).populate({
      path: "doctor",
      populate: {
        path: "user",
        select: "firstName lastName email phoneNumber profilePic",
      },
    });

    // 2. Find all recurring availabilities for this day of week
    const recurringAvails = await Availability.find({
      type: "Recurring",
      dayOfWeek: dayOfWeek,
      isActive: true,
    }).populate({
      path: "doctor",
      populate: {
        path: "user",
        select: "firstName lastName email phoneNumber profilePic",
      },
    });

    // Track which doctors we've already added (single date takes priority)
    const doctorMap = new Map();

    // Process single date availabilities first (higher priority)
    for (const avail of singleDateAvails) {
      if (!avail.doctor) continue;

      let availableSlots = avail.timeSlots.filter((slot) => !slot.isBooked);

      if (availableSlots.length > 0) {
        const doctorId = avail.doctor._id.toString();
        doctorMap.set(doctorId, {
          doctor: avail.doctor,
          availabilityType: "Single",
          timeSlots: availableSlots,
        });
      }
    }

    // Process recurring availabilities (only if doctor not already in map)
    for (const avail of recurringAvails) {
      if (!avail.doctor) continue;

      const doctorId = avail.doctor._id.toString();

      // Skip if this doctor already has a single date entry
      if (doctorMap.has(doctorId)) continue;

      // Check if doctor has a blocking entry for this date
      const hasBlockingEntry = await Availability.findOne({
        doctor: doctorId,
        type: "Single",
        date: requestedDate,
        isActive: true,
        timeSlots: { $size: 0 }, // Empty slots means blocked
      });

      if (hasBlockingEntry) continue;

      let availableSlots = avail.timeSlots.filter((slot) => !slot.isBooked);

      // Filter by time if specified
      if (availableSlots.length > 0) {
        doctorMap.set(doctorId, {
          doctor: avail.doctor,
          availabilityType: "Recurring",
          timeSlots: availableSlots,
        });
      }
    }

    availableDoctors = Array.from(doctorMap.values());

    // Filter by name if provided
    if (name) {
      const searchTerm = name.toLowerCase();
      availableDoctors = availableDoctors.filter((item) => {
        const fullName =
          `${item.doctor.user.firstName} ${item.doctor.user.lastName}`.toLowerCase();
        const firstName = item.doctor.user.firstName.toLowerCase();
        const lastName = item.doctor.user.lastName.toLowerCase();

        return (
          fullName.includes(searchTerm) ||
          firstName.includes(searchTerm) ||
          lastName.includes(searchTerm)
        );
      });
    }

    return res.json({
      date: date,
      dayOfWeek: dayOfWeek,
      nameFilter: name || "none",
      count: availableDoctors.length,
      doctors: availableDoctors,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
