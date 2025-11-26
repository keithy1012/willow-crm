import React, { useState, useEffect } from "react";
import AppointmentCard from "components/card/AppointmentCard";
import Dropdown from "components/input/Dropdown";
import { useRequireRole } from "hooks/useRequireRole";
import { appointmentService } from "api/services/appointment.service";
import { patientService } from "api/services/patient.service";
import toast from "react-hot-toast";
import { Calendar, Clock, CheckCircle, XCircle } from "phosphor-react";

const Appointments = () => {
  const [sortBy, setSortBy] = useState("All");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState<string>("");

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

  // Separate and sort appointments based on dropdown selection
  const getFilteredAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = [...appointments];

    if (sortBy === "Upcoming") {
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
    } else if (sortBy === "Past") {
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

  const onViewProfile = (doctorId: string) => {
    window.location.href = `/doctor/${doctorId}`;
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

  // Group past appointments by time period
  const groupPastAppointments = () => {
    const groups: { [key: string]: any[] } = {
      "This Week": [],
      "This Month": [],
      "Last 3 Months": [],
      "Last 6 Months": [],
      Older: [],
    };

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    pastAppointments.forEach((apt) => {
      const aptDate = new Date(apt.startTime);
      if (aptDate >= weekAgo) {
        groups["This Week"].push(apt);
      } else if (aptDate >= monthAgo) {
        groups["This Month"].push(apt);
      } else if (aptDate >= threeMonthsAgo) {
        groups["Last 3 Months"].push(apt);
      } else if (aptDate >= sixMonthsAgo) {
        groups["Last 6 Months"].push(apt);
      } else {
        groups["Older"].push(apt);
      }
    });

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
  const showUpcoming = sortBy === "Upcoming" || sortBy === "All";
  const showPast = sortBy === "Past" || sortBy === "All";

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
          <div className="w-64">
            <label className="text-sm text-secondaryText mb-2 block">
              Filter Appointments
            </label>
            <Dropdown
              value={sortBy}
              onChange={setSortBy}
              options={["Upcoming", "Past", "All"]}
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
                  {upcomingAppointments.map((appointment) => (
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
                        appointment.doctorID?._id || appointment.doctorID
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
                      onCancel={() => {
                        // Handle cancel
                        console.log("Cancel appointment:", appointment._id);
                      }}
                      onReschedule={() => {
                        // Handle reschedule
                        console.log("Reschedule appointment:", appointment._id);
                      }}
                      onMessage={() => {
                        // Handle message
                        window.location.href = `/messages?doctorId=${
                          appointment.doctorID?._id || appointment.doctorID
                        }`;
                      }}
                      onViewProfile={() =>
                        onViewProfile(
                          appointment.doctorID?._id || appointment.doctorID
                        )
                      }
                      width="full"
                    />
                  ))}
                </div>
              </div>
            )}

            {showUpcoming &&
              upcomingAppointments.length === 0 &&
              sortBy === "Upcoming" && (
                <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-stroke">
                  <p className="text-secondaryText">No upcoming appointments</p>
                </div>
              )}

            {showPast && pastAppointments.length > 0 && (
              <div className="space-y-8">
                <h2 className="font-semibold text-xl text-primaryText flex items-center gap-2">
                  <Clock size={24} className="text-primary" />
                  Past Appointments
                </h2>

                {groupPastAppointments().map(([period, appointments]) => (
                  <div key={period} className="space-y-4">
                    <h3 className="font-medium text-lg text-primaryText border-b border-stroke pb-2">
                      {period}
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {appointments.map((appointment) => (
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
                            appointment.doctorID?._id || appointment.doctorID
                          }
                          profilePic={appointment.doctorID?.user?.profilePic}
                          appointmentType={
                            appointment.summary || "Medical Consultation"
                          }
                          summaryId={appointment.summaryId || appointment._id}
                          instructionId={appointment._id}
                          notes={appointment.description}
                          past={true}
                          status={appointment.status || "Completed"}
                          startTime={appointment.startTime}
                          endTime={appointment.endTime}
                          onViewProfile={() =>
                            onViewProfile(
                              appointment.doctorID?._id || appointment.doctorID
                            )
                          }
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showPast && pastAppointments.length === 0 && sortBy === "Past" && (
              <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-stroke">
                <p className="text-secondaryText">No past appointments</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Appointments;
