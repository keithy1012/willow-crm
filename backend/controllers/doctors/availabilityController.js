import Availability from "../../models/doctors/Availability.js";
import Doctor from "../../models/doctors/Doctor.js";

// Fixed setDateAvailability function
export const setDateAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date, timeSlots: requestTimeSlots } = req.body; // Rename to avoid conflict

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Helper function to add one hour
    const addOneHour = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      const newHours = hours + 1;
      return `${String(newHours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}`;
    };

    // Process the time slots to ensure they're 1-hour slots
    let processedTimeSlots = [];

    if (requestTimeSlots && requestTimeSlots.length > 0) {
      processedTimeSlots = requestTimeSlots.map((slot) => {
        // If the slot already has correct endTime, use it
        if (slot.endTime) {
          return {
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBooked: slot.isBooked || false,
          };
        } else {
          // Otherwise, calculate endTime as 1 hour after startTime
          return {
            startTime: slot.startTime,
            endTime: addOneHour(slot.startTime),
            isBooked: slot.isBooked || false,
          };
        }
      });
    }

    // Parse the date as YYYY-MM-DD and create a date at noon to avoid timezone issues
    const [year, month, day] = date.split("-").map(Number);
    const targetDate = new Date(year, month - 1, day, 12, 0, 0); // Set to noon

    // Create start and end of day for query
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59);

    // Deactivate any existing availability for this specific date
    await Availability.updateMany(
      {
        doctor: doctorId,
        type: "Single",
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      },
      { isActive: false }
    );

    // Create new availability with the date at noon to avoid timezone shifts
    const availability = new Availability({
      doctor: doctorId,
      type: "Single",
      date: targetDate,
      timeSlots: processedTimeSlots, // Use the processed slots
      isActive: true,
      createdBy: req.user?._id,
    });

    await availability.save();

    return res.status(201).json({
      message:
        processedTimeSlots.length > 0
          ? "Date availability set successfully"
          : "Date blocked successfully",
      availability,
      date: date,
    });
  } catch (err) {
    console.error("Error in setDateAvailability:", err);
    return res.status(400).json({ error: err.message });
  }
};

// Updated createRecurringAvailability to handle 1-hour slots
export const createRecurringAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { weeklySchedule } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Deactivate ALL existing recurring availabilities for this doctor
    await Availability.updateMany(
      {
        doctor: doctorId,
        type: "Recurring",
      },
      { isActive: false }
    );

    const createdAvailabilities = [];

    // Only create new ones if there are any in the schedule
    if (weeklySchedule && weeklySchedule.length > 0) {
      for (const availabilityData of weeklySchedule) {
        // Only process days that have time slots
        if (
          availabilityData.timeSlots &&
          availabilityData.timeSlots.length > 0
        ) {
          // Ensure all slots are properly formatted with endTime
          const processedSlots = availabilityData.timeSlots.map((slot) => {
            if (!slot.endTime) {
              // If no endTime, assume 1 hour duration
              const [hours, minutes] = slot.startTime.split(":").map(Number);
              const endHours = hours + 1;
              return {
                ...slot,
                endTime: `${String(endHours).padStart(2, "0")}:${String(
                  minutes
                ).padStart(2, "0")}`,
              };
            }
            return slot;
          });

          // Check if this already exists (but inactive)
          const existing = await Availability.findOne({
            doctor: doctorId,
            type: "Recurring",
            dayOfWeek: availabilityData.dayOfWeek,
          });

          if (existing) {
            // Reactivate and update existing
            existing.timeSlots = processedSlots;
            existing.isActive = true;
            existing.updatedBy = req.user?._id;
            await existing.save();
            createdAvailabilities.push(existing);
          } else {
            // Create new
            const availability = new Availability({
              doctor: doctorId,
              type: "Recurring",
              dayOfWeek: availabilityData.dayOfWeek,
              timeSlots: processedSlots,
              isActive: true,
              createdBy: req.user?._id,
            });
            await availability.save();
            createdAvailabilities.push(availability);
          }
        }
      }
    }

    return res.status(201).json({
      message:
        weeklySchedule.length === 0
          ? "All recurring availability cleared"
          : "Recurring availability updated",
      availabilities: createdAvailabilities,
    });
  } catch (err) {
    console.error("Error in createRecurringAvailability:", err);
    return res.status(400).json({ error: err.message });
  }
};

// Update getDoctorAllAvailabilities to not require authentication
export const getDoctorAllAvailabilities = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Get all active availabilities for this doctor
    const availabilities = await Availability.find({
      doctor: doctorId,
      isActive: true,
    }).sort({ type: 1, dayOfWeek: 1, date: 1 }); // Sort for consistency

    return res.json({
      availabilities: availabilities,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
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
    const requestedDate = new Date(year, month - 1, day, 12, 0, 0); // Set to noon
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
    ][requestedDate.getDay()];

    // Check for single date availability
    const singleDateAvail = await Availability.findOne({
      doctor: doctorId,
      type: "Single",
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
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
// In availabilityController.js - Complete updated searchDoctorsByDateTime function

export const searchDoctorsByDateTime = async (req, res) => {
  try {
    const { date, name } = req.query;
    console.log("Search request - Date:", date, "Name:", name);

    let dayOfWeek = null;
    let requestedDate = null;
    let startOfDay = null;
    let endOfDay = null;

    if (date) {
      const [year, month, day] = date.split("-").map(Number);
      // Create the date at noon to avoid timezone issues
      requestedDate = new Date(year, month - 1, day, 12, 0, 0);

      // Create a range for the entire day
      startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      endOfDay = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0));

      dayOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][requestedDate.getDay()];

      console.log("Searching date range:", startOfDay, "to", endOfDay);
      console.log("Day of week:", dayOfWeek);
    }

    let availableDoctors = [];

    if (!date && name) {
      // Get all doctors matching the name (no date filter)
      const allAvailabilities = await Availability.find({
        isActive: true,
      }).populate({
        path: "doctor",
        select: "user bioContent education speciality graduationDate",
        populate: {
          path: "user",
          select: "firstName lastName email phoneNumber profilePic",
        },
      });

      const doctorMap = new Map();

      for (const avail of allAvailabilities) {
        if (!avail.doctor || !avail.doctor.user) continue;

        const fullName =
          `${avail.doctor.user.firstName} ${avail.doctor.user.lastName}`.toLowerCase();
        const searchTerm = name.toLowerCase();

        if (fullName.includes(searchTerm)) {
          const doctorId = avail.doctor._id.toString();
          if (!doctorMap.has(doctorId)) {
            doctorMap.set(doctorId, {
              doctor: avail.doctor,
              availabilityType: avail.type,
              timeSlots: avail.timeSlots.filter((slot) => !slot.isBooked),
            });
          }
        }
      }

      availableDoctors = Array.from(doctorMap.values());
    } else if (date) {
      // Find single date availabilities for this date
      console.log("Searching for single date availabilities...");
      const singleDateAvails = await Availability.find({
        type: "Single",
        date: {
          $gte: startOfDay,
          $lt: endOfDay, // Use $lt with next day start instead of $lte with end of day
        },
        isActive: true,
        "timeSlots.0": { $exists: true }, // Has at least one time slot
      }).populate({
        path: "doctor",
        select: "user bioContent education speciality graduationDate",
        populate: {
          path: "user",
          select: "firstName lastName email phoneNumber profilePic",
        },
      });

      console.log(
        `Found ${singleDateAvails.length} single date availabilities`
      );

      // Find all recurring availabilities for this day of week
      const recurringAvails = await Availability.find({
        type: "Recurring",
        dayOfWeek: dayOfWeek,
        isActive: true,
      }).populate({
        path: "doctor",
        select: "user bioContent education speciality graduationDate",
        populate: {
          path: "user",
          select: "firstName lastName email phoneNumber profilePic",
        },
      });

      console.log(
        `Found ${recurringAvails.length} recurring availabilities for ${dayOfWeek}`
      );

      // Track which doctors we've already added (single date takes priority)
      const doctorMap = new Map();

      // Process single date availabilities first (higher priority)
      for (const avail of singleDateAvails) {
        if (!avail.doctor || !avail.doctor.user) {
          console.log("Skipping availability with no doctor/user");
          continue;
        }

        // Get available (non-booked) slots
        let availableSlots = avail.timeSlots.filter((slot) => !slot.isBooked);
        console.log(
          `Doctor ${avail.doctor.user.firstName} has ${availableSlots.length} available slots`
        );

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
        if (!avail.doctor || !avail.doctor.user) continue;

        const doctorId = avail.doctor._id.toString();

        // Skip if this doctor already has a single date entry
        if (doctorMap.has(doctorId)) {
          console.log(
            `Doctor ${doctorId} already has single date entry, skipping recurring`
          );
          continue;
        }

        // Check if doctor has a blocking entry for this date (empty slots)
        const hasBlockingEntry = await Availability.findOne({
          doctor: doctorId,
          type: "Single",
          date: {
            $gte: startOfDay,
            $lt: endOfDay,
          },
          isActive: true,
          timeSlots: { $size: 0 }, // Empty slots means blocked
        });

        if (hasBlockingEntry) {
          console.log(`Doctor ${doctorId} has blocking entry for this date`);
          continue;
        }

        let availableSlots = avail.timeSlots.filter((slot) => !slot.isBooked);

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
    }

    console.log(`Returning ${availableDoctors.length} available doctors`);

    return res.json({
      date: date,
      dayOfWeek: dayOfWeek,
      nameFilter: name || "none",
      count: availableDoctors.length,
      doctors: availableDoctors,
    });
  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const getDoctorAvailabilityForDateRange = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Start date and end date are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];

    // Get all recurring availabilities
    const recurringAvails = await Availability.find({
      doctor: doctorId,
      type: "Recurring",
      isActive: true,
    });

    // Get all single date availabilities in range
    const singleAvails = await Availability.find({
      doctor: doctorId,
      type: "Single",
      date: { $gte: start, $lte: end },
      isActive: true,
    });

    // Process each date in the range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      const dayOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][currentDate.getDay()];
      const dateStr = currentDate.toISOString().split("T")[0];

      // Check for single date override
      const singleOverride = singleAvails.find((sa) => {
        const saDate = new Date(sa.date);
        return saDate.toDateString() === currentDate.toDateString();
      });

      if (singleOverride) {
        dates.push({
          date: dateStr,
          available: singleOverride.timeSlots.length > 0,
          timeSlots: singleOverride.timeSlots.filter((slot) => !slot.isBooked),
        });
      } else {
        // Check recurring availability
        const recurring = recurringAvails.find(
          (ra) => ra.dayOfWeek === dayOfWeek
        );
        if (recurring) {
          dates.push({
            date: dateStr,
            available: true,
            timeSlots: recurring.timeSlots.filter((slot) => !slot.isBooked),
          });
        } else {
          dates.push({
            date: dateStr,
            available: false,
            timeSlots: [],
          });
        }
      }
    }

    return res.json({ dates });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
