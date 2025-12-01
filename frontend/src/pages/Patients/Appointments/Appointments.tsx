import React, { useState, useEffect } from "react";
import AppointmentCard from "components/card/AppointmentCard";
import CustomDropdown from "components/input/Dropdown";
import { useRequireRole } from "hooks/useRequireRole";
import { appointmentService } from "api/services/appointment.service";
import { patientService } from "api/services/patient.service";
import toast from "react-hot-toast";
import { Calendar, Clock, CheckCircle, XCircle } from "phosphor-react";
import { useNavigate } from "react-router-dom";
import CancelAppointmentModal from "components/modal/CancelAppointmentModal";
import { userService } from "api/services/user.service";

const Appointments = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("All");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState<string>("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [processingCancel, setProcessingCancel] = useState(false);
  const [doctorId, setDoctorId] = useState<string>("");
  useRequireRole("Patient");

  // Get patient ID
  useEffect(() => {
    const fetchPatientInfo = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        try {
          const patientData = await patientService.getById(user._id);
          setPatientId(patientData._id);
        } catch (error) {
          console.error("Failed to get patient info:", error);
          setPatientId(user._id);
        }
      }
    };

    fetchPatientInfo();
  }, []);

  // Fetch appointments
  useEffect(() => {
    if (patientId) {
      fetchAppointments();
    }
  }, [patientId]);

  const fetchAppointments = async () => {
    if (!patientId) return;

    try {
      setLoading(true);
      const response: any = await appointmentService.getPatientAppointments(
        patientId
      );
      console.log("Fetched patient appointments:", response);

      const appointmentsData = Array.isArray(response)
        ? response
        : response.appointments || [];

      // Log any appointments with unusual durations
      appointmentsData.forEach((apt: any) => {
        const start = new Date(apt.startTime);
        const end = new Date(apt.endTime);
        const durationHours =
          (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        if (durationHours > 2) {
          console.warn(
            `Appointment ${apt._id} has unusual duration: ${durationHours} hours`,
            apt
          );
        }
      });

      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
      if (error instanceof Error && !error.message.includes("404")) {
        toast.error("Failed to load appointments");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleCancelAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancellation = async (
    reason: string,
    type: "cancel" | "no-show"
  ) => {
    if (!selectedAppointment) return;

    setProcessingCancel(true);
    try {
      await appointmentService.cancelWithReason(
        selectedAppointment._id,
        reason,
        "patient"
      );
      toast.success("Appointment cancelled and doctor notified");

      // Refresh appointments
      await fetchAppointments();
      setIsCancelModalOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Failed to cancel appointment. Please try again.");
    } finally {
      setProcessingCancel(false);
    }
  };

  // Handlers
  const handleViewDetails = (appointment: any) => {
    navigate(`/patient/appointment/${appointment._id}`);
  };

  // Separate and sort appointments based on dropdown selection
  const getFilteredAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = [...appointments];

    if (sortBy === "Upcoming Appointments") {
      filtered = filtered.filter(
        (apt) =>
          new Date(apt.startTime) >= today &&
          apt.status !== "Cancelled" &&
          apt.status !== "Completed"
      );
      filtered.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    } else if (sortBy === "Past Appointments") {
      filtered = filtered.filter(
        (apt) =>
          new Date(apt.startTime) < today ||
          apt.status === "Completed" ||
          apt.status === "Cancelled"
      );
      filtered.sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
    } else {
      filtered.sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
    }

    return filtered;
  };

  const onViewProfile = (userId: string) => {
    navigate(`/doctor/${userId}`);
  };

  // Get upcoming and past appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = appointments.filter(
    (apt) =>
      new Date(apt.startTime) >= today &&
      apt.status !== "Cancelled" &&
      apt.status !== "Completed"
  );

  const pastAppointments = appointments.filter(
    (apt) =>
      new Date(apt.startTime) < today ||
      apt.status === "Completed" ||
      apt.status === "Cancelled"
  );

  // Group past appointments by time period for timeline
  const groupPastAppointments = () => {
    const groups: { [key: string]: any[] } = {
      "Past 6 Months": [],
      "Past 1 Year": [],
      Older: [],
    };

    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    pastAppointments.forEach((apt) => {
      const aptDate = new Date(apt.startTime);
      if (aptDate >= sixMonthsAgo) {
        groups["Past 6 Months"].push(apt);
      } else if (aptDate >= yearAgo) {
        groups["Past 1 Year"].push(apt);
      } else {
        groups["Older"].push(apt);
      }
    });

    // Return only non-empty groups
    return Object.entries(groups).filter(([_, apts]) => apts.length > 0);
  };

  const stats = {
    upcoming: upcomingAppointments.length,
    completed: appointments.filter((apt) => apt.status === "Completed").length,
    cancelled: appointments.filter((apt) => apt.status === "Cancelled").length,
    total: appointments.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const displayAppointments =
    sortBy === "All" ? appointments : getFilteredAppointments();
  const showUpcoming = sortBy === "Upcoming Appointments" || sortBy === "All";
  const showPast = sortBy === "Past Appointments" || sortBy === "All";

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary to-[#6886AC] text-white py-8 px-16">
        <h1 className="text-3xl font-semibold mb-4">My Appointments</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Calendar size={24} />
              <div>
                <p className="text-2xl font-bold">{stats.upcoming}</p>
                <p className="text-sm opacity-90">Upcoming</p>
              </div>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} />
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm opacity-90">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-3">
              <XCircle size={24} />
              <div>
                <p className="text-2xl font-bold">{stats.cancelled}</p>
                <p className="text-sm opacity-90">Cancelled</p>
              </div>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock size={24} />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm opacity-90">Total</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-16 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="w-80">
            <CustomDropdown
              label="Sort By"
              value={sortBy}
              onChange={setSortBy}
              options={["All", "Upcoming Appointments", "Past Appointments"]}
              placeholder="Select filter"
            />
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-stroke">
            <Calendar size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-primaryText mb-2">
              No appointments yet
            </h3>
            <p className="text-secondaryText">
              Book an appointment with a doctor to get started
            </p>
          </div>
        ) : (
          <>
            {showUpcoming && upcomingAppointments.length > 0 && (
              <div className="mb-12">
                <h2 className="font-semibold text-xl mb-6 text-primaryText flex items-center gap-2">
                  <Calendar size={24} className="text-primary" />
                  Upcoming Appointments
                </h2>

                <div className="flex flex-col gap-4">
                  {upcomingAppointments.map((appointment) => {
                    console.log("Full appointment:", appointment);
                    console.log("doctorID object:", appointment.doctorID);
                    console.log("doctorID._id:", appointment.doctorID?._id);
                    console.log("doctorID.user:", appointment.doctorID?.user);
                    return (
                      <AppointmentCard
                        key={appointment._id}
                        dateOfAppointment={new Date(appointment.startTime)}
                        doctorName={
                          appointment.doctorID?.user?.firstName &&
                          appointment.doctorID?.user?.lastName
                            ? `Dr. ${appointment.doctorID.user.firstName} ${appointment.doctorID.user.lastName}`
                            : "Doctor"
                        }
                        doctorUsername={
                          appointment.doctorID?.user?.email?.split("@")[0] ||
                          "doctor"
                        }
                        doctorId={
                          appointment.doctorID?.user?._id ||
                          appointment.doctorID
                        }
                        profilePic={appointment.doctorID?.user?.profilePic}
                        appointmentType={
                          appointment.summary || "Medical Consultation"
                        }
                        instructionId={appointment._id}
                        notes={appointment.description}
                        past={false}
                        status={appointment.status || "Scheduled"}
                        startTime={appointment.startTime}
                        endTime={appointment.endTime}
                        onCancel={() => handleCancelAppointment(appointment)}
                        onReschedule={() => {
                          console.log(
                            "Reschedule appointment:",
                            appointment._id
                          );
                        }}
                        onMessage={() => {
                          navigate(
                            `/messages?doctorId=${
                              appointment.doctorID?._id || appointment.doctorID
                            }`
                          );
                        }}
                        onViewProfile={onViewProfile}
                        width="full"
                        appointmentId={appointment._id}
                        onClick={() => handleViewDetails(appointment)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {showUpcoming &&
              upcomingAppointments.length === 0 &&
              sortBy === "Upcoming Appointments" && (
                <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-stroke">
                  <p className="text-secondaryText">No upcoming appointments</p>
                </div>
              )}

            {/* Past Appointments Section with Timeline */}
            {showPast && pastAppointments.length > 0 && (
              <div className="space-y-5">
                <h2 className="font-semibold text-xl mb-6 text-primaryText flex items-center gap-2">
                  <Clock size={24} className="text-primary" />
                  Past Appointments
                </h2>

                <div className="relative">
                  {/* Timeline vertical line */}
                  <div className="absolute left-2 top-0 bottom-0 w-[1px] bg-primaryText"></div>

                  {groupPastAppointments().map(
                    ([period, appointments], periodIndex) => (
                      <div key={period} className="mb-12 relative">
                        {/* Timeline dot */}
                        <div className="absolute left-0 w-4 h-4 bg-primaryText rounded-full border-4 border-white shadow-sm"></div>

                        {/* Period label */}
                        <div className="ml-10 mb-6">
                          <h3 className="font-medium text-lg text-primaryText">
                            {period}
                          </h3>
                        </div>

                        {/* Appointment cards in grid */}
                        <div className="ml-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {appointments.map((appointment) => (
                            <AppointmentCard
                              key={appointment._id}
                              dateOfAppointment={
                                new Date(appointment.startTime)
                              }
                              doctorName={
                                appointment.doctorID?.user?.firstName &&
                                appointment.doctorID?.user?.lastName
                                  ? `Dr. ${appointment.doctorID.user.firstName} ${appointment.doctorID.user.lastName}`
                                  : "Doctor"
                              }
                              doctorUsername={
                                appointment.doctorID?.user?.email?.split(
                                  "@"
                                )[0] || "doctor"
                              }
                              doctorId={
                                appointment.doctorID?.user?._id ||
                                appointment.doctorID
                              }
                              profilePic={
                                appointment.doctorID?.user?.profilePic
                              }
                              appointmentType={
                                appointment.summary || "Medical Consultation"
                              }
                              summaryId={
                                appointment.summaryId || appointment._id
                              }
                              instructionId={appointment._id}
                              notes={appointment.description}
                              past={true}
                              status={appointment.status || "Completed"}
                              startTime={appointment.startTime}
                              endTime={appointment.endTime}
                              onViewProfile={onViewProfile}
                              appointmentId={appointment._id}
                              onClick={() => handleViewDetails(appointment)}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {showPast &&
              pastAppointments.length === 0 &&
              sortBy === "Past Appointments" && (
                <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-stroke">
                  <p className="text-secondaryText">No past appointments</p>
                </div>
              )}
          </>
        )}
      </div>
      <CancelAppointmentModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          if (!processingCancel) {
            setIsCancelModalOpen(false);
            setSelectedAppointment(null);
          }
        }}
        onConfirm={handleConfirmCancellation}
        type="cancel"
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
        doctorName={
          selectedAppointment?.doctorID?.user?.firstName &&
          selectedAppointment?.doctorID?.user?.lastName
            ? `Dr. ${selectedAppointment.doctorID.user.firstName} ${selectedAppointment.doctorID.user.lastName}`
            : "Doctor"
        }
        isLoading={processingCancel}
      />
    </div>
  );
};

export default Appointments;
