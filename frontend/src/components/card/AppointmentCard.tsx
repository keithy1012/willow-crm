import React from "react";
import ProfileHeaderCard from "./ProfileHeaderCard";
import SmallInfoCard from "./SmallInfoCard";
import PrimaryButton from "components/buttons/PrimaryButton";
import {
  Heartbeat,
  Calendar,
  Clock,
  PaperclipHorizontal,
  Notepad,
  CheckCircle,
  XCircle,
  Warning,
} from "phosphor-react";

interface AppointmentCardProps {
  dateOfAppointment: Date;
  doctorName: string;
  doctorUsername: string;
  doctorId: string;
  profilePic?: string;
  appointmentType: string;
  instructionId?: string;
  summaryId?: string;
  notes?: string;
  past?: boolean;
  width?: string;
  status?: "Scheduled" | "In-Progress" | "Completed" | "Cancelled" | "No-Show";
  startTime?: string;
  endTime?: string;
  onCancel?: () => void;
  onReschedule?: () => void;
  onMessage?: () => void;
  onViewProfile?: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  dateOfAppointment,
  doctorName,
  doctorUsername,
  doctorId,
  profilePic,
  appointmentType,
  instructionId,
  summaryId,
  past,
  notes,
  width,
  status,
  startTime,
  endTime,
  onCancel,
  onReschedule,
  onMessage,
  onViewProfile,
}) => {
  // Determine actual status based on past flag and status prop
  const getActualStatus = () => {
    if (status) return status;
    if (past) return "Completed";
    return "Scheduled";
  };

  const actualStatus = getActualStatus();

  const getStatusColor = () => {
    switch (actualStatus) {
      case "In-Progress":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      case "No-Show":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const getStatusIcon = () => {
    switch (actualStatus) {
      case "Completed":
        return <CheckCircle size={16} weight="fill" />;
      case "Cancelled":
        return <XCircle size={16} weight="fill" />;
      case "No-Show":
        return <Warning size={16} weight="fill" />;
      case "In-Progress":
        return <Clock size={16} weight="fill" />;
      default:
        return <Calendar size={16} weight="fill" />;
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return "";
    const date = new Date(time);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const isToday = () => {
    const today = new Date();
    return dateOfAppointment.toDateString() === today.toDateString();
  };

  const isTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dateOfAppointment.toDateString() === tomorrow.toDateString();
  };

  const getDateDisplay = () => {
    if (isToday()) return "Today";
    if (isTomorrow()) return "Tomorrow";
    return dateOfAppointment.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year:
        dateOfAppointment.getFullYear() !== new Date().getFullYear()
          ? "numeric"
          : undefined,
    });
  };

  return (
    <div
      className={`flex flex-col bg-foreground rounded-xl shadow-sm hover:shadow-md transition-all border border-stroke overflow-hidden ${
        width ? `w-${width}` : ""
      }`}
    >
      <div
        className={`px-4 py-2 border-b ${getStatusColor()} flex items-center justify-between`}
      >
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-xs font-semibold uppercase tracking-wide">
            {actualStatus}
          </span>
        </div>
        <span className="text-xs font-medium">{getDateDisplay()}</span>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex flex-row gap-3">
          <SmallInfoCard
            icon={Heartbeat}
            title="Type"
            value={appointmentType}
            backgroundWhite={true}
            width="1/2"
          />
          <SmallInfoCard
            icon={Clock}
            title={startTime && endTime ? "Duration" : "Date"}
            value={
              startTime && endTime
                ? `${formatTime(startTime)} - ${formatTime(endTime)}`
                : dateOfAppointment.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })
            }
            backgroundWhite={true}
            width="1/2"
          />
        </div>

        <ProfileHeaderCard
          name={doctorName}
          username={doctorUsername}
          userId={doctorId}
          message={actualStatus === "Scheduled" && onMessage ? true : false}
          profilePic={profilePic}
          onMessage={onMessage}
          onViewProfile={onViewProfile}
        />

        {(instructionId || summaryId) && (
          <div className="flex flex-row gap-2 items-center cursor-pointer hover:text-primary transition-colors">
            <PaperclipHorizontal size={20} className="text-primaryText" />
            <p className="text-sm underline">
              {actualStatus !== "Completed"
                ? "View Pre-Appointment Instructions"
                : "View After Visit Summary"}
            </p>
          </div>
        )}

        {notes && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex flex-row gap-2 items-start">
              <Notepad size={18} className="text-primaryText mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-primaryText mb-1">
                  {actualStatus !== "Completed" ? "Notes" : "Visit Notes"}
                </p>
                <p className="text-sm text-secondaryText">{notes}</p>
              </div>
            </div>
          </div>
        )}

        {actualStatus === "Cancelled" && (
          <div className="text-center py-2 text-sm text-secondaryText italic">
            This appointment was cancelled
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
