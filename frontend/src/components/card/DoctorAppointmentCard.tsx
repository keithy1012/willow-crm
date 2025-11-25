import PrimaryButton from "components/buttons/PrimaryButton";
import ProfileAvatar from "components/avatar/Avatar";
import { FirstAid, Clock, User, MapPin } from "phosphor-react";

interface DoctorAppointmentCardProps {
  startTime: Date;
  endTime: Date;
  patientName: string;
  patientId: string;
  patientProfilePic?: string;
  appointmentType: string;
  appointmentDescription?: string;
  appointmentId: string;
  status: "Scheduled" | "In-Progress" | "Completed" | "Cancelled" | "No-Show";
  isCurrentAppointment?: boolean;
}

const DoctorAppointmentCard: React.FC<DoctorAppointmentCardProps> = ({
  startTime,
  endTime,
  patientName,
  patientId,
  patientProfilePic,
  appointmentType,
  appointmentDescription,
  appointmentId,
  status,
  isCurrentAppointment = false,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDuration = () => {
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffMins = Math.round(diffMs / 60000);
    return diffMins < 60
      ? `${diffMins} min`
      : `${Math.round(diffMins / 60)} hr`;
  };

  const getStatusColor = () => {
    switch (status) {
      case "In-Progress":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Completed":
        return "bg-success/10 text-success border-success/30";
      case "Cancelled":
        return "bg-error/10 text-error border-error/30";
      case "No-Show":
        return "bg-orange-100 text-orange-700 border-orange-300";
      default:
        return isCurrentAppointment
          ? "bg-primary/10 text-primary border-primary/30"
          : "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const getCardBackground = () => {
    if (isCurrentAppointment && status === "Scheduled") {
      return "bg-primary/5";
    }
    if (status === "Cancelled" || status === "No-Show") {
      return "opacity-60";
    }
    return "bg-white";
  };

  return (
    <div className="flex gap-4 relative">
      <div className="flex flex-col items-end min-w-[80px] pt-1">
        <span className="text-sm font-semibold text-primaryText">
          {formatTime(startTime)}
        </span>
        <span className="text-xs text-secondaryText">{getDuration()}</span>
      </div>

      <div className="flex flex-col items-center">
        <div
          className={`w-2 h-2 rounded-full mt-2 ${
            isCurrentAppointment ? "bg-primary" : "bg-black"
          }`}
        />
        <div className="w-[1px] bg-black flex-1 min-h-[60px]" />
      </div>
      <div
        className={`flex-1 rounded-lg shadow-sm border border-stroke mb-4 transition-all hover:shadow-md overflow-hidden ${getCardBackground()}`}
      >
        <div className={`px-4 py-1.5 border-b ${getStatusColor()}`}>
          <span className="text-xs font-semibold uppercase tracking-wide">
            {status}
            {isCurrentAppointment && status === "Scheduled" && " • NOW"}
          </span>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <FirstAid size={20} className="text-primary" />
              <h3 className="text-base font-semibold text-primaryText">
                {appointmentType}
              </h3>
            </div>
            <span className="text-xs text-secondaryText">
              {formatTime(endTime)}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            {patientProfilePic ? (
              <ProfileAvatar
                imageUrl={patientProfilePic}
                name={patientName}
                size={32}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={16} className="text-primary" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-primaryText">
                {patientName}
              </p>
            </div>
          </div>

          {appointmentDescription && (
            <p className="text-sm text-secondaryText mb-3 line-clamp-2">
              {appointmentDescription}
            </p>
          )}

          <div className="flex gap-2">
            <PrimaryButton
              text="View Details"
              variant="outline"
              size="small"
              className="flex-1"
            />
            {status === "Scheduled" && (
              <PrimaryButton
                text="Message"
                variant="primary"
                size="small"
                className="flex-1"
              />
            )}
            {status === "In-Progress" && (
              <PrimaryButton
                text="Complete"
                variant="primary"
                size="small"
                className="flex-1"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointmentCard;
