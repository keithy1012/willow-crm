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
import { useNavigate } from "react-router-dom";
import ProfileInfo from "components/card/ProfileInfoCard";
import { useRequireRole } from "hooks/useRequireRole";
import { useAuth } from "contexts/AuthContext";
import { patientService } from "api/services/patient.service";
import PatientConditionsTable from "components/table/patientConditionsTable";
import PatientAllergiesTable from "components/table/patientAllergiesTable";

const Profile: React.FC = () => {
  useRequireRole("Patient");
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!authUser?._id) return;
      setLoading(true);
      try {
        const data = await patientService.getById(authUser._id);
        console.log(data.allergies);
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

  return (
    <div className="flex flex-col w-full bg-[#f9f9f9] min-h-screen">
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
                onClick={() => navigate("/profile-edit")}
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

          <PatientConditionsTable conditions={patient?.medicalHistory} />
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

          <PatientAllergiesTable allergies={patient?.allergies} />
        </div>

        {/* Primary Care Physician */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">
            My Primary Care Physician
          </h2>
          <div className="p-4 rounded-xl border border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="https://placehold.co/40x40"
                alt="Doctor"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-gray-900">Lok Ye Young</p>
                <p className="text-sm text-gray-500">@lokyeyoung</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700">
              Message Doctor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
