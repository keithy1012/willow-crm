import { User } from "api";
import { Patient } from "api/types/patient.types";
import ProfileAvatar from "components/avatar/Avatar";
import PrimaryButton from "components/buttons/PrimaryButton";
import { Envelope, MapPin, Phone } from "phosphor-react";

interface PatientCardProps {
  patient: Patient;
  onViewProfile: (patient: Patient) => void;
  onScheduleAppointment: (patient: Patient) => void;
  onViewRecords: (patient: Patient) => void;
  onMessage: (patient: Patient) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onViewProfile,
  onScheduleAppointment,
  onViewRecords,
  onMessage,
}) => {
  const isUserPopulated = (user: string | User): user is User => {
    return typeof user === "object" && user !== null;
  };

  const user = isUserPopulated(patient.user) ? patient.user : null;

  // Calculate age from birthday
  const calculateAge = (birthday: string | Date) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Handle card click
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on a button
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    onViewProfile(patient);
  };

  // Handle button clicks with event propagation prevention
  const handleViewProfileClick = () => {
    onViewProfile(patient);
  };

  const handleMessageClick = () => {
    onMessage(patient);
  };

  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-stroke p-5">
        <p className="text-secondaryText">User data not available</p>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-stroke hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <ProfileAvatar
              imageUrl={user.profilePic}
              name={`${user.firstName} ${user.lastName}`}
              size={56}
            />
            <div>
              <h3 className="text-lg font-semibold text-primaryText">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-md text-secondaryText">
                Age: {calculateAge(patient.birthday)} years old
              </p>
              <p className="text-md text-secondaryText mt-1">
                Blood Type: {patient.bloodtype || "Unknown"}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-y border-stroke">
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-secondaryText" />
            <span className="text-md text-primaryText">
              {user.phoneNumber || "No phone"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Envelope size={16} className="text-secondaryText" />
            <span className="text-md text-primaryText truncate">
              {user.email || "No email"}
            </span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <MapPin size={16} className="text-secondaryText" />
            <span className="text-md text-primaryText truncate">
              {patient.address || "No address"}
            </span>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          {patient.allergies && (
            <div>
              <p className="text-md font-medium text-secondaryText mb-1">
                Allergies:
              </p>
              <div className="flex flex-wrap gap-1">
                {patient.allergies.length > 0 ? (
                  <>
                    {patient.allergies
                      .slice(0, 3)
                      .map((allergy: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-error/10 text-sm text-error rounded"
                        >
                          {allergy}
                        </span>
                      ))}
                    {patient.allergies.length > 3 && (
                      <span className="px-2 py-1 bg-foreground text-sm text-secondaryText rounded">
                        +{patient.allergies.length - 3} more
                      </span>
                    )}
                  </>
                ) : (
                  <p className="text-sm py-1 text-primaryText">
                    No known allergies
                  </p>
                )}
              </div>
            </div>
          )}

          {patient.medicalHistory && (
            <div>
              <p className="text-md font-medium text-secondaryText mb-1">
                Medical History:
              </p>
              {(patient.medicalHistory.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {patient.medicalHistory
                    .slice(0, 2)
                    .map((condition: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-foreground text-sm text-primaryText rounded"
                      >
                        {condition}
                      </span>
                    ))}
                  {patient.medicalHistory.length > 2 && (
                    <span className="px-2 py-1 bg-foreground text-md text-secondaryText rounded">
                      +{patient.medicalHistory.length - 2} more
                    </span>
                  )}
                </div>
              )) || (
                <p className="text-sm py-1 text-primaryText">
                  No known conditions
                </p>
              )}
            </div>
          )}
        </div>

        <div
          className="grid grid-cols-2 gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <PrimaryButton
            text="View Profile"
            onClick={handleViewProfileClick}
            variant="outline"
            size="small"
            toggleable={false}
            className="w-full"
          />
          <PrimaryButton
            text="Message"
            onClick={handleMessageClick}
            variant="primary"
            size="small"
            toggleable={false}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default PatientCard;
