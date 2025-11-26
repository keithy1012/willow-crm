// DoctorAppointmentCard.tsx - For Doctor View
import React from "react";
import ProfileHeaderCard from "components/card/ProfileHeaderCard";
import SmallInfoCard from "components/card/SmallInfoCard";
import PrimaryButton from "components/buttons/PrimaryButton";
import {
  FirstAid,
  Clock,
  User,
  PaperclipHorizontal,
  Notepad,
  CheckCircle,
  XCircle,
  Warning,
} from "phosphor-react";

interface DoctorAppointmentCardProps {
  startTime: Date | string;
  endTime: Date | string;
  patientName: string;
  patientId: string;
  patientUsername?: string;
  patientProfilePic?: string;
  appointmentType: string;
  appointmentDescription?: string;
  appointmentId: string;
  status: "Scheduled" | "In-Progress" | "Completed" | "Cancelled" | "No-Show";
  isCurrentAppointment?: boolean;
  isTimeline?: boolean; // For today's timeline view
  onViewDetails?: () => void;
  onMessage?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
  onMarkNoShow?: () => void;
  onStartAppointment?: () => void;
}

const DoctorAppointmentCard: React.FC<DoctorAppointmentCardProps> = ({
  startTime,
  endTime,
  patientName,
  patientId,
  patientUsername,
  patientProfilePic,
  appointmentType,
  appointmentDescription,
  appointmentId,
  status,
  isCurrentAppointment = false,
  isTimeline = false,
  onViewDetails,
  onMessage,
  onComplete,
  onCancel,
  onMarkNoShow,
  onStartAppointment,
}) => {
  const startDate = startTime instanceof Date ? startTime : new Date(startTime);
  const endDate = endTime instanceof Date ? endTime : new Date(endTime);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDuration = () => {
    const diffMs = endDate.getTime() - startDate.getTime();
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
        return "bg-green-100 text-green-700 border-green-300";
      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-300";
      case "No-Show":
        return "bg-orange-100 text-orange-700 border-orange-300";
      default:
        return isCurrentAppointment
          ? "bg-primary/10 text-primary border-primary/30"
          : "bg-blue-100 text-blue-700 border-blue-300";
    }
  };

  // Timeline view for today's schedule
  if (isTimeline) {
    return (
      <div className="flex gap-4 relative">
        <div className="flex flex-col items-end min-w-[80px] pt-1">
          <span className="text-sm font-semibold text-primaryText">
            {formatTime(startDate)}
          </span>
          <span className="text-xs text-secondaryText">{getDuration()}</span>
        </div>

        <div className="flex flex-col items-center">
          <div
            className={`w-2 h-2 rounded-full mt-2 ${
              isCurrentAppointment ? "bg-primary animate-pulse" : "bg-black"
            }`}
          />
          <div className="w-[1px] bg-black flex-1 min-h-[60px]" />
        </div>

        <div
          className={`flex-1 rounded-lg shadow-sm border border-stroke mb-4 transition-all hover:shadow-md overflow-hidden ${
            isCurrentAppointment && status === "Scheduled"
              ? "bg-primary/5"
              : "bg-white"
          }`}
        >
          <div className={`px-4 py-2 ${getStatusColor()}`}>
            <span className="text-xs font-semibold uppercase tracking-wide">
              {status}
              {isCurrentAppointment && status === "Scheduled" && " • NOW"}
            </span>
          </div>

          <div className="p-4 space-y-3">
            <SmallInfoCard
              icon={FirstAid}
              title="Type"
              value={appointmentType}
              backgroundWhite={true}
              width="full"
            />

            <ProfileHeaderCard
              name={patientName}
              username={patientUsername || `Patient ${patientId.slice(-6)}`}
              userId={patientId}
              message={onMessage ? true : false}
              profilePic={patientProfilePic}
            />

            {appointmentDescription && (
              <div className="flex gap-2 items-start">
                <Notepad size={18} className="text-primaryText mt-0.5" />
                <p className="text-sm text-secondaryText flex-1">
                  {appointmentDescription}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              {status === "Scheduled" && (
                <>
                  {isCurrentAppointment ? (
                    <PrimaryButton
                      text="Start"
                      variant="primary"
                      size="small"
                      className="flex-1 bg-green-500 hover:bg-green-600 border-green-500"
                      onClick={onStartAppointment}
                    />
                  ) : (
                    <PrimaryButton
                      text="View Details"
                      variant="outline"
                      size="small"
                      className="flex-1"
                      onClick={onViewDetails}
                    />
                  )}
                </>
              )}
              {status === "In-Progress" && (
                <PrimaryButton
                  text="Complete"
                  variant="primary"
                  size="small"
                  className="flex-1 bg-green-500 hover:bg-green-600 border-green-500"
                  onClick={onComplete}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Card view for appointments list
  return (
    <div className="flex flex-col bg-foreground rounded-xl shadow-sm border border-stroke overflow-hidden">
      <div className={`px-4 py-2 ${getStatusColor()}`}>
        <span className="text-xs font-semibold uppercase tracking-wide">
          {status} • {startDate.toLocaleDateString()}
        </span>
      </div>

      <div className="p-5 space-y-4">
        <h1 className="font-medium text-lg">
          Appointment - {formatTime(startDate)} to {formatTime(endDate)}
        </h1>

        <div className="flex flex-row gap-4">
          <SmallInfoCard
            icon={FirstAid}
            title="Appointment Type"
            value={appointmentType}
            backgroundWhite={true}
            width="1/2"
          />
          <SmallInfoCard
            icon={Clock}
            title="Duration"
            value={getDuration()}
            backgroundWhite={true}
            width="1/2"
          />
        </div>

        <ProfileHeaderCard
          name={patientName}
          username={patientUsername || `Patient ${patientId.slice(-6)}`}
          userId={patientId}
          message={status === "Scheduled" && onMessage ? true : false}
          profilePic={patientProfilePic}
        />

        {appointmentDescription && (
          <>
            <div className="flex flex-row gap-2 items-center">
              <PaperclipHorizontal size={20} className="text-primaryText" />
              <p className="text-sm">
                {status !== "Completed"
                  ? "View Pre-Appointment Instructions"
                  : "View After Visit Summary"}
              </p>
            </div>

            <div className="flex flex-row gap-2 items-start">
              <Notepad size={20} className="text-primaryText mt-0.5" />
              <p className="text-sm flex-1">
                <span className="font-medium">Notes:</span>{" "}
                {appointmentDescription}
              </p>
            </div>
          </>
        )}

        {/* Action buttons based on status */}
        {status === "Scheduled" && (
          <div className="flex gap-2 pt-2 border-t border-stroke">
            <PrimaryButton
              text="View Details"
              variant="outline"
              size="small"
              className="flex-1"
              onClick={onViewDetails}
            />
            <PrimaryButton
              text="Message"
              variant="primary"
              size="small"
              className="flex-1"
              onClick={onMessage}
            />
          </div>
        )}

        {status === "Scheduled" && (
          <div className="flex gap-1">
            <button
              onClick={onComplete}
              className="flex-1 text-xs py-1 px-2 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
            >
              <CheckCircle size={14} />
              Complete
            </button>
            <button
              onClick={onMarkNoShow}
              className="flex-1 text-xs py-1 px-2 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition-colors flex items-center justify-center gap-1"
            >
              <Warning size={14} />
              No-Show
            </button>
            <button
              onClick={onCancel}
              className="flex-1 text-xs py-1 px-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
            >
              <XCircle size={14} />
              Cancel
            </button>
          </div>
        )}

        {status === "Completed" && (
          <div className="flex gap-2 pt-2 border-t border-stroke">
            <PrimaryButton
              text="View Summary"
              variant="outline"
              size="small"
              className="flex-1"
              onClick={onViewDetails}
            />
            <PrimaryButton
              text="Follow-up"
              variant="primary"
              size="small"
              className="flex-1"
              onClick={onMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointmentCard;
