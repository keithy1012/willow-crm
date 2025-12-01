import React, { useState, useEffect } from "react";
import { EnhancedAppointment } from "api/types/appointment.types";
import DoctorAppointmentCard from "components/card/DoctorAppointmentCard";
import { useRequireRole } from "hooks/useRequireRole";
import SmallInfoCard from "components/card/SmallInfoCard";
import Calendar from "components/calendar/Calendar";
import { Heartbeat } from "phosphor-react";
import PrimaryButton from "components/buttons/PrimaryButton";
import AvailabilityModal from "./AvailabilityModal";
import { availabilityService } from "api/services/availability.service";
import { appointmentService } from "api/services/appointment.service";
import { doctorService } from "api/services/doctor.service";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import CancelAppointmentModal from "components/modal/CancelAppointmentModal";

const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  // State declarations
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [monthAppointments, setMonthAppointments] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctorId, setDoctorId] = useState<string>("");
  const [isLoadingDoctor, setIsLoadingDoctor] = useState(true);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [storedAvailabilities, setStoredAvailabilities] = useState<any[]>([]);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelType, setCancelType] = useState<"cancel" | "no-show">("cancel");
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [processingCancel, setProcessingCancel] = useState(false);
  // State for availability
  const [availabilityDates, setAvailabilityDates] = useState<Date[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  // Month names for logging
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Hook must be called at the top level
  useRequireRole("Doctor");

  // Get doctor ID
  useEffect(() => {
    const fetchDoctorInfo = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log("User ID from localStorage:", user._id);

        try {
          const doctorData = await doctorService.getByUserId(user._id);
          console.log("Doctor data received:", doctorData);
          setDoctorId(doctorData._id);
        } catch (error: any) {
          console.error("Failed to get doctor info:", error);
          toast.error("Failed to load doctor information");
        } finally {
          setIsLoadingDoctor(false);
        }
      }
    };

    fetchDoctorInfo();
  }, []);

  // Fetch availability and appointments when doctor ID is available
  useEffect(() => {
    if (doctorId) {
      fetchAvailability();
      fetchAppointments();
    }
  }, [doctorId]);

  // Fetch availability for calendar display
  const fetchAvailability = async () => {
    if (!doctorId) return;

    setIsLoadingAvailability(true);
    try {
      // Get all availabilities for the doctor
      const response = await availabilityService.getDoctorAvailabilities(
        doctorId
      );
      console.log("Fetched availabilities for calendar:", response);

      if (response.availabilities) {
        setStoredAvailabilities(response.availabilities);
        processAvailabilityForCalendar(response.availabilities, calendarMonth);
      }
    } catch (error) {
      console.error("Failed to fetch availability:", error);
      // If the all endpoint doesn't exist, try the date-specific endpoint
      try {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const dates: Date[] = [];

        // Check each day of the month
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);

        for (
          let d = new Date(firstDay);
          d <= lastDay;
          d.setDate(d.getDate() + 1)
        ) {
          const dateStr = d.toISOString().split("T")[0];
          try {
            const dayAvailability = await availabilityService.getForDate(
              doctorId,
              dateStr
            );
            if (
              dayAvailability.available &&
              dayAvailability.timeSlots?.length > 0
            ) {
              dates.push(new Date(d));
            }
          } catch (dayError) {
            // Skip this day if error
          }
        }

        setAvailabilityDates(dates);
      } catch (fallbackError) {
        console.error("Fallback fetch also failed:", fallbackError);
      }
    } finally {
      setIsLoadingAvailability(false);
    }
  };
  const handleCancelAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setCancelType("cancel");
    setIsCancelModalOpen(true);
  };

  // Replace the handleMarkNoShow function
  const handleMarkNoShow = (appointment: any) => {
    setSelectedAppointment(appointment);
    setCancelType("no-show");
    setIsCancelModalOpen(true);
  };

  // Add this new handler for confirming cancellation/no-show
  const handleConfirmCancellation = async (
    reason: string,
    type: "cancel" | "no-show"
  ) => {
    if (!selectedAppointment) return;

    setProcessingCancel(true);
    try {
      if (type === "cancel") {
        await appointmentService.cancelWithReason(
          selectedAppointment._id,
          reason,
          "doctor"
        );
        toast.success("Appointment cancelled and patient notified");
      } else {
        await appointmentService.markNoShowWithReason(
          selectedAppointment._id,
          reason
        );
        toast.success("Appointment marked as no-show and patient notified");
      }

      // Refresh appointments
      await fetchAppointments();
      setIsCancelModalOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Error processing cancellation:", error);
      toast.error("Failed to process. Please try again.");
    } finally {
      setProcessingCancel(false);
    }
  };
  const processAvailabilityForCalendar = (
    availabilities: any[],
    targetMonth?: Date
  ) => {
    const dates: Date[] = [];
    const monthToProcess = targetMonth || calendarMonth;
    const currentMonth = monthToProcess.getMonth();
    const currentYear = monthToProcess.getFullYear();

    // Process recurring availabilities
    const recurringAvails = availabilities.filter(
      (a) =>
        a.type === "Recurring" &&
        (a.isActive === true || a.isActive === undefined)
    );
    const singleAvails = availabilities.filter(
      (a) =>
        a.type === "Single" && (a.isActive === true || a.isActive === undefined)
    );

    // Generate dates for the specified month
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    // Keep track of blocked dates (single entries with no time slots)
    const blockedDates = new Set<string>();

    // Create a map of single date overrides for quick lookup
    const singleDateMap = new Map();
    singleAvails.forEach((sa) => {
      if (sa.date) {
        const date = new Date(sa.date);
        const dateKey = date.toDateString();

        // Check if this is a blocked date (has no time slots or empty array)
        if (!sa.timeSlots || sa.timeSlots.length === 0) {
          blockedDates.add(dateKey);
        } else {
          singleDateMap.set(dateKey, sa);
        }
      }
    });

    // Check each day of the month
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

      // First check if this date is explicitly blocked
      if (blockedDates.has(dateKey)) {
        // Skip this date - it's blocked
        continue;
      }

      // Then check for single date override with time slots
      if (singleDateMap.has(dateKey)) {
        const singleOverride = singleDateMap.get(dateKey);
        // We already checked it has time slots when adding to map
        dates.push(new Date(currentDate));
      } else {
        // No single date override, check recurring availability
        const recurring = recurringAvails.find(
          (ra) => ra.dayOfWeek === dayOfWeek
        );
        if (
          recurring &&
          recurring.timeSlots &&
          recurring.timeSlots.length > 0
        ) {
          dates.push(new Date(currentDate));
        }
      }
    }

    console.log(
      `Found ${
        dates.length
      } available dates for ${monthToProcess.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })}`
    );
    console.log(`Blocked dates: ${blockedDates.size}`);
    setAvailabilityDates(dates);
  };

  // Fetch appointments from API
  const fetchAppointments = async () => {
    if (!doctorId) return;

    setIsLoadingAppointments(true);
    try {
      console.log("Fetching appointments for doctorId:", doctorId);

      // Fetch ALL appointments
      const allAppointmentsResponse: any =
        await appointmentService.getDoctorAppointments(doctorId);
      console.log("All appointments raw response:", allAppointmentsResponse);

      const allData = Array.isArray(allAppointmentsResponse)
        ? allAppointmentsResponse
        : allAppointmentsResponse?.appointments || [];

      // Filter today's appointments from all appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayData = allData.filter((apt: any) => {
        const aptDate = new Date(apt.startTime);
        return aptDate >= today && aptDate < tomorrow;
      });

      console.log("Today's appointments:", todayData);

      // Sort by start time
      const sortedTodayData = todayData.sort(
        (a: any, b: any) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );

      setTodayAppointments(sortedTodayData);

      // Filter for current month appointments for statistics
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const monthAppts = allData.filter((apt: any) => {
        const aptDate = new Date(apt.startTime);
        const isCurrentMonth =
          aptDate.getMonth() === currentMonth &&
          aptDate.getFullYear() === currentYear;
        const notCancelled = apt.status !== "Cancelled";
        return isCurrentMonth && notCancelled;
      });
      console.log(
        `Current month (${monthNames[currentMonth]} ${currentYear}) appointments:`,
        monthAppts.length
      );
      setMonthAppointments(monthAppts);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setTodayAppointments([]);
      setMonthAppointments([]);
      // Don't show error toast if API is not ready
      if (error instanceof Error && !error.message.includes("404")) {
        toast.error("Failed to load appointments");
      }
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  const handleAvailabilityComplete = (data: any) => {
    console.log("Availability saved:", data);
    // Refresh availability display after saving
    fetchAvailability();
    setIsModalOpen(false);
  };

  const handleAvailability = () => {
    setIsModalOpen(true);
  };

  const handleMonthChange = (newMonth: Date) => {
    setCalendarMonth(newMonth);
    if (storedAvailabilities.length > 0) {
      processAvailabilityForCalendar(storedAvailabilities, newMonth);
    }
  };

  // Helper functions for the dashboard
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      const time = hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
      const displayTime = hour === 12 ? "12:00 PM" : time;
      slots.push({
        hour,
        displayTime,
        time24: `${hour.toString().padStart(2, "0")}:00`,
      });
    }
    return slots;
  };

  const getAppointmentsForTimeSlot = (hour: number) => {
    return todayAppointments.filter((apt) => {
      const aptHour = new Date(apt.startTime).getHours();
      return aptHour === hour;
    });
  };

  const isAppointmentCurrent = (appointment: any): boolean => {
    const now = new Date();
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);
    return now >= start && now <= end;
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getAppointmentDates = (): Date[] => {
    return monthAppointments.map((apt) => new Date(apt.startTime));
  };

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);

    // Check appointments for this date
    const selectedDateAppointments = monthAppointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      return (
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear()
      );
    });

    // Check if this date has availability
    const hasAvailability = availabilityDates.some(
      (availDate) =>
        availDate.getDate() === date.getDate() &&
        availDate.getMonth() === date.getMonth() &&
        availDate.getFullYear() === date.getFullYear()
    );

    if (hasAvailability) {
      // Get specific availability details if needed
      if (doctorId) {
        try {
          const dateStr = date.toISOString().split("T")[0];
          const availability = await availabilityService.getForDate(
            doctorId,
            dateStr
          );

          if (availability.available && availability.timeSlots) {
            const availableSlots = availability.timeSlots.filter(
              (slot: any) => !slot.isBooked
            );
            const bookedSlots = availability.timeSlots.filter(
              (slot: any) => slot.isBooked
            );

            let message = `${formatDate(date)}: `;
            if (selectedDateAppointments.length > 0) {
              message += `${selectedDateAppointments.length} appointments, `;
            }
            message += `${availableSlots.length} open slots`;

            toast.success(message, { duration: 3000 });
          }
        } catch (error) {
          console.error("Failed to fetch availability details:", error);
        }
      }
    } else if (selectedDateAppointments.length > 0) {
      toast.success(
        `${formatDate(date)}: ${
          selectedDateAppointments.length
        } appointment(s)`,
        { duration: 3000 }
      );
    }
  };

  // Handlers
  const handleMessagePatient = (patientId: string) => {
    navigate(`/doctormessages?patientId=${patientId}`);
  };

  const handleViewPatientProfile = (patientId: string) => {
    navigate(`/patient/${patientId}`);
  };

  const handleViewSummary = (appointmentId: string) => {
    navigate(`/medical-records/${appointmentId}`);
  };
  const handleViewDetails = (appointment: any) => {
    navigate(`/doctor/appointment/${appointment._id}`);
  };

  // Calculate statistics
  const upcomingAppointmentsCount = monthAppointments.filter(
    (apt) => new Date(apt.startTime) > new Date()
  ).length;

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary to-[#6886AC] text-white py-12 px-12">
        <div className="text-left">
          <h2 className="text-3xl font-semibold">Welcome Back, Doctor!</h2>
          <p className="text-lg mt-2 opacity-90">
            {formatDate(new Date())} - You have {todayAppointments.length}{" "}
            appointment{todayAppointments.length !== 1 ? "s" : ""} today
          </p>
        </div>
      </div>

      <div className="mx-12 flex flex-row">
        <div className="pr-8 py-8 w-3/5">
          <h1 className="text-2xl font-normal mb-6">Today's Schedule</h1>

          {isLoadingAppointments ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {generateTimeSlots().map((slot) => {
                const appointments = getAppointmentsForTimeSlot(slot.hour);

                if (appointments.length > 0) {
                  return appointments.map((appointment) => (
                    <DoctorAppointmentCard
                      key={appointment._id}
                      startTime={appointment.startTime}
                      endTime={appointment.endTime}
                      patientName={
                        appointment.patientID?.user?.firstName &&
                        appointment.patientID?.user?.lastName
                          ? `${appointment.patientID.user.firstName} ${appointment.patientID.user.lastName}`
                          : appointment.patientName || "Unknown Patient"
                      }
                      patientId={
                        appointment.patientID?._id || appointment.patientID
                      }
                      patientProfilePic={
                        appointment.patientID?.user?.profilePic
                      }
                      appointmentType={appointment.summary || "Consultation"}
                      appointmentDescription={appointment.description}
                      appointmentId={appointment._id}
                      status={appointment.status || "Scheduled"}
                      isCurrentAppointment={isAppointmentCurrent(appointment)}
                      onViewDetails={() => handleViewDetails(appointment)}
                      onMessage={() =>
                        handleMessagePatient(
                          appointment.patientID?._id || appointment.patientID
                        )
                      }
                      onViewProfile={() =>
                        handleViewPatientProfile(
                          appointment.patientID?._id || appointment.patientID
                        )
                      }
                      onComplete={async () => {
                        try {
                          await appointmentService.updateStatus(
                            appointment._id,
                            "Completed"
                          );
                          toast.success("Appointment marked as completed");
                          fetchAppointments();
                        } catch (error) {
                          toast.error("Failed to complete appointment");
                        }
                      }}
                      onCancel={() => handleCancelAppointment(appointment)}
                      onMarkNoShow={() => handleMarkNoShow(appointment)}
                      isTimeline={true}
                      onStartAppointment={async () => {
                        try {
                          await appointmentService.updateStatus(
                            appointment._id,
                            "In-Progress"
                          );
                          toast.success("Appointment started");
                          fetchAppointments();
                        } catch (error) {
                          toast.error("Failed to start appointment");
                        }
                      }}
                      onViewSummary={() => handleViewSummary(appointment._id)}
                      onClick={() => handleViewDetails(appointment)}
                    />
                  ));
                }

                return (
                  <div key={slot.hour} className="flex gap-4 mb-4">
                    <div className="min-w-[80px] text-right pt-1">
                      <span className="text-sm text-darkerStroke">
                        {slot.displayTime}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-darkerStroke mt-2" />
                      <div className="w-[1px] bg-darkerStroke h-16" />
                    </div>
                    <div className="flex-1 h-16 border-b border-dashed border-stroke" />
                  </div>
                );
              })}

              {todayAppointments.length === 0 && (
                <div className="text-center py-8 text-secondaryText">
                  <p>No appointments scheduled for today</p>
                  <p className="text-sm mt-2">
                    {availabilityDates.length > 0
                      ? "Your availability is set. Patients can book appointments."
                      : "Set your availability to accept bookings"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pl-8 py-8 w-2/5 gap-6 flex flex-col border-l border-gray-200">
          <h1 className="text-2xl font-normal">This Week's Stats</h1>
          <div className="flex flex-row gap-6">
            <SmallInfoCard
              icon={Heartbeat}
              title="Patients Today"
              value={todayAppointments.length.toString()}
              width="1/2"
            />
            <SmallInfoCard
              icon={Heartbeat}
              title="This Month"
              value={monthAppointments.length.toString()}
              width="1/2"
            />
          </div>

          <div>
            <h1 className="text-2xl font-normal mb-4">This Month's Schedule</h1>

            {/* Legend for calendar */}
            <div className="flex gap-3 mb-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span>Selected Date</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Available</span>
              </div>
              {getAppointmentDates().length > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Has Appointments</span>
                </div>
              )}
            </div>

            <Calendar
              selectedDates={selectedDate ? [selectedDate] : []}
              highlightedDates={availabilityDates}
              appointmentDates={getAppointmentDates()}
              onDateSelect={handleDateSelect}
              onMonthChange={handleMonthChange}
              currentMonth={calendarMonth}
              className="w-full"
            />

            {isLoadingAvailability && (
              <p className="text-sm text-secondaryText text-center mt-2">
                Loading availability...
              </p>
            )}

            <div className="mt-2 text-xs text-secondaryText">
              <p>Available days: {availabilityDates.length}</p>
              <p>Upcoming appointments: {upcomingAppointmentsCount}</p>
            </div>
          </div>

          <PrimaryButton
            text="Manage Availability"
            variant="primary"
            size="small"
            onClick={handleAvailability}
            disabled={!doctorId || isLoadingDoctor}
          />
        </div>
      </div>

      {doctorId && (
        <AvailabilityModal
          isOpen={isModalOpen}
          doctorId={doctorId}
          onClose={() => {
            setIsModalOpen(false);
            // Refresh availability when modal closes
            fetchAvailability();
          }}
          onComplete={handleAvailabilityComplete}
        />
      )}

      <CancelAppointmentModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          if (!processingCancel) {
            setIsCancelModalOpen(false);
            setSelectedAppointment(null);
          }
        }}
        onConfirm={handleConfirmCancellation}
        type={cancelType}
        appointmentDate={
          selectedAppointment
            ? new Date(selectedAppointment.startTime).toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }
              )
            : ""
        }
        appointmentTime={
          selectedAppointment
            ? new Date(selectedAppointment.startTime).toLocaleTimeString(
                "en-US",
                {
                  hour: "numeric",
                  minute: "2-digit",
                }
              )
            : ""
        }
        patientName={
          selectedAppointment?.patientID?.user?.firstName &&
          selectedAppointment?.patientID?.user?.lastName
            ? `${selectedAppointment.patientID.user.firstName} ${selectedAppointment.patientID.user.lastName}`
            : "Patient"
        }
        isLoading={processingCancel}
      />
    </div>
  );
};

export default DoctorDashboard;
