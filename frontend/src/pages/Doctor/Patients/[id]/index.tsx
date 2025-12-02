import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CaretLeft,
  User,
  Calendar,
  Pill,
  Phone,
  EnvelopeSimple,
  MapPin,
  Heartbeat,
  Warning,
  ChatCircle,
  Cake,
  Notepad,
} from "phosphor-react";
import { Patient } from "api/types/patient.types";
import { MedorderResponse } from "api/types/medorder.types";
import { EnhancedAppointment } from "api/types/appointment.types";
import { patientService } from "api/services/patient.service";
import { medorderService } from "api/services/medorder.service";
import { appointmentService } from "api/services/appointment.service";
import ProfileAvatar from "components/avatar/Avatar";
import SmallInfoCard from "components/card/SmallInfoCard";
import LargeMedicationCard from "components/card/LargeMedicationCard";
import UpcomingAppointmentCard from "components/card/UpcomingAppointmentCard";
import PrimaryButton from "components/buttons/PrimaryButton";
import toast from "react-hot-toast";

const PatientProfile: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medications, setMedications] = useState<MedorderResponse[]>([]);
  const [appointments, setAppointments] = useState<EnhancedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "medications" | "appointments"
  >("overview");

  useEffect(() => {
    if (!patientId) return;

    const fetchPatientData = async () => {
      try {
        setLoading(true);
        console.log("Fetching patient data for ID:", patientId);

        // Use the new endpoint that accepts patient ID
        let patientData;
        try {
          patientData = await patientService.getByPatientId(patientId);
          console.log("Successfully fetched patient:", patientData);
        } catch (err) {
          console.error("Failed to fetch patient:", err);
          throw new Error("Patient not found");
        }

        setPatient(patientData as Patient);

        // Fetch medications
        console.log("Fetching medications for patient ID:", patientId);
        try {
          const medsResponse = await medorderService.getMedordersByPatient(
            patientId
          );
          console.log("Medications found:", medsResponse.medorders);
          setMedications(medsResponse.medorders || []);
        } catch (err) {
          console.log("No medications found for patient:", err);
          setMedications([]);
        }

        // Fetch appointments
        console.log("Fetching appointments for patient ID:", patientId);
        try {
          const appointmentsData =
            await appointmentService.getPatientAppointments(patientId);
          console.log("Appointments found:", appointmentsData);
          setAppointments(appointmentsData as EnhancedAppointment[]);
        } catch (err) {
          console.log("No appointments found for patient:", err);
          setAppointments([]);
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
        toast.error("Failed to load patient information");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  const handleMessagePatient = () => {
    navigate(`/doctormessages?patientId=${patientId}`);
  };

  const handleScheduleAppointment = () => {
    navigate(`/schedule?patientId=${patientId}`);
  };

  const getStatusColor = (status: String) => {
    switch (status) {
      case "In-Progress":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      case "No-Show":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };
  const handleRefillRequest = async (medicationId: string) => {};

  const handleDeleteMedication = async (medicationId: string) => {};

  const handleAppointmentClick = (appointmentId: string) => {
    navigate(`/appointments/${appointmentId}?patientId=${patientId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-primaryText mb-4">Patient not found</p>
          <button
            onClick={() => navigate(-1)}
            className="text-primary hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const user = typeof patient.user === "object" ? patient.user : null;
  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.startTime) >= new Date() && apt.status !== "Cancelled"
  );
  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.startTime) < new Date() || apt.status === "Completed"
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="w-full bg-gradient-to-b from-primary to-[#6886AC] text-white px-12 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
        >
          <CaretLeft size={20} />
          <span>Back to Patients</span>
        </button>

        <div className="w-full flex flex-row justify-between">
          <div className="flex flex-row items-start gap-6">
            <ProfileAvatar
              name={`${user?.firstName} ${user?.lastName}`}
              size={90}
            />
            <div className="flex flex-col items-start">
              <h1 className="text-3xl font-semibold mb-2">
                {user?.firstName} {user?.lastName}
              </h1>
              <div className="flex flex-col gap-3 text-white/90 text-sm">
                <div className="flex items-center gap-2">
                  <EnvelopeSimple size={16} />
                  {user?.email}
                </div>
                {user?.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    {user.phoneNumber}
                  </div>
                )}
                {patient.birthday && (
                  <div className="flex items-center gap-2">
                    <Cake size={16} />
                    {patient.birthday.toLocaleString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="justify-end align-bottom gap-3">
            <PrimaryButton
              onClick={handleMessagePatient}
              text="Message Patient"
              variant="outline"
              size="medium"
              icon={<ChatCircle size={20} />}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-stroke bg-white">
        <div className="px-12 flex gap-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-primary text-primary font-medium"
                : "border-transparent text-secondaryText hover:text-primaryText"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("medications")}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === "medications"
                ? "border-primary text-primary font-medium"
                : "border-transparent text-secondaryText hover:text-primaryText"
            }`}
          >
            Medications ({medications.length})
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === "appointments"
                ? "border-primary text-primary font-medium"
                : "border-transparent text-secondaryText hover:text-primaryText"
            }`}
          >
            Appointments ({appointments.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-12 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SmallInfoCard
                icon={Calendar}
                title="Total Appointments"
                value={appointments.length.toString()}
                width="full"
              />
              <SmallInfoCard
                icon={Calendar}
                title="Upcoming"
                value={upcomingAppointments.length.toString()}
                width="full"
              />
              <SmallInfoCard
                icon={Pill}
                title="Active Medications"
                value={medications.length.toString()}
                width="full"
              />
              <SmallInfoCard
                icon={Heartbeat}
                title="Blood Type"
                value={patient.bloodtype || "N/A"}
                width="full"
              />
            </div>

            {/* Medical Information */}
            <div className="flex flex-col space-y-6 ">
              <div className="flex flex-col">
                <h3 className="text-xl mb-4 font-semibold text-primaryText">
                  Patient Information
                </h3>
                <div className="flex flex-col space-y-4 bg-foreground p-4 rounded-xl border border-stroke shadow-sm">
                  <div className="flex items-start gap-2">
                    <Notepad size={24} className="text-primaryText" />
                    <div className="flex flex-col">
                      <span className="font-semibold">Patient Allergies:</span>
                      {patient?.allergies && patient.allergies.length > 0 ? (
                        <ul className="list-disc list-inside mt-1">
                          {patient.allergies.map((allergy, index) => (
                            <li key={index}>{allergy}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1">No allergies reported.</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Notepad size={24} className="text-primaryText" />
                    <div className="flex flex-col">
                      <span className="font-semibold">Patient Conditions:</span>
                      {patient?.medicalHistory &&
                      patient.medicalHistory.length > 0 ? (
                        <ul className="list-disc list-inside mt-1">
                          {patient.medicalHistory.map((condition, index) => (
                            <li key={index}>{condition}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1">No conditions reported.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Medications & Appointments */}
              <div className="flex flex-col gap-6">
                {/* Recent Medications */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-primaryText">
                      Recent Medications
                    </h3>
                    {medications.length > 3 && (
                      <button
                        onClick={() => setActiveTab("medications")}
                        className="text-sm text-primary hover:underline"
                      >
                        View All
                      </button>
                    )}
                  </div>
                  {medications.length > 0 ? (
                    <div className="space-y-3">
                      {medications.slice(0, 3).map((med) => (
                        <div
                          key={med.orderID}
                          className="bg-white p-4 rounded-lg border border-stroke"
                        >
                          <div className="flex items-start gap-3">
                            <Pill size={24} className="text-primary mt-1" />
                            <div className="flex-1">
                              <h4 className="font-medium text-primaryText">
                                {med.medicationName}
                              </h4>
                              <p className="text-sm text-secondaryText mt-1">
                                {med.instruction}
                              </p>
                              <p className="text-xs text-secondaryText mt-2">
                                Prescribed:{" "}
                                {new Date(
                                  med.prescribedOn
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded-lg border border-stroke text-center">
                      <p className="text-secondaryText">No medications</p>
                    </div>
                  )}
                </div>

                {/* Upcoming Appointments */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-primaryText">
                      Upcoming Appointments
                    </h3>
                    {upcomingAppointments.length > 3 && (
                      <button
                        onClick={() => setActiveTab("appointments")}
                        className="text-sm text-primary hover:underline"
                      >
                        View All
                      </button>
                    )}
                  </div>
                  {upcomingAppointments.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingAppointments.slice(0, 3).map((apt) => (
                        <div key={apt._id}>
                          <UpcomingAppointmentCard
                            date={new Date(apt.startTime).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                            doctorName={
                              typeof apt.doctorID === "object"
                                ? `Dr.`
                                : "Doctor"
                            }
                            appointmentType={apt.summary || "Consultation"}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded-lg border border-stroke text-center">
                      <p className="text-secondaryText">
                        No upcoming appointments
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "medications" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-primaryText mb-4">
              All Medications
            </h2>
            {medications.length > 0 ? (
              medications.map((med) => (
                <LargeMedicationCard
                  key={med.orderID}
                  medicationId={med.orderID}
                  medicationName={med.medicationName}
                  medicationNotes={med.instruction}
                  lastRequested={
                    med.lastRefillDate
                      ? new Date(med.lastRefillDate)
                      : undefined
                  }
                  prescribedOn={new Date(med.prescribedOn)}
                  refillDetails={med.quantity || "N/A"}
                  pharmacyDetails="Willow CRM Pharmacy"
                  onRefillRequest={handleRefillRequest}
                  onDelete={handleDeleteMedication}
                  isPatient={false}
                />
              ))
            ) : (
              <div className="bg-white p-12 rounded-xl border border-stroke text-center">
                <Pill size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-lg text-primaryText font-medium">
                  No medications prescribed
                </p>
                <p className="text-sm text-secondaryText mt-2">
                  This patient has no active medications
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="space-y-6">
            {/* Upcoming */}
            <div>
              <h2 className="text-2xl font-semibold text-primaryText mb-4">
                Upcoming Appointments
              </h2>
              {upcomingAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingAppointments.map((apt) => (
                    <div
                      key={apt._id}
                      className="bg-foreground p-4 rounded-lg border border-stroke hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar size={20} className="text-primary" />
                          <span className="font-medium text-primaryText">
                            {new Date(apt.startTime).toLocaleDateString()}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded border ${getStatusColor(
                            apt.status
                          )}`}
                        >
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-sm text-secondaryText mb-2">
                        {new Date(apt.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-sm text-primaryText">
                        {apt.summary || "Consultation"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-xl border border-stroke text-center">
                  <p className="text-secondaryText">No upcoming appointments</p>
                </div>
              )}
            </div>

            {/* Past */}
            <div>
              <h2 className="text-2xl font-semibold text-primaryText mb-4">
                Past Appointments
              </h2>
              {pastAppointments.length > 0 ? (
                <div className="space-y-3">
                  {pastAppointments.map((apt) => (
                    <div
                      key={apt._id}
                      className="bg-foreground p-4 rounded-lg border border-stroke hover:shadow-md transition-shadow "
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Calendar size={20} className="text-secondaryText" />
                          <div>
                            <p className="font-medium text-primaryText">
                              {new Date(apt.startTime).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-secondaryText">
                              {apt.summary || "Consultation"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded border ${getStatusColor(
                            apt.status
                          )}`}
                        >
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-xl border border-stroke text-center">
                  <p className="text-secondaryText">No past appointments</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;
