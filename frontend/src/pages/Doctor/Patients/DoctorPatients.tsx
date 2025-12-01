import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRequireRole } from "hooks/useRequireRole";
import SmallSearchBar from "components/input/SmallSearchBar";
import { Users } from "phosphor-react";
import { User } from "api/types/user.types";
import { Patient } from "api/types/patient.types";
import PatientCard from "components/card/PatientCard";
import { appointmentService } from "api/services/appointment.service";
import { doctorService } from "api/services/doctor.service";
import toast from "react-hot-toast";

const DoctorPatientsPage: React.FC = () => {
  useRequireRole("Doctor");
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "recent" | "condition">("name");
  const [doctorId, setDoctorId] = useState<string>("");

  // Get doctor ID first
  useEffect(() => {
    const fetchDoctorInfo = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        try {
          const doctorData = await doctorService.getByUserId(user._id);
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

  // Load patients from appointments when doctor ID is available
  useEffect(() => {
    if (doctorId) {
      fetchPatientsFromAppointments();
    }
  }, [doctorId]);

  const fetchPatientsFromAppointments = async () => {
    if (!doctorId) return;

    try {
      setLoading(true);

      // Fetch all appointments for this doctor
      const response: any = await appointmentService.getDoctorAppointments(
        doctorId
      );
      console.log("Doctor appointments:", response);

      const appointmentsData = Array.isArray(response) ? response : [];

      // Extract unique patients from appointments
      const uniquePatientsMap = new Map<string, Patient>();

      appointmentsData.forEach((appointment: any) => {
        if (
          appointment.patientID &&
          typeof appointment.patientID === "object"
        ) {
          const patientData = appointment.patientID;
          const patientId = patientData._id;

          // Only add if we haven't seen this patient before
          if (!uniquePatientsMap.has(patientId)) {
            // Construct the Patient object
            const patient: Patient = {
              _id: patientId,
              user:
                patientData.user ||
                ({
                  _id: patientData.user?._id || patientId,
                  firstName: patientData.user?.firstName || "Unknown",
                  lastName: patientData.user?.lastName || "Patient",
                  email: patientData.user?.email || "",
                  phoneNumber: patientData.user?.phoneNumber || "",
                  profilePic: patientData.user?.profilePic,
                  username:
                    patientData.user?.username || `patient_${patientId}`,
                  role: "Patient",
                } as User),
              birthday: patientData.birthday,
              address: patientData.address || "",
              bloodtype: patientData.bloodtype || "",
              allergies: patientData.allergies || [],
              medicalHistory: patientData.medicalHistory || [],
              emergencyContact: patientData.emergencyContact || [],
            };

            uniquePatientsMap.set(patientId, patient);
          } else {
            // Update appointment count and last appointment date
            const existingPatient = uniquePatientsMap.get(patientId)!;
            const appointmentDate = new Date(appointment.startTime);
            if (
              appointmentDate > (existingPatient as any).lastAppointmentDate
            ) {
              (existingPatient as any).lastAppointmentDate = appointmentDate;
              (existingPatient as any).lastAppointmentType =
                appointment.summary || "Consultation";
            }
            (existingPatient as any).totalAppointments =
              ((existingPatient as any).totalAppointments || 0) + 1;
          }
        }
      });

      const uniquePatients = Array.from(uniquePatientsMap.values());
      console.log(
        `Found ${uniquePatients.length} unique patients from ${appointmentsData.length} appointments`
      );

      // Sort by last appointment date (most recent first) by default
      uniquePatients.sort((a, b) => {
        const dateA = (a as any).lastAppointmentDate || new Date(0);
        const dateB = (b as any).lastAppointmentDate || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setPatients(uniquePatients);
      setFilteredPatients(uniquePatients);
    } catch (error) {
      console.error("Error fetching patients from appointments:", error);
      toast.error("Failed to load patients");
      setPatients([]);
      setFilteredPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter patients based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredPatients(patients);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = patients.filter((patient) => {
      // Type guard for populated user
      const isUserPopulated = (user: string | User): user is User => {
        return typeof user === "object" && user !== null;
      };

      const user = isUserPopulated(patient.user) ? patient.user : null;

      return (
        user?.firstName?.toLowerCase().includes(query) ||
        user?.lastName?.toLowerCase().includes(query) ||
        user?.email?.toLowerCase().includes(query) ||
        patient.address?.toLowerCase().includes(query) ||
        patient.bloodtype?.toLowerCase().includes(query) ||
        patient.allergies?.some((allergy: string) =>
          allergy.toLowerCase().includes(query)
        ) ||
        patient.medicalHistory?.some((condition: string) =>
          condition.toLowerCase().includes(query)
        ) ||
        (patient as any).lastAppointmentType?.toLowerCase().includes(query)
      );
    });

    setFilteredPatients(filtered);
  }, [searchQuery, patients]);

  // Sort patients
  useEffect(() => {
    const sorted = [...filteredPatients];

    switch (sortBy) {
      case "name":
        sorted.sort((a, b) => {
          const nameA = `${(a.user as User).firstName} ${
            (a.user as User).lastName
          }`.toLowerCase();
          const nameB = `${(b.user as User).firstName} ${
            (b.user as User).lastName
          }`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;
      case "recent":
        sorted.sort((a, b) => {
          const dateA = (a as any).lastAppointmentDate || new Date(0);
          const dateB = (b as any).lastAppointmentDate || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      case "condition":
        sorted.sort((a, b) => {
          const conditionA = a.medicalHistory?.[0] || "";
          const conditionB = b.medicalHistory?.[0] || "";
          return conditionA.localeCompare(conditionB);
        });
        break;
    }

    setFilteredPatients(sorted);
  }, [sortBy]);

  // Action handlers - Updated to use navigate
  const handleViewProfile = (patient: Patient) => {
    console.log("View profile:", patient);
    navigate(`/patient/${patient._id}`);
  };

  const handleScheduleAppointment = (patient: Patient) => {
    console.log("Schedule appointment:", patient);
    navigate(`/schedule?patientId=${patient._id}`);
  };

  const handleViewRecords = (patient: Patient) => {
    console.log("View records:", patient);
    navigate(`/medical-records?patientId=${patient._id}`);
  };

  const handleMessage = (patient: Patient) => {
    navigate(`/doctormessages?patientId=${patient._id}`);
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
      <div className="bg-gradient-to-b from-primary to-[#6886AC] text-white px-12 py-12">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold mb-2">My Patients</h1>
              <p className="text-white/80">
                {patients.length > 0
                  ? `Managing ${patients.length} patient${
                      patients.length !== 1 ? "s" : ""
                    } from your appointments`
                  : "Patients from your appointments will appear here"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto p-12">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SmallSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery("")}
              placeholder="Search patients by name, condition, or appointment type..."
            />
          </div>

          <div className="flex gap-2">
            {/* View mode toggle */}
            <div className="flex bg-white border border-stroke rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-primary text-white"
                    : "text-secondaryText"
                } rounded-l-lg transition-colors`}
                title="Grid view"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-primary text-white"
                    : "text-secondaryText"
                } rounded-r-lg transition-colors`}
                title="List view"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <p className="text-md text-secondaryText mb-4">
          Showing {filteredPatients.length} of {patients.length} patients
          {searchQuery && ` matching "${searchQuery}"`}
        </p>

        {filteredPatients.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-4"
            }
          >
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient._id}
                patient={patient}
                onViewProfile={handleViewProfile}
                onScheduleAppointment={handleScheduleAppointment}
                onViewRecords={handleViewRecords}
                onMessage={handleMessage}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-stroke p-8">
            <Users size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-lg text-primaryText font-medium">
              {searchQuery ? "No patients found" : "No patients yet"}
            </p>
            <p className="text-sm text-secondaryText mt-2">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Patients will appear here after you have appointments with them"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPatientsPage;
