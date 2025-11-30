import { Pill } from "phosphor-react";
import { useState } from "react";
import PrimaryButton from "../buttons/PrimaryButton";
import RefillConfirmationModal from "../modal/PatientRefillModal";

interface MedicationCardProps {
  medicationId: string;
  medicationName: string;
  instruction: string;
  quantity: string;
  pharmacy: string;
  lastRefillDate?: string;
  onRefillRequest: (medicationId: string) => void;
}

const MedicationCard: React.FC<MedicationCardProps> = ({
  medicationId,
  medicationName,
  instruction,
  quantity,
  pharmacy,
  lastRefillDate,
  onRefillRequest,
}) => {
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);

  const handleRefillClick = () => {
    setIsRefillModalOpen(true);
  };

  const handleConfirmRefill = () => {
    onRefillRequest(medicationId);
    setIsRefillModalOpen(false);
  };

  return (
    <>
      <div className="bg-foreground p-4 border border-stroke shadow-sm rounded-lg w-full">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center gap-2">
            <Pill size={24} className="text-primary" />
            <span className="text-md text-left font-medium text-primaryText">
              {medicationName}
            </span>
          </div>
          <p className="text-sm text-left text-secondaryText line-clamp-2 overflow-hidden">
            {instruction}
          </p>
          <div className="flex justify-end">
            <PrimaryButton
              onClick={handleRefillClick}
              text="Request Refill"
              variant="primary"
              size="xs"
            />
          </div>
        </div>
      </div>

      <RefillConfirmationModal
        isOpen={isRefillModalOpen}
        onClose={() => setIsRefillModalOpen(false)}
        onConfirm={handleConfirmRefill}
        medicationName={medicationName}
        pharmacy={pharmacy}
        quantity={quantity}
        lastRefill={lastRefillDate || "N/A"}
      />
    </>
  );
};

export default MedicationCard;
