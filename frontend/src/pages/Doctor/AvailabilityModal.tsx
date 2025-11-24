import React, { useState } from "react";
import { X, CalendarBlank, Clock, Plus, Check } from "phosphor-react";
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

  // Monthly availability - each date can have different times
  const [selectedDateAvailabilities, setSelectedDateAvailabilities] = useState<
    SelectedDateAvailability[]
  >([]);
  const [currentSelectedDate, setCurrentSelectedDate] = useState<Date | null>(
    null
  );
  const [currentSelectedTimes, setCurrentSelectedTimes] = useState<string[]>(
    []
  );

  // Weekly recurring availability state
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyScheduleItem[]>([
    { dayOfWeek: "Monday" as DayOfWeek, timeSlots: [] },
    { dayOfWeek: "Tuesday" as DayOfWeek, timeSlots: [] },
    { dayOfWeek: "Wednesday" as DayOfWeek, timeSlots: [] },
    { dayOfWeek: "Thursday" as DayOfWeek, timeSlots: [] },
    { dayOfWeek: "Friday" as DayOfWeek, timeSlots: [] },
    { dayOfWeek: "Saturday" as DayOfWeek, timeSlots: [] },
    { dayOfWeek: "Sunday" as DayOfWeek, timeSlots: [] },
  ]);

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

  if (!isOpen) return null;

  // Format time for display
  const formatTimeDisplay = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const modifier = hour >= 12 ? "PM" : "AM";
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${modifier}`;
  };

  const handleDateSelect = (date: Date) => {
    // Save current selection if exists
    if (currentSelectedDate && currentSelectedTimes.length > 0) {
      const existingIndex = selectedDateAvailabilities.findIndex(
        (item) =>
          item.date.toDateString() === currentSelectedDate.toDateString()
      );

      if (existingIndex >= 0) {
        const updated = [...selectedDateAvailabilities];
        updated[existingIndex].selectedTimes = currentSelectedTimes;
        setSelectedDateAvailabilities(updated);
      } else {
        setSelectedDateAvailabilities([
          ...selectedDateAvailabilities,
          { date: currentSelectedDate, selectedTimes: currentSelectedTimes },
        ]);
      }
    }

    // If clicking same date, deselect
    if (currentSelectedDate?.toDateString() === date.toDateString()) {
      setCurrentSelectedDate(null);
      setCurrentSelectedTimes([]);
      return;
    }

    // Load existing times for this date or reset
    const existing = selectedDateAvailabilities.find(
      (item) => item.date.toDateString() === date.toDateString()
    );

    setCurrentSelectedDate(date);
    setCurrentSelectedTimes(existing?.selectedTimes || []);
  };

  const handleTimeToggle = (time: string) => {
    if (!currentSelectedDate) return;

    setCurrentSelectedTimes((prev) => {
      if (prev.includes(time)) {
        return prev.filter((t) => t !== time);
      } else {
        return [...prev, time].sort();
      }
    });
  };

  const isWeekdayEnabled = (dayOfWeek: DayOfWeek): boolean => {
    const day = weeklySchedule.find((d) => d.dayOfWeek === dayOfWeek);
    return (day?.timeSlots.length ?? 0) > 0;
  };

  const toggleDayAvailability = (dayIndex: number) => {
    const updated = [...weeklySchedule];
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

  // Get all selected dates for calendar display
  const getAllSelectedDates = (): Date[] => {
    const dates = selectedDateAvailabilities.map((item) => item.date);
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

  // Save current selection before closing or switching tabs
  const saveCurrentSelection = () => {
    if (currentSelectedDate && currentSelectedTimes.length > 0) {
      const existingIndex = selectedDateAvailabilities.findIndex(
        (item) =>
          item.date.toDateString() === currentSelectedDate.toDateString()
      );

      if (existingIndex >= 0) {
        const updated = [...selectedDateAvailabilities];
        updated[existingIndex].selectedTimes = currentSelectedTimes;
        setSelectedDateAvailabilities(updated);
      } else {
        setSelectedDateAvailabilities([
          ...selectedDateAvailabilities,
          { date: currentSelectedDate, selectedTimes: currentSelectedTimes },
        ]);
      }
    }
  };

  const handleComplete = async () => {
    saveCurrentSelection();

    try {
      let result;

      if (activeTab === "monthly") {
        // Handle single date availabilities
        const availabilities: Partial<Availability>[] = [];

        for (const item of selectedDateAvailabilities) {
          const dateStr = item.date.toISOString().split("T")[0];
          const timeSlots = item.selectedTimes.map((time) => ({
            startTime: time,
            endTime: addMinutes(time, 30),
            isBooked: false,
          }));

          // Call API for each date
          await availabilityService.setForDate(doctorId, dateStr, timeSlots);

          // Build availability object for callback
          availabilities.push({
            type: "Single" as const,
            date: dateStr,
            timeSlots: timeSlots,
            doctor: doctorId,
            isActive: true,
          });
        }

        result = {
          type: "Single" as const,
          availabilities,
        };
      } else {
        // Handle recurring availabilities
        const validSchedule = weeklySchedule.filter(
          (day) => day.timeSlots.length > 0
        );

        // Call API
        await availabilityService.setRecurring(doctorId, validSchedule);

        // Build availability objects for callback
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
      }

      toast.success("Availability saved successfully!");
      onComplete(result);
      onClose();

      // Reset state
      setSelectedDateAvailabilities([]);
      setCurrentSelectedDate(null);
      setCurrentSelectedTimes([]);
    } catch (error: any) {
      toast.error(error.message || "Failed to save availability");
      console.error("Error saving availability:", error);
    }
  };

  // Helper function to add minutes to time string
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
                Adjust Your Availability
              </h2>
              <p className="text-sm text-secondaryText">
                Change the availability you will show patients.
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
                  Select a date, then choose available time slots for that
                  specific date.
                </p>
              </div>

              <div className="flex w-full gap-6">
                <div className="w-3/5 border-r border-stroke pr-6">
                  {currentSelectedDate && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-2 mb-2">
                      <p className="text-sm text-primary font-medium">
                        Setting availability for:{" "}
                        {currentSelectedDate.toLocaleDateString()}
                        {currentSelectedTimes.length > 0 && (
                          <span className="ml-2">
                            ({currentSelectedTimes.length} slots selected)
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                  <Calendar
                    selectedDates={getAllSelectedDates()}
                    highlightedDates={selectedDateAvailabilities
                      .filter((d) => d.selectedTimes.length > 0)
                      .map((d) => d.date)}
                    onDateSelect={handleDateSelect}
                    className="w-full"
                  />
                </div>

                <div className="w-2/5">
                  {currentSelectedDate ? (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium pt-4 text-primaryText">
                          Time Slots
                        </p>
                        {currentSelectedTimes.length > 0 && (
                          <button
                            className="text-xs text-primary hover:text-primary/80"
                            onClick={() => setCurrentSelectedTimes([])}
                          >
                            Clear all
                          </button>
                        )}
                      </div>

                      <div className="space-y-2 max-h-80 overflow-y-auto rounded-lg">
                        {timeOptions.map((time) => (
                          <button
                            key={time}
                            className={`w-full py-2 px-3 rounded-md border transition-all flex items-center justify-between group ${
                              currentSelectedTimes.includes(time)
                                ? "bg-primary text-white border-primary"
                                : "bg-white text-primaryText border-transparent hover:border-primary hover:bg-primary/5"
                            }`}
                            onClick={() => handleTimeToggle(time)}
                          >
                            <span className="text-sm">
                              {formatTimeDisplay(time)}
                            </span>
                            {currentSelectedTimes.includes(time) && (
                              <Check size={16} weight="bold" />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="border border-dashed border-stroke rounded-lg p-6 text-center">
                      <Clock
                        size={32}
                        className="text-secondaryText mx-auto mb-2"
                      />
                      <p className="text-sm text-secondaryText">
                        Select a date to set available times
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-secondaryText">
                Set your recurring weekly schedule.
              </p>

              {weeklySchedule.map((day, dayIndex) => (
                <div
                  key={day.dayOfWeek}
                  className="flex items-start gap-4 p-4 rounded-lg border border-stroke"
                >
                  <div className="flex items-center gap-3 w-32">
                    <input
                      type="checkbox"
                      checked={day.timeSlots.length > 0}
                      onChange={() => toggleDayAvailability(dayIndex)}
                      className="w-5 h-5 rounded border-2 border-stroke text-primary 
                 focus:ring-2 focus:ring-primary/20 accent-primary cursor-pointer"
                    />
                    <label className="font-medium text-primaryText cursor-pointer select-none">
                      {day.dayOfWeek}
                    </label>
                  </div>
                  <div className="flex-1">
                    {day.timeSlots.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {" "}
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
                            <span className="text-sm text-gray-400">to</span>
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
                            {day.timeSlots.length > 1 && (
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
              ))}
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
            text={"Save Availability"}
            variant="primary"
            size="medium"
            onClick={handleComplete}
            disabled={
              activeTab === "monthly"
                ? selectedDateAvailabilities.length === 0 &&
                  currentSelectedTimes.length === 0
                : weeklySchedule.every((day) => day.timeSlots.length === 0)
            }
          />
        </div>
      </div>
    </div>
  );
};

export default AvailabilityModal;
