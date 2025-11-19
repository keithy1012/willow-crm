import React, { useEffect, useState } from "react";
import {
  User,
  Calendar,
  GenderIntersex,
  Drop,
  PencilSimple,
  Phone,
  EnvelopeSimple,
  House,
  Asterisk,
} from "phosphor-react";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileInfo from "components/card/ProfileInfoCard";
import { useRequireRole } from "hooks/useRequireRole";
import { useAuth } from "contexts/AuthContext";
import { patientService } from "api/services/patient.service";
import PatientListTable from "components/table/PatientListTable";
import SuccessModal from "components/modal/SuccessModal";
const PatientProfile: React.FC = () => {
  useRequireRole("Patient");
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!authUser?._id) return;
      setLoading(true);
      try {
        const data = await patientService.getById(authUser._id);
        setPatient(data);
      } catch (err) {
        console.error("Error fetching patient:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [authUser]);

  const patientName = authUser?.firstName;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Birthday not set";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };
  const location = useLocation();
  const [showModal, setShowModal] = useState(
    location.state?.showSuccess || false
  );
  return (
    <div className="flex flex-col w-full bg-[#f9f9f9] min-h-screen">
      {showModal && (
        <SuccessModal
          isOpen={isSuccessModalOpen}
          message="Your edit request was submitted!"
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Header Banner */}
      <div className="h-40 bg-gradient-to-r from-primary to-[#6886AC]" />

      {/* Profile Content */}
      <div className="relative -mt-20 mx-auto w-[90%] max-w-6xl bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-6">
          <img
            src={authUser?.profilePic || "https://placehold.co/100x100"}
            alt="Profile"
            className="w-28 h-28 rounded-lg border-4 border-white object-cover shadow-sm"
          />
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              {patientName}'s Patient Profile
              <PencilSimple
                size={18}
                className="text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={() => navigate("/patient-profile-edit")}
              />
            </h1>
          </div>
        </div>

        {/* Patient Information + Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div>
            <h2 className="text-lg font-semibold mb-2">Patient Information</h2>
            <ProfileInfo
              items={[
                {
                  icon: User,
                  text: `${authUser?.firstName || ""} ${
                    authUser?.lastName || ""
                  }`,
                },
                {
                  icon: Calendar,
                  text: formatDate(patient?.birthday),
                },
                {
                  icon: GenderIntersex,
                  text: authUser?.gender || "Not specified",
                },
                { icon: Drop, text: patient?.bloodtype || "Not specified" },
              ]}
            />
          </div>

          <PatientListTable
            title="Patient Medical History"
            data={patient?.medicalHistory}
            field="conditionName"
          />
        </div>

        {/* Contact Information + Allergies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div>
            <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
            <ProfileInfo
              items={[
                {
                  icon: Phone,
                  text: authUser?.phoneNumber || "N/A",
                },
                {
                  icon: EnvelopeSimple,
                  text: authUser?.email || "N/A",
                },
                { icon: House, text: patient?.address || "N/A" },
                {
                  icon: Asterisk,
                  text: patient?.emergencyContact?.[0]?.phoneNumber
                    ? `Emergency Contact: ${patient.emergencyContact[0].phoneNumber}`
                    : "Emergency Contact: N/A",
                },
              ]}
            />
          </div>

          <PatientListTable
            title="Patient Allergies"
            data={patient?.allergies}
            field="allergen"
          />
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
