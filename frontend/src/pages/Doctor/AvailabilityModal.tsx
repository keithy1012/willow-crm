import React, { useState, useEffect } from "react";
import { X, CalendarBlank, Clock, Plus, Check, Lock } from "phosphor-react";
import Calendar from "components/calendar/Calendar";
import PrimaryButton from "components/buttons/PrimaryButton";
import {
  TimeSlot,
  DayOfWeek,
  WeeklyScheduleItem,
  Availability,
} from "api/types/availability.types";
import CustomTimePicker from "components/input/CustomTimePicker";
import { availabilityService } from "api/services/availability.service";
import toast from "react-hot-toast";

interface SelectedDateAvailability {
  date: Date;
  selectedTimes: string[];
  bookedTimes: string[]; // Times that have appointments
  isFromRecurring: boolean; // Whether this date's availability comes from recurring
  existingId?: string;
  hasBeenModified?: boolean; // Track if user made changes to this date
}

interface AvailabilityModalProps {
  isOpen: boolean;
  doctorId: string;
  onClose: () => void;
  onComplete: (data: {
    type: "Recurring" | "Single";
    availabilities: Partial<Availability>[];
  }) => void;
}

const AvailabilityModal: React.FC<AvailabilityModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  doctorId,
}) => {
  const [activeTab, setActiveTab] = useState<"monthly" | "weekly">("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const [existingAvailabilities, setExistingAvailabilities] = useState<
    Availability[]
  >([]);

  // Track original state to detect changes
  const [originalWeeklySchedule, setOriginalWeeklySchedule] = useState<
    WeeklyScheduleItem[]
  >([]);
  const [originalDateAvailabilities, setOriginalDateAvailabilities] = useState<
    SelectedDateAvailability[]
  >([]);

  // Monthly availability
  const [selectedDateAvailabilities, setSelectedDateAvailabilities] = useState<
    SelectedDateAvailability[]
  >([]);
  const [currentSelectedDate, setCurrentSelectedDate] = useState<Date | null>(
    null
  );
  const [currentSelectedTimes, setCurrentSelectedTimes] = useState<string[]>(
    []
  );
  const [currentBookedTimes, setCurrentBookedTimes] = useState<string[]>([]);

  // Weekly recurring availability
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyScheduleItem[]>([
    { dayOfWeek: "Monday" as DayOfWeek, timeSlots: [] },
    { dayOfWeek: "Tuesday" as DayOfWeek, timeSlots: [] },
    { dayOfWeek: "Wednesday" as DayOfWeek, timeSlots: [] },
    { dayOfWeek: "Thursday" as DayOfWeek, timeSlots: [] },
    { dayOfWeek: "Friday" as DayOfWeek, timeSlots: [] },
    { dayOfWeek: "Saturday" as DayOfWeek, timeSlots: [] },
    { dayOfWeek: "Sunday" as DayOfWeek, timeSlots: [] },
  ]);

  const [recurringDates, setRecurringDates] = useState<Date[]>([]);

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const timeOptions = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
  ];

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentSelectedDate(null);
      setCurrentSelectedTimes([]);
      setCurrentBookedTimes([]);
    }
  }, [isOpen]);

  // Fetch existing availabilities when modal opens
  useEffect(() => {
    if (isOpen && doctorId) {
      fetchExistingAvailabilities();
    }
  }, [isOpen, doctorId]);

  const fetchExistingAvailabilities = async () => {
    setIsLoading(true);
    try {
      // Try the /all endpoint first
      const response = await availabilityService.getDoctorAvailabilities(
        doctorId
      );
      console.log("Fetched availabilities:", response);

      if (response.availabilities) {
        setExistingAvailabilities(response.availabilities);
        processExistingAvailabilities(response.availabilities);
      }
    } catch (error: any) {
      console.error(
        "Failed to fetch from /all endpoint, trying fallback:",
        error
      );

      // Fallback: Try to get availability using the date-specific endpoint
      try {
        // Get recurring availability by checking each day of the week
        const tempAvailabilities: any[] = [];
        const daysOfWeek = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];

        // Check a week's worth of dates to find recurring patterns
        const today = new Date();
        for (let i = 0; i < 7; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() + i);
          const dateStr = checkDate.toISOString().split("T")[0];

          try {
            const dayAvail = await availabilityService.getForDate(
              doctorId,
              dateStr
            );
            if (dayAvail.available && dayAvail.type === "Recurring") {
              // Add to temp availabilities if not already there
              const dayOfWeek =
                daysOfWeek[
                  checkDate.getDay() === 0 ? 6 : checkDate.getDay() - 1
                ];
              if (
                !tempAvailabilities.find(
                  (a) => a.dayOfWeek === dayOfWeek && a.type === "Recurring"
                )
              ) {
                tempAvailabilities.push({
                  type: "Recurring",
                  dayOfWeek: dayOfWeek,
                  timeSlots: dayAvail.timeSlots,
                  isActive: true,
                });
              }
            } else if (dayAvail.available && dayAvail.type === "Single") {
              tempAvailabilities.push({
                type: "Single",
                date: checkDate,
                timeSlots: dayAvail.timeSlots,
                isActive: true,
              });
            }
          } catch (dayError) {
            // Skip this day
          }
        }

        setExistingAvailabilities(tempAvailabilities);
        processExistingAvailabilities(tempAvailabilities);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        toast.error("Failed to load existing availability");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to generate time slots from a time range
  const generateTimeSlotsFromRange = (
    startTime: string,
    endTime: string
  ): string[] => {
    const slots: string[] = [];
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMin < endMin)
    ) {
      const timeStr = `${currentHour.toString().padStart(2, "0")}:${currentMin
        .toString()
        .padStart(2, "0")}`;
      if (timeOptions.includes(timeStr)) {
        slots.push(timeStr);
      }

      // Add 30 minutes
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
      }
    }

    return slots;
  };

  const processExistingAvailabilities = (availabilities: Availability[]) => {
    // Process recurring availabilities
    const recurringAvails = availabilities.filter(
      (a) => a.type === "Recurring" && a.isActive !== false
    );

    const updatedWeeklySchedule = [...weeklySchedule];

    recurringAvails.forEach((avail) => {
      const dayIndex = updatedWeeklySchedule.findIndex(
        (d) => d.dayOfWeek === avail.dayOfWeek
      );
      if (dayIndex !== -1 && avail.timeSlots) {
        updatedWeeklySchedule[dayIndex].timeSlots = avail.timeSlots;
      }
    });

    setWeeklySchedule(updatedWeeklySchedule);
    setOriginalWeeklySchedule(
      JSON.parse(JSON.stringify(updatedWeeklySchedule))
    );

    // Process dates for current viewing month
    regenerateDatesForMonth(availabilities, updatedWeeklySchedule);
  };

  const regenerateDatesForMonth = (
    availabilities: Availability[],
    weekSchedule: WeeklyScheduleItem[]
  ) => {
    const dateAvailabilities: SelectedDateAvailability[] = [];
    const viewMonth = currentMonth.getMonth();
    const viewYear = currentMonth.getFullYear();
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);

    // Keep track of explicitly blocked dates
    const blockedDates = new Set<string>();

    // First, process all single date availabilities for this month
    const singleAvails = availabilities.filter(
      (a) => a.type === "Single" && a.isActive !== false
    );

    singleAvails.forEach((avail) => {
      if (avail.date) {
        // Parse the date as local, not UTC
        const date =
          typeof avail.date === "string"
            ? parseLocalDate(avail.date.split("T")[0])
            : new Date(avail.date);

        // Only process if it's in the current viewing month
        if (date >= firstDay && date <= lastDay) {
          const dateKey = date.toDateString();

          // Check if this is a blocked date (no time slots)
          if (!avail.timeSlots || avail.timeSlots.length === 0) {
            // This date is explicitly blocked
            blockedDates.add(dateKey);
            // Don't add to dateAvailabilities - this date has no availability
          } else {
            // Process time slots normally
            let times: string[] = [];
            let bookedTimes: string[] = [];

            avail.timeSlots.forEach((slot) => {
              if (
                slot.startTime &&
                slot.endTime &&
                slot.startTime !== slot.endTime
              ) {
                const slotsFromRange = generateTimeSlotsFromRange(
                  slot.startTime,
                  slot.endTime
                );
                if (slot.isBooked) {
                  bookedTimes.push(...slotsFromRange);
                } else {
                  times.push(...slotsFromRange);
                }
              } else {
                if (slot.isBooked) {
                  bookedTimes.push(slot.startTime);
                } else {
                  times.push(slot.startTime);
                }
              }
            });

            // Only add if there are available times
            if (times.length > 0 || bookedTimes.length > 0) {
              dateAvailabilities.push({
                date,
                selectedTimes: times,
                bookedTimes: bookedTimes,
                isFromRecurring: false,
                existingId: avail._id,
                hasBeenModified: false,
              });
            }
          }
        }
      }
    });

    // Then, add recurring dates that aren't blocked or overridden
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      const dateKey = currentDate.toDateString();
      const dayOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][currentDate.getDay()];

      // Skip if this date is explicitly blocked
      if (blockedDates.has(dateKey)) {
        continue;
      }

      // Skip if this date already has a single date entry
      const hasSingleEntry = dateAvailabilities.some(
        (da) => da.date.toDateString() === dateKey
      );

      if (!hasSingleEntry) {
        // Check the current weekly schedule for recurring availability
        const recurringDay = weekSchedule.find(
          (w) => w.dayOfWeek === dayOfWeek
        );
        if (recurringDay && recurringDay.timeSlots.length > 0) {
          let times: string[] = [];
          let bookedTimes: string[] = [];

          recurringDay.timeSlots.forEach((slot) => {
            if (
              slot.startTime &&
              slot.endTime &&
              slot.startTime !== slot.endTime
            ) {
              const slotsFromRange = generateTimeSlotsFromRange(
                slot.startTime,
                slot.endTime
              );
              if (slot.isBooked) {
                bookedTimes.push(...slotsFromRange);
              } else {
                times.push(...slotsFromRange);
              }
            } else {
              if (slot.isBooked) {
                bookedTimes.push(slot.startTime);
              } else {
                times.push(slot.startTime);
              }
            }
          });

          // Only add if there are available times
          if (times.length > 0) {
            dateAvailabilities.push({
              date: currentDate,
              selectedTimes: times,
              bookedTimes: bookedTimes,
              isFromRecurring: true,
              hasBeenModified: false,
            });
          }
        }
      }
    }

    setSelectedDateAvailabilities(dateAvailabilities);
    setOriginalDateAvailabilities(
      JSON.parse(JSON.stringify(dateAvailabilities))
    );
    generateRecurringDatesForMonth();
  };

  // Update dates when month changes
  useEffect(() => {
    if (existingAvailabilities.length > 0) {
      regenerateDatesForMonth(existingAvailabilities, weeklySchedule);
    }
  }, [currentMonth]);

  // Generate dates that have recurring availability for the current viewing month
  const generateRecurringDatesForMonth = () => {
    const dates: Date[] = [];
    const viewMonth = currentMonth.getMonth();
    const viewYear = currentMonth.getFullYear();

    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][d.getDay()];
      const weekDay = weeklySchedule.find((w) => w.dayOfWeek === dayOfWeek);

      if (weekDay && weekDay.timeSlots.length > 0) {
        dates.push(new Date(d));
      }
    }

    setRecurringDates(dates);
  };

  useEffect(() => {
    generateRecurringDatesForMonth();
  }, [weeklySchedule, currentMonth]);

  if (!isOpen) return null;

  const formatTimeDisplay = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const modifier = hour >= 12 ? "PM" : "AM";
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${modifier}`;
  };

  const handleDateSelect = (date: Date) => {
    // Check if the selected date is in a different month
    const selectedMonth = date.getMonth();
    const selectedYear = date.getFullYear();
    const currentMonthValue = currentMonth.getMonth();
    const currentYearValue = currentMonth.getFullYear();

    if (
      selectedMonth !== currentMonthValue ||
      selectedYear !== currentYearValue
    ) {
      // Month has changed, update the current month
      setCurrentMonth(new Date(selectedYear, selectedMonth, 1));
    }

    // Save current selection if exists
    if (currentSelectedDate) {
      const existingIndex = selectedDateAvailabilities.findIndex(
        (item) =>
          item.date.toDateString() === currentSelectedDate.toDateString()
      );

      if (existingIndex >= 0) {
        const updated = [...selectedDateAvailabilities];
        updated[existingIndex].selectedTimes = currentSelectedTimes;
        updated[existingIndex].hasBeenModified = true;
        setSelectedDateAvailabilities(updated);
      } else {
        // Check if this date would have recurring availability
        const dayOfWeek = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ][currentSelectedDate.getDay()];
        const recurringDay = weeklySchedule.find(
          (d) => d.dayOfWeek === dayOfWeek
        );
        const isFromRecurring = !!(
          recurringDay && recurringDay.timeSlots.length > 0
        );

        setSelectedDateAvailabilities([
          ...selectedDateAvailabilities,
          {
            date: currentSelectedDate,
            selectedTimes: currentSelectedTimes,
            bookedTimes: currentBookedTimes,
            isFromRecurring: isFromRecurring,
            hasBeenModified: true,
          },
        ]);
      }
    }

    // If clicking same date, deselect
    if (currentSelectedDate?.toDateString() === date.toDateString()) {
      setCurrentSelectedDate(null);
      setCurrentSelectedTimes([]);
      setCurrentBookedTimes([]);
      return;
    }

    // Load existing times for this date
    const existing = selectedDateAvailabilities.find(
      (item) => item.date.toDateString() === date.toDateString()
    );

    setCurrentSelectedDate(date);

    if (existing) {
      setCurrentSelectedTimes(existing.selectedTimes);
      setCurrentBookedTimes(existing.bookedTimes || []);
    } else {
      // Check if this date should have recurring availability
      const dayOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][date.getDay()];
      const recurringDay = weeklySchedule.find(
        (d) => d.dayOfWeek === dayOfWeek
      );

      if (recurringDay && recurringDay.timeSlots.length > 0) {
        let times: string[] = [];
        let bookedTimes: string[] = [];

        recurringDay.timeSlots.forEach((slot) => {
          // Check if this is a range
          if (
            slot.startTime &&
            slot.endTime &&
            slot.startTime !== slot.endTime
          ) {
            // Generate individual slots from the range
            const slotsFromRange = generateTimeSlotsFromRange(
              slot.startTime,
              slot.endTime
            );
            if (slot.isBooked) {
              bookedTimes.push(...slotsFromRange);
            } else {
              times.push(...slotsFromRange);
            }
          } else {
            // Individual slot
            if (slot.isBooked) {
              bookedTimes.push(slot.startTime);
            } else {
              times.push(slot.startTime);
            }
          }
        });

        setCurrentSelectedTimes(times);
        setCurrentBookedTimes(bookedTimes);
      } else {
        setCurrentSelectedTimes([]);
        setCurrentBookedTimes([]);
      }
    }
  };

  const handleTimeToggle = (time: string) => {
    if (!currentSelectedDate) return;

    // Check if this time is booked
    if (currentBookedTimes.includes(time)) {
      toast.error("Cannot remove availability for booked time slot");
      return;
    }

    setCurrentSelectedTimes((prev) => {
      if (prev.includes(time)) {
        return prev.filter((t) => t !== time);
      } else {
        return [...prev, time].sort();
      }
    });
  };

  const toggleDayAvailability = (dayIndex: number) => {
    const updated = [...weeklySchedule];

    // Check if any times are booked for this day
    const hasBookedSlots = updated[dayIndex].timeSlots.some(
      (slot) => slot.isBooked
    );

    if (hasBookedSlots && updated[dayIndex].timeSlots.length > 0) {
      toast.error(
        "Cannot remove availability for days with booked appointments"
      );
      return;
    }

    if (updated[dayIndex].timeSlots.length === 0) {
      updated[dayIndex].timeSlots = [
        { startTime: "09:00", endTime: "17:00", isBooked: false },
      ];
    } else {
      updated[dayIndex].timeSlots = [];
    }
    setWeeklySchedule(updated);
  };

  const addTimeSlot = (dayIndex: number) => {
    const updated = [...weeklySchedule];
    updated[dayIndex].timeSlots.push({
      startTime: "09:00",
      endTime: "17:00",
      isBooked: false,
    });
    setWeeklySchedule(updated);
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    const updated = [...weeklySchedule];

    // Check if this slot is booked
    if (updated[dayIndex].timeSlots[slotIndex].isBooked) {
      toast.error("Cannot remove booked time slot");
      return;
    }

    updated[dayIndex].timeSlots = updated[dayIndex].timeSlots.filter(
      (_, idx) => idx !== slotIndex
    );
    setWeeklySchedule(updated);
  };

  const updateTimeSlot = (
    dayIndex: number,
    slotIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const updated = [...weeklySchedule];
    updated[dayIndex].timeSlots[slotIndex][field] = value;
    setWeeklySchedule(updated);
  };

  const toLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  };
  // Get all dates for calendar display with proper highlighting
  const getAllSelectedDates = (): Date[] => {
    const dates: Date[] = [];

    // Add all dates with availability (both single and recurring)
    selectedDateAvailabilities.forEach((item) => {
      dates.push(item.date);
    });

    // Add current selected date
    if (
      currentSelectedDate &&
      !dates.find(
        (d) => d.toDateString() === currentSelectedDate.toDateString()
      )
    ) {
      dates.push(currentSelectedDate);
    }

    return dates;
  };

  // Get dates that actually have availability (for highlighting)
  const getDatesWithAvailability = (): Date[] => {
    const dates: Date[] = [];

    // Add dates with selected times (available slots)
    selectedDateAvailabilities.forEach((item) => {
      if (item.selectedTimes.length > 0) {
        dates.push(item.date);
      }
    });

    // Add current date if it has times
    if (currentSelectedDate && currentSelectedTimes.length > 0) {
      const alreadyIncluded = dates.some(
        (d) => d.toDateString() === currentSelectedDate.toDateString()
      );
      if (!alreadyIncluded) {
        dates.push(currentSelectedDate);
      }
    }

    return dates;
  };

  const saveCurrentSelection = () => {
    if (currentSelectedDate) {
      const existingIndex = selectedDateAvailabilities.findIndex(
        (item) =>
          item.date.toDateString() === currentSelectedDate.toDateString()
      );

      // Check if this date would have recurring availability
      const dayOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][currentSelectedDate.getDay()];
      const recurringDay = weeklySchedule.find(
        (d) => d.dayOfWeek === dayOfWeek
      );
      const hasRecurring = !!(
        recurringDay && recurringDay.timeSlots.length > 0
      );

      if (existingIndex >= 0) {
        const updated = [...selectedDateAvailabilities];
        updated[existingIndex].selectedTimes = currentSelectedTimes;
        updated[existingIndex].hasBeenModified = true;
        setSelectedDateAvailabilities(updated);
      } else if (hasRecurring || currentSelectedTimes.length !== 0) {
        // Only save if different from recurring or if explicitly set
        setSelectedDateAvailabilities([
          ...selectedDateAvailabilities,
          {
            date: currentSelectedDate,
            selectedTimes: currentSelectedTimes,
            bookedTimes: currentBookedTimes,
            isFromRecurring: false,
            hasBeenModified: true,
          },
        ]);
      }
    }
  };

  // In AvailabilityModal.tsx, update the handleComplete function:

  const handleComplete = async () => {
    saveCurrentSelection();

    try {
      let result;

      if (activeTab === "monthly") {
        const availabilities: Partial<Availability>[] = [];

        const allDateAvailabilities = [...selectedDateAvailabilities];
        if (currentSelectedDate) {
          const existingIndex = allDateAvailabilities.findIndex(
            (item) =>
              item.date.toDateString() === currentSelectedDate.toDateString()
          );
          if (existingIndex >= 0) {
            allDateAvailabilities[existingIndex].selectedTimes =
              currentSelectedTimes;
            allDateAvailabilities[existingIndex].hasBeenModified = true;
          } else {
            const dayOfWeek = [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ][currentSelectedDate.getDay()];
            const recurringDay = weeklySchedule.find(
              (d) => d.dayOfWeek === dayOfWeek
            );
            const hasRecurring = !!(
              recurringDay && recurringDay.timeSlots.length > 0
            );

            allDateAvailabilities.push({
              date: currentSelectedDate,
              selectedTimes: currentSelectedTimes,
              bookedTimes: currentBookedTimes,
              isFromRecurring: false,
              hasBeenModified: true,
            });
          }
        }

        for (const item of allDateAvailabilities) {
          if (item.hasBeenModified) {
            // Use local date string instead of ISO string
            const dateStr = toLocalDateString(item.date);

            const allTimes = [
              ...new Set([...item.selectedTimes, ...item.bookedTimes]),
            ];
            const timeSlots = allTimes.map((time) => ({
              startTime: time,
              endTime: addMinutes(time, 30),
              isBooked: item.bookedTimes.includes(time),
            }));

            await availabilityService.setForDate(doctorId, dateStr, timeSlots);

            availabilities.push({
              type: "Single" as const,
              date: dateStr,
              timeSlots: timeSlots,
              doctor: doctorId,
              isActive: true,
            });
          }
        }

        result = {
          type: "Single" as const,
          availabilities,
        };
      } else {
        // Weekly recurring logic remains the same
        const validSchedule = weeklySchedule.filter(
          (day) => day.timeSlots.length > 0
        );

        await availabilityService.setRecurring(doctorId, validSchedule);

        if (validSchedule.length > 0) {
          const availabilities = validSchedule.map((day) => ({
            type: "Recurring" as const,
            dayOfWeek: day.dayOfWeek,
            timeSlots: day.timeSlots,
            doctor: doctorId,
            isActive: true,
          }));

          result = {
            type: "Recurring" as const,
            availabilities,
          };
        } else {
          result = {
            type: "Recurring" as const,
            availabilities: [],
          };
        }
      }

      toast.success("Availability saved successfully!");
      onComplete(result);
      onClose();

      setSelectedDateAvailabilities([]);
      setCurrentSelectedDate(null);
      setCurrentSelectedTimes([]);
      setCurrentBookedTimes([]);
    } catch (error: any) {
      toast.error(error.message || "Failed to save availability");
      console.error("Error saving availability:", error);
    }
  };

  const addMinutes = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, "0")}:${newMins
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-foreground rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-stroke">
          <div className="flex items-center gap-3">
            <CalendarBlank size={28} className="text-primary" />
            <div>
              <h2 className="text-md font-medium text-primaryText">
                Manage Your Availability
              </h2>
              <p className="text-sm text-secondaryText">
                View and update your availability. Booked slots cannot be
                removed.
              </p>
            </div>
          </div>
          <button
            className="text-secondaryText hover:text-primaryText transition-colors"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <p className="text-secondaryText">Loading availability...</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-3">
              <div className="flex gap-1 p-1 bg-background rounded-lg shadow-sm border border-stroke">
                <button
                  className={`flex-1 py-2.5 px-6 text-sm font-medium transition-all duration-200 rounded-md ${
                    activeTab === "monthly"
                      ? "text-white bg-primary shadow-sm"
                      : "text-secondaryText bg-transparent hover:text-primaryText"
                  }`}
                  onClick={() => {
                    saveCurrentSelection();
                    setActiveTab("monthly");
                  }}
                >
                  Monthly Availability
                </button>
                <button
                  className={`flex-1 py-2.5 px-6 text-sm font-medium transition-all duration-200 rounded-md ${
                    activeTab === "weekly"
                      ? "text-white bg-primary shadow-sm"
                      : "text-secondaryText bg-transparent hover:text-primaryText"
                  }`}
                  onClick={() => {
                    saveCurrentSelection();
                    setActiveTab("weekly");
                  }}
                >
                  Weekly Recurring Availability
                </button>
              </div>
            </div>

            <div className="p-6 pt-0 overflow-y-auto max-h-[calc(90vh-280px)]">
              {activeTab === "monthly" ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-secondaryText mb-2">
                      Your existing availability is shown. Select a date to
                      modify. Light green dates use recurring schedule. Removing
                      all times blocks that date.
                    </p>
                  </div>

                  <div className="flex w-full gap-6">
                    <div className="w-3/5 border-r border-stroke pr-6">
                      {currentSelectedDate && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-2 mb-2">
                          <p className="text-sm text-primary font-medium">
                            Editing: {currentSelectedDate.toLocaleDateString()}
                            {currentSelectedTimes.length > 0 ? (
                              <span className="ml-2">
                                ({currentSelectedTimes.length} available,{" "}
                                {currentBookedTimes.length} booked)
                              </span>
                            ) : (
                              <span className="ml-2 text-error">
                                (Blocked - no availability)
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                      <Calendar
                        selectedDates={getAllSelectedDates()}
                        highlightedDates={getDatesWithAvailability()}
                        onDateSelect={handleDateSelect}
                        onMonthChange={(newMonth: Date) => {
                          // Update current month and regenerate dates
                          setCurrentMonth(newMonth);
                        }}
                        currentMonth={currentMonth}
                        className="w-full"
                      />

                      {/* Note: Calendar handles its own month navigation internally. 
                          When user selects a date in a different month, we detect and update accordingly */}
                      <div className="mt-2 text-xs text-secondaryText space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-primary/20 rounded"></div>
                          <span>Has availability</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-primary rounded"></div>
                          <span>Selected for editing</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Lock size={12} className="text-secondaryText" />
                          <span>Booked slots cannot be removed</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-2/5">
                      {currentSelectedDate ? (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium pt-4 text-primaryText">
                              Time Slots
                            </p>
                            <div className="flex gap-2">
                              {currentSelectedTimes.length > 0 && (
                                <button
                                  className="text-xs text-primary hover:text-primary/80"
                                  onClick={() => {
                                    if (currentBookedTimes.length > 0) {
                                      toast.error(
                                        "Cannot clear all - some slots are booked"
                                      );
                                      setCurrentSelectedTimes([]);
                                    } else {
                                      setCurrentSelectedTimes([]);
                                    }
                                  }}
                                >
                                  Clear available
                                </button>
                              )}
                              {currentSelectedTimes.length === 0 && (
                                <button
                                  className="text-xs text-primary hover:text-primary/80"
                                  onClick={() =>
                                    setCurrentSelectedTimes(timeOptions)
                                  }
                                >
                                  Select all
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2 max-h-80 overflow-y-auto rounded-lg">
                            {timeOptions.map((time) => {
                              const isBooked =
                                currentBookedTimes.includes(time);
                              const isSelected =
                                currentSelectedTimes.includes(time);

                              return (
                                <button
                                  key={time}
                                  className={`w-full py-2 px-3 rounded-md border transition-all flex items-center justify-between group ${
                                    isBooked
                                      ? "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed"
                                      : isSelected
                                      ? "bg-primary text-white border-primary"
                                      : "bg-white text-primaryText border-transparent hover:border-primary hover:bg-primary/5"
                                  }`}
                                  onClick={() =>
                                    !isBooked && handleTimeToggle(time)
                                  }
                                  disabled={isBooked}
                                >
                                  <span className="text-sm flex items-center gap-2">
                                    {formatTimeDisplay(time)}
                                    {isBooked && <Lock size={14} />}
                                  </span>
                                  {(isSelected || isBooked) && (
                                    <Check size={16} weight="bold" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="border border-dashed border-stroke rounded-lg p-6 text-center">
                          <Clock
                            size={32}
                            className="text-secondaryText mx-auto mb-2"
                          />
                          <p className="text-sm text-secondaryText">
                            Select a date to view or edit availability
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-secondaryText">
                    Set your recurring weekly schedule. This applies to all
                    future dates unless overridden by specific date settings.
                  </p>

                  {weeklySchedule.map((day, dayIndex) => {
                    const hasBookedSlots = day.timeSlots.some(
                      (slot) => slot.isBooked
                    );

                    return (
                      <div
                        key={day.dayOfWeek}
                        className="flex items-start gap-4 p-4 rounded-lg border border-stroke"
                      >
                        <div className="flex items-center gap-3 w-32">
                          <input
                            type="checkbox"
                            checked={day.timeSlots.length > 0}
                            onChange={() => toggleDayAvailability(dayIndex)}
                            disabled={
                              hasBookedSlots && day.timeSlots.length > 0
                            }
                            className="w-5 h-5 rounded border-2 border-stroke text-primary 
                       focus:ring-2 focus:ring-primary/20 accent-primary cursor-pointer
                       disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          <label className="font-medium text-primaryText cursor-pointer select-none">
                            {day.dayOfWeek}
                            {hasBookedSlots && (
                              <Lock
                                size={12}
                                className="inline ml-1 text-gray-500"
                              />
                            )}
                          </label>
                        </div>
                        <div className="flex-1">
                          {day.timeSlots.length > 0 ? (
                            <div className="flex flex-col gap-2">
                              {day.timeSlots.map((slot, slotIndex) => (
                                <div
                                  key={slotIndex}
                                  className="inline-flex items-center gap-2"
                                >
                                  <CustomTimePicker
                                    value={slot.startTime}
                                    onChange={(value) =>
                                      updateTimeSlot(
                                        dayIndex,
                                        slotIndex,
                                        "startTime",
                                        value
                                      )
                                    }
                                    className="!py-1 !px-3"
                                  />
                                  <span className="text-sm text-gray-400">
                                    to
                                  </span>
                                  <CustomTimePicker
                                    value={slot.endTime}
                                    onChange={(value) =>
                                      updateTimeSlot(
                                        dayIndex,
                                        slotIndex,
                                        "endTime",
                                        value
                                      )
                                    }
                                    className="!py-1 !px-3"
                                  />
                                  {slot.isBooked && (
                                    <Lock size={14} className="text-gray-500" />
                                  )}
                                  {day.timeSlots.length > 1 &&
                                    !slot.isBooked && (
                                      <button
                                        onClick={() =>
                                          removeTimeSlot(dayIndex, slotIndex)
                                        }
                                        className="ml-1 text-error hover:text-error/80 transition-colors"
                                      >
                                        <X size={18} />
                                      </button>
                                    )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">
                              Unavailable
                            </span>
                          )}
                        </div>
                        <div>
                          {day.timeSlots.length > 0 && (
                            <button
                              onClick={() => addTimeSlot(dayIndex)}
                              className="p-2 rounded-full text-primary hover:bg-primary/10 transition-colors"
                              title="Add another time slot"
                            >
                              <Plus size={20} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-stroke flex justify-end gap-3">
              <PrimaryButton
                text="Cancel"
                variant="outline"
                size="medium"
                onClick={onClose}
              />
              <PrimaryButton
                text="Save Changes"
                variant="primary"
                size="medium"
                onClick={handleComplete}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AvailabilityModal;
