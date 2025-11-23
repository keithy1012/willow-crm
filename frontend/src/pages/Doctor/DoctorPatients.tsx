import React, { useState, useEffect } from "react";
import { useRequireRole } from "hooks/useRequireRole";
import SmallSearchBar from "components/input/SmallSearchBar";
import { Users } from "phosphor-react";
import { User } from "api/types/user.types";
import { Patient } from "api/types/patient.types";
import PatientCard from "components/card/PatientCard";

const DoctorPatientsPage: React.FC = () => {
  useRequireRole("Doctor");

  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "recent" | "condition">("name");

  // Load patients
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      // This would be your actual API call
      // const response = await patientService.getMyPatients();

      // Sample data for now - matching your Patient interface
      const samplePatients: Patient[] = [
        {
          _id: "1",
          user: {
            _id: "user1",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@email.com",
            phoneNumber: "(555) 123-4567",
            profilePic: undefined,
            username: "johndoe",
            role: "Patient",
          } as User,
          birthday: new Date("1980-05-15"),
          address: "123 Main St, Springfield, IL",
          bloodtype: "A+",
          allergies: ["Penicillin", "Peanuts"],
          medicalHistory: ["Hypertension", "Type 2 Diabetes"],
          emergencyContact: [],
        },
        {
          _id: "2",
          user: {
            _id: "user2",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane.smith@email.com",
            phoneNumber: "(555) 987-6543",
            profilePic: undefined,
            username: "janesmith",
            role: "Patient",
          } as User,
          birthday: new Date("1975-08-22"),
          address: "456 Oak Ave, Springfield, IL",
          bloodtype: "O+",
          allergies: ["Latex", "Shellfish", "Aspirin"],
          medicalHistory: ["Asthma", "Migraine"],
          emergencyContact: [],
        },
        {
          _id: "3",
          user: {
            _id: "user3",
            firstName: "Robert",
            lastName: "Johnson",
            email: "robert.j@email.com",
            phoneNumber: "(555) 456-7890",
            profilePic: undefined,
            username: "robertj",
            role: "Patient",
          } as User,
          birthday: new Date("1990-12-10"),
          address: "789 Elm St, Springfield, IL",
          bloodtype: "B+",
          allergies: [],
          medicalHistory: [],
          emergencyContact: [],
        },
      ];

      setPatients(samplePatients);
      setFilteredPatients(samplePatients);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };
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
        )
      );
    });

    setFilteredPatients(filtered);
  }, [searchQuery, patients]);

  // Action handlers
  const handleViewProfile = (patient: Patient) => {
    console.log("View profile:", patient);
    // Navigate to patient profile
  };

  const handleScheduleAppointment = (patient: Patient) => {
    console.log("Schedule appointment:", patient);
    // Navigate to scheduling
  };

  const handleViewRecords = (patient: Patient) => {
    console.log("View records:", patient);
    // Navigate to medical records
  };

  const handleMessage = (patient: Patient) => {
    console.log("Message patient:", patient);
    // Navigate to messages with this patient
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
                Manage and view your patient records
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
              placeholder="Search patients by name, ID, or condition..."
            />
          </div>

          <div className="flex gap-2">
            <div className="flex bg-white border border-stroke rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-primary text-white"
                    : "text-secondaryText"
                } rounded-l-lg transition-colors`}
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
          <div className="text-center py-12">
            <Users size={64} className="mx-auto text-secondaryText/30 mb-4" />
            <p className="text-lg text-secondaryText">No patients found</p>
            {searchQuery && (
              <p className="text-sm text-secondaryText mt-2">
                Try adjusting your search criteria
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPatientsPage;
