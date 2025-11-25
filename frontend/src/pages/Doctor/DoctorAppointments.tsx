import React, { useState, useEffect } from "react";
import { useRequireRole } from "hooks/useRequireRole";
import { Appointment, PopulatedAppointment } from "api/types/appointment.types";
import { Patient } from "api/types/patient.types";
import { User } from "api/types/user.types";
import DoctorAppointmentCard from "components/card/DoctorAppointmentCard";
import SmallInfoCard from "components/card/SmallInfoCard";
import Dropdown from "components/input/Dropdown";
import PrimaryButton from "components/buttons/PrimaryButton";
import ProfileAvatar from "components/avatar/Avatar";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Warning,
  Users,
  FirstAid,
} from "phosphor-react";
import EnhancedAppointmentCard from "components/card/MoreInfoAppointmentCard";

// Main Doctor Appointments Page
const DoctorAppointments: React.FC = () => {
  useRequireRole("Doctor");

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [sortBy, setSortBy] = useState("upcoming");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Load appointments
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await appointmentService.getDoctorAppointments();

      // Sample data
      const sampleAppointments: Appointment[] = [
        {
          _id: "1",
          appointmentID: "APT001",
          patientID: {
            _id: "p1",
            user: {
              _id: "u1",
              firstName: "John",
              lastName: "Doe",
              email: "john.doe@email.com",
              phoneNumber: "(555) 123-4567",
              profilePic: undefined,
              role: "Patient",
            } as User,
            birthday: new Date("1980-05-15"),
            address: "123 Main St",
            bloodtype: "A+",
            allergies: ["Penicillin"],
            medicalHistory: ["Hypertension"],
            emergencyContact: [],
          } as Patient,
          doctorID: "doctor1",
          summary: "General Consultation",
          startTime: new Date("2025-11-24T09:00:00"),
          endTime: new Date("2025-11-24T10:00:00"),
          status: "Scheduled",
        },
        {
          _id: "2",
          appointmentID: "APT002",
          patientID: {
            _id: "p2",
            user: {
              _id: "u2",
              firstName: "Jane",
              lastName: "Smith",
              email: "jane.smith@email.com",
              phoneNumber: "(555) 987-6543",
              profilePic: undefined,
              role: "Patient",
            } as User,
            birthday: new Date("1975-08-22"),
            address: "456 Oak Ave",
            bloodtype: "O+",
            allergies: [],
            medicalHistory: ["Diabetes"],
            emergencyContact: [],
          } as Patient,
          doctorID: "doctor1",
          summary: "Follow-up Appointment",
          startTime: new Date("2025-11-24T14:00:00"),
          endTime: new Date("2025-11-24T15:00:00"),
          status: "Scheduled",
        },
        {
          _id: "3",
          appointmentID: "APT002",
          patientID: {
            _id: "p2",
            user: {
              _id: "u2",
              firstName: "Jane",
              lastName: "Smith",
              email: "jane.smith@email.com",
              phoneNumber: "(555) 987-6543",
              profilePic: undefined,
              role: "Patient",
            } as User,
            birthday: new Date("1975-08-22"),
            address: "456 Oak Ave",
            bloodtype: "O+",
            allergies: [],
            medicalHistory: ["Diabetes"],
            emergencyContact: [],
          } as Patient,
          doctorID: "doctor1",
          summary: "Follow-up Appointment",
          startTime: new Date("2025-11-24T14:00:00"),
          endTime: new Date("2025-11-24T15:00:00"),
          status: "Scheduled",
        },
        {
          _id: "3",
          appointmentID: "APT003",
          patientID: "patient3",
          doctorID: "doctor1",
          summary: "Post-Surgery Checkup",
          startTime: new Date("2025-11-20T10:00:00"),
          endTime: new Date("2025-11-20T11:00:00"),
          status: "Completed",
        },
        {
          _id: "4",
          appointmentID: "APT004",
          patientID: "patient4",
          doctorID: "doctor1",
          summary: "Routine Physical",
          startTime: new Date("2025-11-19T15:00:00"),
          endTime: new Date("2025-11-19T16:00:00"),
          status: "No-Show",
        },
      ];

      setAppointments(sampleAppointments);
      setFilteredAppointments(sampleAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort appointments
  useEffect(() => {
    let filtered = [...appointments];

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (apt) => apt.status.toLowerCase() === filterStatus
      );
    }

    // Filter by selected date
    if (selectedDate) {
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.startTime);
        return aptDate.toDateString() === selectedDate.toDateString();
      });
    }

    // Sort appointments
    filtered.sort((a, b) => {
      const dateA = new Date(a.startTime).getTime();
      const dateB = new Date(b.startTime).getTime();

      if (sortBy === "Upcoming") {
        return dateA - dateB;
      } else if (sortBy === "Past") {
        return dateB - dateA;
      }
      return 0;
    });

    setFilteredAppointments(filtered);
  }, [appointments, sortBy, filterStatus, selectedDate]);

  // Separate upcoming and past appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = filteredAppointments.filter(
    (apt) => new Date(apt.startTime) >= today
  );

  const pastAppointments = filteredAppointments.filter(
    (apt) => new Date(apt.startTime) < today
  );

  // Calculate statistics
  const stats = {
    todayCount: appointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      return aptDate.toDateString() === new Date().toDateString();
    }).length,
    weekCount: appointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return aptDate >= new Date() && aptDate <= weekFromNow;
    }).length,
    completedCount: appointments.filter((apt) => apt.status === "Completed")
      .length,
    noShowCount: appointments.filter((apt) => apt.status === "No-Show").length,
  };

  // Handlers
  const handleViewDetails = (
    appointment: Appointment | PopulatedAppointment
  ) => {
    console.log("View details:", appointment);
    // Navigate to appointment details page
  };

  const handleMessagePatient = (patientId: string) => {
    console.log("Message patient:", patientId);
    // Navigate to messages with this patient
  };

  const handleCancelAppointment = (appointmentId: string) => {
    console.log("Cancel appointment:", appointmentId);
    // Call API to cancel appointment
  };

  const handleCompleteAppointment = (appointmentId: string) => {
    console.log("Complete appointment:", appointmentId);
    // Call API to mark appointment as completed
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary to-[#6886AC] text-white py-12 px-12">
        <div>
          <h1 className="text-3xl font-semibold mb-4">My Appointments</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Calendar size={24} />
                <div>
                  <p className="text-2xl font-bold">{stats.todayCount}</p>
                  <p className="text-sm">Today</p>
                </div>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Clock size={24} />
                <div>
                  <p className="text-2xl font-bold">{stats.weekCount}</p>
                  <p className="text-sm">Next 7 Days</p>
                </div>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle size={24} />
                <div>
                  <p className="text-2xl font-bold">{stats.completedCount}</p>
                  <p className="text-sm">Completed</p>
                </div>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Warning size={24} />
                <div>
                  <p className="text-2xl font-bold">{stats.noShowCount}</p>
                  <p className="text-sm">No-Shows</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-12">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-4">
            <div className="w-48">
              <label className="text-sm text-secondaryText mb-1 block">
                Sort By
              </label>
              <Dropdown
                value={sortBy}
                onChange={setSortBy}
                options={["upcoming", "past", "all"]}
                placeholder="Select sort option"
              />
            </div>
            <div className="w-48">
              <label className="text-sm text-secondaryText mb-1 block">
                Filter Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stroke rounded-lg text-sm text-primaryText focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No-Show</option>
              </select>
            </div>
          </div>
        </div>

        {upcomingAppointments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-primaryText">
              Upcoming Appointments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingAppointments.map((appointment) => (
                <EnhancedAppointmentCard
                  key={appointment._id}
                  appointment={appointment}
                  onViewDetails={handleViewDetails}
                  onMessagePatient={handleMessagePatient}
                  onCancelAppointment={handleCancelAppointment}
                  onCompleteAppointment={handleCompleteAppointment}
                  isPast={false}
                />
              ))}
            </div>
          </div>
        )}

        {pastAppointments.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-primaryText">
              Past Appointments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastAppointments.map((appointment) => (
                <EnhancedAppointmentCard
                  key={appointment._id}
                  appointment={appointment}
                  onViewDetails={handleViewDetails}
                  onMessagePatient={handleMessagePatient}
                  onCancelAppointment={handleCancelAppointment}
                  onCompleteAppointment={handleCompleteAppointment}
                  isPast={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
