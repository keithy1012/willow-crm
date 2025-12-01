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
import { useNavigate } from "react-router-dom";

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
  isTimeline?: boolean;
  onViewDetails?: () => void;
  onMessage?: () => void;
  onViewProfile?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
  onMarkNoShow?: () => void;
  onStartAppointment?: () => void;
  onViewSummary?: () => void;
  onClick?: () => void;
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
  isCurrentAppointment,
  isTimeline,
  onViewDetails,
  onMessage,
  onViewProfile,
  onComplete,
  onCancel,
  onMarkNoShow,
  onStartAppointment,
  onViewSummary,
  onClick,
}) => {
  const startDate = startTime instanceof Date ? startTime : new Date(startTime);
  const endDate = endTime instanceof Date ? endTime : new Date(endTime);
  const navigate = useNavigate();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDuration = () => {
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins > 180) {
      console.warn(
        `Appointment ${appointmentId} has unusual duration: ${diffMins} minutes`
      );
    }

    if (diffMins < 60) {
      return `${diffMins} min`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "In-Progress":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      case "No-Show":
        return "bg-yellow-50 text-yellow-900 border-yellow-400";
      default:
        return isCurrentAppointment
          ? "bg-primary/10 text-primary border-primary/30"
          : "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "Completed":
        return <CheckCircle size={16} weight="fill" />;
      case "Cancelled":
        return <XCircle size={16} weight="fill" />;
      case "No-Show":
        return <Warning size={16} weight="fill" />;
      case "In-Progress":
        return <Clock size={16} weight="fill" />;
      default:
        return null;
    }
  };

  const handleViewSummary = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onViewSummary) {
      onViewSummary();
    } else {
      navigate(`/medical-records/${appointmentId}`);
    }
  };

  // Timeline view for today's schedule
  if (isTimeline) {
    return (
      <div className="flex gap-4 relative" onClick={onClick}>
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
          className={`flex-1 rounded-xl shadow-sm border border-stroke mb-4 transition-all hover:shadow-md overflow-hidden ${
            isCurrentAppointment && status === "Scheduled"
              ? "bg-primary/5 border-primary/30"
              : "bg-white"
          }`}
        >
          <div
            className={`px-4 py-2 border-b ${getStatusColor()} flex items-center gap-2`}
          >
            {getStatusIcon()}
            <span className="text-xs font-semibold uppercase tracking-wide">
              {status}
              {isCurrentAppointment && status === "Scheduled" && " • NOW"}
            </span>
          </div>

          <div className="p-4 space-y-3">
            <SmallInfoCard
              icon={FirstAid}
              title="Symptoms"
              value={appointmentType}
              backgroundWhite={true}
              width="full"
            />

            <div onClick={(e) => e.stopPropagation()}>
              <ProfileHeaderCard
                name={patientName}
                username={patientUsername || "Username"}
                userId={patientId}
                message={status === "Scheduled" || status === "In-Progress"}
                onMessage={onMessage}
                onViewProfile={onViewProfile}
                profilePic={patientProfilePic}
              />
            </div>

            {appointmentDescription && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex gap-2 items-start">
                  <Notepad size={18} className="text-primaryText mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-primaryText mb-1">
                      Patient Notes
                    </p>
                    <p className="text-sm text-secondaryText">
                      {appointmentDescription}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status === "Completed" && (
              <div
                className="flex flex-row gap-2 items-center cursor-pointer hover:text-primary transition-colors"
                onClick={handleViewSummary}
              >
                <PaperclipHorizontal size={18} className="text-primaryText" />
                <p className="text-sm underline">View After Visit Summary</p>
              </div>
            )}

            <div
              className="flex gap-2 pt-2 border-t border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {status === "Scheduled" && (
                <>
                  <PrimaryButton
                    text="Start Appointment"
                    variant="primary"
                    size="small"
                    className="flex-1 bg-success hover:bg-success border-success border"
                    onClick={(e) => {
                      e?.stopPropagation();
                      onStartAppointment?.();
                    }}
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkNoShow?.();
                      }}
                      className="text-xs py-1.5 px-2 bg-yellow-50 border-[0.5px] border-yellow-600 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
                      title="Mark as No-Show"
                    >
                      <Warning size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancel?.();
                      }}
                      className="text-xs py-1.5 px-2 bg-red-50 border-[0.5px] border-error text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="Cancel"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                </>
              )}
              {status === "In-Progress" && (
                <PrimaryButton
                  text="Complete Appointment"
                  variant="primary"
                  size="small"
                  className="flex-1 bg-success hover:bg-success border-success"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onComplete?.();
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Card view for appointments grid
  return (
    <div
      onClick={onClick}
      className="flex flex-col bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-stroke overflow-hidden"
    >
      <div
        className={`px-4 py-2 border-b ${getStatusColor()} flex items-center justify-between`}
      >
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-xs font-semibold uppercase tracking-wide">
            {status}
          </span>
        </div>
        <span className="text-xs font-medium">
          {startDate.toLocaleDateString()}
        </span>
      </div>

      <div className="p-5 space-y-4">
        <h1 className="font-medium text-lg">
          {formatTime(startDate)} - {formatTime(endDate)}
        </h1>

        <div className="flex flex-row gap-3">
          <SmallInfoCard
            icon={FirstAid}
            title="Symptoms"
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

        <div onClick={(e) => e.stopPropagation()}>
          <ProfileHeaderCard
            name={patientName}
            username={patientUsername || "Username"}
            userId={patientId}
            message={status === "Scheduled" || status === "In-Progress"}
            onMessage={onMessage}
            onViewProfile={onViewProfile}
            profilePic={patientProfilePic}
          />
        </div>

        {appointmentDescription && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex flex-row gap-2 items-start">
              <Notepad size={18} className="text-primaryText mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-primaryText mb-1">
                  {status === "Completed" ? "Visit Notes" : "Patient Notes"}
                </p>
                <p className="text-sm text-secondaryText">
                  {appointmentDescription}
                </p>
              </div>
            </div>
          </div>
        )}

        {status === "Completed" && (
          <div
            className="flex flex-row gap-2 items-center cursor-pointer hover:text-primary transition-colors"
            onClick={handleViewSummary}
          >
            <PaperclipHorizontal size={18} className="text-primaryText" />
            <p className="text-sm underline">View After Visit Summary</p>
          </div>
        )}

        {status === "Scheduled" && (
          <div
            className="flex gap-2 pt-3 border-t border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete?.();
              }}
              className="flex-1 text-xs py-2 px-3 bg-green-50 text-green-600 border-[0.5px] border-success rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
            >
              <CheckCircle size={14} />
              Complete
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkNoShow?.();
              }}
              className="flex-1 text-xs py-2 px-3 bg-yellow-50 text-yellow-600 border-[0.5px] border-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors flex items-center justify-center gap-1"
            >
              <Warning size={14} />
              No-Show
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel?.();
              }}
              className="flex-1 text-xs py-2 px-3 bg-red-50 text-red-600 rounded-lg border-[0.5px] border-error hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
            >
              <XCircle size={14} />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointmentCard;
