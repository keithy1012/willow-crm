import React, { useState, useEffect } from "react";
import { EnhancedAppointment } from "api/types/appointment.types";
import DoctorAppointmentCard from "components/card/DoctorAppointmentCard";
import { useRequireRole } from "hooks/useRequireRole";
import SmallInfoCard from "components/card/SmallInfoCard";
import Calendar from "components/calendar/Calendar";
import { Heartbeat } from "phosphor-react";
import PrimaryButton from "components/buttons/PrimaryButton";
import AvailabilityModal from "./AvailabilityModal";

// Patient data map for quick lookup
const patientDataMap = {
  patient1: {
    id: "patient1",
    name: "Sarah Johnson",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "(555) 123-4567",
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    dateOfBirth: "1985-03-15",
    medicalRecordNumber: "MRN-001234",
  },
  patient2: {
    id: "patient2",
    name: "Michael Chen",
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@email.com",
    phone: "(555) 234-5678",
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    dateOfBirth: "1972-08-22",
    medicalRecordNumber: "MRN-001235",
  },
  patient3: {
    id: "patient3",
    name: "Emily Rodriguez",
    firstName: "Emily",
    lastName: "Rodriguez",
    email: "emily.rodriguez@email.com",
    phone: "(555) 345-6789",
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    dateOfBirth: "1990-11-30",
    medicalRecordNumber: "MRN-001236",
  },
  patient4: {
    id: "patient4",
    name: "David Kim",
    firstName: "David",
    lastName: "Kim",
    email: "david.kim@email.com",
    phone: "(555) 456-7890",
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    dateOfBirth: "1968-05-10",
    medicalRecordNumber: "MRN-001237",
  },
  patient5: {
    id: "patient5",
    name: "Lisa Thompson",
    firstName: "Lisa",
    lastName: "Thompson",
    email: "lisa.thompson@email.com",
    phone: "(555) 567-8901",
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    dateOfBirth: "1982-09-18",
    medicalRecordNumber: "MRN-001238",
  },
  patient6: {
    id: "patient6",
    name: "Robert Martinez",
    firstName: "Robert",
    lastName: "Martinez",
    email: "robert.martinez@email.com",
    phone: "(555) 678-9012",
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
    dateOfBirth: "1995-12-05",
    medicalRecordNumber: "MRN-001239",
  },
  patient7: {
    id: "patient7",
    name: "Jennifer Lee",
    firstName: "Jennifer",
    lastName: "Lee",
    email: "jennifer.lee@email.com",
    phone: "(555) 789-0123",
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer",
    dateOfBirth: "1978-07-25",
    medicalRecordNumber: "MRN-001240",
  },
  patient8: {
    id: "patient8",
    name: "William Brown",
    firstName: "William",
    lastName: "Brown",
    email: "william.brown@email.com",
    phone: "(555) 890-1234",
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=William",
    dateOfBirth: "1988-02-14",
    medicalRecordNumber: "MRN-001241",
  },
};

// Helper function to get today's appointments
const getTodayAppointments = (): EnhancedAppointment[] => {
  const today = new Date();
  const baseDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return [
    {
      _id: "1",
      appointmentID: "APT-2024-001",
      patientID: "patient1",
      doctorID: "doctor1",
      summary: "Post-Surgery Follow-up",
      description:
        "Check surgical site healing, remove stitches if appropriate, discuss recovery progress",
      startTime: new Date(baseDate.getTime() + 9 * 60 * 60 * 1000), // 9:00 AM
      endTime: new Date(baseDate.getTime() + 10 * 60 * 60 * 1000), // 10:00 AM
      status: "Scheduled",
      patient: patientDataMap["patient1"],
      appointmentReason: "2-week post-operative checkup",
      insuranceVerified: true,
      copayAmount: 25,
      reminderSent: true,
      notes:
        "Patient reported mild discomfort at incision site via patient portal",
    },
    {
      _id: "2",
      appointmentID: "APT-2024-002",
      patientID: "patient2",
      doctorID: "doctor1",
      summary: "Diabetes Management",
      description:
        "Quarterly diabetes checkup, A1C review, medication adjustment if needed",
      startTime: new Date(baseDate.getTime() + 10.5 * 60 * 60 * 1000), // 10:30 AM
      endTime: new Date(baseDate.getTime() + 11.5 * 60 * 60 * 1000), // 11:30 AM
      status: "Completed",
      patient: patientDataMap["patient2"],
      appointmentReason: "Regular diabetes follow-up",
      insuranceVerified: true,
      copayAmount: 40,
      reminderSent: true,
      notes: "Lab work completed last week - results in chart",
    },
    {
      _id: "3",
      appointmentID: "APT-2024-003",
      patientID: "patient3",
      doctorID: "doctor1",
      summary: "Annual Physical",
      description:
        "Comprehensive annual health examination with preventive screening",
      startTime: new Date(baseDate.getTime() + 13 * 60 * 60 * 1000), // 1:00 PM
      endTime: new Date(baseDate.getTime() + 14 * 60 * 60 * 1000), // 2:00 PM
      status: "No-Show",
      patient: patientDataMap["patient3"],
      appointmentReason: "Annual wellness exam",
      insuranceVerified: true,
      copayAmount: 0,
      reminderSent: true,
      notes: "Patient requested discussion about stress management",
    },
    {
      _id: "4",
      appointmentID: "APT-2024-004",
      patientID: "patient4",
      doctorID: "doctor1",
      summary: "Hypertension Follow-up",
      description:
        "Blood pressure monitoring, medication efficacy review, lifestyle counseling",
      startTime: new Date(baseDate.getTime() + 14.5 * 60 * 60 * 1000), // 2:30 PM
      endTime: new Date(baseDate.getTime() + 15.25 * 60 * 60 * 1000), // 3:15 PM
      status: "In-Progress",
      patient: patientDataMap["patient4"],
      appointmentReason: "3-month BP medication follow-up",
      insuranceVerified: true,
      copayAmount: 25,
      reminderSent: true,
      notes: "Home BP log requested - remind patient to bring",
    },
    {
      _id: "5",
      appointmentID: "APT-2024-005",
      patientID: "patient5",
      doctorID: "doctor1",
      summary: "Acute Visit - Respiratory",
      description:
        "Patient reports persistent cough and chest congestion for 5 days",
      startTime: new Date(baseDate.getTime() + 16 * 60 * 60 * 1000), // 4:00 PM
      endTime: new Date(baseDate.getTime() + 16.5 * 60 * 60 * 1000), // 4:30 PM
      status: "Cancelled",
      patient: patientDataMap["patient5"],
      appointmentReason: "Acute respiratory symptoms",
      insuranceVerified: false,
      copayAmount: 50,
      reminderSent: false,
      notes: "Same-day appointment added this morning",
    },
  ];
};

// Helper function to get month's appointments
const getMonthAppointments = (): EnhancedAppointment[] => {
  const todayAppointments = getTodayAppointments();

  // Additional appointments for the month
  const additionalAppointments: EnhancedAppointment[] = [
    {
      _id: "6",
      appointmentID: "APT-2024-006",
      patientID: "patient6",
      doctorID: "doctor1",
      summary: "Consultation - Joint Pain",
      description:
        "New patient consultation for chronic knee pain, possible referral to orthopedics",
      startTime: new Date(2025, 10, 25, 10, 0), // Nov 25
      endTime: new Date(2025, 10, 25, 11, 0),
      status: "Scheduled",
      patient: patientDataMap["patient6"],
      appointmentReason: "Chronic knee pain evaluation",
      insuranceVerified: true,
      copayAmount: 60,
      reminderSent: false,
      notes: "X-rays ordered - results pending",
    },
    {
      _id: "7",
      appointmentID: "APT-2024-007",
      patientID: "patient7",
      doctorID: "doctor1",
      summary: "Mental Health Check-in",
      description: "Follow-up for anxiety management, medication review",
      startTime: new Date(2025, 10, 26, 14, 0), // Nov 26
      endTime: new Date(2025, 10, 26, 14, 45),
      status: "Scheduled",
      patient: patientDataMap["patient7"],
      appointmentReason: "Monthly mental health follow-up",
      insuranceVerified: true,
      copayAmount: 25,
      reminderSent: true,
      notes: "Virtual appointment - send link 15 min before",
    },
    {
      _id: "8",
      appointmentID: "APT-2024-008",
      patientID: "patient8",
      doctorID: "doctor1",
      summary: "Allergy Testing Results",
      description: "Review allergy panel results and discuss treatment options",
      startTime: new Date(2025, 10, 27, 9, 0), // Nov 27
      endTime: new Date(2025, 10, 27, 9, 30),
      status: "Scheduled",
      patient: patientDataMap["patient8"],
      appointmentReason: "Allergy test results review",
      insuranceVerified: true,
      copayAmount: 25,
      reminderSent: true,
      notes:
        "Severe peanut allergy confirmed - prepare EpiPen training materials",
    },
  ];

  return [...todayAppointments, ...additionalAppointments];
};

// Helper function to check if appointment is current
const isAppointmentCurrent = (appointment: EnhancedAppointment): boolean => {
  const now = new Date();
  const start = new Date(appointment.startTime);
  const end = new Date(appointment.endTime);
  return now >= start && now <= end;
};

const DoctorDashboard: React.FC = () => {
  const [todayAppointments, setTodayAppointments] = useState<
    EnhancedAppointment[]
  >([]);
  const [monthAppointments, setMonthAppointments] = useState<
    EnhancedAppointment[]
  >([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useRequireRole("Doctor");

  useEffect(() => {
    // In production, replace with actual API calls
    setTodayAppointments(getTodayAppointments());
    setMonthAppointments(getMonthAppointments());
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

  // Helper function to get appointments in a time slot
  const getAppointmentsForTimeSlot = (hour: number) => {
    return todayAppointments.filter((apt) => {
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
        `Found ${selectedDateAppointments.length} appointments on ${formatDate(
          date
        )}`
      );
      // You can show these appointments in a modal or sidebar
    }
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleAvailability = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary to-[#6886AC] text-white py-12 px-12">
        <div className="text-left">
          <h2 className="text-3xl font-semibold">Welcome Back, Doctor!</h2>
          <p className="text-lg mt-2 opacity-90">
            {formatDate(new Date())} - You have {todayAppointments.length}{" "}
            appointments today
          </p>
        </div>
      </div>

      <div className="mx-12 flex flex-row">
        <div className="pr-8 py-8 w-3/5">
          <h1 className="text-2xl font-normal mb-6">Today's Schedule</h1>

          <div className="space-y-2">
            {timeSlots.map((slot) => {
              const appointments = getAppointmentsForTimeSlot(slot.hour);

              if (appointments.length > 0) {
                return appointments.map((appointment) => (
                  <DoctorAppointmentCard
                    key={appointment._id}
                    startTime={appointment.startTime}
                    endTime={appointment.endTime}
                    patientName={appointment.patient?.name || "Unknown Patient"}
                    patientId={appointment.patientID}
                    patientProfilePic={appointment.patient?.profilePic}
                    appointmentType={appointment.summary}
                    appointmentDescription={appointment.description}
                    appointmentId={appointment.appointmentID}
                    status={appointment.status}
                    isCurrentAppointment={isAppointmentCurrent(appointment)}
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
          </div>
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

          <h1 className="text-2xl font-normal mb-4">This Month's Schedule</h1>
          <Calendar
            selectedDates={selectedDate ? [selectedDate] : []}
            highlightedDates={getAppointmentDates()}
            onDateSelect={handleDateSelect}
            className="w-full"
          />

          <PrimaryButton
            text="Add Availability"
            variant="primary"
            size="small"
            onClick={handleAvailability}
          />
        </div>
      </div>
      <AvailabilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={(data) => {
          console.log("Availability data:", data);
          // Handle the availability data here
        }}
      />
    </div>
  );
};

export default DoctorDashboard;
