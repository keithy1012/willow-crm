import ProfileHeaderCard from "./ProfileHeaderCard";
import SmallInfoCard from "./SmallInfoCard";
import {
  Heartbeat,
  Calendar,
  PaperclipHorizontal,
  Notepad,
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
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  dateOfAppointment,
  doctorName,
  doctorUsername,
  doctorId,
  profilePic,
  appointmentType,
  instructionId,
  past,
  notes,
  width,
}) => {
  return (
    <div
      className={`flex flex-col p-5 space-y-4 bg-foreground rounded-xl shadow-sm border border-stroke w-${width}`}
    >
      <h1>Appointment - {dateOfAppointment.toLocaleString()}</h1>
      <div className="flex flex-row gap-4">
        <SmallInfoCard
          icon={Heartbeat}
          title={"Appointment Type"}
          value={appointmentType}
          backgroundWhite={true}
          width="1/2"
        ></SmallInfoCard>
        <SmallInfoCard
          icon={Calendar}
          title={"Appointment Date"}
          value={dateOfAppointment.toLocaleString()}
          backgroundWhite={true}
          width="1/2"
        ></SmallInfoCard>
      </div>
      {!past && (
        <ProfileHeaderCard
          name={doctorName}
          username={doctorUsername}
          userId={doctorId}
          message={true}
          profilePic={profilePic}
        ></ProfileHeaderCard>
      )}

      <div className="flex flex-row gap-1">
        <PaperclipHorizontal size={20} className="text-primaryText" />
        {!past && <p>View Pre-Appointment Instructions</p>}
        {past && <p>View After Visit Summary</p>}
      </div>
      <div className="flex flex-row gap-1">
        <Notepad size={20} className="text-primaryText" />
        {!past && (
          <p>Notes: {notes ? notes : "No additional notes provided."}</p>
        )}
        {past && (
          <p>Notes and Instructions: {notes ? notes : "No additional notes provided."}</p>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
