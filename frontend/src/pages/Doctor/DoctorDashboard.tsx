import React, { useState, useEffect } from "react";
import { Appointment } from "api/types/appointment.types";
import DoctorAppointmentCard from "components/card/DoctorAppointmentCard";
import { useRequireRole } from "hooks/useRequireRole";
import SmallInfoCard from "components/card/SmallInfoCard";
import Calendar from "components/calendar/Calendar";
import { Heartbeat } from "phosphor-react";
import PrimaryButton from "components/buttons/PrimaryButton";

const DoctorDashboard: React.FC = () => {
  const [sortBy, setSortBy] = useState("upcoming");
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [monthAppointments, setMonthAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useRequireRole("Doctor");

  // Sample appointments for today - replace with actual API call
  useEffect(() => {
    // This would be replaced with actual API call to fetch today's appointments
    const sampleAppointments: Appointment[] = [
      {
        _id: "1",
        appointmentID: "apt123",
        patientID: "patient1",
        doctorID: "doctor1",
        summary: "Surgery",
        startTime: new Date("2025-09-20T09:00:00"),
        endTime: new Date("2025-09-20T10:00:00"),
        status: "Scheduled",
      },
      {
        _id: "2",
        appointmentID: "apt124",
        patientID: "patient2",
        doctorID: "doctor1",
        summary: "Surgery",
        startTime: new Date("2025-09-20T10:00:00"),
        endTime: new Date("2025-09-20T11:00:00"),
        status: "Scheduled",
      },
      {
        _id: "3",
        appointmentID: "apt125",
        patientID: "patient3",
        doctorID: "doctor1",
        summary: "Surgery",
        startTime: new Date("2025-09-20T13:00:00"),
        endTime: new Date("2025-09-20T14:00:00"),
        status: "Scheduled",
      },
      {
        _id: "4",
        appointmentID: "apt126",
        patientID: "patient4",
        doctorID: "doctor1",
        summary: "Surgery",
        startTime: new Date("2025-09-20T15:00:00"),
        endTime: new Date("2025-09-20T16:00:00"),
        status: "Scheduled",
      },
    ];
    setTodayAppointments(sampleAppointments);

    // Sample appointments for the month - replace with actual API call
    const monthSampleAppointments: Appointment[] = [
      ...sampleAppointments, // Include today's appointments
      {
        _id: "5",
        appointmentID: "apt127",
        patientID: "patient5",
        doctorID: "doctor1",
        summary: "Consultation",
        startTime: new Date("2025-11-25T10:00:00"),
        endTime: new Date("2025-11-25T11:00:00"),
        status: "Scheduled",
      },
      {
        _id: "6",
        appointmentID: "apt128",
        patientID: "patient6",
        doctorID: "doctor1",
        summary: "Follow-up",
        startTime: new Date("2025-11-27T14:00:00"),
        endTime: new Date("2025-11-27T15:00:00"),
        status: "Scheduled",
      },
      {
        _id: "7",
        appointmentID: "apt129",
        patientID: "patient7",
        doctorID: "doctor1",
        summary: "Check-up",
        startTime: new Date("2025-11-28T09:00:00"),
        endTime: new Date("2025-11-28T10:00:00"),
        status: "Scheduled",
      },
      {
        _id: "8",
        appointmentID: "apt130",
        patientID: "patient8",
        doctorID: "doctor1",
        summary: "Surgery",
        startTime: new Date("2025-11-30T11:00:00"),
        endTime: new Date("2025-11-30T13:00:00"),
        status: "Scheduled",
      },
    ];
    setMonthAppointments(monthSampleAppointments);
  }, []);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
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

  const timeSlots = generateTimeSlots();

  // Helper function to check if appointment is in this time slot
  const getAppointmentForTimeSlot = (hour: number) => {
    return todayAppointments.find((apt) => {
      const aptHour = new Date(apt.startTime).getHours();
      return aptHour === hour;
    });
  };

  // Format date for display
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get appointment dates for calendar highlighting
  const getAppointmentDates = (): Date[] => {
    return monthAppointments.map((apt) => new Date(apt.startTime));
  };

  // Handle calendar date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // You can add logic here to filter appointments for the selected date
    // or navigate to a detailed view for that date
    console.log("Selected date:", date);

    // Find appointments for selected date
    const selectedDateAppointments = monthAppointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      return (
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear()
      );
    });

    if (selectedDateAppointments.length > 0) {
      console.log(
        `Found ${selectedDateAppointments.length} appointments on this date`
      );
      // You can show these appointments in a modal or sidebar
    }
  };

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary to-[#6886AC] text-white py-8 px-6">
        <div className="text-left p-7">
          <h2 className="text-3xl font-semibold">Welcome Back, Doctor!</h2>
        </div>
      </div>

      <div className="mx-12 flex flex-row">
        <div className="p-8 w-3/5">
          <h1 className="text-2xl font-normal mb-6">Today's Appointments</h1>

          <div className="relative">
            <div className="absolute left-[75px] top-0 bottom-0 w-px bg-gray-300"></div>

            {timeSlots.map((slot, index) => {
              const appointment = getAppointmentForTimeSlot(slot.hour);
              const hasAppointment = !!appointment;

              return (
                <div key={slot.hour} className="relative flex items-start mb-2">
                  <div className="w-20 text-sm font-medium text-gray-600 pt-2">
                    {slot.displayTime}
                  </div>

                  <div
                    className={`absolute left-[71px] w-2 h-2 rounded-full ${
                      hasAppointment ? "bg-primary" : "bg-gray-300"
                    } mt-3 z-10`}
                  ></div>

                  <div className="ml-8 flex-1 min-h-[120px] pb-4">
                    {appointment ? (
                      <DoctorAppointmentCard
                        dateOfAppointment={new Date(appointment.startTime)}
                        patientId={appointment.patientID as string}
                        appointmentType={
                          appointment.summary || "General Consultation"
                        }
                        appointmentDescription="This patient has been feeling sick and needs medical attention for recurring symptoms."
                        appointmentId={appointment.appointmentID}
                      />
                    ) : (
                      <div className="min-h-[120px] border-b border-gray-100"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-8 w-2/5 gap-6 flex flex-col border-l border-gray-200">
          <h1 className="text-2xl font-normal">This Week's Stats</h1>
          <div className="flex flex-row gap-6">
            <SmallInfoCard
              icon={Heartbeat}
              title={"Patients Seen This Week"}
              value={"10"}
              width={"1/2"}
            />
            <SmallInfoCard
              icon={Heartbeat}
              title={"Pending Appointments"}
              value={monthAppointments.length}
              width={"1/2"}
            />
          </div>

          <h1 className="text-2xl font-normal mb-4">This Month's Schedule</h1>

          {/* Calendar Component */}
          <Calendar
            selectedDates={selectedDate ? [selectedDate] : []}
            highlightedDates={getAppointmentDates()}
            onDateSelect={handleDateSelect}
            className="w-full"
          />
          <PrimaryButton
            text={"Add Availability"}
            variant={"primary"}
            size={"small"}
          ></PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
