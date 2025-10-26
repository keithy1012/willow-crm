import React from "react";
import DoctorResultCard from "../card/DoctorResultCard.tsx";
import BookingButton from "../buttons/BookingButton.tsx";
const noResultsImage = "/533.Checking-The-Calendar.png";
interface TimeSlot {
  startTime: string;
  endTime: string;
  isBooked: boolean;
  _id: string;
}

interface DoctorResult {
  doctor: {
    _id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      profilePic?: string;
    };
    bioContent: string;
    education: string;
    speciality: string;
  };
  availabilityType: string;
  timeSlots: TimeSlot[];
}

interface DoctorSearchResultsProps {
  searchDate: string;
  searchName: string;
  results: DoctorResult[];
  specialtyFilter?: string;
  onSpecialtyChange?: (specialty: string) => void;
  onBookAppointment?: (doctorId: string, timeSlot: TimeSlot) => void;
  onMessageDoctor?: (doctorId: string) => void;
}

const DoctorSearchResults: React.FC<DoctorSearchResultsProps> = ({
  searchDate,
  searchName,
  results,
  specialtyFilter = "",
  onSpecialtyChange,
  onBookAppointment,
  onMessageDoctor,
}) => {
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
    return `${displayHour}:${minutes}`;
  };

  // get the 30-minute time slots from the given time range
  const generateTimeSlots = (startTime: string, endTime: string): string[] => {
    const slots: string[] = [];
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMin < endMin)
    ) {
      const timeString = `${currentHour
        .toString()
        .padStart(2, "0")}:${currentMin.toString().padStart(2, "0")}`;
      slots.push(timeString);
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin -= 60;
        currentHour += 1;
      }
    }

    return slots;
  };

  // get the time slots for a doctor
  const getDoctorTimeSlots = (timeSlots: TimeSlot[]) => {
    const allSlots: { time: string; isBooked: boolean; slotData?: TimeSlot }[] =
      [];

    timeSlots.forEach((slot) => {
      const thirtyMinSlots = generateTimeSlots(slot.startTime, slot.endTime);
      thirtyMinSlots.forEach((time) => {
        allSlots.push({
          time,
          isBooked: slot.isBooked,
          slotData: slot,
        });
      });
    });

    return allSlots;
  };

  // Get unique specialties from results
  const getSpecialties = () => {
    const specialties = new Set(results.map((r) => r.doctor.speciality));
    return Array.from(specialties).sort();
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
                  <img src={noResultsImage} className="w-2/5" />
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
                  const timeSlots = getDoctorTimeSlots(result.timeSlots);

                  return (
                    <div key={result.doctor._id}>
                      <div className="flex gap-6">
                        <div className="flex-shrink-0 w-[500px]">
                          <DoctorResultCard
                            doctorId={result.doctor._id}
                            doctorName={`${result.doctor.user.firstName} ${result.doctor.user.lastName}`}
                            specialty={result.doctor.speciality}
                            email={result.doctor.user.email}
                            phd={result.doctor.education}
                            profilePicUrl={result.doctor.user.profilePic}
                            onMessageDoctor={() =>
                              onMessageDoctor &&
                              onMessageDoctor(result.doctor._id)
                            }
                          />
                        </div>

                        <div className="flex-1">
                          <div className="grid grid-cols-4 gap-3">
                            {timeSlots.map((slot, index) => (
                              <BookingButton
                                key={`${result.doctor._id}-${slot.time}-${index}`}
                                time={formatTime(slot.time)}
                                isBooked={slot.isBooked}
                                onClick={() =>
                                  slot.slotData &&
                                  onBookAppointment?.(
                                    result.doctor._id,
                                    slot.slotData
                                  )
                                }
                              />
                            ))}
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
