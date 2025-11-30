import { useState } from "react";
import PrimaryButton from "components/buttons/PrimaryButton";
import SmallInfoCard from "./SmallInfoCard";
import { Calendar, Pill, FirstAid } from "phosphor-react";
import DeleteMedicationModal from "components/modal/DeleteMedicationModal";
import RefillConfirmationModal from "components/modal/PatientRefillModal";

interface LargeMedicationCardProps {
  medicationId: string;
  medicationName: string;
  medicationNotes: string;
  lastRequested?: Date;
  prescribedOn: Date;
  refillDetails: string;
  pharmacyDetails: string;
  onRefillRequest: (medicationId: string) => void;
  onDelete: (medicationId: string) => void;
  isPatient?: boolean;
}

const LargeMedicationCard: React.FC<LargeMedicationCardProps> = ({
  medicationId,
  medicationName,
  medicationNotes,
  lastRequested,
  prescribedOn,
  refillDetails,
  pharmacyDetails,
  onRefillRequest,
  onDelete,
  isPatient,
}) => {
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleRefillClick = () => {
    setIsRefillModalOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmRefill = () => {
    onRefillRequest(medicationId);
    setIsRefillModalOpen(false);
  };

  const handleConfirmDelete = () => {
    onDelete(medicationId);
    setIsDeleteModalOpen(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="flex flex-col space-y-3 p-4 w-full bg-background border-stroke border rounded-lg shadow-sm">
        <h1 className="text-lg font-normal text-primaryText">
          {medicationName}
        </h1>
        <p className="text-md font-normal text-primaryText">
          Notes: {medicationNotes}
        </p>
        {lastRequested && (
          <p className="text-md font-normal text-secondaryText">
            Renewal Last Requested: {formatDate(lastRequested)}
          </p>
        )}
        <div className="border-b border-secondaryText"></div>
        <div className="flex flex-row gap-4">
          <SmallInfoCard
            icon={Calendar}
            title={"Prescribed On"}
            value={formatDate(prescribedOn)}
            width={"1/3"}
            backgroundWhite={false}
          />
          <SmallInfoCard
            icon={Pill}
            title={"Refill Details"}
            value={refillDetails}
            width={"1/3"}
            backgroundWhite={false}
          />
          <SmallInfoCard
            icon={FirstAid}
            title={"Pharmacy Details"}
            value={pharmacyDetails}
            width={"1/3"}
            backgroundWhite={false}
          />
        </div>
        <div className="border-b border-secondaryText"></div>
        {isPatient ? (
          <div className="flex flex-row w-full gap-4 justify-end">
            <PrimaryButton
              text={"Delete Medication"}
              variant={"outline"}
              size={"small"}
              onClick={handleDeleteClick}
            />
            <PrimaryButton
              text={"Request Refill"}
              variant={"primary"}
              size={"small"}
              onClick={handleRefillClick}
            />
          </div>
        ) : (
          ""
        )}
      </div>

      <RefillConfirmationModal
        isOpen={isRefillModalOpen}
        onClose={() => setIsRefillModalOpen(false)}
        onConfirm={handleConfirmRefill}
        medicationName={medicationName}
        pharmacy={pharmacyDetails}
        quantity={refillDetails}
        lastRefill={lastRequested ? formatDate(lastRequested) : "N/A"}
      />

      <DeleteMedicationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        medicationName={medicationName}
      />
    </>
  );
};

export default LargeMedicationCard;
