import { useNavigate } from "react-router-dom";
import PrimaryButton from "../buttons/PrimaryButton";
import { User } from "phosphor-react";

interface DoctorResultCardProps {
  doctorId: string;
  doctorName: string;
  specialty: string;
  email: string;
  phd: string;
  profilePicUrl?: string;
  onMessageDoctor?: () => void;
  onViewProfile?: () => void;
}

const DoctorResultCard: React.FC<DoctorResultCardProps> = ({
  doctorId,
  doctorName,
  specialty,
  email,
  phd,
  profilePicUrl,
  onMessageDoctor,
  onViewProfile,
}) => {
  const navigate = useNavigate();

  const handleMessageDoctor = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    if (onMessageDoctor) {
      onMessageDoctor();
    } else {
      navigate(`/messages?doctorId=${doctorId}`);
    }
  };

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile();
    } else {
      navigate(`/doctor/${doctorId}`);
    }
  };

  return (
    <div
      className="bg-background p-4 border border-darkerStroke shadow-md rounded-lg w-full cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleViewProfile}
    >
      <div className="flex gap-4">
        {profilePicUrl ? (
          <div className="w-40 h-40 bg-foreground rounded-lg border shadow-sm border-darkerStroke flex items-center justify-center flex-shrink-0">
            <img
              src={profilePicUrl}
              alt={`${doctorName}'s profile`}
              className="w-36 h-36 rounded-md object-cover"
            />
          </div>
        ) : (
          <div className="w-40 h-40 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 border border-darkerStroke">
            <User size={48} className="text-primary" weight="light" />
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center relative">
          <div className="space-y-2 text-left">
            <h2 className="text-lg font-medium text-primaryText hover:text-primary transition-colors">
              Dr. {doctorName}
            </h2>
            <p className="text-sm text-primaryText">
              <span className="font-medium">Specialty:</span> {specialty}
            </p>
            <p className="text-sm text-primaryText">
              <span className="font-medium">Email:</span> {email}
            </p>
            <p className="text-sm text-primaryText">
              <span className="font-medium">Education:</span> {phd}
            </p>
          </div>

          <div className="flex gap-2 mt-4 justify-end">
            <PrimaryButton
              text="Message Doctor"
              variant="primary"
              size="small"
              onClick={handleMessageDoctor}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorResultCard;
