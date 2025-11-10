import React from "react";

interface ReportCardProps {
  reportId: string;
  insuranceProvider: string;
  description: string;
}

const ReportCard: React.FC<ReportCardProps> = ({
  reportId,
  insuranceProvider,
  description,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      {/* Report ID */}
      <div className="mb-3">
        <h3 className="font-semibold text-gray-800 text-base mb-1">
          {reportId}
        </h3>
        <p className="text-sm text-gray-600">{insuranceProvider}</p>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
        {description}
      </p>

      {/* Claim Button */}
      <div className="flex justify-end">
        <button className="px-4 py-2 bg-primary hover:bg-[#6886AC] text-white text-sm font-medium rounded-lg transition-colors">
          Claim
        </button>
      </div>
    </div>
  );
};

export default ReportCard;