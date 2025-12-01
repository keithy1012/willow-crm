import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRequireRole } from "hooks/useRequireRole";
import DoctorAppointmentCard from "components/card/DoctorAppointmentCard";
import CustomDropdown from "components/input/Dropdown";
import PrimaryButton from "components/buttons/PrimaryButton";
import { Calendar, Clock, CheckCircle, Warning } from "phosphor-react";
import { appointmentService } from "api/services/appointment.service";
import { doctorService } from "api/services/doctor.service";
import toast from "react-hot-toast";
import CancelAppointmentModal from "components/modal/CancelAppointmentModal";

const DoctorAppointments: React.FC = () => {
  useRequireRole("Doctor");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [doctorId, setDoctorId] = useState<string>("");
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelType, setCancelType] = useState<"cancel" | "no-show">("cancel");
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [processingCancel, setProcessingCancel] = useState(false);

  const navigate = useNavigate();

  // Get doctor ID first
  useEffect(() => {
    const fetchDoctorInfo = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        try {
          const doctorData = await doctorService.getByUserId(user._id);
          setDoctorId(doctorData._id);
        } catch (error) {
          console.error("Failed to get doctor info:", error);
          toast.error("Failed to load doctor information");
        }
      }
    };

    fetchDoctorInfo();
  }, []);

  // Load appointments when doctor ID is available
  useEffect(() => {
    if (doctorId) {
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

      const appointmentsData = Array.isArray(response) ? response : [];

      // Sort by date
      const sortedAppointments = appointmentsData.sort(
        (a: any, b: any) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );

      setAppointments(sortedAppointments);
      setFilteredAppointments(sortedAppointments);

      // Filter today's appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayAppts = sortedAppointments.filter((apt: any) => {
        const aptDate = new Date(apt.startTime);
        return (
          aptDate >= today &&
          aptDate < tomorrow &&
          apt.status !== "Cancelled" &&
          apt.status !== "Completed"
        );
      });

      setTodayAppointments(todayAppts);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
      setFilteredAppointments([]);
      setTodayAppointments([]);
      if (error instanceof Error && !error.message.includes("404")) {
        toast.error("Failed to load appointments");
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort appointments
  useEffect(() => {
    let filtered = [...appointments];

    // Filter by status
    if (filterStatus !== "All Status") {
      filtered = filtered.filter(
        (apt) => apt.status === filterStatus.replace(" Status", "")
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (sortBy === "Upcoming") {
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.startTime);
        return (
          aptDate >= today &&
          apt.status !== "Cancelled" &&
          apt.status !== "Completed"
        );
      });
      filtered.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    } else if (sortBy === "Past") {
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.startTime);
        return (
          aptDate < today ||
          apt.status === "Completed" ||
          apt.status === "Cancelled"
        );
      });
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

    setFilteredAppointments(filtered);
  }, [appointments, sortBy, filterStatus, selectedDate]);

  // Separate upcoming and past appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = filteredAppointments.filter((apt) => {
    const aptDate = new Date(apt.startTime);
    return (
      aptDate >= today &&
      apt.status !== "Cancelled" &&
      apt.status !== "Completed"
    );
  });

  const pastAppointments = filteredAppointments.filter((apt) => {
    const aptDate = new Date(apt.startTime);
    return (
      aptDate < today ||
      apt.status === "Completed" ||
      apt.status === "Cancelled"
    );
  });

  // Calculate statistics
  const stats = {
    todayCount: todayAppointments.length,
    weekCount: appointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return (
        aptDate >= new Date() &&
        aptDate <= weekFromNow &&
        apt.status !== "Cancelled" &&
        apt.status !== "Completed"
      );
    }).length,
    completedCount: appointments.filter((apt) => apt.status === "Completed")
      .length,
    noShowCount: appointments.filter((apt) => apt.status === "No-Show").length,
  };

  // Generate time slots for timeline
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

  // Handlers
  const handleViewDetails = (appointment: any) => {
    navigate(`/doctor/appointment/${appointment._id}`);
  };

  const handleMessagePatient = (patientId: string) => {
    navigate(`/doctormessages?patientId=${patientId}`);
  };

  const handleViewPatientProfile = (patientId: string) => {
    navigate(`/patient/${patientId}`);
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      await appointmentService.updateStatus(appointmentId, "Completed");
      toast.success("Appointment marked as completed");
      fetchAppointments();
    } catch (error) {
      console.error("Failed to complete appointment:", error);
      toast.error("Failed to complete appointment");
    }
  };

  const handleStartAppointment = async (appointmentId: string) => {
    try {
      await appointmentService.updateStatus(appointmentId, "In-Progress");
      toast.success("Appointment started");
      fetchAppointments();
    } catch (error) {
      console.error("Failed to start appointment:", error);
      toast.error("Failed to start appointment");
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
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 flex gap-4">
            <div className="w-64">
              <CustomDropdown
                label="Sort By"
                value={sortBy}
                onChange={setSortBy}
                options={["All", "Upcoming", "Past"]}
                placeholder="Select sort option"
              />
            </div>
            <div className="w-64">
              <CustomDropdown
                label="Filter Status"
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  "All Status",
                  "Scheduled",
                  "Completed",
                  "Cancelled",
                  "No-Show",
                ]}
                placeholder="Select status"
              />
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
            {todayAppointments.length > 0 && sortBy !== "Past" && (
              <div className="mb-12">
                <h2 className="text-xl font-semibold mb-6 text-primaryText flex items-center gap-2">
                  <Calendar size={24} className="text-primary" />
                  Today's Schedule - Timeline View
                </h2>
                <div className="max-w-5xl space-y-2">
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
                              : "Unknown Patient"
                          }
                          patientUsername={
                            appointment.patientID?.user?.username
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
                          isCurrentAppointment={isAppointmentCurrent(
                            appointment
                          )}
                          onViewDetails={() => handleViewDetails(appointment)}
                          onMessage={() =>
                            handleMessagePatient(
                              appointment.patientID?._id ||
                                appointment.patientID
                            )
                          }
                          onViewProfile={() =>
                            handleViewPatientProfile(
                              appointment.patientID?._id ||
                                appointment.patientID
                            )
                          }
                          onComplete={() =>
                            handleCompleteAppointment(appointment._id)
                          }
                          onCancel={() => handleCancelAppointment(appointment)}
                          onMarkNoShow={() => handleMarkNoShow(appointment)}
                          onStartAppointment={() =>
                            handleStartAppointment(appointment._id)
                          }
                          isTimeline={true}
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
                </div>
              </div>
            )}

            {upcomingAppointments.filter((apt) => {
              const aptDate = new Date(apt.startTime);
              const todayEnd = new Date();
              todayEnd.setHours(23, 59, 59, 999);
              return aptDate > todayEnd;
            }).length > 0 &&
              sortBy !== "Past" && (
                <div className="mb-12">
                  <h2 className="text-xl font-semibold mb-6 text-primaryText">
                    Future Appointments (
                    {
                      upcomingAppointments.filter((apt) => {
                        const aptDate = new Date(apt.startTime);
                        const todayEnd = new Date();
                        todayEnd.setHours(23, 59, 59, 999);
                        return aptDate > todayEnd;
                      }).length
                    }
                    )
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {upcomingAppointments
                      .filter((apt) => {
                        const aptDate = new Date(apt.startTime);
                        const todayEnd = new Date();
                        todayEnd.setHours(23, 59, 59, 999);
                        return aptDate > todayEnd;
                      })
                      .map((appointment) => (
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
                          patientUsername={
                            appointment.patientID?.user?.username
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
                              appointment.patientID?._id ||
                                appointment.patientID
                            )
                          }
                          onViewProfile={() =>
                            handleViewPatientProfile(
                              appointment.patientID?._id ||
                                appointment.patientID
                            )
                          }
                          onComplete={() =>
                            handleCompleteAppointment(appointment._id)
                          }
                          onCancel={() => handleCancelAppointment(appointment)}
                          onMarkNoShow={() => handleMarkNoShow(appointment)}
                          isTimeline={false}
                          onClick={() => handleViewDetails(appointment)}
                        />
                      ))}
                  </div>
                </div>
              )}

            {pastAppointments.length > 0 && sortBy !== "Upcoming" && (
              <div>
                <h2 className="text-xl font-semibold mb-6 text-primaryText">
                  Past Appointments ({pastAppointments.length})
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      patientUsername={appointment.patientID?.user?.username}
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
                      onViewProfile={() =>
                        handleViewPatientProfile(
                          appointment.patientID?._id || appointment.patientID
                        )
                      }
                      isTimeline={false}
                      onClick={() => handleViewDetails(appointment)}
                    />
                  ))}
                </div>
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

export default DoctorAppointments;
