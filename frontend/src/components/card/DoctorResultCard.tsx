import PrimaryButton from "../buttons/PrimaryButton";

interface DoctorResultCardProps {
  doctorId: string;
  doctorName: string;
  specialty: string;
  email: string;
  phd: string;
  profilePicUrl?: string;
  onMessageDoctor?: () => void;
}

const DoctorResultCard: React.FC<DoctorResultCardProps> = ({
  doctorId,
  doctorName,
  specialty,
  email,
  phd,
  profilePicUrl,
  onMessageDoctor,
}) => {
  return (
    <div className="bg-background p-4 border border-darkerStroke shadow-md rounded-lg w-full">
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
          <div className="w-40 h-40 rounded-lg bg-gray-300 flex items-center justify-center text-xl text-white flex-shrink-0">
            {doctorName.charAt(0)}
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center relative">
          <div className="space-y-2 text-left">
            <h2 className="text-lg font-medium text-primaryText">
              Dr. {doctorName}
            </h2>
            <p className="text-sm text-primaryText">
              <span className="font-medium">Specialty:</span> {specialty}
            </p>
            <p className="text-sm text-primaryText">
              <span className="font-medium">Email:</span> {email}
            </p>
            <p className="text-sm text-primaryText">
              <span className="font-medium">PhD:</span> {phd}
            </p>
          </div>

          {onMessageDoctor && (
            <div className="flex justify-end mt-4">
              <PrimaryButton
                text="Message Doctor"
                variant="primary"
                size="small"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default DoctorResultCard;
