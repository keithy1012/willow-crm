import { FirstAidIcon } from "@phosphor-icons/react";
import PrimaryButton from "../buttons/PrimaryButton.tsx";

interface UpcomingAppointmentProps {
  date: string;
  doctorName: string;
  appointmentType: string;
  onClick?: () => void;
}

const UpcomingAppointmentCard: React.FC<UpcomingAppointmentProps> = ({
  date,
  doctorName,
  appointmentType,
  onClick,
}) => {
  return (
    <div className="bg-background p-4 shadow-lg rounded-lg w-90">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center gap-2">
          <FirstAidIcon size={24} className="text-primary" />
          <span className="text-lg text-left font-medium text-primaryText">
            Appointment - {date}
          </span>
        </div>
        <p className="text-sm text-left text-secondaryText line-clamp-2 overflow-hidden">
          Doctor: {doctorName}
        </p>
        <p className="text-sm text-left text-secondaryText line-clamp-2 overflow-hidden">
          Appoinmtment Type: {appointmentType}
        </p>
        <div className="flex justify-end">
          <PrimaryButton text="Message Doctor" variant="primary" size="small" />
        </div>
      </div>
    </div>
  );
};

export default UpcomingAppointmentCard;
