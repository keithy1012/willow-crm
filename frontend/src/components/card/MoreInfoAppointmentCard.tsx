import { Patient, User } from "api";
import { Appointment, PopulatedAppointment } from "api/types/appointment.types";
import ProfileAvatar from "components/avatar/Avatar";
import PrimaryButton from "components/buttons/PrimaryButton";
import { FirstAid, Clock } from "phosphor-react";

interface EnhancedAppointmentCardProps {
  appointment: Appointment | PopulatedAppointment;
  onViewDetails: (appointment: Appointment | PopulatedAppointment) => void;
  onMessagePatient: (patientId: string) => void;
  onCancelAppointment: (appointmentId: string) => void;
  onCompleteAppointment: (appointmentId: string) => void;
  isPast: boolean;
}

const EnhancedAppointmentCard: React.FC<EnhancedAppointmentCardProps> = ({
  appointment,
  onViewDetails,
  onMessagePatient,
  onCancelAppointment,
  onCompleteAppointment,
  isPast,
}) => {
  // Type guard to check if patient is populated
  const isPatientPopulated = (
    patient: string | Patient
  ): patient is Patient => {
    return typeof patient === "object" && patient !== null;
  };

  const patient = isPatientPopulated(appointment.patientID)
    ? appointment.patientID
    : null;
  const patientUser =
    patient && typeof patient.user === "object" ? (patient.user as User) : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "text-blue-600 bg-blue-50";
      case "In-Progress":
        return "text-yellow-600 bg-yellow-50";
      case "Completed":
        return "text-success bg-success/10";
      case "Cancelled":
        return "text-error bg-error/10";
      case "No-Show":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-secondaryText bg-gray-50";
    }
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-stroke hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <FirstAid size={24} className="text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-primaryText">
                {appointment.summary || "Medical Appointment"}
              </h3>
              <p className="text-md text-secondaryText">
                {formatDate(appointment.startTime)}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-2 rounded-full text-xs font-medium ${getStatusColor(
              appointment.status
            )}`}
          >
            {appointment.status}
          </span>
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock size={16} className="text-secondaryText" />
            <span className="text-primaryText">
              {formatTime(appointment.startTime)} -{" "}
              {formatTime(appointment.endTime)}
            </span>
          </div>
        </div>

        {patientUser && (
          <div className="bg-foreground border border-stroke rounded-lg p-3 mb-4">
            <div className="flex items-center gap-3">
              <ProfileAvatar
                imageUrl={patientUser.profilePic}
                name={`${patientUser.firstName} ${patientUser.lastName}`}
                size={60}
              />
              <div className="flex-1 gap-1 flex flex-col">
                <p className="text-md font-medium text-primaryText">
                  {patientUser.firstName} {patientUser.lastName}
                </p>
                <p className="text-sm text-secondaryText">
                  {patientUser.email}
                </p>
                <p className="text-sm text-secondaryText">
                  {patientUser.phoneNumber}
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <PrimaryButton
            text="View Details"
            onClick={() => onViewDetails(appointment)}
            variant="outline"
            size="small"
            toggleable={false}
          />
          {!isPast && appointment.status === "Scheduled" && (
            <>
              <PrimaryButton
                text="Message"
                onClick={() =>
                  onMessagePatient(
                    typeof appointment.patientID === "string"
                      ? appointment.patientID
                      : appointment.patientID._id
                  )
                }
                variant="primary"
                size="small"
                toggleable={false}
                className="w-1/4"
              />
              <PrimaryButton
                text="Cancel"
                onClick={() => onCancelAppointment(appointment._id)}
                variant="outline"
                size="small"
                toggleable={false}
                className="w-1/4"
              />
            </>
          )}
          {!isPast && appointment.status === "In-Progress" && (
            <PrimaryButton
              text="Mark Complete"
              onClick={() => onCompleteAppointment(appointment._id)}
              variant="primary"
              size="small"
              toggleable={false}
            />
          )}
        </div>
      </div>
    </div>
  );
};
export default EnhancedAppointmentCard;
