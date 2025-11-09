import PrimaryButton from "components/buttons/PrimaryButton";
import SmallInfoCard from "./SmallInfoCard";
import { Calendar, Pill, FirstAid } from "phosphor-react";

interface MedicationCardProps {
  medicationId: string;
  medicationName: string;
  medicationNotes: string;
  lastRequested: Date;
  prescribedOn: Date;
  refillDetails: string;
  pharmacyDetails: string;
}

const LargeMedicationCard: React.FC<MedicationCardProps> = ({
  medicationId,
  medicationName,
  medicationNotes,
  lastRequested,
  prescribedOn,
  refillDetails,
  pharmacyDetails,
}) => {
  return (
    <div className="flex flex-col space-y-3 p-4 w-full bg-background border-stroke border rounded-lg shadow-sm">
      <h1 className="text-lg font-normal text-primaryText">{medicationName}</h1>
      <p className="text-md font-normal text-primaryText">
        Notes: {medicationNotes}
      </p>
      <p className="text-md font-normal text-secondaryText">
        Renewal Last Requested: {lastRequested.toString()}
      </p>
      <div className="border-b border-secondaryText"></div>
      <div className="flex flex-row gap-4">
        <SmallInfoCard
          icon={Calendar}
          title={"Prescribed On"}
          value={prescribedOn}
          width={"1/3"}
          backgroundWhite={false}
        ></SmallInfoCard>
        <SmallInfoCard
          icon={Pill}
          title={"Refill Details"}
          value={refillDetails}
          width={"1/3"}
          backgroundWhite={false}
        ></SmallInfoCard>
        <SmallInfoCard
          icon={FirstAid}
          title={"Pharmacy Details"}
          value={"This Hospital"}
          width={"1/3"}
          backgroundWhite={false}
        ></SmallInfoCard>
      </div>
      <div className="border-b border-secondaryText"></div>
      <div className="flex flex-row w-full gap-4 justify-end">
        <PrimaryButton
          text={"Delete Medication"}
          variant={"outline"}
          size={"small"}
        ></PrimaryButton>
        <PrimaryButton
          text={"Request Refill"}
          variant={"primary"}
          size={"small"}
        ></PrimaryButton>
      </div>
    </div>
  );
};

export default LargeMedicationCard;
