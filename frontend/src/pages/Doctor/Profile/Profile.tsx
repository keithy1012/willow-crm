import React, { useEffect, useState } from "react";
import {
  User,
  Calendar,
  EnvelopeSimple,
  Phone,
  GraduationCap,
  ClipboardText,
  PencilSimple,
} from "phosphor-react";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileInfo from "components/card/ProfileInfoCard";
import { useRequireRole } from "hooks/useRequireRole";
import { useAuth } from "contexts/AuthContext";
import { doctorService } from "api/services/doctor.service";
import SuccessModal from "components/modal/SuccessModal";

const DoctorProfile: React.FC = () => {
  useRequireRole("Doctor");
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(
    location.state?.showSuccess || false
  );

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!authUser?._id) return;
      setLoading(true);
      try {
        const data = await doctorService.getByUserId(authUser._id);
        setDoctor(data);
      } catch (err) {
        console.error("Error fetching doctor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [authUser]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const doctorName = `${authUser?.firstName || ""} ${authUser?.lastName || ""}`;

  return (
    <div className="flex flex-col w-full min-h-screen">
      {showModal && (
        <SuccessModal
          isOpen={showModal}
          message="Your edit request was submitted!"
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="h-40 bg-gradient-to-r from-primary to-[#6886AC]" />
      <img
        src={authUser?.profilePic || "https://placehold.co/100x100"}
        alt="Profile"
        className="w-40 ml-12 mt-[-100px] h-40 rounded-lg border-4 border-white object-cover shadow-sm"
      />

      <div className="bg-white px-12 py-6">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              {doctorName}'s Doctor Profile
              <PencilSimple
                size={18}
                className="text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={() => navigate("/doctor-profile-edit")}
              />
            </h1>
          </div>
        </div>

        {/* Bio */}
        {doctor?.bioContent && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Bio</h2>
            <p className="text-gray-700">{doctor.bioContent}</p>
          </div>
        )}

        {/* Doctor Information */}
        <div className="flex flex-row gap-5 mt-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2">Doctor Information</h2>
            <ProfileInfo
              items={[
                { icon: User, text: doctorName },
                { icon: Calendar, text: formatDate(doctor?.graduationDate) },
                {
                  icon: GraduationCap,
                  text: doctor?.education || "Not specified",
                },
                {
                  icon: ClipboardText,
                  text: doctor?.speciality || "Not specified",
                },
                {
                  icon: User,
                  text: `Username: ${authUser?.username || "N/A"}`,
                },
                {
                  icon: Calendar,
                  text: `Account Created: ${formatDate(authUser?.createdAt)}`,
                },
              ]}
            />
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
            <ProfileInfo
              items={[
                { icon: Phone, text: doctor?.user?.phoneNumber || "N/A" },
                { icon: EnvelopeSimple, text: authUser?.email || "N/A" },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
