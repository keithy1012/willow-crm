import { Pill } from "@phosphor-icons/react";
import PrimaryButton from "../buttons/PrimaryButton.tsx";

interface MedicationCardProps {
  medication: string;
  description: string;
  onClick?: () => void;
}

const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  description,
  onClick,
}) => {
  return (
    <div className="bg-foreground p-4 border border-stroke shadow-md rounded-lg w-64">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center gap-2">
          <Pill size={24} className="text-primary" />
          <span className="text-lg text-left font-medium text-primaryText">{medication}</span>
        </div>
        <p className="text-sm text-left text-secondaryText line-clamp-2 overflow-hidden">
          {description}
        </p>
        <div className="flex justify-end">
          <PrimaryButton
            text="Request Refill"
            variant="primary"
            size="small"
          />
        </div>
      </div>
    </div>
  );
};

export default MedicationCard;