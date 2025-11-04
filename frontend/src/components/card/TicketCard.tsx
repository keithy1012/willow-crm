import React from "react";

interface TicketCardProps {
  title: string;
  requestedBy: string;
  description?: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({
  title,
  requestedBy,
  description,
  buttonLabel = "View Details",
  onButtonClick,
}) => {
  const desc = typeof description === "string" ? description : "";
  const truncatedDesc = desc.length > 50 ? desc.slice(0, 50) + "..." : desc;

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
      <div>
        <h3 className="text-lg font-semibold text-primaryText mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-2">
          <span className="font-medium">Requested by:</span> {requestedBy}
        </p>
        <p className="text-sm text-gray-600">{truncatedDesc}</p>
      </div>

      <div className="flex justify-end mt-3">
        <button
          onClick={onButtonClick}
          className="text-sm text-white bg-primary hover:bg-[#4A6B92] px-3 py-1.5 rounded-md transition-colors"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
};

export default TicketCard;
