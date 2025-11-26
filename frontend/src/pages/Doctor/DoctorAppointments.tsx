import React, { useState, useEffect } from "react";
import { useRequireRole } from "hooks/useRequireRole";
import DoctorAppointmentCard from "components/card/DoctorAppointmentCard";
import Dropdown from "components/input/Dropdown";
import PrimaryButton from "components/buttons/PrimaryButton";
import { Calendar, Clock, CheckCircle, Warning } from "phosphor-react";
import { appointmentService } from "api/services/appointment.service";
import { doctorService } from "api/services/doctor.service";
import toast from "react-hot-toast";

const DoctorAppointments: React.FC = () => {
  useRequireRole("Doctor");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("All");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [doctorId, setDoctorId] = useState<string>("");

  // Get doctor ID first
  useEffect(() => {
    const fetchDoctorInfo = async () => {
      const storedUser = localStorage.getItem("user");
      console.log("Stored user from localStorage:", storedUser);

      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log("Parsed user:", user);
        console.log("User ID:", user._id);
        console.log("User role:", user.role);

        try {
          const doctorData = await doctorService.getByUserId(user._id);
          console.log("Doctor data from service:", doctorData);
          console.log("Doctor ID:", doctorData._id);
          setDoctorId(doctorData._id);
        } catch (error) {
          console.error("Failed to get doctor info:", error);
          toast.error("Failed to load doctor information");
        }
      }
    };

    fetchDoctorInfo();
  }, []);

  // Debug: Monitor appointments state changes
  useEffect(() => {
    console.log("Appointments state changed:", appointments);
    console.log("Appointments length:", appointments.length);
  }, [appointments]);

  // Load appointments when doctor ID is available
  useEffect(() => {
    console.log("DoctorId changed:", doctorId);
    if (doctorId) {
      console.log("Calling fetchAppointments with doctorId:", doctorId);
      fetchAppointments();
    }
  }, [doctorId]);

  const fetchAppointments = async () => {
    if (!doctorId) return;

    try {
      setLoading(true);
      const response: any = await appointmentService.getDoctorAppointments(
        doctorId
      );
      console.log("Fetched appointments:", response);

      // FIX: The backend returns an array directly, NOT response.appointments
      const appointmentsData = Array.isArray(response) ? response : [];

      // Sort by date
      const sortedAppointments = appointmentsData.sort(
        (a: any, b: any) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );

      setAppointments(sortedAppointments);
      setFilteredAppointments(sortedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
      setFilteredAppointments([]);
      // Don't show error toast if API returns 404 (no appointments)
      if (error instanceof Error && !error.message.includes("404")) {
        toast.error("Failed to load appointments");
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort appointments
  useEffect(() => {
    console.log("=== Filter Effect Running ===");
    console.log("Initial appointments:", appointments);
    console.log("Current sortBy:", sortBy);
    console.log("Current filterStatus:", filterStatus);

    let filtered = [...appointments];

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (apt) => apt.status?.toLowerCase() === filterStatus.toLowerCase()
      );
      console.log(`After status filter (${filterStatus}):`, filtered);
    }

    // Filter by selected date
    if (selectedDate) {
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.startTime);
        return aptDate.toDateString() === selectedDate.toDateString();
      });
      console.log(`After date filter:`, filtered);
    }

    // Sort appointments
    filtered.sort((a, b) => {
      const dateA = new Date(a.startTime).getTime();
      const dateB = new Date(b.startTime).getTime();

      if (sortBy === "upcoming") {
        return dateA - dateB;
      } else if (sortBy === "past") {
        return dateB - dateA;
      }
      return 0;
    });

    console.log("Final filtered appointments:", filtered);
    setFilteredAppointments(filtered);
  }, [appointments, sortBy, filterStatus, selectedDate]);

  // Separate upcoming and past appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log("Today's date for comparison:", today);
  console.log(
    "Filtering appointments, total count:",
    filteredAppointments.length
  );

  const upcomingAppointments = filteredAppointments.filter((apt) => {
    const aptDate = new Date(apt.startTime);
    const isUpcoming =
      aptDate >= today &&
      apt.status !== "Cancelled" &&
      apt.status !== "Completed";
    console.log(
      `Appointment ${apt._id}: date=${aptDate}, isUpcoming=${isUpcoming}, status=${apt.status}`
    );
    return isUpcoming;
  });

  const pastAppointments = filteredAppointments.filter((apt) => {
    const aptDate = new Date(apt.startTime);
    const isPast =
      aptDate < today ||
      apt.status === "Completed" ||
      apt.status === "Cancelled";
    return isPast;
  });

  console.log("Upcoming appointments count:", upcomingAppointments.length);
  console.log("Past appointments count:", pastAppointments.length);

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
  const handleViewDetails = (appointment: any) => {
    console.log("View details:", appointment);
  };

  const handleMessagePatient = (patientId: string) => {
    console.log("Message patient:", patientId);
    // Navigate to messages with this patient
    window.location.href = `/messages?patientId=${patientId}`;
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await appointmentService.cancel(appointmentId);
      toast.success("Appointment cancelled successfully");
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      toast.error("Failed to cancel appointment");
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      await appointmentService.updateStatus(appointmentId, "Completed");
      toast.success("Appointment marked as completed");
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error("Failed to complete appointment:", error);
      toast.error("Failed to complete appointment");
    }
  };

  const handleMarkNoShow = async (appointmentId: string) => {
    try {
      await appointmentService.updateStatus(appointmentId, "No-Show");
      toast.success("Appointment marked as no-show");
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error("Failed to update appointment:", error);
      toast.error("Failed to update appointment");
    }
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
                options={["Upcoming", "Past", "All"]}
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
                <option value="All">All Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="No-Show">No-Show</option>
              </select>
            </div>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-primaryText mb-2">
              No appointments yet
            </h3>
            <p className="text-secondaryText">
              Appointments will appear here once patients book them
            </p>
          </div>
        ) : (
          <>
            {upcomingAppointments.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-primaryText">
                  Upcoming Appointments ({upcomingAppointments.length})
                </h2>
                <div className="max-w-4xl space-y-5">
                  {upcomingAppointments.map((appointment) => (
                    <DoctorAppointmentCard
                      key={appointment._id}
                      startTime={appointment.startTime}
                      endTime={appointment.endTime}
                      patientName={
                        appointment.patientID?.user?.firstName &&
                        appointment.patientID?.user?.lastName
                          ? `${appointment.patientID.user.firstName} ${appointment.patientID.user.lastName}`
                          : "Unknown Patient"
                      }
                      patientId={
                        appointment.patientID?._id || appointment.patientID
                      }
                      patientProfilePic={
                        appointment.patientID?.user?.profilePic
                      }
                      appointmentType={
                        appointment.summary || "Medical Consultation"
                      }
                      appointmentDescription={appointment.description}
                      appointmentId={appointment._id}
                      status={appointment.status || "Scheduled"}
                      isCurrentAppointment={false}
                      onViewDetails={() => handleViewDetails(appointment)}
                      onMessage={() =>
                        handleMessagePatient(
                          appointment.patientID?._id || appointment.patientID
                        )
                      }
                      onComplete={() =>
                        handleCompleteAppointment(appointment._id)
                      }
                      onCancel={() => handleCancelAppointment(appointment._id)}
                      onMarkNoShow={() => handleMarkNoShow(appointment._id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {pastAppointments.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-primaryText">
                  Past Appointments ({pastAppointments.length})
                </h2>
                <div className="max-w-4xl">
                  {pastAppointments.map((appointment) => (
                    <DoctorAppointmentCard
                      key={appointment._id}
                      startTime={appointment.startTime}
                      endTime={appointment.endTime}
                      patientName={
                        appointment.patientID?.user?.firstName &&
                        appointment.patientID?.user?.lastName
                          ? `${appointment.patientID.user.firstName} ${appointment.patientID.user.lastName}`
                          : "Unknown Patient"
                      }
                      patientId={
                        appointment.patientID?._id || appointment.patientID
                      }
                      patientProfilePic={
                        appointment.patientID?.user?.profilePic
                      }
                      appointmentType={
                        appointment.summary || "Medical Consultation"
                      }
                      appointmentDescription={appointment.description}
                      appointmentId={appointment._id}
                      status={appointment.status || "Completed"}
                      isCurrentAppointment={false}
                      onViewDetails={() => handleViewDetails(appointment)}
                      onMessage={() =>
                        handleMessagePatient(
                          appointment.patientID?._id || appointment.patientID
                        )
                      }
                      isTimeline={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
