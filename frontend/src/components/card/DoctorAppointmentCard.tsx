import PrimaryButton from "components/buttons/PrimaryButton";
import { FirstAid } from "phosphor-react";

interface DoctorAppointmentCardProps {
  dateOfAppointment: Date;
  patientId: string;
  appointmentType: string;
  appointmentDescription: string;
  appointmentId: string;
}

const DoctorAppointmentCard: React.FC<DoctorAppointmentCardProps> = ({
  dateOfAppointment,
  patientId,
  appointmentType,
  appointmentDescription,
  appointmentId,
}) => {
  return (
    <div
      className={`flex flex-col p-5 space-y-4 bg-background rounded-xl shadow-sm border border-stroke w-full`}
    >
      <div className="flex flex-row items-start gap-4">
        <FirstAid size={28} className="text-primaryText" />
        <h1 className="text-lg align-middle font-normal">
          Appointment - {dateOfAppointment.toLocaleString()}
        </h1>
      </div>
      <div className="text-md text-secondaryText space-y-2">
        <h2>Appointment Type: {appointmentType}</h2>
        <h2>{appointmentDescription}</h2>
      </div>
      <div className="flex flex-row justify-end items-end gap-4">
        <PrimaryButton
          text={"View Appointment"}
          variant={"outline"}
          size={"small"}
        ></PrimaryButton>
        <PrimaryButton
          text={"Message Patient"}
          variant={"primary"}
          size={"small"}
        ></PrimaryButton>
      </div>

      <div className="flex flex-row gap-4"></div>
    </div>
  );
};

export default DoctorAppointmentCard;
