import React from "react";
import DoctorResultCard from "../card/DoctorResultCard";
import BookingButton from "../buttons/BookingButton";
import { AvailableDoctorResult } from "api/types/availability.types";
import { useNavigate } from "react-router-dom";

const noResultsImage = "/533.Checking-The-Calendar.png";

interface TimeSlot {
  startTime: string;
  endTime: string;
  isBooked: boolean;
  _id?: string;
}

interface DoctorSearchResultsProps {
  searchDate: string;
  searchName: string;
  results: AvailableDoctorResult[];
  specialtyFilter?: string;
  onSpecialtyChange?: (specialty: string) => void;
  onBookAppointment?: (doctorId: string, timeSlot: TimeSlot) => void;
  onMessageDoctor?: (doctorId: string) => void;
  onViewProfile?: (doctorId: string) => void;
}

const DoctorSearchResults: React.FC<DoctorSearchResultsProps> = ({
  searchDate,
  searchName,
  results,
  specialtyFilter = "",
  onSpecialtyChange,
  onBookAppointment,
  onMessageDoctor,
  onViewProfile,
}) => {
  const navigate = useNavigate();

  // Format the date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time for display (convert 24hr to 12hr)
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Generate 1-hour time slots from a time range
  const generateOneHourSlots = (timeSlots: TimeSlot[]): TimeSlot[] => {
    const allHourSlots: TimeSlot[] = [];

    timeSlots.forEach((slot) => {
      // If slot is already booked, skip it
      if (slot.isBooked) {
        return;
      }

      // Parse start and end times
      const [startHour, startMin] = slot.startTime.split(":").map(Number);
      const [endHour, endMin] = slot.endTime.split(":").map(Number);

      // Calculate duration in minutes
      const totalMinutes = endHour * 60 + endMin - (startHour * 60 + startMin);

      // If it's already a 60-minute slot or less, just add it
      if (totalMinutes <= 60) {
        allHourSlots.push(slot);
        return;
      }

      // Generate 1-hour slots within this range
      let currentHour = startHour;
      let currentMin = startMin;

      while (
        currentHour < endHour ||
        (currentHour === endHour && currentMin < endMin)
      ) {
        // Calculate next slot (60 minutes later)
        let nextHour = currentHour + 1;
        let nextMin = currentMin;

        // Make sure we don't go past the end time
        if (nextHour > endHour || (nextHour === endHour && nextMin > endMin)) {
          // If remaining time is less than 60 min but more than 0, create a shorter slot
          if (endHour * 60 + endMin - (currentHour * 60 + currentMin) > 0) {
            const finalSlot: TimeSlot = {
              startTime: `${String(currentHour).padStart(2, "0")}:${String(
                currentMin
              ).padStart(2, "0")}`,
              endTime: `${String(endHour).padStart(2, "0")}:${String(
                endMin
              ).padStart(2, "0")}`,
              isBooked: false,
              _id: slot._id
                ? `${slot._id}-${currentHour}-${currentMin}`
                : undefined,
            };
            allHourSlots.push(finalSlot);
          }
          break;
        }

        // Create the 1-hour slot - IMPORTANT: Ensure end time is exactly 1 hour after start
        const newSlot: TimeSlot = {
          startTime: `${String(currentHour).padStart(2, "0")}:${String(
            currentMin
          ).padStart(2, "0")}`,
          endTime: `${String(nextHour).padStart(2, "0")}:${String(
            nextMin
          ).padStart(2, "0")}`,
          isBooked: false,
          _id: slot._id
            ? `${slot._id}-${currentHour}-${currentMin}`
            : undefined,
        };

        // Log for debugging
        console.log("Generated 1-hour slot:", {
          start: newSlot.startTime,
          end: newSlot.endTime,
          duration: "60 minutes",
        });

        allHourSlots.push(newSlot);

        // Move to next slot (1 hour later)
        currentHour = nextHour;
        currentMin = nextMin;
      }
    });

    return allHourSlots;
  };

  return (
    <div className="w-full px-12 min-h-screen bg-background">
      <div className="mx-auto py-8">
        <div className="flex gap-8">
          <div className="flex-1">
            {results.length === 0 ? (
              <div className="text-center">
                <h1 className="text-2xl text-left font-semibold text-primaryText">
                  {searchDate
                    ? `Open Appointments on ${formatDate(searchDate)}`
                    : `Search Results for ${searchName}`}
                </h1>
                <p className="text-sm text-left text-secondaryText mt-1">
                  {searchName && searchName.trim() !== ""
                    ? `There are no open appointments with ${searchName}. Try another name for more open appointments.`
                    : searchDate
                    ? `No open appointments found on ${formatDate(
                        searchDate
                      )}. Try another date for more open appointments.`
                    : "No open appointments found matching your search criteria."}
                </p>
                <div className="my-4 w-full flex justify-center text-gray-400 mb-4">
                  <img
                    src={noResultsImage}
                    className="w-2/5"
                    alt="No results"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white border-b border-stroke py-6">
                  <div>
                    <h1 className="text-2xl text-left font-semibold text-primaryText">
                      {searchDate
                        ? `Open Appointments on ${formatDate(searchDate)}`
                        : `Search Results for ${searchName}`}
                    </h1>
                    {searchName && (
                      <p className="text-sm text-left text-secondaryText mt-1">
                        Showing results for: "{searchName}"
                      </p>
                    )}
                  </div>
                </div>

                {results.map((result) => {
                  // Generate proper 1-hour slots
                  const oneHourSlots = generateOneHourSlots(result.timeSlots);

                  console.log(`Doctor ${result.doctor._id} slots:`, {
                    original: result.timeSlots,
                    generated1Hour: oneHourSlots,
                  });

                  // Handle case where doctor.user might be a string (ID) or User object
                  const user =
                    typeof result.doctor.user === "string"
                      ? null
                      : result.doctor.user;

                  if (!user) {
                    console.warn(
                      "Doctor user data not populated:",
                      result.doctor
                    );
                    return null;
                  }

                  return (
                    <div key={result.doctor._id}>
                      <div className="flex gap-6">
                        <div className="flex-shrink-0 w-[500px]">
                          <DoctorResultCard
                            doctorId={result.doctor._id}
                            doctorName={`${user.firstName} ${user.lastName}`}
                            specialty={
                              result.doctor.speciality || "General Practice"
                            }
                            email={user.email}
                            phd={result.doctor.education || ""}
                            profilePicUrl={user.profilePic}
                            onMessageDoctor={() =>
                              onMessageDoctor?.(result.doctor._id)
                            }
                            onViewProfile={() => {
                              const userIdToNavigate = user._id;
                              if (onViewProfile) {
                                onViewProfile(userIdToNavigate);
                              } else {
                                navigate(`/doctor/${userIdToNavigate}`);
                              }
                            }}
                          />
                        </div>

                        <div className="flex-1">
                          <div className="grid grid-cols-4 gap-3">
                            {oneHourSlots.length === 0 ? (
                              <div className="col-span-4 text-center text-secondaryText py-4">
                                No available time slots
                              </div>
                            ) : (
                              oneHourSlots.map((slot, index) => (
                                <BookingButton
                                  key={`${result.doctor._id}-${slot.startTime}-${index}`}
                                  time={formatTime(slot.startTime)}
                                  isBooked={slot.isBooked}
                                  onClick={() => {
                                    if (!slot.isBooked) {
                                      console.log(
                                        "Selecting slot for booking:",
                                        {
                                          doctorId: result.doctor._id,
                                          slot: slot,
                                          duration: `${slot.startTime} - ${slot.endTime}`,
                                        }
                                      );
                                      onBookAppointment?.(
                                        result.doctor._id,
                                        slot
                                      );
                                    }
                                  }}
                                />
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSearchResults;
