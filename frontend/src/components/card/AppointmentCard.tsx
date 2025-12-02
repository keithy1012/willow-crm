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
import { useNavigate } from "react-router-dom";

interface AppointmentCardProps {
  dateOfAppointment: Date;
  doctorName: string;
  doctorUsername: string;
  doctorId: string;
  profilePic?: string;
  appointmentType: string;
  appointmentId: string;
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
  onViewProfile?: (doctorId: string) => void;
  onClick?: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  dateOfAppointment,
  doctorName,
  doctorUsername,
  doctorId,
  profilePic,
  appointmentType,
  appointmentId,
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
  onClick,
}) => {
  const navigate = useNavigate();

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

  const handleViewInstructions = () => {
    window.open(
      "https://www.nia.nih.gov/health/medical-care-and-appointments/how-prepare-doctors-appointment",
      "_blank"
    );
  };

  const handleViewSummary = () => {
    navigate(`/medical-records/${appointmentId}`);
  };

  return (
    <div
      className={`flex flex-col bg-foreground rounded-xl shadow-sm hover:shadow-md transition-all border border-stroke overflow-hidden ${
        width ? `w-${width}` : ""
      }`}
      onClick={onClick}
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
            title="Symptoms"
            value={appointmentType}
            backgroundWhite={true}
            width="1/2"
          />
          <SmallInfoCard
            icon={Clock}
            title={startTime && endTime ? "Time" : "Date"}
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

        <div onClick={(e) => e.stopPropagation()}>
          <ProfileHeaderCard
            name={doctorName}
            username={doctorUsername}
            userId={doctorId} 
            message={actualStatus === "Scheduled" && onMessage ? true : false}
            profilePic={profilePic}
            onMessage={onMessage}
            onViewProfile={
              onViewProfile ? () => onViewProfile(doctorId) : undefined
            } 
          />
        </div>

        {actualStatus === "Scheduled" && (
          <div
            className="flex flex-row gap-2 items-center cursor-pointer hover:text-primary transition-colors"
            onClick={handleViewInstructions}
          >
            <PaperclipHorizontal size={20} className="text-primaryText" />
            <p className="text-sm underline">
              View Pre-Appointment Instructions
            </p>
          </div>
        )}

        {actualStatus === "Completed" && (
          <div
            className="flex flex-row gap-2 items-center cursor-pointer hover:text-primary transition-colors"
            onClick={handleViewSummary}
          >
            <PaperclipHorizontal size={20} className="text-primaryText" />
            <p className="text-sm underline">View After Visit Summary</p>
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

        {actualStatus === "Scheduled" && !past && (
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            {onCancel && (
              <button
                onClick={onCancel}
                className="flex-1 text-xs py-2 px-3 bg-red-50 border border-error text-error rounded-lg hover:bg-red-100 transition-colors font-medium"
              >
                Cancel Appointment
              </button>
            )}
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
